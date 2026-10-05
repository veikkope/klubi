/**
 * Purkaa vanhan sivuston klubi- ja runkosivut rakenteiseksi JSONiksi
 * (docs/12-sisaltomigraatio.md §3, agentti M6).
 *
 * Ajo:    npx tsx scripts/parse-klubi.ts
 * Lähde:  data/raw-html/*.htm  (21 sivua, ks. data/coverage.tsv agentti=M6)
 *         data/normalized/kuvat.json  (kuvainventaario)
 *         lib/defaults.ts             (singletonien oletussisältö)
 *         lib/redirects.ts            (vanhat .htm-linkit → uudet polut)
 * Tulos:  data/normalized/klubi.json                 sivut, toiminnat, taulukot, singletonit
 *         data/normalized/klubi-report.json          määrät, tarkistettavat, pudotetut
 *         data/normalized/klubi-ravintola-arviot.json  Kuu/Loiste/Salud → ravintola (patch integraatiolle)
 *         data/normalized/klubi-kuvat-dropped.json   pudotetut kuvat perusteluineen
 *
 * Tulos on CMS-riippumaton: Sanity-rakenteet (Portable Text, _key:t, viittaukset)
 * syntyvät vasta `scripts/import-klubi.ts`:ssä, kuten ravintoloilla.
 *
 * Periaatteet:
 *  - Mitään ei keksitä. Tiivistelmät kootaan lähteen virkkeistä tai lasketuista
 *    faktoista (kuten `import-ravintolat.ts`:n `buildTiivistelma`).
 *  - Jokainen sivun rivi joko käytetään tai kirjataan raporttiin
 *    (`kasittelemattomat`), jotta mitään ei pudoteta hiljaa.
 *  - Merkistö: tiukka UTF-8, muuten windows-1252 (migraatio-lahdehavainnot §0.1). `<meta charset>`
 *    valehtelee yhdeksällä sivulla, joten siihen ei luoteta.
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { load, type CheerioAPI } from "cheerio";
import type { AnyNode, Element } from "domhandler";

import { defaultEtusivu, defaultNavigation } from "../lib/defaults";
import { localImageName } from "./lib/image-names";
import { deriveAltFromFilename } from "./lib/derive-alt";
import type { KuvaRecord } from "./download-images";
import { decodeHtml } from "./lib/decode-html";
import { countInvisible, normalizeGrid, stripInvisibleDeep, withoutSummaryRows } from "./lib/normalize-cell";

const ROOT = process.cwd();
const RAW_DIR = join(ROOT, "data", "raw-html");
const IMAGES_DIR = join(ROOT, "data", "images");
const INVENTORY = join(ROOT, "data", "normalized", "kuvat.json");
const REDIRECTS = join(ROOT, "lib", "redirects.ts");
const OUT = join(ROOT, "data", "normalized", "klubi.json");
const OUT_REPORT = join(ROOT, "data", "normalized", "klubi-report.json");
const OUT_ARVIOT = join(ROOT, "data", "normalized", "klubi-ravintola-arviot.json");
const OUT_DROPPED = join(ROOT, "data", "normalized", "klubi-kuvat-dropped.json");

// ── Tyypit (CMS-riippumattomat) ──────────────────────────────────────────────

export type Mark = "strong" | "em";

export interface Run {
  text: string;
  marks?: Mark[];
  href?: string;
}

export interface KuvaRef {
  /** Tiedostonimi `data/images/`-kansiossa. */
  file: string;
  alt: string;
  /** Mistä alt on peräisin: lähteen alt, sivun konteksti vai tiedostonimi. */
  altLahde: "lahde" | "konteksti" | "tiedostonimi";
  caption?: string;
}

export type Lohko =
  | { tyyppi: "kappale"; tyyli?: "h2" | "h3"; lista?: "bullet" | "number"; runs: Run[] }
  | { tyyppi: "kuva"; kuva: KuvaRef };

export type SarakeTyyppi = "text" | "number" | "date" | "year" | "link";

export interface Taulukko {
  slug: string;
  otsikko: string;
  lahdesivu: string;
  jarjestys: number;
  tiivistelma?: string;
  sarakkeet: { avain: string; otsikko: string; tyyppi: SarakeTyyppi }[];
  /** Arvot sarakkeiden järjestyksessä; tyhjä merkkijono = tyhjä solu. */
  rivit: string[][];
  johdanto?: Lohko[];
  lisatiedot?: Lohko[];
  paivitetty?: string;
  /** Lähdetaulukon `<tr>`-rivien määrä (QA vertaa tähän). */
  lahdeRivit: number;
  /** Miten lähderivit vastaavat tuloksen rivejä (otsikkorivit, tyhjät, uudelleenmuotoilu). */
  rivitSelite: string;
  huomiot: string[];
  needsReview: boolean;
  reviewReasons: string[];
}

export interface VuosiMerkinta {
  vuosi: number;
  paivamaara?: string;
  otsikko?: string;
  jarjestysnumero?: number;
  paikka?: string;
  osallistujat?: string[];
  /**
   * Lähteen ilmoittama osallistujamäärä, esim. "(4)". Tarkistetaan nimien
   * määrää vasten; ristiriita → needsReview. Ei tuoda Sanityyn erikseen, koska
   * se on `osallistujat.length` (renderöinti näyttää luvun siitä).
   */
  osallistujaMaara?: number;
  kuvaus?: string;
  /** Lähteen `<a href>` merkinnälle (matkakuvaus blogissa, mölkkyvideo). */
  linkki?: { url: string; teksti: string };
  kuvat?: KuvaRef[];
}

export interface Toiminta {
  slug: string;
  otsikko: string;
  lahdesivu: string;
  jarjestys: number;
  tiivistelma?: string;
  kuvaus?: Lohko[];
  kuvat?: KuvaRef[];
  vuodet: VuosiMerkinta[];
  taulukot: string[];
  needsReview: boolean;
  reviewReasons: string[];
}

export interface Sivu {
  slug: string;
  otsikko: string;
  lahdesivu: string;
  muutLahdesivut?: string[];
  tiivistelma?: string;
  hero?: KuvaRef;
  body: Lohko[];
  taulukot?: string[];
  needsReview: boolean;
  reviewReasons: string[];
}

export interface Singletonit {
  etusivu: {
    heroEyebrow?: string;
    heroTitle: string;
    heroDescription: string;
    heroCtas: { label: string; href: string; primary: boolean }[];
    seuraavaOttelu?: { ottelu: string; kilpailu?: string; aika?: string };
    blocks: (
      | { tyyppi: "uutiset" | "tapahtumat" | "galleria"; count: number }
      | { tyyppi: "ravintolatSpotlight"; count: number }
      | { tyyppi: "jalkapalloarkisto" }
      | {
          tyyppi: "esittely";
          heading?: string;
          body?: Lohko[];
          ctaLabel?: string;
          ctaHref?: string;
        }
      | { tyyppi: "cta"; heading: string; ctaLabel: string; ctaHref: string }
    )[];
    lahteet: string[];
    /** Vanha osoite (etusivu.htm) → etusivu-singletonin legacyUrl. */
    lahdesivu: string;
  };
  navigaatio: {
    items: {
      label: string;
      href: string;
      highlight: boolean;
      children?: { label: string; href: string }[];
    }[];
  };
  asetukset: { siteName: string; logo?: { file: string; alt: string } };
  yhteystiedot: { city: string };
}

export interface RavintolaArvio {
  kohdeId: string;
  lahdesivu: string;
  otsikko: string;
  review: Lohko[];
  kuvat: KuvaRef[];
}

export interface CoverageRivi {
  legacyUrl: string;
  tila: "migrated" | "merged" | "dropped";
  kohde: string;
  huomio: string;
}

export interface KlubiData {
  sivut: Sivu[];
  toiminnat: Toiminta[];
  taulukot: Taulukko[];
  singletonit: Singletonit;
  coverage: CoverageRivi[];
}

// ── Merkistö ja teksti ───────────────────────────────────────────────────────

/** Tiukka UTF-8, muuten windows-1252. Toimii kaikille 197 lähdesivulle. */
// decodeHtml: scripts/lib/decode-html.ts (yhteinen, oikea windows-1252-taulukko).

/** Välilyönnit yhdeksi, NBSP välilyönniksi, Unicode NFC. */
function norm(s: string): string {
  return s
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .normalize("NFC");
}

/** Suomalainen slug: ä→a, ö→o, å→a, pienet kirjaimet, väliviivat. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[äå]/g, "a")
    .replace(/ö/g, "o")
    .replace(/é/g, "e")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const DATE_RE = /\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/;
const DATE_RE_G = /\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g;

/** "4.9.2010" / "04.09.2010" → "2010-09-04"; virheellinen päivä → null. */
function isoDate(dd: string, mm: string, yyyy: string): string | null {
  const d = Number(dd);
  const m = Number(mm);
  const y = Number(yyyy);
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCDate() !== d || date.getUTCMonth() !== m - 1) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function firstIsoDate(text: string): string | null {
  const m = DATE_RE.exec(text);
  return m ? isoDate(m[1], m[2], m[3]) : null;
}


/** "2010-09-04" → "04.09.2010" */
function fiDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/** Päivämäärä tiedostonimestä: 2021-07-31, 20160827, 26032005, 080830 (vvkkpp). */
function dateFromFilename(file: string): string | null {
  const name = file.replace(/\.[a-z0-9]+$/i, "");
  const dashed = /(20\d{2}|19\d{2})-(\d{2})-(\d{2})/.exec(name);
  if (dashed) {
    const iso = isoDate(dashed[3], dashed[2], dashed[1]);
    if (iso) return iso;
  }
  for (const m of name.matchAll(/(?<!\d)(\d{8})(?!\d)/g)) {
    const s = m[1];
    const ymd = isoDate(s.slice(6, 8), s.slice(4, 6), s.slice(0, 4));
    if (ymd && /^(19|20)/.test(s)) return ymd;
    const dmy = isoDate(s.slice(0, 2), s.slice(2, 4), s.slice(4, 8));
    if (dmy) return dmy;
  }
  for (const m of name.matchAll(/(?<!\d)(\d{6})(?!\d)/g)) {
    const s = m[1];
    const yy = Number(s.slice(0, 2));
    const iso = isoDate(s.slice(4, 6), s.slice(2, 4), String(yy > 50 ? 1900 + yy : 2000 + yy));
    if (iso) return iso;
  }
  return null;
}

/** Helsingin paikallinen aika → UTC ISO. Kesäaika ratkaistaan Intl:llä, ei oleteta. */
function helsinkiToUtc(iso: string, hh: number, mi: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Helsinki",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  for (const offset of [3, 2]) {
    const t = Date.UTC(y, m - 1, d, hh - offset, mi);
    const [h2, m2] = fmt.format(t).split(":").map(Number);
    if (h2 === hh && m2 === mi) return new Date(t).toISOString();
  }
  throw new Error(`Aikavyöhykemuunnos epäonnistui: ${iso} ${hh}:${mi}`);
}

// ── Linkit: vanhat .htm-polut → uudet polut ─────────────────────────────────

/**
 * M6:n omat kohteet voittavat `lib/redirects.ts`:n, koska osa sen kohteista on
 * todistetusti väärin (toriparkki → /jalkapalloarkisto, Kuu → /jalkapalloarkisto).
 * Integraatio päivittää redirectit samoiksi (raportti: slugPoikkeamat).
 */
const OMAT_POLUT: Record<string, string> = {
  "/yleista.htm": "/klubi",
  "/english.htm": "/english",
  "/etusivu.htm": "/",
  "/veikkaus.htm": "/klubi/palloveikkaus",
  "/veikkausmaaottelujentulos.htm": "/klubi/palloveikkaus/maaottelut",
  "/veikkausarvokisat.htm": "/klubi/palloveikkaus/arvokisat",
  "/veikkauspalloveikkaus.htm": "/klubi/palloveikkaus/veikkausliiga",
  "/talkoot.htm": "/klubi/toiminta/talkoot",
  "/vappu.htm": "/klubi/toiminta/vappu",
  "/molkky.htm": "/klubi/toiminta/molkky",
  "/vuosikokous.htm": "/klubi/toiminta/vuosikokous",
  "/matkailu.htm": "/klubi/toiminta/matkailu",
  "/ilotulitukset.htm": "/klubi/toiminta/ilotulitukset",
  "/jouluruokailu.htm": "/klubi/toiminta/jouluruokailu",
  "/musiikki.htm": "/klubi/toiminta/musiikki",
  "/venetsialaiset.htm": "/klubi/toiminta/venetsialaiset",
  "/toriparkki.htm": "/toriparkki",
  "/toriparkkilahti.htm": "/toriparkki",
};

let redirectMap = new Map<string, string>();

async function loadRedirects(): Promise<void> {
  const text = await readFile(REDIRECTS, "utf-8");
  const map = new Map<string, string>();
  for (const m of text.matchAll(/source:\s*"([^"]+)",\s*destination:\s*"([^"]+)"/g)) {
    map.set(m[1].toLowerCase(), m[2]);
  }
  redirectMap = map;
}

/** Sisäinen `.htm`-linkki uudeksi poluksi; ulkoinen linkki sellaisenaan. */
function resolveHref(raw: string): string | undefined {
  const href = raw.trim();
  if (!href || href.startsWith("#") || /^javascript:/i.test(href)) return undefined;
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href;
  // Jo muunnettu uuden sivuston polku.
  if (href.startsWith("/") && !/\.html?$/i.test(href.split("#")[0])) return href;
  const path = `/${href.replace(/^\.?\//, "").split("#")[0]}`;
  const own = Object.entries(OMAT_POLUT).find(([k]) => k.toLowerCase() === path.toLowerCase());
  if (own) return own[1];
  return redirectMap.get(path.toLowerCase()) ?? undefined;
}

// ── Kuvainventaario ja alt-tekstit ──────────────────────────────────────────

let inventory = new Map<string, KuvaRecord>();

async function loadInventory(): Promise<void> {
  const list = JSON.parse(await readFile(INVENTORY, "utf-8")) as KuvaRecord[];
  inventory = new Map(list.map((k) => [k.file, k]));
}

/**
 * Kuvat, joiden omistaja on jo toinen dokumentti (match-image-owner-periaate:
 * yksi omistaja, ei molemmille). Tarkistettu development-datasetista
 * 2026-09-27: `sichuan23122001.jpg` on liitetty `ravintola-sichuan-panda`-dokumenttiin.
 */
const MUUN_OMISTAMAT: Record<string, string> = {
  "sichuan23122001.jpg": "ravintola-sichuan-panda (ravintolamigraatio liitti kuvan jo nimellä)",
};

interface Dropped {
  file: string;
  sivu: string;
  syy: string;
}
const dropped: Dropped[] = [];

function dropImage(file: string, sivu: string, syy: string): void {
  if (!dropped.some((d) => d.file === file && d.sivu === sivu)) dropped.push({ file, sivu, syy });
}

