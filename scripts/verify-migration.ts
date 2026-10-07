/**
 * Mittaa docs/12-sisaltomigraatio.md §1:n datakohdat suoraan Sanitysta.
 *
 * Ajo:  npm run verify:migration
 *
 * Tarkistaa development-datasetista (ei muokkaa mitään):
 *  §1.1  dokumenttimäärät tyypeittäin, migroidut dokumentit ilman legacyUrl:ia
 *  §1.2  mojibake / C1-ohjausmerkit / HTML-entiteetit kaikissa merkkijonoissa,
 *        taulukoiden sarakeyhtenäisyys, suomalaiset päivämäärät (DD.MM.YYYY)
 *        taulukoissa sarakkeen tyypistä riippumatta, tulevaisuuden päiväykset arkistossa,
 *        needsReview-osuus tyypeittäin
 *  §1.3  kuvat: asset ja alt jokaisella, ei tiedostonimi- tai geneerisiä alt-tekstejä
 *  §1.5  singletonit olemassa
 *
 * Pakollisten kenttien tarkistus tehdään skeeman omilla säännöillä:
 *   npx sanity documents validate -d development
 *
 * Poistuu koodilla 1, jos jokin kriittinen raja ylittyy (mojibake, puuttuva
 * legacyUrl, epäyhtenäinen taulukko, ISO-muuntamaton päivämääräsarake,
 * tulevaisuuden päiväys, kuva ilman
 * assettia tai alt-tekstiä, puuttuva singleton). needsReview-osuus raportoidaan.
 */
import { existsSync } from "node:fs";
import { isSummaryRow } from "./lib/normalize-cell";
import { sanityWriteToken } from "./lib/sanity-token";

const DATASET = "development";
const MIGRATED_TYPES = ["uutinen", "jalkapalloTilasto", "arvokisa", "pelaaja", "stadion", "klubiToiminta", "sivu", "ravintola"];
const SINGLETONS = ["etusivu", "navigaatio", "asetukset", "yhteystiedot"];

const TEXT_PROBLEMS: Record<string, RegExp> = {
  "mojibake (Ã¤/Ã¶/Ã…/â€)": /Ã¤|Ã¶|Ã…|â€/,
  "HTML-entiteetti": /&(?:[a-z]+|#\d+|#x[0-9a-f]+);/i,
  "C1-ohjausmerkki": /[\u0080-\u009f]/,
  "korvausmerkki �": /�/,
};
/** Suomalainen päivämäärä, jota ei ole muunnettu ISO-muotoon (docs/12 §1.2). */
const FI_DATE = /^\d{1,2}\.\d{1,2}\.\d{4}$/;
const FILENAME_ALT = /\.(jpe?g|png|gif|bmp|webp)$|^(img|dsc|image)[-_ ]?\d+/i;
const GENERIC_ALT = /^(kuva|image|photo|valokuva|picture)\s*\d*$/i;

type Doc = Record<string, unknown> & { _id: string; _type: string };

async function fetchAll(): Promise<Doc[]> {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  // Token aina: yksityinen datasetti palauttaa ilman sitä tyhjän tuloksen virheettä.
  const token = sanityWriteToken() ?? process.env.SANITY_API_READ_TOKEN;
  if (!projectId) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID puuttuu .env.localista");
  const query = `*[!(_type match "sanity.*") && !(_id in path("_.**"))]`;
  const url =
    `https://${projectId}.api.sanity.io/v2024-10-01/data/query/${DATASET}` +
    `?query=${encodeURIComponent(query)}&perspective=raw`;
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error(`Sanity-kysely epäonnistui: HTTP ${res.status}`);
  return ((await res.json()) as { result: Doc[] }).result;
}

function walk(value: unknown, path: string, visit: (value: unknown, path: string) => void) {
  visit(value, path);
  if (Array.isArray(value)) value.forEach((item, i) => walk(item, `${path}[${i}]`, visit));
  else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) walk(child, `${path}.${key}`, visit);
  }
}

