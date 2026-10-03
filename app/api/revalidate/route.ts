import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { createClient } from "next-sanity";
import { parseBody } from "next-sanity/webhook";

import { paivitaArvosanat } from "@/lib/ravintola-arvosana";
import { apiVersion, dataset, projectId } from "@/sanity/env";

/**
 * Sanity-webhook: tyhjentää välimuistin kun sisältö muuttuu.
 *
 * Ilman tätä isän Studiossa tekemä muutos näkyisi vasta kun sivun
 * välimuistin 60 sekunnin ikkuna (sanity/lib/fetch.ts) umpeutuu. Webhookin kanssa se näkyy sekunneissa.
 *
 * Sanity Studiossa: API → Webhooks → luo webhook
 *   URL:     https://www.lahdensuomalainenklubi.com/api/revalidate
 *   Dataset: production
 *   Trigger: Create, Update, Delete
 *   Secret:  sama arvo kuin SANITY_REVALIDATE_SECRET
 *   Payload: `{ "_type": _type, "slug": slug.current }`
 *
 * Cache-tagit ovat dokumenttityypin nimiä — sama merkkijono jonka sivut
 * antavat `sanityFetch({ tags })`-kutsussa.
 */

const secret = process.env.SANITY_REVALIDATE_SECRET;

/** Tyyppi → muut tagit, joiden sivuilla tyypin sisältö näkyy. */
const RIIPPUVAT: Record<string, string[]> = {
  ravintolaKayttajaArvostelu: ["ravintola"],
  klubiArvio: ["ravintola"],
  klubilainen: ["ravintola"],
  kaupunki: ["ravintola"],
};

interface WebhookPayload {
  _type?: string;
  slug?: string;
}

/** Tyypit, joiden muutos voi muuttaa ravintolan arvosanaa. */
const ARVOSANAAN_VAIKUTTAVAT = new Set(["ravintolaKayttajaArvostelu", "klubiArvio"]);

/** Virhe ei kaada välimuistin tyhjennystä: arvosana korjaantuu seuraavalla ajolla. */
async function laskeArvosanat(): Promise<void> {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token || !projectId) {
    console.error("[revalidate] arvosanoja ei laskettu: SANITY_API_WRITE_TOKEN puuttuu.");
    return;
  }
  try {
    const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: "raw" });
    const muutokset = await paivitaArvosanat(client);
    if (muutokset.length > 0) {
      console.log(`[revalidate] arvosana päivitetty: ${muutokset.map((m) => m.name).join(", ")}`);
    }
  } catch (error) {
    console.error("[revalidate] arvosanojen laskenta epäonnistui:", error instanceof Error ? error.message : error);
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  if (!secret) {
    return Response.json(
      { message: "SANITY_REVALIDATE_SECRET puuttuu — webhook ei ole käytössä." },
      { status: 501 },
    );
  }

  try {
    const { isValidSignature, body } = await parseBody<WebhookPayload>(
      request,
      secret,
    );

    if (!isValidSignature) {
      return Response.json({ message: "Virheellinen allekirjoitus." }, { status: 401 });
    }
    if (!body?._type) {
      return Response.json({ message: "Payloadista puuttuu _type." }, { status: 400 });
    }

    // Tyypin tagi kattaa listaukset; slug-tagi yksittäisen dokumentin sivun.
    const tags = [body._type];
    if (body.slug) tags.push(`${body._type}:${body.slug}`);
    // Tyypit, jotka näkyvät toisen tyypin sivuilla: hyväksytty arvostelu ja
    // kaupungin nimi näkyvät ravintolasivulla, joka hakee tagilla "ravintola".
    const NAKYY_MYOS = RIIPPUVAT[body._type];
    if (NAKYY_MYOS) tags.push(...NAKYY_MYOS);

    // Klubilaisen arvosana tai arvostelu muuttui: ravintolan arvosana on
    // klubilaisten arvosanojen keskiarvo (lib/ravintola-arvosana.ts).
    // Ravintolan päivitys laukaisee oman webhookinsa, joka tyhjentää sen sivut.
    if (ARVOSANAAN_VAIKUTTAVAT.has(body._type)) await laskeArvosanat();

    // Next 16 vaatii cache-profiilin toisena argumenttina. "max" tarkoittaa
    // tässä: mitätöi riippumatta siitä, kuinka pitkä välimuistin elinikä oli —
    // webhook laukeaa vain kun sisältö on oikeasti muuttunut.
    for (const tag of tags) revalidateTag(tag, "max");

    return Response.json({ revalidated: true, tags, now: Date.now() });
  } catch (error) {
    // Yksityiskohdat vain palvelimen lokiin, ei kutsujalle.
    console.error("[revalidate] virhe:", error instanceof Error ? error.message : error);
    return Response.json({ message: "Välimuistin tyhjennys epäonnistui." }, { status: 500 });
  }
}
