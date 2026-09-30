/**
 * Tilastotaulukoiden yhteinen logiikka: Studion taulukkoeditori
 * (sanity/components/taulukkoeditori) ja sivuston taulukko (components/ui/stat-table.tsx).
 *
 * Tietomalli on `jalkapalloTilasto.columns` + `rows[].cells[]` (docs/05):
 *  - sarakkeella on pysyvä `key`, näkyvä `label` ja `type`
 *  - rivin solut ovat `{ key, value }` -pareja, ja tyhjä solu jätetään pois
 *
 * Tallennusmuoto on koneluettava (päivämäärät ISO 8601, luvut ilman
 * tuhaterotinta), mutta sihteeri kirjoittaa ja näkee ne suomalaisittain.
 * Tämä moduuli muuntaa suuntaan ja toiseen, ja se on puhdas (ei Reactia, ei
 * Sanityä), joten se testataan komennolla `npm run test:taulukko`.
 */

import { slugify } from "./slugify";

export type SarakeTyyppi = "text" | "number" | "date" | "year" | "link";

export const SARAKETYYPIT: { value: SarakeTyyppi; title: string; ohje: string }[] = [
  { value: "text", title: "Teksti", ohje: "Nimet, tulokset ja muu vapaa teksti." },
  {
    value: "number",
    title: "Numero",
    ohje: "Kokonaisluvut. Tasataan oikealle, ja sivulla näkyy tuhaterotin (61 035).",
  },
  {
    value: "date",
    title: "Päivämäärä",
    ohje: "Kirjoita 26.9.2026, 9/2026 tai väli 30.1.–1.2.2009.",
  },
  { value: "year", title: "Vuosi", ohje: "Nelinumeroinen vuosi, tasataan oikealle." },
  { value: "link", title: "Linkki", ohje: "Verkko-osoite." },
];

export const NUMEERISET: ReadonlySet<string> = new Set(["number", "year"]);

// ---------------------------------------------------------------------------
// Päivämäärät
// ---------------------------------------------------------------------------

export type IsoOsat = { y: string; m: string; d?: string };

const isoDay = /^(\d{4})-(\d{2})-(\d{2})$/;
const isoMonth = /^(\d{4})-(\d{2})$/;

export function parseIso(value: string): IsoOsat | null {
  const day = isoDay.exec(value);
  if (day) return { y: day[1], m: day[2], d: day[3] };
  const month = isoMonth.exec(value);
  if (month) return { y: month[1], m: month[2] };
  return null;
}

export function formatIso({ y, m, d }: IsoOsat): string {
  return d ? `${d}.${m}.${y}` : `${m}/${y}`;
}

/**
 * ISO 8601 -väli suomalaisittain: vuosi (ja kuukausi) kirjoitetaan vain
 * kerran, jos ne ovat samat — "30.01.–01.02.2009". Palauttaa alun ja lopun
 * erikseen, jotta sivusto voi antaa kummallekin oman `<time>`-elementin.
 */
export function formatInterval(start: IsoOsat, end: IsoOsat): [string, string] {
  if (start.d && end.d) {
    if (start.y === end.y && start.m === end.m) return [`${start.d}.`, `${end.d}.${end.m}.${end.y}`];
    if (start.y === end.y) return [`${start.d}.${start.m}.`, `${end.d}.${end.m}.${end.y}`];
  }
  return [formatIso(start), formatIso(end)];
}

/** Tallennettu päivämääräarvo suomalaiseen muotoon. Muu teksti sellaisenaan. */
export function formatPaivays(value: string): string {
  const single = parseIso(value);
  if (single) return formatIso(single);
  const [a, b, ...rest] = value.split("/");
  const start = a ? parseIso(a) : null;
  const end = b ? parseIso(b) : null;
  if (start && end && rest.length === 0) return formatInterval(start, end).join("–");
  return value;
}

const pad = (n: number) => String(n).padStart(2, "0");

function validi(y: number, m: number, d?: number): boolean {
  if (y < 1800 || y > 2200 || m < 1 || m > 12) return false;
  if (d === undefined) return true;
  const paivia = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return d >= 1 && d <= paivia;
}

/** "26.9.2026" | "26.09.2026" → { y, m, d }. Osat voivat puuttua (välin alku). */
const suomiPaiva = /^(\d{1,2})\.(?:(\d{1,2})\.(?:(\d{4}))?)?$/;
/** "9/2026" | "09/2026" | "9.2026" → kuukausi. */
const suomiKuukausi = /^(\d{1,2})[/.](\d{4})$/;

