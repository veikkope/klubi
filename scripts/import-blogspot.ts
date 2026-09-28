/**
 * Muuntaa jäsennetyt Blogspot-kirjoitukset Sanity-tuontitiedostoksi.
 *
 * Ajo:    `npx tsx scripts/import-blogspot.ts`   (osa `npm run migrate:blogspot`)
 * Lähde:  data/normalized/blogspot.json          (`scripts/parse-blogspot.ts`)
 * Tulos:  data/migration-blogspot.ndjson
 *         data/normalized/blogspot-import-report.json   slugit, alt-lähteet, linkit
 *         data/normalized/blogspot-map.json             blogin URL → uusi polku
 *
 * Ohut CMS-adapteri kuten `import-uutiset.ts`: jäsennys on tehty parserissa.
 *
 * Tunnisteet (docs/14 §3):
 *  - `_id` = `uutinen-blogspot-<Bloggerin kirjoitus-id>`. Id ei muutu, vaikka
 *    otsikkoa muokattaisiin blogissa, joten uudelleenajo päivittää saman
 *    dokumentin eikä luo kaksoiskappaletta.
 *  - slug = `yyyy-mm-dd-otsikko` kuten muissa uutisissa. Slug lasketaan
 *    julkaisujärjestyksessä, joten uusi kirjoitus ei muuta vanhojen slugeja.
 *  - Portable Textin `_key`:t johdetaan id:stä → kaksi ajoa, tavulleen sama tiedosto.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { legacyRedirects } from "../lib/redirects";
import { slugify } from "../lib/slugify";
import { deriveAltFromFilename, hasCorruptChars, isJammedCamelCase, looksLikeFilename, splitCamelCase } from "./lib/derive-alt";
import type { BlogspotEntry, BlogspotKommentti, BodyNode, ImageNode, Span } from "./parse-blogspot";

const SOURCE = join(process.cwd(), "data", "normalized", "blogspot.json");
const IMAGES_DIR = join(process.cwd(), "data", "blogspot", "images");
const OUT = join(process.cwd(), "data", "migration-blogspot.ndjson");
const REPORT = join(process.cwd(), "data", "normalized", "blogspot-import-report.json");
const MAP_FILE = join(process.cwd(), "data", "normalized", "blogspot-map.json");
const COMMENTS_SOURCE = join(process.cwd(), "data", "normalized", "blogspot-kommentit.json");
/**
 * Veikkauskirjoitusten vanhat kommentit (docs/15 §5). Oma tiedosto, jotta ne
 * voi tuoda `--missing`-tilassa: isän Studiossa piilottamat pysyvät piilossa.
 */
const COMMENTS_OUT = join(process.cwd(), "data", "migration-blogspot-kommentit.ndjson");
/**
 * Kuvien kuvaukset, kirjoitettu katsomalla kuvat (docs/14 §4). Versionhallinnassa,
 * koska tämä on käsin tarkistettavaa lähdedataa kuten `import-uutiset.ts`:n
 * DESCRIBED_ALTS. Avain = tiedosto `data/blogspot/images/`-kansiossa.
 */
const DESCRIBED_ALTS_FILE = join(process.cwd(), "data", "blogspot-alts.json");

const OLD_SITE = /^https?:\/\/(www\.)?lahdensuomalainenklubi\.com/i;
const BLOG = /^https?:\/\/lahdensuomalainenklubi\.blogspot\.[a-z.]+/i;

// ─── Apurit ────────────────────────────────────────────────────────────────

function key(seed: string): string {
  return createHash("sha1").update(seed).digest("hex").slice(0, 12);
}

/** Slug `yyyy-mm-dd-otsikko`, enintään 80 merkkiä sanarajaan (skeeman maxLength). */
function buildSlug(date: string, title: string): string {
  const base = `${date}-${slugify(title)}`.replace(/-+$/, "");
  if (base.length <= 80) return base;
  const cut = base.lastIndexOf("-", 80);
  return base.slice(0, cut > 20 ? cut : 80).replace(/-+$/, "");
}

