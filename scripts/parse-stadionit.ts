/**
 * Purkaa vanhan sivuston stadionsivut rakenteiseksi JSON:iksi.
 *
 * Ajo:    `npx tsx scripts/parse-stadionit.ts`
 * Lähde:  data/raw-html/stadion*.htm, pietarikrestovskystadium.htm,
 *         wembleylontoo.htm, ateenanolympiastadion.htm,
 *         puutteellisetjarjestelyt.htm
 *         data/normalized/kuvat.json   (kuvainventaario)
 *         lib/redirects.ts             (slugit — vain luku)
 * Tulos:  data/normalized/stadionit.json
 *         data/normalized/stadionit-report.json
 *         data/normalized/stadionit-kuvat-dropped.json
 *
 * Tulos on CMS-riippumaton (docs/12 §2): Sanity-muunnos tehdään
 * `scripts/import-stadionit.ts`:ssä.
 *
 * Sivutyypit:
 *   - stadionsivu:  otsikko → osoite → "Kapasiteetti: 1.600" / "Rakennettu: 1932"
 *                   → mahdollinen proosa → kuvat → kuvateksti
 *   - hubi (`stadionit.htm`): maa → kaupunki → stadion -linkkitaulukko. Ei omaa
 *                   dokumenttia; siitä luetaan jokaisen stadionin kaupunki ja maa.
 *   - `puutteellisetjarjestelyt.htm`: ei stadion vaan 3-sarakkeinen taulukko +
 *                   kuvitettu selostusosio → `jalkapalloTilasto` (kategoria `muu`).
 *
 * Periaatteet: ei keksitä mitään. Kapasiteetti ja avausvuosi poimitaan vain
 * kun lähteessä on yksiselitteinen merkintä; muu teksti säilyy kuvauksessa.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { load, type CheerioAPI } from "cheerio";
import type { AnyNode, Element } from "domhandler";

import type { KuvaRecord } from "./download-images";
import { decodeHtml } from "./lib/decode-html";
import { countInvisible, normalizeKeyed, stripInvisibleDeep } from "./lib/normalize-cell";
import { localImageName } from "./lib/image-names";
import { deriveAltFromFilename } from "./lib/derive-alt";

const ROOT = process.cwd();
const RAW_DIR = join(ROOT, "data", "raw-html");
const INVENTORY = join(ROOT, "data", "normalized", "kuvat.json");
const REDIRECTS = join(ROOT, "lib", "redirects.ts");
const OUT = join(ROOT, "data", "normalized", "stadionit.json");
const REPORT = join(ROOT, "data", "normalized", "stadionit-report.json");
const DROPPED = join(ROOT, "data", "normalized", "stadionit-kuvat-dropped.json");

const HUB_FILE = "stadionit.htm";
const TABLE_FILE = "puutteellisetjarjestelyt.htm";

/** Stadionsivut, joiden nimi ei ala `stadion`-etuliitteellä. */
const EXTRA_STADIUM_FILES = [
  "pietarikrestovskystadium.htm",
  "wembleylontoo.htm",
  "ateenanolympiastadion.htm",
];

// ---------------------------------------------------------------------------
// Nimetyt korjaukset. Jokainen poikkeama on tässä näkyvästi, ei piilossa
// säännöissä, ja jokainen päätyy raporttiin.
// ---------------------------------------------------------------------------

/**
 * Kaupunkien nimien korjaukset hubin kirjoitusasuun. Vanha sivu kirjoittaa
 * virolaisen Võrun muodossa "Vöru" (õ puuttuu suomalaiselta näppäimistöltä).
 */
const CITY_NAME_FIXES: Record<string, string> = { Vöru: "Võru" };

/** Maiden nimet hubin kirjoitusasusta viralliseen suomenkieliseen muotoon. */
const COUNTRY_NAME_FIXES: Record<string, string> = {
  Tshekki: "Tšekki",
  Englanti: "Iso-Britannia",
};

/**
 * Stadionien nimien korjaukset sen jälkeen kun kaupunki on poistettu
 * otsikosta. Pidetään lyhyenä: vain kirjoitusasu, ei sisältöä.
 */
const STADIUM_NAME_FIXES: Record<string, string> = {
  "Vöru Stadium": "Võru Stadium",
};

/** Paikallissija tiivistelmää varten ("sijaitsee Lahdessa"). */
const CITY_LOCATIVE: Record<string, string> = {
  helsinki: "Helsingissä",
  lahti: "Lahdessa",
  tampere: "Tampereella",
  turku: "Turussa",
  tallinna: "Tallinnassa",
  tarto: "Tartossa",
  voru: "Võrussa",
  ventspils: "Ventspilsissä",
  moskova: "Moskovassa",
  pietari: "Pietarissa",
  teplice: "Teplicessä",
  lontoo: "Lontoossa",
  ateena: "Ateenassa",
  koopenhamina: "Kööpenhaminassa",
};

/**
 * Kaupungit, joita ei ole vielä Sanityssa (ravintolamigraatio loi 44
 * kaupunkia; nämä puuttuivat, ks. docs/migraatio-lahdehavainnot.md M5). Import luo vain
 * nämä, jotta olemassa olevien kaupunkien kenttiä ei ylikirjoiteta.
 */
export const NEW_CITY_SLUGS = ["ateena", "moskova", "pietari", "teplice", "voru"];

/**
 * Tiedot, jotka ovat lähteessä yksiselitteisiä mutta tosiasiallisesti
 * vanhentuneita → merkitään tarkistettaviksi, arvoa ei muuteta.
 */
const REVIEW_NOTES: Record<string, string> = {
  "wembleylontoo.htm":
    "Lähteen 'Otettu käyttöön: 1923' koskee vanhaa Wembleytä; nykyinen stadion (kuvat 2013) avattiin 2007. Tarkista rakennusvuosi.",
};

