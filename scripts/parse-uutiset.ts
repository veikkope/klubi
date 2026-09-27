/**
 * Purkaa vanhan sivuston uutisarkiston (kommentit*.htm, blogi*.htm,
 * kommentitvenaja*.htm) yksittäisiksi päivätyiksi merkinnöiksi.
 *
 * Ajo:    `npx tsx scripts/parse-uutiset.ts`
 * Lähde:  data/raw-html/{kommentit,Kommentit,blogi}*.htm, otsikkoarkisto.htm
 * Tulos:  data/normalized/uutiset.json                 merkinnät
 *         data/normalized/uutiset-report.json          määrät, jäsennysprosentti, syyt
 *         data/normalized/uutiset-otsikkoarkisto.json  otsikkoarkiston Blogspot-linkit
 *         data/normalized/uutiset-kuvat-dropped.json   liittämättä jääneet kuvat
 *
 * Tulos on CMS-riippumaton: Sanity-import tehdään erillisessä adapterissa
 * (`scripts/import-uutiset.ts`), kuten ravintoloilla.
 *
 * Sivujen rakenne (docs/12 §3 M1, data/family-notes.md):
 *
 *   [kuva] OTSIKKO (lihavoitu)
 *   leipäteksti <br> leipäteksti …
 *   (lähde pp.kk.vvvv / Kuva pp.kk.vvvv kuvaus)      ← kommentit: lähderivi
 *   / pp.kk.vvvv (Kuva pp.kk.vvvv kuvaus)            ← blogi: päivärivi
 *
 * Päivä-/lähderivi PÄÄTTÄÄ merkinnän. Siksi jäsennys tehdään kahdessa
 * vaiheessa: ensin sivu litistetään riveiksi (<br>/kappale), sitten rivit
 * pilkotaan merkinnöiksi päätösrivien kohdalta. Päiväys otetaan AINA
 * päätösriviltä — ei tiedostonimestä (blogi2017.htm sisältää vuoden 2020
 * merkintöjä) eikä leipätekstistä ("Teplicen (26.03.2005) järkytys").
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { load } from "cheerio";
import type { AnyNode, Element } from "domhandler";

import type { KuvaRecord } from "./download-images";
import { decodeHtml } from "./lib/decode-html";
import { localImageName } from "./lib/image-names";
import { fold } from "./lib/match-image-owner";

const RAW_DIR = join(process.cwd(), "data", "raw-html");
const NORMALIZED = join(process.cwd(), "data", "normalized");
const OUT_FILE = join(NORMALIZED, "uutiset.json");
const REPORT_FILE = join(NORMALIZED, "uutiset-report.json");
const ARCHIVE_FILE = join(NORMALIZED, "uutiset-otsikkoarkisto.json");
const DROPPED_FILE = join(NORMALIZED, "uutiset-kuvat-dropped.json");
const IMAGE_INVENTORY = join(NORMALIZED, "kuvat.json");

/** Uutisarkiston vuosisivut. Otsikkoarkisto käsitellään erikseen. */
const SOURCE_FILE = /^(kommentit|blogi)[a-z0-9]*\.htm$/i;
const ARCHIVE_PAGE = "otsikkoarkisto.htm";

/** pp.kk.vvvv sallien lähteen kirjoitusvirheet: "31.01,2012", "5.9.2023", "07 .02.2008". */
const DATE_SRC = String.raw`(\d{1,2})\s?\.\s?(\d{1,2})\s?[.,]\s?((?:19|20)\d{2})`;
const DATE = new RegExp(DATE_SRC);
/** Kuukausi/vuosi ilman päivää: "6/2010". */
const MONTH_YEAR = /\b(\d{1,2})\/((?:19|20)\d{2})\b/;

// ─── Tyypit ────────────────────────────────────────────────────────────────

/** Tekstipätkä muotoiluineen. CMS-riippumaton vastine Portable Textin spanille. */
export interface Span {
  text: string;
  strong?: boolean;
  em?: boolean;
  href?: string;
}

export interface Block {
  style: "normal" | "h3";
  spans: Span[];
}

export interface UutinenImage {
  /** Alkuperäinen src sellaisenaan. */
  src: string;
  /** Tiedostonimi data/images/-kansiossa. */
  file: string;
  /** Alkuperäinen alt-attribuutti, jos kuvaava. */
  originalAlt: string | null;
  /** Kuvateksti lähteestä (kuvan alla oleva rivi tai lähderivin "Kuva …"-osa). */
  caption: string | null;
  /** Käsin kirjoitettu kuvaus (vain IMAGE_ONLY_ENTRIES-pilapiirrokset). */
  describedAlt: string | null;
}

export interface Uutinen {
  /** Vanha vuosisivu, esim. "kommentit2008q1.htm". */
  sourcePage: string;
  /** Merkinnän järjestys sivulla (0 = ylin). */
  position: number;
  kind: "kommentit" | "blogi" | "venaja";
  title: string;
  /** Otsikko johdettu tekstistä, koska lähteessä ei ole otsikkoa. */
  titleDerived: boolean;
  /** ISO-päivä (yyyy-mm-dd) päätösriviltä, tai varapäiväys tiedostonimestä. */
  date: string | null;
  /** true = päiväys merkinnän omalta päivä-/lähderiviltä. */
  dateFromSource: boolean;
  /** Päätösrivi sellaisenaan — tarkistusta varten. */
  dateLine: string | null;
  /** Lähteen nimi lähderiviltä, esim. "ESS" tai "palloliitto.fi". */
  sourceName: string | null;
  /**
   * Tiivistelmä (≤ 300 merkkiä) leipätekstin ensimmäisistä KOKONAISISTA
   * virkkeistä sanatarkasti (docs/12 §2.1.6). null = lähteessä ei ole sopivaa
   * virkettä → merkintä on tarkistettava ("tiivistelmä puuttuu").
   */
  tiivistelma: string | null;
  /**
   * Muut vuosisivut, joilla sama merkintä on (kommentit2017 ja kommentit2018
   * jakavat tammikuun 2018). `sourcePage` on pääsivu; nämä ohjataan samaan.
   */
  otherSourcePages: string[];
  blocks: Block[];
  images: UutinenImage[];
  categories: string[];
  needsReview: boolean;
  reviewReasons: string[];
}

export interface OtsikkoarkistoLinkki {
  title: string;
  /** Otsikkoarkiston luokitus: KLUBI, HISTORIA, RUOKAILU, … */
  tag: string | null;
  date: string | null;
  url: string;
  needsReview: boolean;
  reviewReasons: string[];
}

// ─── Koodaus ───────────────────────────────────────────────────────────────

/**
 * `<meta charset>` ei ole luotettava (docs: family-notes §0.1): yhdeksän sivua
 * ilmoittaa us-ascii mutta on UTF-8:aa, mm. Kommentit2022. Tiukka UTF-8 ensin,
 * muuten windows-1252 — toimii kaikille 197 tiedostolle.
 */
// decodeHtml: scripts/lib/decode-html.ts (yhteinen, oikea windows-1252-taulukko).

function normalizeText(s: string): string {
  return s
    .replace(/[   ]/g, " ")
    .replace(/[​­]/g, "")
    .normalize("NFC");
}

// ─── Vaihe 1: sivu → rivit ─────────────────────────────────────────────────

interface Run {
  text: string;
  bold: boolean;
  italic: boolean;
  small: boolean;
  href?: string;
}

interface ImgToken {
  src: string;
  alt: string;
}

interface Line {
  runs: Run[];
  images: ImgToken[];
  /** Rivi alkaa uudesta kappaleesta (<p>/<div> tai tyhjä rivi edellä). */
  paraStart: boolean;
}