/** Blogin osoite vertailuavaimeksi: https, .com, ei kyselyä (?m=1) eikä ankkuria. */
export function blogKey(url: string): string | null {
  const m = BLOG.exec(url.trim());
  if (!m) return null;
  const path = url.trim().slice(m[0].length).split(/[?#]/)[0];
  return path || "/";
}

// ─── Linkit ────────────────────────────────────────────────────────────────

const redirectMap = new Map(legacyRedirects.map((r) => [r.source.toLowerCase(), r.destination] as const));

interface LinkContext {
  /** Blogin polku → uutisen polku. */
  blogPaths: Map<string, string>;
  notes: string[];
}

/**
 * Lähteen linkki uuden sivuston linkiksi:
 *  - blogin oma kirjoitus → `/uutiset/<slug>` (sisäinen linkki säilyy sivustolla)
 *  - blogin haku-, tunniste- ja arkistosivut → `/uutiset`
 *  - vanhan sivuston .htm → ohjauksen kohde (`lib/redirects.ts`)
 *  - muut http(s)- ja mailto-linkit sellaisenaan
 */
function resolveHref(href: string, ctx: LinkContext, docId: string): string | null {
  const h = href.trim().replace(/&amp;/g, "&");
  if (/^mailto:/i.test(h)) return h;
  const blogPath = blogKey(h);
  if (blogPath) {
    const target = ctx.blogPaths.get(blogPath);
    if (target) return target;
    if (/^\/\d{4}\/\d{2}\/[^/]+\.html$/.test(blogPath)) {
      ctx.notes.push(`${docId}: blogin kirjoitusta ${h} ei löydy — linkki ohjattu uutislistaan`);
    }
    return "/uutiset";
  }
  if (OLD_SITE.test(h)) {
    const path = h.replace(OLD_SITE, "").split("#")[0] || "/";
    if (path === "/" || path === "/index.html") return "/";
    const target = redirectMap.get(path.toLowerCase());
    if (target) return target;
    ctx.notes.push(`${docId}: vanhan sivuston linkki ${h} ei ohjaudu mihinkään — linkki poistettu, teksti säilyy`);
    return null;
  }
  if (/^https?:\/\//i.test(h)) return h.replace(/^http:\/\/(www\.youtube\.com|youtu\.be)/i, "https://$1");
  ctx.notes.push(`${docId}: tuntematon linkki ${h} — linkki poistettu, teksti säilyy`);
  return null;
}

// ─── Kuvat ─────────────────────────────────────────────────────────────────

type AltSource = "kuvateksti" | "kuvaus" | "alkuperainen" | "tiedostonimi" | "otsikko";

let describedAlts: Record<string, string> = {};

/** Kuvateksti kelpaa altiksi, jos siinä on muutakin kuin päiväys. */
function captionAsAlt(caption: string | null): string | null {
  if (!caption) return null;
  const letters = caption.replace(/\d{1,2}\.\d{1,2}\.\d{2,4}/g, "").replace(/[^A-Za-zÅÄÖåäö]/g, "");
  return letters.length >= 4 ? caption : null;
}

function isDescriptive(alt: string | null): alt is string {
  if (!alt || alt.trim().length < 3) return false;
  if (looksLikeFilename(alt) || hasCorruptChars(alt)) return false;
  return /[A-Za-zÅÄÖåäö]{3,}/.test(alt) && !/^(kuva|image|photo)$/i.test(alt.trim());
}

/**
 * Alt-tekstin lähteet tärkeysjärjestyksessä:
 *  1. kirjoittajan kuvateksti (lähteen omaa tekstiä)
 *  2. kuvaus, joka on kirjoitettu katsomalla kuva (data/blogspot-alts.json)
 *  3. lähteen alt-attribuutti
 *  4. tiedostonimi ("LahtiMIFK240223.jpg" → "Lahti MIFK, 24.02.2023")
 *  5. kirjoituksen otsikko — merkitään tarkistettavaksi
 */
function resolveAlt(img: ImageNode, title: string): { alt: string; source: AltSource } {
  const fromCaption = captionAsAlt(img.caption);
  if (fromCaption) return { alt: fromCaption, source: "kuvateksti" };
  const described = describedAlts[img.file];
  if (described) return { alt: described, source: "kuvaus" };
  if (isDescriptive(img.originalAlt)) {
    const alt = isJammedCamelCase(img.originalAlt) ? splitCamelCase(img.originalAlt) : img.originalAlt;
    return { alt, source: "alkuperainen" };
  }
  const derived = img.originalName ? deriveAltFromFilename(img.originalName) : null;
  if (derived) {
    const date = img.caption && /^\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(img.caption.trim()) ? img.caption.trim() : null;
    const alt = date && !derived.includes(date) ? `${derived.replace(/, \d{2}\.\d{2}\.\d{4}$/, "")}, ${date}` : derived;
    return { alt, source: "tiedostonimi" };
  }
  return { alt: `Kuva kirjoituksesta ”${title}”`, source: "otsikko" };
}

function imageValue(img: ImageNode, title: string, keySeed: string | null, stats: Stats, reasons: string[]) {
  const { alt, source } = resolveAlt(img, title);
  stats.altSources[source] += 1;
  if (source === "otsikko") reasons.push(`kuvan alt-teksti on johdettu otsikosta — kuvaile kuva (${img.originalName ?? img.file})`);
  const value: Record<string, unknown> = {
    ...(keySeed ? { _key: key(keySeed) } : {}),
    _type: "imageWithAlt",
    _sanityAsset: `image@${pathToFileURL(join(IMAGES_DIR, img.file)).href}`,
    alt: alt.slice(0, 200),
  };
  if (img.caption) value.caption = img.caption;
  return value;
}

// ─── Portable Text ─────────────────────────────────────────────────────────

function textBlock(docId: string, bi: number, style: string, spans: Span[], links: LinkContext) {
  const markDefs: { _key: string; _type: "link"; href: string }[] = [];
  const children = spans.map((span, si) => {
    const marks: string[] = [];
    if (span.strong) marks.push("strong");
    if (span.em) marks.push("em");
    if (span.underline) marks.push("underline");
    if (span.href) {
      const href = resolveHref(span.href, links, docId);
      if (href) {
        let def = markDefs.find((d) => d.href === href);
        if (!def) {
          def = { _key: key(`${docId}|b${bi}|l${markDefs.length}`), _type: "link", href };
          markDefs.push(def);
        }
        marks.push(def._key);
      }
    }
    return { _key: key(`${docId}|b${bi}|s${si}`), _type: "span", text: span.text, marks };
  });
  return { _key: key(`${docId}|b${bi}`), _type: "block", style, markDefs, children };
}

// ─── Dokumentit ────────────────────────────────────────────────────────────

interface Stats {
  altSources: Record<AltSource, number>;
  reviewReasons: Map<string, string[]>;
}

function buildDoc(e: BlogspotEntry, slug: string, links: LinkContext, stats: Stats) {
  const id = `uutinen-blogspot-${e.id}`;
  const reasons = [...e.reviewReasons];

  const body = e.body.map((node: BodyNode, bi) =>
    node.kind === "image"
      ? imageValue(node, e.title, `${id}|img${bi}`, stats, reasons)
      : textBlock(id, bi, node.style, node.spans, links),
  );

  const doc: Record<string, unknown> = {
    _id: id,
    _type: "uutinen",
    title: e.title,
    slug: { _type: "slug", current: slug },
    publishedAt: e.publishedAt,
    excerpt: e.excerpt.slice(0, 200),
  };
  if (e.tiivistelma) doc.tiivistelma = e.tiivistelma;
  if (e.cover) doc.coverImage = imageValue(e.cover, e.title, null, stats, reasons);
  doc.body = body;
  if (e.categories.length) doc.categories = e.categories;
  doc.needsReview = reasons.length > 0;
  doc.blogspot = {
    id: e.id,
    url: e.url,
    polku: e.path,
    ...(e.labels.length ? { tunnisteet: e.labels } : {}),
    kommentteja: e.commentCount,
  };
  stats.reviewReasons.set(id, reasons);
  return doc;
}

async function main() {
  const entries = JSON.parse(await readFile(SOURCE, "utf-8")) as BlogspotEntry[];
  if (existsSync(DESCRIBED_ALTS_FILE)) {
    describedAlts = JSON.parse(await readFile(DESCRIBED_ALTS_FILE, "utf-8")) as Record<string, string>;
  }

  // Slugit julkaisujärjestyksessä: myöhemmin lisätty kirjoitus ei muuta aiempia.
  const ordered = [...entries].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt) || a.id.localeCompare(b.id));
  const usedSlugs = new Set<string>();
  const slugs = new Map<string, string>();
  const collisions: string[] = [];
  for (const e of ordered) {
    const base = buildSlug(e.date, e.title);
    let slug = base;
    for (let n = 2; usedSlugs.has(slug); n += 1) slug = `${base.slice(0, 77)}-${n}`;
    if (slug !== base) collisions.push(`${base} → ${slug}`);
    usedSlugs.add(slug);
    slugs.set(e.id, slug);
  }

  const links: LinkContext = {
    blogPaths: new Map(entries.map((e) => [e.path, `/uutiset/${slugs.get(e.id)}`])),
    notes: [],
  };
  const stats: Stats = {
    altSources: { kuvateksti: 0, kuvaus: 0, alkuperainen: 0, tiedostonimi: 0, otsikko: 0 },
    reviewReasons: new Map(),
  };

  const docs = ordered.map((e) => buildDoc(e, slugs.get(e.id)!, links, stats));
  await writeFile(OUT, `${docs.map((d) => JSON.stringify(d)).join("\n")}\n`, "utf-8");

  const map = ordered.map((e) => ({ url: e.url, polku: e.path, uusi: `/uutiset/${slugs.get(e.id)}` }));
  await writeFile(MAP_FILE, `${JSON.stringify(map, null, 2)}\n`, "utf-8");

  // Kommentit: `_id` = kommentti-blogspot-<Bloggerin kommentti-id>, viittaus uutiseen.
  const kommentit = existsSync(COMMENTS_SOURCE)
    ? (JSON.parse(await readFile(COMMENTS_SOURCE, "utf-8")) as BlogspotKommentti[])
    : [];
  const postIds = new Set(entries.map((e) => e.id));
  const commentDocs = kommentit
    .filter((k) => postIds.has(k.postId))
    .map((k) => ({
      _id: `kommentti-blogspot-${k.id}`,
      _type: "kommentti",
      uutinen: { _type: "reference", _ref: `uutinen-blogspot-${k.postId}` },
      nimi: k.nimi,
      teksti: k.teksti,
      lahetetty: k.publishedAt,
      lahde: "blogspot",
      blogspotId: k.id,
      piilotettu: false,
    }));
  await writeFile(COMMENTS_OUT, `${commentDocs.map((d) => JSON.stringify(d)).join("\n")}\n`, "utf-8");

  const review = docs.filter((d) => d.needsReview);
  await writeFile(
    REPORT,
    `${JSON.stringify(
      {
        dokumentteja: docs.length,
        tarkistettavia: review.length,
        altLahteet: stats.altSources,
        slugTormaykset: collisions,
        linkkihuomiot: links.notes,
        tarkistettavat: review.map((d) => ({
          id: d._id,
          otsikko: d.title,
          syyt: stats.reviewReasons.get(d._id as string),
        })),
      },
      null,
      2,
    )}\n`,
    "utf-8",
  );

  console.log(`
Uutisia (Blogspot) ...... ${docs.length}
  tarkistettavia ........ ${review.length} (${((review.length / docs.length) * 100).toFixed(1)} %)
Kuvien alt-lähteet ...... ${Object.entries(stats.altSources).map(([k, v]) => `${k} ${v}`).join(", ")}
Slug-törmäyksiä ......... ${collisions.length}
Linkkihuomioita ......... ${links.notes.length}

Kommentteja ............. ${commentDocs.length}

Kirjoitettu: ${OUT}
             ${COMMENTS_OUT}
             ${MAP_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
