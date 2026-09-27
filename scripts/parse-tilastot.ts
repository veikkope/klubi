/**
 * Purkaa vanhan sivuston tilastosivut (migraatioagentti M3) rakenteiseksi JSON:iksi.
 *
 * Ajo:    npx tsx scripts/parse-tilastot.ts
 * Lähde:  data/raw-html/<sivu>.htm        (21 sivua, ks. `PAGES`)
 *         data/normalized/kuvat.json      (kuvainventaario)
 * Tulos:  data/normalized/tilastot.json               ← dokumentit, CMS-riippumaton
 *         data/normalized/tilastot-report.json        ← määrät, rivitarkistukset, needsReview-syyt
 *         data/normalized/tilastot-kuvat-dropped.json ← pudotetut kuvat perusteluineen
 *
 * Sopimus: docs/12-sisaltomigraatio.md §2 ja §3 (M2/M3). Tulos on neutraalia
 * JSONia: taulukot ovat `columns` + `rows` (merkkijonotaulukot) ja teksti on
 * yksinkertaisia lohkoja (`RichBlock`). Sanity-muotoon muunnetaan vasta
 * `scripts/import-tilastot.ts`:ssä.
 *
 * Miksi sivukohtainen konfiguraatio eikä yleinen heuristiikka: sivuja on 21 ja
 * jokaisella FrontPage-taulukolla on oma tapansa merkitä otsikko (colspan-rivi,
 * tyhjä välirivi, puuttuva otsikkorivi, rinnakkaiset listat). Eksplisiittinen
 * määritys on tarkistettavissa rivi riviltä — arvaava heuristiikka ei ole.
 * Rivimäärät tarkistetaan silti automaattisesti lähdettä vasten (raportti).
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { load, type CheerioAPI } from "cheerio";
import type { AnyNode, Element } from "domhandler";

import { legacyRedirects } from "../lib/redirects";
import type { KuvaRecord } from "./download-images";
import { decodeHtml } from "./lib/decode-html";
import { countInvisible, normalizeGrid, stripInvisibleDeep, withoutSummaryRows } from "./lib/normalize-cell";
import { localImageName } from "./lib/image-names";

const RAW_DIR = join(process.cwd(), "data", "raw-html");
const OUT_DIR = join(process.cwd(), "data", "normalized");
const INVENTORY = join(OUT_DIR, "kuvat.json");

/** Nykyhetki migraation näkökulmasta: tätä myöhemmät vuodet ovat paikkamerkkejä. */
const CURRENT_YEAR = 2026;

// ---------------------------------------------------------------------------
// Tyypit (neutraali muoto, jota import-tilastot.ts lukee)
// ---------------------------------------------------------------------------

export type ColumnType = "text" | "number" | "date" | "year" | "link";

export interface TilastoColumn {
  key: string;
  label: string;
  type: ColumnType;
}

export interface RichSpan {
  text: string;
  bold?: true;
  italic?: true;
  href?: string;
}

/** Mistä kuvan alt-teksti on peräisin — raportoidaan ja tarkistetaan. */
export type AltLahde = "lahde" | "kuvateksti" | "kuvateksti-nimi" | "konfiguraatio" | "tiedostonimi";

export interface ImageBlock {
  type: "image";
  /** Paikallinen tiedostonimi data/images/-kansiossa. */
  file: string;
  src: string;
  alt: string;
  altLahde: AltLahde;
  caption?: string;
}

export type RichBlock =
  | { type: "paragraph"; spans: RichSpan[] }
  | { type: "heading"; text: string }
  | ImageBlock;

export interface DroppedRow {
  reason: string;
  cells: string[];
}

export interface Tilasto {
  slug: string;
  title: string;
  category: string;
  /** Vanha sivu ilman kauttaviivaa, esim. "suomi.htm". */
  sourcePage: string;
  legacyUrl: string;
  jarjestys: number;
  tiivistelma?: string;
  paivitetty?: string;
  intro: RichBlock[];
  lisatiedot: RichBlock[];
  kuvat: ImageBlock[];
  columns: TilastoColumn[];
  /** Rivit sarakkeiden järjestyksessä; tyhjä solu = "". */
  rows: string[][];
  rowCheck?: {
    /** Lähdetaulukon indeksi sivulla (0 = ensimmäinen <table>). */
    sourceTables: number[];
    /** Lähdetaulukon kaikki <tr>-rivit. */
    sourceRows: number;
    /** Otsikko-, sarakeotsikko- ja selitterivit (eivät ole dataa). */
    nonDataRows: number;
    /** Pudotetut rivit perusteluineen (tyhjät, paikkamerkit). */
    droppedRows: DroppedRow[];
    /** Muunnoksen kuvaus, jos rivit eivät vastaa lähteen rivejä 1:1. */
    transform?: string;
  };
  needsReview: boolean;
  reviewReasons: string[];
  /** Huomiot raporttiin (ei Sanityyn). */
  notes: string[];
}

export interface DroppedImage {
  page: string;
  src: string;
  reason: string;
}

// ---------------------------------------------------------------------------
// Merkistö ja tekstin normalisointi
// ---------------------------------------------------------------------------

/**
 * `<meta charset>` ei ole luotettava (data/family-notes.md §0.1): yritetään
 * tiukkaa UTF-8:aa ja pudotaan windows-1252:een. Toimii kaikille 197 sivulle.
 */
// decodeHtml: scripts/lib/decode-html.ts (yhteinen, oikea windows-1252-taulukko).


/** NBSP, pehmeät tavuviivat ja nollanleveät merkit pois, Unicode NFC:ksi. */
function cleanText(s: string): string {
  return s
    .normalize("NFC")
    .replace(/\u00a0/g, " ")
    .replace(/[\u00ad\u200b\u200c\u200d\u2060\ufeff]/g, "")
    .replace(/\u2028|\u2029/g, " ");
}

function collapse(s: string): string {
  return cleanText(s).replace(/\s+/g, " ").trim();
}

/** Vertailuavain: pienet kirjaimet, ei ääkkösiä eikä välimerkkejä. */
function fold(input: string): string {
  return input
    .toLowerCase()
    .replace(/[äåá]/g, "a")
    .replace(/[öó]/g, "o")
    .replace(/[üú]/g, "u")
    .replace(/é/g, "e")
    .replace(/[^a-z0-9]/g, "");
}

