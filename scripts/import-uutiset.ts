/**
 * Muuntaa jäsennetyt uutisarkiston merkinnät Sanity-tuontitiedostoksi.
 *
 * Ajo:    `npx tsx scripts/import-uutiset.ts`
 *         `npx tsx scripts/import-uutiset.ts --otsikkoarkisto`  (+ Blogspot-tyngät, ks. alla)
 * Lähde:  data/normalized/uutiset.json   (`npx tsx scripts/parse-uutiset.ts`)
 *         data/normalized/kuvat.json     (kuvainventaario)
 * Tulos:  data/migration-uutiset.ndjson
 *
 * Tuonti Sanityyn (AINA development):
 *   npx sanity dataset import data/migration-uutiset.ndjson development --replace
 *
 * Ohut CMS-adapteri kuten `import-ravintolat.ts`: kaikki jäsennys on tehty
 * parserissa, täällä vain muotoillaan Sanityn rakenteeksi.
 *
 * Deterministisyys (docs/12 §1.4): `_id` = `uutinen-<yyyy-mm-dd>-<otsikko>`,
 * Portable Textin `_key`:t johdetaan dokumentin id:stä ja järjestysnumerosta,
 * eikä tulokseen tule aikaleimoja → kaksi ajoa tuottavat tavulleen saman tiedoston.
 *
 * Otsikkoarkiston Blogspot-linkit (≈300) EIVÄT ole oletuksena mukana: päätös
 * tynkien luomisesta on avoin (docs/12, vaiheen 0b raportti). Lippu
 * `--otsikkoarkisto` lisää ne `ulkoinenLinkki`-tynkinä, jos päätös on "kyllä".
 */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { legacyRedirects } from "../lib/redirects";
import type { KuvaRecord } from "./download-images";
import { deriveAltFromFilename } from "./lib/derive-alt";
import { leadSentences } from "./lib/summary";
import type { Block, OtsikkoarkistoLinkki, Span, Uutinen, UutinenImage } from "./parse-uutiset";

const SOURCE = join(process.cwd(), "data", "normalized", "uutiset.json");
const ARCHIVE = join(process.cwd(), "data", "normalized", "uutiset-otsikkoarkisto.json");
const IMAGE_INVENTORY = join(process.cwd(), "data", "normalized", "kuvat.json");
const IMAGES_DIR = join(process.cwd(), "data", "images");
const OUT = join(process.cwd(), "data", "migration-uutiset.ndjson");
const SLUG_REPORT = join(process.cwd(), "data", "normalized", "uutiset-import-report.json");

const OLD_SITE = /^https?:\/\/(www\.)?lahdensuomalainenklubi\.com/i;
const WITH_ARCHIVE = process.argv.includes("--otsikkoarkisto");

// ─── Apurit ────────────────────────────────────────────────────────────────

/** Suomalainen slug: ä→a, ö→o, å→a, pienet kirjaimet, väliviivat. */
function slugify(input: string): string {
  return input
    .normalize("NFC")
    .toLowerCase()
    .replace(/[äåáàâ]/g, "a")
    .replace(/[öøóòô]/g, "o")
    .replace(/[üúù]/g, "u")
    .replace(/[éèê]/g, "e")
    .replace(/æ/g, "ae")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Slug `yyyy-mm-dd-otsikko`, enintään 80 merkkiä sanarajaan (skeeman maxLength). */
function buildSlug(date: string, title: string): string {
  const base = `${date}-${slugify(title)}`;
  if (base.length <= 80) return base;
  const cut = base.lastIndexOf("-", 80);
  return base.slice(0, cut > 20 ? cut : 80).replace(/-+$/, "");
}

function key(seed: string): string {
  return createHash("sha1").update(seed).digest("hex").slice(0, 12);
}

/**
 * Klo 12.00 Suomen aikaa UTC-aikaleimaksi (docs/12 §3 M1). Kesäaika päätellään
 * Intl:n avulla, ei kovakoodata: 29.03.2008 on vielä talviaikaa (+02), 30.03. jo kesäaikaa.
 */
function noonHelsinki(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, 10, 0, 0));
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Helsinki",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(guess);
  const localHour = Number(parts.find((p) => p.type === "hour")?.value ?? "12");
  const offset = localHour - 10; // 2 tai 3
  return new Date(Date.UTC(y, m - 1, d, 12 - offset, 0, 0)).toISOString().replace(".000Z", "Z");
}

