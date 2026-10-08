/**
 * Näkyy sivulla -tiedon tarkistus oikeaa dataa ja sivustoa vasten (docs/24
 * askel 11). Vain luku: ei kirjoita mihinkään datasettiin.
 *
 * 1. Hakee datasetin (oletus production) kaikki jalkapalloTilasto-dokumentit
 *    samalla projektiolla kuin Studion esikatselu (SIJAINTI_PROJEKTIO) ja
 *    laskee niiden sijainnit (lib/sijainnit.ts).
 * 2. Ensimmäinen sijainti = sitemapin osoite (sitemapTilastotQuery + documentHref).
 * 3. Studion tilastoryhmät: jokainen taulukko (myös luonnokset) täsmälleen yhdessä ryhmässä.
 * 4. Sivusto (oletus https://www.lahdensuomalainenklubi.com): jokaisella
 *    sijainnilla taulukko todella näkyy (`<section id="<slug>">` tai oma sivu),
 *    ja toisin päin: jokainen sivuston sivu (sitemap ilman uutisia, ravintoloita,
 *    tapahtumia ja gallerioita), jolla taulukko näkyy, on sen sijainneissa.
 *
 * Ajo:
 *   npm run verify:sijainnit
 *   BASE_URL=http://localhost:3000 SANITY_DATASET=development npm run verify:sijainnit
 */
import { existsSync } from "node:fs";

import { siteUrl } from "../lib/site";
import { documentHref, type RoutableDoc } from "../lib/path";
import { dokumentinSijainnit, type SijaintiDoc } from "../lib/sijainnit";
import { TILASTORYHMAT, ryhmanSuodatin } from "../lib/tilasto-kategoriat";
import { SIJAINTI_PROJEKTIO } from "../sanity/lib/queries/sijainti";
import { sitemapTilastotQuery } from "../sanity/lib/queries/sitemap";
import { sanityWriteToken } from "./lib/sanity-token";

const DATASET = process.env.SANITY_DATASET ?? "production";
const BASE_URL = (process.env.BASE_URL ?? siteUrl).replace(/\/$/, "");
const OHITETUT = /^\/(uutiset|ravintolat|tapahtumat|galleria)\//;