interface Ctx {
  bold: boolean;
  italic: boolean;
  small: boolean;
  href?: string;
}

const BLOCK_TAGS = new Set([
  "p", "div", "table", "tbody", "tr", "td", "th", "h1", "h2", "h3", "h4", "h5", "h6",
  "li", "ul", "ol", "center", "blockquote", "pre", "hr", "dl", "dt", "dd",
]);

/** Sisarsivujen linkkilista sivun yläosassa: "Kommentit 2005", "Blogi2010q1", "ETUSIVU". */
function isNavLink(href: string, text: string): boolean {
  const h = href.trim().toLowerCase();
  const t = text.replace(/\s+/g, " ").trim().toLowerCase();
  if (/^(https?:\/\/(www\.)?lahdensuomalainenklubi\.com\/?)$/.test(h)) return true;
  // Linkki toiselle vuosisivulle, teksti "Kommentit 2005" / "Blogi2010q1" / "Kommentit Venäjä 2007".
  if (/^\/?(kommentit|blogi)[a-z0-9]*\.htm$/.test(h)) {
    return t === "" || (t.length <= 40 && /^(kommentit|blogi)\b|^(kommentit|blogi)\d/.test(t));
  }
  return t === "etusivu";
}

function linesFromHtml(html: string): Line[] {
  const $ = load(html);
  $("script, style, head, noscript").remove();

  // Navigaatiolinkit pois ennen jäsennystä.
  $("a[href]").each((_, a) => {
    const $a = $(a);
    if (isNavLink($a.attr("href") ?? "", $a.text())) {
      // Kuva voi olla navigaatiolinkin sisällä (blogi2017) — säilytetään se.
      const imgs = $a.find("img");
      if (imgs.length) $a.replaceWith(imgs);
      else $a.remove();
    }
  });

  const lines: Line[] = [];
  let cur: Line = { runs: [], images: [], paraStart: true };
  let pendingPara = true;

  const flush = (forcePara: boolean) => {
    const hasText = cur.runs.some((r) => r.text.trim());
    if (hasText || cur.images.length) {
      lines.push(cur);
      pendingPara = false;
    } else if (lines.length) {
      // Tyhjä rivi = kappaleraja.
      pendingPara = true;
    }
    if (forcePara) pendingPara = true;
    cur = { runs: [], images: [], paraStart: pendingPara };
  };

  const walk = (node: AnyNode, ctx: Ctx) => {
    if (node.type === "text") {
      const raw = normalizeText((node as unknown as { data: string }).data);
      const text = raw.replace(/\s+/g, " ");
      if (!text) return;
      if (!text.trim() && cur.runs.length === 0) return;
      cur.runs.push({ text, bold: ctx.bold, italic: ctx.italic, small: ctx.small, href: ctx.href });
      return;
    }
    if (node.type !== "tag" && node.type !== "script" && node.type !== "style") return;
    const el = node as Element;
    const name = el.name.toLowerCase();

    if (name === "br") {
      flush(false);
      return;
    }
    if (name === "img") {
      const src = (el.attribs.src ?? "").trim();
      if (src) {
        cur.images.push({ src, alt: normalizeText(el.attribs.alt ?? "").replace(/\s+/g, " ").trim() });
      }
      return;
    }

    const next: Ctx = { ...ctx };
    if (name === "b" || name === "strong") next.bold = true;
    if (name === "i" || name === "em") next.italic = true;
    if (name === "small") next.small = true;
    if (name === "big") next.small = ctx.small; // <small><small><big> on yhä pientä
    if (name === "font") {
      const size = (el.attribs.size ?? "").trim();
      if (size === "1" || size === "-1" || size === "-2") next.small = true;
      else if (size) next.small = false;
    }
    if (name === "a" && el.attribs.href) next.href = el.attribs.href.trim();
    const style = (el.attribs.style ?? "").toLowerCase();
    if (/font-weight:\s*(bold|[6-9]00)/.test(style)) next.bold = true;
    if (/font-weight:\s*(normal|[1-4]00)/.test(style)) next.bold = false;
    if (/font-style:\s*italic/.test(style)) next.italic = true;
    if (/^h[1-6]$/.test(name)) next.bold = true;

    const block = BLOCK_TAGS.has(name);
    if (block) flush(true);
    for (const child of el.children) walk(child, next);
    if (block) flush(true);
  };

  const body = $("body").first();
  const roots = body.length ? body.toArray() : $.root().toArray();
  // blogi2017.htm sisältää koko sivun kahdesti (toinen <html> keskellä) —
  // cheerio yhdistää ne yhdeksi bodyksi, duplikaatit poistetaan myöhemmin.
  for (const root of roots) {
    for (const child of (root as Element).children) walk(child, { bold: false, italic: false, small: false });
  }
  flush(true);

  // Siivotaan rivien välilyönnit.
  for (const line of lines) {
    const runs = line.runs;
    while (runs.length && !runs[0].text.trim()) runs.shift();
    while (runs.length && !runs[runs.length - 1].text.trim()) runs.pop();
    if (runs.length) {
      runs[0] = { ...runs[0], text: runs[0].text.replace(/^\s+/, "") };
      const last = runs.length - 1;
      runs[last] = { ...runs[last], text: runs[last].text.replace(/\s+$/, "") };
    }
  }
  return lines;
}

function lineText(line: Line): string {
  return line.runs.map((r) => r.text).join("");
}

/** Onko tekstiväli [from, to) kokonaan pientä fonttia? */
function isSmallRange(line: Line, from: number, to: number): boolean {
  let pos = 0;
  let sawText = false;
  for (const run of line.runs) {
    const start = pos;
    const end = pos + run.text.length;
    pos = end;
    if (end <= from || start >= to) continue;
    const overlap = run.text.slice(Math.max(0, from - start), Math.min(run.text.length, to - start));
    if (!overlap.trim()) continue;
    sawText = true;
    if (!run.small) return false;
  }
  return sawText;
}

function isAllBold(line: Line): boolean {
  const withText = line.runs.filter((r) => r.text.trim());
  return withText.length > 0 && withText.every((r) => r.bold);
}

/** Pilkkoo rivin runit merkkikohdasta: [alku, loppu]. */
function splitRuns(runs: Run[], at: number): [Run[], Run[]] {
  const head: Run[] = [];
  const tail: Run[] = [];
  let pos = 0;
  for (const run of runs) {
    const start = pos;
    const end = pos + run.text.length;
    pos = end;
    if (end <= at) head.push(run);
    else if (start >= at) tail.push(run);
    else {
      head.push({ ...run, text: run.text.slice(0, at - start) });
      tail.push({ ...run, text: run.text.slice(at - start) });
    }
  }
  return [head, tail];
}

// ─── Vaihe 2: päätösrivien tunnistus ───────────────────────────────────────

interface Terminator {
  /** Päätösosan alku rivin tekstissä. */
  start: number;
  raw: string;
  date: string;
  sourceName: string | null;
  /** "Kuva …"-osa, josta tulee kuvateksti. */
  photoNote: string | null;
  /** Lähteessä vain kuukausi ja vuosi ("HS KUUKAUSILIITE 6/2010") → päivä on kuun 1. */
  monthOnly?: boolean;
}