function parseSuomiPiste(value: string): IsoOsat | null {
  const kk = suomiKuukausi.exec(value);
  if (kk) {
    const m = Number(kk[1]);
    const y = Number(kk[2]);
    return validi(y, m) ? { y: String(y), m: pad(m) } : null;
  }
  const pv = suomiPaiva.exec(value);
  if (!pv || !pv[2] || !pv[3]) return null;
  const [d, m, y] = [Number(pv[1]), Number(pv[2]), Number(pv[3])];
  return validi(y, m, d) ? { y: String(y), m: pad(m), d: pad(d) } : null;
}

function isoMerkkijono(osat: IsoOsat): string {
  return osat.d ? `${osat.y}-${osat.m}-${osat.d}` : `${osat.y}-${osat.m}`;
}

/**
 * Sihteerin kirjoittama päivämäärä tallennusmuotoon.
 *
 * Hyväksyy: 26.9.2026 → 2026-09-26 · 9/2026 → 2026-09 ·
 * väli 30.1.–1.2.2009 (tai 30.–31.1.2009, 30.1.2009 - 1.2.2009) →
 * 2009-01-30/2009-02-01. ISO-muoto kelpaa sellaisenaan.
 * Palauttaa null, jos arvo ei ole tunnistettava päivämäärä.
 */
export function parsePaivays(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (parseIso(value)) return value;
  const [isoA, isoB, ...isoRest] = value.split("/");
  if (isoRest.length === 0 && isoA && isoB && parseIso(isoA) && parseIso(isoB)) return value;

  const single = parseSuomiPiste(value);
  if (single) return isoMerkkijono(single);

  const osat = value.split(/\s*[–—-]\s*/);
  if (osat.length !== 2) return null;
  const end = parseSuomiPiste(osat[1]);
  if (!end?.d) return null;
  const alku = suomiPaiva.exec(osat[0]);
  if (!alku) return null;
  const y = Number(alku[3] ?? end.y);
  const m = Number(alku[2] ?? end.m);
  const d = Number(alku[1]);
  if (!validi(y, m, d)) return null;
  const start = { y: String(y), m: pad(m), d: pad(d) };
  if (isoMerkkijono(start) > isoMerkkijono(end)) return null;
  return `${isoMerkkijono(start)}/${isoMerkkijono(end)}`;
}

// ---------------------------------------------------------------------------
// Solujen arvot
// ---------------------------------------------------------------------------

const kokonaisluku = /^-?\d+$/;
/** Välilyönnit, sitova välilyönti ja kapea sitova välilyönti (fi-FI tuhaterotin). */
const tuhaterotin = /[\s  ]/g;

/**
 * Editorissa kirjoitettu arvo tallennusmuotoon. Tunnistamaton arvo
 * tallennetaan sellaisenaan: arkistossa on tarkoituksella tekstiä myös
 * numero- ja päivämääräsarakkeissa (esim. "n. 5000", "kevät 1998").
 */
export function normalisoiArvo(input: string, tyyppi: SarakeTyyppi | undefined): string {
  const value = input.trim();
  if (!value) return "";
  if (tyyppi === "date") return parsePaivays(value) ?? value;
  if (tyyppi === "number" || tyyppi === "year") {
    const ilman = value.replace(tuhaterotin, "");
    return kokonaisluku.test(ilman) ? ilman : value;
  }
  return value;
}

/** Tallennettu arvo editorissa näytettävään muotoon. */
export function naytettavaArvo(value: string | null | undefined, tyyppi: SarakeTyyppi | undefined): string {
  if (!value) return "";
  return tyyppi === "date" ? formatPaivays(value) : value;
}