async function kysely<T>(query: string, params: Record<string, unknown> = {}, perspective = "published"): Promise<T> {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID puuttuu");
  // Token aina: yksityinen datasetti palauttaa ilman sitä tyhjän tuloksen virheettä.
  const token = sanityWriteToken() ?? process.env.SANITY_API_READ_TOKEN;
  const haku = new URLSearchParams({ query, perspective });
  for (const [k, v] of Object.entries(params)) haku.set(`$${k}`, JSON.stringify(v));
  const res = await fetch(`https://${projectId}.api.sanity.io/v2025-02-19/data/query/${DATASET}?${haku}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`Sanity-kysely epäonnistui: HTTP ${res.status}`);
  return ((await res.json()) as { result: T }).result;
}

/** Sivun HTML:n `<section id="…">`-tunnisteet (taulukko-osiot, StatSections). */
async function sivu(polku: string): Promise<{ status: number; osiot: Set<string> }> {
  const res = await fetch(`${BASE_URL}${polku}`, { redirect: "manual", signal: AbortSignal.timeout(60_000) });
  const html = res.ok ? await res.text() : "";
  const osiot = new Set([...html.matchAll(/<section[^>]*\sid="([^"]+)"/g)].map((m) => m[1]));
  return { status: res.status, osiot };
}

async function rinnakkain<T, R>(lista: T[], n: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const tulos: R[] = new Array(lista.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < lista.length) {
        const j = i++;
        tulos[j] = await fn(lista[j]);
      }
    }),
  );
  return tulos;
}

async function main() {
  const virheet: string[] = [];
  const virhe = (v: string) => virheet.push(v);

  // 1. Taulukot ja sijainnit
  const docs = await kysely<SijaintiDoc[]>(`*[_type == "jalkapalloTilasto"] | order(_id asc){${SIJAINTI_PROJEKTIO}}`);
  if (docs.length === 0) throw new Error(`Datasetissä ${DATASET} ei ole taulukoita (token?)`);
  const sijainnit = new Map(docs.map((d) => [d._id, dokumentinSijainnit(d)]));
  const ilman = docs.filter((d) => (sijainnit.get(d._id)?.locations.length ?? 0) === 0);
  const usealla = docs.filter((d) => (sijainnit.get(d._id)?.locations.length ?? 0) > 1);
  console.log(`${docs.length} taulukkoa (${DATASET}): ${docs.length - ilman.length} näkyy sivulla, ${usealla.length} usealla sivulla`);
  for (const d of usealla) console.log(`  usealla: ${d._id} → ${sijainnit.get(d._id)!.locations.map((l) => l.href).join(", ")}`);
  for (const d of ilman) console.log(`  ei sivulla: ${d._id} (${sijainnit.get(d._id)?.message})`);

  // 2. Sitemapin osoite ensimmäisenä
  const rivit = await kysely<(RoutableDoc & { _id: string })[]>(sitemapTilastotQuery);
  for (const rivi of rivit) {
    const ensimmainen = sijainnit.get(rivi._id)?.locations[0]?.href ?? null;
    if (ensimmainen !== documentHref(rivi)) virhe(`${rivi._id}: sijainti ${ensimmainen} ≠ sitemap ${documentHref(rivi)}`);
  }

  // 3. Studion ryhmät (raw: myös luonnokset)
  const kaikki = await kysely<string[]>(`*[_type == "jalkapalloTilasto"]._id`, {}, "raw");
  const ryhmassa = new Map<string, string>();
  for (const r of TILASTORYHMAT) {
    const { filter, params } = ryhmanSuodatin(r.id);
    const idt = await kysely<string[]>(`*[${filter}]._id`, params, "raw");
    console.log(`Ryhmä ${r.otsikko}: ${idt.length}`);
    for (const id of idt) {
      if (ryhmassa.has(id)) virhe(`${id} sekä ryhmässä ${ryhmassa.get(id)} että ${r.id}`);
      ryhmassa.set(id, r.id);
    }
  }
  for (const id of kaikki) if (!ryhmassa.has(id)) virhe(`${id} puuttuu Studion ryhmistä`);
  console.log(`Ryhmissä ${ryhmassa.size}/${kaikki.length} (luonnokset mukana)`);

  // 4. Sivusto
  const xml = await fetch(`${BASE_URL}/sitemap.xml`).then((r) => r.text());
  const sitemapPolut = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => new URL(m[1]).pathname)
    .filter((p) => !OHITETUT.test(p));
  const sijaintiPolut = [...sijainnit.values()].flatMap((s) => s?.locations.map((l) => l.href.split("#")[0]) ?? []);
  const polut = [...new Set([...sitemapPolut, ...sijaintiPolut])].sort();
  console.log(`Haetaan ${polut.length} sivua osoitteesta ${BASE_URL}`);
  const haetut = new Map(await rinnakkain(polut, 4, async (p) => [p, await sivu(p)] as const));

  const slugista = new Map(docs.filter((d) => d.slug).map((d) => [d.slug as string, d]));
  let tarkistettu = 0;
  for (const d of docs) {
    for (const l of sijainnit.get(d._id)?.locations ?? []) {
      const [polku, ankkuri] = l.href.split("#");
      const s = haetut.get(polku);
      tarkistettu += 1;
      if (!s || s.status !== 200) virhe(`${d._id}: ${l.href} vastaa ${s?.status}`);
      else if (ankkuri && !s.osiot.has(ankkuri)) virhe(`${d._id}: ${l.href}: taulukkoa ei ole sivulla`);
    }
  }
  // Toisin päin: sivuston taulukko-osiot, joita sijainnit eivät tunne.
  let loydetyt = 0;
  for (const [polku, s] of haetut) {
    for (const id of s.osiot) {
      const d = slugista.get(id);
      if (!d) continue;
      loydetyt += 1;
      const hrefit = sijainnit.get(d._id)?.locations.map((l) => l.href) ?? [];
      if (!hrefit.includes(`${polku}#${id}`)) virhe(`${d._id} näkyy sivulla ${polku}, mutta sijainneissa on ${hrefit.join(", ") || "ei mitään"}`);
    }
  }
  // Omat sivut (karsinta, muu): sivu näyttää taulukon ilman ankkuria.
  console.log(`Sijainteja tarkistettu ${tarkistettu}, sivuston taulukko-osioita ${loydetyt}`);

  if (virheet.length > 0) {
    console.error(`\n${virheet.length} virhettä:`);
    for (const v of virheet) console.error(`  ✗ ${v}`);
    process.exit(1);
  }
  console.log("\n✓ Jokaisen taulukon sijainti vastaa sivustoa, ja jokainen taulukko on Studion ryhmissä.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