function isoFromMatch(m: RegExpExecArray | RegExpMatchArray): string | null {
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const d = new Date(Date.UTC(yyyy, mm - 1, dd));
  if (d.getUTCDate() !== dd || d.getUTCMonth() !== mm - 1) return null;
  return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

function cleanSourceName(raw: string): string | null {
  const s = raw
    .replace(/^[\s/(.,:-]+|[\s/).,:-]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return s.length >= 2 && /[A-Za-zÅÄÖåäö]/.test(s) ? s : null;
}

function cleanPhotoNote(raw: string): string | null {
  const s = raw
    .replace(/^[\s/(]+|[\s/)]+$/g, "")
    .replace(/^(kuvassa|kuvat|kuva)\s*:?\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  return s.length >= 3 ? s : null;
}

/**
 * Tulkitsee sulkujen sisällön lähderiviksi: "ess 29.03.2008 / kuva 17.11.2007",
 * "24.12.2006 ESS", "Uusi Lahti / Tommi Berg 15.04.2009", "palloliitto.fi .17.11.2021".
 * Palauttaa null, jos sisältö näyttää leipätekstin sulkeelta.
 */
function parseSourceParen(content: string, small: boolean) {
  const parts = content.split(/\s\/\s|\s\/|\/\s/);
  const srcIdx = parts.findIndex((p) => DATE.test(p) && !/^\s*kuv/i.test(p));
  if (srcIdx === -1) {
    // Aikakauslehti kuukauden tarkkuudella: "(HS KUUKAUSILIITE 6/2010)".
    const my = parts.length === 1 ? MONTH_YEAR.exec(content) : null;
    if (my && !/^\s*kuv/i.test(content)) {
      const name = cleanSourceName(content.replace(my[0], " "));
      const month = Number(my[1]);
      if (name && month >= 1 && month <= 12 && name.length <= 40 && !/,/.test(name)) {
        return {
          date: `${my[2]}-${String(month).padStart(2, "0")}-01`,
          sourceName: name,
          photoNote: null,
          monthOnly: true,
        };
      }
    }
    // Blogin "(Kuva 02.06.2008 …)" ilman lähdettä ei ole päätösrivi yksinään.
    return null;
  }
  const srcPart = parts[srcIdx];
  const m = DATE.exec(srcPart)!;
  const before = srcPart.slice(0, m.index);
  const after = srcPart.slice(m.index + m[0].length);
  const prefix = parts.slice(0, srcIdx).join(" / ");
  // Lähteen nimi on lyhyt; pitkä teksti päivän ympärillä on leipätekstiä.
  if (before.length > 45 || after.trim().length > 30 || prefix.length > 30) return null;
  if (DATE.test(after)) return null;
  // Lähteen nimessä ei ole pilkkuja eikä " - "-viivoja; kuvatekstissä on:
  // "(Teemu Tainio, HJK - FC København 27.11.2014)".
  if (/,|\s[-–]\s/.test(`${prefix} ${before} ${after}`)) return null;
  const date = isoFromMatch(m);
  if (!date) return null;
  const sourceName = cleanSourceName(`${prefix} ${before} ${after}`);
  // Pelkkä "(26.03.2005)" leipätekstissä ei ole lähderivi — ellei se ole pientä fonttia.
  if (!sourceName && !small) return null;
  const photo = parts.slice(srcIdx + 1).join(" / ");
  return { date, sourceName, photoNote: photo ? cleanPhotoNote(photo) : null };
}

/**
 * Etsii rivin lopusta päätösosan. Päätösosa on aina rivin lopussa (sen
 * jälkeen tulee <br> tai kappaleraja), joten ehdokkaita ovat vain rivin
 * viimeiset "(" ja "/" -kohdat.
 */
function findTerminator(line: Line): Terminator | null {
  const text = lineText(line);
  if (!DATE.test(text) && !MONTH_YEAR.test(text)) return null;
  const trimmed = text.replace(/[\s.]+$/, "");

  const starts: number[] = [];
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === "(" || trimmed[i] === "/") starts.push(i);
  }

  // Aikaisin kelpaava aloituskohta voittaa, jotta "/ 12.06.2008 (Kuva …)" otetaan kokonaan.
  for (const start of starts) {
    const tail = trimmed.slice(start);
    if (tail.length > 320) continue;
    const small = isSmallRange(line, start, trimmed.length);

    // (B) blogi: "/ 12.06.2008" + valinnainen "(Kuva …)"
    const slash = new RegExp(String.raw`^\/\s*${DATE_SRC}\s*(\((.*)\))?\s*$`).exec(tail);
    if (slash) {
      const date = isoFromMatch(slash);
      if (!date) continue;
      const before = trimmed.slice(0, start).trim();
      // "Lucas Hradecky / 12.10.2018" (koko rivi pientä, lyhyt) on kuvateksti, ei päätösrivi.
      if (before && small && isSmallRange(line, 0, start) && before.length < 120) continue;
      return {
        start,
        raw: tail,
        date,
        sourceName: null,
        photoNote: slash[5] ? cleanPhotoNote(slash[5]) : null,
      };
    }

    // (A) kommentit: "(lähde pp.kk.vvvv / Kuva …)" tai "/ (ESS 16.04.2008)"
    const paren = /^\/?\s*\(([^()]*)\)\s*$/.exec(tail);
    if (paren) {
      const parsed = parseSourceParen(paren[1], small);
      if (parsed) return { start, raw: tail, ...parsed };
      continue;
    }

    // (C) blogi 2012: "(Kuva 08.09.2012 Jari Litmanen Olympiastadion) 25.09.2012"
    //     ja blogi2012q2: "(Kuvat: 14.03.2011 / FC Lahti - MyPa, …) / 14.04.2012"
    const photoThenDate = new RegExp(String.raw`^\/?\s*\(([^()]*)\)\s*\/?\s*${DATE_SRC}\s*$`).exec(tail);
    if (photoThenDate) {
      const date = isoFromMatch([photoThenDate[0], photoThenDate[2], photoThenDate[3], photoThenDate[4]]);
      if (!date) continue;
      return { start, raw: tail, date, sourceName: null, photoNote: cleanPhotoNote(photoThenDate[1]) };
    }
  }
  return null;
}

// ─── Vaihe 3: rivit → merkinnät ────────────────────────────────────────────

interface RawEntry {
  lines: Line[];
  terminator: Terminator | null;
}

function segment(lines: Line[]): { entries: RawEntry[]; trailing: Line[] } {
  const entries: RawEntry[] = [];
  let buf: Line[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let term = findTerminator(line);

    // Lähderivi voi katketa <br>:llä keskeltä: "(Uusi Lahti 16.01.2008 / kuva Kisapuisto" <br> "06.01.2007)".
    if (!term && i + 1 < lines.length) {
      const text = lineText(line);
      const open = text.lastIndexOf("(");
      if (open > -1 && text.indexOf(")", open) === -1 && text.length - open < 120) {
        const nextText = lineText(lines[i + 1]);
        if (/^[^()]{0,80}\)\s*\.?$/.test(nextText)) {
          const joined: Line = {
            runs: [...line.runs, { ...line.runs[line.runs.length - 1], text: " " }, ...lines[i + 1].runs],
            images: [...line.images, ...lines[i + 1].images],
            paraStart: line.paraStart,
          };
          const t2 = findTerminator(joined);
          if (t2) {
            line = joined;
            term = t2;
            i += 1;
          }
        }
      }
    }

    if (!term) {
      buf.push(line);
      continue;
    }

    const [head] = splitRuns(line.runs, term.start);
    const headLine: Line = { runs: head, images: line.images, paraStart: line.paraStart };
    // Pudotetaan päätösosan edeltä jäänyt "/" tai ":" leipätekstin lopusta.
    const last = headLine.runs[headLine.runs.length - 1];
    if (last) last.text = last.text.replace(/[\s/]+$/, "");
    if (headLine.runs.some((r) => r.text.trim()) || headLine.images.length) buf.push(headLine);
    entries.push({ lines: buf, terminator: term });
    buf = [];
  }
  return { entries, trailing: buf };
}

// ─── Vaihe 4: merkinnän rakenne ────────────────────────────────────────────