/**
 * Kuvien alt-tekstit kuville, joilla lähteessä ei ole kuvaavaa alt-tekstiä.
 *
 * Stadionsivujen kuvat saavat altin automaattisesti (stadion + kaupunki).
 * Nämä ovat ne tapaukset, joissa se ei riitä: katsomokartat (kuvaus kuvan
 * sisällöstä) ja puutteelliset järjestelyt -sivun selostuskuvat, joiden alt
 * on koottu viereisestä kuvatekstistä "(pp.kk.vvvv / Kuva …)" ja otsikosta.
 * Mitään ei ole lisätty lähteen ulkopuolelta.
 */
const ALT_OVERRIDES: Record<string, string> = {
  "katsomokartta.gif":
    "Finnair Stadiumin katsomokartta: katsomonosat, portit ja lipunmyyntipisteet",
  "olympiastadionpohjakartta.gif": "Helsingin Olympiastadionin katsomojako",
  "ratinapohja.jpg": "Ratinan stadionin katsomokartta: katsomolohkot ja portit",
  "LahtiKuPS240427jono.jpg":
    "Katsojajono sisäänkäynnillä ottelussa FC Lahti - KuPS 27.04.2024",
  "FinnairStadium231130.jpg": "Finnair Stadium ottelussa HJK - Aberdeen 30.11.2023",
  "211009Olympiastadion.jpeg": "Olympiastadion ottelussa Suomi - Ukraina 09.10.2021",
  "130607Viuhahtaja.jpg":
    "Kentälle juossut katsoja ottelussa Suomi - Valko-Venäjä, Olympiastadion 07.06.2013",
  "120722KuPSInterTulostaulu.jpg":
    "Kuopion keskuskentän tulostaulu ottelussa KuPS - Inter 22.07.2012",
  "120524NatsilippuLahdenStadion.jpg":
    "Natsilippu kisatulitornin vieressä, Lahden Stadion 24.05.2012",
  "120524NatsilippuLahdenStadionA.jpg":
    "Natsilippu ja kisatulitorni, Lahden Stadion 24.05.2012",
  "120516fclahdenkarsinastadionilla.jpg":
    "Aidoista tehty karsina poistumisaukolla, Lahden Stadion 16.05.2012",
  "101017Lammitin.jpg": "Pääkatsomon lämmitin, Lahden Stadion 17.10.2010",
  "101017Urhoedessa.jpg": "Urho TV:n mainostötterö katsomon edessä, Lahden Stadion 17.10.2010",
  "090923Viallinentulostaulu.jpg":
    "Lahden Stadionin tulostaulu virheellisellä tilanteella 23.09.2009",
  "090830CityStars-Pallohonka.jpg":
    "Teemu Toukonen (City Stars) Kivimaan kentällä 30.08.2009",
  "090730RavintolaAeropoli.jpg": "Ravintola Aeropoli, Finnair Stadium 30.07.2009",
  "CityStarsPirkkalaSuomenCup090709.jpg":
    "City Stars - Pirkkala JK, Suomen cup, Lahden Kisapuisto 09.07.2009",
  "mainoksetnurin090429.JPG": "Kaatuneita mainostauluja, Lahden Stadion 29.04.2009",
  "fclahtihuuhkalahteelentoon090419.JPG":
    "Huuhka lentää maalinsa jälkeen, FC Honka - FC Lahti 19.04.2009",
  "stadionlahtiurheilukeskusvalotaulu131005.jpg":
    "Lahden Stadionin pimeä valotaulu 05.10.2013",
};

// ---------------------------------------------------------------------------
// Tyypit (CMS-riippumattomat)
// ---------------------------------------------------------------------------

export interface Span {
  text: string;
  bold?: boolean;
  italic?: boolean;
  href?: string;
}

export interface ImageRef {
  /** Alkuperäinen src sellaisenaan. */
  src: string;
  /** Tiedostonimi data/images/-kansiossa (kuvat.json `file`). */
  file: string;
  alt: string;
  /** Mistä alt tuli: lähde | kuratoitu | stadion | tiedostonimi. */
  altSource: "lahde" | "kuratoitu" | "stadion" | "tiedostonimi";
  caption?: string;
}

export type Block =
  | { kind: "paragraph" | "heading" | "bullet"; spans: Span[] }
  | { kind: "image"; image: ImageRef };

export interface City {
  slug: string;
  name: string;
  country: string;
  /** Hubin alkuperäinen kirjoitusasu, jos korjattu. */
  sourceName?: string;
  isNew: boolean;
}

export interface Stadium {
  sourceFile: string;
  legacyUrl: string;
  slug: string;
  name: string;
  /** Sivun otsikko sellaisenaan. */
  nameRaw: string;
  city: City;
  address: string | null;
  capacity: number | null;
  openedYear: number | null;
  /** Avausvuoden lähdemerkintä ("Rakennettu", "Otettu käyttöön", "Avattu"). */
  openedLabel: string | null;
  description: Block[];
  images: ImageRef[];
  tiivistelma: string | null;
  needsReview: boolean;
  reviewReasons: string[];
  notes: string[];
}

export interface Column {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "year" | "link";
}

export interface StatTable {
  sourceFile: string;
  legacyUrl: string;
  slug: string;
  title: string;
  category: string;
  tiivistelma: string | null;
  columns: Column[];
  rows: Record<string, string>[];
  lisatiedot: Block[];
  needsReview: boolean;
  reviewReasons: string[];
  notes: string[];
}

export interface Normalized {
  cities: City[];
  stadiums: Stadium[];
  tables: StatTable[];
}

// ---------------------------------------------------------------------------
// Apurit
// ---------------------------------------------------------------------------

/**
 * Vanhan sivuston `<meta charset>` ei ole luotettava (docs/migraatio-lahdehavainnot.md
 * §0.1): yritetään tiukkaa UTF-8:aa ja palataan windows-1252:een.
 */
