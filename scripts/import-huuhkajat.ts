/**
 * Muuntaa jäsennetyt Huuhkajat-taulukot Sanity-tuontitiedostoksi.
 *
 * Ajo:    `npx tsx scripts/import-huuhkajat.ts`
 * Lähde:  data/normalized/huuhkajat.json          (`npx tsx scripts/parse-huuhkajat.ts`)
 *         data/normalized/huuhkajat-report.json   (kattavuus → coverage-tsv)
 * Tulos:  data/migration-huuhkajat.ndjson
 *         data/coverage-huuhkajat.tsv
 *
 * Tuonti Sanityyn (AINA development):
 *   npx sanity dataset import data/migration-huuhkajat.ndjson development --replace
 *
 * Ohut CMS-kohtainen adapteri, kuten `scripts/import-ravintolat.ts`: parseri
 * tuottaa neutraalia JSONia, tämä tiedosto tietää Sanityn muodot.
 *
 * Toistettavuus: `_id` = `jalkapalloTilasto-<slug>` ja jokainen `_key` on
 * johdettu dokumentin id:stä ja sijainnista (sha1), joten kaksi ajoa tuottaa
 * tavulleen saman NDJSON:n eikä `--replace` luo duplikaatteja.
 *
 * Kuvat: `_sanityAsset: "image@file://./images/<tiedosto>"`. Sanity CLI
 * ratkaisee suhteellisen polun NDJSON-tiedoston hakemistosta (data/), ja
 * deduplikoi assetit sisällön hashilla — sama kuva ei tallennu kahdesti.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { Block, CoverageEntry, HuuhkajaTilasto, Kuva } from "./parse-huuhkajat";

const SOURCE = join(process.cwd(), "data", "normalized", "huuhkajat.json");
const REPORT = join(process.cwd(), "data", "normalized", "huuhkajat-report.json");
const OUT = join(process.cwd(), "data", "migration-huuhkajat.ndjson");
const COVERAGE = join(process.cwd(), "data", "coverage-huuhkajat.tsv");

const TYPE = "jalkapalloTilasto";

export function docId(slug: string): string {
  return `${TYPE}-${slug}`;
}

/** Deterministinen avain: sama dokumentti ja sijainti → sama `_key`. */
function key(...parts: (string | number)[]): string {
  return createHash("sha1").update(parts.join("|")).digest("hex").slice(0, 12);
}

interface PtSpan {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
}

interface PtBlock {
  _type: "block";
  _key: string;
  style: string;
  listItem?: "bullet";
  level?: number;
  markDefs: { _type: "link"; _key: string; href: string }[];
  children: PtSpan[];
}

/** Neutraalit kappaleet → Portable Text. Linkit markDefs-annotaatioiksi. */
function toPortableText(id: string, field: string, blocks: Block[]): PtBlock[] {
  return blocks.map((b, bi) => {
    const markDefs: PtBlock["markDefs"] = [];
    const linkKeys = new Map<string, string>();
    const children = b.spans.map((s, si) => {
      const marks: string[] = [...s.marks];
      if (s.href) {
        let k = linkKeys.get(s.href);
        if (!k) {
          k = key(id, field, bi, "link", s.href);
          linkKeys.set(s.href, k);
          markDefs.push({ _type: "link", _key: k, href: s.href });
        }
        marks.push(k);
      }
      return { _type: "span" as const, _key: key(id, field, bi, si), text: s.text, marks };
    });
    return {
      _type: "block" as const,
      _key: key(id, field, bi),
      style: b.style,
      ...(b.listItem ? { listItem: b.listItem, level: 1 } : {}),
      markDefs,
      children,
    };
  });
}

function toImage(id: string, k: Kuva, index: number) {
  return {
    _type: "imageWithAlt",
    _key: key(id, "kuvat", index, k.file),
    _sanityAsset: `image@file://./images/${encodeURIComponent(k.file)}`,
    alt: k.alt,
    ...(k.caption ? { caption: k.caption } : {}),
  };
}

