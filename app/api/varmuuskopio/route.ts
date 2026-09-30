import { gzipSync } from "node:zlib";

import { createClient } from "next-sanity";

import {
  kopionPaiva,
  poistettavat,
  suodataVienti,
  TIEDOSTON_ETULIITE,
  VARMUUSKOPIO_TYYPPI,
} from "@/lib/varmuuskopio";
import { apiVersion, dataset, projectId } from "@/sanity/env";

/**
 * Viikoittainen varmuuskopio Studioon (docs/17 §D). Vercel Cron kutsuu tätä
 * (vercel.json) ja lähettää otsakkeen `Authorization: Bearer <CRON_SECRET>`.
 *
 * 1. Koko datasetti Sanityn Export API:sta (NDJSON)
 * 2. Vain julkaistu sisältö (lib/varmuuskopio.ts: dataset on julkinen)
 * 3. gzip → tiedostoksi Sanityyn → `varmuuskopio`-dokumentti (Studio: Sivun
 *    asetukset → Varmuuskopiot). Saman päivän uusinta korvaa edellisen.
 * 4. Vanhimmat poistetaan, kun kopioita on yli 12 (≈ kolme kuukautta).
 *
 * Palautus: lataa tiedosto Studiosta, pura (gunzip) ja
 *   npx sanity dataset import varmuuskopio-<pvm>.ndjson --dataset production --missing
 * (tai yksittäinen dokumentti poimittuna). Kuvat eivät ole mukana: ne säilyvät
 * Sanityssa, ja täysi kopio kuvineen otetaan `npm run backup` -komennolla.
 */

export const maxDuration = 60;

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!secret || !token || !projectId) {
    return Response.json(
      { virhe: "CRON_SECRET, SANITY_API_WRITE_TOKEN tai projekti puuttuu: varmuuskopio ei ole käytössä." },
      { status: 501 },
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ virhe: "Ei oikeutta." }, { status: 401 });
  }

  try {
    // 1–2. Vienti ja suodatus
    const vienti = await fetch(`https://${projectId}.api.sanity.io/v${apiVersion}/data/export/${dataset}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!vienti.ok) throw new Error(`Export API: HTTP ${vienti.status}`);
    const { rivit, maara } = suodataVienti(await vienti.text());
    if (maara === 0) throw new Error("Vienti oli tyhjä: kopiota ei tallennettu.");

    // 3. Tallennus
    const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: "raw" });
    const paiva = kopionPaiva(new Date());
    const tiedosto = gzipSync(Buffer.from(`${rivit.join("\n")}\n`, "utf8"));
    const asset = await client.assets.upload("file", tiedosto, {
      filename: `${TIEDOSTON_ETULIITE}${paiva}.ndjson.gz`,
      contentType: "application/gzip",
    });
    const id = `${VARMUUSKOPIO_TYYPPI}-${paiva}`;
    const aiempi = await client.fetch<string | null>(`*[_id == $id][0].tiedosto.asset._ref`, { id });
    await client.createOrReplace({
      _id: id,
      _type: VARMUUSKOPIO_TYYPPI,
      paiva,
      dokumentteja: maara,
      tiedosto: { _type: "file", asset: { _type: "reference", _ref: asset._id } },
    });
    if (aiempi && aiempi !== asset._id) await client.delete(aiempi);

    // 4. Vanhojen siivous (dokumentti ensin, sitten sen tiedosto)
    const kopiot = await client.fetch<{ _id: string; paiva: string; asset: string | null }[]>(
      `*[_type == $tyyppi && !(_id in path("drafts.**"))]{ _id, paiva, "asset": tiedosto.asset._ref }`,
      { tyyppi: VARMUUSKOPIO_TYYPPI },
    );
    const poistetut: string[] = [];
    for (const vanha of poistettavat(kopiot)) {
      await client.delete(vanha._id);
      if (vanha.asset) await client.delete(vanha.asset);
      poistetut.push(vanha.paiva);
    }

    return Response.json({ ok: true, paiva, dokumentteja: maara, tavua: tiedosto.length, poistetut });
  } catch (error) {
    const syy = error instanceof Error ? error.message : String(error);
    console.error(`[varmuuskopio] epäonnistui: ${syy}`);
    // 500 näkyy Vercelin Cron-lokissa epäonnistuneena ajona.
    return Response.json({ ok: false, virhe: syy }, { status: 500 });
  }
}
