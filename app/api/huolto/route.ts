import { createClient } from "next-sanity";

import { tarkistaOtteluhaku } from "@/lib/ottelut";
import { paivitaArvosanat } from "@/lib/ravintola-arvosana";
import { huoltoajonKirjaus, otteluhaunViesti, TILA_ID, type AjonTulos } from "@/lib/sivuston-tila";
import { muistiinpanoKirjaukseen, tiedostosiivouksenViesti } from "@/lib/tiedostosiivous";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { cleanupOrphanReviewPhotos } from "@/sanity/lib/arvostelukuvat-siivous";
import { kirjaaAjo } from "@/sanity/lib/kirjaa-ajo";
import { siivoaOrvotTiedostot } from "@/sanity/lib/tiedostosiivous";

/**
 * Yöllinen huolto (Vercel Cron, vercel.json): pitää ravintola-arvostelut
 * kunnossa ilman kehittäjää. Tehtävät ovat idempotentteja, eli
 * uudelleenajo ei muuta mitään, jos kaikki on jo kunnossa.
 *
 * 1. Ravintoloiden arvosanat uudelleen klubilaisten arvosanoista
 *    (lib/ravintola-arvosana.ts). Webhook (app/api/revalidate) tekee tämän
 *    jokaisesta muutoksesta; tämä on turvaverkko sille, että webhook-kutsu
 *    epäonnistui (esim. katkos hyväksynnän hetkellä). Muuttunut ravintola
 *    laukaisee oman webhookinsa, joka tyhjentää sivujen välimuistin.
 * 2. Orvot arvostelukuvat (sanity/lib/arvostelukuvat-siivous.ts): vain
 *    lomakkeen lataamat kuvat, joihin mikään dokumentti (luonnokset mukaan
 *    lukien) ei viittaa ja jotka ovat vanhempia kuin varoaika.
 * 3. Käyttämättömät tiedostot (sanity/lib/tiedostosiivous.ts, docs/24 K4):
 *    PDF-, Word- ja Excel-tiedostot, joita mikään ei ole käyttänyt 7 päivään.
 *    Varmuuskopioihin ei kosketa koskaan.
 * 4. Otteluohjelman haun tarkistus (lib/ottelut.ts). Ulkoinen palvelu: tulos
 *    kirjataan, mutta se ei vaikuta huollon onnistumiseen eikä HTTP-koodiin.
 *
 * Lopuksi tulos kirjataan dokumenttiin `sivustonTila.huolto`, jonka Studion
 * Aloitus näyttää (docs/24 askel 7). Kirjauksen virhe ei kaada ajoa.
 *
 * Vercel kutsuu otsakkeella `Authorization: Bearer <CRON_SECRET>`. Tulos
 * näkyy myös Vercelin Cron-lokissa. Käsin: npm run laske:arvosanat,
 * npm run siivoa:arvostelukuvat ja npm run siivoa:tiedostot.
 */

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!secret || !token || !projectId) {
    return Response.json(
      { virhe: "CRON_SECRET, SANITY_API_WRITE_TOKEN tai projekti puuttuu: huolto ei ole käytössä." },
      { status: 501 },
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ virhe: "Ei oikeutta." }, { status: 401 });
  }

  const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: "raw" });
  const tulos: Record<string, unknown> = {};
  const tulokset: AjonTulos[] = [];
  let onnistui = true;

  // Ulkoinen haku samaan aikaan muiden kanssa (aikakatkaisu 15 s).
  const otteluhaku = tarkistaOtteluhaku();

  // Tehtävät erikseen: toisen virhe ei estä toista.
  try {
    const muutokset = await paivitaArvosanat(client);
    tulos.arvosanat = { korjattu: muutokset.map((m) => m.name) };
    tulokset.push({
      nimi: "arvosanat",
      tila: muutokset.length > 0 ? "huomio" : "ok",
      viesti: `Korjattu ${muutokset.length}`,
      maara: muutokset.length,
    });
    if (muutokset.length > 0) console.log(`[huolto] arvosana korjattu: ${muutokset.map((m) => m.name).join(", ")}`);
  } catch (error) {
    onnistui = false;
    const syy = error instanceof Error ? error.message : String(error);
    tulos.arvosanat = { virhe: syy };
    tulokset.push({ nimi: "arvosanat", tila: "virhe", viesti: `Arvosanojen laskenta epäonnistui: ${syy}` });
    console.error("[huolto] arvosanojen laskenta epäonnistui:", error);
  }

  try {
    const { deleted, failed } = await cleanupOrphanReviewPhotos(client);
    tulos.kuvat = { poistettu: deleted.length, epaonnistui: failed.length };
    tulokset.push({
      nimi: "kuvat",
      tila: failed.length > 0 ? "virhe" : "ok",
      viesti: failed.length > 0
        ? `${failed.length} arvostelukuvan poisto epäonnistui`
        : `Poistettu ${deleted.length} vanhaa arvostelukuvaa`,
      maara: deleted.length,
    });
    if (deleted.length > 0) console.log(`[huolto] orpoja arvostelukuvia poistettu: ${deleted.length}`);
    if (failed.length > 0) onnistui = false;
  } catch (error) {
    onnistui = false;
    const syy = error instanceof Error ? error.message : String(error);
    tulos.kuvat = { virhe: syy };
    tulokset.push({ nimi: "kuvat", tila: "virhe", viesti: `Arvostelukuvien siivous epäonnistui: ${syy}` });
    console.error("[huolto] kuvien siivous epäonnistui:", error);
  }

  // Käyttämättömät tiedostot. Poiston virhe ei kaada huoltoa (tila huomio), ja
  // muistiinpano kirjataan vain, kun kysely onnistui (muuten edellinen säilyy).
  let orvotTiedostot: Awaited<ReturnType<typeof siivoaOrvotTiedostot>>["muistiinpano"] | undefined;
  try {
    const siivous = await siivoaOrvotTiedostot(client);
    orvotTiedostot = siivous.muistiinpano;
    const odottaa = siivous.muistiinpano.length - siivous.epaonnistuneet.length;
    tulos.tiedostot = {
      poistettu: siivous.poistetut.length,
      epaonnistui: siivous.epaonnistuneet.length,
      odottaa,
    };
    tulokset.push({
      nimi: "tiedostot",
      tila: siivous.epaonnistuneet.length > 0 ? "huomio" : "ok",
      viesti: tiedostosiivouksenViesti(siivous.poistetut.length, siivous.epaonnistuneet.length, odottaa),
      maara: siivous.poistetut.length,
    });
    if (siivous.poistetut.length > 0) {
      console.log(`[huolto] käyttämättömiä tiedostoja poistettu: ${siivous.poistetut.join(", ")}`);
    }
  } catch (error) {
    const syy = error instanceof Error ? error.message : String(error);
    tulos.tiedostot = { virhe: syy };
    tulokset.push({ nimi: "tiedostot", tila: "huomio", viesti: `Tiedostojen siivous epäonnistui: ${syy}` });
    console.error("[huolto] tiedostojen siivous epäonnistui:", error);
  }

  const haku = await otteluhaku;
  tulos.otteluhaku = haku;
  tulokset.push({
    nimi: "otteluhaku",
    tila: haku.virhe ? "virhe" : "ok",
    viesti: haku.virhe ?? otteluhaunViesti(haku.lahde, haku.maara, haku.tulevia),
    maara: haku.maara,
  });
  if (haku.virhe) console.error(`[huolto] otteluohjelman haku (${haku.lahde}) epäonnistui: ${haku.virhe}`);

  await kirjaaAjo(client, TILA_ID.huolto, "huolto", {
    ...huoltoajonKirjaus(tulokset, onnistui, new Date()),
    ...muistiinpanoKirjaukseen(orvotTiedostot),
  });

  // 500 näkyy Vercelin Cron-lokissa epäonnistuneena ajona.
  return Response.json(tulos, { status: onnistui ? 200 : 500 });
}
