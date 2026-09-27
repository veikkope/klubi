/**
 * Muuntaa jäsennetyt stadionit Sanity-tuontitiedostoksi.
 *
 * Ajo:    `npx tsx scripts/import-stadionit.ts`
 * Lähde:  data/normalized/stadionit.json   (`npx tsx scripts/parse-stadionit.ts`)
 * Tulos:  data/migration-stadionit.ndjson
 *         data/coverage-stadionit.tsv      (vanha URL → tila → kohde)
 *
 * Tuonti Sanityyn (AINA development, ei koskaan production):
 *   npx sanity dataset import data/migration-stadionit.ndjson development --replace
 *
 * Ohut CMS-kohtainen adapteri kuten `import-ravintolat.ts`: kaikki jäsennys
 * on parserissa, täällä vain muunnos Sanityn muotoon.
 *
 * Deterministisyys (docs/12 §1.4): `_id` = `<tyyppi>-<slug>`, taulukoiden
 * `_key`:t johdetaan dokumentin id:stä ja polusta, kuvat viitataan
 * `_sanityAsset: "image@file://…"` -muodossa. Kaksi ajoa → tavulleen sama NDJSON.
 *
 * Kaupungit: tiedostoon kirjoitetaan vain ne kaupungit, joita ei ole vielä
 * Sanityssa (parserin `isNew`). Olemassa olevia `kaupunki-*`-dokumentteja ei
 * ylikirjoiteta, koska `--replace` korvaisi koko dokumentin.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { maakuntaFor } from "./lib/maakunnat";
import { SUOMI } from "../lib/maakunnat";
import type { Block, ImageRef, Normalized, Span, Stadium, StatTable } from "./parse-stadionit";

const ROOT = process.cwd();
const SOURCE = join(ROOT, "data", "normalized", "stadionit.json");
const OUT = join(ROOT, "data", "migration-stadionit.ndjson");
const COVERAGE = join(ROOT, "data", "coverage-stadionit.tsv");
const IMAGES_DIR = join(ROOT, "data", "images");
const REDIRECTS = join(ROOT, "lib", "redirects.ts");

const LIST_PATH = "/jalkapalloarkisto/stadionit";

/** Deterministinen `_key`: sama dokumentti + polku → sama avain. */
function keyFor(docId: string, path: string): string {
  return createHash("sha1").update(`${docId}:${path}`).digest("hex").slice(0, 12);
}

/** Vanhat `.htm`-linkit uusiksi poluiksi lib/redirects.ts:n kautta (docs/12 §2.1.3). */
async function loadRedirects(): Promise<Map<string, string>> {
  const text = await readFile(REDIRECTS, "utf-8");
  const map = new Map<string, string>();
  for (const m of text.matchAll(/source:\s*"([^"]+)",\s*destination:\s*"([^"]+)"/g)) {
    map.set(m[1].toLowerCase(), m[2]);
  }
  return map;
}

function resolveHref(href: string, redirects: Map<string, string>): string {
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href;
  const path = `/${href.replace(/^\.?\//, "").split("#")[0]}`.toLowerCase();
  return redirects.get(path) ?? href;
}

function imageValue(docId: string, path: string, image: ImageRef) {
  const absolute = join(IMAGES_DIR, image.file);
  return {
    _type: "imageWithAlt",
    _key: keyFor(docId, path),
    _sanityAsset: `image@${pathToFileURL(absolute).href}`,
    alt: image.alt,
    ...(image.caption ? { caption: image.caption } : {}),
  };
}

/** Lohkot → Portable Text. Väliotsikot h2:ksi, luettelot bullet-listaksi. */
function toPortableText(
  docId: string,
  field: string,
  blocks: Block[],
  redirects: Map<string, string>,
) {
  return blocks.map((block, index) => {
    const path = `${field}[${index}]`;
    if (block.kind === "image") return imageValue(docId, path, block.image);

    const markDefs: { _type: "link"; _key: string; href: string }[] = [];
    const children = block.spans.map((span: Span, spanIndex) => {
      const marks: string[] = [];
      if (span.bold && block.kind !== "heading") marks.push("strong");
      if (span.italic) marks.push("em");
      if (span.href) {
        const linkKey = keyFor(docId, `${path}.link${spanIndex}`);
        markDefs.push({ _type: "link", _key: linkKey, href: resolveHref(span.href, redirects) });
        marks.push(linkKey);
      }
      return {
        _type: "span",
        _key: keyFor(docId, `${path}.span${spanIndex}`),
        text: span.text,
        marks,
      };
    });

    return {
      _type: "block",
      _key: keyFor(docId, path),
      style: block.kind === "heading" ? "h2" : "normal",
      ...(block.kind === "bullet" ? { listItem: "bullet", level: 1 } : {}),
      markDefs,
      children,
    };
  });
}

function stadiumDoc(s: Stadium, redirects: Map<string, string>) {
  const _id = `stadion-${s.slug}`;
  const description = toPortableText(_id, "description", s.description, redirects);
  const images = s.images.map((img, i) => imageValue(_id, `images[${i}]`, img));
  return {
    _id,
    _type: "stadion",
    name: s.name,
    slug: { _type: "slug", current: s.slug },
    ...(s.tiivistelma ? { tiivistelma: s.tiivistelma } : {}),
    city: { _type: "reference", _ref: `kaupunki-${s.city.slug}` },
    ...(s.address ? { address: s.address } : {}),
    ...(s.capacity !== null ? { capacity: s.capacity } : {}),
    ...(s.openedYear !== null ? { openedYear: s.openedYear } : {}),
    ...(description.length ? { description } : {}),
    ...(images.length ? { images } : {}),
    needsReview: s.needsReview,
    legacyUrl: s.legacyUrl,
  };
}