async function main() {
  const docs = await fetchAll();
  const published = docs.filter((d) => !d._id.startsWith("drafts."));
  const drafts = docs.length - published.length;
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();

  const critical: string[] = [];
  const counts: Record<string, number> = {};
  const review: Record<string, number> = {};
  const textHits: Record<string, string[]> = {};
  const missingLegacy: string[] = [];
  const tableIssues: string[] = [];
  const futureDates: string[] = [];
  let images = 0;
  const imageIssues: string[] = [];
  let tableRows = 0;
  const dateIssues: string[] = [];
  let fiDateCells = 0;

  for (const doc of published) {
    counts[doc._type] = (counts[doc._type] ?? 0) + 1;
    if (doc.needsReview === true) review[doc._type] = (review[doc._type] ?? 0) + 1;

    // Blogspot-blogista tuoduilla uutisilla ei ole vanhan sivuston osoitetta: alkuperä
    // on `blogspot`-kentässä, ja niiden ohjaukset tulevat siitä (docs/14).
    const fromBlogspot = Boolean((doc.blogspot as { id?: string } | undefined)?.id);
    if (MIGRATED_TYPES.includes(doc._type) && !doc.legacyUrl && !fromBlogspot) missingLegacy.push(doc._id);

    walk(doc, doc._id, (value, path) => {
      if (typeof value === "string") {
        // Linkkien URL:t saavat sisältää &-merkkejä kyselyparametreissa.
        if (/\.(href|url|_ref|_sanityAsset)$/.test(path)) return;
        for (const [name, re] of Object.entries(TEXT_PROBLEMS)) {
          if (re.test(value)) (textHits[name] ??= []).push(`${path}: ${JSON.stringify(value.slice(0, 60))}`);
        }
        return;
      }
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const obj = value as Record<string, unknown>;
        if (obj._type === "imageWithAlt" || (obj._type === "image" && path.endsWith("]"))) {
          images += 1;
          const alt = typeof obj.alt === "string" ? obj.alt.trim() : "";
          if (!obj.asset) imageIssues.push(`${path}: ei assettia`);
          if (!alt) imageIssues.push(`${path}: ei alt-tekstiä`);
          else if (FILENAME_ALT.test(alt) || GENERIC_ALT.test(alt)) imageIssues.push(`${path}: alt "${alt}"`);
        }
      }
    });

    if (doc._type === "jalkapalloTilasto") {
      const columns = ((doc.columns as { key: string }[] | undefined) ?? []).map((c) => c.key);
      const keys = new Set(columns);
      if (keys.size !== columns.length) tableIssues.push(`${doc._id}: toistuva sarakeavain`);
      const rows = (doc.rows as { cells?: { key: string; value?: string }[] }[] | undefined) ?? [];
      tableRows += rows.length;
      rows.forEach((row, i) => {
        const cells = row.cells ?? [];
        const cellKeys = cells.map((c) => c.key);
        if (cells.length > columns.length) tableIssues.push(`${doc._id} rivi ${i}: ${cells.length} solua > ${columns.length} saraketta`);
        if (new Set(cellKeys).size !== cellKeys.length) tableIssues.push(`${doc._id} rivi ${i}: toistuva solu`);
        const unknown = cellKeys.filter((k) => !keys.has(k));
        if (unknown.length) tableIssues.push(`${doc._id} rivi ${i}: tuntematon sarake ${unknown.join(",")}`);
      });

      // Päivämäärät ISO-muodossa (§1.2) — myös text-tyyppisistä sarakkeista:
      // jos sarakkeen kaikki ei-yhteenvetoarvot ovat DD.MM.YYYY-päiviä, putken
      // tyyppipäättely on pettänyt (esim. Yhteensä-rivi kaatoi date-tyypin).
      const cols = (doc.columns as { key: string; type?: string }[] | undefined) ?? [];
      const grid = rows.map((row) => cols.map((c) => (row.cells ?? []).find((x) => x.key === c.key)?.value?.trim() ?? ""));
      const dataGrid = grid.filter((r) => !isSummaryRow(r));
      cols.forEach((col, c) => {
        const all = grid.map((r) => r[c]).filter(Boolean);
        const fi = all.filter((v) => FI_DATE.test(v));
        fiDateCells += fi.length;
        if (!fi.length) return;
        const vals = dataGrid.map((r) => r[c]).filter(Boolean);
        if (col.type === "date") {
          dateIssues.push(`${doc._id}.${col.key} (date): ${fi.length} DD.MM.YYYY-arvoa, esim. "${fi[0]}"`);
        } else if (vals.length && vals.every((v) => FI_DATE.test(v))) {
          dateIssues.push(`${doc._id}.${col.key} (${col.type ?? "text"}): kaikki ${vals.length} arvoa DD.MM.YYYY, esim. "${fi[0]}" — pitäisi olla date/ISO`);
        }
      });
      if (typeof doc.paivitetty === "string" && doc.paivitetty > today) futureDates.push(`${doc._id}.paivitetty ${doc.paivitetty}`);
    }
    if (doc._type === "uutinen" && typeof doc.publishedAt === "string" && doc.publishedAt > now) {
      futureDates.push(`${doc._id}.publishedAt ${doc.publishedAt}`);
    }
    if (doc._type === "klubiToiminta") {
      for (const vuosi of (doc.vuodet as { paivamaara?: string }[] | undefined) ?? []) {
        if (vuosi.paivamaara && vuosi.paivamaara > today) futureDates.push(`${doc._id} vuosi ${vuosi.paivamaara}`);
      }
    }
  }

  const missingSingletons = SINGLETONS.filter((id) => !published.some((d) => d._id === id));

  console.log(`Dataset ${DATASET}: ${published.length} julkaistua dokumenttia, ${drafts} luonnosta\n`);
  console.log("§1.1 Määrät tyypeittäin");
  for (const [type, n] of Object.entries(counts).sort()) console.log(`  ${type.padEnd(28)} ${n}`);
  console.log(`  Migroidut ilman legacyUrl:ia: ${missingLegacy.length}`);

  console.log("\n§1.2 Oikeellisuus");
  const textTotal = Object.values(textHits).reduce((n, l) => n + l.length, 0);
  console.log(`  Tekstiongelmia: ${textTotal}`);
  for (const [name, list] of Object.entries(textHits)) console.log(`    ${name}: ${list.length}\n      ${list.slice(0, 5).join("\n      ")}`);
  console.log(`  Taulukoita ${counts.jalkapalloTilasto ?? 0}, rivejä ${tableRows}, rakennevirheitä ${tableIssues.length}`);
  for (const issue of tableIssues.slice(0, 10)) console.log(`    ${issue}`);
  console.log(`  DD.MM.YYYY-soluja taulukoissa: ${fiDateCells} (sekasarakkeissa sallittu), ISO-muuntamattomia päivämääräsarakkeita: ${dateIssues.length}`);
  for (const issue of dateIssues.slice(0, 10)) console.log(`    ${issue}`);
  console.log(`  Tulevaisuuden päiväyksiä arkistossa: ${futureDates.length}`);
  for (const d of futureDates.slice(0, 10)) console.log(`    ${d}`);
  console.log("  needsReview tyypeittäin:");
  for (const type of MIGRATED_TYPES) {
    const n = counts[type] ?? 0;
    const r = review[type] ?? 0;
    console.log(`    ${type.padEnd(20)} ${String(r).padStart(3)} / ${String(n).padEnd(4)} ${(n ? (100 * r) / n : 0).toFixed(1)} %`);
  }

  console.log("\n§1.3 Kuvat");
  console.log(`  Kuvia dokumenteissa: ${images}, ongelmia: ${imageIssues.length}`);
  for (const issue of imageIssues.slice(0, 10)) console.log(`    ${issue}`);

  console.log("\n§1.5 Singletonit");
  console.log(`  Puuttuvat: ${missingSingletons.length ? missingSingletons.join(", ") : "ei yhtään"}`);

  if (textTotal) critical.push(`${textTotal} tekstiongelmaa`);
  if (missingLegacy.length) critical.push(`${missingLegacy.length} ilman legacyUrl:ia (${missingLegacy.slice(0, 3).join(", ")}…)`);
  if (tableIssues.length) critical.push(`${tableIssues.length} taulukkovirhettä`);
  if (dateIssues.length) critical.push(`${dateIssues.length} ISO-muuntamatonta päivämääräsaraketta`);
  if (futureDates.length) critical.push(`${futureDates.length} tulevaisuuden päiväystä`);
  if (imageIssues.length) critical.push(`${imageIssues.length} kuvaongelmaa`);
  if (missingSingletons.length) critical.push(`singletonit puuttuvat: ${missingSingletons.join(", ")}`);
  if (drafts) critical.push(`${drafts} luonnosdokumenttia (migraatio ei saa luoda luonnoksia)`);

  if (critical.length) {
    console.error(`\nKRIITTISIÄ: ${critical.join("; ")}`);
    process.exit(1);
  }
  console.log("\nEi kriittisiä löydöksiä.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
