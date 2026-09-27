/**
 * Kokoaa vaiheen 1 agenttien kattavuustiedostot yhdeksi `data/coverage.tsv`:ksi
 * (docs/12-sisaltomigraatio.md §3 Vaihe 2, kohta 1).
 *
 * Ajo:    npx tsx scripts/build-coverage.ts            → kokoaa ja tarkistaa
 *         npx tsx scripts/build-coverage.ts --sanity   → lisäksi jokainen kohde-_id
 *                                                        haetaan development-datasetista
 * Lähde:  data/coverage.tsv          (vaiheen 0 runko: jokainen vanha URL → vastuuagentti)
 *         data/coverage-<tyyppi>.tsv (vaiheen 1 agenttien rivit)
 * Tulos:  data/coverage.tsv          (sama tiedosto, tilat päivitettyinä)
 *         data/normalized/kuvat-dropped.json (agenttien pudotetut kuvat yhdessä)
 *
 * Rungon rivijärjestys ja `agentti`-sarake säilyvät; agentin rivi korvaa
 * `tila`-, `kohde`- ja `huomio`-sarakkeet. Ajo on idempotentti: sama syöte →
 * tavulleen sama tulos.
 *
 * Skripti EPÄONNISTUU, jos
 *  - jokin rivi jää tilaan `unknown` (tai muuhun kuin migrated/merged/dropped),
 *  - agentin tiedostossa on URL, jota rungossa ei ole (kirjoitusvirhe tai uusi sivu),
 *  - `migrated`-rivin kohde puuttuu tai (`--sanity`) kohdedokumenttia ei löydy.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DATA = join(process.cwd(), "data");
const MASTER = join(DATA, "coverage.tsv");
const HEADER = ["legacyUrl", "agentti", "tila", "kohde", "huomio"] as const;
const VALID_STATES = new Set(["migrated", "merged", "dropped"]);
const NORMALIZED = join(DATA, "normalized");
const DROPPED_OUT = join(NORMALIZED, "kuvat-dropped.json");

/** Yhden pudotetun kuvan rivi koosteessa (docs/12 §1.3). */
interface DroppedImage {
  kuva: string;
  sivu: string;
  syy: string;
  lahde: string;
}

/**
 * Kokoaa agenttien `<tyyppi>-kuvat-dropped.json`-tiedostot yhdeksi
 * `kuvat-dropped.json`:ksi. Agenttien kenttänimet vaihtelevat
 * (file/src, sivu/page, syy/reason), joten ne yhtenäistetään.
 */
async function buildDroppedImages(): Promise<{ total: number; perFile: string[]; errors: string[] }> {
  const files = (await readdir(NORMALIZED)).filter((f) => /^.+-kuvat-dropped\.json$/.test(f)).sort();
  const all: DroppedImage[] = [];
  const perFile: string[] = [];
  const errors: string[] = [];
  for (const file of files) {
    const rows = JSON.parse(await readFile(join(NORMALIZED, file), "utf-8")) as Record<string, string>[];
    for (const row of rows) {
      const item: DroppedImage = {
        kuva: row.file ?? row.src ?? "",
        sivu: row.sivu ?? row.page ?? "",
        syy: row.syy ?? row.reason ?? "",
        lahde: file,
      };
      if (!item.kuva || !item.syy) {
        errors.push(`${file}: pudotettu kuva ilman tiedostoa tai perustelua (${JSON.stringify(row).slice(0, 80)})`);
      }
      all.push(item);
    }
    perFile.push(`  ${file.padEnd(34)} ${rows.length}`);
  }
  all.sort((a, b) => a.lahde.localeCompare(b.lahde) || a.sivu.localeCompare(b.sivu) || a.kuva.localeCompare(b.kuva));
  await writeFile(DROPPED_OUT, `${JSON.stringify(all, null, 2)}\n`, "utf-8");
  return { total: all.length, perFile, errors };
}

type Row = Record<(typeof HEADER)[number], string>;

/** Lukee TSV:n otsikkorivin sarakenimien mukaan — agenttien tiedostoissa sarakkeet vaihtelevat. */
function parseTsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  const [head, ...rest] = lines;
  const columns = head.split("\t").map((c) => c.trim());
  return rest.map((line) => {
    const cells = line.split("\t");
    return Object.fromEntries(columns.map((c, i) => [c, (cells[i] ?? "").trim()]));
  });
}