function tableDoc(t: StatTable, redirects: Map<string, string>) {
  const _id = `jalkapalloTilasto-${t.slug}`;
  const lisatiedot = toPortableText(_id, "lisatiedot", t.lisatiedot, redirects);
  return {
    _id,
    _type: "jalkapalloTilasto",
    title: t.title,
    slug: { _type: "slug", current: t.slug },
    ...(t.tiivistelma ? { tiivistelma: t.tiivistelma } : {}),
    category: t.category,
    columns: t.columns.map((c) => ({
      _type: "object",
      _key: keyFor(_id, `columns.${c.key}`),
      key: c.key,
      label: c.label,
      type: c.type,
    })),
    rows: t.rows.map((row, r) => ({
      _type: "object",
      _key: keyFor(_id, `rows[${r}]`),
      cells: t.columns
        .filter((c) => row[c.key])
        .map((c) => ({
          _type: "object",
          _key: keyFor(_id, `rows[${r}].${c.key}`),
          key: c.key,
          value: row[c.key],
        })),
    })),
    ...(lisatiedot.length ? { lisatiedot } : {}),
    needsReview: t.needsReview,
    legacyUrl: t.legacyUrl,
  };
}

async function main() {
  const data = JSON.parse(await readFile(SOURCE, "utf-8")) as Normalized;
  const redirects = await loadRedirects();

  const cities = data.cities
    .filter((c) => c.isNew)
    .map((c) => ({
      _id: `kaupunki-${c.slug}`,
      _type: "kaupunki",
      name: c.name,
      slug: { _type: "slug", current: c.slug },
      country: c.country,
      // Suomalainen kaupunki tarvitsee maakunnan hakemiston maakuntasuodattimeen
      // (sama taulukko kuin ravintolaputkessa; tuntematon kunta kaataa ajon).
      ...(c.country === SUOMI ? { maakunta: maakuntaFor(c.name) } : {}),
    }));

  const stadiums = [...data.stadiums]
    .sort((a, b) => a.slug.localeCompare(b.slug, "en"))
    .map((s) => stadiumDoc(s, redirects));
  const tables = data.tables.map((t) => tableDoc(t, redirects));

  const docs = [...cities, ...stadiums, ...tables];
  const ids = new Set(docs.map((d) => d._id));
  if (ids.size !== docs.length) throw new Error("päällekkäisiä _id:itä");

  await writeFile(OUT, `${docs.map((d) => JSON.stringify(d)).join("\n")}\n`, "utf-8");

  // Kattavuus: jokainen M5:lle kuuluva vanha URL → tila ja kohde
  const coverage: string[][] = [["legacyUrl", "tila", "kohde", "huomio"]];
  coverage.push([
    "/stadionit.htm",
    "merged",
    LIST_PATH,
    `Stadionhubi (maa → kaupunki → stadion). Rakenne säilyy stadionien kaupunkiviittauksissa ja kaupunkien maissa; ${data.stadiums.length} stadionia listaussivulla.`,
  ]);
  for (const s of [...data.stadiums].sort((a, b) => a.legacyUrl.localeCompare(b.legacyUrl, "en"))) {
    const notes = [
      `kaupunki-${s.city.slug}${s.city.isNew ? " (uusi)" : ""}`,
      s.images.length === 1 ? "1 kuva" : `${s.images.length} kuvaa`,
      ...(s.needsReview ? [`needsReview: ${s.reviewReasons.join("; ")}`] : []),
      ...s.notes.filter((n) => n.startsWith("nimi normalisoitu")),
    ];
    coverage.push([s.legacyUrl, "migrated", `stadion-${s.slug}`, notes.join("; ")]);
  }
  for (const t of data.tables) {
    const images = t.lisatiedot.filter((b) => b.kind === "image").length;
    coverage.push([
      t.legacyUrl,
      "migrated",
      `jalkapalloTilasto-${t.slug}`,
      `kategoria ${t.category}; ${t.rows.length} riviä, ${images} kuvaa selostuksissa (lisatiedot); uusi slug ${t.slug} — redirect osoittaa nyt ${LIST_PATH}, integraatio päättää`,
    ]);
  }
  await writeFile(COVERAGE, `${coverage.map((r) => r.join("\t")).join("\n")}\n`, "utf-8");

  const imageCount = stadiums.reduce((n, s) => n + (s.images?.length ?? 0), 0);
  console.log(`
Uusia kaupunkeja ........ ${cities.length} (${cities.map((c) => c._id).join(", ")})
Stadioneja .............. ${stadiums.length}
  kuvia ................. ${imageCount}
  tarkistettavia ........ ${stadiums.filter((s) => s.needsReview).length}
Tilastoja ............... ${tables.length}
Dokumentteja yhteensä ... ${docs.length}
Kattavuusrivejä ......... ${coverage.length - 1}

Kirjoitettu: ${OUT}
             ${COVERAGE}

Tuonti:
  npx sanity dataset import data/migration-stadionit.ndjson development --replace`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
