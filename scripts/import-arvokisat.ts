/**
 * Muuntaa jäsennetyt arvokisat, tilastotaulukot ja pelaajat Sanity-tuontitiedostoksi.
 *
 * Ajo:    `npx tsx scripts/import-arvokisat.ts`
 * Lähde:  data/normalized/arvokisat.json   (`npx tsx scripts/parse-arvokisat.ts`)
 * Tulos:  data/migration-arvokisat.ndjson
 *         data/coverage-arvokisat.tsv      (M4:n rivit data/coverage.tsv:hen)
 *
 * Tuonti Sanityyn (AINA development-datasetiin, docs/12 §0):
 *   npx sanity dataset import data/migration-arvokisat.ndjson development --replace
 *
 * Ohut CMS-kohtainen adapteri kuten `import-ravintolat.ts`: parseri tuottaa
 * neutraalia JSONia, ja vain tämä tiedosto tietää Sanityn rakenteista.
 *
 * `_id` on deterministinen (`<tyyppi>-<slug>`) ja kaikki `_key`:t johdetaan
 * järjestyksestä, joten kaksi peräkkäistä ajoa tuottavat tavulleen saman
 * tiedoston (docs/12 §1.4) ja `--replace` on turvallinen.
 *
 * Kuvat viedään `_sanityAsset: "image@file://…"` -viittauksina (docs/12
 * §2.1.5): Sanity lataa tiedoston tuonnin yhteydessä ja deduplikoi sisällön
 * hashilla, joten sama kuva useassa dokumentissa on yksi asset.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import type {
  ArvokisatData,
  Block,
  ImageRef,
  Kisa,
  Pelaaja,
  Span,
  Taulukko,
} from "./parse-arvokisat";

const SOURCE = join(process.cwd(), "data", "normalized", "arvokisat.json");
const OUT = join(process.cwd(), "data", "migration-arvokisat.ndjson");
const COVERAGE = join(process.cwd(), "data", "coverage-arvokisat.tsv");
const IMAGES_DIR = join(process.cwd(), "data", "images");

/** Järjestysnumerosta johdettu avain: sama syöte → sama avain. */
const key = (prefix: string, i: number) => `${prefix}${String(i).padStart(3, "0")}`;

const tilastoId = (slug: string) => `jalkapalloTilasto-${slug}`;
const kisaId = (slug: string) => `arvokisa-${slug}`;
const pelaajaId = (slug: string) => `pelaaja-${slug}`;

function image(ref: ImageRef, k: string) {
  return {
    _type: "imageWithAlt" as const,
    _key: k,
    _sanityAsset: `image@${pathToFileURL(join(IMAGES_DIR, ref.file)).href}`,
    alt: ref.alt,
    ...(ref.caption ? { caption: ref.caption } : {}),
  };
}

function spansToChildren(spans: Span[], blockKey: string) {
  const markDefs: { _type: "link"; _key: string; href: string }[] = [];
  const hrefKeys = new Map<string, string>();
  const children = spans.map((s, i) => {
    const marks: string[] = [];
    if (s.bold) marks.push("strong");
    if (s.italic) marks.push("em");
    if (s.href) {
      let mk = hrefKeys.get(s.href);
      if (!mk) {
        mk = `${blockKey}l${markDefs.length}`;
        hrefKeys.set(s.href, mk);
        markDefs.push({ _type: "link", _key: mk, href: s.href });
      }
      marks.push(mk);
    }
    return { _type: "span" as const, _key: `${blockKey}s${i}`, text: s.text, marks };
  });
  return { children, markDefs };
}

/** Neutraalit lohkot → Portable Text (skeema `portableText`). */
function toPortableText(blocks: Block[], prefix: string) {
  return blocks.map((b, i) => {
    const k = key(prefix, i);
    if (b.kind === "image") return image(b.image, k);
    if (b.kind === "heading") {
      return {
        _type: "block" as const,
        _key: k,
        style: `h${b.level}`,
        markDefs: [],
        children: [{ _type: "span" as const, _key: `${k}s0`, text: b.text, marks: [] }],
      };
    }
    const { children, markDefs } = spansToChildren(b.spans, k);
    return {
      _type: "block" as const,
      _key: k,
      style: "normal",
      markDefs,
      children,
      ...(b.listItem ? { listItem: b.listItem, level: 1 } : {}),
    };
  });
}

