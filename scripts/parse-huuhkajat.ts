/**
 * Purkaa vanhan sivuston Huuhkajat-sivut (maajoukkueen ottelut, karsinnat,
 * pelaajatilastot, Huuhkaja-arvostelu, paras avauskokoonpano …) tilasto-
 * taulukoiksi.
 *
 * Ajo:    `npx tsx scripts/parse-huuhkajat.ts`
 * Lähde:  data/raw-html/*.htm (M2:n 21 sivua, ks. `PAGES` alla)
 *         data/normalized/kuvat.json (kuvainventaario)
 * Tulos:  data/normalized/huuhkajat.json               taulukot + tekstit + kuvat
 *         data/normalized/huuhkajat-report.json        määrät, tarkistukset, syyt
 *         data/normalized/huuhkajat-kuvat-dropped.json pudotetut kuvat perusteluineen
 *
 * Tulos on CMS-riippumaton: Sanity-import tehdään erillisessä adapterissa
 * (`scripts/import-huuhkajat.ts`), kuten ravintoloilla.
 *
 * Periaatteet (docs/12 §2.1 ja §3 M2):
 *  - 1 dokumentti / lähdetaulukko. Sivun vapaa teksti (otteluraportit,
 *    kokoonpanot, otteluohjelmat) kulkee sivun päädokumentin mukana:
 *    taulukkoa edeltävä teksti → `intro`, sen jälkeinen → `lisatiedot`.
 *  - Taulukot puretaan ruudukoksi (colspan/rowspan auki) ja sarakkeiden
 *    tyyppi päätellään koko sarakkeesta.
 *  - Mitään ei keksitä: tiivistelmät kootaan taulukon omista luvuista, ja
 *    käsin kirjoitetut alt-tekstit kuvaavat vain sen, mitä kuvassa näkyy.
 *  - Sivukohtaiset rakenteet on kuvattu nimettyinä käsittelijöinä, ei
 *    yleisenä heuristiikkana: sivuja on 21 ja jokainen on omanlaisensa.
 *
 * Koodaus: `<meta charset>` ei ole luotettava (data/family-notes.md §0.1).
 * Tiukka UTF-8 ensin, sitten windows-1252 — toimii kaikille 197 sivulle.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { load, type CheerioAPI } from "cheerio";
import type { AnyNode, Element } from "domhandler";

import type { KuvaRecord } from "./download-images";
import { decodeHtml } from "./lib/decode-html";
import { countInvisible, normalizeGrid, stripInvisibleDeep, withoutSummaryRows } from "./lib/normalize-cell";
import { legacyRedirects } from "../lib/redirects";

const RAW_DIR = join(process.cwd(), "data", "raw-html");
const NORMALIZED = join(process.cwd(), "data", "normalized");
const OUT_FILE = join(NORMALIZED, "huuhkajat.json");
const REPORT_FILE = join(NORMALIZED, "huuhkajat-report.json");
const DROPPED_FILE = join(NORMALIZED, "huuhkajat-kuvat-dropped.json");
const IMAGE_INVENTORY = join(NORMALIZED, "kuvat.json");

// ─── Tyypit ────────────────────────────────────────────────────────────────

export type Mark = "strong" | "em" | "underline";

/** Tekstipätkä muotoiluineen. CMS-riippumaton vastine Portable Textin spanille. */
export interface Span {
  text: string;
  marks: Mark[];
  href?: string;
}

/** Tekstikappale. Rivinvaihdot (`<br>`) ovat `\n`-merkkejä spanien sisällä. */
export interface Block {
  style: "normal" | "h3";
  listItem?: "bullet";
  spans: Span[];
}

export type ColumnType = "text" | "number" | "date" | "year" | "link";

export interface Column {
  key: string;
  label: string;
  type: ColumnType;
}

export interface Kuva {
  /** Tiedostonimi `data/images/`-kansiossa (inventaarion `file`). */
  file: string;
  alt: string;
  caption?: string;
  /** Mistä alt on peräisin: lähteen alt / kuvateksti / käsin katsottu / johdettu datasta. */
  altLahde: "lahde" | "kuvateksti" | "kasin" | "data";
  /** Vanha sivu, jolla kuva esiintyi. */
  sivu: string;
}

export interface HuuhkajaTilasto {
  slug: string;
  title: string;
  category: "huuhkajat" | "karsinta" | "muu";
  tiivistelma?: string;
  jarjestys: number;
  paivitetty?: string;
  legacyUrl: string;
  muutLegacyUrlit?: string[];
  intro: Block[];
  lisatiedot: Block[];
  columns: Column[];
  /** Rivit sarakkeiden järjestyksessä. Tyhjä solu = "". */
  rows: string[][];
  kuvat: Kuva[];
  sources: string[];
  needsReview: boolean;
  reviewReasons: string[];
  /** Lähdetaulukon datarivien määrä tarkistusta varten (§1.2). */
  lahdeRivit: number;
  /** Mistä lähdesivusta ja taulukosta dokumentti on tehty. */
  lahde: { sivu: string; taulukko: string };
}

export interface CoverageEntry {
  legacyUrl: string;
  tila: "migrated" | "merged" | "dropped";
  /** Dokumentin slug; hubiin yhdistetyllä sivulla kohdepolku. */
  kohde: string;
  huomio: string;
}

interface DroppedImage {
  file: string;
  sivu: string;
  syy: string;
}

// ─── Koodaus ja teksti ─────────────────────────────────────────────────────

// decodeHtml: scripts/lib/decode-html.ts (yhteinen, oikea windows-1252-taulukko).

async function loadPage(file: string): Promise<CheerioAPI> {
  const html = decodeHtml(await readFile(join(RAW_DIR, file))).normalize("NFC");
  const $ = load(html);
  // Google Analytics -skripti ja tyylit eivät ole sisältöä.
  $("script, style, noscript").remove();
  return $;
}

/** Siistii yhden rivin: nbsp → välilyönti, välit yhdeksi, NFC. */
function clean(text: string): string {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/[ \t\r\f\v]+/g, " ")
    .trim()
    .normalize("NFC");
}

/** Solun teksti; `<br>` → rivinvaihto (tai välilyönti). */
function cellText($: CheerioAPI, el: Element, br: "\n" | " " = " "): string {
  const clone = $(el).clone();
  clone.find("br").replaceWith("\n");
  const raw = clone.text().replace(/\u00a0/g, " ");
  const lines = raw.split("\n").map(clean).filter(Boolean);
  return lines.join(br);
}

const FI_DATE = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;