function blockPlainText(blocks: Block[]): string {
  return blocks
    .filter((b) => b.style === "normal")
    .map((b) => b.spans.map((s) => s.text).join(""))
    .join(" ");
}

// ─── Linkit ────────────────────────────────────────────────────────────────

const redirectMap = new Map(
  legacyRedirects.map((r) => [r.source.toLowerCase(), r.destination] as const),
);

/**
 * Sisäiset .htm-linkit uusiksi poluiksi `lib/redirects.ts`:n kautta
 * (docs/12 §2.1.3). Tuntematon suhteellinen linkki jätetään pois (teksti säilyy).
 */
function resolveHref(href: string): { href: string | null; note?: string } {
  const h = href.trim();
  if (/^mailto:/i.test(h)) return { href: h };
  if (/^https?:\/\//i.test(h) && !OLD_SITE.test(h)) return { href: h };
  const path = h.replace(OLD_SITE, "").replace(/^\.?\//, "").split("#")[0];
  if (!path) return { href: "/" };
  const target = redirectMap.get(`/${path.toLowerCase()}`);
  if (target) return { href: target };
  return { href: null, note: `linkki ${h} ei ohjaudu mihinkään — linkki poistettu, teksti säilyy` };
}

// ─── Kuvat ─────────────────────────────────────────────────────────────────

/** Alt-tekstin lähde raporttia varten. */
type AltSource = "kuvaus" | "alkuperainen" | "kuvateksti" | "tiedostonimi" | "otsikko";

/** "hodgson070520.jpg" → "070520hodgson.jpg", jotta derive-alt tunnistaa päiväyksen. */
function normalizeFileForAlt(file: string): string {
  const ext = /\.[a-z0-9]+$/i.exec(file)?.[0] ?? "";
  let base = file.slice(0, file.length - ext.length);
  // Blogin tiedostonimien etuliite ("bogi070607huuhkaja", "blogi070225…") ei kuvaa sisältöä.
  base = base.replace(/^(b?l?ogi|blogi|kommentit|kommentti|venaja(?=[a-z]))/i, "");
  // Päiväys lopussa (yymmdd + valinnainen kirjain) → alkuun.
  const tail = /^(.*?)(\d{6})([a-e])?$/i.exec(base);
  if (tail && tail[1]) base = `${tail[2]}${tail[1]}`;
  // Numero kirjainten välissä ("Armenia5jeremenko") → välilyönti.
  base = base.replace(/([a-zåäö])\d{1,2}(?=[a-zåäö])/gi, "$1 ");
  return `${base}${ext}`;
}

/** Onko alt kuvaava: ei tiedostonimeä, ei camelCase-yhdistelmää, ei numerosotkua. */
function isDescriptive(alt: string | null): alt is string {
  if (!alt) return false;
  const a = alt.trim();
  if (a.length < 3) return false;
  if (/\.(jpe?g|png|gif)$/i.test(a)) return false;
  if (!/\s/.test(a) && (/[a-zåäö][A-ZÅÄÖ]/.test(a) || /\d/.test(a))) return false;
  return /[A-Za-zÅÄÖåäö]{3,}/.test(a) && !/^kuva$/i.test(a);
}

/** Tiedosto → ensimmäinen kuvaava kuvateksti tai alt koko aineistosta (täytetään main()-alussa). */
const captionByFile = new Map<string, string>();

/** Kuvateksti kelpaa altiksi, jos siinä on muutakin kuin päiväys. */
function captionAsAlt(caption: string | null): string | null {
  if (!caption) return null;
  const letters = caption.replace(/\d{1,2}\.\d{1,2}\.\d{4}/g, "").replace(/[^A-Za-zÅÄÖåäö]/g, "");
  return letters.length >= 4 ? caption : null;
}

/**
 * Kuvat, joilla lähteessä ei ole alt-tekstiä eikä kuvatekstiä ja joiden
 * tiedostonimi on kuvauksena heikko ("Stadionkirov", "Vielayksimaali").
 * Kirjoitettu katsomalla kuvat (data/images/): kirjojen kannet nimetään kannen
 * tekstin mukaan, valokuvat kuvaillaan sellaisinaan. Ei arvattuja henkilöitä.
 */
const DESCRIBED_ALTS: Record<string, string> = {
  "blogi070225rakasjalkapallo.jpg": "Kirjan Rakas jalkapallo – Sata vuotta suomalaista jalkapalloa kansi, jossa vanha nahkapallo",
  "blogi070701vielayksimaali.jpg": "Mikael Forssellin kirjan Vielä yksi maali kansi",
  "bogi070317liigacup.jpg": "Katsojia seuraamassa Liigacup-ottelua lumisen tekonurmikentän laidalla",
  "bogi070317petrovskii.jpg": "Zenitin lippu ja täysi katsomo Petrovskin stadionilla Pietarissa",
  "bogi070319zenithistoria.jpg": "Venäjänkielisen kirjan Zenit – istorija v litsah kansi",
  "bogi070520hodgsonjasadik.jpg": "Roy Hodgson ja FC Lahden pelaaja kävelevät juoksuradalla Lahden Stadionilla",
  "bogi071013belgiatv.jpg": "Neljä katsojaa seuraa jalkapallo-ottelua televisiosta olohuoneessa",
  "bogi071013suomislovenia21v.jpg": "Suomen ja Slovenian alle 21-vuotiaiden joukkueet rivissä ennen ottelua Lahden Stadionilla",
  "bogi080510zenitbayernmunchen2.jpg": "Zenitin kannattajat liputtavat täydessä katsomossa Zenit – Bayern München -ottelussa",
  "eremenkot070606.jpg": "Aleksei ja Roman Eremenko, pelinumerot 20 ja 32, kentällä selin kameraan",
  "forssell070912b.jpg": "Mikael Forssell lämmittelee pallon kanssa",
  "hiddink.jpg": "Venäjänkielisen kirjan Hiddink: Gus vsemogushchiy kansi, taustalla Moskovan Punainen tori",
  "Jalkapallokirja.jpg": "Matias Strozykin kirjan Jalkapallokirja – Huuhkajien tähdet ja tarina kansi",
  "Kuusysintarina.jpg": "Jukka Airon kirjan Eteenpäin, ylöspäin – FC Kuusysin tarina 1934–2009 kansi",
  "MarkkuKanervaKIRJA.JPG": "Alpo Suhosen ja Risto Pakarisen kirjan Markku Kanerva – Näin valmennan voittajia kansi",
  "MattiHagmanStadinkingi.jpg": "Marko Lempisen kirjan Matti Hagman – Stadin kingi kansi",
  "MeMennaanKisoihin.JPG": "Jussi Eskolan ja Pekka Mäntylän kirjan Me mennään kisoihin kansi, jossa kolme tuulettavaa Huuhkajaa",
  "pallotalvi.jpg": "Keltainen jalkapallo lumihangella",
  "PelicansBlues120409.jpg": "Pelicansin ja Bluesin pelaajat maalin edessä jääkiekko-ottelussa",
  "TampereU110423Ilves.jpg": "Tampere Unitedin kannattajien banderolli ”Tamu ≠ Ilves” katsomossa",
  "TampereU110423oikeusmurha.jpg": "Tampere Unitedin kannattajien banderollit ”Seura kärsii – syylliset eivät” ja ”Poliittinen oikeusmurha”",
};

function resolveAlt(img: UutinenImage, title: string): { alt: string; source: AltSource } {
  if (img.describedAlt) return { alt: img.describedAlt, source: "kuvaus" };
  if (isDescriptive(img.originalAlt)) return { alt: img.originalAlt, source: "alkuperainen" };
  const fromCaption = captionAsAlt(img.caption);
  if (fromCaption) return { alt: fromCaption, source: "kuvateksti" };
  if (DESCRIBED_ALTS[img.file]) return { alt: DESCRIBED_ALTS[img.file], source: "kuvaus" };
  // Sama kuva toisessa merkinnässä kuvatekstin kanssa (hodgson070520, litmanen071117 …).
  const elsewhere = captionByFile.get(img.file);
  if (elsewhere) return { alt: elsewhere, source: "kuvateksti" };
  const derived = deriveAltFromFilename(normalizeFileForAlt(img.file));
  if (derived) {
    // Pelkkä päiväys kuvatekstissä täydentää tiedostonimestä johdettua.
    const date = img.caption && /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(img.caption.trim()) ? img.caption.trim() : null;
    const alt = date && !derived.includes(date) ? `${derived.replace(/, \d{2}\.\d{2}\.\d{4}$/, "")}, ${date}` : derived;
    return { alt, source: "tiedostonimi" };
  }
  return { alt: `Uutisen ”${title}” kuvitus`, source: "otsikko" };
}

function imageField(
  img: UutinenImage,
  title: string,
  keySeed: string | null,
): { value: Record<string, unknown>; altSource: AltSource } {
  const { alt, source } = resolveAlt(img, title);
  const value: Record<string, unknown> = {
    ...(keySeed ? { _key: key(keySeed) } : {}),
    _type: "imageWithAlt",
    _sanityAsset: `image@${pathToFileURL(join(IMAGES_DIR, img.file)).href}`,
    alt: alt.slice(0, 200),
  };
  if (img.caption) value.caption = img.caption;
  return { value, altSource: source };
}

// ─── Portable Text ─────────────────────────────────────────────────────────

function toPortableText(
  docId: string,
  blocks: Block[],
  notes: string[],
): Record<string, unknown>[] {
  return blocks.map((block, bi) => {
    const blockKey = key(`${docId}|b${bi}`);
    const markDefs: { _key: string; _type: "link"; href: string }[] = [];
    const children = block.spans.map((span: Span, si) => {
      const marks: string[] = [];
      if (span.strong) marks.push("strong");
      if (span.em) marks.push("em");
      if (span.href) {
        const resolved = resolveHref(span.href);
        if (resolved.href) {
          let def = markDefs.find((d) => d.href === resolved.href);
          if (!def) {
            def = { _key: key(`${docId}|b${bi}|l${markDefs.length}`), _type: "link", href: resolved.href };
            markDefs.push(def);
          }
          marks.push(def._key);
        } else if (resolved.note) {
          notes.push(resolved.note);
        }
      }
      return { _key: key(`${docId}|b${bi}|s${si}`), _type: "span", text: span.text, marks };
    });
    return { _key: blockKey, _type: "block", style: block.style, markDefs, children };
  });
}

// ─── Dokumentit ────────────────────────────────────────────────────────────

interface ImportStats {
  altSources: Record<AltSource, number>;
  linkNotes: string[];
  slugCollisions: string[];
  futureDates: string[];
  /** Dokumentin tarkistussyyt raporttiin (Sanityssa on vain needsReview-lippu). */
  reviewReasons: Map<string, string[]>;
}

function buildDoc(e: Uutinen, slug: string, stats: ImportStats): Record<string, unknown> {
  const id = `uutinen-${slug}`;
  const reasons = [...e.reviewReasons];
  const notes: string[] = [];

  const body = toPortableText(id, e.blocks, notes);
  stats.linkNotes.push(...notes.map((n) => `${id}: ${n}`));

  // Kuvat: ensimmäinen kansikuvaksi, loput leipätekstin loppuun.
  let coverImage: Record<string, unknown> | undefined;
  e.images.forEach((img, i) => {
    const { value, altSource } = imageField(img, e.title, i === 0 ? null : `${id}|img${i}`);
    stats.altSources[altSource] += 1;
    if (altSource === "otsikko") reasons.push(`kuvan ${img.file} alt johdettu otsikosta — kuvaile kuva`);
    if (i === 0) coverImage = value;
    else body.push(value);
  });

  // Pelkkä kuva lähteessä (pilapiirrokset): leipätekstiksi lähteen oma lähderivi sellaisenaan.
  if (body.length === 0 && e.dateLine) {
    body.push({
      _key: key(`${id}|b0`),
      _type: "block",
      style: "normal",
      markDefs: [],
      children: [{ _key: key(`${id}|b0|s0`), _type: "span", text: e.dateLine.replace(/^\/\s*/, ""), marks: [] }],
    });
  }

  const text = blockPlainText(e.blocks);
  const excerpt = text ? leadSentences(text, 200) : e.dateLine ? `Pilapiirros ${e.dateLine.replace(/^\/\s*/, "")}` : "";
  if (!excerpt) reasons.push("lyhenne puuttuu");
  // Tiivistelmä tulee parserista (kokonaiset virkkeet, docs/12 §2.1.6). Se
  // tallennetaan aina kun se on olemassa — myös kun se on sama kuin lyhenne:
  // lyhenne on listan teaser, tiivistelmä sivun ingressi ja GEO-vastaus.
  // Puuttuva tiivistelmä on jo parserin tarkistussyissä ("tiivistelmä puuttuu").

  if (e.date && e.date > new Date().toISOString().slice(0, 10)) stats.futureDates.push(id);

  const doc: Record<string, unknown> = {
    _id: id,
    _type: "uutinen",
    title: e.title,
    slug: { _type: "slug", current: slug },
    publishedAt: noonHelsinki(e.date!),
    excerpt: excerpt.slice(0, 200),
  };
  if (e.tiivistelma) doc.tiivistelma = e.tiivistelma;
  if (coverImage) doc.coverImage = coverImage;
  doc.body = body;
  if (e.sourceName) doc.lahde = { nimi: e.sourceName };
  if (e.categories.length) doc.categories = e.categories;
  doc.needsReview = reasons.length > 0;
  doc.legacyUrl = `/${e.sourcePage}`;
  // Sama merkintä usealla vuosisivulla (kommentit2017 + kommentit2018): muut sivut
  // ohjautuvat samaan kohteeseen (generate-redirects lukee muutLegacyUrlit-kentän).
  if (e.otherSourcePages.length) doc.muutLegacyUrlit = e.otherSourcePages.map((p) => `/${p}`);
  stats.reviewReasons.set(id, reasons);
  return doc;
}

function buildStub(a: OtsikkoarkistoLinkki, slug: string): Record<string, unknown> {
  const doc: Record<string, unknown> = {
    _id: `uutinen-${slug}`,
    _type: "uutinen",
    title: a.title,
    slug: { _type: "slug", current: slug },
    publishedAt: noonHelsinki(a.date!),
    ulkoinenLinkki: a.url,
    categories: a.tag === "KLUBI" ? [] : a.tag === "HISTORIA" ? ["jalkapallo"] : [],
    needsReview: a.needsReview,
    legacyUrl: "/otsikkoarkisto.htm",
  };
  if ((doc.categories as string[]).length === 0) delete doc.categories;
  return doc;
}

async function main() {
  const source = JSON.parse(await readFile(SOURCE, "utf-8")) as Uutinen[];
  const inventory = JSON.parse(await readFile(IMAGE_INVENTORY, "utf-8")) as KuvaRecord[];
  const okFiles = new Set(inventory.filter((k) => k.ok).map((k) => k.file));
  for (const e of source) {
    for (const img of e.images) {
      const text = captionAsAlt(img.caption) ?? (isDescriptive(img.originalAlt) ? img.originalAlt : null);
      if (text && !captionByFile.has(img.file)) captionByFile.set(img.file, text);
    }
  }

  const stats: ImportStats = {
    altSources: { kuvaus: 0, alkuperainen: 0, kuvateksti: 0, tiedostonimi: 0, otsikko: 0 },
    linkNotes: [],
    slugCollisions: [],
    futureDates: [],
    reviewReasons: new Map(),
  };

  const usedSlugs = new Set<string>();
  const uniqueSlug = (base: string) => {
    let slug = base;
    let n = 2;
    while (usedSlugs.has(slug)) {
      slug = `${base.slice(0, 77)}-${n}`;
      n += 1;
    }
    if (slug !== base) stats.slugCollisions.push(`${base} → ${slug}`);
    usedSlugs.add(slug);
    return slug;
  };

  const lines: string[] = [];
  const mapping: {
    legacyUrl: string;
    muutLegacyUrlit?: string[];
    id: string;
    title: string;
    publishedAt: string;
    needsReview: boolean;
    syyt?: string[];
  }[] = [];
  let skipped = 0;
  for (const e of source) {
    if (!e.date || !e.title) {
      skipped += 1;
      continue;
    }
    const missing = e.images.filter((i) => !okFiles.has(i.file));
    if (missing.length) throw new Error(`Kuva puuttuu inventaariosta: ${missing.map((m) => m.file).join(", ")}`);
    const slug = uniqueSlug(buildSlug(e.date, e.title));
    const doc = buildDoc(e, slug, stats);
    lines.push(JSON.stringify(doc));
    const syyt = stats.reviewReasons.get(doc._id as string) ?? [];
    mapping.push({
      legacyUrl: doc.legacyUrl as string,
      ...(doc.muutLegacyUrlit ? { muutLegacyUrlit: doc.muutLegacyUrlit as string[] } : {}),
      id: doc._id as string,
      title: e.title,
      publishedAt: doc.publishedAt as string,
      needsReview: doc.needsReview as boolean,
      ...(syyt.length ? { syyt } : {}),
    });
  }

  let stubs = 0;
  if (WITH_ARCHIVE) {
    const archive = JSON.parse(await readFile(ARCHIVE, "utf-8")) as OtsikkoarkistoLinkki[];
    for (const a of archive) {
      if (!a.date || !a.title) continue;
      const slug = uniqueSlug(buildSlug(a.date, a.title));
      lines.push(JSON.stringify(buildStub(a, slug)));
      stubs += 1;
    }
  }

  await writeFile(OUT, `${lines.join("\n")}\n`, "utf-8");
  await writeFile(
    SLUG_REPORT,
    `${JSON.stringify({ dokumentteja: lines.length, tynkia: stubs, altLahteet: stats.altSources, slugTormaykset: stats.slugCollisions, linkkihuomiot: stats.linkNotes, tulevaisuudenPaivayksia: stats.futureDates, dokumentit: mapping }, null, 2)}\n`,
    "utf-8",
  );

  const review = mapping.filter((m) => m.needsReview).length;
  console.log(`
Uutisia ................. ${mapping.length}
  tarkistettavia ........ ${review} (${((review / Math.max(1, mapping.length)) * 100).toFixed(1)} %)
  ohitettu .............. ${skipped}
Otsikkoarkiston tyngät .. ${stubs}${WITH_ARCHIVE ? "" : " (ei mukana — lippu --otsikkoarkisto)"}
Kuvien alt-lähteet ...... ${Object.entries(stats.altSources).map(([k, v]) => `${k} ${v}`).join(", ")}
Slug-törmäyksiä ......... ${stats.slugCollisions.length}
Linkkihuomioita ......... ${stats.linkNotes.length}
Tulevaisuuden päiväyksiä  ${stats.futureDates.length}
Rivejä yhteensä ......... ${lines.length}

Kirjoitettu: ${OUT}

Tuonti (development):
  npx sanity dataset import data/migration-uutiset.ndjson development --replace`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
