/**
 * Vanhan FrontPage-sivuston HTML-tiedostojen dekoodaus (docs/12 §2.1.8).
 *
 * `<meta charset>` ei ole luotettava (data/family-notes.md §0.1): osa sivuista
 * ilmoittaa us-asciin mutta on UTF-8:aa, osa on windows-1252:ta. Siksi:
 * tiukka UTF-8 ensin, ja jos tavujono ei ole kelvollista UTF-8:aa, windows-1252.
 * Toimii kaikille 197 lähdesivulle.
 *
 * Miksi oma windows-1252-taulukko eikä `TextDecoder("windows-1252")`:
 * Node 24:n (ICU:n) dekooderi käsittelee tavut 0x80–0x9F ISO-8859-1:nä, eli
 * 0x96 → U+0096 (näkymätön C1-ohjausmerkki) eikä "–". Virhe tuotti
 * vaiheessa 1 uutisiin, karsintasivuille ja arvokisoihin näkymättömiä merkkejä
 * lainausmerkkien, viivojen ja €-merkin paikalle. Mojibake-haku ei niitä
 * löydä, koska merkit ovat "oikeaa" Unicodea — vain väärää.
 */

import { load } from "cheerio";

/** windows-1252:n tavut 0x80–0x9F. Muut tavut ovat samat kuin Unicodessa. */
const CP1252_HIGH: Record<number, number> = {
  0x80: 0x20ac, 0x82: 0x201a, 0x83: 0x0192, 0x84: 0x201e, 0x85: 0x2026, 0x86: 0x2020,
  0x87: 0x2021, 0x88: 0x02c6, 0x89: 0x2030, 0x8a: 0x0160, 0x8b: 0x2039, 0x8c: 0x0152,
  0x8e: 0x017d, 0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201c, 0x94: 0x201d, 0x95: 0x2022,
  0x96: 0x2013, 0x97: 0x2014, 0x98: 0x02dc, 0x99: 0x2122, 0x9a: 0x0161, 0x9b: 0x203a,
  0x9c: 0x0153, 0x9e: 0x017e, 0x9f: 0x0178,
};

/** Dekoodaa tavut windows-1252:na oikein myös alueella 0x80–0x9F. */
export function decodeWindows1252(buf: Uint8Array): string {
  let out = "";
  for (const byte of buf) {
    out += String.fromCharCode(CP1252_HIGH[byte] ?? byte);
  }
  return out;
}

/** Tiukka UTF-8, muuten windows-1252. Ei normalisoi — kutsuja päättää NFC:stä. */
export function decodeHtml(buf: Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    return decodeWindows1252(buf);
  }
}

/**
 * Korjaa jo dekoodatusta tekstistä C1-ohjausmerkit (U+0080–U+009F) niiden
 * windows-1252-merkeiksi. Varaverkko tekstille, joka on dekoodattu muualla
 * `TextDecoder("windows-1252")`:lla.
 */
export function fixC1Controls(text: string): string {
  return text.replace(/[\u0080-\u009f]/g, (ch) => {
    const mapped = CP1252_HIGH[ch.charCodeAt(0)];
    return mapped ? String.fromCharCode(mapped) : "";
  });
}

/**
 * Purkaa HTML-entiteetit (`&auml;`, `&amp;`, `&#228;`) tavalliseksi tekstiksi.
 * Kuvainventaarion (`data/normalized/kuvat.json`) alt-tekstit ovat raakoja
 * attribuuttiarvoja, joissa entiteetit ovat vielä purkamatta.
 */
export function decodeEntities(text: string): string {
  if (!text.includes("&")) return text;
  return load(`<p>${text.replace(/</g, "&lt;")}</p>`)("p").text();
}