/** `/sivu.htm` ja `sivu.htm` ovat sama osoite. Kirjainkoko säilyy (palvelin on kirjainkoon erottava). */
function normalizeUrl(url: string): string {
  return `/${url.trim().replace(/^\/+/, "")}`;
}

/** Tyhjentää sarkaimet ja rivinvaihdot soluista, jotta TSV ei hajoa. */
function cell(value: string): string {
  return value.replace(/[\t\r\n]+/g, " ").trim();
}

async function checkSanityIds(ids: string[]): Promise<string[]> {
  process.loadEnvFile(".env.local");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !token) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID tai SANITY_API_WRITE_TOKEN puuttuu .env.localista");
  const query = `*[_id in $ids]._id`;
  const url =
    `https://${projectId}.api.sanity.io/v2024-10-01/data/query/development` +
    `?query=${encodeURIComponent(query)}&$ids=${encodeURIComponent(JSON.stringify(ids))}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Sanity-kysely epäonnistui: HTTP ${res.status}`);
  const found = new Set(((await res.json()) as { result: string[] }).result);
  return ids.filter((id) => !found.has(id));
}

async function main() {
  const checkSanity = process.argv.includes("--sanity");
  const master = parseTsv(await readFile(MASTER, "utf-8")) as Row[];
  const byUrl = new Map(master.map((row) => [normalizeUrl(row.legacyUrl), row]));

  const fragments = (await readdir(DATA))
    .filter((f) => /^coverage-.+\.tsv$/.test(f))
    .sort();

  const errors: string[] = [];
  const perFragment: string[] = [];

  for (const file of fragments) {
    const rows = parseTsv(await readFile(join(DATA, file), "utf-8"));
    for (const row of rows) {
      const url = normalizeUrl(row.legacyUrl ?? "");
      const target = byUrl.get(url);
      if (!target) {
        errors.push(`${file}: ${url} puuttuu rungosta (data/coverage.tsv)`);
        continue;
      }
      target.tila = cell(row.tila ?? "");
      target.kohde = cell(row.kohde ?? "");
      target.huomio = cell(row.huomio ?? "");
    }
    perFragment.push(`  ${file.padEnd(28)} ${rows.length} riviä`);
  }

  const counts: Record<string, number> = {};
  const ids = new Set<string>();
  for (const row of master) {
    counts[row.tila] = (counts[row.tila] ?? 0) + 1;
    if (!VALID_STATES.has(row.tila)) {
      errors.push(`${row.legacyUrl}: tila "${row.tila}" (sallitut: migrated, merged, dropped)`);
    }
    if ((row.tila === "migrated" || row.tila === "merged") && !row.kohde) {
      errors.push(`${row.legacyUrl}: tila ${row.tila} ilman kohdetta`);
    }
    if (row.tila === "dropped" && !row.huomio) {
      errors.push(`${row.legacyUrl}: dropped ilman perustelua`);
    }
    // Kohde on joko polku (/…) tai pilkuilla eroteltu lista dokumentti-id:itä.
    if (row.tila === "migrated" && row.kohde && !row.kohde.startsWith("/")) {
      for (const id of row.kohde.split(",").map((s) => s.trim()).filter(Boolean)) ids.add(id);
    }
  }

  if (checkSanity && ids.size > 0) {
    const missing = await checkSanityIds([...ids].sort());
    for (const id of missing) errors.push(`kohdedokumenttia ${id} ei löydy development-datasetista`);
  }

  const dropped = await buildDroppedImages();
  errors.push(...dropped.errors);

  const out =
    [HEADER.join("\t"), ...master.map((row) => HEADER.map((h) => cell(row[h] ?? "")).join("\t"))].join("\n") +
    "\n";
  await writeFile(MASTER, out, "utf-8");

  console.log(`Kattavuustiedostot:\n${perFragment.join("\n")}\n`);
  console.log(`Vanhoja URL:eja ... ${master.length}`);
  for (const [state, n] of Object.entries(counts).sort()) console.log(`  ${state.padEnd(16)} ${n}`);
  if (checkSanity) console.log(`Kohde-id:itä tarkistettu Sanitysta: ${ids.size}`);
  console.log(`\nPudotetut kuvat → ${DROPPED_OUT}: ${dropped.total}\n${dropped.perFile.join("\n")}`);

  if (errors.length > 0) {
    console.error(`\nVIRHE: ${errors.length} ongelmaa:\n${errors.map((e) => `  ${e}`).join("\n")}`);
    process.exit(1);
  }
  console.log(`\nKirjoitettu: ${MASTER} (unknown = 0)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