/** Palauttaa inventaarion tiedostonimen tai null (ja kirjaa pudotuksen). */
function imageFile(src: string, sivu: string): string | null {
  const candidates = [localImageName(src)];
  try {
    candidates.push(localImageName(decodeURIComponent(src)));
  } catch {
    /* ei URL-koodattu */
  }
  for (const name of candidates) {
    const rec = inventory.get(name);
    if (!rec) continue;
    if (!rec.ok) {
      dropImage(name, sivu, `lataus epäonnistui (HTTP ${rec.status})`);
      return null;
    }
    if (!existsSync(join(IMAGES_DIR, name))) {
      dropImage(name, sivu, "tiedosto puuttuu data/images/-kansiosta");
      return null;
    }
    if (MUUN_OMISTAMAT[name]) {
      dropImage(name, sivu, `omistaja on ${MUUN_OMISTAMAT[name]}`);
      return null;
    }
    return name;
  }
  dropImage(localImageName(src), sivu, "ei kuvainventaariossa (data/normalized/kuvat.json)");
  return null;
}

/**
 * Onko lähteen alt kuvaava? Hylätään:
 *  - yhteen kirjoitetut tunnisteet ("Vappu2013Litmanen", "PuunkaatoPirtti")
 *  - pelkkä yhdistyksen nimi (ei kerro mitä kuvassa on)
 *  - alt, jonka vuosi on ristiriidassa kuvatekstin päiväyksen kanssa
 *    (lähteessä kopioituja alt-tekstejä: "Vappu 2024 Patsaalla" vuoden 2026 kuvassa)
 */
function isDescriptiveAlt(alt: string | null, knownDates: string[]): boolean {
  if (!alt) return false;
  const a = norm(alt);
  if (a.length < 3 || !a.includes(" ")) return false;
  if (/\.(jpe?g|png|gif|jfif|bmp)$/i.test(a)) return false;
  // Pelkkä yhdistyksen nimi + päiväys ei kerro mitä kuvassa on.
  const rest = a
    .replace(/lahden suomalainen klubi( ry)?/gi, "")
    .replace(DATE_RE_G, "")
    .replace(/\b\d{1,2}\.\d{1,2}\.(\d{4})?/g, "")
    .replace(/\b(19|20)\d{2}\b/g, "")
    .replace(/[^a-zåäöA-ZÅÄÖ]/g, "");
  if (rest.length < 3) return false;
  const years = [...a.matchAll(/\b(19|20)\d{2}\b/g)].map((m) => m[0]);
  if (years.length && knownDates.length) {
    const known = new Set(knownDates.map((d) => d.slice(0, 4)));
    if (years.some((y) => !known.has(y))) return false;
  }
  return true;
}

function clampAlt(s: string): string {
  const t = norm(s);
  return t.length > 200 ? `${t.slice(0, 197).trimEnd()}…` : t;
}

/**
 * Alt-teksti järjestyksessä: kuvaava lähteen alt → sivun kontekstista koottu
 * (toiminta, merkintä, paikka, päivä) → tiedostonimestä johdettu. Mikään ei ole
 * keksitty: jokainen osa on luettavissa vanhalta sivulta.
 */
function makeKuva(
  file: string,
  sourceAlt: string | null,
  context: string | null,
  caption: string | null,
  knownDates: string[],
): KuvaRef {
  const cap = caption ? norm(caption) : undefined;
  if (isDescriptiveAlt(sourceAlt, knownDates)) {
    return { file, alt: clampAlt(sourceAlt!), altLahde: "lahde", ...(cap ? { caption: cap } : {}) };
  }
  if (context && norm(context).length >= 3) {
    return { file, alt: clampAlt(context), altLahde: "konteksti", ...(cap ? { caption: cap } : {}) };
  }
  const derived = deriveAltFromFilename(file);
  return {
    file,
    alt: clampAlt(derived ?? "Lahden Suomalainen Klubi ry:n arkistokuva"),
    altLahde: "tiedostonimi",
    ...(cap ? { caption: cap } : {}),
  };
}

// ── HTML → tokenivirta ───────────────────────────────────────────────────────

export type Token =
  | { kind: "line"; text: string; runs: Run[] }
  | { kind: "break" }
  | { kind: "img"; src: string; alt: string | null }
  | { kind: "table"; grid: string[][]; sourceRows: number; colspans: number };

const BLOCK_TAGS = new Set([
  "p", "div", "tr", "td", "th", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ul", "ol",
  "table", "tbody", "thead", "tfoot", "center", "blockquote", "body", "form", "hr",
]);
const PARA_TAGS = new Set(["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "table", "blockquote", "hr"]);

/** Solun teksti: <br> ja lohkoelementit välilyönneiksi. */
function cellText($: CheerioAPI, el: Element): string {
  const parts: string[] = [];
  const walk = (node: AnyNode) => {
    if (node.type === "text") parts.push((node as unknown as { data: string }).data);
    else if (node.type === "tag") {
      const tag = (node as Element).name.toLowerCase();
      if (tag === "script" || tag === "style") return;
      if (tag === "br" || BLOCK_TAGS.has(tag)) parts.push(" ");
      for (const c of (node as Element).children) walk(c);
      if (BLOCK_TAGS.has(tag)) parts.push(" ");
    }
  };
  for (const c of el.children) walk(c);
  return norm(parts.join(""));
}

/**
 * Taulukko ruudukoksi. colspan/rowspan puretaan eksplisiittisesti: yhdistetyn
 * solun teksti toistuu jokaiseen sen kattamaan ruutuun (docs/12 §2.1.4).
 */
function tableGrid($: CheerioAPI, table: Element): { grid: string[][]; sourceRows: number; colspans: number } {
  const trs = $(table)
    .find("tr")
    .toArray()
    .filter((tr) => $(tr).closest("table")[0] === table);
  const occupied = new Map<string, string>();
  const grid: string[][] = [];
  let colspans = 0;
  trs.forEach((tr, r) => {
    const row: string[] = [];
    let c = 0;
    const cells = $(tr).children("td, th").toArray();
    for (const cell of cells) {
      while (occupied.has(`${r},${c}`)) {
        row[c] = occupied.get(`${r},${c}`)!;
        c += 1;
      }
      const text = cellText($, cell);
      const cs = Math.max(1, Number($(cell).attr("colspan") ?? 1) || 1);
      const rs = Math.max(1, Number($(cell).attr("rowspan") ?? 1) || 1);
      if (cs > 1 || rs > 1) colspans += 1;
      for (let i = 0; i < cs; i += 1) {
        row[c + i] = text;
        for (let j = 1; j < rs; j += 1) occupied.set(`${r + j},${c + i}`, text);
      }
      c += cs;
    }
    while (occupied.has(`${r},${c}`)) {
      row[c] = occupied.get(`${r},${c}`)!;
      c += 1;
    }
    grid.push(Array.from(row, (v) => v ?? ""));
  });
  return { grid, sourceRows: trs.length, colspans };
}

/** Datataulukko vai taittotaulukko? Data: ≥ 2 riviä, joilla ≥ 2 ei-tyhjää solua. */
function isDataTable(grid: string[][]): boolean {
  return grid.filter((row) => row.filter((v) => v !== "").length >= 2).length >= 2;
}

/** Litistää sivun tokeneiksi dokumenttijärjestyksessä. */
function tokenize(html: string): Token[] {
  const $ = load(html);
  $("script, style, noscript").remove();
  const out: Token[] = [];
  let runs: Run[] = [];

  const flush = () => {
    const merged: Run[] = [];
    for (const r of runs) {
      const text = r.text.replace(/ /g, " ").replace(/\s+/g, " ");
      if (!text) continue;
      const last = merged[merged.length - 1];
      const same =
        last &&
        last.href === r.href &&
        (last.marks ?? []).join() === (r.marks ?? []).join();
      if (same) last.text += text;
      else merged.push({ ...r, text });
    }
    const text = norm(merged.map((r) => r.text).join(""));
    if (text) {
      // Reunojen välilyönnit pois ja NFC jokaiseen osaan.
      merged[0].text = merged[0].text.replace(/^\s+/, "");
      merged[merged.length - 1].text = merged[merged.length - 1].text.replace(/\s+$/, "");
      out.push({
        kind: "line",
        text,
        runs: merged.filter((r) => r.text).map((r) => ({ ...r, text: r.text.normalize("NFC") })),
      });
    }
    runs = [];
  };
  const hasText = () => runs.some((r) => norm(r.text) !== "");

  const walk = (node: AnyNode, marks: Mark[], href?: string, pre = false) => {
    if (node.type === "text") {
      const data = (node as unknown as { data: string }).data;
      const extra = { ...(marks.length ? { marks } : {}), ...(href ? { href } : {}) };
      if (!pre) {
        runs.push({ text: data, ...extra });
        return;
      }
      // <pre>: rivinvaihdot ovat merkitseviä (etusivun "Viimeiset" ja "Seuraavaksi").
      data.split(/\r?\n/).forEach((part, k) => {
        if (k > 0) flush();
        runs.push({ text: part, ...extra });
      });
      return;
    }
    if (node.type !== "tag") return;
    const el = node as Element;
    const tag = el.name.toLowerCase();
    if (tag === "head" || tag === "title") return;
    if (tag === "br") {
      if (hasText()) flush();
      else {
        runs = [];
        out.push({ kind: "break" });
      }
      return;
    }
    if (tag === "img") {
      flush();
      const src = $(el).attr("src");
      if (src) out.push({ kind: "img", src: src.trim(), alt: $(el).attr("alt")?.trim() || null });
      return;
    }
    if (tag === "table" && $(el).find("table").length === 0) {
      const parsed = tableGrid($, el);
      if (isDataTable(parsed.grid)) {
        flush();
        out.push({ kind: "table", ...parsed });
        // Taulukon sisäiset kuvat eivät saa kadota hiljaa.
        $(el)
          .find("img[src]")
          .each((_, img) => {
            out.push({ kind: "img", src: $(img).attr("src")!.trim(), alt: $(img).attr("alt")?.trim() || null });
          });
        out.push({ kind: "break" });
        return;
      }
    }
    const block = BLOCK_TAGS.has(tag);
    if (block) flush();
    let nextMarks = marks;
    if ((tag === "b" || tag === "strong") && !marks.includes("strong")) nextMarks = [...marks, "strong"];
    if ((tag === "i" || tag === "em") && !marks.includes("em")) nextMarks = [...nextMarks, "em"];
    const nextHref = tag === "a" && $(el).attr("href") ? $(el).attr("href") : href;
    for (const child of el.children) walk(child, nextMarks, nextHref, pre || tag === "pre");
    if (block) {
      flush();
      if (PARA_TAGS.has(tag)) out.push({ kind: "break" });
    }
  };

  const body = $("body")[0];
  if (body) for (const c of body.children) walk(c, []);
  flush();
  return out;
}

async function readPage(file: string): Promise<Token[]> {
  const buf = await readFile(join(RAW_DIR, file));
  return tokenize(decodeHtml(buf));
}

// ── Raportointi ─────────────────────────────────────────────────────────────

interface PageReport {
  sivu: string;
  kaytetytRivit: number;
  kasittelemattomat: string[];
  huomiot: string[];
}
const pageReports: PageReport[] = [];

function pageReport(sivu: string): PageReport {
  const r: PageReport = { sivu, kaytetytRivit: 0, kasittelemattomat: [], huomiot: [] };
  pageReports.push(r);
  return r;
}

// ── Portable Text -lohkot (neutraali muoto) ─────────────────────────────────

function runsToHrefs(runs: Run[]): Run[] {
  return runs.map((r) => {
    if (!r.href) return r;
    const href = resolveHref(r.href);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- href poistetaan tarkoituksella
    const { href: _drop, ...rest } = r;
    return href ? { ...rest, href } : rest;
  });
}

function para(runs: Run[], tyyli?: "h2" | "h3", lista?: "bullet" | "number"): Lohko {
  // Otsikoissa lihavointi on lähteen muotoilua, ei korostusta. Sama jos koko
  // kappale on lihavoitu (FrontPage lihavoi kokonaisia tekstilohkoja).
  const visible = runs.filter((r) => r.text.trim());
  const allBold = visible.length > 0 && visible.every((r) => r.marks?.includes("strong"));
  const cleaned = runsToHrefs(runs).map((r) => {
    if ((!tyyli && !allBold) || !r.marks) return r;
    const marks = r.marks.filter((m) => m !== "strong");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- marks korvataan suodatetulla
    const { marks: _m, ...rest } = r;
    return marks.length ? { ...rest, marks } : rest;
  });
  return { tyyppi: "kappale", runs: cleaned, ...(tyyli ? { tyyli } : {}), ...(lista ? { lista } : {}) };
}

function textPara(text: string, tyyli?: "h2" | "h3", lista?: "bullet" | "number"): Lohko {
  return para([{ text }], tyyli, lista);
}

/** Yhdistää peräkkäiset rivit kappaleeksi (FrontPagen kova rivitys). */
function joinRuns(lines: Run[][]): Run[] {
  const out: Run[] = [];
  lines.forEach((runs, i) => {
    const prevText = out[out.length - 1]?.text ?? "";
    // Tavutettu rivinvaihto "sitruunamelissa-<br>salaattia" → ei välilyöntiä.
    const hyphenated = /[a-zåäö]-$/i.test(prevText) && /^[a-zåäö]/.test(runs[0]?.text ?? "");
    if (i > 0 && !hyphenated) out.push({ text: " " });
    out.push(...runs.map((r) => ({ ...r })));
  });
  // Yhdistä vierekkäiset samanmuotoiset osat.
  const merged: Run[] = [];
  for (const r of out) {
    const last = merged[merged.length - 1];
    if (last && last.href === r.href && (last.marks ?? []).join() === (r.marks ?? []).join()) {
      last.text += r.text;
    } else merged.push(r);
  }
  return merged.map((r) => ({ ...r, text: r.text.replace(/\s+/g, " ") }));
}

/** Tiivistelmä lähteen virkkeistä: kokonaisia virkkeitä ≤ 300 merkkiä. */
function sentencesUpTo(text: string, max = 300): string | undefined {
  const sentences = norm(text).match(/[^.!?]+[.!?]+(\s|$)/g) ?? [];
  let out = "";
  for (const s of sentences) {
    const next = `${out} ${s.trim()}`.trim();
    if (next.length > max) break;
    out = next;
  }
  return out || undefined;
}

// ── Kuvat ja kuvatekstit tokenivirrasta ─────────────────────────────────────

interface ImageWithCaption {
  file: string;
  src: string;
  alt: string | null;
  caption: string | null;
  /** Kuvan päivä: kuvateksti → alt → tiedostonimi. */
  date: string | null;
  /** Tokenin indeksi (järjestys sivulla). */
  index: number;
}

/**
 * Poimii kuvat ja niiden kuvatekstit. Kuvateksti = kuvaa (tai kuvaryhmää)
 * seuraavat rivit ennen seuraavaa kappalevaihtoa, kuvaa tai taulukkoa.
 * Rinnakkaisten kuvien yhteinen kuvatekstirivi ("21.06.2008 Kyminpirtti
 * 31.07.2009 Kotiranta") jaetaan päivämäärien kohdalta.
 */
function collectImages(
  tokens: Token[],
  sivu: string,
  opts: { maxCaptionLines?: number; isCaption?: (line: string) => boolean } = {},
): { images: ImageWithCaption[]; captionLineIdx: Set<number> } {
  const maxLines = opts.maxCaptionLines ?? 2;
  const images: ImageWithCaption[] = [];
  const captionLineIdx = new Set<number>();
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t.kind !== "img") {
      i += 1;
      continue;
    }
    const group: { src: string; alt: string | null; index: number }[] = [];
    while (i < tokens.length && (tokens[i].kind === "img" || tokens[i].kind === "break")) {
      const g = tokens[i];
      if (g.kind === "img") group.push({ src: g.src, alt: g.alt, index: i });
      i += 1;
      // Kuvaryhmä katkeaa, jos välissä on tekstiä.
      if (g.kind === "break" && tokens[i]?.kind !== "img") break;
    }
    const capLines: string[] = [];
    let j = i;
    // FrontPage jättää kuvan ja kuvatekstin väliin tyhjiä rivejä.
    while (tokens[j]?.kind === "break") j += 1;
    if (tokens[j]?.kind !== "line") j = i;
    while (j < tokens.length && capLines.length < maxLines) {
      const c = tokens[j];
      if (c.kind !== "line") break;
      if (opts.isCaption && !opts.isCaption(c.text)) break;
      capLines.push(c.text);
      captionLineIdx.add(j);
      j += 1;
    }
    const caption = capLines.length
      ? norm(capLines.reduce((acc, l) => (acc && /[a-zåäö]-$/i.test(acc) && /^[a-zåäö]/.test(l) ? acc + l : acc ? `${acc} ${l}` : l), ""))
      : null;
    // Jaa yhteinen kuvateksti päivämäärien kohdalta.
    let parts: (string | null)[] = group.map(() => caption);
    if (caption && group.length > 1) {
      const starts = [...caption.matchAll(DATE_RE_G)].map((m) => m.index!);
      if (starts.length === group.length) {
        parts = starts.map((s, k) => norm(caption.slice(s, starts[k + 1] ?? caption.length)));
      }
    }
    group.forEach((g, k) => {
      const file = imageFile(g.src, sivu);
      if (!file) return;
      const cap = parts[k];
      const date =
        (cap ? firstIsoDate(cap) : null) ?? (g.alt ? firstIsoDate(g.alt) : null) ?? dateFromFilename(file);
      images.push({ file, src: g.src, alt: g.alt, caption: cap, date, index: g.index });
    });
    i = j;
  }
  return { images, captionLineIdx };
}