function slugField(current: string) {
  return { _type: "slug" as const, current };
}

function ref(id: string, i: number) {
  return { _type: "reference" as const, _ref: id, _key: key("t", i) };
}

/** Jättää pois tyhjät arvot: ei tyhjiä merkkijonoja eikä tyhjiä listoja Sanityyn. */
function compact<T extends Record<string, unknown>>(doc: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(doc)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out as T;
}

function tilastoDoc(t: Taulukko, legacyUrl: string) {
  return compact({
    _id: tilastoId(t.slug),
    _type: "jalkapalloTilasto",
    title: t.title,
    slug: slugField(t.slug),
    tiivistelma: t.tiivistelma,
    category: t.category,
    jarjestys: t.jarjestys,
    columns: t.columns.map((c) => ({ _key: c.key, key: c.key, label: c.label, type: c.type })),
    rows: t.rows.map((row, i) => ({
      _key: key("r", i),
      // Jokaisella rivillä on solu jokaiselle sarakkeelle (sarakemäärä yhtenäinen,
      // docs/12 §1.2); tyhjän solun `value` jätetään pois.
      cells: t.columns.map((c) => ({
        _key: c.key,
        key: c.key,
        ...(row[c.key] ? { value: row[c.key] } : {}),
      })),
    })),
    kuvat: t.kuvat.map((k, i) => image(k, key("k", i))),
    needsReview: t.needsReview,
    legacyUrl,
  });
}

function kisaDoc(k: Kisa) {
  return compact({
    _id: kisaId(k.slug),
    _type: "arvokisa",
    title: k.title,
    slug: slugField(k.slug),
    tiivistelma: k.tiivistelma,
    kisatyyppi: k.kisatyyppi,
    vuosi: k.vuosi,
    isantamaat: k.isantamaat,
    alkuPvm: k.alkuPvm,
    loppuPvm: k.loppuPvm,
    voittaja: k.voittaja,
    hopea: k.hopea,
    pronssi: k.pronssi,
    suomenSijoitus: k.suomenSijoitus,
    kuvaus: toPortableText(k.kuvaus, "b"),
    tilastot: k.tilastot.map((s, i) => ref(tilastoId(s), i)),
    kuvat: k.kuvat.map((img, i) => image(img, key("k", i))),
    needsReview: k.needsReview,
    legacyUrl: `/${k.sourcePage}`,
  });
}

function pelaajaDoc(p: Pelaaja) {
  return compact({
    _id: pelaajaId(p.slug),
    _type: "pelaaja",
    name: p.name,
    slug: slugField(p.slug),
    tiivistelma: p.tiivistelma,
    syntymaaika: p.syntymaaika,
    pelipaikka: p.pelipaikka,
    maaottelut: p.maaottelut,
    maalit: p.maalit,
    seurat: p.seurat.map((s, i) => compact({ _key: key("s", i), seura: s.seura, alkuvuosi: s.alkuvuosi, loppuvuosi: s.loppuvuosi })),
    kuvaus: toPortableText(p.kuvaus, "b"),
    tilastot: p.tilastot.map((s, i) => ref(tilastoId(s), i)),
    kuvat: p.kuvat.map((img, i) => image(img, key("k", i))),
    needsReview: p.needsReview,
    legacyUrl: `/${p.sourcePage}`,
    muutLegacyUrlit: p.muutSourcePages.map((s) => `/${s}`),
  });
}

