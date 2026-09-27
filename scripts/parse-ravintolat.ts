/**
 * Purkaa vanhan sivuston ruokailu*.htm -sivuilta ravintolat rakenteiseksi JSON:iksi.
 *
 * Ajo: `npm run parse:ravintolat` (osana `npm run migrate:ravintolat`)
 * Lähde: data/raw-html/ruokailu*.htm
 * Tulos: data/normalized/ravintolat.json         (ravintolat)
 *        data/normalized/ravintola-report.json   (määrät, rivikirjanpito, tarkistettavat)
 *
 * Tulos on CMS-riippumaton: Sanity-import (tai mikä tahansa muu) tehdään
 * erillisessä adapterissa, jotta jäsennystyö ei sitoudu CMS-valintaan.
 *
 * Vanhoilla sivuilla on kaksi eri taittotapaa:
 *   A) yksi <tr> per tietorivi (esim. ruokailulahti.htm)
 *   B) koko lista yhdessä <td>:ssä <br>-eroteltuna (esim. ruokailuhameenlinna.htm)
 * Molemmat normalisoidaan samaksi rivivirraksi ennen jäsennystä.
 *
 * Rivikirjanpito (docs/12, korjauskierros 1): jokainen ravintolan lähderivi
 * päätyy rakenteiseen kenttään, käyntikontekstiin tai sanalliseen arvioon
 * (`notes` → Portable Text). Vain tunnistamatta jääneet menevät
 * `unparsedLines`-listaan, ja ne merkitsevät ravintolan tarkistettavaksi.
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { load } from "cheerio";
import type { AnyNode, Element } from "domhandler";

import { decodeHtml } from "./lib/decode-html";

const RAW_DIR = join(process.cwd(), "data", "raw-html");
const OUT_FILE = join(process.cwd(), "data", "normalized", "ravintolat.json");
const REPORT_FILE = join(process.cwd(), "data", "normalized", "ravintola-report.json");

/** Sivut jotka ovat koosteita, eivät ravintolalistoja. */
const INDEX_PAGES = new Set(["ruokailu.htm", "ruokailutop5.htm"]);

/** Uuden ravintolan aloittava rivi: "(03) 23.12.2003 Mamma Maria", myös "(101) 9.6.2024 Kolme Kruunua" */
const MARKER = /^\((\d{1,3})\)\s*(\d{1,2}\.\d{1,2}\.\d{4})?\s*(.*)$/;
/** Päiväys, myös yksinumeroinen päivä/kuukausi ("2.9.2011"). */
const DATE = /(?<![\d.])(\d{1,2})\.(\d{1,2})\.(\d{4})(?!\d)/g;
const PHONE = /(?:puhelin|puh\.?|tel\.?)[:\s]*(\+?\d[\d\s\-()]{3,}\d)/i;
const BARE_PHONE = /^\+?\d[\d\s\-()]{6,}\d$/;
const EMAIL = /^(?:e-?mail|sähköposti)\s*:?\s*(\S+@\S+)$/i;
/** Lopettamisen merkintä. Muistiinpano jatkuu segmentin loppuun asti. */
const CLOSED = /\b(toiminta\s+(?:on\s+)?(?:loppunut|päättynyt|lopetettu)|lopetettu|lopettanut|konkurssi|suljettu)\b/i;
/** Sivun lopun tähtiselite — ei kuulu mihinkään ravintolaan. */
const LEGEND = /ravintola-arvostelu\s*:/i;
const LEGEND_LINE =
  /^(?:\*+\s*(?:ruokala, ei ravintola|perusravintola|käy mielellään|hyvä ravintola|erinomainen ravintola)|\d,\d\s*-\s*\d,\d\s)/i;
/** Maantieteelliset koordinaatit: "60° 20’ N 26° 46’ E" */
const COORDS = /\s*-?\s*(\d{1,2})°\s*(\d{1,2})\s*[’'′]\s*([NS])\s+(\d{1,3})°\s*(\d{1,2})\s*[’'′]\s*([EW])/;
/** Iso-Britannian postinumero, esim. "WC2H 8AA", "B2 5AL". */
const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/;
/** Paikkamerkki, jonka vanha sivu jätti täyttämättä. */
const PLACEHOLDER = /^(?:osoite|puhelin|puh\.?|-+|\.+)$/i;
/** Tekstin alkuja, jotka ovat lisätietoa eivätkä osoite tai käyntikonteksti. */
const NOTE_PREFIX = /^(?:perustettu|(?:ravintola\s+)?avattu|junan|oli\s|huom\.?)|\bmatka noin\b/i;
/** Sulkeissa oleva lisätieto: "(Ravintola avattu 29.06.2017)" — päiväys ei ole käynti. */
const NOTE_PAREN = /\s*\(([^)]*\b(?:avattu|perustettu)\b[^)]*)\)/i;
/** Sanoja, jotka paljastavat katuosoitteen. */
const STREET =
  /(katu|tie|kuja|polku|tori|aukio|puisto|ranta|street|st\.|road|rd\b|avenue|square|row|lane|boulevard|iela|bulv|strasse|straße|stra[sß]e|allee|platz|markt|rue|quai|place|route|via\b|calle|plaza|ul\.|pl\.|prospekt|embankment|lin\.|tee\b|turg|vägen|gatan|kajen|gade|nam\b)/i;

const NBSP = / /g;

/** Maat vanhan sivun otsikossa → suomenkielinen maannimi. */
const COUNTRIES: Record<string, string> = {
  venaja: "Venäjä",
  ruotsi: "Ruotsi",
  saksa: "Saksa",
  kreikka: "Kreikka",
  portugali: "Portugali",
  espanja: "Espanja",
  belgia: "Belgia",
  hollanti: "Alankomaat",
  irlanti: "Irlanti",
  islanti: "Islanti",
  italia: "Italia",
  kroatia: "Kroatia",
  puola: "Puola",
  ranska: "Ranska",
  latvia: "Latvia",
  slovakia: "Slovakia",
  slovenia: "Slovenia",
  sveitsi: "Sveitsi",
  viro: "Viro",
  tanska: "Tanska",
  tshekki: "Tšekki",
  turkki: "Turkki",
};

/** Maakunnat ja alueet: sivun otsikossa, mutta eivät kaupunkeja. */
const REGIONS = new Set(["uusimaa", "pirkanmaa", "lappi", "varsinais-suomi", "varsinaissuomi"]);

