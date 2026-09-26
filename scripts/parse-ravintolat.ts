/**
 * Purkaa vanhan sivuston ruokailu*.htm -sivuilta ravintolat rakenteiseksi JSON:iksi.
 *
 * Ajo: `npm run parse:ravintolat`
 * Lähde: data/raw-html/ruokailu*.htm
 * Tulos: data/normalized/ravintolat.json
 *
 * Tulos on CMS-riippumaton: Sanity-import (tai mikä tahansa muu) tehdään
 * erillisessä adapterissa, jotta jäsennystyö ei sitoudu CMS-valintaan.
 *
 * Vanhoilla sivuilla on kaksi eri taittotapaa:
 *   A) yksi <tr> per tietorivi (esim. ruokailulahti.htm)
 *   B) koko lista yhdessä <td>:ssä <br>-eroteltuna (esim. ruokailuhameenlinna.htm)
 * Molemmat normalisoidaan samaksi rivivirraksi ennen jäsennystä.
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { load } from "cheerio";

const RAW_DIR = join(process.cwd(), "data", "raw-html");
const OUT_FILE = join(process.cwd(), "data", "normalized", "ravintolat.json");

/** Sivut jotka ovat koosteita, eivät ravintolalistoja. */
const INDEX_PAGES = new Set(["ruokailu.htm", "ruokailutop5.htm"]);

/** Uuden ravintolan aloittava rivi: "(03) 23.12.2003 Mamma Maria" */
const MARKER = /^\((\d{1,3})\)\s*(\d{2}\.\d{2}\.\d{4})?\s*(.*)$/;
const DATE = /\d{2}\.\d{2}\.\d{4}/g;
const PHONE = /(?:puhelin|puh\.?|tel\.?)[:\s]*(\+?\d[\d\s\-()]{5,}\d)/i;
const BARE_PHONE = /^\+?\d[\d\s-]{6,}\d$/;
const POSTAL = /(\d{5})\s+([A-Za-zÅÄÖåäö][\wÅÄÖåäö\- ]*)/;
const CLOSED = /toiminta\s+loppunut[^.]*\.?/i;
/** Sivun lopun tähtiselite — ei kuulu mihinkään ravintolaan. */
const LEGEND = /ravintola-arvostelu\s*:/i;
const NBSP = / /g;

export interface Ravintola {
  index: number;
  name: string;
  area: string;
  sourcePage: string;
  firstVisit: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
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
  images: string[];
  unparsedLines: string[];
  needsReview: boolean;
  reviewReasons: string[];
}

