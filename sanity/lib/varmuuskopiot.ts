import type { SanityClient } from "sanity";

/**
 * Studion apurit varmuuskopioiden lukemiseen selaimessa (lib/palautus.ts).
 * Kopio on gzip-pakattu NDJSON-tiedosto Sanityn CDN:ssä (app/api/varmuuskopio).
 */

export type Varmuuskopio = { _id: string; paiva: string; url: string | null };

/** Kopiot uusin ensin. */
export function haeVarmuuskopiot(client: SanityClient): Promise<Varmuuskopio[]> {
  return client.fetch<Varmuuskopio[]>(
    `*[_type == "varmuuskopio" && !(_id in path("drafts.**"))] | order(paiva desc){ _id, paiva, "url": tiedosto.asset->url }`,
  );
}

/**
 * Lataa ja purkaa kopion. Saman kopion toinen lataus samassa istunnossa tulee
 * muistista (kopio on noin 2 Mt pakattuna, 15 Mt purettuna; vain uusin pidetään).
 */
let viimeisin: { url: string; teksti: Promise<string> } | null = null;

export function lataaVarmuuskopio(url: string): Promise<string> {
  if (viimeisin?.url === url) return viimeisin.teksti;
  const teksti = (async () => {
    const vastaus = await fetch(url);
    if (!vastaus.ok || !vastaus.body) throw new Error(`Varmuuskopion lataus epäonnistui (HTTP ${vastaus.status}).`);
    const purettu = vastaus.body.pipeThrough(new DecompressionStream("gzip"));
    return new Response(purettu).text();
  })();
  viimeisin = { url, teksti };
  // Epäonnistunutta latausta ei jätetä muistiin: seuraava yritys hakee uudelleen.
  teksti.catch(() => {
    if (viimeisin?.teksti === teksti) viimeisin = null;
  });
  return teksti;
}

/** "5.10.2026" */
export function paivaSuomeksi(paiva: string): string {
  return new Date(`${paiva}T12:00:00`).toLocaleDateString("fi-FI");
}
