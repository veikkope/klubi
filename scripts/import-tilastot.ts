/**
 * Muuntaa jäsennetyt tilastot (M3) Sanity-tuontitiedostoksi.
 *
 * Ajo:    npx tsx scripts/import-tilastot.ts
 * Lähde:  data/normalized/tilastot.json      (npx tsx scripts/parse-tilastot.ts)
 *         data/coverage.tsv                  (vain luku: M3:n rivit)
 * Tulos:  data/migration-tilastot.ndjson
 *         data/coverage-tilastot.tsv
 *
 * Tuonti Sanityyn (AINA development-datasetiin):
 *   npx sanity dataset import data/migration-tilastot.ndjson development --replace
 *
 * Ohut CMS-kohtainen adapteri kuten scripts/import-ravintolat.ts: kaikki
 * jäsennys tehdään parserissa, täällä vain muotoillaan Sanityn rakenteet
 * (Portable Text, `_key`:t, kuva-assetit).
 *
 * Toistettavuus: `_id` = `jalkapalloTilasto-<slug>`, `_key`:t johdetaan
 * sijainnista eikä satunnaisluvuista, eikä tulokseen kirjoiteta aikaleimoja.
 * Kaksi peräkkäistä ajoa tuottaa tavulleen saman tiedoston (docs/12 §1.4).
 *
 * Kuvat: `_sanityAsset: "image@file://…"` — Sanity lataa tiedoston tuonnin
 * yhteydessä ja deduplikoi sisällön hashilla, joten sama kuva usealla
 * sivulla (ja muiden agenttien tuonneissa) on yksi asset.
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import type { ImageBlock, RichBlock, RichSpan, Tilasto } from "./parse-tilastot";

const ROOT = process.cwd();
const SOURCE = join(ROOT, "data", "normalized", "tilastot.json");
const COVERAGE = join(ROOT, "data", "coverage.tsv");
const IMAGES_DIR = join(ROOT, "data", "images");
const OUT = join(ROOT, "data", "migration-tilastot.ndjson");
const COVERAGE_OUT = join(ROOT, "data", "coverage-tilastot.tsv");

const DOC_TYPE = "jalkapalloTilasto";

/** Linkkihubit, joista ei tehdä dokumenttia (sama tieto kuin parserin MERGED_PAGES). */
const MERGED: Record<string, { target: string; note: string }> = {
  "/historia.htm": {
    target: "/jalkapalloarkisto",
    note:
      "Linkkihubi ilman omaa dataa; uusi /jalkapalloarkisto-hubi korvaa sen. " +
      "Hubin kuvat: kuvat-dropped (tilastot-kuvat-dropped.json).",
  },
};

export const docId = (slug: string) => `${DOC_TYPE}-${slug}`;

// ---------------------------------------------------------------------------
// Portable Text
// ---------------------------------------------------------------------------

interface PtSpan {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
}

interface PtBlock {
  _type: "block";
  _key: string;
  style: "normal" | "h3";
  markDefs: { _type: "link"; _key: string; href: string }[];
  children: PtSpan[];
}

interface SanityImage {
  _type: "imageWithAlt";
  _key: string;
  _sanityAsset: string;
  alt: string;
  caption?: string;
}

const missingFiles: string[] = [];
const unsupportedFiles: string[] = [];