/** Varoitus, jos arvo ei sovi sarakkeen tyyppiin. Ei estä tallennusta. */
export function tyyppivaroitus(value: string, tyyppi: SarakeTyyppi | undefined): string | null {
  if (!value) return null;
  if (tyyppi === "number" && !kokonaisluku.test(value)) return "Ei kokonaisluku: näkyy sivulla tekstinä.";
  if (tyyppi === "year" && !/^\d{4}$/.test(value)) return "Ei nelinumeroinen vuosi.";
  if (tyyppi === "date" && formatPaivays(value) === value) {
    return "Ei tunnistettu päivämääräksi: kirjoita esim. 26.9.2026.";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Sarakkeet
// ---------------------------------------------------------------------------

/** Pysyvä, uniikki sarakeavain otsikosta: "Kotijoukkue" → "kotijoukkue", "kotijoukkue-2". */
export function sarakeavain(label: string, varatut: Iterable<string>): string {
  const kaytossa = new Set(varatut);
  const pohja = slugify(label).slice(0, 40).replace(/-+$/, "") || "sarake";
  if (!kaytossa.has(pohja)) return pohja;
  for (let i = 2; ; i += 1) {
    const ehdokas = `${pohja}-${i}`;
    if (!kaytossa.has(ehdokas)) return ehdokas;
  }
}

/** Arvaa tuodun sarakkeen tyypin sen arvoista. Tyhjä sarake on tekstiä. */
export function arvaaTyyppi(arvot: string[]): SarakeTyyppi {
  const eiTyhjat = arvot.map((a) => a.trim()).filter(Boolean);
  if (eiTyhjat.length === 0) return "text";
  if (eiTyhjat.every((a) => /^\d{4}$/.test(a))) return "year";
  if (eiTyhjat.every((a) => kokonaisluku.test(a.replace(tuhaterotin, "")))) return "number";
  if (eiTyhjat.every((a) => parsePaivays(a) !== null)) return "date";
  if (eiTyhjat.every((a) => /^https?:\/\/\S+$/i.test(a))) return "link";
  return "text";
}

// ---------------------------------------------------------------------------
// Leikepöytä: Excel, Google Sheets, Numbers, CSV
// ---------------------------------------------------------------------------

export type Erotin = "\t" | ";" | ",";

/** Päättelee erottimen ensimmäiseltä riviltä (lainausmerkkien ulkopuolelta). */
export function tunnistaErotin(teksti: string): Erotin {
  let lainauksessa = false;
  const maarat = { "\t": 0, ";": 0, ",": 0 };
  for (const merkki of teksti) {
    if (merkki === '"') lainauksessa = !lainauksessa;
    else if (!lainauksessa && (merkki === "\n" || merkki === "\r")) break;
    else if (!lainauksessa && merkki in maarat) maarat[merkki as Erotin] += 1;
  }
  if (maarat["\t"] > 0) return "\t";
  if (maarat[";"] > 0 && maarat[";"] >= maarat[","]) return ";";
  if (maarat[","] > 0) return ",";
  return "\t";
}

/**
 * Jäsentää leikepöydän tai CSV:n ruudukoksi. Noudattaa RFC 4180 -lainausta,
 * jota Excel käyttää, kun solussa on rivinvaihto, erotin tai lainausmerkki.
 * Rivit tasataan samanlevyisiksi, ja lopun tyhjät rivit poistetaan.
 */
export function jasennaRuudukko(teksti: string, erotin: Erotin = tunnistaErotin(teksti)): string[][] {
  const rivit: string[][] = [];
  let rivi: string[] = [];
  let solu = "";
  let lainauksessa = false;
  const s = teksti.replace(/\r\n?/g, "\n");

  for (let i = 0; i < s.length; i += 1) {
    const merkki = s[i];
    if (lainauksessa) {
      if (merkki === '"' && s[i + 1] === '"') {
        solu += '"';
        i += 1;
      } else if (merkki === '"') {
        lainauksessa = false;
      } else {
        solu += merkki;
      }
    } else if (merkki === '"' && solu === "") {
      lainauksessa = true;
    } else if (merkki === erotin) {
      rivi.push(solu);
      solu = "";
    } else if (merkki === "\n") {
      rivi.push(solu);
      rivit.push(rivi);
      rivi = [];
      solu = "";
    } else {
      solu += merkki;
    }
  }
  rivi.push(solu);
  rivit.push(rivi);

  while (rivit.length > 0 && rivit[rivit.length - 1].every((c) => c.trim() === "")) rivit.pop();
  const leveys = Math.max(0, ...rivit.map((r) => r.length));
  return rivit.map((r) => [...r, ...Array<string>(leveys - r.length).fill("")]);
}

/** Onko liitetty teksti useamman solun alue (eikä yksittäinen arvo)? */
export function onRuudukko(teksti: string): boolean {
  return /[\t\n\r]/.test(teksti.replace(/[\r\n]+$/, ""));
}

/** Ruudukko sarkaineroteltuna tekstinä, jonka Excel ja Google Sheets liittävät soluiksi. */
export function ruudukkoTekstiksi(ruudukko: string[][]): string {
  const lainaa = (c: string) => (/[\t\n\r"]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c);
  return ruudukko.map((rivi) => rivi.map(lainaa).join("\t")).join("\n");
}