/** Sivun otsikkorivi ennen ensimmäistä merkintää: "Kommentit 2005:", "Venäjän jalkapallon kommentit:". */
const PAGE_HEADER = /^(kommentit\s*\d{4}\s*:?|venäjän jalkapallon\s*kommentit\s*:?|venäjän jalkapallon|kommentit\s*:?|blogi\s*\d{0,4}\s*:?|jalkapallo ja kommentit\s*:?)$/i;

interface FloatingImage extends ImgToken {
  caption: string | null;
  /** Kuva on heti edellisen päätösrivin perässä ilman kappalerajaa → kuuluu edelliseen merkintään. */
  glued: boolean;
}

/** Kuvan alla oleva pienellä kirjoitettu rivi: "Sami Hyypiä 20.08.2008", "Kuva: 23.08.2009 …". */
function isCaptionLine(line: Line): boolean {
  const text = lineText(line).trim();
  if (!text || text.length > 160) return false;
  if (/^kuv(a|at|assa)\s*:?/i.test(text) && DATE.test(text)) return true;
  if (/^\(kuv/i.test(text)) return true;
  if (!isSmallRange(line, 0, text.length)) return false;
  return DATE.test(text) || text.length < 80;
}

function captionText(line: Line): string | null {
  return cleanPhotoNote(lineText(line).replace(/^\(|\)$/g, ""));
}

/**
 * Erottaa merkinnän alusta ja lopusta kuvat ja kuvatekstit. Palauttaa
 * "kelluvat" kuvat, joiden omistaja (edellinen vai seuraava merkintä)
 * ratkaistaan myöhemmin sisällön perusteella.
 */
function extractImages(lines: Line[]): { content: Line[]; images: FloatingImage[] } {
  const images: FloatingImage[] = [];
  const content: Line[] = [];
  let lastImages: FloatingImage[] = [];

  for (const [idx, line] of lines.entries()) {
    const text = lineText(line).trim();
    const lineImages = line.images.map((img) => ({
      ...img,
      caption: null as string | null,
      glued: idx === 0 && !line.paraStart,
    }));
    if (lineImages.length) {
      images.push(...lineImages);
      lastImages = lineImages;
    }
    if (!text) continue;
    // Kuvateksti välittömästi kuvan jälkeen. Normaalikokoinen päivätty rivi on
    // kuvateksti vain, jos sitä seuraa lihavoitu otsikko (Kommentit2022:
    // kuva → "Tanska - Suomi 12.6.2021" → otsikko).
    const next = lines[idx + 1];
    const plainCaption =
      text.length < 100 && DATE.test(text) && !isAllBold(line) && next !== undefined && isAllBold(next);
    if (lastImages.length && (isCaptionLine(line) || plainCaption)) {
      const caption = captionText(line);
      for (const img of lastImages) if (!img.caption) img.caption = caption;
      lastImages = [];
      continue;
    }
    lastImages = lineImages.length && !text ? lineImages : [];
    content.push({ ...line, images: [] });
  }
  return { content, images };
}

function isNoiseImage(src: string): boolean {
  // Laskurit, välikkeet ja ulkoiset seurantakuvat eivät ole sisältöä.
  return /(counter|spacer|pixel|blank|google-analytics|urchin)/i.test(src) || /^data:/i.test(src);
}

function wordsOf(text: string): Set<string> {
  const out = new Set<string>();
  for (const w of text.split(/[^A-Za-zÅÄÖåäöØøÆæÜüÉé0-9]+/)) {
    const f = fold(w);
    if (f.length >= 4 && !/^\d+$/.test(f)) out.add(f);
  }
  return out;
}

/** Tiedostonimen sanat: "090823FCLahtiHJKLitmanenRiihilahti.jpg" → fclahti, litmanen, riihilahti … */
function fileWords(file: string): Set<string> {
  const base = file.replace(/\.[a-z0-9]+$/i, "").replace(/\d+/g, " ");
  const spaced = base.replace(/([a-zåäö])([A-ZÅÄÖ])/g, "$1 $2");
  return wordsOf(spaced);
}

function overlapScore(imageWords: Set<string>, text: string): number {
  if (imageWords.size === 0) return 0;
  const folded = fold(text);
  let score = 0;
  for (const w of imageWords) if (folded.includes(w)) score += w.length;
  return score;
}

// ─── Leipäteksti → lohkot ──────────────────────────────────────────────────

function mergeSpans(spans: Span[]): Span[] {
  const out: Span[] = [];
  for (const s of spans) {
    if (!s.text) continue;
    const prev = out[out.length - 1];
    if (prev && !!prev.strong === !!s.strong && !!prev.em === !!s.em && prev.href === s.href) {
      prev.text += s.text;
    } else {
      out.push({ ...s });
    }
  }
  // Välilyönnit rivien liitoskohdista ja lohkon reunoilta.
  for (const s of out) s.text = s.text.replace(/\s+/g, " ");
  if (out.length) {
    out[0].text = out[0].text.replace(/^\s+/, "");
    out[out.length - 1].text = out[out.length - 1].text.replace(/\s+$/, "");
  }
  return out.filter((s) => s.text.length > 0);
}

function runsToSpans(runs: Run[], blockAllBold: boolean): Span[] {
  return runs.map((r) => {
    const span: Span = { text: r.text };
    if (r.bold && !blockAllBold && r.text.trim()) span.strong = true;
    if (r.italic && r.text.trim()) span.em = true;
    if (r.href && r.text.trim()) span.href = r.href;
    return span;
  });
}

const SENTENCE_END = /[.!?:;"”»)…]$/;

/**
 * Rivit kappaleiksi. FrontPage-sivuilla yksi <br> on yleensä kappaleraja,
 * mutta sähköpostista liitetyissä teksteissä (kommentit2005 Hyypiän kolumni)
 * jokainen rivi on katkaistu <br>:llä keskeltä virkettä. Tällaiset rivit
 * liitetään yhteen: edellinen ei pääty välimerkkiin ja seuraava alkaa pienellä.
 */
function linesToBlocks(lines: Line[]): Block[] {
  const paragraphs: Run[][] = [];
  let cur: Run[] | null = null;
  let prevText = "";
  for (const line of lines) {
    const text = lineText(line).trim();
    if (!text || !/[\p{L}\p{N}]/u.test(text)) continue;
    const continues =
      cur !== null && !line.paraStart && !SENTENCE_END.test(prevText) && /^[a-zåäö]/.test(text);
    if (continues && cur) {
      cur.push({ text: " ", bold: false, italic: false, small: false }, ...line.runs);
    } else {
      cur = [...line.runs];
      paragraphs.push(cur);
    }
    prevText = text;
  }

  const blocks: Block[] = [];
  for (const runs of paragraphs) {
    const line: Line = { runs, images: [], paraStart: true };
    const allBold = isAllBold(line);
    const text = lineText(line).replace(/\s+/g, " ").trim();
    const spans = mergeSpans(runsToSpans(runs, allBold));
    if (!spans.length) continue;
    // Kokonaan lihavoitu lyhyt rivi leipätekstin keskellä = väliotsikko.
    // Haastattelujen lihavoidut kysymykset ("Mitä leikkauksessa korjattiin?")
    // eivät ole otsikoita: ne jäävät leipätekstiksi lihavoituina.
    const heading = allBold && text.length <= 100 && !/[.,?:!]$/.test(text);
    if (allBold && !heading) {
      blocks.push({ style: "normal", spans: mergeSpans(runsToSpans(runs, false)) });
      continue;
    }
    blocks.push({ style: heading ? "h3" : "normal", spans });
  }
  return blocks;
}

function blocksText(blocks: Block[]): string {
  return blocks.map((b) => b.spans.map((s) => s.text).join("")).join("\n");
}

// ─── Tiivistelmä ───────────────────────────────────────────────────────────

const SUMMARY_MAX = 300;
/** Virkeraja: välimerkki (+ lainaus/sulku) + välilyönti + iso kirjain/lainaus/viiva. */
const SENTENCE_SPLIT = /(?<=[.!?]["”»)]*)\s+(?=[A-ZÅÄÖ"”–-])/;
const SENTENCE_COMPLETE = /[.!?]["”»)]*$/;
/** Piste, joka ei pääty virkettä: "esim. FC Lahti", "J. Litmanen", "klo 18.". */
const ABBREVIATION_END = /(?:^|\s)(?:esim|mm|ym|ns|n|ks|vrt|klo|jne|tms|yms|vs|ts|os|synt|pj|puh|tri|prof|jr|st|dr|mr|[A-ZÅÄÖ])\.$/i;

/**
 * Tiivistelmä leipätekstin ensimmäisistä kokonaisista virkkeistä sanatarkasti,
 * enintään 300 merkkiä (docs/12 §2.1.6). Ei katkaista kesken virkkeen eikä
 * lisätä mitään. Palauttaa null, jos ensimmäinen virke ei ole kokonainen
 * asiavirke (liian lyhyt, ei pääty välimerkkiin tai on yli 300 merkkiä).
 */
function deriveSummary(blocks: Block[]): string | null {
  const text = blocks
    .filter((b) => b.style === "normal")
    .map((b) => b.spans.map((s) => s.text).join(""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;

  const sentences: string[] = [];
  for (const piece of text.split(SENTENCE_SPLIT)) {
    const prev = sentences[sentences.length - 1];
    if (prev !== undefined && ABBREVIATION_END.test(prev)) sentences[sentences.length - 1] = `${prev} ${piece}`;
    else sentences.push(piece);
  }

  // Lainaus voi sisältää useita virkkeitä ("Mitä vielä. Yrittivät …") — tiivistelmä
  // ei saa päättyä kesken lainauksen, joten hyväksytään vain tasapainoiset kohdat.
  const quotesBalanced = (s: string) =>
    (s.match(/["”“]/g)?.length ?? 0) % 2 === 0 && (s.match(/«/g)?.length ?? 0) === (s.match(/»/g)?.length ?? 0);

  let out = "";
  let best = "";
  for (const s of sentences) {
    if (!SENTENCE_COMPLETE.test(s)) break;
    const next = out ? `${out} ${s}` : s;
    if (next.length > SUMMARY_MAX) break;
    out = next;
    if (quotesBalanced(out)) best = out;
  }
  // Vähintään yksi kokonainen asiavirke: ei pelkkää "Kiitos!"-tyyppistä huudahdusta.
  if (!best || best.length < 25 || best.split(" ").length < 4) return null;
  return best;
}

// ─── Otsikko ───────────────────────────────────────────────────────────────

/**
 * Otsikko on merkinnän ensimmäinen kokonaan lihavoitu rivi (tai rivin
 * lihavoitu alku). Jos lihavointia ei ole, lyhyt ensimmäinen rivi, joka ei
 * pääty pisteeseen, on otsikko (Kommentit2021, "HYYPIÄN KOLUMNI: Katkeraa").
 * Muuten otsikkoa ei ole lähteessä — johdetaan ensimmäisestä virkkeestä ja
 * merkitään tarkistettavaksi.
 */
/** Otsikossa ei ole virkerajaa keskellä ("…leikkauksesta. Miten leikkaus meni?"). */
function looksLikeTitle(text: string, bold = false): boolean {
  if (text.length < 3 || text.length > 150) return false;
  // Lihavoidussa otsikossa huutomerkki kesken on tavallinen
  // ("Bayern München on lyöty! Lukas Hradecký torjui Saksan cupin voiton").
  return bold ? !/[.?]\s+[A-ZÅÄÖ"”-]/.test(text) : !/[.!?]\s+[A-ZÅÄÖ"”-]/.test(text);
}

function takeTitle(content: Line[]): { title: string; derived: boolean; truncated: boolean; rest: Line[] } {
  // Pelkkiä välimerkkejä sisältävät rivit (".") ovat FrontPage-jäänteitä.
  const lines = content.filter((l) => /[\p{L}\p{N}]/u.test(lineText(l)));
  if (!lines.length) return { title: "", derived: true, truncated: false, rest: [] };

  // Kokonaan lihavoidut peräkkäiset rivit alussa (otsikko + alaotsikko).
  const boldLines: string[] = [];
  let idx = 0;
  while (idx < lines.length && idx < 3 && isAllBold(lines[idx])) {
    const t = lineText(lines[idx]).replace(/\s+/g, " ").trim();
    if (!looksLikeTitle(t, true)) break;
    if (boldLines.join(" ").length + t.length > 200) break;
    boldLines.push(t);
    idx += 1;
  }
  if (boldLines.length && idx < lines.length) {
    return { title: joinTitle(boldLines), derived: false, truncated: false, rest: lines.slice(idx) };
  }

  // Rivin lihavoitu alku: "<b>Otsikko</b> Leipäteksti…"
  const first = lines[0];
  const firstRuns = first.runs;
  let boldPrefix = "";
  let cut = 0;
  for (const r of firstRuns) {
    if (!r.text.trim()) {
      boldPrefix += r.text;
      cut += r.text.length;
      continue;
    }
    if (!r.bold) break;
    boldPrefix += r.text;
    cut += r.text.length;
  }
  const bp = boldPrefix.replace(/\s+/g, " ").trim();
  if (bp.length >= 8 && looksLikeTitle(bp, true) && cut < lineText(first).length) {
    const [, tail] = splitRuns(firstRuns, cut);
    return {
      title: joinTitle([bp]),
      derived: false,
      truncated: false,
      rest: [{ runs: tail, images: [], paraStart: true }, ...lines.slice(1)],
    };
  }

  const firstText = lineText(first).replace(/\s+/g, " ").trim();
  if (
    lines.length > 1 &&
    firstText.length <= 120 &&
    looksLikeTitle(firstText) &&
    !/[.,;]$/.test(firstText) &&
    !/^[-–]/.test(firstText) &&
    // Katkaistu virke jatkuu seuraavalla rivillä pienellä kirjaimella → ei otsikko.
    !/^[a-zåäö]/.test(lineText(lines[1]).trim())
  ) {
    return { title: joinTitle([firstText]), derived: false, truncated: false, rest: lines.slice(1) };
  }

  // Ei otsikkoa lähteessä: ensimmäinen virke, enintään ~90 merkkiä sanarajaan.
  const derived = deriveTitle(firstText);
  return { title: derived.title, derived: true, truncated: derived.truncated, rest: lines };
}

function joinTitle(parts: string[]): string {
  return parts
    .join(" ")
    .replace(/\s+-\s+/g, " – ")
    .replace(/\s+/g, " ")
    .replace(/[:\s]+$/, "")
    .trim();
}

/**
 * Otsikko ensimmäisestä virkkeestä sanatarkasti. Jos virke on yli 90 merkkiä,
 * se lyhennetään sanarajaan ja merkitään "…" — lyhennetyt otsikot merkitään
 * tarkistettaviksi, kokonaiset virkkeet eivät (ne ovat lähdetekstiä sellaisenaan).
 */
function deriveTitle(text: string): { title: string; truncated: boolean } {
  // Virkeraja: piste + välilyönti + iso kirjain. Ei katkaista "9.8.1947"- tai "FC:n"-kohdista.
  const sentence = /^(.{10,}?[.!?])(?=\s+[A-ZÅÄÖ"”-]|\s*$)/.exec(text)?.[1] ?? text;
  const cleaned = sentence.replace(/^[-–"”\s]+/, "").replace(/[.]$/, "").trim();
  if (cleaned.length <= 90) return { title: cleaned, truncated: false };
  const cutAt = cleaned.lastIndexOf(" ", 88);
  const head = cleaned.slice(0, cutAt > 40 ? cutAt : 88).replace(/[\s,;:–-]+$/, "");
  return { title: `${head}…`, truncated: true };
}

// ─── Kategoriat ────────────────────────────────────────────────────────────

/**
 * Kategoriat vain yksiselitteisistä osumista (docs/12 §3 M1). Uutisarkisto on
 * jalkapallokommentaaria, mutta "jalkapallo" annetaan vain kun teksti sen
 * osoittaa — ei oleteta sivun perusteella.
 */
const FOOTBALL = /\b(jalkapallo\w*|huuhkaj\w*|maajoukkue\w*|veikkausliig\w*|karsin\w*|palloliit\w*|fc lahti\w*|fc lahde\w*|mm-kis\w*|em-kis\w*|valioliig\w*|bundesliig\w*|mestarien liig\w*|a-maaottel\w*|maaottel\w*)\b/i;
const EVENT = /\b(vappu\w*|mölky\w*|mölkky\w*|vuosikokou\w*|jouluruokailu\w*|kesäjuhl\w*)\b/i;

function deriveCategories(kind: Uutinen["kind"], title: string, text: string): string[] {
  const out = new Set<string>();
  if (kind === "blogi") out.add("blogi");
  const all = `${title}\n${text}`;
  if (kind === "venaja" || FOOTBALL.test(all)) out.add("jalkapallo");
  if (EVENT.test(title)) out.add("tapahtumaraportti");
  return [...out];
}

// ─── Sivun jäsennys ────────────────────────────────────────────────────────

interface PageResult {
  entries: Uutinen[];
  droppedImages: { page: string; src: string; reason: string }[];
  undatedBlocks: number;
  duplicatesRemoved: number;
  terminatorsFound: number;
  /** Päivämäärän sisältävät rivin loput, joita ei tulkittu päätösriveiksi — tarkistusta varten. */
  suspectLines: string[];
}

/**
 * Merkinnät, joissa lähteessä on pelkkä kuva ja lähderivi — kaikki kolme ovat
 * sanomalehtien pilapiirroksia. Otsikko on piirroksen oma otsikko tai
 * puhekupla, alt kuvailee piirroksen. Kirjoitettu katsomalla kuvat
 * (data/images/), ei arvattu; merkitään silti tarkistettaviksi.
 */
const IMAGE_ONLY_ENTRIES: Record<string, { title: string; alt: string }> = {
  "lahtelaista_skaalattu.jpg": {
    title: "Pilapiirros: Maajoukkueessa neljä pelaajaa Lahdesta",
    alt: "Kerberos-pilapiirros: pelaaja kaatuu pallon perässä ja mies huudahtaa ”Lahtelaista tottakai!”. Otsikko: Maajoukkueessa neljä pelaajaa Lahdesta.",
  },
  "jeremenko_skaalattu.jpg": {
    title: "Pilapiirros: Eremenko – olisin mieluummin venäläinen",
    alt: "Karlssonin pilapiirros baarista: lehden otsikko ”Eremenko: olisin mieluummin venäläinen” ja puhekupla ”Hei, vaihdetaan se Karjalaan.”",
  },
  "pallohallussa070210.jpg": {
    title: "Pilapiirros: Litille puuhataan näköispatsasta",
    alt: "Kerberos-pilapiirros Jari Litmasen näköispatsaasta. Puhekupla: ”Ota mallia Petri! Hänellä on pallo hallussa.”",
  },
};

function kindOf(file: string): Uutinen["kind"] {
  if (/^kommentitvenaja/i.test(file)) return "venaja";
  if (/^blogi/i.test(file)) return "blogi";
  return "kommentit";
}

function parsePage(html: string, file: string, inventory: Map<string, KuvaRecord>): PageResult {
  const lines = linesFromHtml(html);
  if (process.env.DEBUG_PAGE && file.toLowerCase() === process.env.DEBUG_PAGE.toLowerCase()) {
    // Vianetsintä: `DEBUG_PAGE=kommentit2006.htm npx tsx scripts/parse-uutiset.ts`
    for (const l of lines) {
      const t = lineText(l);
      const term = findTerminator(l);
      const flags = `${l.paraStart ? "P" : "-"}${isAllBold(l) ? "B" : "-"}${isSmallRange(l, 0, t.length) ? "S" : "-"}${l.images.length ? `I${l.images.length}` : "  "}`;
      console.log(`${term ? ">>" : "  "} ${flags} ${t.length > 150 ? `${t.slice(0, 70)} … ${t.slice(-70)}` : t}`);
    }
  }
  const { entries: raw, trailing } = segment(lines);
  const kind = kindOf(file);

  // Riippumaton tarkistus: rivit, joiden lopussa on päiväys suluissa tai "/ pp.kk.vvvv",
  // mutta joita ei tunnistettu päätösriveiksi. Nämä käydään raportissa läpi käsin.
  const LOOSE = new RegExp(String.raw`(\([^()]*${DATE_SRC}[^()]*\)|\/\s*${DATE_SRC}[^/]{0,80})\s*\.?\s*$`);
  const suspectLines = lines
    .filter((l) => !findTerminator(l) && LOOSE.test(lineText(l)))
    .map((l) => lineText(l).slice(-120));
  const droppedImages: PageResult["droppedImages"] = [];

  // 1) Rakenne per merkintä. Päiväämätön loppuosa (tekstiä viimeisen
  //    päätösrivin jälkeen, kommentit2013q1) on oma merkintänsä ilman päiväystä.
  interface Work {
    title: string;
    derived: boolean;
    truncated: boolean;
    blocks: Block[];
    leading: FloatingImage[];
    trailing: FloatingImage[];
    inner: FloatingImage[];
    term: Terminator | null;
    reasons: string[];
  }
  const work: Work[] = [];

  const tailExtract = extractImages(trailing);
  const tailHasText = tailExtract.content.some((l) => /[\p{L}\p{N}]/u.test(lineText(l)));
  const groups: RawEntry[] = tailHasText ? [...raw, { lines: trailing, terminator: null }] : raw;

  for (const [i, entry] of groups.entries()) {
    let lines = entry.lines;
    // Sivun otsikkorivi ennen ensimmäistä merkintää.
    if (i === 0) {
      lines = lines.filter((l) => !PAGE_HEADER.test(lineText(l).trim()));
    }
    const { content, images } = extractImages(lines);
    // Kuva on "alussa", jos sitä ennen ei ole muuta tekstiä kuin kuvatekstejä.
    // Alun kuvat voivat kuulua edelliseen merkintään (ratkaistaan vaiheessa 2).
    const leading: FloatingImage[] = [];
    const inner: FloatingImage[] = [];
    let seen = 0;
    let textBefore = false;
    for (const line of lines) {
      for (let k = 0; k < line.images.length; k++) {
        const img = images[seen++];
        if (!img) continue;
        (textBefore ? inner : leading).push(img);
      }
      const t = lineText(line).trim();
      if (t && !isCaptionLine(line)) textBefore = true;
    }

    const { title, derived, truncated, rest } = takeTitle(content);
    const blocks = linesToBlocks(rest);
    const reasons: string[] = [];
    if (truncated) reasons.push("otsikko puuttuu lähteestä — lyhennetty ensimmäisestä virkkeestä");
    if (!entry.terminator) reasons.push("päiväys puuttuu lähteestä — julkaisuaika tiedostonimen vuosineljänneksestä");
    if (entry.terminator?.monthOnly) {
      reasons.push(`lähteessä vain kuukausi ("${entry.terminator.raw}") — päiväksi asetettu kuun 1.`);
    }
    // Kaksi lihavoitua väliotsikkoa samassa merkinnässä = päätösrivi voi puuttua välistä.
    const midHeadings = blocks.filter((b) => b.style === "h3").length;
    if (midHeadings >= 2) reasons.push(`merkinnässä ${midHeadings} väliotsikkoa — voi sisältää useita merkintöjä`);
    work.push({ title, derived, truncated, blocks, leading, trailing: [], inner, term: entry.terminator, reasons });
  }

  // 2) Kelluvat kuvat: merkinnän alussa olevat kuvat voivat kuulua edelliseen
  //    merkintään (kommentit2012q1: kuva + kuvateksti lähderivin JÄLKEEN) tai
  //    tähän (blogi, Kommentit2021: kuva ennen otsikkoa). Ratkaistaan
  //    tiedostonimen, altin ja kuvatekstin sanoista; tasapelissä seuraava
  //    merkintä (yleisin taitto: <img align=left> otsikon edessä).
  const textOf = (w: Work) => `${w.title} ${blocksText(w.blocks)} ${w.term?.photoNote ?? ""}`;
  for (let i = 1; i < work.length; i++) {
    const prev = work[i - 1];
    const cur = work[i];
    const keep: FloatingImage[] = [];
    for (const img of cur.leading) {
      const words = new Set([
        ...fileWords(localImageName(img.src)),
        ...wordsOf(img.alt),
        ...wordsOf(img.caption ?? ""),
      ]);
      const sPrev = overlapScore(words, textOf(prev));
      const sCur = overlapScore(words, textOf(cur));
      // Liimattu kuva (kommentit2012q1: "(mtv3.fi / 15.05.2012)<br><img>") kuuluu aina
      // edelliseen. Muuten edelliseen vain selvällä sanaosumalla: pelkkä osittainen
      // osuma ("aloitus" ~ "aloitusvihellystä") ei riitä siirtoon.
      if (img.glued || (sPrev >= 6 && sPrev > 2 * sCur)) prev.trailing.push(img);
      else keep.push(img);
    }
    cur.leading = keep;
  }

  // Viimeisen päätösrivin jälkeiset kuvat ilman tekstiä kuuluvat viimeiselle merkinnälle.
  if (work.length && !tailHasText) {
    work[work.length - 1].trailing.push(...tailExtract.images);
  } else if (!work.length) {
    for (const img of tailExtract.images) {
      droppedImages.push({ page: file, src: img.src, reason: "sivulla ei tunnistettu merkintöjä" });
    }
  }

  // 3) Valmiit merkinnät.
  const out: Uutinen[] = [];
  const seenKeys = new Set<string>();
  let duplicatesRemoved = 0;
  for (const w of work) {
    const all = [...w.leading, ...w.inner, ...w.trailing];
    const images: UutinenImage[] = [];
    const seenFiles = new Set<string>();
    for (const img of all) {
      const name = localImageName(img.src);
      if (seenFiles.has(name)) continue;
      seenFiles.add(name);
      if (isNoiseImage(img.src)) {
        droppedImages.push({ page: file, src: img.src, reason: "ei sisältökuva (laskuri/välike)" });
        continue;
      }
      const record = inventory.get(name);
      if (!record || !record.ok) {
        droppedImages.push({
          page: file,
          src: img.src,
          reason: record ? `lataus epäonnistui (HTTP ${record.status})` : "ei kuvainventaariossa",
        });
        continue;
      }
      images.push({
        src: img.src,
        file: name,
        originalAlt: img.alt || null,
        caption: img.caption,
        describedAlt: null,
      });
    }
    // Lähderivin "Kuva …"-osa kuvaa merkinnän ensimmäistä kuvatekstitöntä kuvaa.
    if (w.term?.photoNote && images.length) {
      const target = images.find((im) => !im.caption);
      if (target) target.caption = w.term.photoNote;
    }

    let title = w.title;
    let titleDerived = w.derived;
    const reasons = [...w.reasons];

    // Pelkkä kuva + lähderivi (pilapiirrokset): otsikko ja alt nimetystä korjaustaulukosta.
    if (!w.blocks.length) {
      const fix = images.map((im) => IMAGE_ONLY_ENTRIES[im.file]).find(Boolean);
      if (fix && images.length) {
        title = fix.title;
        titleDerived = true;
        const target = images.find((im) => IMAGE_ONLY_ENTRIES[im.file])!;
        target.describedAlt = fix.alt;
        reasons.push("otsikko johdettu kuvasta — pelkkä pilapiirros lähteessä, otsikko ja alt kirjoitettu kuvan sisällöstä");
      } else {
        reasons.push("leipäteksti puuttuu");
      }
    }
    if (!title) reasons.push("otsikko puuttuu");
    if (title.length > 120) reasons.push("otsikko epäilyttävän pitkä");

    const text = blocksText(w.blocks);
    // blogi2017.htm sisältää koko sivun kahdesti → sama merkintä kahteen kertaan.
    const key = `${w.term?.date ?? ""}|${title}|${text.slice(0, 200)}`;
    if (seenKeys.has(key)) {
      duplicatesRemoved += 1;
      continue;
    }
    seenKeys.add(key);

    const date = w.term?.date ?? quarterStart(file);
    if (!date) reasons.push("päiväystä ei voitu päätellä");

    const tiivistelma = deriveSummary(w.blocks);
    if (!tiivistelma) reasons.push("tiivistelmä puuttuu — lähteessä ei kokonaista asiavirkettä (≤ 300 merkkiä)");

    out.push({
      sourcePage: file,
      position: out.length,
      kind,
      title,
      titleDerived,
      date,
      dateFromSource: Boolean(w.term),
      dateLine: w.term?.raw ?? null,
      sourceName: kind === "blogi" ? null : (w.term?.sourceName ?? null),
      tiivistelma,
      otherSourcePages: [],
      blocks: w.blocks,
      images,
      categories: deriveCategories(kind, title, text),
      needsReview: reasons.length > 0,
      reviewReasons: reasons,
    });
  }

  return {
    entries: out,
    droppedImages,
    undatedBlocks: tailHasText ? 1 : 0,
    duplicatesRemoved,
    terminatorsFound: raw.length,
    suspectLines,
  };
}

/** "kommentit2013q1.htm" → "2013-01-01"; q2 → huhtikuu jne. Vain varapäiväys. */
function quarterStart(file: string): string | null {
  const m = /(\d{4})(?:q([1-4]))?/i.exec(file);
  if (!m) return null;
  const month = m[2] ? (Number(m[2]) - 1) * 3 + 1 : 1;
  return `${m[1]}-${String(month).padStart(2, "0")}-01`;
}


// ─── Otsikkoarkisto ────────────────────────────────────────────────────────

/**
 * otsikkoarkisto.htm: "Otsikko / KLUBI 17.07.2026" + linkki. Vain Blogspot-
 * linkit kerätään — sisäisiin .htm-sivuihin osoittavat otsikot ovat jo muiden
 * agenttien sisältöä. Samaa kirjoitusta voi olla listalla kahdesti → URL:n
 * mukaan yksi.
 */
function parseOtsikkoarkisto(html: string): OtsikkoarkistoLinkki[] {
  const $ = load(html);
  const byUrl = new Map<string, OtsikkoarkistoLinkki>();
  $("a[href]").each((_, a) => {
    const href = ($(a).attr("href") ?? "").trim();
    if (!/blogspot\.(com|fi)/i.test(href)) return;
    const url = href.replace(/^http:\/\//i, "https://");
    const text = normalizeText($(a).text()).replace(/\s+/g, " ").trim();
    // "Otsikko / KLUBI 17.07.2026" tai "Otsikko / 17.09.2015 KLUBI"
    const m = new RegExp(String.raw`^(.*?)\s*\/\s*(?:([A-ZÅÄÖ]{3,})\s+)?${DATE_SRC}\s*([A-ZÅÄÖ]{3,})?\s*$`).exec(text);
    const reasons: string[] = [];
    let title = text;
    let tag: string | null = null;
    let date: string | null = null;
    if (m) {
      title = m[1].replace(/[\s/]+$/, "").trim();
      tag = m[2] ?? m[6] ?? null;
      date = isoFromMatch([m[0], m[3], m[4], m[5]]);
    }
    if (!date) reasons.push("päiväys ei jäsenny");
    if (!title) reasons.push("otsikko puuttuu");
    const record: OtsikkoarkistoLinkki = {
      title: title.replace(/\.$/, ""),
      tag,
      date,
      url,
      needsReview: reasons.length > 0,
      reviewReasons: reasons,
    };
    if (!byUrl.has(url)) byUrl.set(url, record);
  });
  return [...byUrl.values()].sort((a, b) =>
    (a.date ?? "").localeCompare(b.date ?? "") || a.url.localeCompare(b.url),
  );
}

// ─── Ajo ───────────────────────────────────────────────────────────────────

async function main() {
  const inventoryList = JSON.parse(await readFile(IMAGE_INVENTORY, "utf-8")) as KuvaRecord[];
  const inventory = new Map(inventoryList.map((k) => [k.file, k]));

  const files = (await readdir(RAW_DIR)).filter((f) => SOURCE_FILE.test(f)).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  );

  const all: Uutinen[] = [];
  const dropped: PageResult["droppedImages"] = [];
  const perPage: Record<
    string,
    { merkintoja: number; tarkistettavia: number; kuvia: number; paivaamatonLoppu: number; duplikaatteja: number; epailyttavatRivit: string[] }
  > = {};
  let undatedTotal = 0;

  for (const file of files) {
    const html = decodeHtml(await readFile(join(RAW_DIR, file)));
    const result = parsePage(html, file, inventory);
    all.push(...result.entries);
    dropped.push(...result.droppedImages);
    undatedTotal += result.undatedBlocks;
    perPage[file] = {
      merkintoja: result.entries.length,
      tarkistettavia: result.entries.filter((e) => e.needsReview).length,
      kuvia: result.entries.reduce((n, e) => n + e.images.length, 0),
      paivaamatonLoppu: result.undatedBlocks,
      duplikaatteja: result.duplicatesRemoved,
      epailyttavatRivit: result.suspectLines,
    };
    console.log(
      `  ${file.padEnd(26)} ${String(result.entries.length).padStart(3)} merkintää` +
        `  (tarkistettavia ${perPage[file].tarkistettavia}, kuvia ${perPage[file].kuvia}` +
        `${result.suspectLines.length ? `, epäilyttäviä rivejä ${result.suspectLines.length}` : ""}` +
        `${result.undatedBlocks ? ", päiväämätön loppu" : ""}${result.duplicatesRemoved ? `, duplikaatteja ${result.duplicatesRemoved}` : ""})`,
    );
  }

  // Sama merkintä voi olla kahdella vuosisivulla (kommentit2017 ja kommentit2018
  // jakavat tammikuun 2018 merkinnät; Rautaruukki-uutinen on sekä kommentit2009q1:
  // ssä että kommentitvenaja:ssa). Pidetään se, jonka tiedostonimen vuosi vastaa
  // merkinnän vuotta; muuten ensimmäinen. Poistettu kirjataan raporttiin.
  const crossDuplicates: { title: string; date: string | null; kept: string; removed: string }[] = [];
  {
    const byKey = new Map<string, Uutinen>();
    const keyOf = (e: Uutinen) =>
      `${e.date}|${fold(e.title)}|${fold(blocksText(e.blocks)).slice(0, 300)}`;
    const yearMatches = (e: Uutinen) => Boolean(e.date && e.sourcePage.includes(e.date.slice(0, 4)));
    for (const e of all) {
      const key = keyOf(e);
      const prev = byKey.get(key);
      if (!prev) {
        byKey.set(key, e);
        continue;
      }
      const keepNew = !yearMatches(prev) && yearMatches(e);
      const kept = keepNew ? e : prev;
      const removed = keepNew ? prev : e;
      // Poistetun sivu (ja sen aiemmin keräämät) jäävät säilytetyn muiksi vanhoiksi
      // osoitteiksi, jotta molemmat vuosisivut tunnetaan tämän merkinnän lähteinä.
      const others = new Set([...kept.otherSourcePages, ...removed.otherSourcePages, removed.sourcePage]);
      others.delete(kept.sourcePage);
      kept.otherSourcePages = [...others].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      byKey.set(key, kept);
      crossDuplicates.push({ title: e.title, date: e.date, kept: kept.sourcePage, removed: removed.sourcePage });
    }
    const keep = new Set(byKey.values());
    const filtered = all.filter((e) => keep.has(e));
    all.length = 0;
    all.push(...filtered);
  }

  const archive = parseOtsikkoarkisto(decodeHtml(await readFile(join(RAW_DIR, ARCHIVE_PAGE))));

  // Jäsennysprosentti: merkinnät, joiden päiväys saatiin omalta päivä-/lähderiviltä,
  // suhteessa kaikkiin merkintöihin (docs/12 §4: alle 90 % → ei importtia).
  const dated = all.filter((e) => e.dateFromSource).length;
  const parseRate = dated / all.length;
  const suspects = Object.values(perPage).reduce((n, p) => n + p.epailyttavatRivit.length, 0);

  const reasonCounts: Record<string, number> = {};
  for (const e of all) {
    for (const r of e.reviewReasons) {
      const key = r.replace(/\d+/g, "N");
      reasonCounts[key] = (reasonCounts[key] ?? 0) + 1;
    }
  }

  const report = {
    sivuja: files.length,
    merkintoja: all.length,
    paivattyja: dated,
    paivaamattomiaTekstiosia: undatedTotal,
    epailyttaviaPaivariveja: suspects,
    jasennysprosentti: Math.round(parseRate * 1000) / 10,
    tarkistettavia: all.filter((e) => e.needsReview).length,
    tarkistusSyyt: reasonCounts,
    tiivistelmia: all.filter((e) => e.tiivistelma).length,
    useallaSivulla: all.filter((e) => e.otherSourcePages.length).length,
    kuvia: all.reduce((n, e) => n + e.images.length, 0),
    kuviaPudotettu: dropped.length,
    sivujenValisetDuplikaatit: crossDuplicates,
    otsikkoarkisto: {
      blogspotLinkkeja: archive.length,
      tarkistettavia: archive.filter((a) => a.needsReview).length,
    },
    sivuittain: perPage,
  };

  await writeFile(OUT_FILE, `${JSON.stringify(all, null, 2)}\n`, "utf-8");
  await writeFile(REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`, "utf-8");
  await writeFile(ARCHIVE_FILE, `${JSON.stringify(archive, null, 2)}\n`, "utf-8");
  await writeFile(DROPPED_FILE, `${JSON.stringify(dropped, null, 2)}\n`, "utf-8");

  console.log(`
Sivuja .................. ${files.length}
Merkintöjä .............. ${all.length}
  päivättyjä ............ ${dated}
  päiväämättömiä osia ... ${undatedTotal}
Epäilyttäviä päivärivejä  ${suspects}  (ks. raportti)
Jäsennysprosentti ....... ${report.jasennysprosentti} %
Tarkistettavia .......... ${report.tarkistettavia}
Kuvia liitetty .......... ${report.kuvia}  (pudotettu ${dropped.length})
Otsikkoarkisto .......... ${archive.length} Blogspot-linkkiä (ei importata oletuksena)

Tallennettu: ${OUT_FILE}
             ${REPORT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