/** Tunnistaa kuvan tyypin tavuista (vanhalla sivulla on BMP:itä .jpg-nimellä). */
function sniff(buffer: Buffer): string | undefined {
  if (buffer.length < 12) return undefined;
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "jpeg";
  if (buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") return "png";
  if (buffer.subarray(0, 3).toString("latin1") === "GIF") return "gif";
  if (buffer.subarray(0, 2).toString("latin1") === "BM") return "bmp";
  if (buffer.subarray(0, 4).toString("latin1") === "RIFF") return "webp";
  return undefined;
}

function toImage(block: ImageBlock, key: string): SanityImage | null {
  const path = join(IMAGES_DIR, block.file);
  if (!existsSync(path)) {
    missingFiles.push(block.file);
    return null;
  }
  const kind = sniff(readFileSync(path));
  if (!kind || kind === "bmp") {
    unsupportedFiles.push(`${block.file} (${kind ?? "tuntematon"})`);
    return null;
  }
  const image: SanityImage = {
    _type: "imageWithAlt",
    _key: key,
    _sanityAsset: `image@${pathToFileURL(path).href}`,
    alt: block.alt,
  };
  if (block.caption) image.caption = block.caption;
  return image;
}

function toSpans(spans: RichSpan[], blockKey: string): Pick<PtBlock, "children" | "markDefs"> {
  const markDefs: PtBlock["markDefs"] = [];
  const linkKeys = new Map<string, string>();
  const children = spans.map((s, i) => {
    const marks: string[] = [];
    if (s.bold) marks.push("strong");
    if (s.italic) marks.push("em");
    if (s.href) {
      let key = linkKeys.get(s.href);
      if (!key) {
        key = `${blockKey}l${linkKeys.size}`;
        linkKeys.set(s.href, key);
        markDefs.push({ _type: "link", _key: key, href: s.href });
      }
      marks.push(key);
    }
    return { _type: "span" as const, _key: `${blockKey}s${i}`, text: s.text, marks };
  });
  return { children, markDefs };
}

function toPortableText(blocks: RichBlock[], prefix: string): (PtBlock | SanityImage)[] {
  const out: (PtBlock | SanityImage)[] = [];
  blocks.forEach((b, i) => {
    const key = `${prefix}${i}`;
    if (b.type === "image") {
      const img = toImage(b, key);
      if (img) out.push(img);
    } else if (b.type === "heading") {
      out.push({
        _type: "block",
        _key: key,
        style: "h3",
        markDefs: [],
        children: [{ _type: "span", _key: `${key}s0`, text: b.text, marks: [] }],
      });
    } else {
      out.push({ _type: "block", _key: key, style: "normal", ...toSpans(b.spans, key) });
    }
  });
  return out;
}

// ---------------------------------------------------------------------------
// Dokumentti
// ---------------------------------------------------------------------------

function toDocument(t: Tilasto): Record<string, unknown> {
  const intro = toPortableText(t.intro, "i");
  const lisatiedot = toPortableText(t.lisatiedot, "l");
  const kuvat = t.kuvat
    .map((k, i) => toImage(k, `k${i}`))
    .filter((k): k is SanityImage => k !== null);

  const doc: Record<string, unknown> = {
    _id: docId(t.slug),
    _type: DOC_TYPE,
    title: t.title,
    slug: { _type: "slug", current: t.slug },
    category: t.category,
    jarjestys: t.jarjestys,
  };
  // Tyhjät kentät jätetään pois (ei tyhjiä merkkijonoja eikä taulukoita).
  if (t.tiivistelma) doc.tiivistelma = t.tiivistelma;
  if (intro.length) doc.intro = intro;
  if (t.columns.length) {
    doc.columns = t.columns.map((c) => ({ _key: c.key, key: c.key, label: c.label, type: c.type }));
    doc.rows = t.rows.map((row, r) => ({
      _key: `r${r}`,
      cells: row.map((value, c) => {
        const cell: Record<string, string> = { _key: t.columns[c].key, key: t.columns[c].key };
        if (value) cell.value = value;
        return cell;
      }),
    }));
  }
  if (lisatiedot.length) doc.lisatiedot = lisatiedot;
  if (t.paivitetty) doc.paivitetty = t.paivitetty;
  if (kuvat.length) doc.kuvat = kuvat;
  doc.needsReview = t.needsReview;
  doc.legacyUrl = t.legacyUrl;
  return doc;
}

// ---------------------------------------------------------------------------
// Coverage
// ---------------------------------------------------------------------------

function tsvCell(s: string): string {
  return s.replace(/[\t\r\n]+/g, " ").trim();
}

async function buildCoverage(source: Tilasto[]): Promise<string[]> {
  const rows = (await readFile(COVERAGE, "utf-8"))
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map((l) => l.split("\t"))
    .filter((c) => c[1] === "M3");

  const byPage = new Map<string, Tilasto[]>();
  for (const t of source) {
    const list = byPage.get(t.legacyUrl.toLowerCase()) ?? [];
    list.push(t);
    byPage.set(t.legacyUrl.toLowerCase(), list);
  }

  const lines = ["legacyUrl\ttila\tkohde\thuomio"];
  const unhandled: string[] = [];
  for (const [legacyUrl] of rows) {
    const merged = MERGED[legacyUrl];
    if (merged) {
      lines.push([legacyUrl, "merged", merged.target, tsvCell(merged.note)].join("\t"));
      continue;
    }
    const docs = byPage.get(legacyUrl.toLowerCase());
    if (!docs?.length) {
      unhandled.push(legacyUrl);
      continue;
    }
    const [main, ...rest] = docs;
    const notes = [
      `${docs.length} dok (${docs.map((d) => `${d.slug}: ${d.rows.length} riviä`).join(", ")})`,
      `kategoria ${main.category}`,
      rest.length ? `muut: ${rest.map((d) => docId(d.slug)).join(", ")}` : "",
      docs.some((d) => d.needsReview) ? `needsReview: ${docs.flatMap((d) => d.reviewReasons).join(" / ")}` : "",
    ].filter(Boolean);
    lines.push([legacyUrl, "migrated", docId(main.slug), tsvCell(notes.join("; "))].join("\t"));
  }
  if (unhandled.length) throw new Error(`Coverage-rivit ilman kohdetta: ${unhandled.join(", ")}`);
  return lines;
}

async function main() {
  const source = JSON.parse(await readFile(SOURCE, "utf-8")) as Tilasto[];
  const docs = source.map(toDocument);

  if (missingFiles.length || unsupportedFiles.length) {
    throw new Error(
      `Kuvatiedostot puuttuvat tai eivät kelpaa: ${[...missingFiles, ...unsupportedFiles].join(", ")}`,
    );
  }

  await writeFile(OUT, `${docs.map((d) => JSON.stringify(d)).join("\n")}\n`, "utf-8");
  const coverage = await buildCoverage(source);
  await writeFile(COVERAGE_OUT, `${coverage.join("\n")}\n`, "utf-8");

  const images = docs.reduce((n, d) => {
    const count = (v: unknown) =>
      Array.isArray(v) ? v.filter((x) => (x as { _type?: string })._type === "imageWithAlt").length : 0;
    return n + count(d.kuvat) + count(d.intro) + count(d.lisatiedot);
  }, 0);

  console.log(`
Dokumentteja ............ ${docs.length}
  tarkistettavia ........ ${docs.filter((d) => d.needsReview).length}
Taulukkorivejä .......... ${source.reduce((n, t) => n + t.rows.length, 0)}
Kuvaviittauksia ......... ${images}
Coverage-rivejä ......... ${coverage.length - 1}

Kirjoitettu: ${OUT}
             ${COVERAGE_OUT}

Tuonti:
  npx sanity dataset import data/migration-tilastot.ndjson development --replace`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