// decodeHtml: scripts/lib/decode-html.ts (yhteinen, oikea windows-1252-taulukko).

/** Pelkistää vertailua varten: pienet kirjaimet, ei diakriittejä, ei välimerkkejä. */
function fold(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Suomalainen slug: ä→a, ö→o, õ→o, pienet kirjaimet, väliviivat. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Välilyönnit yhdeksi, NBSP välilyönniksi, NFC. */
function clean(s: string): string {
  return s
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .normalize("NFC");
}

/** "27.04.2024" → "2024-04-27"; null jos päivä ei ole kelvollinen. */
function toIsoDate(finnish: string): string | null {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(finnish.trim());
  if (!m) return null;
  const dd = m[1].padStart(2, "0");
  const mm = m[2].padStart(2, "0");
  const yyyy = m[3];
  const date = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getUTCDate() !== Number(dd) || date.getUTCMonth() + 1 !== Number(mm)) {
    return null;
  }
  return `${yyyy}-${mm}-${dd}`;
}

const DATE_IN_TEXT = /\b\d{1,2}\.\d{1,2}\.\d{4}\b/g;

function formatThousands(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// ---------------------------------------------------------------------------
// HTML → rivivirta
// ---------------------------------------------------------------------------

type Item =
  | { t: "line"; spans: Span[]; raw: string }
  | { t: "img"; src: string; alt: string };

const BLOCK_TAGS = new Set([
  "p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "table", "tbody", "tr", "td",
  "th", "ul", "ol", "li", "blockquote",
]);

interface Marks {
  bold: boolean;
  italic: boolean;
  href?: string;
}

/**
 * Litistää DOM-alipuun riveiksi. `<br>` ja lohkoelementit katkaisevat rivin,
 * kuva on oma alkionsa. Lihavointi periytyy (`<b>`, `<strong>`,
 * `font-weight: bold`). Lähdekoodin kovat rivinvaihdot säilyvät `raw`-kentässä
 * (osoiterivillä ne erottavat katuosoitteen postinumerosta), mutta näkyvässä
 * tekstissä ne ovat välilyöntejä kuten selaimessa.
 */
function linearize($: CheerioAPI, nodes: AnyNode[]): Item[] {
  const items: Item[] = [];
  let spans: Span[] = [];

  const flush = () => {
    const raw = spans.map((s) => s.text).join("");
    if (clean(raw)) items.push({ t: "line", spans: normalizeSpans(spans), raw });
    spans = [];
  };

  const walk = (node: AnyNode, marks: Marks) => {
    if (node.type === "text") {
      const text = (node as unknown as { data: string }).data;
      if (text) spans.push({ text, bold: marks.bold, italic: marks.italic, href: marks.href });
      return;
    }
    if (node.type !== "tag") return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (tag === "script" || tag === "style") return;
    if (tag === "br") {
      flush();
      return;
    }
    if (tag === "img") {
      flush();
      const src = $(el).attr("src")?.trim();
      if (src) items.push({ t: "img", src, alt: clean($(el).attr("alt") ?? "") });
      return;
    }
    const style = ($(el).attr("style") ?? "").toLowerCase();
    const next: Marks = {
      bold: marks.bold || tag === "b" || tag === "strong" || /font-weight:\s*(bold|[6-9]00)/.test(style),
      italic: marks.italic || tag === "i" || tag === "em",
      href: tag === "a" ? ($(el).attr("href")?.trim() || marks.href) : marks.href,
    };
    const isBlock = BLOCK_TAGS.has(tag);
    if (isBlock) flush();
    for (const child of el.children) walk(child, next);
    if (isBlock) flush();
  };

  for (const node of nodes) walk(node, { bold: false, italic: false });
  flush();
  return items;
}

/**
 * Siistii rivin spanit: välilyönnit, reunojen trimmaus, samanmerkkisten
 * yhdistäminen. Lihavointi pudotetaan spaneista, joissa ei ole kirjaimia
 * (FrontPagen `<b> </b>` ja `<b>.</b>` -jäänteet).
 */
function normalizeSpans(input: Span[]): Span[] {
  const out: Span[] = [];
  for (const s of input) {
    const text = s.text.replace(/\u00a0/g, " ").replace(/\s+/g, " ");
    if (!text) continue;
    const hasLetters = /\p{L}/u.test(text);
    const span: Span = { text };
    if (s.bold && hasLetters) span.bold = true;
    if (s.italic && hasLetters) span.italic = true;
    if (s.href) span.href = s.href;
    const prev = out[out.length - 1];
    if (prev && prev.bold === span.bold && prev.italic === span.italic && prev.href === span.href) {
      prev.text += span.text;
    } else {
      out.push(span);
    }
  }
  // Reunat ja NFC
  if (out.length) {
    out[0].text = out[0].text.replace(/^\s+/, "");
    out[out.length - 1].text = out[out.length - 1].text.replace(/\s+$/, "");
  }
  return out
    .map((s) => ({ ...s, text: s.text.normalize("NFC") }))
    .filter((s) => s.text.length > 0);
}

function lineText(item: { spans: Span[] }): string {
  return clean(item.spans.map((s) => s.text).join(""));
}

function isAllBold(spans: Span[]): boolean {
  const lettered = spans.filter((s) => /\p{L}/u.test(s.text));
  return lettered.length > 0 && lettered.every((s) => s.bold);
}

// ---------------------------------------------------------------------------
// Lähteet: redirectit, inventaario, hubi
// ---------------------------------------------------------------------------

/** lib/redirects.ts → { "stadionlahtikisapuisto.htm": "lahtikisapuisto" } */
async function loadRedirectSlugs(): Promise<Map<string, string>> {
  const text = await readFile(REDIRECTS, "utf-8");
  const map = new Map<string, string>();
  const re = /source:\s*"\/([^"]+)",\s*destination:\s*"([^"]+)"/g;
  for (const m of text.matchAll(re)) {
    const dest = /^\/jalkapalloarkisto\/stadionit\/([^/]+)$/.exec(m[2]);
    if (dest) map.set(m[1].toLowerCase(), dest[1]);
  }
  return map;
}

interface Inventory {
  byPageAndSrc: Map<string, KuvaRecord>;
  byPage: Map<string, KuvaRecord[]>;
}

async function loadInventory(): Promise<Inventory> {
  const records = JSON.parse(await readFile(INVENTORY, "utf-8")) as KuvaRecord[];
  const byPageAndSrc = new Map<string, KuvaRecord>();
  const byPage = new Map<string, KuvaRecord[]>();
  for (const r of records) {
    for (const page of r.pages) {
      byPageAndSrc.set(`${page}|${localImageName(r.src)}`, r);
      const list = byPage.get(page) ?? [];
      list.push(r);
      byPage.set(page, list);
    }
  }
  return { byPageAndSrc, byPage };
}

interface HubEntry {
  country: string;
  city: string;
  linkText: string;
}

/**
 * Hubi on kaksisarakkeinen taulukko, jossa sarake luetaan ylhäältä alas:
 * maa (lihavoitu, ei `size`-attribuuttia) → kaupunki (lihavoitu, `size="2"`)
 * → stadionlinkit. Tulos: tiedosto → { maa, kaupunki, linkkiteksti }.
 */
function parseHub(html: string): Map<string, HubEntry> {
  const $ = load(html);
  const rows = $("table").first().children("tbody").children("tr").toArray();
  const columns: Element[][] = [[], []];
  for (const row of rows) {
    $(row)
      .children("td")
      .each((i, td) => {
        if (i < 2) columns[i].push(td);
      });
  }

  const out = new Map<string, HubEntry>();
  for (const cells of columns) {
    let country = "";
    let city = "";
    for (const td of cells) {
      const $td = $(td);
      const link = $td.find("a[href]").first();
      const text = clean($td.text());
      if (!text) continue;
      if (link.length) {
        const file = (link.attr("href") ?? "").trim().toLowerCase();
        out.set(file, { country, city, linkText: clean(link.text()) });
        continue;
      }
      if ($td.find("b").length === 0) continue;
      const size = $td.find("font").first().attr("size");
      if (size === "2") city = text;
      else {
        country = text;
        city = "";
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Kuvat
// ---------------------------------------------------------------------------

interface ImageContext {
  inventory: Inventory;
  page: string;
  used: Set<string>;
  report: ImageIssue[];
}

interface ImageIssue {
  page: string;
  src: string;
  issue: string;
}

/** Onko alt kuvaava: vähintään kaksi sanaa eikä tiedostonimen näköinen. */
function isDescriptiveAlt(alt: string): boolean {
  if (!alt || alt.length < 3) return false;
  if (!/\s/.test(alt)) return false;
  if (/\.(jpe?g|png|gif)$/i.test(alt)) return false;
  // "Parken 210612" = tiedostonimen päiväys, ei kuvaus
  if (/\b\d{6}\b/.test(alt)) return false;
  return true;
}

function resolveImage(
  ctx: ImageContext,
  src: string,
  sourceAlt: string,
  fallbackAlt: string | null,
): ImageRef | null {
  const key = `${ctx.page}|${localImageName(src)}`;
  const record = ctx.inventory.byPageAndSrc.get(key);
  if (!record || !record.ok) {
    ctx.report.push({
      page: ctx.page,
      src,
      issue: record ? `lataus epäonnistui (HTTP ${record.status})` : "ei kuvainventaariossa",
    });
    return null;
  }
  ctx.used.add(record.file);

  const override = ALT_OVERRIDES[record.file];
  if (override) return { src, file: record.file, alt: override, altSource: "kuratoitu" };
  if (fallbackAlt) return { src, file: record.file, alt: fallbackAlt, altSource: "stadion" };
  if (isDescriptiveAlt(sourceAlt)) {
    return { src, file: record.file, alt: sourceAlt.slice(0, 200), altSource: "lahde" };
  }
  const derived = deriveAltFromFilename(record.file);
  ctx.report.push({ page: ctx.page, src, issue: "alt johdettu tiedostonimestä — tarkista" });
  return {
    src,
    file: record.file,
    alt: derived ?? "Kuva puutteellisista järjestelyistä",
    altSource: "tiedostonimi",
  };
}

// ---------------------------------------------------------------------------
// Stadionsivu
// ---------------------------------------------------------------------------

const CAPACITY = /Kapasiteetti:?\s*(\d{1,3}(?:[. ]\d{3})+|\d+)/gi;
const OPENED_PATTERNS: { label: string; re: RegExp }[] = [
  { label: "Rakennettu", re: /Rakennettu:?\s*(?:vuonna\s*)?(\d{4})/gi },
  { label: "Otettu käyttöön", re: /Otettu käyttöön:?\s*(?:\d{1,2}\.\d{1,2}\.)?(\d{4})/gi },
  { label: "Avattu", re: /Avattu:?\s*(?:\d{1,2}\.\d{1,2}\.)?(\d{4})/gi },
  { label: "Avattu", re: /avattu v\.\s*(\d{4})/gi },
];
/** Rivit, joiden koko sisältö siirtyy rakenteiseen kenttään. */
const STRUCTURED_ONLY = [
  /^Kapasiteetti:?\s*[\d. ]+$/i,
  /^(Rakennettu|Otettu käyttöön|Avattu):?\s*(vuonna\s*)?\d{4}$/i,
];

/** Poistaa kaupungin nimen otsikon alusta tai lopusta ("Kisapuisto Lahti"). */
function stripCity(nameRaw: string, cityNames: string[]): string {
  const spaced = nameRaw.replace(/(\p{Ll})(\p{Lu})/gu, "$1 $2"); // "VöruStadium"
  const words = spaced.split(" ");
  const cityFolds = new Set(cityNames.map(fold));
  const generic = /^(stadium|stadion|arena)$/i;
  let out = [...words];
  if (out.length > 1 && cityFolds.has(fold(out[0])) && !out.slice(1).every((w) => generic.test(w))) {
    out = out.slice(1);
  }
  if (
    out.length > 1 &&
    cityFolds.has(fold(out[out.length - 1])) &&
    !out.slice(0, -1).every((w) => generic.test(w))
  ) {
    out = out.slice(0, -1);
  }
  return out.join(" ");
}

function toBlock(item: { spans: Span[] }): Block {
  const text = lineText(item);
  if (/^[-–]\s/.test(text)) {
    const spans = item.spans.map((s) => ({ ...s }));
    spans[0].text = spans[0].text.replace(/^\s*[-–]\s*/, "");
    return { kind: "bullet", spans: spans.filter((s) => s.text) };
  }
  // Stadionsivujen kuvaus on pientä leipätekstiä; lihavointi ei ole merkitsevää.
  return { kind: "paragraph", spans: item.spans.map((s) => ({ ...s, text: s.text })) };
}

function buildStadiumTiivistelma(s: Omit<Stadium, "tiivistelma">): string | null {
  const locative = CITY_LOCATIVE[s.city.slug];
  const parts: string[] = [];
  parts.push(
    locative
      ? `${s.name} sijaitsee ${locative} (${s.city.country}).`
      : `${s.name} sijaitsee kaupungissa ${s.city.name} (${s.city.country}).`,
  );
  if (s.capacity !== null) parts.push(`Kapasiteetti on ${formatThousands(s.capacity)} katsojaa.`);
  if (s.openedYear !== null) {
    const verb =
      s.openedLabel === "Rakennettu"
        ? "rakennettiin"
        : s.openedLabel === "Otettu käyttöön"
          ? "otettiin käyttöön"
          : "avattiin";
    parts.push(`Stadion ${verb} vuonna ${s.openedYear}.`);
  }
  // Ensimmäinen proosavirke kuvauksesta, jos se mahtuu.
  const prose = s.description
    .filter((b): b is Extract<Block, { spans: Span[] }> => b.kind === "paragraph")
    .map((b) => clean(b.spans.map((sp) => sp.text).join("")))
    .find((t) => t.length >= 40 && !/^Kapasiteetti/i.test(t) && /[.!]$/.test(t));
  let text = parts.join(" ");
  if (prose) {
    const first = /^(.+?[.!])(\s|$)/.exec(prose)?.[1] ?? prose;
    if (text.length + 1 + first.length <= 300) text = `${text} ${first}`;
  }
  return text.slice(0, 300);
}

function parseStadium(
  html: string,
  file: string,
  hub: Map<string, HubEntry>,
  slugs: Map<string, string>,
  cities: Map<string, City>,
  inventory: Inventory,
  imageIssues: ImageIssue[],
  usedImages: Set<string>,
): Stadium {
  const $ = load(html);
  // <title> on FrontPagen kopioitu pohja, mutta kahdella sivulla siinä on oma
  // (eri) kapasiteetti. Luetaan ennen poistoa ristiintarkistusta varten.
  const titleText = $("title").text().replace(/ /g, " ").replace(/\s+/g, " ").trim();
  $("script, style").remove();
  const items = linearize($, $("body").contents().toArray());

  const reviewReasons: string[] = [];
  const notes: string[] = [];

  // Kaupunki ja maa hubista
  const hubEntry = hub.get(file.toLowerCase());
  if (!hubEntry) throw new Error(`${file}: ei löydy hubista ${HUB_FILE}`);
  const cityName = CITY_NAME_FIXES[hubEntry.city] ?? hubEntry.city;
  const citySlug = slugify(cityName);
  let city = cities.get(citySlug);
  if (!city) {
    city = {
      slug: citySlug,
      name: cityName,
      country: COUNTRY_NAME_FIXES[hubEntry.country] ?? hubEntry.country,
      ...(cityName !== hubEntry.city ? { sourceName: hubEntry.city } : {}),
      isNew: NEW_CITY_SLUGS.includes(citySlug),
    };
    cities.set(citySlug, city);
  }

  // Slug redirectistä — täsmälleen (docs/12 §2.1.2)
  const slug = slugs.get(file.toLowerCase());
  if (!slug) throw new Error(`${file}: ei redirect-kohdetta lib/redirects.ts:ssä`);

  // Otsikko = ensimmäinen lihavoitu rivi (<title> on kopioitu pohja "Finnair Stadium")
  const titleIndex = items.findIndex((i) => i.t === "line" && isAllBold(i.spans));
  if (titleIndex < 0) throw new Error(`${file}: otsikkoa ei löytynyt`);
  const nameRaw = lineText(items[titleIndex] as Extract<Item, { t: "line" }>);
  const stripped = stripCity(nameRaw, [hubEntry.city, cityName]);
  const name = STADIUM_NAME_FIXES[stripped] ?? stripped;
  if (name !== nameRaw) notes.push(`nimi normalisoitu: "${nameRaw}" → "${name}"`);

  const ctx: ImageContext = { inventory, page: file, used: usedImages, report: imageIssues };
  const stadiumAlt = `${name}, ${city.name}`;

  const infoLines: Extract<Item, { t: "line" }>[] = [];
  const images: ImageRef[] = [];
  let pending: ImageRef[] = [];
  let seenImage = false;

  for (const item of items.slice(titleIndex + 1)) {
    if (item.t === "img") {
      seenImage = true;
      const alt = ALT_OVERRIDES[localImageName(item.src)] ? null : stadiumAlt;
      const ref = resolveImage(ctx, item.src, item.alt, alt);
      if (!ref) continue;
      // Lähteen alt, jossa on päiväys, kelpaa kuvatekstiksi jos sivulla ei ole omaa
      if (DATE_IN_TEXT.test(item.alt)) ref.caption = item.alt;
      DATE_IN_TEXT.lastIndex = 0;
      images.push(ref);
      pending.push(ref);
      continue;
    }
    if (seenImage) {
      // Kuvien jälkeinen teksti on kuvateksti edeltäville kuville.
      const caption = lineText(item);
      if (pending.length === 0) {
        infoLines.push(item);
        notes.push(`kuvien jälkeinen teksti ilman kuvaa siirretty kuvaukseen: "${caption}"`);
      }
      for (const img of pending) img.caption = caption;
      pending = [];
      continue;
    }
    infoLines.push(item);
  }

  // Kuvan alt: stadion + kaupunki (+ päiväys, jos kuvatekstissä on tasan yksi)
  for (const img of images) {
    if (img.altSource !== "stadion") continue;
    const dates = img.caption?.match(DATE_IN_TEXT) ?? [];
    if (dates.length === 1) img.alt = `${stadiumAlt}, ${dates[0]}`.slice(0, 200);
  }

  // Rakenteiset kentät
  const allText = infoLines.map(lineText).join("\n");
  const capacities = [...new Set([...allText.matchAll(CAPACITY)].map((m) => Number(m[1].replace(/[. ]/g, ""))))];
  let capacity: number | null = null;
  if (capacities.length === 1 && capacities[0] > 0) capacity = capacities[0];
  else if (capacities.length > 1) {
    reviewReasons.push(`useita kapasiteettiarvoja: ${capacities.join(", ")}`);
  }
  // M5-sääntö: kapasiteetti, jota lähde ei ilmoita yksiselitteisesti, merkitään
  // tarkistettavaksi. Sivun näkyvä teksti on ensisijainen (arvo säilyy), mutta
  // ristiriita <title>-kentän kanssa kerrotaan isälle.
  const titleCapacities = [
    ...new Set([...titleText.matchAll(CAPACITY)].map((m) => Number(m[1].replace(/[. ]/g, "")))),
  ].filter((n) => n > 0 && n !== capacity);
  if (capacity !== null && titleCapacities.length) {
    reviewReasons.push(
      `Kapasiteetti ei ole lähteessä yksiselitteinen: sivun tekstissä ${formatThousands(capacity)}, ` +
        `sivun otsikkotiedossa (<title>) ${titleCapacities.map(formatThousands).join(", ")}. ` +
        `Käytetty tekstin arvoa — tarkista ajantasainen luku.`,
    );
  }

  const openings = new Map<number, string>();
  for (const { label, re } of OPENED_PATTERNS) {
    for (const m of allText.matchAll(re)) {
      const year = Number(m[1]);
      if (!openings.has(year)) openings.set(year, label);
    }
  }
  let openedYear: number | null = null;
  let openedLabel: string | null = null;
  if (openings.size === 1) {
    [[openedYear, openedLabel]] = [...openings.entries()];
  } else if (openings.size > 1) {
    reviewReasons.push(`useita avausvuosia: ${[...openings.keys()].join(", ")}`);
  }

  // Osoite = ensimmäinen infolohkon rivi, jos se näyttää osoitteelta
  let address: string | null = null;
  const description: Block[] = [];
  infoLines.forEach((line, index) => {
    const text = lineText(line);
    if (index === 0 && fold(text) === fold(hubEntry.city)) {
      notes.push(`kaupunkirivi "${text}" korvattu kaupunkiviittauksella`);
      return;
    }
    const looksLikeAddress =
      index === 0 &&
      text.length <= 80 &&
      /[\d,]/.test(text) &&
      !/^(Kapasiteetti|Rakennettu|Otettu|Avattu)/i.test(text) &&
      !/\.\s/.test(text);
    if (looksLikeAddress) {
      // Lähdekoodin rivinvaihto erottaa katuosoitteen postinumerosta.
      address = line.raw
        .replace(/\u00a0/g, " ")
        .split(/\s*\n\s*/)
        .map((p) => p.replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .join(", ")
        .replace(/,\s*,/g, ",")
        .replace(new RegExp(`\\b${cityName.toUpperCase()}\\b`), cityName)
        .normalize("NFC");
      return;
    }
    if (STRUCTURED_ONLY.some((re) => re.test(text))) return;
    description.push(toBlock(line));
  });

  if (capacity === null) notes.push("kapasiteettia ei lähteessä");
  if (openedYear === null && openings.size === 0) notes.push("avausvuotta ei yksiselitteisesti lähteessä");
  if (!address) notes.push("osoitetta ei lähteessä");

  const review = REVIEW_NOTES[file];
  if (review) reviewReasons.push(review);

  const base = {
    sourceFile: file,
    legacyUrl: `/${file}`,
    slug,
    name,
    nameRaw,
    city,
    address,
    capacity,
    openedYear,
    openedLabel,
    description,
    images,
    needsReview: reviewReasons.length > 0,
    reviewReasons,
    notes,
  };
  return { ...base, tiivistelma: buildStadiumTiivistelma(base) };
}

// ---------------------------------------------------------------------------
// Puutteelliset järjestelyt -taulukko
// ---------------------------------------------------------------------------

/**
 * Selostusosio taulukon jälkeen → lohkot. Kokonaan lihavoitu lyhyt rivi, joka
 * ei pääty pisteeseen, on väliotsikko. Muut rivit kappaleita; kuvat omina
 * lohkoinaan samassa kohdassa kuin lähteessä. Väliotsikon taso (h2) päätetään
 * importissa.
 */
function storyBlocks(items: Item[], ctx: ImageContext): Block[] {
  const blocks: Block[] = [];
  for (const item of items) {
    if (item.t === "img") {
      const ref = resolveImage(ctx, item.src, item.alt, null);
      if (ref) blocks.push({ kind: "image", image: ref });
      continue;
    }
    const text = lineText(item);
    if (!text) continue;
    const heading = isAllBold(item.spans) && text.length <= 120 && !/\.$/.test(text);
    if (heading) {
      blocks.push({ kind: "heading", spans: [{ text }] });
    } else if (isAllBold(item.spans)) {
      // Koko kappale lihavoitu = FrontPage-jäänne (sisäkkäinen <span bold>)
      blocks.push({ kind: "paragraph", spans: [{ text }] });
    } else {
      blocks.push({ kind: "paragraph", spans: item.spans });
    }
  }
  return blocks;
}

function parseTablePage(
  html: string,
  file: string,
  inventory: Inventory,
  imageIssues: ImageIssue[],
  usedImages: Set<string>,
): StatTable {
  const $ = load(html);
  $("script, style").remove();
  const reviewReasons: string[] = [];
  const notes: string[] = [];

  const heading = clean($("body > p").first().text());
  // "PUUTTEELLISET JÄRJESTELYT SUOMALAISESSA JALKAPALLOSSA" → virkekirjaimin
  const title = heading.charAt(0) + heading.slice(1).toLowerCase();

  const table = $("table").first();
  const trs = table.children("tbody").children("tr").toArray();
  const cellsOf = (tr: Element) => {
    const out: string[] = [];
    $(tr)
      .children("td, th")
      .each((_, td) => {
        const span = Number($(td).attr("colspan") ?? "1");
        const text = clean($(td).text());
        for (let i = 0; i < span; i += 1) out.push(text);
        if (span > 1) notes.push(`colspan=${span} purettu: "${text}"`);
      });
    return out;
  };

  const header = cellsOf(trs[0]);
  const keys = ["pvm", "jarjestely", "paikka"];
  if (header.length !== 3) throw new Error(`${file}: odotettiin 3 saraketta, saatiin ${header.length}`);
  const columns: Column[] = [
    { key: keys[0], label: "Päivämäärä", type: "date" },
    { key: keys[1], label: header[1], type: "text" },
    { key: keys[2], label: header[2], type: "text" },
  ];
  notes.push(`sarakeotsikko "${header[0]}" → "Päivämäärä" (ISO-päiväykset)`);

  const today = new Date().toISOString().slice(0, 10);
  const rows: Record<string, string>[] = [];
  trs.slice(1).forEach((tr, index) => {
    const cells = cellsOf(tr);
    if (cells.every((c) => !c)) return;
    if (cells.length !== 3) {
      reviewReasons.push(`rivi ${index + 1}: ${cells.length} solua`);
    }
    const iso = toIsoDate(cells[0] ?? "");
    if (!iso) reviewReasons.push(`rivi ${index + 1}: päivämäärä ei jäsenny ("${cells[0]}")`);
    else if (iso > today) reviewReasons.push(`rivi ${index + 1}: tulevaisuuden päiväys ${iso}`);
    const row: Record<string, string> = {};
    row[keys[0]] = iso ?? cells[0] ?? "";
    if (cells[1]) row[keys[1]] = cells[1];
    if (cells[2]) row[keys[2]] = cells[2];
    rows.push(row);
  });

  // Selostusosio = kaikki taulukon jälkeiset sisarsolmut
  const after: AnyNode[] = [];
  let node = table.get(0)?.nextSibling ?? null;
  while (node) {
    after.push(node);
    node = node.nextSibling;
  }
  const ctx: ImageContext = { inventory, page: file, used: usedImages, report: imageIssues };
  const lisatiedot = storyBlocks(linearize($, after), ctx);

  const years = rows.map((r) => r[keys[0]].slice(0, 4)).filter((y) => /^\d{4}$/.test(y)).sort();
  const tiivistelma =
    years.length > 0
      ? `Taulukko puutteellisista järjestelyistä suomalaisissa jalkapallo-otteluissa vuosilta ${years[0]}–${years[years.length - 1]}: ${rows.length} merkintää päivämäärineen ja paikkoineen. Taulukon alla kuvitetut selostukset tapauksista.`
      : null;

  return {
    sourceFile: file,
    legacyUrl: `/${file}`,
    slug: "puutteelliset-jarjestelyt",
    title,
    category: "muu",
    tiivistelma,
    columns,
    rows,
    lisatiedot,
    needsReview: reviewReasons.length > 0,
    reviewReasons,
    notes,
  };
}

// ---------------------------------------------------------------------------

async function readPage(file: string): Promise<string> {
  return decodeHtml(await readFile(join(RAW_DIR, file)));
}

async function main() {
  const { readdir } = await import("node:fs/promises");
  const allFiles = await readdir(RAW_DIR);
  const stadiumFiles = [
    ...allFiles.filter((f) => /^stadion.+\.htm$/i.test(f) && f.toLowerCase() !== HUB_FILE),
    ...EXTRA_STADIUM_FILES,
  ].sort((a, b) => a.localeCompare(b, "en"));

  const [slugs, inventory, hubHtml] = await Promise.all([
    loadRedirectSlugs(),
    loadInventory(),
    readPage(HUB_FILE),
  ]);
  const hub = parseHub(hubHtml);

  const cities = new Map<string, City>();
  const imageIssues: ImageIssue[] = [];
  const usedImages = new Set<string>();
  const stadiums: Stadium[] = [];

  for (const file of stadiumFiles) {
    const s = parseStadium(await readPage(file), file, hub, slugs, cities, inventory, imageIssues, usedImages);
    stadiums.push(s);
    console.log(
      `  ${file.padEnd(46)} ${s.slug.padEnd(34)} kap ${String(s.capacity ?? "–").padStart(6)}  v ${String(s.openedYear ?? "–").padStart(4)}  kuvia ${s.images.length}${s.needsReview ? "  (tarkistettava)" : ""}`,
    );
  }

  // Hubin jokaisella linkillä pitää olla stadion — muuten sivu on jäänyt pois.
  for (const file of hub.keys()) {
    if (!stadiums.some((s) => s.sourceFile.toLowerCase() === file)) {
      throw new Error(`hubin linkki ${file} ei vastaa yhtään stadionsivua`);
    }
  }

  const table = parseTablePage(await readPage(TABLE_FILE), TABLE_FILE, inventory, imageIssues, usedImages);
  console.log(`  ${TABLE_FILE.padEnd(46)} ${table.slug.padEnd(34)} rivejä ${table.rows.length}, lohkoja ${table.lisatiedot.length}`);

  // Pudotetut kuvat: inventaarion kuvat näillä sivuilla, joita ei käytetty
  const pages = [...stadiumFiles, TABLE_FILE, HUB_FILE];
  const dropped: { page: string; src: string; file: string; reason: string }[] = [];
  for (const page of pages) {
    for (const r of inventory.byPage.get(page) ?? []) {
      if (!usedImages.has(r.file)) {
        dropped.push({ page, src: r.src, file: r.file, reason: r.ok ? "ei löytynyt sivun sisällöstä" : `lataus epäonnistui (HTTP ${r.status})` });
      }
    }
  }

  const sortedCities = [...cities.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  // Solujen normalisointi (docs/12 §1.2): date → ISO, number → kokonaisluku,
  // epäselvä sarake → text. Näkymättömät merkit pois kaikista teksteistä.
  {
    const res = normalizeKeyed(table.columns, table.rows);
    table.columns = table.columns.map((c, i) => ({ ...c, type: res.types[i] }));
    table.rows = res.rows as Record<string, string>[];
    table.notes.push(...res.notes);
  }
  const rawNormalized: Normalized = { cities: sortedCities, stadiums, tables: [table] };
  const invisibleRemoved = countInvisible(rawNormalized);
  const normalized: Normalized = stripInvisibleDeep(rawNormalized);

  const tableImages = table.lisatiedot.filter((b) => b.kind === "image").length;
  const report = {
    lahdesivut: stadiumFiles.length + 2,
    stadionit: stadiums.length,
    tilastot: 1,
    kaupungit: {
      kaytetyt: sortedCities.map((c) => c.slug),
      uudet: sortedCities.filter((c) => c.isNew).map((c) => ({ id: `kaupunki-${c.slug}`, name: c.name, country: c.country, ...(c.sourceName ? { lahteenKirjoitusasu: c.sourceName } : {}) })),
    },
    kentat: {
      osoite: stadiums.filter((s) => s.address).length,
      kapasiteetti: stadiums.filter((s) => s.capacity !== null).length,
      avausvuosi: stadiums.filter((s) => s.openedYear !== null).length,
      kuvaus: stadiums.filter((s) => s.description.length > 0).length,
      tiivistelma: stadiums.filter((s) => s.tiivistelma).length,
      geopoint: 0,
    },
    kuvat: {
      stadionit: stadiums.reduce((n, s) => n + s.images.length, 0),
      puutteellisetJarjestelyt: tableImages,
      yhteensa: usedImages.size,
      altLahteet: [...stadiums.flatMap((s) => s.images), ...table.lisatiedot.flatMap((b) => (b.kind === "image" ? [b.image] : []))].reduce<Record<string, number>>((acc, img) => {
        acc[img.altSource] = (acc[img.altSource] ?? 0) + 1;
        return acc;
      }, {}),
      pudotetut: dropped.length,
      huomiot: imageIssues,
    },
    taulukko: { rivit: table.rows.length, sarakkeet: table.columns.length },
    nakymattomiaMerkkejaPoistettu: invisibleRemoved,
    needsReview: [
      ...stadiums.filter((s) => s.needsReview).map((s) => ({ id: `stadion-${s.slug}`, syyt: s.reviewReasons })),
      ...(table.needsReview ? [{ id: `jalkapalloTilasto-${table.slug}`, syyt: table.reviewReasons }] : []),
    ],
    huomiot: [
      ...stadiums.filter((s) => s.notes.length).map((s) => ({ id: `stadion-${s.slug}`, huomiot: s.notes })),
      { id: `jalkapalloTilasto-${table.slug}`, huomiot: table.notes },
    ],
    slugPoikkeamat: [
      {
        legacyUrl: table.legacyUrl,
        slug: table.slug,
        huomio: "Redirect osoittaa listaussivulle /jalkapalloarkisto/stadionit (ei omaa slugia). Uusi dokumentti jalkapalloTilasto — integraatio päättää ohjauksen.",
      },
    ],
  };

  await writeFile(OUT, `${JSON.stringify(normalized, null, 2)}\n`, "utf-8");
  await writeFile(REPORT, `${JSON.stringify(report, null, 2)}\n`, "utf-8");
  await writeFile(DROPPED, `${JSON.stringify(dropped, null, 2)}\n`, "utf-8");

  console.log(`
Stadioneja .............. ${stadiums.length}
  osoite ................ ${report.kentat.osoite}
  kapasiteetti .......... ${report.kentat.kapasiteetti}
  avausvuosi ............ ${report.kentat.avausvuosi}
  kuvaus ................ ${report.kentat.kuvaus}
  tarkistettavia ........ ${stadiums.filter((s) => s.needsReview).length}
Kaupunkeja .............. ${sortedCities.length} (uusia ${report.kaupungit.uudet.length})
Taulukko ................ ${table.rows.length} riviä, ${tableImages} kuvaa selostuksissa
Kuvia käytetty .......... ${usedImages.size}
Kuvia pudotettu ......... ${dropped.length}
Kuvahuomioita ........... ${imageIssues.length}

Tallennettu: ${OUT}
             ${REPORT}
             ${DROPPED}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