/**
 * Kaupunkien kirjoitusasut lähteessä → suomenkielinen nimi, jota sivusto käyttää.
 * Avain on `fold()`-muodossa. Vain eksonyymit ja kirjoitusasut — ei päättelyä
 * paikasta toiseen.
 */
const CITY_ALIASES: Record<string, string> = {
  london: "Lontoo",
  lontoo: "Lontoo",
  warszawa: "Varsova",
  varsova: "Varsova",
  bruxelles: "Bryssel",
  bryssel: "Bryssel",
  brugge: "Brugge",
  kobenhavn: "Kööpenhamina",
  koopenhamina: "Kööpenhamina",
  munchen: "München",
  hamburg: "Hampuri",
  hampuri: "Hampuri",
  berlin: "Berliini",
  berliini: "Berliini",
  hannover: "Hannover",
  stockholm: "Tukholma",
  tukholma: "Tukholma",
  athens: "Ateena",
  ateena: "Ateena",
  egina: "Egina",
  riga: "Riika",
  riika: "Riika",
  ventspils: "Ventspils",
  tallinn: "Tallinna",
  tallinna: "Tallinna",
  tartu: "Tarto",
  tarto: "Tarto",
  praha: "Praha",
  zurich: "Zurich",
  madrid: "Madrid",
  dublin: "Dublin",
  reykjavik: "Reykjavik",
  milano: "Milano",
  zagreb: "Zagreb",
  ljubljana: "Ljubljana",
  bratislava: "Bratislava",
  istanbul: "Istanbul",
  "den haag": "Den Haag",
  lissabon: "Lissabon",
  sintra: "Sintra",
  funchal: "Funchal",
  nice: "Nice",
  cannes: "Cannes",
  edinburgh: "Edinburgh",
  nottingham: "Nottingham",
  birmingham: "Birmingham",
  sheffield: "Sheffield",
  cardiff: "Cardiff",
  pietari: "Pietari",
  moskova: "Moskova",
  viipuri: "Viipuri",
  kakisalmi: "Käkisalmi",
};

/** Ulkomaiset kaupungit, jotka esiintyvät sivun otsikossa ilman maata. */
const CITY_COUNTRIES: Record<string, string> = {
  lontoo: "Iso-Britannia",
};

/** Sanoja, joiden takia pilkun jälkeinen osa ei ole kaupunki. */
const NOT_A_CITY = /(airport|terminal|lentoasema|hotel|station|asema|keskus|centre|center)/i;

export type CitySource = "postinumero" | "rivi" | "osoite" | "nimi" | "sivu" | "alue";

export interface Ravintola {
  index: number;
  name: string;
  area: string;
  sourcePage: string;
  firstVisit: string | null;
  address: string | null;
  postalCode: string | null;
  /** Kaupunki suomenkielisenä nimenä (postitoimipaikka, jos annettu). */
  city: string | null;
  country: string;
  /** Mistä kaupunki pääteltiin. `alue` = ei selvinnyt, viitataan sivun alueeseen. */
  citySource: CitySource;
  location: { lat: number; lng: number } | null;
  phone: string | null;
  starsGlyph: number | null;
  ratingOverall: number | null;
  ratingFood: number | null;
  ratingPrice: number | null;
  ratingAtmosphere: number | null;
  /** Alkuperäinen arvosanarivi sellaisenaan — tarkistusta varten. */
  ratingRaw: string | null;
  visits: string[];
  visitContext: string | null;
  pros: string[];
  cons: string[];
  closed: boolean;
  closedNote: string | null;
  /** Lähteen vapaa teksti (arvio, lisätiedot) → sanallinen arvostelu. */
  notes: string[];
  /** Kaikki ravintolan kohdalla sivulla olleet kuvat. */
  images: string[];
  /**
   * Kuvat, joiden omistaja on sijainnin perusteella yksiselitteinen: kuvan
   * solussa ei aloiteta useampaa ravintolaa. Käytetään varalla, jos
   * tiedostonimi ei kerro omistajaa.
   */
  imagesPositional: string[];
  /** Ravintolan kaikki lähderivit sellaisenaan, kirjanpitoa ja tarkistusta varten. */
  sourceLines: string[];
  unparsedLines: string[];
  needsReview: boolean;
  reviewReasons: string[];
}

interface PageInfo {
  file: string;
  area: string;
  country: string;
  /** Otsikossa luetellut kaupungit ("RUOTSI / TUKHOLMA, BORÅS, JÖNKÖPING"). */
  headerCities: string[];
  /** Otsikon kaupunki, jos sivu on yhden kaupungin sivu. */
  pageCity: string | null;
}