async function main() {
  const data = JSON.parse(await readFile(SOURCE, "utf-8")) as ArvokisatData;

  // Taulukon legacyUrl = sivu, jolta se on peräisin. Lohkotaulukot jakavat
  // kisasivun osoitteen: ohjauksen kohde on silloin viittaava arvokisa (raportti).
  const docs = [
    ...data.taulukot.map((t) => tilastoDoc(t, `/${t.sourcePage}`)),
    ...data.kisat.map(kisaDoc),
    ...data.pelaajat.map(pelaajaDoc),
  ];

  // Eheys ennen kirjoitusta: uniikit _id:t ja viittaukset osuvat tiedostoon.
  const ids = new Set<string>();
  for (const d of docs) {
    if (ids.has(d._id)) throw new Error(`Kaksoiskappale _id: ${d._id}`);
    ids.add(d._id);
  }
  for (const d of docs) {
    for (const r of ((d as { tilastot?: { _ref: string }[] }).tilastot ?? [])) {
      if (!ids.has(r._ref)) throw new Error(`${d._id}: viittaus puuttuvaan ${r._ref}`);
    }
  }

  await writeFile(OUT, `${docs.map((d) => JSON.stringify(d)).join("\n")}\n`, "utf-8");

  // ── Coverage: yksi rivi per M4:n vanha sivu ──────────────────────────────
  const rows: string[][] = [];
  const bySource = (page: string) => data.taulukot.filter((t) => t.sourcePage === page);
  for (const k of data.kisat) {
    if (k.kisatyyppi === "kansojen-liiga") continue;
    const tables = bySource(k.sourcePage);
    rows.push([
      `/${k.sourcePage}`,
      "M4",
      "migrated",
      kisaId(k.slug),
      [
        tables.length ? `+ ${tables.length} lohkotaulukkoa (${tilastoId(`${k.slug}-lohko-a`)} …)` : "",
        k.kisatyyppi === "u21-em" ? "ohjaus päivitettävä: /jalkapalloarkisto/arvokisat/u21-em-2009 (nyt /jalkapalloarkisto/pelaajat)" : "",
        k.needsReview ? `needsReview: ${k.reviewReasons.join("; ")}` : "",
      ]
        .filter(Boolean)
        .join("; ") || "–",
    ]);
  }
  const liiga = data.kisat.filter((k) => k.kisatyyppi === "kansojen-liiga");
  rows.push([
    "/kansojenliiga.htm",
    "M4",
    "migrated",
    tilastoId("kansojen-liigan-mitalistit"),
    `+ ${liiga.map((k) => kisaId(k.slug)).join(", ")} (yksi arvokisa per kausi, uutinen kauden kuvaukseen); ohjaus /jalkapalloarkisto/arvokisat säilyy`,
  ]);
  rows.push([
    "/mmtilasto.htm",
    "M4",
    "migrated",
    tilastoId("mm-kisojen-mitalistit"),
    "25 riviä + keski-ikäkaavio (kuvat); 98 Wikimedia-lippukuvaa pudotettu; ohjaus /jalkapalloarkisto/arvokisat säilyy",
  ]);
  rows.push([
    "/emtilasto.htm",
    "M4",
    "migrated",
    tilastoId("em-kisojen-mitalistit"),
    "17 riviä; 51 Wikimedia-lippukuvaa pudotettu; ohjaus /jalkapalloarkisto/arvokisat säilyy",
  ]);
  for (const p of data.pelaajat) {
    rows.push([`/${p.sourcePage}`, "M4", "migrated", pelaajaId(p.slug), p.needsReview ? `needsReview: ${p.reviewReasons.join("; ")}` : "–"]);
    rows.push([
      "/litmanen.htm",
      "M4",
      "merged",
      pelaajaId(p.slug),
      `muutLegacyUrlit; loukkaantumistaulukko ${tilastoId("jari-litmanen-loukkaantumiset")} (pelaaja.tilastot), terveysuutiset kuvaukseen`,
    ]);
    rows.push([
      "/litmanenjaripatsas.htm",
      "M4",
      "merged",
      pelaajaId(p.slug),
      "muutLegacyUrlit; 16 patsaskuvaa kuvateksteineen pelaaja.kuvat-galleriaan",
    ]);
  }
  rows.sort((a, b) => a[0].localeCompare(b[0]));
  const tsv = [["legacyUrl", "agentti", "tila", "kohde", "huomio"], ...rows]
    .map((r) => r.map((c) => c.replace(/[\t\n]/g, " ")).join("\t"))
    .join("\n");
  await writeFile(COVERAGE, `${tsv}\n`, "utf-8");

  const count = (type: string) => docs.filter((d) => d._type === type).length;
  const images = (JSON.stringify(docs).match(/"_sanityAsset"/g) ?? []).length;
  console.log(`
jalkapalloTilasto ....... ${count("jalkapalloTilasto")}
arvokisa ................ ${count("arvokisa")}
pelaaja ................. ${count("pelaaja")}
Dokumentteja yhteensä ... ${docs.length}
Kuvaviittauksia ......... ${images}
Tarkistettavia .......... ${docs.filter((d) => (d as { needsReview?: boolean }).needsReview).length}
Coverage-rivejä ......... ${rows.length}

Kirjoitettu: ${OUT}
             ${COVERAGE}

Tuonti:
  npx sanity dataset import ${OUT} development --replace`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