/** "26.09.2026" → "2026-09-26". */
function toIso(date: string): string | undefined {
  const m = FI_DATE.exec(date.trim());
  if (!m) return undefined;
  const [, d, mo, y] = m;
  const iso = `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  const check = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(check.getTime())) return undefined;
  if (check.getUTCDate() !== Number(d) || check.getUTCMonth() + 1 !== Number(mo)) return undefined;
  return iso;
}

/** "008" → "8", "00" → "0". Vain kokonaisluvuille. */
function stripZeros(value: string): string {
  return /^\d+$/.test(value) ? String(Number(value)) : value;
}

// ─── Linkit ────────────────────────────────────────────────────────────────

const REDIRECTS = new Map(
  legacyRedirects.map((r) => [r.source.toLowerCase(), r.destination]),
);

/**
 * Sisäiset `.htm`-linkit → uudet polut `lib/redirects.ts`:n kautta (§2.1.3).
 * Picasa lopetettiin 2016, joten sen linkit pudotetaan (teksti säilyy).
 */
function mapHref(href: string | undefined): string | undefined {
  if (!href) return undefined;
  const h = href.trim();
  if (!h || h.startsWith("#") || /^javascript:/i.test(h)) return undefined;
  if (/picasaweb\.google\.com/i.test(h)) return undefined;
  if (/^(https?:|mailto:|tel:)/i.test(h)) return h;
  const path = `/${h.replace(/^\.?\//, "").split("#")[0]}`.toLowerCase();
  return REDIRECTS.get(path) ?? REDIRECTS.get(encodeURI(decodeURI(path)));
}

// ─── HTML → kappaleet ──────────────────────────────────────────────────────

type Token =
  | { k: "text"; text: string; marks: Mark[]; href?: string; heading: boolean; list: boolean }
  | { k: "br" }
  | { k: "block" };

const BLOCK_TAGS = new Set([
  "p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ul", "ol", "tr", "td", "th",
  "table", "tbody", "thead", "tfoot", "caption", "pre", "blockquote", "center", "hr",
  "dl", "dt", "dd", "form", "body",
]);

interface WalkCtx {
  marks: Mark[];
  href?: string;
  pre: boolean;
  heading: boolean;
  list: boolean;
}

function withMark(marks: Mark[], mark: Mark): Mark[] {
  return marks.includes(mark) ? marks : [...marks, mark];
}

function walk(node: AnyNode, ctx: WalkCtx, out: Token[], skip: Set<AnyNode>): void {
  if (skip.has(node)) {
    out.push({ k: "block" });
    return;
  }
  if (node.type === "text") {
    const data = (node as unknown as { data: string }).data;
    if (ctx.pre) {
      const parts = data.split(/\r?\n/);
      parts.forEach((part, i) => {
        if (i > 0) out.push({ k: "br" });
        if (part) out.push({ k: "text", text: part.replace(/\s+/g, " "), marks: ctx.marks, href: ctx.href, heading: ctx.heading, list: ctx.list });
      });
    } else {
      out.push({ k: "text", text: data.replace(/[\s\u00a0]+/g, " "), marks: ctx.marks, href: ctx.href, heading: ctx.heading, list: ctx.list });
    }
    return;
  }
  if (node.type !== "tag") return;
  const el = node as Element;
  const name = el.name.toLowerCase();
  if (name === "br") {
    out.push({ k: "br" });
    return;
  }
  if (name === "img" || name === "script" || name === "style") return;

  const next: WalkCtx = { ...ctx };
  if (name === "b" || name === "strong") next.marks = withMark(ctx.marks, "strong");
  if (name === "i" || name === "em") next.marks = withMark(ctx.marks, "em");
  if (name === "u") next.marks = withMark(ctx.marks, "underline");
  const style = (el.attribs.style ?? "").toLowerCase();
  if (/font-weight:\s*(bold|[6-9]00)/.test(style)) next.marks = withMark(next.marks, "strong");
  // <b><small style="font-weight: normal"> … — sisempi tyyli kumoaa lihavoinnin.
  if (/font-weight:\s*(normal|[1-4]00)/.test(style)) next.marks = next.marks.filter((m) => m !== "strong");
  if (name === "a") next.href = mapHref(el.attribs.href);
  if (name === "pre") next.pre = true;
  if (/^h[1-6]$/.test(name)) next.heading = true;
  if (name === "li") next.list = true;

  const isBlock = BLOCK_TAGS.has(name);
  if (isBlock) out.push({ k: "block" });
  for (const child of el.children) walk(child, next, out, skip);
  if (isBlock) out.push({ k: "block" });
}

interface RawLine {
  spans: Span[];
}

/** Yhdistää peräkkäiset samanmuotoiset spanit ja siivoaa välilyönnit. */
function finalizeLine(spans: Span[]): Span[] {
  const merged: Span[] = [];
  for (const s of spans) {
    const prev = merged[merged.length - 1];
    if (prev && prev.href === s.href && prev.marks.join() === s.marks.join()) {
      prev.text += s.text;
    } else {
      merged.push({ ...s, marks: [...s.marks] });
    }
  }
  // Välilyönnit: tuplat pois myös spanien rajoilta, reunat trimmataan.
  let prevEndsSpace = true;
  for (const s of merged) {
    s.text = s.text.replace(/ {2,}/g, " ");
    if (prevEndsSpace) s.text = s.text.replace(/^ +/, "");
    if (s.text) prevEndsSpace = s.text.endsWith(" ");
  }
  const nonEmpty = merged.filter((s) => s.text.length > 0);
  if (nonEmpty.length) {
    const last = nonEmpty[nonEmpty.length - 1];
    last.text = last.text.replace(/ +$/, "");
  }
  // Pelkkää välilyöntiä sisältävä muotoiltu span → muotoilu pois.
  for (const s of nonEmpty) {
    if (!s.text.trim()) {
      s.marks = [];
      delete s.href;
    }
  }
  return nonEmpty
    .filter((s) => s.text.length > 0)
    .map((s) => ({ ...s, text: s.text.normalize("NFC") }));
}

const DATE_START = /^\(?\d{1,2}\.\d{1,2}\./;
const NOT_HEADING = /^(yleisöä|erotuomari|maalit?:|\d+\s+maali(a)?\b)/i;

/**
 * Muuntaa DOM-alueen kappaleiksi. FrontPage-säännöt (family-notes §0.2):
 * kappale = lohkoelementti tai `<br><br>`; yksittäinen `<br>` = rivinvaihto.
 * Lyhyt, kokonaan lihavoitu kappale, joka ei ala päivämäärällä → väliotsikko.
 */
function htmlToBlocks(nodes: AnyNode[], skip: Set<AnyNode> = new Set()): Block[] {
  const tokens: Token[] = [];
  const ctx: WalkCtx = { marks: [], pre: false, heading: false, list: false };
  for (const n of nodes) walk(n, ctx, tokens, skip);

  const paragraphs: { lines: RawLine[]; heading: boolean; list: boolean }[] = [];
  let lines: RawLine[] = [{ spans: [] }];
  let pendingBr = 0;
  let heading = false;
  let list = false;

  const flush = () => {
    const cleaned = lines
      .map((l) => ({ spans: finalizeLine(l.spans) }))
      .filter((l) => l.spans.length > 0);
    if (cleaned.length) paragraphs.push({ lines: cleaned, heading, list });
    lines = [{ spans: [] }];
    pendingBr = 0;
    heading = false;
    list = false;
  };

  for (const t of tokens) {
    if (t.k === "block") {
      flush();
      continue;
    }
    if (t.k === "br") {
      pendingBr += 1;
      continue;
    }
    if (!t.text.trim()) {
      // Pelkkä välilyönti: säilytetään sanavälinä, ei katkaise br-sarjaa.
      if (pendingBr === 0) lines[lines.length - 1].spans.push({ text: " ", marks: [] });
      continue;
    }
    if (pendingBr >= 2) flush();
    else if (pendingBr === 1) lines.push({ spans: [] });
    pendingBr = 0;
    if (t.heading) heading = true;
    if (t.list) list = true;
    lines[lines.length - 1].spans.push({ text: t.text, marks: t.marks, ...(t.href ? { href: t.href } : {}) });
  }
  flush();

  return paragraphs.map((p) => {
    const spans: Span[] = [];
    p.lines.forEach((line, i) => {
      const copy = line.spans.map((s) => ({ ...s, marks: [...s.marks] }));
      // Rivinvaihto omana muotoilemattomana spaninaan, ettei lihavointi valu seuraavalle riville.
      if (i < p.lines.length - 1) copy.push({ text: "\n", marks: [] });
      spans.push(...copy);
    });
    const text = spans.map((s) => s.text).join("");
    const allStrong = spans.every((s) => !s.text.trim() || s.marks.includes("strong"));
    // Monirivinen lihavoitu kappale (esim. maalintekijälistat) ei ole otsikko.
    // FrontPage käyttää <h2>/<h3>-tageja myös kokonaisten listojen kääreinä,
    // joten tagi yksin ei riitä: otsikko on aina yksirivinen. Sisältörivit
    // ("Yleisöä 5869", "9 maalia") eivät ole otsikoita, vaikka ne olisi lihavoitu.
    const isHeading =
      allStrong &&
      p.lines.length === 1 &&
      text.length <= 90 &&
      !DATE_START.test(text) &&
      !NOT_HEADING.test(text.trim()) &&
      !p.list;
    if (isHeading) {
      return {
        style: "h3" as const,
        spans: finalizeLine([{ text: text.replace(/\s*\n\s*/g, " "), marks: [] }]),
      };
    }
    return { style: "normal" as const, ...(p.list ? { listItem: "bullet" as const } : {}), spans: mergeSpans(spans) };
  });
}

/** Yhdistää vierekkäiset samanmuotoiset spanit (rivinvaihdot säilyvät tekstissä). */
function mergeSpans(spans: Span[]): Span[] {
  const out: Span[] = [];
  for (const s of spans) {
    const prev = out[out.length - 1];
    if (prev && prev.href === s.href && prev.marks.join() === s.marks.join()) prev.text += s.text;
    else out.push({ ...s });
  }
  return out;
}

function blockText(b: Block): string {
  return b.spans.map((s) => s.text).join("");
}

function plainBlock(text: string, style: Block["style"] = "normal"): Block {
  return { style, spans: [{ text, marks: [] }] };
}

function bulletBlock(text: string): Block {
  return { style: "normal", listItem: "bullet", spans: [{ text, marks: [] }] };
}

/**
 * Jakaa sivun tekstin kahtia pääkaulukon kohdalta: sitä edeltävä teksti
 * introksi ja jälkeinen lisätiedoiksi. `exclude` = taulukot, jotka menevät
 * omiin dokumentteihinsa (ne eivät kuulu tekstivirtaan).
 */
function splitAround(
  $: CheerioAPI,
  pivot: Element | null,
  exclude: Element[],
): { before: Block[]; after: Block[] } {
  const body = $("body").get(0);
  if (!body) return { before: [], after: [] };
  if (!pivot) return { before: htmlToBlocks([body], new Set(exclude)), after: [] };

  // Merkitään pivot-kohta tekstivirtaan sentinel-tekstillä ja jaetaan siitä.
  const SENTINEL = "\u2063PIVOT\u2063";
  const marker = $(`<p>${SENTINEL}</p>`);
  $(pivot).before(marker);
  const blocks = htmlToBlocks([body], new Set([...exclude, pivot]));
  marker.remove();
  const idx = blocks.findIndex((b) => blockText(b).includes(SENTINEL));
  if (idx < 0) throw new Error("Taulukon jakokohta katosi tekstivirrasta");
  return { before: blocks.slice(0, idx), after: blocks.slice(idx + 1) };
}

// ─── Taulukot ──────────────────────────────────────────────────────────────

interface GridCell {
  el: Element;
  /** Tosi vain solun vasemmassa yläkulmassa (ei rowspan/colspan-kopio). */
  origin: boolean;
}

function directRows($: CheerioAPI, table: Element): Element[] {
  return $(table)
    .children("tbody, thead, tfoot")
    .children("tr")
    .add($(table).children("tr"))
    .get();
}

/** Purkaa taulukon ruudukoksi: colspan/rowspan auki eksplisiittisesti (§2.1.4). */
function tableGrid($: CheerioAPI, table: Element): (GridCell | null)[][] {
  const grid: (GridCell | null)[][] = [];
  directRows($, table).forEach((tr, r) => {
    grid[r] ??= [];
    let c = 0;
    for (const td of $(tr).children("td, th").get()) {
      while (grid[r][c]) c += 1;
      const colspan = Math.max(1, Number(td.attribs.colspan) || 1);
      const rowspan = Math.max(1, Number(td.attribs.rowspan) || 1);
      for (let dr = 0; dr < rowspan; dr += 1) {
        grid[r + dr] ??= [];
        for (let dc = 0; dc < colspan; dc += 1) {
          grid[r + dr][c + dc] = { el: td, origin: dr === 0 && dc === 0 };
        }
      }
      c += colspan;
    }
  });
  // Täytetään aukot, jotta jokainen rivi on yhtä pitkä.
  const width = Math.max(0, ...grid.map((row) => row.length));
  return grid.map((row) => Array.from({ length: width }, (_, i) => row[i] ?? null));
}

/** Ruudukon rivit teksteinä (kopiosolut tyhjinä). */
function gridTexts($: CheerioAPI, grid: (GridCell | null)[][]): string[][] {
  return grid.map((row) => row.map((cell) => (cell && cell.origin ? cellText($, cell.el) : "")));
}

/** Päättelee sarakkeen tyypin koko sarakkeesta (tyhjät ohitetaan). */
function inferType(values: string[]): ColumnType {
  const filled = values.filter((v) => v.trim() !== "");
  if (filled.length === 0) return "text";
  if (filled.every((v) => /^\d{4}$/.test(v) && Number(v) > 1850 && Number(v) < 2100)) return "year";
  if (filled.every((v) => /^-?\d+$/.test(v))) return "number";
  if (filled.every((v) => FI_DATE.test(v))) return "date";
  if (filled.every((v) => /^https?:\/\//.test(v))) return "link";
  return "text";
}

function keyFor(label: string, used: Set<string>): string {
  const base =
    label
      .toLowerCase()
      .replace(/[äå]/g, "a")
      .replace(/ö/g, "o")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "sarake";
  let key = base;
  let n = 2;
  while (used.has(key)) key = `${base}_${n++}`;
  used.add(key);
  return key;
}

function buildColumns(labels: string[], allRows: string[][], forced: Partial<Record<number, ColumnType>> = {}): Column[] {
  // Yhteenvetorivi (Yhteensä/Keskiarvo) ei kerro sarakkeen tyyppiä.
  const rows = withoutSummaryRows(allRows);
  const used = new Set<string>();
  return labels.map((label, i) => ({
    key: keyFor(label, used),
    label,
    type: forced[i] ?? inferType(rows.map((r) => r[i] ?? "")),
  }));
}

/** Numerosarakkeiden etunollat pois ("008" → "8"). */
function normalizeNumbers(columns: Column[], rows: string[][]): string[][] {
  return rows.map((row) => row.map((v, i) => (columns[i].type === "number" ? stripZeros(v) : v)));
}

/**
 * Sarjataulukko (9 saraketta): Joukkue O V T H TM - PM P.
 * Erotinsarake "-" yhdistetään maaleiksi "TM-PM" (family-notes M2).
 * Otsikkorivi puuttuu lähteestä → otsikot lisätään tässä (raportoidaan).
 */
const STANDINGS_LABELS = ["Joukkue", "Ottelut", "Voitot", "Tasapelit", "Häviöt", "Maalit", "Pisteet"];

function parseStandings(
  $: CheerioAPI,
  table: Element,
  issues: string[],
): { columns: Column[]; rows: string[][]; dataRows: number } {
  const texts = gridTexts($, tableGrid($, table)).filter((r) => r.some((v) => v !== ""));
  const rows: string[][] = [];
  for (const r of texts) {
    if (r.length !== 9) issues.push(`sarjataulukon rivillä ${r.length} solua (odotettu 9): ${r.join(" | ")}`);
    const [team, o, v, t, h, tm, sep, pm, p] = r;
    if (sep !== "-" && sep !== "") issues.push(`erotinsarakkeessa "${sep}" rivillä ${team}`);
    rows.push([team, o, v, t, h, `${stripZeros(tm)}-${stripZeros(pm)}`, p].map((x) => x ?? ""));
  }
  const columns = buildColumns(STANDINGS_LABELS, rows, { 5: "text" });
  return { columns, rows: normalizeNumbers(columns, rows), dataRows: texts.length };
}

// ─── Kuvat ─────────────────────────────────────────────────────────────────

let inventory: Map<string, KuvaRecord> = new Map();

function imageRecord(src: string): KuvaRecord | undefined {
  const key = src.trim().replace(/^\.?\//, "").split("?")[0].split("#")[0].replace(/[/\\]/g, "_");
  return inventory.get(key);
}

/** Kaikki sivun kuvat dokumenttijärjestyksessä (src + lähteen alt). */
function pageImages($: CheerioAPI, root?: Element): { src: string; alt: string; el: Element }[] {
  const scope = root ? $(root).find("img") : $("img");
  return scope.get().map((el) => ({ src: el.attribs.src ?? "", alt: clean(el.attribs.alt ?? ""), el }));
}

// ─── Sanavertailu (§1.6-esitarkistus) ──────────────────────────────────────

function words(text: string): string[] {
  return (text.toLowerCase().normalize("NFC").match(/[\p{L}\p{N}]+/gu) ?? []).map((w) =>
    /^\d+$/.test(w) ? String(Number(w)) : w,
  );
}

function docWords(d: HuuhkajaTilasto): string[] {
  const parts: string[] = [d.title];
  for (const b of [...d.intro, ...d.lisatiedot]) parts.push(blockText(b));
  for (const c of d.columns) parts.push(c.label);
  for (const r of d.rows) parts.push(r.join(" "));
  for (const k of d.kuvat) parts.push(k.caption ?? "", k.alt);
  return words(parts.join(" "));
}

/** Kattavuus: osuus lähteen sanoista (monijoukkona), jotka löytyvät dokumenteista. */
function coverage(sourceText: string, docs: HuuhkajaTilasto[], extra = ""): number {
  return coverageDetail(sourceText, docs, extra).osuus;
}

function coverageDetail(
  sourceText: string,
  docs: HuuhkajaTilasto[],
  extra = "",
): { osuus: number; puuttuvat: string[] } {
  const bag = new Map<string, number>();
  for (const w of [...docs.flatMap(docWords), ...words(extra)]) bag.set(w, (bag.get(w) ?? 0) + 1);
  const src = words(sourceText);
  if (src.length === 0) return { osuus: 1, puuttuvat: [] };
  let hit = 0;
  const missing: string[] = [];
  for (const w of src) {
    const n = bag.get(w) ?? 0;
    if (n > 0) {
      hit += 1;
      bag.set(w, n - 1);
    } else missing.push(w);
  }
  return { osuus: Math.round((hit / src.length) * 10000) / 10000, puuttuvat: [...new Set(missing)].slice(0, 40) };
}

function sourceBodyText($: CheerioAPI): string {
  const clone = $("body").clone();
  clone.find("br").replaceWith(" ");
  clone.find("img").each((_, el) => {
    // Lähteen alt-tekstit ovat sisältöä, jonka pitää säilyä (alt/kuvateksti).
    const alt = clean(el.attribs.alt ?? "");
    $(el).replaceWith(alt ? ` ${alt} ` : " ");
  });
  return clean(clone.text());
}

// ─── Sivukohtaiset tiedot ──────────────────────────────────────────────────

interface OttelutPage {
  file: string;
  alku: number;
  kisa: "EM" | "MM";
  kisavuosi: number;
  /** Karsintalohkon taulukon indeksi `$("table")`-järjestyksessä; null = ei vielä. */
  karsinta: number | null;
  /** Kansojen liigan lohkotaulukko omaksi dokumentikseen. */
  liiga?: { taulukko: number; lohko: string };
}

/**
 * Taulukkoindeksit tarkistettu käsin sivujen tekstistä ("Taulukko Lohko I:",
 * "KANSOJEN LIIGA Lohko 4" …) ja varmistetaan ajossa: jokaisessa taulukossa
 * pitää olla Suomi.
 */
const OTTELUT: OttelutPage[] = [
  { file: "ottelut2026ja2027.htm", alku: 2026, kisa: "EM", kisavuosi: 2028, karsinta: null, liiga: { taulukko: 0, lohko: "C-lohko" } },
  { file: "ottelut2024ja2025.htm", alku: 2024, kisa: "MM", kisavuosi: 2026, karsinta: 1, liiga: { taulukko: 0, lohko: "B-lohko 2" } },
  { file: "ottelut2022ja2023.htm", alku: 2022, kisa: "EM", kisavuosi: 2024, karsinta: 0, liiga: { taulukko: 1, lohko: "lohko 3" } },
  { file: "ottelut2020ja2021.htm", alku: 2020, kisa: "MM", kisavuosi: 2022, karsinta: 0, liiga: { taulukko: 1, lohko: "lohko 4" } },
  { file: "ottelut2018ja2019.htm", alku: 2018, kisa: "EM", kisavuosi: 2020, karsinta: 0, liiga: { taulukko: 2, lohko: "C-lohko 2" } },
  { file: "ottelut2016ja2017.htm", alku: 2016, kisa: "MM", kisavuosi: 2018, karsinta: 0 },
  { file: "ottelut2014ja2015.htm", alku: 2014, kisa: "EM", kisavuosi: 2016, karsinta: 0 },
  { file: "ottelut2012ja2013.htm", alku: 2012, kisa: "MM", kisavuosi: 2014, karsinta: 0 },
  { file: "ottelut2010ja2011.htm", alku: 2010, kisa: "EM", kisavuosi: 2012, karsinta: 0 },
  { file: "ottelut2008ja2009.htm", alku: 2008, kisa: "MM", kisavuosi: 2010, karsinta: 0 },
  { file: "ottelut2006ja2007.htm", alku: 2006, kisa: "EM", kisavuosi: 2008, karsinta: 0 },
];

/**
 * Ottelusivujen kuvat: alt lähteestä tai käsin katsottuna, kuvateksti sivun
 * tekstistä. Kuvatekstikappale poistetaan tekstivirrasta (se on nyt caption).
 */
const OTTELUT_KUVAT: Record<string, { alt: string; altLahde: Kuva["altLahde"]; caption?: string }> = {
  "maajoukkuekuva080602.jpg": {
    alt: "Suomen maajoukkueen avauskokoonpano ryhmäkuvassa ennen ottelua Veritas Stadionilla Turussa 02.06.2008",
    altLahde: "kasin",
    caption: "Kuva 02.06.2008 Veritas Stadion Turku",
  },
  "JensenFredrik220923.JPG": { alt: "Fredrik Jensen 23.09.2022", altLahde: "lahde" },
};

/**
 * Sarjataulukon tilanne virkkeenä tiivistelmään. Kuvaa taulukon tilaa
 * ("kärjessä on"), ei väitä lopputulosta — osa lähteen taulukoista on
 * päivitetty kesken karsinnan.
 */
function nlSentence(rows: string[][]): string | undefined {
  if (rows.length === 0) return undefined;
  const name = (r: string[]) => r[0].replace(/^\d+\.\s*/, "");
  const leader = rows[0];
  const finIdx = rows.findIndex((r) => name(r) === "Suomi");
  const parts = [`Taulukon kärjessä on ${name(leader)} (${leader[6]} pistettä)`];
  if (finIdx > 0) parts.push(`Suomi on sijalla ${finIdx + 1} (${rows[finIdx][6]} pistettä)`);
  if (finIdx === 0) parts[0] = `Taulukon kärjessä on Suomi (${leader[6]} pistettä)`;
  return `${parts.join(", ")}.`;
}

const TITLE_DUPLICATE = /^(huuhkajien\s+)?ottelut\s+\d{4}(\s*(ja|-|–)\s*\d{4})?$/i;

async function parseOttelut(
  docs: HuuhkajaTilasto[],
  cov: CoverageEntry[],
  dropped: DroppedImage[],
  report: Record<string, unknown>,
  jarjestysStart: number,
): Promise<void> {
  const coverageByPage: Record<string, number> = {};
  const notes: string[] = [];
  let order = jarjestysStart;

  for (const page of OTTELUT) {
    const $ = await loadPage(page.file);
    const tables = $("table").get();
    const issues: string[] = [];
    const loppu = page.alku + 1;
    const kausi = `${page.alku}–${loppu}`;
    const legacyUrl = `/${page.file}`;
    const slug = `karsinta-${page.kisa.toLowerCase()}-${page.kisavuosi}`;
    const title = `Suomen ottelut ${kausi} ja ${page.kisa} ${page.kisavuosi} -karsinta`;

    const karsintaTable = page.karsinta === null ? null : tables[page.karsinta];
    const liigaTable = page.liiga ? tables[page.liiga.taulukko] : undefined;

    for (const t of [karsintaTable, liigaTable]) {
      if (t && !cellText($, t).includes("Suomi")) {
        throw new Error(`${page.file}: taulukossa ei ole Suomea — indeksit väärin?`);
      }
    }

    const { before, after } = splitAround($, karsintaTable ?? liigaTable ?? null, liigaTable && karsintaTable ? [liigaTable] : []);

    // Kuvat: kuvatekstikappale pois tekstistä, kuva kuvat-kenttään.
    const kuvat: Kuva[] = [];
    const captionTexts = new Set<string>();
    for (const img of pageImages($)) {
      const rec = imageRecord(img.src);
      const meta = rec ? OTTELUT_KUVAT[rec.file] : undefined;
      if (!rec || !rec.ok || !meta) {
        dropped.push({ file: img.src, sivu: page.file, syy: rec ? "ei kuvausta — lisää OTTELUT_KUVAT-tauluun" : "ei inventaariossa" });
        continue;
      }
      kuvat.push({ file: rec.file, alt: meta.alt, altLahde: meta.altLahde, ...(meta.caption ? { caption: meta.caption } : {}), sivu: page.file });
      if (meta.caption) captionTexts.add(meta.caption);
    }

    const cleanBlocks = (blocks: Block[]) =>
      blocks.filter((b, i) => {
        const text = blockText(b).replace(/\s*\n\s*/g, " ").trim();
        if (captionTexts.has(text)) return false;
        // Sivun oma otsikko toistaa dokumentin otsikon.
        if (i < 3 && TITLE_DUPLICATE.test(text)) return false;
        // Paljas "Taulukko:"-rivi viittaa taulukkoon, joka on nyt omassa kentässään.
        if (/^taulukko:?$/i.test(text)) return false;
        return true;
      });

    let columns: Column[] = [];
    let rows: string[][] = [];
    let dataRows = 0;
    if (karsintaTable) {
      ({ columns, rows, dataRows } = parseStandings($, karsintaTable, issues));
    }

    const finalRow = rows.length ? nlSentence(rows) : undefined;
    const tiivistelma = [
      `Suomen A-maajoukkueen ottelut vuosina ${kausi}` +
        (karsintaTable ? ` ja ${page.kisa} ${page.kisavuosi} -karsinnan lohkotaulukko.` : "."),
      finalRow,
    ]
      .filter(Boolean)
      .join(" ");

    const main: HuuhkajaTilasto = {
      slug,
      title,
      category: "karsinta",
      tiivistelma,
      jarjestys: order++,
      legacyUrl,
      intro: cleanBlocks(before),
      lisatiedot: cleanBlocks(after),
      columns,
      rows,
      kuvat,
      sources: [],
      needsReview: false,
      reviewReasons: [],
      lahdeRivit: dataRows,
      lahde: { sivu: page.file, taulukko: page.karsinta === null ? "ei taulukkoa" : `table[${page.karsinta}]` },
    };
    if (!karsintaTable) {
      notes.push(`${page.file}: ${page.kisa} ${page.kisavuosi} -karsinta ei ole vielä alkanut lähteessä — päädokumentilla ei ole taulukkoa, vain ottelutekstit.`);
    }

    const pageDocs = [main];
    if (page.liiga && liigaTable) {
      const liiga = parseStandings($, liigaTable, issues);
      const doc: HuuhkajaTilasto = {
        slug: `kansojen-liiga-${page.alku}-${loppu}`,
        title: `Kansojen liiga ${kausi}: Suomen ${page.liiga.lohko}`,
        category: "huuhkajat",
        tiivistelma: [`Suomen lohkon sarjataulukko UEFA:n Kansojen liigassa ${kausi}.`, nlSentence(liiga.rows)].filter(Boolean).join(" "),
        jarjestys: 0,
        legacyUrl,
        intro: [],
        lisatiedot: [],
        columns: liiga.columns,
        rows: liiga.rows,
        kuvat: [],
        sources: [],
        needsReview: false,
        reviewReasons: [],
        lahdeRivit: liiga.dataRows,
        lahde: { sivu: page.file, taulukko: `table[${page.liiga.taulukko}]` },
      };
      pageDocs.push(doc);
    }

    if (issues.length) {
      main.needsReview = true;
      main.reviewReasons.push(...issues);
    }
    docs.push(...pageDocs);
    coverageByPage[page.file] = coverage(sourceBodyText($), pageDocs);
    cov.push({
      legacyUrl,
      tila: "migrated",
      kohde: slug,
      huomio:
        `Karsintasivu /jalkapalloarkisto/karsinnat/${slug}` +
        (page.liiga ? `; Kansojen liigan taulukko omana dokumenttinaan kansojen-liiga-${page.alku}-${loppu} (sama legacyUrl, ohjaus päädokumenttiin)` : ""),
    });
  }

  report.ottelut = { coverageByPage, notes };
}

// ─── arvostelu.htm ─────────────────────────────────────────────────────────

const ARVOSTELU_KUVAT: Record<
  string,
  { alt: string; altLahde: Kuva["altLahde"]; caption?: string; doc: "ranking" | "ottelut" }
> = {
  "Sparv191115.JPG": {
    alt: "Tim Sparv Suomen valkoisessa pelipaidassa numerolla 14, taustalla Teemu Pukki numerolla 10",
    altLahde: "kasin",
    doc: "ranking",
  },
  // Kuvatekstit sivun alalaidan rivistä (vasen kuva 26.03.2005, oikea 16.08.2006).
  "loiri_skaalattu.jpg": {
    alt: "Näkymä katsomosta kentälle ennen Tšekki – Suomi -ottelua, pelaajat lämmittelevät; etualalla kannattaja, jonka paidan selässä lukee Loiri 60",
    altLahde: "kasin",
    caption: "26.03.2005 Hieno matsi. Kyllä jää mieleen.",
    doc: "ottelut",
  },
  "p-irlantipeli_skaalattu.jpg": {
    alt: "Suomi – Pohjois-Irlanti -ottelu kuvattuna katsomosta, taustalla täysi pääkatsomo",
    altLahde: "kasin",
    caption: "16.08.2006 Olympiastadion",
    doc: "ottelut",
  },
};

/** Kuvat, jotka kuuluvat toisen agentin dokumentille (match-image-owner: tarkempi konteksti siellä). */
const ARVOSTELU_MUILLE: Record<string, string> = {
  "hyypia080820.jpg": "kuva esiintyy myös uutisarkistossa (kommentit2008q4 ym.) — omistaja M1, ei liitetä kahteen dokumenttiin",
  "litmanen080602C.jpg": "kuva esiintyy myös uutisarkistossa (kommentit2008q4) — omistaja M1, ei liitetä kahteen dokumenttiin",
};

const MATCH_HEAD = /^\((\d{2})\)\s*(\?\?|\d{2})\.(\?\?|\d{2})\.(\d{4}|\d+)\s*(.*)$/;

async function parseArvostelu(
  docs: HuuhkajaTilasto[],
  cov: CoverageEntry[],
  dropped: DroppedImage[],
  report: Record<string, unknown>,
): Promise<void> {
  const file = "arvostelu.htm";
  const $ = await loadPage(file);
  const tables = $("table").get();
  const issues: string[] = [];
  const legacyUrl = `/${file}`;

  // 1) Kokonaispisteet: taulukko, jonka riveillä "01. | Nimi | pisteet".
  const rankingTable = tables.find((t) => {
    const first = directRows($, t)[0];
    return first && /^01\.$/.test(cellText($, $(first).children("td").get(0)!));
  });
  if (!rankingTable) throw new Error("arvostelu: pistetaulukkoa ei löytynyt");
  const rankingRows = gridTexts($, tableGrid($, rankingTable))
    .filter((r) => /^\d+\.$/.test(r[0]))
    .map((r) => [r[0].replace(/\.$/, ""), r[1], r[2]]);
  const rankingColumns = buildColumns(["Sija", "Pelaaja", "Huuhkajat"], rankingRows);

  // 2) Avauskokoonpanot pisteiden mukaan (kolme jaksoa) → lisätiedot listoina.
  const formationBlocks: Block[] = [];
  const formationTable = tables.find((t) => /^Huuhkajat avauskokoonpano/.test(cellText($, directRows($, t)[0] ?? t)));
  if (formationTable) {
    const texts = gridTexts($, tableGrid($, formationTable));
    let current: string[] | null = null;
    for (const r of texts) {
      const joined = r.filter(Boolean);
      if (joined.length === 1 && /^Huuhkajat avauskokoonpano/.test(joined[0])) {
        current = [];
        formationBlocks.push(plainBlock(joined[0], "h3"));
        continue;
      }
      if (joined.some((v) => MATCH_HEAD.test(v) || /^Kuva puuttuu/.test(v))) break;
      if (current && joined.length) formationBlocks.push(bulletBlock(joined.join(", ")));
    }
  } else {
    issues.push("avauskokoonpanotaulukkoa ei löytynyt");
  }

  // 3) Ottelukohtaiset valinnat: solu "(NN) pp.kk.vvvv [stadion]" + alla ottelu ja sijat 1–3.
  interface Match {
    nro: number;
    pvm: string;
    ottelu: string;
    stadion: string;
    sijat: string[];
    kuva?: string;
  }
  const matches = new Map<number, Match>();
  const skipped: string[] = [];
  /** Ottelut, joiden kuvan paikalla on lähteessä selitys ("Kuva puuttuu, koska …"). */
  const noImage: { nro: number; text: string }[] = [];
  for (const table of tables) {
    const grid = tableGrid($, table);
    grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (!cell || !cell.origin) return;
        if ($(cell.el).find("table").length) return; // sisäkkäisen taulukon kääre
        const head = cellText($, cell.el);
        const m = MATCH_HEAD.exec(head);
        if (!m) return;
        const [, nro, dd, mm, yyyy, rest] = m;
        if (dd === "??" || mm === "??" || !/^\d{4}$/.test(yyyy)) {
          skipped.push(`(${nro}) ${head} — päivä puuttuu lähteestä, ottelu tulevaisuudessa`);
          return;
        }
        const at = (dr: number) => {
          const g = grid[r + dr]?.[c];
          return g && g.origin ? cellText($, g.el, "\n") : "";
        };
        const matchLines = at(1).split("\n").map(clean).filter(Boolean);
        const sijat = [at(2), at(3), at(4)].map((s, i) => {
          const t = clean(s.replace(/\n/g, " "));
          // "1. Hyypiä" → "Hyypiä"; poikkeava numero (jaettu sija) säilyy sellaisenaan.
          const pm = /^(\d)\.\s*(.*)$/.exec(t);
          if (pm && Number(pm[1]) === i + 1) return pm[2];
          if (pm) issues.push(`ottelu (${nro}): sija ${i + 1} merkitty lähteessä "${t}" — säilytetty sellaisenaan`);
          return t;
        });
        // Kuva on ottelusolun vasemmalla puolella (rowspan-solu).
        const left = c > 0 ? grid[r][c - 1] : null;
        const img = left && left.origin ? $(left.el).find("img").get(0) : undefined;
        const nroNum = Number(nro);
        const leftText = left && left.origin ? cellText($, left.el) : "";
        if (/^Kuva puuttuu/.test(leftText)) noImage.push({ nro: nroNum, text: leftText });
        if (matches.has(nroNum)) issues.push(`ottelunumero (${nro}) toistuu`);
        matches.set(nroNum, {
          nro: nroNum,
          pvm: `${dd}.${mm}.${yyyy}`,
          ottelu: matchLines[0] ?? "",
          stadion: clean(rest) || matchLines.slice(1).join(", "),
          sijat,
          ...(img ? { kuva: img.attribs.src } : {}),
        });
      });
    });
  }
  const matchList = [...matches.values()].sort((a, b) => b.nro - a.nro);
  const expected = Number(/\((\d+)\s*ottelua\)/.exec(cellText($, $("body").get(0) as Element))?.[1] ?? 0);
  if (matchList.length !== expected) issues.push(`otteluita jäsennetty ${matchList.length}, otsikon mukaan ${expected}`);
  for (let n = 1; n <= expected; n += 1) if (!matches.has(n)) issues.push(`ottelu (${String(n).padStart(2, "0")}) puuttuu`);

  const matchRows = matchList.map((m) => [String(m.nro), m.pvm, m.ottelu, m.stadion, ...m.sijat]);
  const matchColumns = buildColumns(
    ["Nro", "Päivämäärä", "Ottelu", "Stadion", "Kolme Huuhkajaa", "Kaksi Huuhkajaa", "Yksi Huuhkaja"],
    matchRows,
  );

  // Kuvat: otteluohjelmat ottelun mukaan, muut käsin kuvatut.
  const matchKuvat: Kuva[] = [];
  const rankingKuvat: Kuva[] = [];
  const usedFiles = new Set<string>();
  const bySrc = new Map(matchList.filter((m) => m.kuva).map((m) => [imageRecord(m.kuva!)?.file, m]));
  for (const img of pageImages($)) {
    const rec = imageRecord(img.src);
    if (!rec || !rec.ok) {
      dropped.push({ file: img.src, sivu: file, syy: "ei ladattavissa inventaariosta" });
      continue;
    }
    if (usedFiles.has(rec.file)) continue;
    usedFiles.add(rec.file);
    const match = bySrc.get(rec.file);
    if (match) {
      matchKuvat.push({
        file: rec.file,
        alt: `Otteluohjelma tai lippu ottelusta ${match.ottelu} ${match.pvm}`.slice(0, 200),
        altLahde: "data",
        caption: `(${String(match.nro).padStart(2, "0")}) ${match.pvm} ${match.ottelu}${match.stadion ? `, ${match.stadion}` : ""}`,
        sivu: file,
      });
      continue;
    }
    if (ARVOSTELU_MUILLE[rec.file]) {
      dropped.push({ file: rec.file, sivu: file, syy: ARVOSTELU_MUILLE[rec.file] });
      continue;
    }
    const meta = ARVOSTELU_KUVAT[rec.file];
    if (meta) {
      const target = meta.doc === "ottelut" ? matchKuvat : rankingKuvat;
      target.push({ file: rec.file, alt: meta.alt, altLahde: meta.altLahde, ...(meta.caption ? { caption: meta.caption } : {}), sivu: file });
      continue;
    }
    dropped.push({ file: rec.file, sivu: file, syy: "kuvaa ei voitu liittää otteluun eikä sille ole kuvausta" });
    issues.push(`kuva ${rec.file} jäi liittämättä`);
  }

  // Sivun muu teksti: säännöt (3 riviä) introksi.
  const allBlocks = htmlToBlocks([$("body").get(0)!]);
  const rules = allBlocks.filter((b) => /^Ottelun (paras|toiseksi|kolmanneksi)/.test(blockText(b)));
  // Sivun alalaidan rivi "26.03.2005 Hieno matsi. Kyllä jää mieleen. … 16.08.2006 Olympiastadion"
  // on kahden alla olevan kuvan kuvatekstit (vasen ja oikea) → captioneiksi, ei tekstiksi.
  const captionLine = allBlocks.map(blockText).find((t) => /^26\.03\.2005 Hieno matsi/.test(t)) ?? "";
  for (const k of matchKuvat) {
    if (k.caption && !captionLine.includes(k.caption)) {
      if (k.file === "loiri_skaalattu.jpg" || k.file === "p-irlantipeli_skaalattu.jpg") {
        throw new Error(`arvostelu: kuvateksti "${k.caption}" ei löydy lähteestä`);
      }
    }
  }
  const comment: Block[] = [];
  // Lähteessä selitys toistuu jokaisen kuvattoman ottelun kohdalla → yksi kooste.
  const noImageDated = noImage.filter((n) => matches.has(n.nro)).sort((a, b) => b.nro - a.nro);
  for (const reason of [...new Set(noImageDated.map((n) => n.text))]) {
    const nros = noImageDated.filter((n) => n.text === reason).map((n) => `(${String(n.nro).padStart(2, "0")})`);
    comment.push(plainBlock(`Otteluista ${nros.join(", ")}: ${reason}`));
  }

  const top = rankingRows[0];
  const rankingDoc: HuuhkajaTilasto = {
    slug: "huuhkaja-arvostelu",
    title: `Suomen A-maaottelujen Huuhkajat 2005–${matchList[0]?.pvm.slice(-4) ?? ""}`,
    category: "huuhkajat",
    tiivistelma:
      `Jokaisen Suomen A-maaottelun paras pelaaja saa kolme Huuhkajaa, toiseksi paras kaksi ja kolmanneksi paras yhden. ` +
      `Kärjessä on ${top[1]} ${top[2]} Huuhkajalla (${expected} ottelua).`,
    jarjestys: 20,
    legacyUrl,
    intro: rules,
    lisatiedot: formationBlocks,
    columns: rankingColumns,
    rows: normalizeNumbers(rankingColumns, rankingRows),
    kuvat: rankingKuvat,
    sources: [],
    needsReview: false,
    reviewReasons: [],
    lahdeRivit: rankingRows.length,
    lahde: { sivu: file, taulukko: `table[${tables.indexOf(rankingTable)}]` },
  };
  const matchDoc: HuuhkajaTilasto = {
    slug: "huuhkaja-arvostelu-ottelut",
    title: `Suomen A-maaottelujen Huuhkajat otteluittain 2005–${matchList[0]?.pvm.slice(-4) ?? ""}`,
    category: "huuhkajat",
    tiivistelma: `Suomen A-maaotteluiden kolme parasta pelaajaa ottelu kerrallaan: ${expected} ottelua ${matchList[matchList.length - 1]?.pvm} – ${matchList[0]?.pvm}.`,
    jarjestys: 21,
    legacyUrl,
    intro: [],
    lisatiedot: comment,
    columns: matchColumns,
    rows: normalizeNumbers(matchColumns, matchRows),
    kuvat: matchKuvat,
    sources: [],
    needsReview: false,
    reviewReasons: [],
    lahdeRivit: matchList.length,
    lahde: { sivu: file, taulukko: "otteluruudut (sisäkkäiset taulukot)" },
  };
  if (issues.length) {
    // Poikkeamat (jaetut sijat) kirjataan raporttiin; ne ovat lähteen omia merkintöjä.
    const blocking = issues.filter((i) => !/säilytetty sellaisenaan/.test(i));
    if (blocking.length) {
      matchDoc.needsReview = true;
      matchDoc.reviewReasons.push(...blocking);
    }
  }
  docs.push(rankingDoc, matchDoc);
  report.arvostelu = {
    coverage: coverageDetail(sourceBodyText($), [rankingDoc, matchDoc]),
    otteluita: matchList.length,
    odotettu: expected,
    ohitetut: skipped,
    huomiot: issues,
  };
  cov.push({
    legacyUrl,
    tila: "migrated",
    kohde: "huuhkaja-arvostelu",
    huomio: "Kokonaispisteet + avauskokoonpanot; ottelukohtaiset valinnat omana dokumenttinaan huuhkaja-arvostelu-ottelut (sama legacyUrl)",
  });
}

// ─── pelaajatilasto.htm ────────────────────────────────────────────────────

async function parsePelaajatilasto(docs: HuuhkajaTilasto[], cov: CoverageEntry[], report: Record<string, unknown>): Promise<void> {
  const file = "pelaajatilasto.htm";
  const $ = await loadPage(file);
  const table = $("table").get(0)!;
  const texts = gridTexts($, tableGrid($, table));
  const caps: string[][] = [];
  const goals: string[][] = [];
  let paivitetty: string | undefined;
  for (const r of texts) {
    for (const v of r) if (FI_DATE.test(v)) paivitetty = toIso(v);
    if (/^\d+\.$/.test(r[0])) caps.push([r[0].replace(/\.$/, ""), r[1], r[2]]);
    if (/^\d+\.$/.test(r[4] ?? "")) goals.push([r[4].replace(/\.$/, ""), r[6], r[7]]);
  }
  const capCols = buildColumns(["Sija", "Pelaaja", "A-maaottelut"], caps);
  const goalCols = buildColumns(["Sija", "Pelaaja", "Maalit"], goals);

  // Kuvat: kuvateksti "Jari Litmanen 02.06.2008 ja Teemu Pukki 15.10.2019 Veritas Stadion Turku".
  const imgs = pageImages($);
  const litmanen = imgs.find((i) => /litmanen080602A/i.test(i.src));
  const pukki = imgs.find((i) => /Pukki191015/i.test(i.src));
  const kuva = (src: string | undefined, alt: string, caption: string, lahde: Kuva["altLahde"]): Kuva[] => {
    const rec = src ? imageRecord(src) : undefined;
    return rec?.ok ? [{ file: rec.file, alt, altLahde: lahde, caption, sivu: file }] : [];
  };
  const captionText = "Jari Litmanen 02.06.2008 ja Teemu Pukki 15.10.2019 Veritas Stadion Turku";
  const blocks = htmlToBlocks([$("body").get(0)!], new Set([table])).filter(
    (b) => blockText(b).replace(/\s+/g, " ").trim() !== captionText,
  );

  const common = { category: "huuhkajat" as const, legacyUrl: `/${file}`, sources: [], needsReview: false, reviewReasons: [] };
  const capDoc: HuuhkajaTilasto = {
    ...common,
    slug: "huuhkajat-pelaajatilasto-a-maaottelut",
    title: "Pelaajatilasto: eniten A-maaotteluita",
    tiivistelma: `Eniten A-maaotteluita Suomen maajoukkueessa on pelannut ${caps[0][1]} (${caps[0][2]} ottelua). Listalla ${caps.length} pelaajaa.`,
    jarjestys: 10,
    ...(paivitetty ? { paivitetty } : {}),
    intro: blocks,
    lisatiedot: [],
    columns: capCols,
    rows: normalizeNumbers(capCols, caps),
    kuvat: kuva(litmanen?.src, "Jari Litmanen 02.06.2008", "Jari Litmanen 02.06.2008", "kuvateksti"),
    lahdeRivit: caps.length,
    lahde: { sivu: file, taulukko: "table[0] vasen puolisko (sarakkeet 1–3)" },
  };
  const goalDoc: HuuhkajaTilasto = {
    ...common,
    slug: "huuhkajat-pelaajatilasto-maalit",
    title: "Pelaajatilasto: eniten A-maaottelumaaleja",
    tiivistelma: `Suomen A-maajoukkueen eniten maaleja tehnyt pelaaja on ${goals[0][1]} (${goals[0][2]} maalia). Listalla ${goals.length} pelaajaa.`,
    jarjestys: 11,
    ...(paivitetty ? { paivitetty } : {}),
    intro: [],
    lisatiedot: [],
    columns: goalCols,
    rows: normalizeNumbers(goalCols, goals),
    kuvat: kuva(pukki?.src, pukki?.alt || "Teemu Pukki 15.10.2019", "Teemu Pukki 15.10.2019 Veritas Stadion Turku", "lahde"),
    lahdeRivit: goals.length,
    lahde: { sivu: file, taulukko: "table[0] oikea puolisko (sarakkeet 5–8)" },
  };
  docs.push(capDoc, goalDoc);
  report.pelaajatilasto = {
    coverage: coverage(sourceBodyText($), [capDoc, goalDoc], "PELAAJATILASTO A-maaottelut A-maaottelujen maalit"),
    otteluRivit: caps.length,
    maaliRivit: goals.length,
    paivitetty,
    huomio: "Lähteen yksi taulukko sisältää kaksi rinnakkaista listaa (38 + 20 riviä) → kaksi dokumenttia. Päivitysmerkintä 26.09.2026 → paivitetty.",
  };
  cov.push({
    legacyUrl: `/${file}`,
    tila: "migrated",
    kohde: capDoc.slug,
    huomio: "Kaksi rinnakkaista listaa → huuhkajat-pelaajatilasto-a-maaottelut + huuhkajat-pelaajatilasto-maalit (sama legacyUrl)",
  });
}

// ─── englanninylintasohuuhkajat.htm ────────────────────────────────────────

async function parseEnglanti(docs: HuuhkajaTilasto[], cov: CoverageEntry[], report: Record<string, unknown>): Promise<void> {
  const file = "englanninylintasohuuhkajat.htm";
  const $ = await loadPage(file);
  const [t0, t1] = $("table").get();
  const parse = (t: Element) => {
    const texts = gridTexts($, tableGrid($, t)).filter((r) => r.some(Boolean));
    const [head, ...rows] = texts;
    const labels = head.map((l, i) => l || (i === 0 ? "Nro" : `Sarake ${i + 1}`));
    const columns = buildColumns(labels, rows);
    return { columns, rows: normalizeNumbers(columns, rows), dataRows: rows.length };
  };
  const players = parse(t0);
  const clubs = parse(t1);
  const { before, after } = splitAround($, t0, [t1]);
  const pageTitle = "Huuhkajat Englannin ylimmällä sarjatasolla";
  // Sivun alussa otsikko + päiväys ("02.05.2024") = taulukon päivitysmerkintä → paivitetty.
  let paivitetty: string | undefined;
  const intro = before.filter((b) => {
    const lines = blockText(b).split("\n").map((l) => l.trim());
    if (lines[0] !== pageTitle) return true;
    const date = lines.slice(1).find((l) => FI_DATE.test(l));
    if (date) paivitetty = toIso(date);
    return lines.slice(1).some((l) => l && !FI_DATE.test(l));
  });
  const lisatiedot = after;

  const total = players.rows.find((r) => /yhteensä/i.test(r[1]));
  const playerRows = players.rows.filter((r) => !/yhteensä/i.test(r[1]));
  const most = [...playerRows].sort((a, b) => Number(b[5]) - Number(a[5]))[0];
  const common = { category: "huuhkajat" as const, legacyUrl: `/${file}`, sources: [], needsReview: false, reviewReasons: [], kuvat: [] };
  const playerDoc: HuuhkajaTilasto = {
    ...common,
    slug: "huuhkajat-englannin-ylimmalla-sarjatasolla",
    title: pageTitle,
    tiivistelma:
      `Englannin ylimmällä sarjatasolla on pelannut ${playerRows.length} Suomen maajoukkuepelaajaa` +
      (total ? `, yhteensä ${total[5]} ottelua ja ${total[6]} maalia` : "") +
      `. Eniten otteluita: ${most[1]} (${most[5]}).`,
    jarjestys: 30,
    ...(paivitetty ? { paivitetty } : {}),
    intro,
    lisatiedot,
    columns: players.columns,
    rows: players.rows,
    lahdeRivit: players.dataRows,
    lahde: { sivu: file, taulukko: "table[0]" },
  };
  const clubDoc: HuuhkajaTilasto = {
    ...common,
    slug: "huuhkajat-englannin-ylimmalla-sarjatasolla-seurat",
    title: `${pageTitle}: seurat`,
    tiivistelma: `Suomalaisten maajoukkuepelaajien ottelut ja maalit Englannin ylimmällä sarjatasolla seuroittain. Eniten otteluita: ${clubs.rows[0][1]} (${clubs.rows[0][2]}).`,
    jarjestys: 31,
    intro: [],
    lisatiedot: [],
    columns: clubs.columns,
    rows: clubs.rows,
    lahdeRivit: clubs.dataRows,
    lahde: { sivu: file, taulukko: "table[1]" },
  };
  docs.push(playerDoc, clubDoc);
  report.englanti = {
    coverage: coverage(sourceBodyText($), [playerDoc, clubDoc]),
    huomio: "Otsikkorivin tyhjä ensimmäinen sarake nimetty 'Nro'. Yhteensä-rivi säilytetty datarivinä kuten lähteessä.",
  };
  cov.push({
    legacyUrl: `/${file}`,
    tila: "migrated",
    kohde: playerDoc.slug,
    huomio: "Pelaajat + seurat (huuhkajat-englannin-ylimmalla-sarjatasolla-seurat, sama legacyUrl)",
  });
}

// ─── suomenparasavauskokoonpano.htm + kuvasivut ────────────────────────────

/** Kaaviokuvat: alt kirjoitettu kuvaa katsomalla. Data on vain kuvana (ks. needsReview). */
const KAAVIOT: Record<string, { alt: string; caption?: string }> = {
  "huukajienika.png": {
    alt: "Viivakaavio: Suomen A-maajoukkueen parhaan avauksen keskimääräinen ikä vuosina 2004–2016, vaihteluväli noin 27–31,5 vuotta",
    caption: "Suomen jalkapallomaajoukkueen parhaan avauksen keskimääräinen ikä",
  },
  "ika.jpg": {
    alt: "Viivakaavio: parhaan avauksen keskimääräinen ikä otteluittain 3.2.2004–9.9.2009, noususuunta noin 27 vuodesta lähes 32 vuoteen",
    caption: "Suomen maajoukkueen parhaan avauksen keskimääräinen ikä",
  },
  "Maaottelut2009.jpg": {
    alt: "Viivakaavio: avauskokoonpanon pelaajien yhteenlaskettu maaotteluiden määrä otteluittain 2004–2009, parhaat ja toteutuneet avaukset rinnakkain",
    caption: "Suomen maajoukkueen avauskokoonpanon pelaajien ottelumäärä yhteensä",
  },
  "ottelut2004_6.jpg": {
    alt: "Taulukko Suomen A-maaotteluista 2004–2006: päivämäärä, ottelu, paikka, tulos, yleisö sekä pelaajien pelatut ottelut, maalit ja kortit",
    caption: "Toteutunut avaus: A-maaottelut 2004–2006",
  },
  "ottelut2004_6b.jpg": {
    alt: "Jatko A-maaottelutaulukolle 2004–2006: pelaajat 31–64 ja otteluiden yhteenlasketut maaottelumäärät",
    caption: "Toteutunut avaus: A-maaottelut 2004–2006 (jatkoa)",
  },
};

const AVAUS_MERGED = [
  "pelaajienottelumaara.htm",
  "suomenika.htm",
  "maaottelut2004_6.htm",
  "suomen%20paras%20avauskokoonpano.htm",
];

async function parseAvaus(
  docs: HuuhkajaTilasto[],
  cov: CoverageEntry[],
  dropped: DroppedImage[],
  report: Record<string, unknown>,
): Promise<void> {
  const file = "suomenparasavauskokoonpano.htm";
  const $ = await loadPage(file);
  const table = $("table").get(0)!;
  const grid = tableGrid($, table);
  const issues: string[] = [];

  // Taulukko on viisi peräkkäistä lohkoa, joilla on oma "Pelaaja | vuosi …" -otsikkorivi.
  interface Lohko {
    years: string[];
    rows: string[][];
  }
  const lohkot: Lohko[] = [];
  let sourceDataRows = 0;
  for (const row of grid) {
    const texts = row.map((cell) => (cell && cell.origin ? cellText($, cell.el) : ""));
    if (texts[0] === "Pelaaja") {
      lohkot.push({ years: texts.slice(1).filter((t) => /^\d{4}$/.test(t)), rows: [] });
      continue;
    }
    if (!texts[0] || !lohkot.length) {
      if (texts.some(Boolean)) issues.push(`rivi ilman pelaajaa: ${texts.join(" | ")}`);
      continue;
    }
    const lohko = lohkot[lohkot.length - 1];
    const n = lohko.years.length;
    // Sininen (#000080) seura = pelaaja kuului vuoden parhaaseen avaukseen → merkitään tähdellä.
    const values = row.slice(1, n + 1).map((cell) => {
      if (!cell || !cell.origin) return "";
      const text = cellText($, cell.el);
      const blue = $(cell.el).find('font[color="#000080" i]').length > 0;
      return text && blue && text !== "-" ? `${text} *` : text;
    });
    const extra = texts.slice(n + 1).filter(Boolean);
    if (extra.length) issues.push(`ylimääräisiä soluja rivillä ${texts[0]}: ${extra.join(", ")}`);
    lohko.rows.push([texts[0], ...values]);
    sourceDataRows += 1;
  }

  // Sivun teksti (otsikko + selite) → päädokumentin intro.
  const pageBlocks = htmlToBlocks([$("body").get(0)!], new Set([table]));
  const legend = plainBlock(
    "Tässä taulukossa parhaaseen avaukseen kuuluneen pelaajan seura on merkitty tähdellä (*); vanhalla sivulla se oli sinisellä.",
  );

  // Kuvat: vuosittaiset avauskuvat tältä sivulta + kaaviot yhdistetyiltä sivuilta.
  const kuvat: Kuva[] = [];
  const seen = new Set<string>();
  const addImage = (src: string, sivu: string, sourceAlt: string) => {
    const rec = imageRecord(src);
    if (!rec || !rec.ok) {
      dropped.push({ file: src, sivu, syy: "ei ladattavissa inventaariosta" });
      return;
    }
    if (seen.has(rec.file)) return;
    seen.add(rec.file);
    const year = /(\d{4})/.exec(rec.file)?.[1];
    const kaavio = KAAVIOT[rec.file];
    if (kaavio) {
      kuvat.push({ file: rec.file, alt: kaavio.alt, altLahde: sourceAlt ? "lahde" : "kasin", ...(kaavio.caption ? { caption: kaavio.caption } : {}), sivu });
    } else if (year && /avaus/i.test(rec.file)) {
      kuvat.push({
        file: rec.file,
        alt: `Suomen maajoukkueen paras avauskokoonpano ${year} kenttäkaaviona pelaajien nimin`,
        altLahde: "data",
        caption: `Suomen paras avaus ${year}`,
        sivu,
      });
    } else {
      dropped.push({ file: rec.file, sivu, syy: "tuntematon kuva — ei kuvausta" });
      issues.push(`kuva ${rec.file} jäi ilman kuvausta`);
    }
  };
  for (const img of pageImages($)) addImage(img.src, file, img.alt);

  // Yhdistetyt kuvasivut: teksti lisätietoihin omien väliotsikoidensa alle.
  const mergedBlocks: Block[] = [];
  const mergedCoverage: Record<string, number> = {};
  const mergedPages: { file: string; $: CheerioAPI }[] = [];
  for (const merged of AVAUS_MERGED) {
    const $m = await loadPage(merged);
    mergedPages.push({ file: merged, $: $m });
    for (const img of pageImages($m)) addImage(img.src, merged, img.alt);
    const blocks = htmlToBlocks([$m("body").get(0)!]);
    // "suomen paras avauskokoonpano" on tämän sivun varhaisempi versio: vain otsikko + samat kuvat.
    if (merged.startsWith("suomen%20")) continue;
    // Linkit "-> Paras avaus" / "-> Toteutunut avaus" osoittivat sivuille, jotka
    // ovat nyt tämä sama dokumentti → linkki pois, teksti jää.
    const selfTargets = new Set([file, ...AVAUS_MERGED].map((f) => mapHref(f)));
    mergedBlocks.push(
      ...blocks.map((b) => ({
        ...b,
        spans: mergeSpans(b.spans.map((s) => (s.href && selfTargets.has(s.href) ? { text: s.text, marks: s.marks } : s))),
      })),
    );
  }

  const labelsFor = (l: Lohko) => ["Pelaaja", ...l.years];
  const lohkoDocs: HuuhkajaTilasto[] = lohkot.map((l, i) => {
    const span = `${l.years[0]}–${l.years[l.years.length - 1]}`;
    const columns = buildColumns(labelsFor(l), l.rows, Object.fromEntries(l.years.map((_, j) => [j + 1, "text" as ColumnType])));
    return {
      slug: `suomen-paras-avauskokoonpano-${l.years[0]}-${l.years[l.years.length - 1]}`,
      title: `Suomen paras avauskokoonpano: pelaajien seurat ${span}`,
      category: "huuhkajat" as const,
      tiivistelma: `Suomen maajoukkueen parhaan avauskokoonpanon pelaajien seurat vuoden lopussa ${span}.`,
      jarjestys: 40 + i,
      legacyUrl: `/${file}`,
      intro: i === 0 ? [...pageBlocks, legend] : [legend],
      lisatiedot: [],
      columns,
      rows: l.rows,
      kuvat: [],
      sources: [],
      needsReview: false,
      reviewReasons: [],
      lahdeRivit: l.rows.length,
      lahde: { sivu: file, taulukko: `table[0] lohko ${i + 1}/${lohkot.length}` },
    };
  });
  const primary = lohkoDocs[0];
  primary.muutLegacyUrlit = AVAUS_MERGED.map((f) => `/${f}`);
  primary.lisatiedot = mergedBlocks;
  primary.kuvat = kuvat;
  // Data vain kaavioina (ikä, ottelumäärät, toteutunut avaus): ei voi siirtää tekstitaulukoksi.
  primary.needsReview = true;
  primary.reviewReasons.push(
    "Yhdistettyjen sivujen (pelaajienottelumaara, suomenika, maaottelut2004_6) data on vain kaaviokuvina — kuvat liitetty alt-teksteineen, mutta lukuja ei ole tekstinä (docs/12 §3 M2).",
  );
  if (issues.length) primary.reviewReasons.push(...issues);

  docs.push(...lohkoDocs);
  for (const m of mergedPages) mergedCoverage[m.file] = coverage(sourceBodyText(m.$), [primary]);
  report.avauskokoonpano = {
    coverage: coverage(sourceBodyText($), lohkoDocs),
    mergedCoverage,
    lohkot: lohkot.map((l) => ({ vuodet: l.years.join(","), rivit: l.rows.length })),
    lahdeDatarivit: sourceDataRows,
    kuvia: kuvat.length,
    huomiot: issues,
  };
  cov.push({
    legacyUrl: `/${file}`,
    tila: "migrated",
    kohde: primary.slug,
    huomio: `Viisi vuosilohkoa → ${lohkoDocs.map((d) => d.slug).join(", ")} (sama legacyUrl, ohjaus ensimmäiseen)`,
  });
  const mergedNotes: Record<string, string> = {
    "pelaajienottelumaara.htm": "Data vain kaaviona (Maaottelut2009.jpg) + päivämäärälista; kaavio ja teksti liitetty päädokumenttiin (muutLegacyUrlit)",
    "suomenika.htm": "Data vain kaavioina (huukajienika.png, ika.jpg); kaaviot ja teksti liitetty päädokumenttiin (muutLegacyUrlit)",
    "maaottelut2004_6.htm": "Toteutunut avaus 2004–2006 vain taulukkokuvina (2 kpl); kuvat liitetty päädokumenttiin (muutLegacyUrlit)",
    "suomen%20paras%20avauskokoonpano.htm": "Varhaisempi versio samasta sivusta: otsikko + avauskuvat 2004–2007, jotka ovat jo päädokumentissa",
  };
  for (const f of AVAUS_MERGED) {
    cov.push({ legacyUrl: `/${f}`, tila: "merged", kohde: primary.slug, huomio: mergedNotes[f] });
  }
}

// ─── unohtumattomat.htm ────────────────────────────────────────────────────

async function parseUnohtumattomat(docs: HuuhkajaTilasto[], cov: CoverageEntry[], report: Record<string, unknown>): Promise<void> {
  const file = "unohtumattomat.htm";
  const $ = await loadPage(file);
  const blocks = htmlToBlocks([$("body").get(0)!]);

  // Rivit: "Valokuvia:"-otsikon jälkeiset rivit ovat albumeita (Picasa, kuollut).
  const lines: string[] = [];
  const introBlocks: Block[] = [];
  let inPhotos = false;
  for (const b of blocks) {
    const text = blockText(b);
    if (/^Valokuvia:?$/i.test(text.trim())) {
      inPhotos = true;
      continue;
    }
    if (!inPhotos) {
      // "Unohtumattomat maalit:" -kappaleessa voi olla myös "Valokuvia:"-rivi.
      const idx = b.spans.findIndex((s) => /Valokuvia:/.test(s.text));
      if (idx >= 0) {
        const head: Span[] = [];
        for (const s of b.spans) {
          if (/Valokuvia:/.test(s.text)) {
            const [pre, post] = s.text.split(/Valokuvia:/);
            if (pre.trim()) head.push({ ...s, text: pre.replace(/\n+$/, "") });
            lines.push(...post.split("\n"));
            inPhotos = true;
            continue;
          }
          if (inPhotos) lines.push(...s.text.split("\n"));
          else head.push(s);
        }
        if (head.length) introBlocks.push({ ...b, spans: mergeSpans(head) });
        continue;
      }
      introBlocks.push(b);
      continue;
    }
    lines.push(...text.split("\n"));
  }

  const rows: string[][] = [];
  const unparsed: string[] = [];
  const DATE_ANY = /(\d{1,2}(?:\.\d{1,2})?\.?-)?\d{1,2}\.\d{1,2}\.\d{4}/;
  for (const raw of lines.map(clean).filter(Boolean)) {
    const dm = DATE_ANY.exec(raw);
    if (!dm) {
      unparsed.push(raw);
      rows.push(["", raw, ""]);
      continue;
    }
    const date = dm[0];
    let rest = clean(raw.replace(date, " "));
    const score = /(?:^|\s)(\d{1,2}-\d{1,2})(?=\s|$)/.exec(rest);
    let tulos = "";
    if (score) {
      tulos = score[1];
      rest = clean(rest.replace(score[0], " "));
    }
    rows.push([date, rest, tulos]);
  }
  const columns = buildColumns(["Päivämäärä", "Ottelu tai tapahtuma", "Tulos"], rows, { 0: "date" });
  const splitHeading = introBlocks.flatMap((b) => {
    // "Unohtumattomat maalit:" on otsikko, loput sen alla linkkeinä.
    const first = b.spans[0];
    if (first && /^Unohtumattomat maalit:?/.test(first.text) && first.marks.includes("strong")) {
      const rest = b.spans
        .slice(1)
        .map((s, i) => (i === 0 ? { ...s, text: s.text.replace(/^\n+/, "") } : s))
        .filter((s) => s.text.length > 0);
      return [plainBlock(first.text.replace(/\n+$/, "").trim(), "h3"), ...(rest.length ? [{ style: "normal" as const, spans: rest }] : [])];
    }
    return [b];
  });

  const doc: HuuhkajaTilasto = {
    slug: "unohtumattomat",
    title: "Unohtumattomat maalit ja ottelukuvat",
    category: "muu",
    tiivistelma: `Kaksi unohtumatonta maalia (Suomi – Unkari 11.10.1997) videolinkkeinä sekä luettelo ${rows.length} ottelusta ja tapahtumasta vuosilta ${rows.filter((r) => r[0]).map((r) => r[0].slice(-4)).sort()[0]}–${rows.filter((r) => r[0]).map((r) => r[0].slice(-4)).sort().slice(-1)[0]}, joista vanhalla sivustolla oli valokuva-albumi.`,
    jarjestys: 0,
    legacyUrl: `/${file}`,
    // "Valokuvia:" jää otsikoksi suoraan taulukon yläpuolelle (albumilinkit olivat Picasassa, joka on lopetettu).
    intro: [...splitHeading, plainBlock("Valokuvia:", "h3")],
    lisatiedot: [],
    columns,
    rows,
    kuvat: [],
    sources: [],
    needsReview: unparsed.length > 0,
    reviewReasons: unparsed.length ? [`rivejä ilman päivämäärää: ${unparsed.join(" / ")}`] : [],
    lahdeRivit: rows.length,
    lahde: { sivu: file, taulukko: "linkkilista (ei <table>)" },
  };
  docs.push(doc);
  report.unohtumattomat = {
    coverage: coverage(sourceBodyText($), [doc]),
    rivit: rows.length,
    ilmanPaivaa: unparsed,
    huomio: "Picasa-linkit (kuolleet, palvelu lopetettu 2016) pudotettu; ottelun nimi ja päivä säilyvät taulukossa. YouTube-linkit säilytetty.",
  };
  cov.push({ legacyUrl: `/${file}`, tila: "migrated", kohde: doc.slug, huomio: "Kategoria muu; Picasa-linkit pudotettu (kuolleet)" });
}

// ─── otteluihin.htm (hubi) ─────────────────────────────────────────────────

async function parseHub(cov: CoverageEntry[], dropped: DroppedImage[]): Promise<void> {
  const file = "otteluihin.htm";
  const $ = await loadPage(file);
  for (const img of pageImages($)) {
    const rec = imageRecord(img.src);
    dropped.push({
      file: rec?.file ?? img.src,
      sivu: file,
      syy:
        rec && rec.pages.length > 1
          ? `hubisivun koristekuva; sivu yhdistetään /jalkapalloarkisto/huuhkajat-hubiin eikä sille tehdä dokumenttia (kuva myös sivuilla: ${rec.pages.filter((p) => p !== file).join(", ")})`
          : "hubisivun koristekuva; sivu yhdistetään /jalkapalloarkisto/huuhkajat-hubiin eikä sille tehdä dokumenttia",
    });
  }
  cov.push({
    legacyUrl: `/${file}`,
    tila: "merged",
    kohde: "/jalkapalloarkisto/huuhkajat",
    huomio: "Linkkihubi ottelusivuille ja arvokisoihin; ei omaa sisältöä. Linkkitekstit käytetty karsintadokumenttien otsikoissa.",
  });
}

// ─── Pääohjelma ────────────────────────────────────────────────────────────

async function main() {
  const records = JSON.parse(await readFile(IMAGE_INVENTORY, "utf-8")) as KuvaRecord[];
  inventory = new Map(records.map((r) => [r.file, r]));

  const docs: HuuhkajaTilasto[] = [];
  const cov: CoverageEntry[] = [];
  const dropped: DroppedImage[] = [];
  const report: Record<string, unknown> = {};

  await parseOttelut(docs, cov, dropped, report, 0);
  await parseArvostelu(docs, cov, dropped, report);
  await parsePelaajatilasto(docs, cov, report);
  await parseEnglanti(docs, cov, report);
  await parseAvaus(docs, cov, dropped, report);
  await parseUnohtumattomat(docs, cov, report);
  await parseHub(cov, dropped);

  // Solujen normalisointi (docs/12 §1.2): date → ISO, number → kokonaisluku,
  // epäselvä sarake → text. Näkymättömät merkit pois kaikista teksteistä.
  const soluNormalisointi: { slug: string; huomiot: string[] }[] = [];
  const invisibleBefore = countInvisible(docs);
  for (const d of docs) {
    const res = normalizeGrid(d.columns, d.rows);
    d.columns = d.columns.map((c, i) => ({ ...c, type: res.types[i] }));
    d.rows = res.rows;
    if (res.notes.length) soluNormalisointi.push({ slug: d.slug, huomiot: res.notes });
  }
  docs.splice(0, docs.length, ...stripInvisibleDeep(docs));

  // Eheystarkistukset ennen kirjoitusta.
  const problems: string[] = [];
  const slugs = new Set<string>();
  for (const d of docs) {
    if (slugs.has(d.slug)) problems.push(`slug toistuu: ${d.slug}`);
    slugs.add(d.slug);
    if (d.tiivistelma && d.tiivistelma.length > 300) problems.push(`${d.slug}: tiivistelmä ${d.tiivistelma.length} merkkiä`);
    for (const r of d.rows) {
      if (r.length !== d.columns.length) problems.push(`${d.slug}: rivillä ${r.length} solua, sarakkeita ${d.columns.length}`);
    }
    if (d.rows.length !== d.lahdeRivit) problems.push(`${d.slug}: rivejä ${d.rows.length}, lähteessä ${d.lahdeRivit}`);
    for (const k of d.kuvat) {
      if (k.alt.length < 3 || k.alt.length > 200) problems.push(`${d.slug}: alt-pituus ${k.alt.length} (${k.file})`);
    }
  }
  if (problems.length) {
    console.error(problems.join("\n"));
    throw new Error("Eheystarkistus epäonnistui");
  }

  const byCategory: Record<string, number> = {};
  for (const d of docs) byCategory[d.category] = (byCategory[d.category] ?? 0) + 1;
  const fullReport = {
    lahdesivuja: cov.length,
    dokumentteja: docs.length,
    kategorioittain: byCategory,
    needsReview: docs.filter((d) => d.needsReview).map((d) => ({ slug: d.slug, syyt: d.reviewReasons })),
    kuvia: docs.reduce((n, d) => n + d.kuvat.length, 0),
    pudotettujaKuvia: dropped.length,
    taulukot: docs.map((d) => ({ slug: d.slug, rivit: d.rows.length, sarakkeet: d.columns.length, lahde: `${d.lahde.sivu} ${d.lahde.taulukko}` })),
    slugHuomiot: [
      "lib/redirects.ts ohjaa kaikki M2-sivut hubiin /jalkapalloarkisto/huuhkajat (unohtumattomat → /jalkapalloarkisto), joten dokumenttikohtaisia slug-kohteita ei ollut. Karsintasivut: /jalkapalloarkisto/karsinnat/karsinta-<em|mm>-<vuosi>; muut huuhkajat-kategorian taulukot näkyvät hubissa ankkurina #<slug>.",
    ],
    soluNormalisointi,
    nakymattomiaMerkkejaPoistettu: invisibleBefore,
    ...report,
    kattavuus: cov,
  };

  await writeFile(OUT_FILE, `${JSON.stringify(docs, null, 2)}\n`, "utf-8");
  await writeFile(REPORT_FILE, `${JSON.stringify(fullReport, null, 2)}\n`, "utf-8");
  await writeFile(DROPPED_FILE, `${JSON.stringify(dropped, null, 2)}\n`, "utf-8");

  console.log(`
Lähdesivuja ............. ${cov.length}
Dokumentteja ............ ${docs.length}  ${JSON.stringify(byCategory)}
  tarkistettavia ........ ${fullReport.needsReview.length}
Kuvia liitetty .......... ${fullReport.kuvia}
Kuvia pudotettu ......... ${dropped.length}

Kirjoitettu: ${OUT_FILE}
             ${REPORT_FILE}
             ${DROPPED_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