/** Vanhat sivut ovat osin us-ascii + entiteetit, osin windows-1252. */
function decode(buf: Buffer): string {
  const head = buf.subarray(0, 2048).toString("latin1").toLowerCase();
  const charset = /charset=['"]?([a-z0-9-]+)/.exec(head)?.[1];
  if (charset && charset !== "utf-8" && charset !== "us-ascii") {
    try {
      return new TextDecoder(charset).decode(buf);
    } catch {
      return new TextDecoder("windows-1252").decode(buf);
    }
  }
  return buf.toString("utf-8");
}

function clean(s: string): string {
  return s.replace(NBSP, " ").replace(/[ \t]+/g, " ").trim();
}

/** "4 ,0" ja "3,6" → 4.0 / 3.6 */
function num(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number.parseFloat(raw.replace(/\s+/g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 && n <= 5 ? n : null;
}

function isRatingLine(line: string): boolean {
  // Arvosana voi katketa kahdelle riville: "**** ( 3,5" + "3,5 / Hinta 3,7 / Viihtyvyys 3,8)"
  return (
    /^[*★]/.test(line) ||
    /Ruoka\s*\d/i.test(line) ||
    /Hinta\s*\d/i.test(line) ||
    /Viihtyvyys\s*\d/i.test(line)
  );
}

function parseRating(line: string) {
  const glyphs = /^([*★]+)/.exec(line);
  const overall = /\(\s*(\d\s*[,.]\s*\d)/.exec(line);
  return {
    starsGlyph: glyphs ? glyphs[1].length : null,
    ratingOverall: num(overall?.[1]),
    ratingFood: num(/Ruoka\s*(\d\s*[,.]\s*\d)/i.exec(line)?.[1]),
    ratingPrice: num(/Hinta\s*(\d\s*[,.]\s*\d)/i.exec(line)?.[1]),
    ratingAtmosphere: num(/Viihtyvyys\s*(\d\s*[,.]\s*\d)/i.exec(line)?.[1]),
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

interface Chunk {
  lines: string[];
  images: string[];
}

/**
 * Litistää sivun soluvirraksi. Otetaan vain sisimmät solut, jotta sisäkkäiset
 * taulukot eivät tuota samaa sisältöä kahteen kertaan. <br> → rivinvaihto.
 */
function toChunks(html: string): { chunks: Chunk[]; bodyText: string } {
  const $ = load(html);
  const chunks: Chunk[] = [];
  $("td, p").each((_, el) => {
    const $el = $(el);
    if ($el.find("td, p").length > 0) return; // ei sisimmäinen
    const images: string[] = [];
    $el.find("img[src]").each((__, img) => {
      const src = $(img).attr("src")?.trim();
      if (src) images.push(src);
    });
    $el.find("br").replaceWith("\n");
    const lines = $el
      .text()
      .split("\n")
      .map(clean)
      .filter((l) => l.length > 0);
    if (lines.length || images.length) chunks.push({ lines, images });
  });
  return { chunks, bodyText: clean($("body").text().replace(/\s+/g, " ")) };
}

function blank(
  index: number,
  area: string,
  file: string,
  firstVisit: string | null,
): Ravintola {
  return {
    index,
    name: "",
    area,
    sourcePage: file,
    firstVisit,
    address: null,
    postalCode: null,
    city: null,
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
    images: [],
    unparsedLines: [],
    needsReview: false,
    reviewReasons: [],
  };
}

function assignLine(r: Ravintola, rawLine: string, isNameLine: boolean): void {
  let line = rawLine;

  if (isRatingLine(line)) {
    // Kerätään katkennut arvosana yhteen ja jäsennetään koko merkkijono
    // uudelleen, jotta rivinvaihto keskellä ei hukkaa osa-arvioita.
    r.ratingRaw = r.ratingRaw ? `${r.ratingRaw} ${line}` : line;
    Object.assign(r, parseRating(r.ratingRaw));
    return;
  }

  const closed = CLOSED.exec(line);
  if (closed) {
    r.closed = true;
    r.closedNote = clean(closed[0]);
    line = clean(line.replace(CLOSED, ""));
    if (!line) return;
  }

  // Puhelinnumero voi olla samalla rivillä osoitteen kanssa
  const phone = PHONE.exec(line);
  if (phone) {
    r.phone = clean(phone[1]);
    line = clean(line.replace(PHONE, "").replace(/\s*\/\s*$/, ""));
  } else if (!isNameLine && BARE_PHONE.test(line)) {
    r.phone = line;
    return;
  }
  if (!line) return;

  if (line.startsWith("+")) {
    r.pros.push(clean(line.slice(1)));
    return;
  }
  if (/^[-–]\s/.test(line)) {
    r.cons.push(clean(line.slice(1)));
    return;
  }

  const dates = line.match(DATE);
  if (dates && !isNameLine) {
    r.visits.push(...dates);
    const context = clean(
      line.replace(DATE, "").replace(/[/,]+/g, " ").replace(/\s+/g, " "),
    );
    if (context.length > 2 && !r.visitContext) r.visitContext = context;
    return;
  }

  const postal = POSTAL.exec(line);
  if (postal) {
    r.postalCode = postal[1];
    r.city = clean(postal[2]);
    const rest = clean(line.replace(POSTAL, "").replace(/[,/]\s*$/, ""));
    if (rest && !r.address) r.address = rest;
    return;
  }

  if (isNameLine) {
    r.name = line;
    return;
  }
  if (!r.address && line.length < 100) {
    r.address = line;
    return;
  }
  r.unparsedLines.push(line);
}

function finalize(r: Ravintola): Ravintola {
  r.visits = [...new Set(r.visits)];
  r.images = [...new Set(r.images)];
  r.name = clean(r.name.replace(/\s*[*★]+\s*$/, "").replace(/[,/]\s*$/, ""));

  if (!r.name) r.reviewReasons.push("nimi puuttuu");
  if (r.ratingOverall === null && r.starsGlyph === null) {
    r.reviewReasons.push("arvosana puuttuu");
  }
  if (r.unparsedLines.length > 2) r.reviewReasons.push("tunnistamattomia rivejä");
  if (r.name.length > 60) r.reviewReasons.push("nimi epäilyttävän pitkä");
  r.needsReview = r.reviewReasons.length > 0;
  return r;
}

function parsePage(html: string, file: string): Ravintola[] {
  const { chunks, bodyText } = toChunks(html);
  const area = areaFromPage(bodyText, file);
  const out: Ravintola[] = [];
  let cur: Ravintola | null = null;

  // Osalla sivuista nimi on omalla rivillään merkinnän jälkeen:
  //   "(55) 17.02.2016" <br> "Ravintolan nimi"
  let awaitingName = false;

  for (const chunk of chunks) {
    for (const line of chunk.lines) {
      if (LEGEND.test(line)) {
        if (cur) out.push(cur);
        cur = null;
        awaitingName = false;
        continue;
      }
      const m = MARKER.exec(line);
      if (m) {
        if (cur) out.push(cur);
        cur = blank(Number(m[1]), area, file, m[2] ?? null);
        const rest = m[3]?.trim() ?? "";
        if (rest) {
          assignLine(cur, rest, true);
          awaitingName = false;
        } else {
          awaitingName = true;
        }
        continue;
      }
      if (!cur) continue;

      if (awaitingName) {
        // Nimi voi olla muotoa "04.07.2012 Salon de Tapas Mayor"
        const withDate = /^(\d{2}\.\d{2}\.\d{4})\s+(.+)$/.exec(line);
        const candidate = withDate ? withDate[2].trim() : line;
        if (!isRatingLine(candidate) && !BARE_PHONE.test(candidate)) {
          if (withDate && !cur.firstVisit) cur.firstVisit = withDate[1];
          assignLine(cur, candidate, true);
          awaitingName = false;
          continue;
        }
        awaitingName = false;
      }

      assignLine(cur, line, false);
    }
    if (cur) cur.images.push(...chunk.images);
  }

  if (cur) out.push(cur);
  return out.map(finalize);
}

async function main() {
  const files = (await readdir(RAW_DIR))
    .filter((f) => /^ruokailu.*\.htm$/i.test(f))
    .filter((f) => !INDEX_PAGES.has(f.toLowerCase()))
    .sort();

  const all: Ravintola[] = [];
  for (const file of files) {
    const rows = parsePage(decode(await readFile(join(RAW_DIR, file))), file);
    all.push(...rows);
    const flagged = rows.filter((r) => r.needsReview).length;
    console.log(
      `  ${file.padEnd(30)} ${String(rows.length).padStart(4)}  (tarkistettavia ${flagged})`,
    );
  }

  await writeFile(OUT_FILE, JSON.stringify(all, null, 2), "utf-8");

  const sum = (fn: (r: Ravintola) => number) => all.reduce((s, r) => s + fn(r), 0);
  console.log(`
Yhteensä ................ ${all.length}
Sivuja .................. ${files.length}
Kokonaisarvosana ........ ${all.filter((r) => r.ratingOverall !== null).length}
Osa-arviot .............. ${all.filter((r) => r.ratingFood !== null).length}
Osoite .................. ${all.filter((r) => r.address).length}
Puhelin ................. ${all.filter((r) => r.phone).length}
Kuvia ................... ${sum((r) => r.images.length)}
Käyntimerkintöjä ........ ${sum((r) => r.visits.length)}
Plussia / miinuksia ..... ${sum((r) => r.pros.length)} / ${sum((r) => r.cons.length)}
Lopettaneita ............ ${all.filter((r) => r.closed).length}
Tarkistettavia .......... ${all.filter((r) => r.needsReview).length}

Tallennettu: ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