/** Suomalainen slug: ä→a, ö→o, pienet kirjaimet, väliviivat. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[äåá]/g, "a")
    .replace(/[öó]/g, "o")
    .replace(/[üú]/g, "u")
    .replace(/é/g, "e")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const DATE_RE = /\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/;
const DATE_RE_G = /\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g;

/** "26.09.2026" → "2026-09-26", tai null jos ei kelvollinen päivä. */
function toIsoDate(finnish: string): string | null {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(finnish.trim());
  if (!m) return null;
  const [, d, mo, y] = m;
  const dd = d.padStart(2, "0");
  const mm = mo.padStart(2, "0");
  const date = new Date(`${y}-${mm}-${dd}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getUTCDate() !== Number(d) || date.getUTCMonth() + 1 !== Number(mo)) return null;
  return `${y}-${mm}-${dd}`;
}

// ---------------------------------------------------------------------------
// Sisäiset linkit
// ---------------------------------------------------------------------------

const redirectMap = new Map(
  legacyRedirects.map((r) => [r.source.toLowerCase(), r.destination]),
);

let droppedLinkCount = 0;

/**
 * Vanha `.htm`-linkki → uusi polku `lib/redirects.ts`:n kautta (docs/12 §2.1.3).
 * is.fi:n hakulinkit ovat lainatun uutistekstin tägilinkkejä (kopioitu
 * artikkelin mukana), eivät lähteitä → linkki pudotetaan, teksti säilyy.
 */
function resolveHref(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const href = raw.trim();
  if (!href || href.startsWith("#") || /^javascript:/i.test(href)) return undefined;
  if (/^https?:\/\/(www\.)?is\.fi\/haku\//i.test(href)) {
    droppedLinkCount += 1;
    return undefined;
  }
  const local = href.replace(/^https?:\/\/(www\.)?lahdensuomalainenklubi\.com/i, "");
  const own = /^(?:\.\/|\/)?([^:?#]+\.html?)(?:[?#].*)?$/i.exec(local);
  if (own) {
    const target = redirectMap.get(`/${own[1]}`.toLowerCase());
    if (target) return target;
    droppedLinkCount += 1;
    return undefined;
  }
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href;
  droppedLinkCount += 1;
  return undefined;
}

// ---------------------------------------------------------------------------
// DOM → token-virta
// ---------------------------------------------------------------------------

type Token =
  | { t: "text"; text: string; bold: boolean; italic: boolean; href?: string }
  | { t: "br" }
  | { t: "block" }
  | { t: "img"; src: string; alt: string }
  | { t: "table"; index: number };

const SKIP_TAGS = new Set(["script", "style", "noscript", "head", "title", "meta", "link", "iframe", "object", "embed", "form", "input", "select", "button"]);
const BLOCK_TAGS = new Set(["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ul", "ol", "blockquote", "center", "tr", "dl", "dt", "dd", "hr", "pre", "section", "article", "header", "footer", "address"]);

/** Facebookin emoji-kuvat (`5️⃣4️⃣` = sijoitus 54) muunnetaan takaisin tekstiksi. */
function emojiText(alt: string): string {
  return alt.replace(/[️⃣]/g, "");
}

function tokenize($: CheerioAPI, root: AnyNode, tableIndex: Map<Element, number>): Token[] {
  const tokens: Token[] = [];

  const walk = (node: AnyNode, ctx: { bold: boolean; italic: boolean; href?: string }) => {
    if (node.type === "text") {
      const text = (node as unknown as { data: string }).data;
      if (text) tokens.push({ t: "text", text, bold: ctx.bold, italic: ctx.italic, href: ctx.href });
      return;
    }
    if (node.type !== "tag" && node.type !== "script" && node.type !== "style") {
      if ("children" in node) for (const c of (node as Element).children) walk(c, ctx);
      return;
    }
    const el = node as Element;
    const name = el.name.toLowerCase();
    if (SKIP_TAGS.has(name)) return;

    if (name === "br") {
      tokens.push({ t: "br" });
      return;
    }
    if (name === "img") {
      const src = $(el).attr("src") ?? "";
      const alt = $(el).attr("alt") ?? "";
      if (/emoji\.php/i.test(src)) {
        tokens.push({ t: "text", text: emojiText(alt), bold: ctx.bold, italic: ctx.italic });
      } else {
        tokens.push({ t: "img", src, alt });
      }
      return;
    }
    if (name === "table") {
      const index = tableIndex.get(el);
      if (index !== undefined) {
        tokens.push({ t: "table", index });
        return;
      }
    }

    const next = { ...ctx };
    if (name === "b" || name === "strong") next.bold = true;
    if (name === "i" || name === "em") next.italic = true;
    const style = ($(el).attr("style") ?? "").toLowerCase();
    if (/font-weight:\s*(bold|[6-9]00)/.test(style)) next.bold = true;
    if (/font-weight:\s*(normal|[1-4]00)/.test(style)) next.bold = false;
    if (name === "a") {
      const href = resolveHref($(el).attr("href"));
      if (href) next.href = href;
    }

    const isBlock = BLOCK_TAGS.has(name);
    if (isBlock) tokens.push({ t: "block" });
    for (const c of el.children) walk(c, next);
    if (isBlock) tokens.push({ t: "block" });
  };

  walk(root, { bold: false, italic: false });
  return tokens;
}

// ---------------------------------------------------------------------------
// Token-virta → lohkot
// ---------------------------------------------------------------------------

interface RawImage {
  kind: "img";
  src: string;
  alt: string;
}
interface RawPara {
  kind: "para";
  lines: RichSpan[][];
}
type RawItem = RawImage | RawPara;

function lineText(line: RichSpan[]): string {
  return line.map((s) => s.text).join("");
}

/** Yhdistää vierekkäiset samoin merkinnöin olevat spanit ja siistii välilyönnit. */
function normalizeLine(spans: RichSpan[]): RichSpan[] {
  const merged: RichSpan[] = [];
  for (const s of spans) {
    const text = cleanText(s.text).replace(/\s+/g, " ");
    if (!text) continue;
    const prev = merged[merged.length - 1];
    if (prev && prev.bold === s.bold && prev.italic === s.italic && prev.href === s.href) {
      prev.text += text;
    } else {
      merged.push({ ...s, text });
    }
  }
  // Välilyönnit spanien rajoilla: ei tuplia, ei alkuun eikä loppuun.
  for (let i = 1; i < merged.length; i += 1) {
    if (merged[i - 1].text.endsWith(" ") && merged[i].text.startsWith(" ")) {
      merged[i].text = merged[i].text.slice(1);
    }
  }
  if (merged.length) {
    merged[0].text = merged[0].text.replace(/^\s+/, "");
    const last = merged[merged.length - 1];
    last.text = last.text.replace(/\s+$/, "");
  }
  return merged.filter((s) => s.text.length > 0).map((s) => {
    const out: RichSpan = { text: s.text };
    if (s.bold) out.bold = true;
    if (s.italic) out.italic = true;
    if (s.href) out.href = s.href;
    return out;
  });
}

/**
 * Kappale = `<p>`/`<div>` tai kaksi peräkkäistä `<br>`:ää. Yksittäinen `<br>`
 * on rivinvaihto kappaleen sisällä (FrontPage-listat "1) Belgia 1773 …").
 */
function itemize(tokens: Token[]): RawItem[] {
  const items: RawItem[] = [];
  let line: RichSpan[] = [];
  let para: RichSpan[][] = [];
  let pendingBreaks = 0;

  const endLine = () => {
    const norm = normalizeLine(line);
    line = [];
    if (norm.length) para.push(norm);
    return norm.length > 0;
  };
  const endPara = () => {
    endLine();
    if (para.length) items.push({ kind: "para", lines: para });
    para = [];
    pendingBreaks = 0;
  };

  for (const tok of tokens) {
    if (tok.t === "text") {
      if (!tok.text.trim() && line.length === 0) {
        // Pelkkä tyhjä tila rivin alussa ei katkaise br-ketjua.
        continue;
      }
      line.push({ text: tok.text, bold: tok.bold || undefined, italic: tok.italic || undefined, href: tok.href } as RichSpan);
      pendingBreaks = 0;
    } else if (tok.t === "br") {
      const hadText = endLine();
      pendingBreaks = hadText ? 1 : pendingBreaks + 1;
      if (pendingBreaks >= 2) endPara();
    } else if (tok.t === "block") {
      endPara();
    } else if (tok.t === "img") {
      endPara();
      items.push({ kind: "img", src: tok.src, alt: tok.alt });
    }
  }
  endPara();
  return items;
}

// ---------------------------------------------------------------------------
// Kuvat: inventaario, alt-tekstit, kuvatekstit
// ---------------------------------------------------------------------------

let inventoryByFile = new Map<string, KuvaRecord>();
let inventoryByUrl = new Map<string, KuvaRecord>();
const droppedImages: DroppedImage[] = [];

function lookupImage(src: string): KuvaRecord | undefined {
  const bySrc = inventoryByFile.get(localImageName(src));
  if (bySrc) return bySrc;
  return inventoryByUrl.get(src.trim());
}

/**
 * Alt-tekstit, joita lähteessä ei ole eikä kuvatekstistä saa. Jokainen on
 * kirjoitettu kuvan näkyvän sisällön ja sivun kontekstin perusteella
 * (kuvat katsottu käsin 2026-09-27) — ei arvattu tiedostonimestä.
 */
const ALT_OVERRIDES: Record<string, string> = {
  "karikuusysi.jpg":
    "Karin pilapiirros: Kuusysin tilausajobussi, jonka kyljessä lukee ”Ei oo Lahden voittanutta” (Helsingin Sanomat 20.03.1986)",
  "bogi070317petrovskii.jpg":
    "Zenitin lippu ja täysi katsomo Petrovski-stadionilla Pietarissa 17.03.2007",
  "RomanEremenkopelipaita181023 (2).JPG":
    "Roman Eremenkon Spartak Moskovan pelipaita numero 26 pukukopissa, 23.10.2018",
  // Artikkelin lopun lähderivi: "mtv3.fi 17.05.2008 / Kuva 16.08.2008 Peter Enckelman".
  "enckelman070816.jpg": "Peter Enckelman 16.08.2008",
  // lupaavia.htm: kuvateksti "28.07.2008 Teemu Turunen ja Jani Tanska FC KooTeePee
  // [NBSP-rivi] Veli Lampi 22.08.2008 ja 10.09.2008" — nimet erottaa vain
  // välilyöntirivi, jota automaattinen pilkkominen ei tunnista.
  "lupaavia080728tanska.jpg": "Jani Tanska, FC KooTeePee, 28.07.2008",
  "lampi080822.jpg": "Veli Lampi, 22.08.2008",
  "lampi080910.jpg": "Veli Lampi, 10.09.2008",
  // Kuvatekstissä kirjoitusvirhe "Roman Eremeno"; tiedostonimi ja sivun taulukko: Eremenko.
  "eremenkoroman080602A.jpg": "Roman Eremenko, 02.06.2008",
};

/**
 * Sivukohtaiset alt-kuviot. maailmanparhaat.htm: osalla vuosikuvista on
 * lähteessä alt "Maailman paras avaus 2022", osalla ei mitään — puuttuvat
 * täydennetään samalla kaavalla tiedostonimen vuodesta.
 */
const ALT_PATTERNS: { page: string; file: RegExp; alt: (m: RegExpExecArray) => string }[] = [
  { page: "maailmanparhaat.htm", file: /^Maailmanparasavaus(\d{4})/i, alt: (m) => `Maailman paras avaus ${m[1]}` },
  { page: "maailmanparhaat.htm", file: /^maailman(?:%20)?parhaat(?:%20)?(\d{4})/i, alt: (m) => `Maailman parhaat jalkapalloilijat ${m[1]}` },
];

function isUsableAlt(alt: string, file: string): boolean {
  const a = collapse(alt);
  if (a.length < 3) return false;
  if (/\.(jpe?g|png|gif|bmp)$/i.test(a)) return false;
  if (fold(a) === fold(file.replace(/\.[a-z]+$/i, ""))) return false;
  if (/^(kuva|image|img|photo)\s*\d*$/i.test(a)) return false;
  if (/Ã|â€|\ufffd/.test(a)) return false;
  return true;
}

/** Tiedostonimen numerot ("260107", "080822") ↔ kuvatekstin päivämäärä. */
function dateMatchesDigits(date: RegExpExecArray, digits: string): boolean {
  const dd = date[1].padStart(2, "0");
  const mm = date[2].padStart(2, "0");
  const yy = date[3].slice(2);
  return digits.includes(`${dd}${mm}${yy}`) || digits.includes(`${yy}${mm}${dd}`) || digits.includes(`${dd}${mm}${date[3]}`);
}

/**
 * Ryhmäkuvateksti ("26.01.2007 Suurhalli: Sebastian Sorsa, …, Mehmet Hetemaj / HJK.")
 * → yhden kuvan alt: etsitään nimi, jonka sana esiintyy tiedostonimessä
 * (`lupaavia260107sorsa.jpg` → "Sebastian Sorsa"). Päivä kuvatekstistä.
 */
function altFromGroupCaption(file: string, caption: string, pageStem: string): string | null {
  const nameLetters = fold(file.replace(/\.[a-z]+$/i, "").replace(/\d+/g, " ")).replace(new RegExp(fold(pageStem), "g"), "");
  const digits = file.replace(/\D+/g, "");
  if (nameLetters.length < 4) return null;

  // Pilkotaan päivämäärien, pilkkujen, kaksoispisteiden, kauttaviivojen ja "ja"-sanan kohdalta.
  const parts: { text: string; date?: string }[] = [];
  let carried: string | undefined;
  for (const piece of caption.split(/(\d{1,2}\.\d{1,2}\.\d{4})/)) {
    if (DATE_RE.test(piece) && /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(piece.trim())) {
      carried = piece.trim();
      continue;
    }
    for (const seg of piece.split(/[,:;/\n]| ja /)) {
      const text = seg.replace(/[.\s]+$/, "").trim();
      if (text) parts.push({ text, date: carried });
    }
  }

  const allDates = [...caption.matchAll(DATE_RE_G)] as RegExpExecArray[];
  const digitDate = allDates.find((d) => dateMatchesDigits(d, digits));

  for (const part of parts) {
    const words = part.text.split(/\s+/).map(fold).filter((w) => w.length >= 4);
    if (words.some((w) => nameLetters.includes(w))) {
      const date = digitDate?.[0] ?? part.date;
      return date ? `${part.text}, ${date}` : part.text;
    }
  }
  return null;
}

/**
 * Viimeinen oljenkorsi: sanat ja päiväys tiedostonimestä. Näin johdetut
 * merkitään dokumenttiin tarkistettaviksi (sama käytäntö kuin derive-alt.ts).
 */
function altFromFilename(file: string, pageStem: string): string | null {
  const stem = file.replace(/\.[a-z]+$/i, "").replace(/%20/g, " ");
  const digits = /(\d{6,8})/.exec(stem)?.[1];
  let date: string | null = null;
  if (digits?.length === 6) {
    const [a, b, c] = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 6)];
    if (Number(b) >= 1 && Number(b) <= 12 && Number(c) >= 1 && Number(c) <= 31) date = `${c}.${b}.20${a}`;
    else if (Number(b) >= 1 && Number(b) <= 12 && Number(a) >= 1 && Number(a) <= 31) date = `${a}.${b}.20${c}`;
  }
  const words = stem
    .replace(/\d+/g, " ")
    .replace(/([a-zåäö])([A-ZÅÄÖ])/g, "$1 $2")
    .split(/[\s_\-()]+/)
    .filter((w) => w.length >= 3 && !/^(bogi|blogi|kuva|img|dsc|jpg|png)$/i.test(w) && fold(w) !== fold(pageStem));
  if (!words.length) return null;
  const text = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return date ? `${text}, ${date}` : text;
}

/** Kuvateksti: lyhyt, päivätty, ei lihavoitu rivi heti kuvan jälkeen. */
function captionCandidate(line: RichSpan[] | undefined): string | null {
  if (!line) return null;
  const text = collapse(lineText(line));
  if (!text || text.length > 220) return null;
  if (line.every((s) => s.bold)) return null;
  if (!/\d{1,2}\.\d{1,2}\.\d{4}/.test(text)) return null;
  return text;
}

interface BlockContext {
  page: string;
  pageStem: string;
  /** Otsikot/tekstit, jotka ovat sivun tai taulukon otsikoita → pudotetaan tekstivirrasta. */
  dropTexts: Set<string>;
  /** Merkitään dokumenttiin, jos alt jouduttiin johtamaan tiedostonimestä. */
  weakAlts: string[];
}

function buildImage(
  raw: RawImage,
  ctx: BlockContext,
  caption: string | null,
  groupSize: number,
  captionLines: string[],
): ImageBlock | null {
  const record = lookupImage(raw.src);
  if (!record) {
    droppedImages.push({
      page: ctx.page,
      src: raw.src,
      reason: /wikimedia\.org/i.test(raw.src)
        ? "Wikimedia-lippukuva, ei inventaariossa; maan nimi säilyy tekstinä"
        : "ei kuvainventaariossa (ulkoinen tai kuollut kuva)",
    });
    return null;
  }
  if (!record.ok) {
    droppedImages.push({ page: ctx.page, src: raw.src, reason: `lataus epäonnistui (HTTP ${record.status})` });
    return null;
  }

  const file = record.file;
  let alt: string | null = null;
  let altLahde: AltLahde = "lahde";

  if (ALT_OVERRIDES[file]) {
    alt = ALT_OVERRIDES[file];
    altLahde = "konfiguraatio";
  }
  if (!alt && isUsableAlt(raw.alt, file)) {
    alt = collapse(raw.alt);
    altLahde = "lahde";
  }
  if (!alt) {
    for (const p of ALT_PATTERNS) {
      const m = p.page === ctx.page ? p.file.exec(file) : null;
      if (m) {
        alt = p.alt(m);
        altLahde = "konfiguraatio";
        break;
      }
    }
  }
  if (!alt && caption) {
    if (groupSize > 1) {
      const named = altFromGroupCaption(file, captionLines.join("\n"), ctx.pageStem);
      if (named) {
        alt = named;
        altLahde = "kuvateksti-nimi";
      }
    }
    if (!alt) {
      alt = caption;
      altLahde = "kuvateksti";
    }
  }
  if (!alt) {
    alt = altFromFilename(file, ctx.pageStem);
    altLahde = "tiedostonimi";
    if (alt) ctx.weakAlts.push(`${file} → "${alt}"`);
  }
  if (!alt) {
    droppedImages.push({ page: ctx.page, src: raw.src, reason: "alt-tekstiä ei voitu muodostaa" });
    return null;
  }

  const block: ImageBlock = {
    type: "image",
    file,
    src: record.src,
    alt: alt.slice(0, 200),
    altLahde,
  };
  return block;
}

/**
 * Muuntaa segmentin raakakohteet lopullisiksi lohkoiksi: kuvaryhmät ja niiden
 * kuvatekstit, lihavoidut otsikkorivit (h3) ja tavalliset kappaleet.
 */
function toBlocks(items: RawItem[], ctx: BlockContext): RichBlock[] {
  const blocks: RichBlock[] = [];

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];

    if (item.kind === "img") {
      // Kuvaryhmä = peräkkäiset kuvat ilman tekstiä välissä.
      const group: RawImage[] = [item];
      while (items[i + 1]?.kind === "img") {
        group.push(items[i + 1] as RawImage);
        i += 1;
      }
      // Sama tiedosto samassa ryhmässä (esim. vuoden 2025 kuva kolmesti
      // paikkamerkkinä vuosille 2026–2027) → vain ensimmäinen.
      const seen = new Set<string>();
      const unique = group.filter((g) => {
        const key = localImageName(g.src);
        if (seen.has(key)) {
          droppedImages.push({ page: ctx.page, src: g.src, reason: "sama kuva toistettu samassa kuvaryhmässä (paikkamerkki)" });
          return false;
        }
        seen.add(key);
        return true;
      });

      // Kuvateksti seuraavan kappaleen alusta: koko lyhyt kappale tai ensimmäinen rivi.
      let caption: string | null = null;
      // Rivijako säilytetään nimien erottelua varten ("… FC KooTeePee" / "Veli Lampi …").
      let captionLines: string[] = [];
      const next = items[i + 1];
      if (next?.kind === "para") {
        const whole = collapse(next.lines.map(lineText).join(" "));
        // Ryhmäkuvatekstissä nimi voi olla lihavoitu, joten lihavointia ei vaadita pois.
        if (whole.length <= 320 && /\d{1,2}\.\d{1,2}\.\d{4}/.test(whole) && next.lines.length <= 4) {
          caption = whole;
          captionLines = next.lines.map((l) => collapse(lineText(l)));
          next.lines = [];
        } else {
          const first = captionCandidate(next.lines[0]);
          if (first) {
            caption = first;
            captionLines = [first];
            next.lines = next.lines.slice(1);
          }
        }
      }

      const built = unique
        .map((g) => buildImage(g, ctx, caption, unique.length, captionLines))
        .filter((b): b is ImageBlock => b !== null);
      if (caption && built.length) built[built.length - 1].caption = caption;
      blocks.push(...built);
      continue;
    }

    const lines = item.lines.filter((l) => l.length > 0);
    if (!lines.length) continue;

    let rest = lines;
    const firstText = collapse(lineText(lines[0]));
    const firstBold = lines[0].every((s) => s.bold);
    if (firstBold && firstText.length >= 12 && firstText.length <= 200 && !firstText.endsWith(":")) {
      if (!ctx.dropTexts.has(fold(firstText))) blocks.push({ type: "heading", text: firstText });
      rest = lines.slice(1);
    }
    if (!rest.length) continue;

    const whole = collapse(rest.map(lineText).join(" "));
    if (ctx.dropTexts.has(fold(whole))) continue;

    const allBold = rest.every((l) => l.every((s) => s.bold));
    const spans: RichSpan[] = [];
    rest.forEach((l, idx) => {
      if (idx > 0) spans.push({ text: "\n" });
      for (const s of l) {
        const copy: RichSpan = { ...s };
        if (allBold) delete copy.bold;
        spans.push(copy);
      }
    });
    // Yhdistetään "\n"-spanit viereisiin samanmerkintäisiin.
    const merged: RichSpan[] = [];
    for (const s of spans) {
      const prev = merged[merged.length - 1];
      if (prev && prev.bold === s.bold && prev.italic === s.italic && prev.href === s.href) prev.text += s.text;
      else merged.push(s);
    }
    blocks.push({ type: "paragraph", spans: merged });
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// Taulukot
// ---------------------------------------------------------------------------

interface GridCell {
  text: string;
  /** Solun taustaväri (inline-tyyli tai bgcolor), sisäkkäisistä elementeistä mukaan lukien. */
  colors: string[];
  /** true jos solu on colspan/rowspan-laajennuksen kopio. */
  spanned: boolean;
  colspan: number;
}

/**
 * Purkaa `<table>`-elementin suorakulmaiseksi ruudukoksi. colspan/rowspan
 * puretaan eksplisiittisesti (docs/12 §2.1.4): alkuperäinen solu vasempaan
 * yläkulmaan, kopiot merkitään `spanned`. Vain taulukon omat rivit
 * (`> tbody > tr`, `> tr`), ei sisäkkäisten taulukoiden.
 */
function tableGrid($: CheerioAPI, table: Element): GridCell[][] {
  const trs = $(table).children("tbody, thead, tfoot").children("tr").add($(table).children("tr")).toArray();
  const grid: GridCell[][] = [];
  const pending: Map<number, { cell: GridCell; left: number }>[] = [];

  trs.forEach((tr, r) => {
    const row: GridCell[] = [];
    grid[r] = row;
    let c = 0;
    const carry = pending[r] ?? new Map();
    const fillCarry = () => {
      while (carry.has(c)) {
        row[c] = { ...carry.get(c)!.cell, spanned: true };
        c += 1;
      }
    };
    for (const td of $(tr).children("td, th").toArray()) {
      fillCarry();
      const colspan = Math.max(1, Number($(td).attr("colspan") ?? 1) || 1);
      const rowspan = Math.max(1, Number($(td).attr("rowspan") ?? 1) || 1);
      const $td = $(td).clone();
      $td.find("script, style").remove();
      $td.find("br").replaceWith(" ");
      const colors = [td, ...$(td).find("*").toArray()]
        .map((e) => {
          const st = ($(e).attr("style") ?? "").toLowerCase();
          const m = /background(?:-color)?:[^;]*?(rgb\([^)]+\)|#[0-9a-f]{3,6})/.exec(st);
          return m?.[1] ?? ($(e).attr("bgcolor") ?? "").toLowerCase();
        })
        .filter(Boolean);
      const cell: GridCell = { text: collapse($td.text()), colors, spanned: false, colspan };
      for (let k = 0; k < colspan; k += 1) {
        row[c + k] = k === 0 ? cell : { ...cell, spanned: true };
        if (rowspan > 1) {
          for (let rr = 1; rr < rowspan; rr += 1) {
            pending[r + rr] ??= new Map();
            pending[r + rr].set(c + k, { cell, left: rowspan - rr });
          }
        }
      }
      c += colspan;
    }
    fillCarry();
  });

  const width = Math.max(0, ...grid.map((r) => r.length));
  for (const row of grid) {
    for (let c = 0; c < width; c += 1) {
      row[c] ??= { text: "", colors: [], spanned: true, colspan: 1 };
    }
  }
  return grid;
}

/** Solun näkyvä arvo: colspan-kopiot ovat tyhjiä, jotta arvo ei monistu. */
function cellValue(cell: GridCell): string {
  return cell.spanned ? "" : cell.text;
}

function inferType(values: string[]): ColumnType {
  const filled = values.map((v) => v.trim()).filter(Boolean);
  if (!filled.length) return "text";
  if (filled.every((v) => /^\d{4}$/.test(v))) return "year";
  if (filled.every((v) => /^-?\d+(?:[.,]\d+)?$/.test(v) || /^\d{1,3}(?: \d{3})+$/.test(v))) return "number";
  if (filled.every((v) => toIsoDate(v) !== null)) return "date";
  if (filled.every((v) => /^https?:\/\//.test(v))) return "link";
  return "text";
}

/** Sarakeotsikko: ISOT KIRJAIMET → Isolla alkukirjaimella (lyhenteet kuten VL säilyvät). */
function prettyLabel(label: string): string {
  const l = collapse(label).replace(/:$/, "");
  if (l.length > 4 && l === l.toUpperCase() && /[A-ZÅÄÖ]/.test(l)) {
    return l.charAt(0) + l.slice(1).toLowerCase();
  }
  return l;
}

function buildColumns(labels: string[], allRows: string[][]): TilastoColumn[] {
  // Yhteenvetorivi (Yhteensä/Keskiarvo) ei kerro sarakkeen tyyppiä.
  const rows = withoutSummaryRows(allRows);
  const used = new Map<string, number>();
  return labels.map((label, c) => {
    const base = slugify(label) || `sarake-${c + 1}`;
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    return {
      key: n === 1 ? base : `${base}-${n}`,
      label,
      type: inferType(rows.map((r) => r[c] ?? "")),
    };
  });
}

interface SimpleTableSpec {
  /** Lähde-<table>:n indeksi sivulla. */
  table: number;
  /** Rivit (0-pohjaiset) jotka ovat otsikkoa/selitettä, eivät dataa. */
  titleRows: number[];
  /** Sarakeotsikkorivi, tai null jos lähteessä ei ole (→ `labels` pakollinen). */
  headerRow: number | null;
  /** Otsikoiden ohitus sarakeindeksin mukaan (lähteen tyhjät tai puuttuvat otsikot). */
  labels?: Record<number, string>;
  /** Paikkamerkkirivien suodatin (esim. tulevat vuodet ilman dataa). */
  dropRow?: (cells: string[], following: string[][]) => string | null;
}

interface TableResult {
  columns: TilastoColumn[];
  rows: string[][];
  rowCheck: NonNullable<Tilasto["rowCheck"]>;
  notes: string[];
}

/**
 * Tavallinen taulukko: otsikkorivit pois, sarakeotsikot, tyhjät välikesarakkeet
 * pois (kaikki solut tyhjiä), tyhjät rivit pois. Jokainen pudotus kirjataan.
 */
function simpleTable(grid: GridCell[][], spec: SimpleTableSpec): TableResult {
  const notes: string[] = [];
  const header = spec.headerRow === null ? [] : grid[spec.headerRow].map(cellValue);
  const nonData = new Set([...spec.titleRows, ...(spec.headerRow === null ? [] : [spec.headerRow])]);
  const dataRows = grid
    .map((row, r) => ({ r, cells: row.map(cellValue) }))
    .filter(({ r }) => !nonData.has(r));

  const width = grid[0]?.length ?? 0;
  const keepCols: number[] = [];
  for (let c = 0; c < width; c += 1) {
    const hasData = dataRows.some(({ cells }) => cells[c]?.trim());
    const hasLabel = Boolean(header[c]?.trim() || spec.labels?.[c]);
    if (hasData) keepCols.push(c);
    else if (hasLabel) notes.push(`sarake ${c} ("${header[c] ?? spec.labels?.[c]}") on tyhjä kaikilla riveillä → pudotettu`);
  }

  const droppedRows: DroppedRow[] = [];
  const rows: string[][] = [];
  const keptAll = dataRows
    .map(({ cells }) => keepCols.map((c) => cells[c] ?? ""))
    .filter((kept) => kept.some((v) => v.trim()));
  let nonEmptyIndex = 0;
  for (const { cells } of dataRows) {
    const kept = keepCols.map((c) => cells[c] ?? "");
    if (kept.every((v) => !v.trim())) {
      droppedRows.push({ reason: "tyhjä rivi (väli- tai loppurivi)", cells: kept });
      continue;
    }
    nonEmptyIndex += 1;
    const why = spec.dropRow?.(kept, keptAll.slice(nonEmptyIndex));
    if (why) {
      droppedRows.push({ reason: why, cells: kept });
      continue;
    }
    rows.push(kept);
  }

  const labels = keepCols.map((c) => {
    const override = spec.labels?.[c];
    if (override) {
      notes.push(`sarakeotsikko "${override}" lisätty (lähteessä ${header[c] ? `"${header[c]}"` : "tyhjä"})`);
      return override;
    }
    const l = prettyLabel(header[c] ?? "");
    if (!l) throw new Error(`Sarakkeelta ${c} puuttuu otsikko — lisää labels-ohitus`);
    return l;
  });

  return {
    columns: buildColumns(labels, rows),
    rows,
    rowCheck: {
      sourceTables: [spec.table],
      sourceRows: grid.length,
      nonDataRows: nonData.size,
      droppedRows,
    },
    notes,
  };
}

/**
 * Tulevien turnausten paikkamerkkirivit (maanosaliittojencup: 2025, 2029, 2033,
 * 2037): taulukon lopussa yhtenäinen jakso rivejä, joissa on vain vuosi.
 * Kaikki jakson rivit pudotetaan johdonmukaisesti — myös 2025, joka ei enää ole
 * tulevaisuutta mutta jolta lähteessä ei ole tietoja (turnausta ei pelattu).
 * Historialliset tyhjät vuodet keskellä taulukkoa (esim. sotavuodet
 * mestaritaulukoissa) ovat tietoa eivätkä paikkamerkkejä, joten sääntö koskee
 * vain loppujaksoa ja vain taulukoita, joille se on erikseen asetettu.
 */
function futurePlaceholder(cells: string[], following: string[][]): string | null {
  const yearOnly = (r: string[]) => /^\d{4}$/.test((r[0] ?? "").trim()) && r.slice(1).every((v) => !v.trim());
  if (yearOnly(cells) && following.every(yearOnly)) {
    return `tulevan turnauksen paikkamerkki ${cells[0].trim()}: vain vuosi, ei tietoja (taulukon loppujakso)`;
  }
  return null;
}

/**
 * maailmanparhaat.htm: vuodet ovat sarakkeina ja yksi taulukko sisältää neljä
 * kolmen vuoden lohkoa välirivein. Transponoidaan yhdeksi taulukoksi, jossa
 * yksi rivi = yksi vuosi ja solut ovat lähteen solut sellaisenaan
 * ("MV: Gianluigi Buffon / Italia"). Tieto ei muutu, vain suunta.
 */
function transposeYearBlocks(grids: { index: number; grid: GridCell[][] }[]): TableResult {
  const byYear = new Map<string, string[]>();
  let sourceRows = 0;
  let nonDataRows = 0;
  const droppedRows: DroppedRow[] = [];
  for (const { grid } of grids) {
    sourceRows += grid.length;
    let years: string[] | null = null;
    for (const row of grid) {
      const cells = row.map(cellValue);
      if (cells.every((v) => !v.trim())) {
        droppedRows.push({ reason: "tyhjä välirivi lohkojen välissä", cells });
        years = null;
        continue;
      }
      if (cells.every((v) => /^\d{4}$/.test(v.trim()) || !v.trim())) {
        years = cells.map((v) => v.trim());
        nonDataRows += 1;
        continue;
      }
      if (!years) throw new Error("maailmanparhaat: datarivi ennen vuosiriviä");
      cells.forEach((v, c) => {
        const y = years![c];
        if (!y) return;
        const list = byYear.get(y) ?? [];
        list.push(v);
        byYear.set(y, list);
      });
    }
  }
  const sortedYears = [...byYear.keys()].sort((a, b) => Number(b) - Number(a));
  const width = Math.max(...[...byYear.values()].map((v) => v.length));
  const rows = sortedYears.map((y) => [y, ...Array.from({ length: width }, (_, i) => byYear.get(y)![i] ?? "")]);
  const labels = ["Vuosi", ...Array.from({ length: width }, (_, i) => `Pelaaja ${i + 1}`)];
  return {
    columns: buildColumns(labels, rows),
    rows,
    rowCheck: {
      sourceTables: grids.map((g) => g.index),
      sourceRows,
      nonDataRows,
      droppedRows,
      transform:
        `transponoitu: lähteessä vuodet sarakkeina (${sortedYears.length} vuotta × ${width} pelaajaa), ` +
        `tässä yksi rivi per vuosi; solut sellaisenaan`,
    },
    notes: ["sarakeotsikot Vuosi, Pelaaja 1–11 lisätty (lähteessä vuodet olivat sarakeotsikkoina)"],
  };
}

/**
 * lupaavia.htm: kaksi rinnakkaista listaa samassa taulukossa (1980–1986 |
 * 1987–1991), syntymävuodet väliotsikkoriveinä ("1980-syntyneet:").
 * Puretaan kahdeksi taulukoksi; syntymävuosi omaksi sarakkeekseen ja
 * solun taustaväri (lähteen selite: vihreä = pelannut parhaassa avauksessa,
 * keltainen = pelannut karsintaottelussa) omaksi "Merkintä"-sarakkeekseen,
 * jotta värikoodattu tieto ei katoa.
 */
function lupaaviaTables(grid: GridCell[][]): { left: TableResult; right: TableResult; legend: string[] } {
  const GREEN = /rgb\((0|51), 255, (0|51)\)|#00ff00|#33ff33/;
  const YELLOW = /rgb\(255, 255, (0|51|102)\)|#ffff00|#ffff33|#ffff66/;
  const legend: string[] = [];

  const half = (offset: number) => {
    const rows: string[][] = [];
    const droppedRows: DroppedRow[] = [];
    let year = "";
    let nonData = 0;
    grid.forEach((row, r) => {
      if (r === 0 || r === 1) return; // otsikkorivi + tyhjä rivi
      const cells = row.slice(offset, offset + 5);
      const values = cells.map(cellValue);
      const joined = values.join(" ").trim();
      if (r >= 77) return; // seliterivit käsitellään erikseen
      const heading = /^(\d{4})-syntyneet:?$/.exec(joined);
      if (heading) {
        year = heading[1];
        nonData += 1;
        return;
      }
      if (!joined || /^[.\s]*$/.test(joined)) {
        if (joined) droppedRows.push({ reason: "irrallinen piste ilman tietoja", cells: values });
        return;
      }
      const name = values[1];
      if (!name) {
        droppedRows.push({ reason: "rivi ilman pelaajan nimeä", cells: values });
        return;
      }
      const colors = [...cells[0].colors, ...cells[1].colors].join(" ");
      const merkinta = GREEN.test(colors)
        ? "Pelannut parhaassa avauksessa"
        : YELLOW.test(colors)
          ? "Pelannut karsintaottelussa"
          : "";
      rows.push([year, values[0].replace(/\.$/, ""), name, values[2], values[3], values[4], merkinta]);
    });
    return { rows, droppedRows, nonData };
  };

  for (let r = 77; r < grid.length; r += 1) {
    const text = collapse(grid[r].map(cellValue).join(" ")).replace(/_/g, " ");
    if (text) legend.push(text);
  }

  const labels = ["Syntymävuosi", "Nro", "Pelaaja", "Pelipaikka", "Seura", "Maa", "Merkintä"];
  const mk = (h: ReturnType<typeof half>, transform: string): TableResult => ({
    columns: buildColumns(labels, h.rows),
    rows: h.rows,
    rowCheck: {
      sourceTables: [0],
      sourceRows: grid.length,
      nonDataRows: h.nonData,
      droppedRows: h.droppedRows,
      transform,
    },
    notes: [
      "sarakeotsikot lisätty (lähteessä ei otsikkoriviä)",
      "syntymävuosi poimittu väliotsikkoriveiltä omaksi sarakkeekseen",
      "Merkintä-sarake johdettu solun taustaväristä lähteen selitteen mukaan",
    ],
  });

  return {
    left: mk(half(0), "rinnakkaisen listan vasen puolisko (sarakkeet 0–4)"),
    right: mk(half(6), "rinnakkaisen listan oikea puolisko (sarakkeet 6–10)"),
    legend,
  };
}

// ---------------------------------------------------------------------------
// Sivukonfiguraatio
// ---------------------------------------------------------------------------

interface DocSpec {
  slug: string;
  title: string;
  category: string;
  jarjestys: number;
  /** Tiivistelmä: lähteen oma virke tai taulukon sisällöstä koottu kuvaus. `{range}` = vuosiväli. */
  tiivistelma?: string;
  /** Mistä sarakkeesta vuosiväli lasketaan (`{range}`). */
  rangeColumn?: number;
  table?: SimpleTableSpec;
  paivitetty?: string;
  needsReview?: string[];
}

interface PageSpec {
  page: string;
  docs: DocSpec[];
  /** Sivun otsikot, jotka toistavat dokumentin otsikkoa → pois tekstivirrasta. */
  dropTexts?: string[];
  /** Erikoiskäsittely taulukoille. */
  custom?: "maailmanparhaat" | "lupaavia";
  /** Mihin dokumenttiin taulukoiden jälkeinen teksti liitetään (oletus: viimeinen). */
  afterTo?: string;
}

const PAGES: PageSpec[] = [
  {
    page: "fifaranking.htm",
    docs: [
      {
        slug: "fifa-ranking",
        title: "Huuhkajien FIFA-ranking",
        category: "fifa-ranking",
        jarjestys: 0,
        tiivistelma:
          "Huuhkajien FIFA-ranking 2026 / Huhtikuu -> 73. Suomen koko FIFA-ranking historian sijoituksien keskiarvo on 59.",
        needsReview: [
          "Rankinghistoria on lähteessä vain kuvana (FIFAranking202604.png); sivulla ei ole tekstitaulukkoa (docs/11 §7.3 'data tekstinä' ei täyty).",
        ],
      },
    ],
  },
  {
    page: "suomi.htm",
    docs: [
      {
        slug: "suomen-mestarit",
        title: "Suomen jalkapallomestarit",
        category: "champions",
        jarjestys: 0,
        rangeColumn: 0,
        tiivistelma:
          "Suomen jalkapallomestarit vuosittain {range}: liigamestari sekä Suomen cupin, liigacupin ja Lahti-cupin voittajat.",
        table: { table: 0, titleRows: [0], headerRow: 1 },
      },
    ],
  },
  {
    page: "puheenjohtajat.htm",
    docs: [
      {
        slug: "palloliiton-puheenjohtajat",
        title: "Palloliiton puheenjohtajat",
        category: "palloliitto",
        jarjestys: 0,
        tiivistelma:
          "Suomen Palloliiton puheenjohtajat vuodesta 1907 alkaen: kausi, puheenjohtaja ja tämän tausta.",
        table: {
          table: 0,
          titleRows: [0, 1],
          headerRow: null,
          labels: { 0: "Kausi", 1: "Puheenjohtaja", 2: "Tausta" },
        },
      },
    ],
  },
  {
    page: "suomenvalmentajat.htm",
    docs: [
      {
        slug: "huuhkajien-paavalmentajat",
        title: "Suomen maajoukkueen päävalmentajat",
        category: "valmentajat",
        jarjestys: 0,
        paivitetty: "26.09.2026",
        tiivistelma:
          "Suomen miesten A-maajoukkueen päävalmentajat vuodesta 1922: ottelut, voitot, tasapelit ja tappiot sekä FIFA-rankingin keskiarvo ja loppusijoitus.",
        table: {
          table: 0,
          titleRows: [0, 1],
          headerRow: 2,
          labels: { 0: "Kausi", 1: "Päävalmentaja" },
        },
      },
    ],
  },
  {
    page: "suomenvalmentajientulot.htm",
    dropTexts: ["SUOMEN VALMENTAJIEN TULOT"],
    docs: [
      {
        slug: "valmentajien-palkat",
        title: "Valmentajien tulot",
        category: "valmentajien-palkat",
        jarjestys: 0,
        tiivistelma:
          "Suomen maajoukkueen entinen päävalmentaja Roy Hodgson on EM-kisaluotsien palkkakuningas. Mukana EM-kisavalmentajien palkat 2016 sekä Veikkausliigan ja SM-liigan valmentajien verotettavat ansiotulot 2007.",
      },
    ],
  },
  {
    page: "vuodenpelaaja.htm",
    docs: [
      {
        slug: "suomen-vuoden-pelaaja",
        title: "Suomen vuoden pelaaja",
        category: "vuoden-pelaaja",
        jarjestys: 0,
        rangeColumn: 0,
        tiivistelma:
          "Suomen vuoden jalkapalloilija {range}: urheilutoimittajien ja Suomen Palloliiton valinnat seuroineen.",
        table: { table: 0, titleRows: [0], headerRow: 1 },
      },
    ],
  },
  {
    page: "FIFAvuodenpelaaja.htm",
    docs: [
      {
        slug: "fifan-vuoden-pelaaja",
        // Lähteen otsikkorivi: "FIFAn VUODEN PELAAJA (Ballon d'Or 2010-5)".
        title: "FIFAn vuoden pelaaja (Ballon d'Or 2010–2015)",
        category: "vuoden-pelaaja",
        jarjestys: 1,
        rangeColumn: 0,
        tiivistelma:
          "FIFAn vuoden pelaaja {range}: paras, toinen ja kolmas. Kansainvälinen Jalkapalloliitto FIFA järjestää äänestyksen. Ääniä antavat A-maajoukkuevalmentajat.",
        table: { table: 0, titleRows: [0], headerRow: 1 },
      },
    ],
  },
  {
    page: "euroopan_paras_pelaaja.htm",
    docs: [
      {
        slug: "euroopan-paras-pelaaja",
        title: "Euroopan paras pelaaja",
        category: "ballon-dor",
        jarjestys: 0,
        rangeColumn: 0,
        tiivistelma:
          "Euroopan paras pelaaja {range}. Ranskalainen France Football -lehti valitsee vuosittain maanosan parhaat jalkapalloilijat eri maiden asiantuntijoiden antamien äänten perusteella.",
        table: { table: 0, titleRows: [0], headerRow: 1 },
      },
    ],
  },
  {
    page: "maailmanparhaat.htm",
    custom: "maailmanparhaat",
    docs: [
      {
        slug: "maailman-parhaat-pelaajat",
        title: "Maailman paras avaus vuosittain",
        category: "ballon-dor",
        jarjestys: 1,
        rangeColumn: 0,
        tiivistelma:
          "Maailman paras avauskokoonpano vuosittain {range}: jokaisen vuoden yksitoista pelaajaa pelipaikkoineen (MV, OP, KP, VP, KK, KH) ja maineen.",
      },
    ],
  },
  {
    page: "top10jalkapallosaavutukset.htm",
    dropTexts: ["SUOMEN JALKAPALLON TOP 10 SAAVUTUKSET"],
    docs: [
      {
        slug: "top10-saavutukset",
        title: "Suomen jalkapallon TOP 10 saavutukset",
        category: "saavutukset",
        jarjestys: 0,
        tiivistelma:
          "Suomen jalkapallon kymmenen suurinta saavutusta: ottelu, turnaus, päivämäärä, paikka, tulos ja yleisömäärä.",
        table: { table: 0, titleRows: [], headerRow: 0 },
      },
    ],
  },
  {
    page: "top10jalkapallojarkytykset.htm",
    dropTexts: ["SUOMEN JALKAPALLON TOP 10 JÄRKYTYKSET", "SUOMEN JALKAPALLON TOP 10", "JÄRKYTYKSET"],
    docs: [
      {
        slug: "top10-jarkytykset",
        title: "Suomen jalkapallon TOP 10 järkytykset",
        category: "saavutukset",
        jarjestys: 1,
        tiivistelma:
          "Suomen jalkapallon kymmenen suurinta järkytystä: ottelu, turnaus, päivämäärä, paikka, tulos ja yleisömäärä.",
        table: { table: 0, titleRows: [], headerRow: 0 },
      },
    ],
  },
  {
    page: "lupaavia.htm",
    custom: "lupaavia",
    docs: [
      {
        slug: "lupaavat-1980-1986",
        title: "Tulevaisuuden pelaajia 1980–1986",
        category: "lupaavat",
        jarjestys: 0,
        tiivistelma:
          "Lupaavat suomalaispelaajat syntymävuosittain 1980–1986: pelipaikka, seura ja maa (Urheilulehti 13.10.2006).",
      },
      {
        slug: "lupaavat-1987-1991",
        title: "Tulevaisuuden pelaajia 1987–1991",
        category: "lupaavat",
        jarjestys: 1,
        tiivistelma:
          "Lupaavat suomalaispelaajat syntymävuosittain 1987–1991: pelipaikka, seura ja maa (Urheilulehti 13.10.2006).",
      },
    ],
    afterTo: "lupaavat-1980-1986",
  },
  {
    page: "eurocuptilasto.htm",
    dropTexts: ["MESTAREIDEN LIIGA JA EUROOPAN CUP", "Mestareiden liiga", "Euroopan Cup"],
    afterTo: "mestareiden-liiga",
    docs: [
      {
        slug: "mestareiden-liiga",
        title: "Mestareiden liiga",
        category: "eurocup",
        jarjestys: 0,
        tiivistelma:
          "Mestareiden liigan finaalit kausittain 1992/93–2025/26: mestari, hopea, tulos, stadion, kaupunki ja katsojamäärä.",
        table: { table: 0, titleRows: [], headerRow: 0 },
      },
      {
        slug: "euroopan-cup",
        title: "Euroopan Cup",
        category: "eurocup",
        jarjestys: 1,
        tiivistelma:
          "Euroopan Cupin finaalit kausittain 1955/56–1991/92: mestari, hopea, tulos ja stadion.",
        table: { table: 1, titleRows: [], headerRow: 0 },
      },
    ],
  },
  {
    page: "uefacup.htm",
    docs: [
      {
        slug: "uefa-cup-eurooppa-liiga",
        title: "UEFA Cup ja Eurooppa-liiga",
        category: "uefa-cup",
        jarjestys: 0,
        tiivistelma:
          "UEFA Cupin ja Eurooppa-liigan finaalit vuodesta 1958. Vuodesta 1958 vuoteen 1971 kilpailua pelattiin messukaupunkien joukkueiden välillä nimellä Inter-Cities Fairs Cup.",
        table: { table: 0, titleRows: [0], headerRow: 1 },
      },
    ],
  },
  {
    page: "cupvoittajiencup.htm",
    docs: [
      {
        slug: "cupvoittajien-cup-konferenssiliiga",
        title: "Cup-voittajien cup ja Konferenssiliiga",
        category: "conference-league",
        jarjestys: 0,
        tiivistelma:
          "Cup-voittajien cupin finaalit 1960–61 alkaen ja kaudesta 2021–22 sen seuraajan Konferenssiliigan finaalit: paikkakunta, ottelu ja tulos.",
        table: { table: 0, titleRows: [0], headerRow: 1 },
      },
    ],
  },
  {
    page: "supercup.htm",
    docs: [
      {
        slug: "uefa-supercup",
        title: "UEFA Supercup",
        category: "super-cup",
        jarjestys: 0,
        tiivistelma:
          "Euroopan supercupissa kohtaavat Mestareiden liigan ja UEFA cupin voittajat. Taulukossa finaalit ja tulokset vuodesta 1972–73.",
        table: { table: 0, titleRows: [0], headerRow: 1 },
      },
    ],
  },
  {
    page: "intercontinental.htm",
    dropTexts: ["SEURAJOUKKUEIDEN MM (FIFA Club World Cup)"],
    docs: [
      {
        slug: "seurajoukkueiden-mm",
        title: "Seurajoukkueiden MM (Intercontinental Cup ja FIFA Club World Cup)",
        category: "intercontinental",
        jarjestys: 0,
        tiivistelma:
          "Seurajoukkueiden maailmanmestaruuden voittaneet seurat 1960–2025: maa, voittovuodet ja voittojen määrä.",
        table: { table: 0, titleRows: [], headerRow: 0, labels: { 1: "Maa" } },
      },
    ],
  },
  {
    page: "maanosaliittojencup.htm",
    docs: [
      {
        slug: "maanosaliittojen-cup",
        title: "Maanosaliittojen cup (Confederations Cup)",
        category: "intercontinental",
        jarjestys: 1,
        tiivistelma:
          "Maanosaliittojen cupin (Confederations Cup) isäntämaat, mestarit ja hopeajoukkueet. Ensimmäisen kerran turnaus järjestettiin vuonna 1992 Saudi-Arabiassa.",
        table: { table: 0, titleRows: [0], headerRow: 1, dropRow: futurePlaceholder },
      },
    ],
  },
  {
    page: "englanti.htm",
    docs: [
      {
        slug: "englannin-seurojen-mestaruudet",
        title: "Englannin seurojen mestaruudet ja cupvoitot",
        category: "ulkomaiset-mestarit",
        jarjestys: 0,
        tiivistelma:
          "Englannin seurat mestaruuksien ja cupvoittojen mukaan: liigamestaruudet (VL), FA Cup (FA), liigacup (LC), yhteensä sekä ensimmäinen ja viimeisin voitto.",
        table: { table: 0, titleRows: [], headerRow: 0, labels: { 0: "Sija" } },
      },
      {
        slug: "englannin-mestarit",
        title: "Englannin jalkapallomestarit",
        category: "ulkomaiset-mestarit",
        jarjestys: 1,
        rangeColumn: 0,
        tiivistelma: "Englannin jalkapallomestarit vuosittain {range}: liigamestari, FA Cupin ja liigacupin voittaja.",
        table: { table: 1, titleRows: [0], headerRow: 1 },
      },
    ],
  },
  {
    page: "venaja.htm",
    docs: [
      {
        slug: "venajan-mestarit",
        title: "Venäjän jalkapallomestarit",
        category: "ulkomaiset-mestarit",
        jarjestys: 2,
        tiivistelma:
          "Venäjän ja Neuvostoliiton jalkapallomestarit ja cupin voittajat vuodesta 1936 kaudelle 2025–26.",
        table: { table: 0, titleRows: [0], headerRow: 1 },
      },
    ],
  },
];

/** Linkkihubi — ei omaa dokumenttia (coverage: merged → /jalkapalloarkisto). */
const MERGED_PAGES = [
  {
    page: "historia.htm",
    target: "/jalkapalloarkisto",
    reason:
      "Linkkihubi (Suomen / kansainvälinen jalkapallo): pelkkiä linkkejä muille arkistosivuille, ei omaa dataa. Uusi /jalkapalloarkisto-hubi korvaa sen.",
  },
];

// ---------------------------------------------------------------------------
// Pääohjelma
// ---------------------------------------------------------------------------

function yearRange(rows: string[][], col: number): string | null {
  const years = rows
    .map((r) => Number(/(\d{4})/.exec(r[col] ?? "")?.[1]))
    .filter((y) => y > 1800 && y <= CURRENT_YEAR);
  if (!years.length) return null;
  return `${Math.min(...years)}–${Math.max(...years)}`;
}

async function parsePage(spec: PageSpec): Promise<Tilasto[]> {
  const html = decodeHtml(await readFile(join(RAW_DIR, spec.page)));
  const $ = load(html);
  $("script, style, noscript").remove();

  const tables = $("table").toArray().filter((t) => $(t).parents("table").length === 0) as Element[];
  const tableIndex = new Map<Element, number>(tables.map((t, i) => [t, i]));

  const pageStem = spec.page.replace(/\.htm$/, "");
  const body = $("body").get(0) ?? $.root().get(0)!;
  const tokens = tokenize($, body, tableIndex);

  // Segmentit: [ennen taulukkoa 0, taulukon 0 jälkeen, …]
  const segments: Token[][] = [[]];
  const tableOrder: number[] = [];
  for (const tok of tokens) {
    if (tok.t === "table") {
      tableOrder.push(tok.index);
      segments.push([]);
    } else {
      segments[segments.length - 1].push(tok);
    }
  }

  const docs: Tilasto[] = spec.docs.map((d) => ({
    slug: d.slug,
    title: d.title,
    category: d.category,
    sourcePage: spec.page,
    legacyUrl: `/${spec.page}`,
    jarjestys: d.jarjestys,
    intro: [],
    lisatiedot: [],
    kuvat: [],
    columns: [],
    rows: [],
    needsReview: false,
    reviewReasons: [...(d.needsReview ?? [])],
    notes: [],
  }));
  const bySlug = new Map(docs.map((d) => [d.slug, d]));

  const weakAlts: string[] = [];
  const ctx: BlockContext = {
    page: spec.page,
    pageStem,
    dropTexts: new Set([...(spec.dropTexts ?? []), ...docs.map((d) => d.title)].map(fold)),
    weakAlts,
  };
  const blocksOf = (seg: Token[]) => toBlocks(itemize(seg), ctx);

  // --- Taulukot ---
  // Taulukkosolujen kuvat (seuranimen perässä Wikimedia-liput) eivät ole sisältöä:
  // maan nimi säilyy solutekstinä. Kirjataan pudotetuiksi.
  for (const t of tables) {
    for (const img of $(t).find("img").toArray()) {
      const src = $(img).attr("src") ?? "";
      const record = lookupImage(src);
      droppedImages.push({
        page: spec.page,
        src,
        reason: record?.ok
          ? "taulukon solun kuva (ei inventaarion ulkopuolinen), taulukon teksti säilyy"
          : /wikimedia.org/i.test(src)
            ? "taulukon solun Wikimedia-lippukuva (seuran maa näkyi vain lippuna), ei inventaariossa; pudotettu family-notes-linjauksen mukaan, seuran nimi säilyy"
            : "taulukon solun kuva, ei inventaariossa",
      });
    }
  }
  if (spec.custom === "maailmanparhaat") {
    const res = transposeYearBlocks(tables.map((t, i) => ({ index: i, grid: tableGrid($, t) })));
    Object.assign(docs[0], { columns: res.columns, rows: res.rows, rowCheck: res.rowCheck });
    docs[0].notes.push(...res.notes);
  } else if (spec.custom === "lupaavia") {
    const { left, right, legend } = lupaaviaTables(tableGrid($, tables[0]));
    Object.assign(docs[0], { columns: left.columns, rows: left.rows, rowCheck: left.rowCheck });
    Object.assign(docs[1], { columns: right.columns, rows: right.rows, rowCheck: right.rowCheck });
    docs[0].notes.push(...left.notes);
    docs[1].notes.push(...right.notes);
    // Selite: lyhenteet ja väriselite sekä lähde molempien taulukoiden alle.
    const legendBlocks: RichBlock[] = [
      { type: "paragraph", spans: [{ text: "Pelipaikat: " + legend.filter((l) => /=/.test(l)).join(" ") }] },
      {
        type: "paragraph",
        spans: [
          {
            text:
              "Merkintä-sarake vastaa vanhan sivun värikoodausta: vihreä = pelaaja parhaassa avauksessa, keltainen = pelaaja pelannut karsintapelissä. Lähde: Urheilulehti 13.10.2006.",
          },
        ],
      },
    ];
    docs[0].lisatiedot.push(...legendBlocks);
    docs[1].lisatiedot.push(...legendBlocks);
    docs[0].notes.push(`selite: ${legend.join(" | ")}`);
  } else {
    for (const d of spec.docs) {
      if (!d.table) continue;
      const res = simpleTable(tableGrid($, tables[d.table.table]), d.table);
      const doc = bySlug.get(d.slug)!;
      Object.assign(doc, { columns: res.columns, rows: res.rows, rowCheck: res.rowCheck });
      doc.notes.push(...res.notes);
    }
  }

  // --- Teksti ---
  const docForTable = (tableIdx: number): Tilasto => {
    const d = spec.docs.find((x) => x.table?.table === tableIdx);
    return d ? bySlug.get(d.slug)! : docs[0];
  };

  if (tableOrder.length === 0) {
    // Ei taulukkoa: koko sisältö johdannoksi kuvineen.
    docs[0].intro.push(...blocksOf(segments[0]));
  } else {
    // Ennen ensimmäistä taulukkoa: teksti johdantoon, kuvat kuvagalleriaan.
    const before = blocksOf(segments[0]);
    const firstDoc = docForTable(tableOrder[0]);
    for (const b of before) {
      if (b.type === "image") firstDoc.kuvat.push(b);
      else firstDoc.intro.push(b);
    }
    // Taulukoiden välissä: edellisen taulukon lisätietoihin.
    for (let k = 1; k < tableOrder.length; k += 1) {
      const target = spec.custom ? docs[0] : docForTable(tableOrder[k - 1]);
      target.lisatiedot.push(...blocksOf(segments[k]));
    }
    const afterDoc = spec.afterTo ? bySlug.get(spec.afterTo)! : spec.custom ? docs[0] : docForTable(tableOrder[tableOrder.length - 1]);
    afterDoc.lisatiedot.push(...blocksOf(segments[tableOrder.length]));
  }

  // --- Metatiedot ---
  for (const d of spec.docs) {
    const doc = bySlug.get(d.slug)!;
    if (d.paivitetty) {
      const iso = toIsoDate(d.paivitetty);
      if (!iso) throw new Error(`${spec.page}: virheellinen päivitys ${d.paivitetty}`);
      doc.paivitetty = iso;
    }
    if (d.tiivistelma) {
      let t = d.tiivistelma;
      if (t.includes("{range}")) {
        const range = d.rangeColumn !== undefined ? yearRange(doc.rows, d.rangeColumn) : null;
        if (!range) throw new Error(`${spec.page}: vuosiväliä ei saatu (${d.slug})`);
        t = t.replace("{range}", range);
      }
      if (t.length > 300) throw new Error(`${d.slug}: tiivistelmä ${t.length} > 300 merkkiä`);
      doc.tiivistelma = t;
    } else {
      doc.reviewReasons.push("tiivistelmää ei voitu johtaa lähteestä");
    }
  }

  if (weakAlts.length) {
    const owner = docs[0];
    owner.reviewReasons.push(`alt-teksti johdettu tiedostonimestä: ${weakAlts.join("; ")}`);
  }
  for (const doc of docs) {
    // Taulukon tarkistus: sarakemäärä yhtenäinen kaikilla riveillä.
    for (const row of doc.rows) {
      if (row.length !== doc.columns.length) {
        throw new Error(`${doc.slug}: rivin sarakemäärä ${row.length} ≠ ${doc.columns.length}`);
      }
    }
    if (doc.rows.length === 0 && doc.intro.length === 0) {
      throw new Error(`${doc.slug}: ei taulukkoa eikä tekstiä`);
    }
    doc.needsReview = doc.reviewReasons.length > 0;
  }
  return docs;
}

/** Tarkistaa, ettei mojibakea tai entiteettijäänteitä ole missään tekstissä (§1.2). */
function findMojibake(value: unknown, path: string, hits: string[]): void {
  if (typeof value === "string") {
    const m = /Ã[\u0080-¿¤¶…]|â€|&[a-z]+;|&#\d+;|\ufffd|[\u0080-\u009f]/.exec(value);
    if (m) hits.push(`${path}: ${JSON.stringify(m[0])} @ ${value.slice(Math.max(0, m.index - 40), m.index + 40)}`);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => findMojibake(v, `${path}[${i}]`, hits));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) findMojibake(v, `${path}.${k}`, hits);
  }
}

async function main() {
  const inventory = JSON.parse(await readFile(INVENTORY, "utf-8")) as KuvaRecord[];
  inventoryByFile = new Map(inventory.map((k) => [k.file, k]));
  inventoryByUrl = new Map(inventory.flatMap((k) => [[k.src, k], [k.url, k]] as [string, KuvaRecord][]));

  const parsed: Tilasto[] = [];
  for (const spec of PAGES) parsed.push(...(await parsePage(spec)));

  // Solujen normalisointi (docs/12 §1.2): date → ISO, number → kokonaisluku,
  // epäselvä sarake → text. Näkymättömät merkit pois kaikista teksteistä.
  const invisibleRemoved = countInvisible(parsed);
  for (const d of parsed) {
    const res = normalizeGrid(d.columns, d.rows);
    d.columns = d.columns.map((c, i) => ({ ...c, type: res.types[i] }));
    d.rows = res.rows;
    d.notes.push(...res.notes);
  }
  const all: Tilasto[] = stripInvisibleDeep(parsed);

  // Slugien yksikäsitteisyys.
  const slugs = new Set<string>();
  for (const d of all) {
    if (slugs.has(d.slug)) throw new Error(`Slug toistuu: ${d.slug}`);
    slugs.add(d.slug);
  }

  // Historian hubin kuvat: kirjataan pudotetuiksi (hubi yhdistetään, ei dokumenttia).
  for (const m of MERGED_PAGES) {
    for (const record of inventory) {
      if (!record.pages.includes(m.page)) continue;
      const elsewhere = record.pages.filter((p) => p !== m.page);
      droppedImages.push({
        page: m.page,
        src: record.src,
        reason: elsewhere.length
          ? `hubisivun kuva; sama kuva on sisältönä sivulla ${elsewhere.join(", ")} (omistaja siellä)`
          : "hubisivun koristekuva; hubi yhdistetään /jalkapalloarkisto-sivuun eikä sille tehdä dokumenttia",
      });
    }
  }

  const mojibake: string[] = [];
  findMojibake(all, "tilastot", mojibake);
  if (mojibake.length) {
    console.error(mojibake.join("\n"));
    throw new Error(`Mojibakea tai entiteettijäänteitä ${mojibake.length} kpl`);
  }

  const images = all.flatMap((d) => [...d.kuvat, ...[...d.intro, ...d.lisatiedot].filter((b): b is ImageBlock => b.type === "image")]);
  const altSources: Record<string, number> = {};
  for (const img of images) altSources[img.altLahde] = (altSources[img.altLahde] ?? 0) + 1;

  const report = {
    generated: "deterministinen (ei aikaleimaa, jotta ajo on toistettava)",
    pages: PAGES.length + MERGED_PAGES.length,
    documents: all.length,
    needsReview: all.filter((d) => d.needsReview).length,
    byCategory: all.reduce<Record<string, number>>((acc, d) => {
      acc[d.category] = (acc[d.category] ?? 0) + 1;
      return acc;
    }, {}),
    images: { attached: images.length, uniqueFiles: new Set(images.map((i) => i.file)).size, altSources, dropped: droppedImages.length },
    droppedInternalOrNoiseLinks: droppedLinkCount,
    invisibleCharsRemoved: invisibleRemoved,
    merged: MERGED_PAGES,
    docs: all.map((d) => ({
      slug: d.slug,
      page: d.sourcePage,
      category: d.category,
      columns: d.columns.map((c) => `${c.label}:${c.type}`),
      rows: d.rows.length,
      rowCheck: d.rowCheck
        ? {
            ...d.rowCheck,
            expectedDataRows:
              d.rowCheck.sourceRows - d.rowCheck.nonDataRows - d.rowCheck.droppedRows.length,
          }
        : null,
      introBlocks: d.intro.length,
      lisatiedotBlocks: d.lisatiedot.length,
      kuvat: d.kuvat.length,
      inlineImages: [...d.intro, ...d.lisatiedot].filter((b) => b.type === "image").length,
      needsReview: d.needsReview,
      reviewReasons: d.reviewReasons,
      notes: d.notes,
    })),
  };

  await writeFile(join(OUT_DIR, "tilastot.json"), `${JSON.stringify(all, null, 2)}\n`, "utf-8");
  await writeFile(join(OUT_DIR, "tilastot-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf-8");
  await writeFile(join(OUT_DIR, "tilastot-kuvat-dropped.json"), `${JSON.stringify(droppedImages, null, 2)}\n`, "utf-8");

  console.log(`
Sivuja .................. ${PAGES.length} (+ ${MERGED_PAGES.length} yhdistetty hubi)
Dokumentteja ............ ${all.length}
  tarkistettavia ........ ${report.needsReview}
Taulukkorivejä .......... ${all.reduce((n, d) => n + d.rows.length, 0)}
Kuvia liitetty .......... ${images.length} (${report.images.uniqueFiles} eri tiedostoa)
  alt-lähteet ........... ${JSON.stringify(altSources)}
Kuvia pudotettu ......... ${droppedImages.length}
Linkkejä pudotettu ...... ${droppedLinkCount} (is.fi-hakutägit, tuntemattomat)

Kirjoitettu: data/normalized/tilastot.json
             data/normalized/tilastot-report.json
             data/normalized/tilastot-kuvat-dropped.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