/** Pelkistää vertailua varten: pienet kirjaimet, ei tarkkeita, ei välimerkkejä. */
function fold(input: string): string {
  return input
    .toLowerCase()
    .replace(/[äå]/g, "a")
    .replace(/[öø]/g, "o")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clean(s: string): string {
  return s.replace(NBSP, " ").replace(/\s+/g, " ").trim();
}

/** Poistaa segmentin reunoilta irralliset erottimet: "/ VJS - Kuusysi", "09-490742 /" */
function trimSeparators(s: string): string {
  return clean(s.replace(/^[\s/,;]+|[\s/,;]+$/g, ""));
}

/** "LAHTI" → "Lahti", "LA COLLE" → "La Colle". Sekakirjaimiset säilyvät. */
function titleCase(s: string): string {
  if (s !== s.toUpperCase()) return s;
  return s.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

/** "4 ,0" ja "3,6" → 4.0 / 3.6 */
function num(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number.parseFloat(raw.replace(/\s+/g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 && n <= 5 ? n : null;
}

/** Päiväykset kaksinumeroisiksi: "2.9.2011" → "02.09.2011". */
function dates(text: string): string[] {
  return [...text.matchAll(DATE)].map(
    (m) => `${m[1].padStart(2, "0")}.${m[2].padStart(2, "0")}.${m[3]}`,
  );
}

function isRatingLine(line: string): boolean {
  return (
    /^[*★]/.test(line) ||
    /^\(\s*\d\s*[,.]\s*\d/.test(line) ||
    /Ruoka\s*\d/i.test(line) ||
    /Hinta\s*\d/i.test(line) ||
    /Viihtyvyys\s*\d/i.test(line)
  );
}

function parseRating(raw: string) {
  // "***'*" = neljä tähteä kirjoitusvirheellä; lasketaan tähtimerkit ryppäästä.
  const cluster = /^([*★][*★'’]*)/.exec(raw)?.[1];
  const overall = /\(\s*(\d\s*[,.]\s*\d)/.exec(raw);
  return {
    starsGlyph: cluster ? cluster.replace(/[^*★]/g, "").length : null,
    ratingOverall: num(overall?.[1]),
    ratingFood: num(/Ruoka\s*(\d\s*[,.]\s*\d)/i.exec(raw)?.[1]),
    ratingPrice: num(/Hinta\s*(\d\s*[,.]\s*\d)/i.exec(raw)?.[1]),
    ratingAtmosphere: num(/Viihtyvyys\s*(\d\s*[,.]\s*\d)/i.exec(raw)?.[1]),
  };
}

/** Sivun otsikko, esim. "RUOKAILU ESPANJA / MADRID" → "Espanja / Madrid" */
function areaFromPage(bodyText: string, file: string): string {
  const m = /RUOKAILU\s+([A-ZÅÄÖ][A-ZÅÄÖ /-]{1,40}?)\s*(?:\(|TOP|\d|$)/m.exec(bodyText);
  if (m?.[1]) {
    const t = m[1].trim().replace(/\s*\/\s*/g, " / ");
    if (t.length > 1) {
      return t
        .split(" ")
        .map((w) => (w === "/" ? w : w.charAt(0) + w.slice(1).toLowerCase()))
        .join(" ");
    }
  }
  const fallback = file.replace(/^ruokailu/i, "").replace(/\.htm$/i, "");
  return fallback.charAt(0).toUpperCase() + fallback.slice(1).toLowerCase();
}

/**
 * Sivun otsikkorivi ("RUOKAILU RUOTSI / TUKHOLMA, BORÅS, JÖNKÖPING") → maa ja
 * otsikon kaupungit. Maakunnat (Uusimaa, Pirkanmaa…) eivät ole kaupunkeja.
 */
function pageInfo(headerLine: string, area: string, file: string): PageInfo {
  const text = headerLine.replace(/^RUOKAILU\s*:?\s*/i, "");
  const parts = text
    .split(/\s*[/,]\s*|\s+JA\s+|\s+ja\s+/)
    .map((p) => clean(p))
    .filter(Boolean);

  let country = "Suomi";
  const headerCities: string[] = [];
  for (const part of parts) {
    const key = fold(part).replace(/ /g, "-");
    const asCountry = COUNTRIES[key.replace(/-/g, "")] ?? COUNTRIES[key];
    if (asCountry) {
      country = asCountry;
      continue;
    }
    if (REGIONS.has(key)) continue;
    const name = CITY_ALIASES[fold(part)] ?? titleCase(part);
    headerCities.push(name);
    const cc = CITY_COUNTRIES[fold(name)];
    if (cc && country === "Suomi") country = cc;
  }

  const isRegion = parts.some((p) => REGIONS.has(fold(p).replace(/ /g, "-")));
  return {
    file,
    area,
    country,
    headerCities,
    pageCity: !isRegion && headerCities.length === 1 ? headerCities[0] : null,
  };
}

interface Chunk {
  lines: string[];
  images: string[];
  /** Montako ravintolan aloitusriviä solussa on. */
  markers: number;
}

/** Solut, joiden sisältö on yksi kappale (kuten ennenkin: sisimmät td/p). */
const CELL = new Set(["td", "p"]);
/** Elementit, joiden sisältöä ei lueta. */
const SKIP = new Set(["script", "style", "noscript", "template", "head", "title"]);
/** Rivinvaihtona käsiteltävät lohkoelementit solun sisällä. */
const LINE_BLOCKS = new Set(["div", "li", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote"]);

/**
 * Litistää sivun kappalevirraksi.
 *
 * Kappale on (a) sisin td/p-solu, kuten ennenkin, tai (b) yhtenäinen jakso
 * solujen ULKOPUOLISTA sisältöä: tekstiä, <b>/<font>/<img>/<br>, joka ei ole
 * minkään sisimmän solun sisällä. Aiempi versio luki vain (a):n, joten sisältö
 * hajanaisen tagin jälkeen putosi hiljaa: ruokailusavonlinna.htm:ssä
 * "(09) 24.07.2025 Sarastro" on `</td>`-tagin jälkeen suoraan <tr>:n sisällä,
 * ja HTML-jäsennin siirtää sen ("foster parenting") taulukon ulkopuolelle.
 *
 * Kappaleet järjestetään lähteen merkkipaikan mukaan (`startIndex`), jotta
 * taulukon eteen siirretty sisältö palaa lähteen järjestykseen eikä liity
 * väärään ravintolaan.
 *
 * Rivit erotellaan VAIN <br>:n kohdalta. HTML-lähteen omat rivinvaihdot ovat
 * FrontPagen rivitystä, eivät sisältöä: aiempi versio katkaisi niistä, jolloin
 * "Ribs &" ja "Rock" tai "+ Keskeinen sijainti," ja sen jatko hajosivat eri
 * riveiksi ja jatkorivi putosi `unparsedLines`-listaan.
 */
function toChunks(html: string): { chunks: Chunk[]; bodyText: string; headerLine: string } {
  const $ = load(html, { sourceCodeLocationInfo: true });
  const isTag = (n: AnyNode): n is Element => n.type === "tag";
  const hasCell = (n: AnyNode) => isTag(n) && $(n).find("td, p").length > 0;
  // Ensimmäisen merkitsevän solmun paikka. Tyhjä tekstisolmu ohitetaan: jäsennin
  // yhdistää taulukon eteen siirretyn tekstin sitä edeltävään välilyöntisolmuun,
  // jolloin solmun paikka on taulukon alussa eikä siellä, missä teksti lähteessä on.
  const startOf = (nodes: AnyNode[]): number => {
    for (const n of nodes) {
      if (n.type === "text" && !$(n).text().trim()) continue;
      if (typeof n.startIndex === "number") return n.startIndex;
      const inner = isTag(n) ? $(n).find("*").toArray().find((d) => typeof d.startIndex === "number") : undefined;
      if (inner) return inner.startIndex!;
    }
    return Number.MAX_SAFE_INTEGER;
  };

  // 1. Kerätään kappaleet solmulistoina; tekstiä ei vielä muokata.
  const groups: AnyNode[][] = [];
  const walk = (parent: AnyNode) => {
    let run: AnyNode[] = [];
    const flush = () => {
      if (run.length) groups.push(run);
      run = [];
    };
    for (const child of $(parent).contents().toArray()) {
      if (child.type !== "tag" && child.type !== "text") continue;
      if (isTag(child) && SKIP.has(child.name)) continue;
      if (isTag(child) && CELL.has(child.name) && !hasCell(child)) {
        flush();
        groups.push([child]);
      } else if (hasCell(child) || (isTag(child) && /^(table|tbody|thead|tfoot|tr)$/.test(child.name))) {
        flush();
        walk(child);
      } else {
        run.push(child);
      }
    }
    flush();
  };
  const body = $("body").get(0);
  if (body) walk(body);

  // 2. Kappale → rivit ja kuvat.
  const chunks: (Chunk & { start: number })[] = [];
  for (const nodes of groups) {
    const images: string[] = [];
    for (const n of nodes) {
      if (!isTag(n)) continue;
      const imgs = n.name === "img" ? [n] : $(n).find("img[src]").toArray();
      for (const img of imgs) {
        const src = $(img).attr("src")?.trim();
        if (src) images.push(src);
      }
    }
    const text = nodes
      .map((n) => {
        if (!isTag(n)) return $(n).text();
        if (n.name === "br") return "\u0001";
        const $n = $(n);
        $n.find("br").replaceWith("\u0001");
        // Lohkoelementit (<div>) ovat omia kappaleitaan, esim. Piikatytön arvion kolme kappaletta.
        $n.find([...LINE_BLOCKS].join(", ")).each((__, block) => {
          $(block).before("\u0001").after("\u0001");
        });
        const t = $n.text();
        return LINE_BLOCKS.has(n.name) ? `\u0001${t}\u0001` : t;
      })
      .join("");
    const lines = text
      .replace(/\s+/g, " ")
      .split("\u0001")
      .map(clean)
      .filter((l) => l.length > 0);
    const markers = lines.filter((l) => MARKER.test(l)).length;
    if (lines.length || images.length) chunks.push({ lines, images, markers, start: startOf(nodes) });
  }
  chunks.sort((a, b) => a.start - b.start);

  const headerLine =
    chunks.flatMap((c) => c.lines).find((l) => /^RUOKAILU\b/i.test(l)) ??
    chunks.flatMap((c) => c.lines)[0] ??
    "";
  return { chunks, bodyText: clean($("body").text()), headerLine };
}

function blank(index: number, page: PageInfo, firstVisit: string | null): Ravintola {
  return {
    index,
    name: "",
    area: page.area,
    sourcePage: page.file,
    firstVisit,
    address: null,
    postalCode: null,
    city: null,
    country: page.country,
    citySource: "alue",
    location: null,
    phone: null,
    starsGlyph: null,
    ratingOverall: null,
    ratingFood: null,
    ratingPrice: null,
    ratingAtmosphere: null,
    ratingRaw: null,
    visits: [],
    visitContext: null,
    pros: [],
    cons: [],
    closed: false,
    closedNote: null,
    notes: [],
    images: [],
    imagesPositional: [],
    sourceLines: [],
    unparsedLines: [],
    needsReview: false,
    reviewReasons: [],
  };
}

/** Jäsennystila yhden ravintolan sisällä. */
interface State {
  r: Ravintola;
  /** Arvosanarivi on nähty: tätä seuraava vapaa teksti on käyntikontekstia. */
  afterRating: boolean;
  /** Arvosanan sulkeva ")" puuttuu vielä — seuraava arvosanarivi jatkaa sitä. */
  ratingOpen: boolean;
  contexts: string[];
  /** Kaupunkirivi ("Pietari") — sama kuin osoitteen kaupunki, jos sellainen on. */
  cityLine: string | null;
}

function addContext(st: State, text: string): void {
  const t = trimSeparators(text);
  if (t && !st.contexts.includes(t)) st.contexts.push(t);
}

function addNote(st: State, text: string): void {
  const t = trimSeparators(text);
  if (t) st.r.notes.push(t);
}

/** Lyhyt, virkkeeksi päättymätön teksti on käyntikontekstia ("HJK - FC Lahti", "Vappu"). */
function isContextLike(text: string): boolean {
  if (NOTE_PREFIX.test(text)) return false;
  if (text.length > 90) return false;
  // Ottelu tai joukkueet: "FC Lahti - Club Brugge K.V."
  if (/\S\s[-–]\s\S/.test(text) && !/\s(on|oli|ovat|ei)\s/.test(text)) return true;
  if (/[.!?]$/.test(text) && !/\b\d+\.$/.test(text)) return false;
  return true;
}

/** Postinumero + postitoimipaikka segmentistä. Palauttaa null jos ei postinumeroa. */
function matchPostal(seg: string): { postal: string; city: string | null; before: string; paren: string | null } | null {
  // Maa toimipaikan perässä: "9000-010 Funchal, Portugali"
  const text = seg.replace(/,\s*([\p{L} ]+)$/u, (all, c: string) =>
    COUNTRIES[fold(c).replace(/ /g, "")] || Object.values(COUNTRIES).includes(c) ? "" : all,
  );
  const patterns = [
    // FI/DE/FR/CZ/SK/IT (5–6 num.), BE/DK/CH (4 num.), "B-1000", "06160Juan les Pins"
    /(?:^|[\s,])(?:B-)?(\d{4,6})\s*([A-ZÅÄÖÆØa-zåäöæø][^,\d]*)$/,
    // SE/GR "115 41 Tukholma"
    /(?:^|[\s,])(\d{3} \d{2})\s+([A-ZÅÄÖ][^,\d]*)$/,
    // PL "00-271 Warszawa", PT "9000-010 Funchal"
    /(?:^|[\s,])(\d{2,4}-\d{3})\s+([A-ZÅÄÖ][^,\d]*)$/,
    // NL "2511 CN, Den Haag"
    /(?:^|[\s,])(\d{4} [A-Z]{2}),?\s+([A-Z][^,\d]*)$/,
    // Postinumero ilman toimipaikkaa: "Tarto, Lossi 28, 51003."
    /(?:^|,\s*)(\d{5})\.?()$/,
  ];
  for (const re of patterns) {
    const m = re.exec(text);
    if (!m) continue;
    let city = clean(m[2] ?? "").replace(/[.,]+$/, "");
    let paren: string | null = null;
    const p = /^(.*?)\s*(\([^)]*\))\s*$/.exec(city);
    if (p) {
      city = p[1];
      paren = p[2];
    }
    // Postitoimipaikka alkaa isolla kirjaimella; muuten numero on osa katuosoitetta.
    if (city && !/^\p{Lu}/u.test(city)) continue;
    return { postal: m[1], city: city || null, before: trimSeparators(text.slice(0, m.index)), paren };
  }
  return null;
}

function canonicalCity(raw: string): string {
  const f = fold(raw);
  return CITY_ALIASES[f] ?? titleCase(clean(raw));
}

/**
 * Käsittelee yhden segmentin (rivin osan " / "-erottimien välissä).
 * Palauttaa false, jos segmenttiä ei tunnistettu.
 */
function assignSegment(st: State, rawSeg: string, known: Set<string>): boolean {
  const r = st.r;
  let seg = trimSeparators(rawSeg);
  if (!seg || PLACEHOLDER.test(seg)) return true;

  // Lopettamismerkintä: muistiinpano segmentin loppuun asti, alkuosa erikseen.
  const closed = CLOSED.exec(seg);
  if (closed) {
    r.closed = true;
    const note = trimSeparators(seg.slice(closed.index));
    r.closedNote = r.closedNote ? `${r.closedNote} ${note}` : note;
    seg = trimSeparators(seg.slice(0, closed.index));
    if (!seg) return true;
  }

  const paren = NOTE_PAREN.exec(seg);
  if (paren) {
    addNote(st, paren[1]);
    seg = trimSeparators(seg.replace(NOTE_PAREN, ""));
    if (!seg) return true;
  }

  const email = EMAIL.exec(seg);
  if (email) {
    addNote(st, `Sähköposti: ${email[1]}`);
    return true;
  }

  // Puhelinnumero voi olla samalla rivillä osoitteen kanssa
  const phone = PHONE.exec(seg);
  if (phone) {
    const p = clean(phone[1]);
    r.phone = r.phone && r.phone !== p ? `${r.phone} / ${p}` : p;
    seg = trimSeparators(seg.replace(PHONE, ""));
    if (!seg) return true;
  } else if (BARE_PHONE.test(seg) && dates(seg).length === 0) {
    r.phone = r.phone && r.phone !== seg ? `${r.phone} / ${seg}` : seg;
    return true;
  }

  const found = dates(seg);
  if (found.length > 0) {
    r.visits.push(...found);
    const rest = trimSeparators(seg.replace(DATE, " ").replace(/[,]+/g, " "));
    if (rest.length > 1) addContext(st, rest);
    return true;
  }

  const coords = COORDS.exec(seg);
  if (coords) {
    const [, latD, latM, ns, lngD, lngM, ew] = coords;
    const lat = (Number(latD) + Number(latM) / 60) * (ns === "S" ? -1 : 1);
    const lng = (Number(lngD) + Number(lngM) / 60) * (ew === "W" ? -1 : 1);
    r.location = { lat: Math.round(lat * 1e4) / 1e4, lng: Math.round(lng * 1e4) / 1e4 };
    seg = trimSeparators(seg.replace(COORDS, ""));
    if (!seg) return true;
  }

  const postal = matchPostal(seg);
  if (postal && !r.postalCode) {
    r.postalCode = postal.postal;
    if (postal.city) {
      r.city = canonicalCity(postal.city);
      r.citySource = "postinumero";
    }
    const addr = [postal.before, postal.paren].filter(Boolean).join(" ");
    if (addr) r.address = r.address ? `${r.address}, ${addr}` : addr;
    return true;
  }

  // Pelkkä kaupunkirivi: "Pietari", "Moskova", "Egina"
  if (known.has(fold(seg))) {
    st.cityLine = canonicalCity(seg);
    return true;
  }

  if (!st.afterRating) {
    if (!r.address && !/:/.test(seg) && !NOTE_PREFIX.test(seg) && seg.length < 100) {
      r.address = seg;
      return true;
    }
    if (r.address && !r.postalCode && (STREET.test(seg) || /\d/.test(seg)) && !NOTE_PREFIX.test(seg) && seg.length < 100) {
      r.address = `${r.address}, ${seg}`;
      return true;
    }
  }

  if (isContextLike(seg)) addContext(st, seg);
  else addNote(st, seg);
  return true;
}

function assignLine(st: State, rawLine: string, known: Set<string>): void {
  const r = st.r;
  const line = clean(rawLine);
  r.sourceLines.push(line);

  if (isRatingLine(line) || (st.ratingOpen && /^\s*\d\s*[,.]\s*\d/.test(line))) {
    // Arvosana ")"-merkkiin asti; loppuosa (käyntipäivät, konteksti) jäsennetään erikseen.
    const close = line.indexOf(")");
    const ratingPart = close >= 0 ? line.slice(0, close + 1) : line;
    const rest = close >= 0 ? line.slice(close + 1) : "";
    r.ratingRaw = r.ratingRaw ? `${r.ratingRaw} ${ratingPart}` : ratingPart;
    Object.assign(r, parseRating(r.ratingRaw));
    st.ratingOpen = r.ratingRaw.includes("(") && !r.ratingRaw.includes(")");
    st.afterRating = true;
    // "*** 12.09.2007": tähdet ja päiväys ilman sulkuja
    const tail = close >= 0 ? rest : ratingPart.replace(/^[*★'’]+/, "").replace(/\([^)]*$/, "");
    const tailText = close >= 0 ? tail : dates(tail).length ? tail : "";
    if (tailText.trim()) for (const seg of splitSegments(tailText)) assignSegment(st, seg, known);
    return;
  }

  if (/^\+/.test(line)) {
    r.pros.push(clean(line.slice(1)));
    return;
  }
  if (/^[-–]\s/.test(line)) {
    r.cons.push(clean(line.slice(1)));
    return;
  }

  for (const seg of splitSegments(line)) {
    if (!assignSegment(st, seg, known)) r.unparsedLines.push(seg);
  }
}

/**
 * Pilkkoo rivin " / "-erottimista. Kauttaviiva ilman välilyöntejä ("1/3",
 * "HIFK/2", "2014/42") kuuluu tekstiin eikä pilko.
 */
function splitSegments(line: string): string[] {
  return line
    .split(/\s+\/\s*|\s*\/\s+|\/$/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Etsii osoitteesta tunnetun kaupungin: pilkulla erotetut osat lopusta alkaen,
 * sitten viimeinen ja ensimmäinen sana. Palauttaa kaupungin ja osoitteen ilman
 * sitä — kaupunki on nyt omassa kentässään, eikä sivu saa näyttää
 * "Porosalmentie 313 Rantasalmi, Rantasalmi". Sulkeiden lisätieto säilyy.
 */
function cityFromAddress(
  address: string,
  known: Set<string>,
  foreign: boolean,
): { city: string; address: string } | null {
  const raw = address.split(",").map((p) => clean(p));
  const bare = raw.map((p) => clean(p.replace(/\([^)]*\)/g, "")));
  const parens = raw.map((p) => (p.match(/\([^)]*\)/g) ?? []).join(" "));
  const usable = (i: number) => bare[i] && !UK_POSTCODE.test(bare[i]);

  const without = (i: number, rest = "") => {
    const parts = [...raw];
    if (rest || i === 0) {
      parts[i] = [rest, parens[i]].filter(Boolean).join(" ");
    } else {
      // "Brahenkatu 1, Lappeenranta (Iso Kristiina)" → "Brahenkatu 1 (Iso Kristiina)"
      parts[i - 1] = [parts[i - 1], parens[i]].filter(Boolean).join(" ");
      parts[i] = "";
    }
    return parts.map(clean).filter(Boolean).join(", ");
  };

  for (let i = raw.length - 1; i >= 0; i--) {
    if (usable(i) && known.has(fold(bare[i]))) return { city: canonicalCity(bare[i]), address: without(i) };
  }
  const lastIdx = [...raw.keys()].reverse().find(usable);
  if (lastIdx !== undefined) {
    const words = bare[lastIdx].split(" ");
    const lastWord = words.at(-1)!;
    if (words.length > 1 && known.has(fold(lastWord))) {
      return { city: canonicalCity(lastWord), address: without(lastIdx, words.slice(0, -1).join(" ")) };
    }
  }
  const firstWords = bare[0]?.split(" ") ?? [];
  // "Tarto - Tallinna maantie" on tien nimi, ei "kaupunki + osoite".
  if (firstWords.length > 1 && known.has(fold(firstWords[0])) && !/^[-–]/.test(firstWords[1])) {
    return { city: canonicalCity(firstWords[0]), address: without(0, firstWords.slice(1).join(" ")) };
  }
  // Ulkomailla viimeinen pilkun jälkeinen osa on kaupunki, jos siinä ei ole
  // numeroita eikä se ole lentokenttä/hotelli ("Markt 11, Eutin").
  if (foreign && lastIdx !== undefined && lastIdx > 0) {
    const last = bare[lastIdx];
    if (!/\d/.test(last) && !NOT_A_CITY.test(last) && /^\p{Lu}/u.test(last) && !STREET.test(last)) {
      return { city: canonicalCity(last), address: without(lastIdx) };
    }
  }
  return null;
}

function cityFromName(name: string, known: Set<string>): string | null {
  const parts = name.split(/\s*[/,]\s*/).map(clean).filter(Boolean);
  if (parts.length < 2) return null;
  const last = parts.at(-1)!;
  if (known.has(fold(last))) return canonicalCity(last);
  const lastWord = last.split(" ").at(-1)!;
  if (known.has(fold(lastWord))) return canonicalCity(lastWord);
  return null;
}

function finalize(st: State, page: PageInfo, known: Set<string>): Ravintola {
  const r = st.r;
  r.visits = [...new Set(r.visits)];
  r.images = [...new Set(r.images)];
  r.imagesPositional = [...new Set(r.imagesPositional)];
  r.name = clean(r.name.replace(/\s*[*★]+\s*$/, "").replace(/[,/]\s*$/, ""));
  r.visitContext = st.contexts.length ? st.contexts.join("; ") : null;

  // Kaupunki: postitoimipaikka > kaupunkirivi > osoite > nimi > sivun ainoa kaupunki.
  if (!r.city && st.cityLine) {
    r.city = st.cityLine;
    r.citySource = "rivi";
  }
  if (!r.city && r.address) {
    const c = cityFromAddress(r.address, known, page.country !== "Suomi");
    if (c) {
      r.city = c.city;
      r.citySource = "osoite";
      // Osoitteen perään jäänyt postinumero: "Austurstraeti 9 101" → 101
      const trailingPostal = /^(.*\d.*?)\s(\d{3,5})$/.exec(c.address);
      if (trailingPostal && !r.postalCode) {
        r.address = trailingPostal[1];
        r.postalCode = trailingPostal[2];
      } else {
        r.address = c.address || null;
      }
    }
  }
  // Pelkkä kaupunkirivi ja sama kaupunki osoitteen lopussa: "Lenina 16. Priozersk" ei ole sama, jätetään.
  if (r.address && r.city && r.citySource !== "osoite") {
    const stripped = r.address.replace(new RegExp(`[,\\s]+${r.city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"), "");
    if (stripped !== r.address && /\d/.test(stripped)) r.address = stripped;
  }
  if (!r.city) {
    const c = cityFromName(r.name, known);
    if (c) {
      r.city = c;
      r.citySource = "nimi";
    }
  }
  if (!r.city && page.pageCity) {
    r.city = page.pageCity;
    r.citySource = "sivu";
  }
  if (!r.city) {
    r.citySource = "alue";
    r.reviewReasons.push(`kaupunki ei selviä lähteestä (viitataan sivun alueeseen "${r.area}")`);
  }

  if (!r.name) r.reviewReasons.push("nimi puuttuu");
  if (r.ratingOverall === null && r.starsGlyph === null) {
    r.reviewReasons.push("arvosana puuttuu");
  }
  if (r.unparsedLines.length > 0) {
    r.reviewReasons.push(`tunnistamattomia rivejä ${r.unparsedLines.length}`);
  }
  if (r.name.length > 60) r.reviewReasons.push("nimi epäilyttävän pitkä");
  // Lähteen ristiriita: lopettamispäivä ennen viimeistä käyntiä (esim. Say Delicious
  // "Toiminta loppunut 01.04.2014", käynti 09.08.2014). Ei korjata arvaamalla.
  if (r.closedNote) {
    const iso = (d: string) => d.split(".").reverse().join("-");
    const closedDate = dates(r.closedNote)[0];
    const lastVisit = [r.firstVisit, ...r.visits].filter((d): d is string => Boolean(d)).map(iso).sort().at(-1);
    const closedYear = /\b(19|20)\d{2}\b/.exec(r.closedNote)?.[0];
    if (lastVisit && ((closedDate && iso(closedDate) < lastVisit) || (!closedDate && closedYear && closedYear < lastVisit.slice(0, 4)))) {
      r.reviewReasons.push(`lopettamismerkintä ("${r.closedNote}") on ennen viimeistä käyntiä ${lastVisit}`);
    }
  }
  r.needsReview = r.reviewReasons.length > 0;
  return r;
}

interface PageResult {
  rows: Ravintola[];
  page: PageInfo;
  /** Ravintoloiden ulkopuoliset rivit (otsikot, TOP 5 -linkit, tähtiselite). */
  pageLines: string[];
  /** Sivun lopun kuvatekstit ("Kuva Ravintola Maistrali, Egina 09.07.2008"). */
  captions: string[];
}

function parsePage(html: string, file: string, globalKnown: Set<string>): PageResult {
  const { chunks, bodyText, headerLine } = toChunks(html);
  const area = areaFromPage(bodyText, file);
  const page = pageInfo(headerLine, area, file);
  const known = new Set([...globalKnown, ...page.headerCities.map(fold)]);
  const out: Ravintola[] = [];
  const pageLines: string[] = [];
  const captions: string[] = [];
  let st: State | null = null;

  const close = () => {
    if (st) out.push(finalize(st, page, known));
    st = null;
  };

  // Osalla sivuista nimi on omalla rivillään merkinnän jälkeen:
  //   "(55) 17.02.2016" <br> "Ravintolan nimi"
  let awaitingName = false;

  for (const chunk of chunks) {
    for (const line of chunk.lines) {
      if (LEGEND.test(line) || LEGEND_LINE.test(line)) {
        close();
        awaitingName = false;
        pageLines.push(line);
        continue;
      }
      if (/^Kuva\s/.test(line)) {
        captions.push(line);
        continue;
      }
      const m = MARKER.exec(line);
      if (m) {
        close();
        const first = m[2] ? dates(m[2])[0] : null;
        st = { r: blank(Number(m[1]), page, first ?? null), afterRating: false, ratingOpen: false, contexts: [], cityLine: null };
        st.r.sourceLines.push(line);
        const rest = m[3]?.trim() ?? "";
        if (rest) {
          st.r.name = rest;
          awaitingName = false;
        } else {
          awaitingName = true;
        }
        continue;
      }
      if (!st) {
        pageLines.push(line);
        continue;
      }
      const cur: State = st;

      if (awaitingName) {
        // Nimi voi olla muotoa "04.07.2012 Salon de Tapas Mayor"
        const withDate = /^(\d{1,2}\.\d{1,2}\.\d{4})\s+(.+)$/.exec(line);
        const candidate = withDate ? withDate[2].trim() : line;
        awaitingName = false;
        if (!isRatingLine(candidate) && !BARE_PHONE.test(candidate)) {
          if (withDate && !cur.r.firstVisit) cur.r.firstVisit = dates(withDate[1])[0];
          cur.r.name = candidate;
          cur.r.sourceLines.push(line);
          continue;
        }
      }

      assignLine(cur, line, known);
    }
    if (st) {
      const cur: State = st;
      cur.r.images.push(...chunk.images);
      if (chunk.markers <= 1) cur.r.imagesPositional.push(...chunk.images);
    }
  }

  close();
  return { rows: out, page, pageLines, captions };
}

/**
 * Turvaverkko: lähteen ravintolaotsakkeiden "(NN) pvm nimi" numerot suoraan
 * HTML-tekstistä, DOM-jäsennyksestä riippumatta. Tagit riisutaan, <br> ja
 * lohkotagit ovat rivinvaihtoja, kommentit ja skriptit ohitetaan (niitä ei
 * näytetä sivulla). Jos jäsennin kadottaa ravintolan — kuten Sarastron, joka
 * oli hajanaisen `</td>`:n jälkeen — luvut eivät täsmää ja ajo epäonnistuu.
 */
function sourceMarkers(html: string): number[] {
  const text = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|head)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<br\b[^>]*>|<\/?(?:p|td|th|tr|table|tbody|div|li|h[1-6]|blockquote|body)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&#160;|&#xa0;/gi, " ");
  return [...text.matchAll(/^[ \t ]*\((\d{1,3})\)/gm)].map((m) => Number(m[1]));
}

/**
 * Lähteen ja jäsennyksen otsakenumeroiden ero: kummassakin olevat ylimääräiset
 * sekä järjestys. Järjestysero tarkoittaa, että sisältöä on siirtynyt väärän
 * ravintolan alle (esim. taulukon eteen siirretty kappale).
 */
function markerDiff(
  source: number[],
  parsed: number[],
): { puuttuu: number[]; ylimaaraisia: number[]; jarjestysEroaa: boolean } {
  const count = (list: number[]) => list.reduce((m, n) => m.set(n, (m.get(n) ?? 0) + 1), new Map<number, number>());
  const s = count(source);
  const p = count(parsed);
  const puuttuu: number[] = [];
  const ylimaaraisia: number[] = [];
  for (const [n, c] of s) for (let i = p.get(n) ?? 0; i < c; i++) puuttuu.push(n);
  for (const [n, c] of p) for (let i = s.get(n) ?? 0; i < c; i++) ylimaaraisia.push(n);
  return {
    puuttuu: puuttuu.sort((a, b) => a - b),
    ylimaaraisia: ylimaaraisia.sort((a, b) => a - b),
    jarjestysEroaa: source.join(",") !== parsed.join(","),
  };
}

async function main() {
  const files = (await readdir(RAW_DIR))
    .filter((f) => /^ruokailu.*\.htm$/i.test(f))
    .filter((f) => !INDEX_PAGES.has(f.toLowerCase()))
    .sort();

  const htmlByFile = new Map<string, string>();
  for (const file of files) {
    htmlByFile.set(file, decodeHtml(await readFile(join(RAW_DIR, file))).normalize("NFC"));
  }

  // 1. kierros: kerätään kaikki postitoimipaikat, jotta osoitteen tai pelkän
  //    kaupunkirivin kaupunki tunnistetaan myös sivuilla, joilla postinumeroa ei ole.
  const known = new Set(Object.keys(CITY_ALIASES));
  for (const [file, html] of htmlByFile) {
    for (const r of parsePage(html, file, known).rows) {
      if (r.citySource === "postinumero" && r.city) known.add(fold(r.city));
    }
  }

  // 2. kierros: varsinainen jäsennys.
  const all: Ravintola[] = [];
  const pages: PageResult[] = [];
  const markerCheck = new Map<
    string,
    { lahteessa: number; jasennetty: number; puuttuu: number[]; ylimaaraisia: number[]; jarjestysEroaa: boolean }
  >();
  for (const [file, html] of htmlByFile) {
    const result = parsePage(html, file, known);
    pages.push(result);
    all.push(...result.rows);
    const source = sourceMarkers(html);
    const diff = markerDiff(source, result.rows.map((r) => r.index));
    markerCheck.set(file, { lahteessa: source.length, jasennetty: result.rows.length, ...diff });
    const flagged = result.rows.filter((r) => r.needsReview).length;
    const mismatch = diff.jarjestysEroaa ? `  ERO: lähteessä ${source.length}` : "";
    console.log(
      `  ${file.padEnd(30)} ${String(result.rows.length).padStart(4)}  (tarkistettavia ${flagged})${mismatch}`,
    );
  }
  const mismatches = [...markerCheck.entries()]
    .filter(([, c]) => c.jarjestysEroaa)
    .map(([sivu, c]) => ({ sivu, ...c }));
  const sourceTotal = [...markerCheck.values()].reduce((n, c) => n + c.lahteessa, 0);

  // Ravintolalistaa ei kirjoiteta, jos jäsennys ei vastaa lähdettä: import
  // ajettaisiin muuten vajaalla datalla (`migrate:ravintolat` pysähtyy tähän).
  if (mismatches.length === 0) await writeFile(OUT_FILE, `${JSON.stringify(all, null, 2)}\n`, "utf-8");

  const sum = (fn: (r: Ravintola) => number) => all.reduce((s, r) => s + fn(r), 0);
  const bySource: Record<string, number> = {};
  for (const r of all) bySource[r.citySource] = (bySource[r.citySource] ?? 0) + 1;

  const report = {
    ravintolat: all.length,
    /** Turvaverkko: lähteen "(NN)"-otsakkeet raakatekstistä vs. jäsennetyt. */
    otsakkeitaLahteessa: sourceTotal,
    otsakeErot: mismatches,
    sivuja: files.length,
    lahderiveja: sum((r) => r.sourceLines.length),
    unparsedLines: sum((r) => r.unparsedLines.length),
    ravintoloitaJoillaUnparsed: all.filter((r) => r.unparsedLines.length > 0).length,
    kayntimerkintoja: sum((r) => r.visits.length + (r.firstVisit ? 1 : 0)),
    arviotekstia: all.filter((r) => r.notes.length > 0).length,
    kayntikonteksti: all.filter((r) => r.visitContext).length,
    lopettaneita: all.filter((r) => r.closed).length,
    kaupunkiLahde: bySource,
    tarkistettavat: all
      .filter((r) => r.needsReview)
      .map((r) => ({ sivu: r.sourcePage, nimi: r.name, syyt: r.reviewReasons })),
    sivut: pages.map((p) => ({
      sivu: p.page.file,
      alue: p.page.area,
      maa: p.page.country,
      otsikonKaupungit: p.page.headerCities,
      ravintoloita: p.rows.length,
      otsakkeitaLahteessa: markerCheck.get(p.page.file)?.lahteessa ?? 0,
      kaupungit: [...new Set(p.rows.map((r) => r.city ?? `(${r.area})`))].sort(),
      sivunRivit: p.pageLines,
      kuvatekstit: p.captions,
    })),
  };
  await writeFile(REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`, "utf-8");

  console.log(`
Yhteensä ................ ${all.length}
Sivuja .................. ${files.length}
Lähderivejä ............. ${report.lahderiveja}
  tunnistamatta ......... ${report.unparsedLines} (${report.ravintoloitaJoillaUnparsed} ravintolaa)
Kokonaisarvosana ........ ${all.filter((r) => r.ratingOverall !== null).length}
Osa-arviot .............. ${all.filter((r) => r.ratingFood !== null).length}
Osoite .................. ${all.filter((r) => r.address).length}
Puhelin ................. ${all.filter((r) => r.phone).length}
Kuvia ................... ${sum((r) => r.images.length)}
Käyntimerkintöjä ........ ${report.kayntimerkintoja}
Käyntikonteksti ......... ${report.kayntikonteksti}
Arviotekstiä ............ ${report.arviotekstia}
Plussia / miinuksia ..... ${sum((r) => r.pros.length)} / ${sum((r) => r.cons.length)}
Lopettaneita ............ ${report.lopettaneita}
Kaupungin lähde ......... ${Object.entries(bySource).map(([k, v]) => `${k} ${v}`).join(", ")}
Tarkistettavia .......... ${all.filter((r) => r.needsReview).length}

Otsakkeet lähteessä ...... ${sourceTotal} (jäsennetty ${all.length}, eroja ${mismatches.length} sivulla)

Tallennettu: ${mismatches.length === 0 ? OUT_FILE : "(ravintolat.json jätetty kirjoittamatta)"}
             ${REPORT_FILE}`);

  if (mismatches.length > 0) {
    console.error("\nVIRHE: jäsennetyt ravintolat eivät vastaa lähteen (NN)-otsakkeita:");
    for (const m of mismatches) {
      console.error(
        `  ${m.sivu}: lähteessä ${m.lahteessa}, jäsennetty ${m.jasennetty}` +
          (m.puuttuu.length ? `; puuttuu (${m.puuttuu.join(", ")})` : "") +
          (m.ylimaaraisia.length ? `; ylimääräisiä (${m.ylimaaraisia.join(", ")})` : "") +
          (!m.puuttuu.length && !m.ylimaaraisia.length ? "; järjestys eroaa lähteestä" : ""),
      );
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