function toDocument(t: HuuhkajaTilasto) {
  const id = docId(t.slug);
  const columns = t.columns.map((c, i) => ({ _key: key(id, "col", i, c.key), key: c.key, label: c.label, type: c.type }));
  const rows = t.rows.map((row, ri) => ({
    _key: key(id, "row", ri),
    // Tyhjä solu: avain säilyy (sarakemäärä yhtenäinen), arvo jätetään pois.
    cells: row.map((value, ci) => ({
      _key: key(id, "row", ri, "cell", ci),
      key: t.columns[ci].key,
      ...(value !== "" ? { value } : {}),
    })),
  }));
  const intro = toPortableText(id, "intro", t.intro);
  const lisatiedot = toPortableText(id, "lisatiedot", t.lisatiedot);
  const kuvat = t.kuvat.map((k, i) => toImage(id, k, i));

  // Tyhjät kentät jätetään pois (ei tyhjiä merkkijonoja eikä tyhjiä listoja).
  return {
    _id: id,
    _type: TYPE,
    title: t.title,
    slug: { _type: "slug", current: t.slug },
    ...(t.tiivistelma ? { tiivistelma: t.tiivistelma } : {}),
    category: t.category,
    ...(intro.length ? { intro } : {}),
    ...(columns.length ? { columns } : {}),
    ...(rows.length ? { rows } : {}),
    ...(lisatiedot.length ? { lisatiedot } : {}),
    ...(t.paivitetty ? { paivitetty: t.paivitetty } : {}),
    jarjestys: t.jarjestys,
    ...(kuvat.length ? { kuvat } : {}),
    ...(t.sources.length ? { sources: t.sources } : {}),
    needsReview: t.needsReview,
    legacyUrl: t.legacyUrl,
    ...(t.muutLegacyUrlit?.length ? { muutLegacyUrlit: t.muutLegacyUrlit } : {}),
  };
}

function tsvCell(value: string): string {
  return value.replace(/[\t\r\n]+/g, " ").trim();
}

async function main() {
  const source = JSON.parse(await readFile(SOURCE, "utf-8")) as HuuhkajaTilasto[];
  const report = JSON.parse(await readFile(REPORT, "utf-8")) as { kattavuus: CoverageEntry[] };

  const docs = source.map(toDocument);
  const ids = new Set(docs.map((d) => d._id));
  if (ids.size !== docs.length) throw new Error("Toistuva _id — tarkista slugit");

  await writeFile(OUT, `${docs.map((d) => JSON.stringify(d)).join("\n")}\n`, "utf-8");

  // Kattavuus: kohde on dokumentin _id, hubiin yhdistetyllä sivulla polku.
  const lines = ["legacyUrl\tagentti\ttila\tkohde\thuomio"];
  for (const c of report.kattavuus) {
    const target = c.kohde.startsWith("/") ? c.kohde : docId(c.kohde);
    if (!target.startsWith("/") && !ids.has(target)) throw new Error(`Kattavuuden kohde puuttuu: ${target}`);
    lines.push([c.legacyUrl, "M2", c.tila, target, c.huomio].map(tsvCell).join("\t"));
  }
  await writeFile(COVERAGE, `${lines.join("\n")}\n`, "utf-8");

  const byCategory: Record<string, number> = {};
  for (const d of docs) byCategory[d.category] = (byCategory[d.category] ?? 0) + 1;
  const rowCount = docs.reduce((n, d) => n + (d.rows?.length ?? 0), 0);
  const imageCount = docs.reduce((n, d) => n + (d.kuvat?.length ?? 0), 0);

  console.log(`
Dokumentteja ............ ${docs.length}  ${JSON.stringify(byCategory)}
  taulukkorivejä ........ ${rowCount}
  kuvia ................. ${imageCount}
  tarkistettavia ........ ${docs.filter((d) => d.needsReview).length}
Kattavuusrivejä ......... ${lines.length - 1}

Kirjoitettu: ${OUT}
             ${COVERAGE}

Tuonti:
  npx sanity dataset import data/migration-huuhkajat.ndjson development --replace`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
