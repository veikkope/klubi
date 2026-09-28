/**
 * Kirjoittaa "Vaatii tarkistuksen" -lipun syyn dokumentin kenttään
 * `tarkistettavaa` ("Mitä tarkistaa"), jotta sihteeri näkee sen Studiossa
 * eikä vain raporttitiedostoissa (docs/16, este 12).
 *
 * Ajo:   npx tsx scripts/patch-tarkistussyyt.ts               (development)
 *        npx tsx scripts/patch-tarkistussyyt.ts --production  (tuotanto)
 * Lähde: data/normalized/*-report.json ja ravintolat.json / ravintola-kuvat.json
 *        (jäsentimet ja importit: npm run migrate:all tai parse-/import-skriptit)
 *
 * Syyt yhdistetään dokumentteihin id:n, tyypin ja slugin tai ravintolan nimen
 * perusteella. Kosketaan vain dokumentteihin, joilla lippu on päällä. Dokumentti,
 * jolle syytä ei löydy, listataan eikä sitä muuteta. Idempotentti: `set`
 * korvaa kentän, eikä toinen ajo muuta mitään.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@sanity/client";

import { sanityWriteToken } from "./lib/sanity-token";

const DATASET = process.argv.includes("--production") ? "production" : "development";
const N = join(process.cwd(), "data", "normalized");

function read<T>(file: string): T | null {
  const path = join(N, file);
  return existsSync(path) ? (JSON.parse(readFileSync(path, "utf-8")) as T) : null;
}

type Syyt = string[];
/** Avain: dokumentin id tai `<tyyppi>:<slug>` tai `ravintola-nimi:<nimi>`. */
const syyt = new Map<string, Syyt>();
const lisaa = (avain: string, uudet: Syyt | undefined) => {
  if (!uudet?.length) return;
  syyt.set(avain, [...new Set([...(syyt.get(avain) ?? []), ...uudet])]);
};

function keraaSyyt() {
  read<{ dokumentit: { id: string; syyt?: Syyt }[] }>("uutiset-import-report.json")?.dokumentit.forEach((d) =>
    lisaa(d.id, d.syyt),
  );
  read<{ tarkistettavat: { id: string; syyt: Syyt }[] }>("blogspot-import-report.json")?.tarkistettavat.forEach((d) =>
    lisaa(d.id, d.syyt),
  );
  read<{ needsReview: { id: string; syyt: Syyt }[] }>("stadionit-report.json")?.needsReview.forEach((d) =>
    lisaa(d.id, d.syyt),
  );
  read<{ docs: { slug: string; needsReview?: boolean; reviewReasons?: Syyt }[] }>("tilastot-report.json")?.docs.forEach(
    (d) => d.needsReview && lisaa(`jalkapalloTilasto:${d.slug}`, d.reviewReasons),
  );
  read<{ needsReview: { slug: string; syyt: Syyt }[] }>("huuhkajat-report.json")?.needsReview.forEach((d) =>
    lisaa(`jalkapalloTilasto:${d.slug}`, d.syyt),
  );
  const arvokisat = read<{ needsReview: Record<string, { slug: string; syyt: Syyt }[]> }>("arvokisat-report.json");
  for (const [tyyppi, rivit] of Object.entries(arvokisat?.needsReview ?? {})) {
    rivit.forEach((d) => lisaa(`${tyyppi}:${d.slug}`, d.syyt));
  }
  const klubi = read<{ needsReview: Record<string, { slug: string; syyt: Syyt }[]> }>("klubi-report.json");
  for (const [tyyppi, rivit] of Object.entries(klubi?.needsReview ?? {})) {
    if (Array.isArray(rivit)) rivit.forEach((d) => lisaa(`${tyyppi}:${d.slug}`, d.syyt));
  }
  const ravintolat = read<{ name: string; needsReview?: boolean; reviewReasons?: Syyt }[]>("ravintolat.json");
  ravintolat?.forEach((r) => r.needsReview && lisaa(`ravintola-nimi:${r.name}`, r.reviewReasons));
  read<{ docId: string; altHuomiot?: Record<string, string> }[]>("ravintola-kuvat.json")?.forEach((r) =>
    lisaa(r.docId, Object.entries(r.altHuomiot ?? {}).map(([kuva, huomio]) => `Kuva ${kuva.replace(/^\//, "")}: ${huomio}`)),
  );
}

async function main() {
  keraaSyyt();
  const token = sanityWriteToken();
  if (!token) throw new Error("Kirjoitustoken puuttuu (.env.local tai npx sanity login).");
  const client = createClient({ projectId: "zyrukn4s", dataset: DATASET, apiVersion: "2024-10-01", token, useCdn: false });

  const docs = await client.fetch<{ _id: string; _type: string; slug?: string; name?: string; nyt?: string }[]>(
    `*[needsReview == true && !(_id in path("drafts.**"))]{ _id, _type, "slug": slug.current, name, "nyt": tarkistettavaa }`,
  );

  const tx = client.transaction();
  let muutettu = 0;
  const ilman: string[] = [];
  for (const d of docs) {
    const loydetyt = syyt.get(d._id) ?? syyt.get(`${d._type}:${d.slug}`) ?? (d.name ? syyt.get(`ravintola-nimi:${d.name}`) : undefined);
    if (!loydetyt?.length) ilman.push(d._id);
    // Lippu voi olla aiemmasta ajosta, jonka syy ei ole enää raporteissa: kerrotaan se
    // rehellisesti eikä poisteta lippua hiljaa.
    const teksti = loydetyt?.length
      ? loydetyt.map((s) => `• ${s}`).join("\n")
      : "• Migraation uusin ajo ei enää löydä tästä tarkistettavaa. Vertaa tietoja vanhaan sivuun ja poista rasti, kun ne ovat kunnossa.";
    if (teksti === d.nyt) continue;
    tx.patch(d._id, (p) => p.set({ tarkistettavaa: teksti }));
    muutettu += 1;
  }
  if (muutettu > 0) await tx.commit();

  console.log(`
Datasetti ............... ${DATASET}
Tarkistettavia .......... ${docs.length}
Syy kirjoitettu ......... ${muutettu}${muutettu === 0 ? " (ajan tasalla)" : ""}
Syytä ei löytynyt ....... ${ilman.length}${ilman.length ? `\n${ilman.map((i) => `  ${i}`).join("\n")}` : ""}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