// ── Taulukkoapurit ──────────────────────────────────────────────────────────

/** Tyhjät rivit ja lopun tyhjät sarakkeet pois; rivit samanlevyisiksi. */
function tidyGrid(grid: string[][]): string[][] {
  const width = Math.max(0, ...grid.map((r) => r.length));
  let rows = grid.map((r) => Array.from({ length: width }, (_, i) => r[i] ?? ""));
  rows = rows.filter((r) => r.some((v) => v !== ""));
  let w = width;
  while (w > 0 && rows.every((r) => r[w - 1] === "")) w -= 1;
  return rows.map((r) => r.slice(0, w));
}

function inferType(values: string[]): SarakeTyyppi {
  const vals = values.filter((v) => v !== "");
  if (vals.length === 0) return "text";
  if (vals.every((v) => /^(19|20)\d{2}$/.test(v))) return "year";
  if (vals.every((v) => /^-?\d+([.,]\d+)?$/.test(v))) return "number";
  if (vals.every((v) => /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(v))) return "date";
  if (vals.every((v) => /^https?:\/\//.test(v))) return "link";
  return "text";
}

function buildColumns(labels: string[], allRows: string[][]): Taulukko["sarakkeet"] {
  // Yhteenvetorivi ("Yhteensä | 197 | Keskiarvo | 7,9 henkilöä") ei kerro
  // sarakkeen tyyppiä — ilman tätä se kaatoi jouluruokailun päivämääräsarakkeet.
  const rows = withoutSummaryRows(allRows);
  const used = new Set<string>();
  return labels.map((label, i) => {
    let key = slugify(label) || `sarake-${i + 1}`;
    if (/^\d/.test(key)) key = `s-${key}`;
    let k = key;
    let n = 2;
    while (used.has(k)) {
      k = `${key}-${n}`;
      n += 1;
    }
    used.add(k);
    return { avain: k, otsikko: label || `Sarake ${i + 1}`, tyyppi: inferType(rows.map((r) => r[i] ?? "")) };
  });
}

/** Mölkyn lähteessä "llpo" (pieni L) = Ilpo. Korjataan nimetysti. */
const NIMIKORJAUKSET: Record<string, string> = { llpo: "Ilpo" };
let nimikorjauksia = 0;
function fixName(s: string): string {
  const fixed = NIMIKORJAUKSET[s];
  if (fixed) {
    nimikorjauksia += 1;
    return fixed;
  }
  return s;
}

// ── Toimintasivut ───────────────────────────────────────────────────────────

const toiminnat: Toiminta[] = [];
const taulukot: Taulukko[] = [];

function splitNames(s: string): string[] {
  return s
    .replace(/\.\s*$/, "")
    .split(",")
    .map((n) => norm(n).replace(/\.$/, ""))
    .filter(Boolean)
    .map(fixName);
}

/**
 * Liittää kuvat vuosimerkintöihin päivämäärän perusteella. Kuva jonka päivä
 * ei osu mihinkään merkintään jää toimintamuodon yleisiin kuviin — väärä
 * liitos olisi pahempi kuin yleinen.
 */
function attachImages(
  t: Toiminta,
  images: ImageWithCaption[],
  contextFor: (entry: VuosiMerkinta | null, img: ImageWithCaption) => string,
): void {
  for (const img of images) {
    const entry = img.date ? t.vuodet.find((v) => v.paivamaara === img.date) ?? null : null;
    const known = [img.date, entry?.paivamaara].filter((d): d is string => Boolean(d));
    // Jos kuvatekstissä on muutakin kuin päivä ja merkinnän paikka ("Vuoden 2020
    // klubilainen. 29.05.2021 Jalkaranta."), alt kootaan kuvatekstistä: merkinnän
    // paikka ei välttämättä ole kuvan paikka.
    const capRest = img.caption ? norm(img.caption.replace(DATE_RE_G, "")).replace(/[.,]+$/, "") : "";
    const leftover = entry?.paikka
      ? capRest.replace(entry.paikka, "").replace(/\bLahden\b/g, "").replace(/[^a-zåäöA-ZÅÄÖ]/g, "")
      : capRest;
    const samePlace = !capRest || Boolean(entry?.paikka && (leftover.length < 3 || entry.paikka.includes(capRest)));
    const context =
      entry && !samePlace
        ? `${t.otsikko} ${fiDate(entry.paivamaara!)}: ${capRest}`
        : contextFor(entry, img);
    const kuva = makeKuva(img.file, img.alt, context, img.caption, known);
    if (entry) (entry.kuvat ??= []).push(kuva);
    else (t.kuvat ??= []).push(kuva);
  }
}

function yearsSpan(v: VuosiMerkinta[]): string {
  const ys = v.map((e) => e.vuosi);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  return min === max ? `${min}` : `${min}–${max}`;
}

function newToiminta(slug: string, otsikko: string, lahdesivu: string, jarjestys: number): Toiminta {
  const t: Toiminta = { slug, otsikko, lahdesivu, jarjestys, vuodet: [], taulukot: [], needsReview: false, reviewReasons: [] };
  toiminnat.push(t);
  return t;
}

function lineTokens(tokens: Token[]): { text: string; runs: Run[]; index: number }[] {
  return tokens.flatMap((t, index) => (t.kind === "line" ? [{ text: t.text, runs: t.runs, index }] : []));
}

/** Rivit, joita ei tarvita (sivun otsikko ja yhdistyksen nimi). */
const PAGE_HEADER = /^(.*\/\s*)?lahden suomalainen klubi ry:?$|^[A-ZÅÄÖ]+ lahden suomalainen klubi ry$/i;

/**
 * Lähteen osallistujamäärä "(4)" vs. lueteltujen nimien määrä. Ristiriita on
 * lähteen virhe, jota ei korjata arvaamalla: merkintä needsReview:ksi syineen.
 */
function checkParticipants(t: Toiminta, rep: PageReport, pvm: string, count: number, names: string[]): void {
  if (names.length === count) return;
  const reason = `${pvm}: lähteen osallistujamäärä (${count}) ≠ lueteltuja nimiä ${names.length} — tarkista kumpi on oikein`;
  rep.huomiot.push(reason);
  t.needsReview = true;
  t.reviewReasons.push(reason);
}

async function parseTalkoot(): Promise<void> {
  const sivu = "talkoot.htm";
  const rep = pageReport(sivu);
  const tokens = await readPage(sivu);
  const t = newToiminta("talkoot", "Talkoot", sivu, 10);
  const { images, captionLineIdx } = collectImages(tokens, sivu, {
    isCaption: (l) => !/^(Kaadot|Nostot):?$/.test(l),
  });
  let ryhma = "";
  for (const l of lineTokens(tokens)) {
    if (captionLineIdx.has(l.index)) {
      rep.kaytetytRivit += 1;
      continue;
    }
    if (PAGE_HEADER.test(l.text)) {
      rep.kaytetytRivit += 1;
      continue;
    }
    const heading = /^(Kaadot|Nostot):?$/.exec(l.text);
    if (heading) {
      ryhma = heading[1];
      rep.kaytetytRivit += 1;
      continue;
    }
    const m = /^(\d{1,2}\.\d{1,2}\.\d{4})\s+(.+?),\s*([^,(]+?)\s*(?:\((.+)\))?\s*$/.exec(l.text);
    const iso = m ? firstIsoDate(m[1]) : null;
    if (m && iso) {
      t.vuodet.push({
        vuosi: Number(iso.slice(0, 4)),
        paivamaara: iso,
        otsikko: norm(m[2]),
        paikka: norm(m[3]),
        ...(m[4] ? { kuvaus: norm(m[4]).replace(/\.$/, "") + "." } : {}),
      });
      rep.kaytetytRivit += 1;
      continue;
    }
    rep.kasittelemattomat.push(l.text);
  }
  if (ryhma === "") rep.huomiot.push("Ryhmäotsikoita (Kaadot/Nostot) ei löytynyt");
  attachImages(t, images, (e, img) =>
    e ? `Talkoot: ${e.otsikko}, ${e.paikka} ${fiDate(e.paivamaara!)}` : `Talkoot: ${img.caption ?? ""}`,
  );
  const kaadot = t.vuodet.filter((v) => /kaato/i.test(v.otsikko ?? ""));
  const nostot = t.vuodet.filter((v) => /nosto/i.test(v.otsikko ?? ""));
  // Lähteen ryhmäotsikot "Kaadot:" ja "Nostot:" näkyvät merkintöjen otsikoissa
  // ("Koivun kaato", "Perunan nosto"); erillistä kuvausta ei keksitä.
  t.tiivistelma =
    `Klubin talkoissa on kirjattu ${kaadot.length} puiden kaatoa (${yearsSpan(kaadot)}) ` +
    `ja ${nostot.length} nostoa (${yearsSpan(nostot)}), useimmiten Kyminpirtillä.`;
  const kyminpirtti = t.vuodet.filter((v) => v.paikka === "Kyminpirtti").length;
  if (kyminpirtti * 2 <= t.vuodet.length) t.tiivistelma = t.tiivistelma.replace(", useimmiten Kyminpirtillä", "");
}

async function parseVappu(): Promise<void> {
  const sivu = "vappu.htm";
  const rep = pageReport(sivu);
  const tokens = await readPage(sivu);
  const t = newToiminta("vappu", "Vappu", sivu, 20);
  const { images, captionLineIdx } = collectImages(tokens, sivu);
  let alaotsikko = "";
  for (const l of lineTokens(tokens)) {
    if (captionLineIdx.has(l.index) || PAGE_HEADER.test(l.text)) {
      rep.kaytetytRivit += 1;
      continue;
    }
    if (/^Kuohuviinit Patsaalla:?$/.test(l.text)) {
      alaotsikko = l.text.replace(/:$/, "");
      rep.kaytetytRivit += 1;
      continue;
    }
    const m = /^(\d{1,2}\.\d{1,2}\.\d{4})\s*\((\d+)\)\s*(.+?)\s*\(([^()]+)\)\s*$/.exec(l.text);
    const iso = m ? firstIsoDate(m[1]) : null;
    if (m && iso) {
      const names = splitNames(m[3]);
      checkParticipants(t, rep, m[1], Number(m[2]), names);
      t.vuodet.push({
        vuosi: Number(iso.slice(0, 4)),
        paivamaara: iso,
        osallistujat: names,
        osallistujaMaara: Number(m[2]),
        kuvaus: `Kuohuviini: ${norm(m[4])}`,
      });
      rep.kaytetytRivit += 1;
      continue;
    }
    rep.kasittelemattomat.push(l.text);
  }
  if (alaotsikko) t.kuvaus = [textPara(`${alaotsikko}.`)];
  attachImages(t, images, (e, img) =>
    e ? `Vappu ${fiDate(e.paivamaara!)}${img.caption ? `, ${img.caption.replace(DATE_RE, "").trim()}` : ""}` : `Vappu: ${img.caption ?? ""}`,
  );
  const last = t.vuodet[t.vuodet.length - 1];
  t.tiivistelma =
    `Klubi on nostanut vappukuohuviinit Patsaalla ${t.vuodet.length} kertaa vuodesta ` +
    `${t.vuodet[0].vuosi}, viimeksi ${fiDate(last.paivamaara!)}.`;
}

/** Vuosikokous ja venetsialaiset: "(11) 11.02.2017 Sibeliustalo (6): Ilpo, Olli, …" */
async function parseNumbered(
  sivu: string,
  slug: string,
  otsikko: string,
  jarjestys: number,
  headerRe: RegExp,
  tiivistelma: (t: Toiminta) => string,
): Promise<void> {
  const rep = pageReport(sivu);
  const tokens = await readPage(sivu);
  const t = newToiminta(slug, otsikko, sivu, jarjestys);
  const { images, captionLineIdx } = collectImages(tokens, sivu);
  for (const l of lineTokens(tokens)) {
    if (captionLineIdx.has(l.index) || PAGE_HEADER.test(l.text) || headerRe.test(l.text)) {
      rep.kaytetytRivit += 1;
      continue;
    }
    const m = /^\((\d+)\)\s*(\d{1,2}\.\d{1,2}\.\d{4})\s+(.+?)\s*\((\d+)\)\s*:\s*(.+)$/.exec(l.text);
    const iso = m ? firstIsoDate(m[2]) : null;
    if (m && iso) {
      const names = splitNames(m[5]);
      checkParticipants(t, rep, m[2], Number(m[4]), names);
      t.vuodet.push({
        vuosi: Number(iso.slice(0, 4)),
        paivamaara: iso,
        jarjestysnumero: Number(m[1]),
        paikka: norm(m[3]),
        osallistujat: names,
        osallistujaMaara: Number(m[4]),
      });
      rep.kaytetytRivit += 1;
      continue;
    }
    rep.kasittelemattomat.push(l.text);
  }
  attachImages(t, images, (e, img) =>
    e
      ? `${otsikko} ${fiDate(e.paivamaara!)}, ${e.paikka}`
      : `${otsikko}: ${img.caption ?? ""}`,
  );
  t.tiivistelma = tiivistelma(t);
}

async function parseJouluruokailu(): Promise<void> {
  const sivu = "jouluruokailu.htm";
  const rep = pageReport(sivu);
  const tokens = await readPage(sivu);
  const t = newToiminta("jouluruokailu", "Jouluruokailu", sivu, 70);
  const { images, captionLineIdx } = collectImages(tokens, sivu);
  let legend = "";
  for (const l of lineTokens(tokens)) {
    if (captionLineIdx.has(l.index) || PAGE_HEADER.test(l.text)) {
      rep.kaytetytRivit += 1;
      continue;
    }
    if (/^\*\s*Ravintolan toiminta loppunut\.?$/.test(l.text)) {
      legend = "Ravintolan toiminta loppunut.";
      rep.kaytetytRivit += 1;
      continue;
    }
    const m = /^(\d{1,2}\.\d{1,2}\.\d{4})\s*\((\d+)\)\s*(.+?)\s*\(([^()]+)\)\s*$/.exec(l.text);
    const iso = m ? firstIsoDate(m[1]) : null;
    if (m && iso) {
      const names = splitNames(m[4]);
      checkParticipants(t, rep, m[1], Number(m[2]), names);
      const closed = /\*\s*$/.test(m[3]);
      t.vuodet.push({
        vuosi: Number(iso.slice(0, 4)),
        paivamaara: iso,
        paikka: norm(m[3].replace(/\*\s*$/, "")),
        osallistujat: names,
        osallistujaMaara: Number(m[2]),
        ...(closed ? { kuvaus: "Ravintolan toiminta loppunut." } : {}),
      });
      rep.kaytetytRivit += 1;
      continue;
    }
    rep.kasittelemattomat.push(l.text);
  }
  if (!legend) rep.huomiot.push("Tähden (*) selitettä ei löytynyt");

  // Kaksi otsikotonta taulukkoa: osallistujat ja ravintolat.
  const tables = tokens.filter((x): x is Extract<Token, { kind: "table" }> => x.kind === "table");
  const defs = [
    {
      slug: "klubi-jouluruokailu-osallistujat",
      otsikko: "Jouluruokailujen osallistujat",
      labels: ["Sija", "Nimi", "Kertoja", "Ensimmäinen", "Viimeinen"],
    },
    {
      slug: "klubi-jouluruokailu-ravintolat",
      otsikko: "Jouluruokailujen ravintolat",
      labels: ["Sija", "Ravintola", "Kertoja", "Ensimmäinen", "Viimeinen"],
    },
  ];
  tables.forEach((tb, k) => {
    const def = defs[k];
    if (!def) {
      rep.kasittelemattomat.push(`ylimääräinen taulukko #${k}`);
      return;
    }
    const rows = tidyGrid(tb.grid);
    const summary = rows[rows.length - 1];
    const tbl: Taulukko = {
      slug: def.slug,
      otsikko: def.otsikko,
      lahdesivu: sivu,
      jarjestys: k + 1,
      sarakkeet: buildColumns(def.labels, rows),
      rivit: rows,
      lahdeRivit: tb.sourceRows,
      rivitSelite:
        "Lähteessä ei otsikkoriviä: kaikki rivit ovat dataa (viimeinen = Yhteensä-rivi). " +
        "Sarakeotsikot lisätty migraatiossa sisällön perusteella.",
      huomiot: ["Sarakeotsikot lisätty (lähteessä ei otsikkoriviä)"],
      needsReview: false,
      reviewReasons: [],
      ...(legend ? { lisatiedot: [textPara(`* ${legend}`)] } : {}),
    };
    const dataRows = rows.filter((r) => r[1] !== "Yhteensä");
    const ys = rows.flatMap((r) => [r[3], r[4]]).map(firstIsoDate).filter((d): d is string => Boolean(d));
    const span = ys.length ? `${Math.min(...ys.map((d) => Number(d.slice(0, 4))))}–${Math.max(...ys.map((d) => Number(d.slice(0, 4))))}` : "";
    tbl.tiivistelma =
      k === 0
        ? `Klubin jouluruokailuihin ${span} osallistuneet: ${dataRows.length} henkilöä` +
          (summary?.[1] === "Yhteensä" && summary[2] ? `, yhteensä ${summary[2]} osallistumiskertaa.` : ".")
        : `Klubin jouluruokailujen ravintolat ${span}: ${dataRows.length} ravintolaa.`;
    taulukot.push(tbl);
    t.taulukot.push(tbl.slug);
  });

  attachImages(t, images, (e, img) =>
    e ? `Jouluruokailu ${fiDate(e.paivamaara!)}, ${e.paikka}` : `Jouluruokailu: ${img.caption ?? ""}`,
  );
  const last = t.vuodet[t.vuodet.length - 1];
  t.tiivistelma =
    `Klubin jouluruokailu on järjestetty ${t.vuodet.length} kertaa vuodesta ${t.vuodet[0].vuosi}, ` +
    `viimeksi ${fiDate(last.paivamaara!)} (${last.paikka}).`;
}

async function parseMatkailu(): Promise<void> {
  const sivu = "matkailu.htm";
  const rep = pageReport(sivu);
  const tokens = await readPage(sivu);
  const t = newToiminta("matkailu", "Matkailu", sivu, 50);
  const { images, captionLineIdx } = collectImages(tokens, sivu);
  let otsikkoRivi = "";
  for (const l of lineTokens(tokens)) {
    if (captionLineIdx.has(l.index) || PAGE_HEADER.test(l.text)) {
      rep.kaytetytRivit += 1;
      continue;
    }
    if (/^Matkakuvaukset:?$/.test(l.text)) {
      otsikkoRivi = "Matkakuvaukset";
      rep.kaytetytRivit += 1;
      continue;
    }
    const m = /^((?:19|20)\d{2})\s+(.+)$/.exec(l.text);
    if (m) {
      const href = l.runs.find((r) => r.href)?.href;
      const url = href ? resolveHref(href) : undefined;
      // Koko rivi "2008 Ateena / Kreikka" on lähteessä linkki matkakuvaukseen:
      // URL rakenteiseen kenttään, ei tekstiksi kuvaukseen.
      t.vuodet.push({
        vuosi: Number(m[1]),
        otsikko: norm(m[2]),
        ...(url ? { linkki: { url, teksti: "Matkakuvaus" } } : {}),
      });
      rep.kaytetytRivit += 1;
      continue;
    }
    rep.kasittelemattomat.push(l.text);
  }
  // "Matkakuvaukset:" on vain luettelon otsikko; linkit ovat vuosimerkinnöissä.
  if (!otsikkoRivi) rep.huomiot.push("Otsikkoa Matkakuvaukset ei löytynyt");
  attachImages(t, images, (_e, img) => `Matkailu: ${img.caption ?? ""}`);
  // Matkoilla ei ole päivämäärää, joten kuva liitetään vuoden ja kaupungin perusteella.
  for (const kuva of t.kuvat ?? []) {
    const year = dateFromFilename(kuva.file)?.slice(0, 4);
    const city = kuva.caption?.split(/\s+/)[0]?.replace(/in$/, "") ?? "";
    const entry = t.vuodet.find((v) => String(v.vuosi) === year && city && (v.otsikko ?? "").startsWith(city.slice(0, 6)));
    if (entry) {
      (entry.kuvat ??= []).push(kuva);
      t.kuvat = (t.kuvat ?? []).filter((k) => k !== kuva);
    }
  }
  if (t.kuvat && t.kuvat.length === 0) delete t.kuvat;
  const linked = t.vuodet.filter((v) => v.linkki).length;
  t.tiivistelma =
    `Klubin matkat ${yearsSpan(t.vuodet)}: ${t.vuodet.length} matkaa, ` +
    `joista ${linked} matkakuvausta on luettavissa klubin blogissa.`;
}

async function parseSmall(sivu: string, slug: string, otsikko: string, jarjestys: number): Promise<void> {
  const rep = pageReport(sivu);
  const tokens = await readPage(sivu);
  const t = newToiminta(slug, otsikko, sivu, jarjestys);
  const { images, captionLineIdx } = collectImages(tokens, sivu);
  const extra: string[] = [];
  for (const l of lineTokens(tokens)) {
    if (captionLineIdx.has(l.index) || PAGE_HEADER.test(l.text)) {
      rep.kaytetytRivit += 1;
      continue;
    }
    if (norm(l.text).toLowerCase() === otsikko.toLowerCase()) {
      rep.kaytetytRivit += 1;
      continue;
    }
    extra.push(l.text);
    rep.kaytetytRivit += 1;
  }
  for (const img of images) {
    const cap = img.caption ?? "";
    const kuva = makeKuva(img.file, img.alt, `${otsikko}${cap ? `: ${cap}` : ""}`, cap || null, img.date ? [img.date] : []);
    // Kuvateksti "Parasites 27.06.2015 Kyminpirtti": ennen päivää = kuvaus, jälkeen = paikka.
    const m = DATE_RE.exec(cap);
    if (img.date && m) {
      const before = norm(cap.slice(0, m.index));
      const after = norm(cap.slice(m.index + m[0].length));
      t.vuodet.push({
        vuosi: Number(img.date.slice(0, 4)),
        paivamaara: img.date,
        // Kuvaa edeltävä rivi ("Knockin' on Heaven's Door") on lähteessä merkinnän otsikko.
        ...(extra.length ? { otsikko: extra.join(" ") } : {}),
        ...(after ? { paikka: after } : {}),
        ...(before ? { kuvaus: before } : {}),
        kuvat: [kuva],
      });
    } else {
      (t.kuvat ??= []).push(kuva);
    }
  }
  if (extra.length && !t.vuodet.length) t.kuvaus = [textPara(extra.join(" "))];
  t.needsReview = true;
  t.reviewReasons.push(
    "Vanhalla sivulla lähes ei sisältöä (otsikko ja yksi kuva): tiivistelmää ei voi johtaa, kuvaus puuttuu — täydennä Studiossa tai yhdistä toimintasivuun",
  );
}

// ── Mölkky ──────────────────────────────────────────────────────────────────

async function parseMolkky(): Promise<void> {
  const sivu = "molkky.htm";
  const rep = pageReport(sivu);
  const tokens = await readPage(sivu);
  const t = newToiminta("molkky", "Mölkky", sivu, 30);
  const { images, captionLineIdx } = collectImages(tokens, sivu, {
    isCaption: (l) => !/\/\s*\d+/.test(l) && !/^MARATON/i.test(l),
  });

  // Kilpailun otsikkorivi: "18.04.2025 Kyminpirtti (Pitkäperjantai / 35 (17)"
  const HEADER = /^(\d{1,2}\.\d{1,2}\.\d{4})\s+([A-ZÅÄÖa-zåäö-]+)\s*(?:\(([^/]*?)\)?)?\s*\/\s*(\d+)(?:\s*\((\d+)\))?\.?\s*(.*)$/;
  const RESULT = /^(\d{1,2}\.\d{1,2}\.\d{4})\s+(1\.\s*\S+.*)$/;
  type Contest = { entry: VuosiMerkinta; tables: Extract<Token, { kind: "table" }>[]; toinenNumero?: string };
  const contests: Contest[] = [];
  let current: Contest | null = null;
  let maraton: Extract<Token, { kind: "table" }> | null = null;
  let inMaraton = false;
  let otsikkoRivi = "";

  tokens.forEach((tok, index) => {
    if (tok.kind === "table") {
      if (/^sija$/i.test(tok.grid[0]?.[0] ?? "") || inMaraton) {
        maraton = tok;
        return;
      }
      if (current) current.tables.push(tok);
      else rep.kasittelemattomat.push("taulukko ennen ensimmäistä kilpailua");
      return;
    }
    if (tok.kind !== "line") return;
    const text = tok.text;
    // Tulosrivi ja lisähuomio ovat kuvatekstin paikalla, mutta kuuluvat myös
    // kilpailun tietoihin: käsitellään ennen kuvatekstiohitusta.
    const res = RESULT.exec(text);
    const note = /^(\d{1,2}\.\d{1,2}\.\d{4})\s+\S+\s*\((.+)\)\s*$/.exec(text);
    if (captionLineIdx.has(index) && !res && !(note && !/^(Pitkäperjantai|Pääsiäis|Vappu|Ossin)/.test(note[2]))) {
      rep.kaytetytRivit += 1;
      return;
    }
    if (/^LAHDEN SUOMALAINEN KLUBI ry:n MÖLKKYMESTARUUDET:?$/i.test(text)) {
      otsikkoRivi = "Lahden Suomalainen Klubi ry:n mölkkymestaruudet";
      rep.kaytetytRivit += 1;
      return;
    }
    if (/^MARATON TAULUKKO$/i.test(text)) {
      inMaraton = true;
      rep.kaytetytRivit += 1;
      return;
    }
    const h = HEADER.exec(text);
    const iso = h ? firstIsoDate(h[1]) : null;
    if (h && iso) {
      const notes: string[] = [];
      const extra = norm(h[6] ?? "");
      if (extra && !/^https?:\/\//.test(extra)) notes.push(extra.replace(/^\.\s*/, ""));
      // Lähteen video-URL (<a href>) rakenteiseen linkkiin, ei tekstiksi.
      const link = tok.runs.find((r) => r.href)?.href ?? (/^https?:\/\//.test(extra) ? extra : undefined);
      current = {
        entry: {
          vuosi: Number(iso.slice(0, 4)),
          paivamaara: iso,
          ...(h[3] ? { otsikko: norm(h[3]) } : {}),
          jarjestysnumero: Number(h[4]),
          paikka: norm(h[2]),
          ...(notes.length ? { kuvaus: notes.join(" ") } : {}),
          ...(link ? { linkki: { url: link, teksti: "Video" } } : {}),
        },
        tables: [],
        ...(h[5] ? { toinenNumero: h[5] } : {}),
      };
      contests.push(current);
      rep.kaytetytRivit += 1;
      return;
    }
    const r = res;
    if (r) {
      const riso = firstIsoDate(r[1]);
      const c = contests.find((x) => x.entry.paivamaara === riso);
      if (c) {
        const tulos = norm(r[2].replace(/(\d)\.\s*/g, "$1. "));
        c.entry.kuvaus = [c.entry.kuvaus, `Tulokset: ${tulos}`].filter(Boolean).join(" ");
        rep.kaytetytRivit += 1;
        return;
      }
    }
    // Kuvatekstirivin jatko, esim. "12.07.2025 Kyminpirtti (Väinö tasan 1000 pistettä.)"
    const cap = note;
    if (cap) {
      const c = contests.find((x) => x.entry.paivamaara === firstIsoDate(cap[1]));
      if (c) {
        c.entry.kuvaus = [c.entry.kuvaus, norm(cap[2])].filter(Boolean).join(" ");
        rep.kaytetytRivit += 1;
        return;
      }
    }
    rep.kasittelemattomat.push(text);
  });

  // Uusin ensin kuten lähteessä; taulukoiden järjestys: maraton ensin, sitten uusin kilpailu.
  let jarjestys = 1;
  const toisetNumerot: string[] = [];
  const maratonTok = maraton as Extract<Token, { kind: "table" }> | null;
  if (maratonTok) {
    const rows = tidyGrid(maratonTok.grid).map((r) => r.map(fixName));
    const [head, ...data] = rows;
    const tbl: Taulukko = {
      slug: "klubi-molkky-maratontaulukko",
      otsikko: "Mölkyn maratontaulukko",
      lahdesivu: sivu,
      jarjestys: 0,
      sarakkeet: buildColumns(head, data),
      rivit: data,
      lahdeRivit: maratonTok.sourceRows,
      rivitSelite: "Rivi 0 = otsikkorivi; loput dataa. Viimeinen tyhjä sarake poistettu.",
      huomiot: [],
      needsReview: false,
      reviewReasons: [],
    };
    const leader = data[0];
    tbl.tiivistelma =
      `Klubin mölkkymestaruuksien kaikkien aikojen taulukko: ${data.length} pelaajaa` +
      (leader ? `, kärjessä ${leader[1]} (${Number(leader[2])} pistettä).` : ".");
    taulukot.push(tbl);
    t.taulukot.push(tbl.slug);
  } else {
    rep.huomiot.push("Maratontaulukkoa ei löytynyt");
  }

  for (const c of contests) {
    const e = c.entry;
    c.tables.forEach((tb, k) => {
      const rows = tidyGrid(tb.grid).map((r) => r.map(fixName));
      const [head, ...data] = rows;
      const huomiot: string[] = [];
      const reviewReasons: string[] = [];
      if (head[0] !== String(e.vuosi)) {
        reviewReasons.push(`Taulukon vuosi (${head[0]}) ≠ kilpailun vuosi (${e.vuosi})`);
      }
      // Ensimmäinen otsikkosolu on vuosi; sarakkeessa on kierrosnumero.
      const labels = ["Kierros", ...head.slice(1)];
      huomiot.push(`Ensimmäisen sarakkeen otsikko lähteessä "${head[0]}" (vuosi) → "Kierros"`);
      const suffix = c.tables.length > 1 ? `-${k + 1}` : "";
      const tbl: Taulukko = {
        slug: `klubi-molkky-${e.paivamaara}${suffix}`,
        otsikko: `Mölkky ${fiDate(e.paivamaara!)} ${e.paikka}${e.otsikko ? ` (${e.otsikko})` : ""} – pisteet kierroksittain`,
        lahdesivu: sivu,
        jarjestys: jarjestys++,
        sarakkeet: buildColumns(labels, data),
        rivit: data,
        lahdeRivit: tb.sourceRows,
        rivitSelite: "Rivi 0 = otsikkorivi (vuosi + pelaajat); loput kierroksia. Tyhjät sarakkeet lopusta poistettu.",
        huomiot,
        needsReview: reviewReasons.length > 0,
        reviewReasons,
        tiivistelma:
          `Klubin mölkkymestaruus nro ${e.jarjestysnumero} ${fiDate(e.paivamaara!)} ${e.paikka}: ` +
          `${labels.length - 1} pelaajan pisteet ${data.length} kierroksen ajalta.`,
      };
      taulukot.push(tbl);
      t.taulukot.push(tbl.slug);
    });
    if (c.tables.length === 0) rep.huomiot.push(`${fiDate(e.paivamaara!)}: ei pistetaulukkoa (tulokset kuvana)`);
    if (c.toinenNumero) toisetNumerot.push(`${e.jarjestysnumero} (${c.toinenNumero})`);
    t.vuodet.push(e);
  }

  if (toisetNumerot.length) {
    rep.huomiot.push(
      `Otsikkorivien sulkeissa oleva toinen järjestysluku (${toisetNumerot.length} kilpailua, esim. ${toisetNumerot.slice(0, 3).join(", ")}) ` +
        "= kilpailun numero omassa sarjassaan (pääsiäinen / kesä). Skeemassa ei kenttää → ei siirretty; jarjestysnumero = ensimmäinen luku.",
    );
  }
  attachImages(t, images, (en, img) =>
    en
      ? `Mölkky ${fiDate(en.paivamaara!)}, ${img.caption ? norm(img.caption.replace(DATE_RE, "")) : en.paikka}`
      : `Mölkky: ${img.caption ?? ""}`,
  );
  if (otsikkoRivi) t.kuvaus = [textPara(otsikkoRivi)];
  const last = t.vuodet[0];
  t.tiivistelma =
    `Klubin mölkkymestaruudesta on kilpailtu ${t.vuodet.length} kertaa vuodesta ` +
    `${t.vuodet[t.vuodet.length - 1].vuosi}, viimeksi ${fiDate(last.paivamaara!)} ${last.paikka === "Kyminpirtti" ? "Kyminpirtillä" : last.paikka}.`;
}

// ── Palloveikkaus ───────────────────────────────────────────────────────────

const PALLOVEIKKAUS_TAULUKOT: string[] = [];

async function parseMaaottelut(): Promise<{ saannot: string[] }> {
  const sivu = "veikkausmaaottelujentulos.htm";
  const rep = pageReport(sivu);
  const tokens = await readPage(sivu);
  const tables = tokens.filter((x): x is Extract<Token, { kind: "table" }> => x.kind === "table");
  const saannot: string[] = [];
  let heading = "";
  let inRules = false;
  for (const l of lineTokens(tokens)) {
    if (/^Tulosveikkaus maaotteluissa$/i.test(l.text)) {
      heading = l.text;
      rep.kaytetytRivit += 1;
      continue;
    }
    if (/^Säännöt:?$/.test(l.text)) {
      inRules = true;
      rep.kaytetytRivit += 1;
      continue;
    }
    if (inRules && /^\d+\.\s/.test(l.text)) {
      saannot.push(l.text.replace(/^\d+\.\s*/, ""));
      rep.kaytetytRivit += 1;
      continue;
    }
    rep.kasittelemattomat.push(l.text);
  }
  if (!heading) rep.huomiot.push("Otsikkoa 'Tulosveikkaus maaotteluissa' ei löytynyt");
  const tb = tables[0];
  const rows = tidyGrid(tb.grid);
  const [head, ...data] = rows;
  const matches = data.filter((r) => /^\d+$/.test(r[0]));
  const dates = matches.map((r) => firstIsoDate(r[1])).filter((d): d is string => Boolean(d));
  const tbl: Taulukko = {
    slug: "klubi-maaottelujen-tulosveikkaus",
    otsikko: "Maaottelujen tulosveikkaus",
    lahdesivu: sivu,
    jarjestys: 1,
    sarakkeet: buildColumns(head.map((h) => h.replace(/:$/, "")), data),
    rivit: data,
    lahdeRivit: tb.sourceRows,
    rivitSelite: "Rivi 0 = otsikkorivi; loput dataa (viimeinen = Yhteensä-rivi).",
    huomiot: [
      "Lähteen solujen taustavärit (keltainen / punainen) eivät siirry: skeemassa ei solukohtaista korostusta, eikä värien merkitystä ole selitetty sivulla",
    ],
    needsReview: false,
    reviewReasons: [],
    tiivistelma:
      `Klubin jäsenten tulosveikkaukset ${matches.length} Suomen maaotteluun ` +
      `${fiDate(dates[0])}–${fiDate(dates[dates.length - 1])}.`,
  };
  taulukot.push(tbl);
  PALLOVEIKKAUS_TAULUKOT.push(tbl.slug);
  if (tables.length > 1) rep.huomiot.push(`${tables.length - 1} muuta taulukkoa: tyhjiä/taittoa, ohitettu`);
  return { saannot };
}

/**
 * Arvokisaveikkaus on "korttiruudukko": jokainen veikkaaja on 4 sarakkeen
 * levyinen kortti (sija, joukkue, pisteet, väli), kortteja 3–5 rinnakkain.
 * Ruudukkoa ei voi siirtää sellaisenaan järkeväksi taulukoksi, joten se
 * puretaan yhdeksi riviksi per veikkaaja (vrt. M3 `lupaavia`, docs/12 §2.1.4).
 */
async function parseArvokisat(): Promise<{ intro: string[] }> {
  const sivu = "veikkausarvokisat.htm";
  const rep = pageReport(sivu);
  const tokens = await readPage(sivu);
  const intro: string[] = [];
  for (const l of lineTokens(tokens)) {
    if (/^JALKAPALLON ARVOKISOJEN VOITTAJAVEIKKAUS$/i.test(l.text)) {
      if (!intro.length) intro.push("Jalkapallon arvokisojen voittajaveikkaus");
      rep.kaytetytRivit += 1;
      continue;
    }
    if (/^[<>.\-–]$/.test(l.text)) {
      rep.huomiot.push(`Irrallinen merkki "${l.text}" ohitettu (lähteen roskaa)`);
      continue;
    }
    rep.kasittelemattomat.push(l.text);
  }
  const tables = tokens.filter((x): x is Extract<Token, { kind: "table" }> => x.kind === "table");
  const RANK = /^(\d)(?:\s*-\s*(\d))?\.?$/;
  const out: Taulukko[] = [];

  for (const tb of tables) {
    const g = tb.grid.map((r) => r.map((v) => v.replace(/_/g, " ").replace(/\s+/g, " ").trim()));
    const width = Math.max(...g.map((r) => r.length));
    const at = (r: number, c: number) => g[r]?.[c] ?? "";
    // Kisaosiot alkavat "Voittajaveikkaus"-riviltä.
    const starts = g.map((row, r) => (row.some((v) => /^Voittajaveikkaus/i.test(v)) ? r : -1)).filter((r) => r >= 0);
    starts.forEach((start, si) => {
      const end = starts[si + 1] ?? g.length;
      const consumed = new Set<string>();
      const mark = (r: number, c: number) => consumed.add(`${r},${c}`);
      const titleCell = g[start].find((v) => /^Voittajaveikkaus/i.test(v))!;
      g[start].forEach((v, c) => v === titleCell && mark(start, c));
      const [titlePart, ...rest] = titleCell.split(/\*+/);
      const otsikko = norm(titlePart);
      const titleExtra = norm(rest.join(" "));
      const kisa = /\b(MM|EM)\b/.exec(otsikko)?.[1] ?? "kisa";
      const vuosi = /\b(19|20)\d{2}\b/.exec(otsikko)?.[0] ?? String(si);

      interface Kortti {
        nimi: string;
        maalikuningas?: string;
        maalikuningasPisteet?: string;
        sijat: { sija: string; joukkue: string; pisteet: string }[];
        yhteensa?: string;
        huom: string[];
        row: number;
        col: number;
      }
      const kortit: Kortti[] = [];
      const huomiot: string[] = [];
      for (let r = start + 1; r < end; r += 1) {
        for (let c = 0; c < width; c += 1) {
          if (!/^1\.?$/.test(at(r, c)) || !at(r, c + 1)) continue;
          if (at(r - 1, c) && RANK.test(at(r - 1, c))) continue; // ei kortin alku
          const head = at(r - 1, c + 1);
          const nameM = /^([^/]+?)(?:\s*\/\s*(.+))?$/.exec(head);
          const k: Kortti = { nimi: norm(nameM?.[1] ?? head), sijat: [], huom: [], row: r, col: c };
          mark(r - 1, c + 1);
          if (nameM?.[2]) {
            k.maalikuningas = norm(nameM[2]);
            if (at(r - 1, c + 2)) {
              k.maalikuningasPisteet = at(r - 1, c + 2);
              mark(r - 1, c + 2);
            }
          } else if (at(r - 1, c + 2)) {
            k.huom.push(at(r - 1, c + 2));
            mark(r - 1, c + 2);
          }
          // MM 2022: "Voittaja" on nimen yläpuolella omalla rivillään.
          const above = at(r - 2, c + 1);
          if (
            r - 2 > start &&
            above &&
            above !== "." &&
            !consumed.has(`${r - 2},${c + 1}`) &&
            !/^Yhteensä$/i.test(above) &&
            !RANK.test(at(r - 2, c))
          ) {
            k.huom.push(above);
            mark(r - 2, c + 1);
          }
          let rr = r;
          while (rr < end && RANK.test(at(rr, c)) && at(rr, c + 1)) {
            k.sijat.push({ sija: at(rr, c), joukkue: at(rr, c + 1), pisteet: at(rr, c + 2) });
            mark(rr, c);
            mark(rr, c + 1);
            mark(rr, c + 2);
            rr += 1;
          }
          const missingLabel = at(rr, c + 1) === "" && /^\d+$/.test(at(rr, c + 2));
          if (/^Yhteensä$/i.test(at(rr, c + 1)) || missingLabel) {
            if (missingLabel) huomiot.push(`${k.nimi}: Yhteensä-sana puuttuu lähteestä, luku ${at(rr, c + 2)} tulkittu yhteispisteiksi`);
            k.yhteensa = at(rr, c + 2);
            mark(rr, c + 1);
            mark(rr, c + 2);
            rr += 1;
            const status = at(rr, c + 1);
            if (status && status !== "." && !/^Säännöt/i.test(status) && !RANK.test(at(rr + 1, c) || "x")) {
              k.huom.push(status);
              mark(rr, c + 1);
            }
          }
          kortit.push(k);
        }
      }
      // Säännöt: solu jossa "Säännöt" ja kaikki sen jälkeiset rivit osiossa.
      const saannot: string[] = [];
      /** Merkitsee saman tekstin kaikki ruudut osiossa (rowspan/colspan-kopiot). */
      const markAll = (v: string) => {
        for (let r = start; r < end; r += 1) g[r].forEach((x, cc) => x === v && mark(r, cc));
      };
      const addRule = (v: string) => {
        // "4 pistettä" / "1 piste" on edellisen säännön jatko omassa solussaan (MM 1998).
        if (/^\d+\s*piste(ttä)?\.?$/i.test(v) && saannot.length) {
          saannot[saannot.length - 1] = `${saannot[saannot.length - 1]} ${v}`;
          return;
        }
        if (!saannot.includes(v)) saannot.push(v);
      };
      let rulesFrom = -1;
      for (let r = start; r < end && rulesFrom < 0; r += 1) {
        for (let c = 0; c < width; c += 1) {
          const v = at(r, c);
          if (!/^Säännöt/i.test(v) || consumed.has(`${r},${c}`)) continue;
          if (/^Säännöt( seuraavasti)?:?$/i.test(v)) {
            rulesFrom = r + 1;
          } else {
            // Yksi solu: "Säännöt seuraavasti: A. … B. … C. … D. …" → kohdat A–D.
            const body = v.replace(/^Säännöt( seuraavasti)?:\s*/i, "");
            for (const part of body.split(/\s+(?=[A-H]\.\s)/)) addRule(norm(part));
          }
          markAll(v);
          if (rulesFrom >= 0) break;
        }
      }
      if (rulesFrom >= 0) {
        // Säännöt ovat kahtena palstana (vasen: sääntö 1–4, oikea: jatko). Luetaan
        // palstoittain, ei riveittäin, jotta virkkeet eivät lomitu.
        const palstat: string[][] = [];
        const byCards = new Set(consumed);
        for (let r = rulesFrom; r < end; r += 1) {
          const cells: string[] = [];
          let prev = "";
          for (let c = 0; c < width; c += 1) {
            const v = at(r, c);
            const dup = v === prev; // colspan-kopio
            prev = v;
            if (!v || dup || byCards.has(`${r},${c}`)) continue;
            markAll(v);
            if (/^\d+\s*piste(ttä)?\.?$/i.test(v) && cells.length) cells[cells.length - 1] += ` ${v}`;
            else cells.push(v);
          }
          cells.forEach((v, k) => (palstat[k] ??= []).push(v));
        }
        for (const palsta of palstat) {
          for (const v of palsta) {
            // "(sijat 3 ja 4) 2 pistettä." jatkaa edellisen rivin sääntöä.
            if (/^\(/.test(v) && saannot.length) saannot[saannot.length - 1] += ` ${v}`;
            else addRule(v);
          }
        }
      }
      // Kuluttamattomat solut raporttiin: mitään ei pudoteta hiljaa.
      const leftovers: string[] = [];
      for (let r = start; r < end; r += 1) {
        for (let c = 0; c < width; c += 1) {
          const v = at(r, c);
          if (!v || v === "." || consumed.has(`${r},${c}`) || leftovers.includes(v)) continue;
          // Yksittäinen kirjain tyhjässä kortissa (MM 2006: ". | i") on lähteen roskaa.
          if (/^[a-zåäö]$/i.test(v)) {
            huomiot.push(`Lähteen irrallinen merkki "${v}" ohitettu`);
            continue;
          }
          leftovers.push(v);
        }
      }
      for (const v of leftovers) rep.kasittelemattomat.push(`${otsikko}: "${v}"`);

      const lopputilanne = kortit.filter((k) => /^Lopputilanne$/i.test(k.nimi));
      const veikkaajat = kortit.filter((k) => !/^Lopputilanne$/i.test(k.nimi));
      const maxSijat = Math.max(...kortit.map((k) => k.sijat.length));
      const rankLabels = (veikkaajat[0]?.sijat ?? []).map((s) => {
        const m = RANK.exec(s.sija)!;
        return m[2] ? `${m[1]}.–${m[2]}.` : `${m[1]}.`;
      });
      while (rankLabels.length < maxSijat) rankLabels.push(`${rankLabels.length + 1}.`);
      const hasScorer = kortit.some((k) => k.maalikuningas);
      const labels = ["Veikkaaja", ...(hasScorer ? ["Maalikuningas"] : []), ...rankLabels, "Yhteensä", "Huomautus"];
      const fmt = (s: { joukkue: string; pisteet: string } | undefined) =>
        s ? (s.pisteet !== "" ? `${s.joukkue} (${s.pisteet})` : s.joukkue) : "";
      const rows = [...lopputilanne, ...veikkaajat].map((k) => [
        k.nimi,
        ...(hasScorer
          ? [k.maalikuningas ? (k.maalikuningasPisteet ? `${k.maalikuningas} (${k.maalikuningasPisteet})` : k.maalikuningas) : ""]
          : []),
        ...rankLabels.map((_, i) => fmt(k.sijat[i])),
        k.yhteensa ?? "",
        k.huom.join("; "),
      ]);
      const lisatiedot: Lohko[] = [];
      if (titleExtra) lisatiedot.push(textPara(titleExtra));
      if (saannot.length) {
        lisatiedot.push(textPara("Säännöt", "h3"));
        for (const s of saannot) lisatiedot.push(textPara(norm(s), undefined, "bullet"));
      }
      const reviewReasons: string[] = [];
      if (veikkaajat.some((k) => k.sijat.length !== maxSijat)) reviewReasons.push("Veikkaajien sijamäärät vaihtelevat");
      if (leftovers.length) reviewReasons.push(`${leftovers.length} solua jäi tulkitsematta (ks. raportti)`);
      const tbl: Taulukko = {
        slug: `klubi-arvokisaveikkaus-${slugify(kisa)}-${vuosi}`,
        otsikko,
        lahdesivu: sivu,
        jarjestys: 0,
        sarakkeet: buildColumns(labels, rows),
        rivit: rows,
        ...(lisatiedot.length ? { lisatiedot } : {}),
        lahdeRivit: end - start,
        rivitSelite:
          "Lähde on korttiruudukko (4 saraketta per veikkaaja, 3–5 korttia rinnakkain); purettu yhdeksi riviksi " +
          "per veikkaaja. Solu \"Espanja (7)\" = veikattu joukkue (pisteet)." +
          (lopputilanne.length ? " Ensimmäinen rivi \"Lopputilanne\" = toteutunut järjestys." : ""),
        huomiot,
        needsReview: reviewReasons.length > 0,
        reviewReasons,
        tiivistelma: `${otsikko}: ${veikkaajat.length} klubin jäsenen voittajaveikkaukset.`,
      };
      out.push(tbl);
    });
  }
  // Uusin ensin kuten lähteessä.
  out.forEach((tbl, i) => {
    tbl.jarjestys = 100 + i;
    taulukot.push(tbl);
    PALLOVEIKKAUS_TAULUKOT.push(tbl.slug);
  });
  return { intro };
}

async function parsePalloveikkaus(): Promise<{ intro: string[] }> {
  const sivu = "veikkauspalloveikkaus.htm";
  const rep = pageReport(sivu);
  const tokens = await readPage(sivu);
  const intro: string[] = [];
  let pending: string[] = [];
  let order = 200;
  for (const [index, tok] of tokens.entries()) {
    if (tok.kind === "line") {
      if (/^PALLOVEIKKAUS$/i.test(tok.text)) {
        intro.push("Palloveikkaus");
        rep.kaytetytRivit += 1;
        continue;
      }
      pending.push(tok.text);
      continue;
    }
    if (tok.kind !== "table") continue;
    const rows = tidyGrid(tok.grid);
    const headIdx = rows.findIndex((r) => /^(19|20)\d{2}\b/.test(r[0]));
    if (headIdx < 0) {
      rep.kasittelemattomat.push(`taulukko #${index}: otsikkoriviä ei tunnistettu`);
      continue;
    }
    const head = rows[headIdx];
    const season = /^(19|20)\d{2}/.exec(head[0])![0];
    const meta = rows.slice(0, headIdx);
    const data = rows.slice(headIdx + 1);
    const titleLine = pending.find((p) => new RegExp(`^Veikkausliiga ${season}$`).test(p));
    const reviewReasons: string[] = [];
    if (!titleLine) reviewReasons.push(`Otsikkoriviä "Veikkausliiga ${season}" ei löytynyt taulukon edeltä`);
    const johdanto: Lohko[] = [];
    const lisatiedot: Lohko[] = [];
    for (const p of pending) {
      if (p === titleLine) {
        rep.kaytetytRivit += 1;
        continue;
      }
      if (/^Panos:/i.test(p) || /^Päivämäärä, jolloin kuitattu maksetuksi/i.test(p)) {
        (p.startsWith("Panos") ? johdanto : lisatiedot).push(textPara(p));
        rep.kaytetytRivit += 1;
        continue;
      }
      if (/^Maksu$/i.test(p)) {
        rep.kaytetytRivit += 1;
        continue;
      }
      rep.kasittelemattomat.push(p);
    }
    pending = [];
    // Metarivi: ensimmäinen solu = tilannepäivä, muut = maksun kuittauspäivä veikkaajittain.
    let paivitetty: string | undefined;
    const maksut: string[] = [];
    for (const m of meta) {
      m.forEach((v, c) => {
        if (!v) return;
        if (c === 0) {
          const iso = firstIsoDate(v);
          if (iso && !paivitetty) paivitetty = iso;
          else if (!/^Maksu$/i.test(v)) maksut.push(v);
          return;
        }
        const who = head[c]?.split(/\s+/)[0] ?? `sarake ${c + 1}`;
        maksut.push(`${who} ${v}`);
      });
    }
    if (maksut.length) lisatiedot.push(textPara(`Maksu kuitattu: ${maksut.join(", ")}.`));
    const veikkaajat = head.slice(1).filter(Boolean);
    const tbl: Taulukko = {
      slug: `klubi-palloveikkaus-${season}`,
      otsikko: `Palloveikkaus: Veikkausliiga ${season}`,
      lahdesivu: sivu,
      jarjestys: order++,
      sarakkeet: buildColumns(head, data),
      rivit: data,
      ...(johdanto.length ? { johdanto } : {}),
      ...(lisatiedot.length ? { lisatiedot } : {}),
      ...(paivitetty ? { paivitetty } : {}),
      lahdeRivit: tok.sourceRows,
      rivitSelite:
        headIdx > 0
          ? `Rivi ${headIdx} = otsikkorivi (kausi/kierros + veikkaaja ja virhepisteet); sitä edeltävä rivi = ` +
            "tilannepäivä ja maksujen kuittaukset (siirretty kenttiin paivitetty ja lisatiedot); loput dataa."
          : "Rivi 0 = otsikkorivi; loput dataa.",
      huomiot: [],
      needsReview: reviewReasons.length > 0,
      reviewReasons,
      tiivistelma:
        `Klubin Veikkausliigan ${season} palloveikkaus: ${veikkaajat.length} veikkaajan sarjataulukkoveikkaukset` +
        (paivitetty ? `, tilanne ${fiDate(paivitetty)}.` : "."),
    };
    if (taulukot.some((x) => x.slug === tbl.slug)) {
      tbl.slug += "-2";
      tbl.reviewReasons.push("Sama kausi kahdesti");
      tbl.needsReview = true;
    }
    taulukot.push(tbl);
    PALLOVEIKKAUS_TAULUKOT.push(tbl.slug);
  }
  for (const p of pending) rep.kasittelemattomat.push(p);
  return { intro };
}

// ── Sivut ───────────────────────────────────────────────────────────────────

const sivut: Sivu[] = [];

/**
 * Yleinen proosamuunnos: kappaleet rivinvaihtojen välistä, kuvat kuvateksteineen.
 * `skip` = rivit jotka on jo käytetty (otsikko tms.).
 */
function prose(
  tokens: Token[],
  sivu: string,
  opts: {
    skip?: (text: string) => boolean;
    heading?: (text: string) => "h2" | "h3" | null;
    bullet?: RegExp;
    imageContext?: (caption: string | null) => string | null;
    captionLines?: number;
    isCaption?: (line: string) => boolean;
  } = {},
): Lohko[] {
  const { images, captionLineIdx } = collectImages(tokens, sivu, {
    maxCaptionLines: opts.captionLines ?? 0,
    ...(opts.isCaption ? { isCaption: opts.isCaption } : {}),
  });
  const imgByIndex = new Map(images.map((im) => [im.index, im]));
  const blocks: Lohko[] = [];
  let buf: Run[][] = [];
  const flush = () => {
    if (buf.length) blocks.push(para(joinRuns(buf)));
    buf = [];
  };
  tokens.forEach((tok, i) => {
    if (tok.kind === "break" || tok.kind === "table") {
      flush();
      return;
    }
    if (tok.kind === "img") {
      flush();
      const im = imgByIndex.get(i);
      if (!im) return;
      const known = [im.date].filter((d): d is string => Boolean(d));
      blocks.push({
        tyyppi: "kuva",
        kuva: makeKuva(im.file, im.alt, opts.imageContext?.(im.caption) ?? im.caption, im.caption, known),
      });
      return;
    }
    if (captionLineIdx.has(i)) return;
    if (opts.skip?.(tok.text)) return;
    const h = opts.heading?.(tok.text);
    if (h) {
      flush();
      blocks.push(para(tok.runs, h));
      return;
    }
    if (opts.bullet && opts.bullet.test(tok.text)) {
      flush();
      const runs = tok.runs.map((r, k) => (k === 0 ? { ...r, text: r.text.replace(opts.bullet!, "") } : r));
      blocks.push(para(runs, undefined, "bullet"));
      return;
    }
    buf.push(tok.runs);
  });
  flush();
  // Luettelon jatkorivit: FrontPage katkaisee pitkän luettelokohdan <br>:llä.
  return blocks.filter((b) => b.tyyppi === "kuva" || b.runs.some((r) => r.text.trim()));
}

function blocksText(blocks: Lohko[]): string {
  return blocks
    .filter((b): b is Extract<Lohko, { tyyppi: "kappale" }> => b.tyyppi === "kappale")
    .map((b) => b.runs.map((r) => r.text).join(""))
    .join(" ");
}

async function parseYleista(): Promise<void> {
  const sivu = "yleista.htm";
  const rep = pageReport(sivu);
  const tokens = await readPage(sivu);
  const lines = lineTokens(tokens);
  const title = lines[0]?.text ?? "";
  const toimintaIdx = lines.findIndex((l) => /^TOIMINTA:?$/.test(l.text));
  const bodyTokens = tokens.filter((t, i) => {
    const li = lines.find((l) => l.index === i);
    if (li && li.index === lines[0].index) return false;
    return toimintaIdx < 0 || i < lines[toimintaIdx].index;
  });
  const body = prose(bodyTokens, sivu, {
    imageContext: () => "Lahden Suomalainen Klubi ry:n perustamiskokous 04.03.2007",
  });
  // Perustamiskuvan kuvateksti on lähteessä <small>-tekstinä kappaleen lopussa:
  // siirretään se kuvatekstiksi, ettei sama lause toistu kahdesti.
  const CAPTION = "Kuva yhdistyksen perustamiskokouksesta.";
  for (const b of body) {
    if (b.tyyppi === "kuva" && !b.kuva.caption) b.kuva.caption = CAPTION;
    if (b.tyyppi === "kappale" && b.runs.map((r) => r.text).join("").endsWith(CAPTION)) {
      const last = b.runs[b.runs.length - 1];
      last.text = last.text.replace(CAPTION, "").trimEnd();
      b.runs = b.runs.filter((r) => r.text);
      b.runs[b.runs.length - 1].text = b.runs[b.runs.length - 1].text.trimEnd();
    }
  }
  rep.kaytetytRivit += lines.filter((l) => l.index < (lines[toimintaIdx]?.index ?? Infinity)).length;
  if (toimintaIdx >= 0) {
    body.push(textPara("Toiminta", "h2"));
    rep.kaytetytRivit += 1;
    for (const l of lines.slice(toimintaIdx + 1)) {
      const href = l.runs.find((r) => r.href)?.href;
      const target = href ? resolveHref(href) : undefined;
      const slug = target?.replace(/^\/klubi\/toiminta\//, "");
      const name = toiminnat.find((t) => t.slug === slug)?.otsikko ?? l.text;
      if (!target) {
        rep.kasittelemattomat.push(l.text);
        continue;
      }
      body.push(para([{ text: name, href: target }], undefined, "bullet"));
      rep.kaytetytRivit += 1;
    }
  }
  const text = blocksText(body);
  const founding = /Lahden Suomalainen Klubi ry perustettiin \d{1,2}\.\d{1,2}\.\d{4}[^.]*\./.exec(text)?.[0];
  const purpose = /Yhdistyksen tarkoituksena[^.]+\./.exec(text)?.[0];
  const tiivistelma = [founding, purpose].filter(Boolean).join(" ");
  sivut.push({
    slug: "klubi",
    otsikko: norm(title),
    lahdesivu: sivu,
    ...(tiivistelma && tiivistelma.length <= 300 ? { tiivistelma } : {}),
    body,
    needsReview: false,
    reviewReasons: [],
  });
}

async function parseEnglish(): Promise<void> {
  const sivu = "english.htm";
  const rep = pageReport(sivu);
  const tokens = await readPage(sivu);
  const lines = lineTokens(tokens);
  const title = lines[0].text;
  const rest = tokens.filter((t) => t.kind !== "img" && !(t.kind === "line" && t.text === title));
  for (const t of tokens) {
    if (t.kind === "img") {
      const f = imageFile(t.src, sivu);
      if (f) dropImage(f, sivu, "yhdistyksen logo (teemagrafiikka) → asetukset.logo, ei sisältökuva");
    }
  }
  const body = prose(rest, sivu);
  rep.kaytetytRivit += lines.length;
  sivut.push({
    slug: "english",
    otsikko: title,
    lahdesivu: sivu,
    tiivistelma: sentencesUpTo(blocksText(body).split("These internet pages")[0]),
    body,
    needsReview: false,
    reviewReasons: [],
  });
}

async function parseToriparkki(): Promise<void> {
  const sivu = "toriparkki.htm";
  const sivu2 = "toriparkkilahti.htm";
  const rep = pageReport(sivu);
  const rep2 = pageReport(sivu2);
  const tokens = await readPage(sivu);
  const tokens2 = await readPage(sivu2);
  const lines = lineTokens(tokens);
  const title = lines[0].text; // "LAHDEN TORIPARKKI"
  const DIARY = /^\(\d+\/\d+\)/;
  const body = prose(
    tokens.filter((t) => !(t.kind === "line" && t.text === title)),
    sivu,
    {
      captionLines: 2,
      isCaption: (l) => DATE_RE.test(l) || DIARY.test(l),
      imageContext: (cap) => (cap ? `Lahden toriparkki ${cap}` : null),
    },
  );
  rep.kaytetytRivit += lines.length;
  const lines2 = lineTokens(tokens2);
  const title2 = lines2[0].text; // "LAHDEN TORIPARKKI"
  const tech = prose(
    tokens2.filter((t) => !(t.kind === "line" && t.text === title2)),
    sivu2,
    {
      captionLines: 2,
      isCaption: (l) => !/^-\s/.test(l),
      bullet: /^-\s*/,
      imageContext: (cap) => (cap ? `Lahden toriparkki: ${cap}` : null),
    },
  );
  rep2.kaytetytRivit += lines2.length;
  // Kuvatekstit ja luettelokohdat, jotka FrontPage katkaisi keskeltä <br>:llä,
  // tulevat erillisinä kappaleina luettelokohdan perään → liitetään edelliseen.
  const merged: Lohko[] = [];
  for (const b of tech) {
    const prev = merged[merged.length - 1];
    if (
      b.tyyppi === "kappale" &&
      !b.lista &&
      !b.tyyli &&
      prev?.tyyppi === "kappale" &&
      prev.lista === "bullet" &&
      /^[a-zåäö0-9]/.test(b.runs[0]?.text ?? "")
    ) {
      prev.runs = joinRuns([prev.runs, b.runs]);
      continue;
    }
    merged.push(b);
  }
  // Linkki "toriparkin tekniset tiedot" osoittaa nyt samalle sivulle → linkki pois, teksti säilyy.
  for (const b of body) {
    if (b.tyyppi === "kappale") b.runs = b.runs.map((r) => (r.href === "/toriparkki" ? { text: r.text, ...(r.marks ? { marks: r.marks } : {}) } : r));
  }
  const fullBody: Lohko[] = [...body, textPara("Toriparkin tekniset tiedot", "h2"), ...merged];
  const diaryDates = body
    .filter((b): b is Extract<Lohko, { tyyppi: "kuva" }> => b.tyyppi === "kuva")
    .map((b) => firstIsoDate(b.kuva.caption ?? ""))
    .filter((d): d is string => Boolean(d))
    .sort();
  const intro = blocksText(body.slice(0, 1)).replace(/\s*Katso myös.*$/, "");
  const parking = merged
    .filter((b): b is Extract<Lohko, { tyyppi: "kappale" }> => b.tyyppi === "kappale")
    .map((b) => b.runs.map((r) => r.text).join(""))
    .find((s) => /pysäköintipaikkaa/.test(s));
  const tiivistelma = [
    diaryDates.length
      ? `${intro.replace(/\.$/, "")} ${fiDate(diaryDates[0])}–${fiDate(diaryDates[diaryDates.length - 1])}.`
      : intro,
    parking ? `Toriparkissa on ${parking.trim().replace(/\.$/, "")}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  sivut.push({
    slug: "toriparkki",
    otsikko: "Lahden toriparkki",
    lahdesivu: sivu,
    muutLahdesivut: [sivu2],
    ...(tiivistelma.length <= 300 ? { tiivistelma } : {}),
    body: fullBody,
    needsReview: false,
    reviewReasons: [],
  });
  rep.huomiot.push(`Otsikko "${title}" → "Lahden toriparkki" (versaalit pois)`);
}

async function parsePalloveikkausSivu(
  saannot: string[],
  arvokisaIntro: string[],
  palloIntro: string[],
): Promise<void> {
  const sivu = "veikkaus.htm";
  const rep = pageReport(sivu);
  const tokens = await readPage(sivu);
  const lines = lineTokens(tokens);
  const title = lines[0].text; // "JALKAPALLOVEIKKAUS"
  let hero: KuvaRef | undefined;
  const { images, captionLineIdx } = collectImages(tokens, sivu, { maxCaptionLines: 3 });
  const im = images[0];
  if (im) {
    hero = makeKuva(
      im.file,
      im.alt,
      im.caption ? im.caption.replace(/^Kuva\s+/, "") : null,
      im.caption,
      [im.date].filter((d): d is string => Boolean(d)),
    );
  }
  const sections: string[] = [];
  for (const l of lines) {
    if (l.text === title || captionLineIdx.has(l.index)) {
      rep.kaytetytRivit += 1;
      continue;
    }
    sections.push(l.text);
    rep.kaytetytRivit += 1;
  }
  const body: Lohko[] = [];
  for (const s of sections) body.push(textPara(s, undefined, "bullet"));
  if (sections[0]) {
    body.push(textPara(sections[0], "h2"));
    if (saannot.length) {
      body.push(textPara("Säännöt", "h3"));
      for (const s of saannot) body.push(textPara(s, undefined, "number"));
    }
  }
  if (sections[1]) {
    body.push(textPara(sections[1], "h2"));
    for (const s of arvokisaIntro) body.push(textPara(s));
  }
  if (sections[2]) {
    body.push(textPara(sections[2], "h2"));
    for (const s of palloIntro) body.push(textPara(s));
  }
  const maa = taulukot.find((t) => t.slug === "klubi-maaottelujen-tulosveikkaus");
  const arvo = taulukot.filter((t) => t.slug.startsWith("klubi-arvokisaveikkaus-"));
  const pallo = taulukot.filter((t) => t.slug.startsWith("klubi-palloveikkaus-"));
  const palloYears = pallo.map((t) => Number(t.slug.replace(/\D/g, "").slice(0, 4)));
  const maaRows = maa?.rivit.filter((r) => /^\d+$/.test(r[0])).length ?? 0;
  const tiivistelma =
    `Klubin jäsenten jalkapalloveikkaukset: ${maaRows} maaottelun tulosveikkausta, ` +
    `${arvo.length} arvokisojen voittajaveikkausta ja Veikkausliigan palloveikkaus ` +
    `${Math.min(...palloYears)}–${Math.max(...palloYears)}.`;
  sivut.push({
    slug: "klubi/palloveikkaus",
    otsikko: title.charAt(0) + title.slice(1).toLowerCase(),
    lahdesivu: sivu,
    muutLahdesivut: ["veikkausmaaottelujentulos.htm", "veikkausarvokisat.htm", "veikkauspalloveikkaus.htm"],
    tiivistelma,
    ...(hero ? { hero } : {}),
    body,
    taulukot: [...PALLOVEIKKAUS_TAULUKOT],
    needsReview: false,
    reviewReasons: [],
  });
}

// ── Kuu / Loiste / Salud ────────────────────────────────────────────────────

async function parseArviot(): Promise<RavintolaArvio[]> {
  const defs = [
    { sivu: "Kuu.htm", kohdeId: "ravintola-kuu" },
    { sivu: "Loiste.htm", kohdeId: "ravintola-ravintola-loiste-vaakuna" },
    { sivu: "Salud.htm", kohdeId: "ravintola-salud" },
  ];
  const out: RavintolaArvio[] = [];
  for (const d of defs) {
    const rep = pageReport(d.sivu);
    const tokens = await readPage(d.sivu);
    const lines = lineTokens(tokens);
    // Otsikko voi katketa kahdelle riville: "KOMMENTTEJA" + "JA KUVIA / KUU Helsinki".
    const titleLines = lines.slice(0, lines[0].text.includes("/") ? 1 : 2);
    const otsikko = norm(titleLines.map((l) => l.text).join(" "));
    const skip = new Set(titleLines.map((l) => l.index));
    const review = prose(
      tokens.filter((_, i) => !skip.has(i)),
      d.sivu,
      {
        heading: (t) => (/^(\d{2}\.\d{2}\.\d{4})$/.test(t) || /\/\s*\d{2}\.\d{2}\.\d{4}$/.test(t) ? "h3" : null),
        captionLines: 2,
        isCaption: (l) => !DATE_RE.test(l),
      },
    );
    const kuvat = review
      .filter((b): b is Extract<Lohko, { tyyppi: "kuva" }> => b.tyyppi === "kuva")
      .map((b) => b.kuva);
    rep.kaytetytRivit += lines.length;
    rep.huomiot.push(
      `Ei importoida M6:n NDJSONiin: kohde ${d.kohdeId} on ravintolamigraation dokumentti; --replace tuhoaisi sen kentät. ` +
        "Integraatio patchaa review + images + muutLegacyUrlit (docs/12 avoin päätös 2).",
    );
    out.push({ kohdeId: d.kohdeId, lahdesivu: d.sivu, otsikko, review, kuvat });
  }
  return out;
}

// ── Singletonit ─────────────────────────────────────────────────────────────

async function parseSingletonit(): Promise<Singletonit> {
  const sivu = "etusivu.htm";
  const rep = pageReport(sivu);
  const html = decodeHtml(await readFile(join(RAW_DIR, sivu)));
  const tokens = tokenize(html);
  let seuraava: Singletonit["etusivu"]["seuraavaOttelu"];
  for (const l of lineTokens(tokens)) {
    const m = /^Seuraavaksi:\s*(\d{1,2}\.\d{1,2}\.\d{4})\s+(.+?)(?:,\s*(.+))?$/.exec(l.text);
    if (m) {
      const iso = firstIsoDate(m[1])!;
      // Laskurin kohdeaika skriptistä: new Date("2026-09-29T19:00:00") = selaimen paikallisaika.
      const js = /new Date\("(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::\d{2})?"\)/.exec(html);
      const aika = js && js[1] === iso ? helsinkiToUtc(iso, Number(js[2]), Number(js[3])) : undefined;
      if (!aika) rep.huomiot.push("Laskurin kellonaikaa ei löytynyt tai päivä ei täsmää");
      seuraava = { ottelu: norm(m[2]), ...(m[3] ? { kilpailu: norm(m[3]) } : {}), ...(aika ? { aika } : {}) };
      rep.kaytetytRivit += 1;
      continue;
    }
    if (/^Viimeiset:?$/.test(l.text) || / \/ (KLUBI|HISTORIA) \d{2}\.\d{2}\.\d{4}$/.test(l.text) || /\/ (KLUBI|HISTORIA) \d/.test(l.text)) {
      // "Viimeiset" = otsikkoarkiston kärki; lohko hakee uutiset itse (migraatio-lahdehavainnot M6).
      rep.kaytetytRivit += 1;
      continue;
    }
    if (/Otsikko-arkisto/.test(l.text)) {
      rep.kaytetytRivit += 1;
      continue;
    }
    rep.kasittelemattomat.push(l.text);
  }
  rep.huomiot.push("Viimeiset-otsikot (3 kpl) ei tallenneta: uutiset-lohko hakee ne M1:n uutisdokumenteista");
  rep.huomiot.push("Linkit Otsikko-arkisto / Klubin avoin palsta / ENGLISH: navigaatio tulee lib/defaults.ts:stä, ei vanhasta etusivusta");

  // Logo: vanhan sivuston hyppyrimäkilogo (etusivu, english).
  const logoFile = imageFile("hyppyrimakilogo.jpg", sivu);
  if (logoFile) dropImage(logoFile, sivu, "yhdistyksen logo → asetukset.logo (ei sisältökuva etusivulla)");
  // Lähteen alt on "Lahden Suomalainen Klubi ry" ja kuvassa on yhdistyksen nimi
  // ja hyppyrimäkitunnus — kyse on klubin omasta logosta (tarkistettu kuvasta).
  const logoAlt = "Lahden Suomalainen Klubi ry:n logo";

  const yleista = sivut.find((s) => s.slug === "klubi");
  const esittelyBody = yleista?.body.filter((b) => b.tyyppi === "kappale" && !b.tyyli && !b.lista).slice(0, 1) ?? [];
  const esittelyCta = defaultEtusivu.blocks.find((b) => b._type === "esittely");

  return {
    etusivu: {
      heroEyebrow: defaultEtusivu.heroEyebrow ?? undefined,
      heroTitle: defaultEtusivu.heroTitle,
      heroDescription: defaultEtusivu.heroDescription,
      heroCtas: (defaultEtusivu.heroCtas ?? []).map((c) => ({ label: c.label, href: c.href, primary: Boolean(c.primary) })),
      ...(seuraava ? { seuraavaOttelu: seuraava } : {}),
      blocks: [
        { tyyppi: "uutiset", count: 3 },
        { tyyppi: "tapahtumat", count: 3 },
        {
          tyyppi: "esittely",
          ...(yleista ? { heading: yleista.otsikko } : {}),
          ...(esittelyBody.length ? { body: esittelyBody } : {}),
          ...(esittelyCta && "ctaLabel" in esittelyCta && esittelyCta.ctaLabel ? { ctaLabel: esittelyCta.ctaLabel } : {}),
          ...(esittelyCta && "ctaHref" in esittelyCta && esittelyCta.ctaHref ? { ctaHref: esittelyCta.ctaHref } : {}),
        },
        { tyyppi: "ravintolatSpotlight", count: 5 },
        { tyyppi: "jalkapalloarkisto" },
        { tyyppi: "galleria", count: 3 },
        {
          tyyppi: "cta",
          heading: (defaultEtusivu.heroCtas ?? []).find((c) => c.primary)?.label ?? "Liity jäseneksi",
          ctaLabel: "Lue lisää jäsenyydestä",
          ctaHref: (defaultEtusivu.heroCtas ?? []).find((c) => c.primary)?.href ?? "/klubi/liity",
        },
      ],
      lahteet: [
        "hero*: lib/defaults.ts defaultEtusivu",
        "seuraavaOttelu: etusivu.htm 'Seuraavaksi' + laskurin skripti",
        "blocks: app/(public)/page.tsx scaffoldBlocks -järjestys (docs/02); esittely = yleista.htm:n otsikko ja ensimmäinen kappale, " +
          "napin teksti/linkki lib/defaults.ts; CTA = lib/defaults.ts:n pää-CTA + page.tsx:n napin teksti",
      ],
      lahdesivu: sivu,
    },
    navigaatio: {
      items: defaultNavigation.items.map((it) => ({
        label: it.label,
        href: it.href,
        highlight: Boolean(it.highlight),
        ...(it.children?.length ? { children: it.children.map((c) => ({ label: c.label, href: c.href })) } : {}),
      })),
    },
    asetukset: { siteName: "Lahden Suomalainen Klubi ry", ...(logoFile ? { logo: { file: logoFile, alt: logoAlt } } : {}) },
    yhteystiedot: { city: "Lahti" },
  };
}

// ── Pääohjelma ──────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  await loadRedirects();
  await loadInventory();

  await parseTalkoot();
  await parseVappu();
  await parseMolkky();
  await parseNumbered(
    "vuosikokous.htm",
    "vuosikokous",
    "Vuosikokous",
    40,
    /^Vuosikokoukset:?$/,
    (t) => {
      const last = t.vuodet[t.vuodet.length - 1];
      return (
        `Klubin vuosikokous on pidetty ${t.vuodet.length} kertaa vuodesta ${t.vuodet[0].vuosi}, ` +
        `viimeksi ${fiDate(last.paivamaara!)} (${last.paikka}).`
      );
    },
  );
  await parseMatkailu();
  await parseSmall("ilotulitukset.htm", "ilotulitukset", "Ilotulitukset", 60);
  await parseJouluruokailu();
  await parseSmall("musiikki.htm", "musiikki", "Musiikki", 80);
  await parseNumbered(
    "venetsialaiset.htm",
    "venetsialaiset",
    "Venetsialaiset",
    90,
    /^Venetsialaiset Lahdessa:*$/,
    (t) => {
      const kymi = t.vuodet.filter((v) => v.paikka === "Kymijärvi").length;
      return (
        `Klubi on viettänyt Venetsialaisia Lahdessa ${t.vuodet.length} kertaa vuodesta ${t.vuodet[0].vuosi}` +
        (kymi * 2 > t.vuodet.length ? ", useimmiten Kymijärvellä." : ".")
      );
    },
  );

  const { saannot } = await parseMaaottelut();
  const { intro: arvokisaIntro } = await parseArvokisat();
  const { intro: palloIntro } = await parsePalloveikkaus();

  await parseYleista();
  await parseEnglish();
  await parseToriparkki();
  await parsePalloveikkausSivu(saannot, arvokisaIntro, palloIntro);
  const arviot = await parseArviot();
  const singletonit = await parseSingletonit();

  // Vuosimerkinnät aikajärjestykseen (vanhin ensin; kysely järjestää uusin ensin).
  for (const t of toiminnat) {
    t.vuodet.sort((a, b) => (a.paivamaara ?? `${a.vuosi}`).localeCompare(b.paivamaara ?? `${b.vuosi}`));
    if (!t.tiivistelma && !t.needsReview) {
      t.needsReview = true;
      t.reviewReasons.push("Tiivistelmää ei voitu johtaa lähteestä");
    }
  }
  toiminnat.sort((a, b) => a.jarjestys - b.jarjestys);

  const coverage: CoverageRivi[] = [
    { legacyUrl: "/etusivu.htm", tila: "migrated", kohde: "etusivu", huomio: "Singleton: seuraavaOttelu vanhalta etusivulta, hero lib/defaults.ts; Viimeiset-otsikot hakee uutiset-lohko" },
    { legacyUrl: "/yleista.htm", tila: "migrated", kohde: "sivu-klubi", huomio: "Tarkoitus, perustaminen ja toimintalinkit; slug klubi" },
    { legacyUrl: "/english.htm", tila: "migrated", kohde: "sivu-english", huomio: "Slug english → /english (redirect nyt /klubi: päivitä)" },
    { legacyUrl: "/veikkaus.htm", tila: "migrated", kohde: "sivu-klubi-palloveikkaus", huomio: "Hubi = palloveikkaussivun legacyUrl; kolme alasivua muutLegacyUrlit" },
  ];
  for (const t of toiminnat) {
    coverage.push({
      legacyUrl: `/${t.lahdesivu}`,
      tila: "migrated",
      kohde: `klubiToiminta-${t.slug}`,
      huomio:
        `${t.vuodet.length} vuosimerkintää` +
        (t.taulukot.length ? `, ${t.taulukot.length} taulukkoa` : "") +
        (["matkailu", "musiikki"].includes(t.slug) ? `; redirect nyt /klubi/toiminta → päivitä /klubi/toiminta/${t.slug}` : "") +
        (t.needsReview ? "; needsReview" : ""),
    });
  }
  const tilastoCount = (sivu: string) => taulukot.filter((t) => t.lahdesivu === sivu).length;
  for (const sivu of ["veikkausmaaottelujentulos.htm", "veikkausarvokisat.htm", "veikkauspalloveikkaus.htm"]) {
    coverage.push({
      legacyUrl: `/${sivu}`,
      tila: "merged",
      kohde: "sivu-klubi-palloveikkaus",
      huomio: `${tilastoCount(sivu)} jalkapalloTilasto-dokumenttia (kategoria klubi), viitattu sivu.tilastot-kentästä; muutLegacyUrlit`,
    });
  }
  coverage.push(
    { legacyUrl: "/toriparkki.htm", tila: "migrated", kohde: "sivu-toriparkki", huomio: "Kuvapäiväkirja; slug toriparkki (redirect nyt /jalkapalloarkisto: väärä, päivitä /toriparkki)" },
    { legacyUrl: "/toriparkkilahti.htm", tila: "merged", kohde: "sivu-toriparkki", huomio: "Tekniset tiedot osiona; muutLegacyUrlit (redirect nyt /jalkapalloarkisto: päivitä /toriparkki)" },
  );
  for (const a of arviot) {
    coverage.push({
      legacyUrl: `/${a.lahdesivu}`,
      tila: "merged",
      kohde: a.kohdeId,
      huomio:
        "Arviokommentit valmiina data/normalized/klubi-ravintola-arviot.json; EI importoitu (ravintola on toisen putken dokumentti, --replace tuhoaisi kentät) " +
        "→ integraatio patchaa review/images/muutLegacyUrlit. Redirect nyt /jalkapalloarkisto: väärä",
    });
  }

  // Solujen normalisointi (docs/12 §1.2): date → ISO, number → kokonaisluku,
  // epäselvä sarake → text. Näkymättömät merkit pois kaikista teksteistä.
  for (const t of taulukot) {
    const res = normalizeGrid(
      t.sarakkeet.map((c) => ({ type: c.tyyppi, label: c.otsikko })),
      t.rivit,
    );
    t.sarakkeet = t.sarakkeet.map((c, i) => ({ ...c, tyyppi: res.types[i] }));
    t.rivit = res.rows;
    t.huomiot.push(...res.notes);
  }
  const rawData: KlubiData = { sivut, toiminnat, taulukot, singletonit, coverage };
  const invisibleRemoved = countInvisible(rawData);
  const data: KlubiData = stripInvisibleDeep(rawData);

  // ── Tarkistukset ──
  const problems: string[] = [];
  const slugs = new Set<string>();
  for (const t of taulukot) {
    if (slugs.has(t.slug)) problems.push(`Kaksoisslug: ${t.slug}`);
    slugs.add(t.slug);
    const w = t.sarakkeet.length;
    if (t.rivit.some((r) => r.length !== w)) problems.push(`${t.slug}: rivien leveys ≠ sarakemäärä`);
    if (t.rivit.length === 0) problems.push(`${t.slug}: ei rivejä`);
  }
  const MOJIBAKE = /Ã¤|Ã¶|Ã…|Ã„|Ã–|â€|&auml;|&ouml;|&nbsp;|&amp;|�|채/;
  const json = JSON.stringify(data);
  if (MOJIBAKE.test(json)) problems.push(`Mojibake: ${MOJIBAKE.exec(json)?.[0]}`);

  const allKuvat: KuvaRef[] = [];
  const collect = (bs: Lohko[] | undefined) => bs?.forEach((b) => b.tyyppi === "kuva" && allKuvat.push(b.kuva));
  for (const s of sivut) {
    collect(s.body);
    if (s.hero) allKuvat.push(s.hero);
  }
  for (const t of toiminnat) {
    allKuvat.push(...(t.kuvat ?? []));
    for (const v of t.vuodet) allKuvat.push(...(v.kuvat ?? []));
  }
  const arvioKuvat = arviot.flatMap((a) => a.kuvat);

  const report = {
    lahdesivut: pageReports.length,
    dokumentit: {
      sivu: sivut.length,
      klubiToiminta: toiminnat.length,
      jalkapalloTilasto: taulukot.length,
      singletonit: 4,
      yhteensa: sivut.length + toiminnat.length + taulukot.length + 4,
    },
    vuosimerkinnat: Object.fromEntries(toiminnat.map((t) => [t.slug, t.vuodet.length])),
    needsReview: {
      sivu: sivut.filter((s) => s.needsReview).map((s) => ({ slug: s.slug, syyt: s.reviewReasons })),
      klubiToiminta: toiminnat.filter((t) => t.needsReview).map((t) => ({ slug: t.slug, syyt: t.reviewReasons })),
      jalkapalloTilasto: taulukot.filter((t) => t.needsReview).map((t) => ({ slug: t.slug, syyt: t.reviewReasons })),
    },
    kuvat: {
      liitetty: allKuvat.length,
      altLahde: {
        lahde: allKuvat.filter((k) => k.altLahde === "lahde").length,
        konteksti: allKuvat.filter((k) => k.altLahde === "konteksti").length,
        tiedostonimi: allKuvat.filter((k) => k.altLahde === "tiedostonimi").length,
      },
      logo: singletonit.asetukset.logo?.file ?? null,
      ravintolaArvioissa: arvioKuvat.length,
      pudotettu: dropped.length,
    },
    taulukot: taulukot.map((t) => ({
      slug: t.slug,
      lahdesivu: t.lahdesivu,
      lahdeRivit: t.lahdeRivit,
      rivit: t.rivit.length,
      sarakkeet: t.sarakkeet.length,
      rivitSelite: t.rivitSelite,
      huomiot: t.huomiot,
    })),
    nimikorjaukset: { llpo_Ilpo: nimikorjauksia },
    nakymattomiaMerkkejaPoistettu: invisibleRemoved,
    linkit: toiminnat.flatMap((t) => t.vuodet.filter((v) => v.linkki).map((v) => `${t.slug} ${v.vuosi} ${v.linkki!.url}`)),
    osallistujamaarat: Object.fromEntries(
      toiminnat
        .filter((t) => t.vuodet.some((v) => v.osallistujaMaara !== undefined))
        .map((t) => [
          t.slug,
          {
            merkintoja: t.vuodet.filter((v) => v.osallistujaMaara !== undefined).length,
            tasmaa: t.vuodet.filter((v) => v.osallistujaMaara === v.osallistujat?.length).length,
          },
        ]),
    ),
    slugPoikkeamat: [
      "/english.htm: redirect /klubi → uusi /english (sivu-english)",
      "/matkailu.htm: redirect /klubi/toiminta → /klubi/toiminta/matkailu",
      "/musiikki.htm: redirect /klubi/toiminta → /klubi/toiminta/musiikki",
      "/toriparkki.htm, /toriparkkilahti.htm: redirect /jalkapalloarkisto (väärä) → /toriparkki",
      "/Kuu.htm, /Loiste.htm, /Salud.htm: redirect /jalkapalloarkisto (väärä) → ravintolan sivu (/ravintolat/<kaupunki>/<slug>) kun patch on tehty",
    ],
    sivut: pageReports,
    ongelmat: problems,
  };

  await writeFile(OUT, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
  await writeFile(OUT_REPORT, `${JSON.stringify(report, null, 2)}\n`, "utf-8");
  await writeFile(OUT_ARVIOT, `${JSON.stringify(arviot, null, 2)}\n`, "utf-8");
  await writeFile(OUT_DROPPED, `${JSON.stringify(dropped, null, 2)}\n`, "utf-8");

  const unhandled = pageReports.reduce((n, r) => n + r.kasittelemattomat.length, 0);
  console.log(`
Lähdesivuja ............. ${pageReports.length}
Sivuja (sivu) ........... ${sivut.length}
Toimintamuotoja ......... ${toiminnat.length}  (vuosimerkintöjä ${toiminnat.reduce((n, t) => n + t.vuodet.length, 0)})
Taulukoita .............. ${taulukot.length}
Kuvia liitetty .......... ${allKuvat.length}  (+ logo, + ${arvioKuvat.length} ravintola-arvioissa)
Kuvia pudotettu ......... ${dropped.length}
Tarkistettavia .......... sivu ${report.needsReview.sivu.length}, toiminta ${report.needsReview.klubiToiminta.length}, taulukko ${report.needsReview.jalkapalloTilasto.length}
Käsittelemättömiä rivejä  ${unhandled}
Ongelmia ................ ${problems.length}${problems.length ? `\n  ${problems.join("\n  ")}` : ""}

Kirjoitettu: ${OUT}
             ${OUT_REPORT}
             ${OUT_ARVIOT}
             ${OUT_DROPPED}`);
  if (problems.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
