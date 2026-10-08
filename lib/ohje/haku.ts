/**
 * Ohjeiden haku Studion Ohjeet-työkalussa (docs/25).
 *
 * - Väljä: kirjainkoko ja tarkkeet eivät vaikuta (ä = a, ö = o, å = a), joten
 *   "julkaisu" löytää "Julkaisu" ja "paivita" löytää "Päivitä".
 * - Jokaisen hakusanan on osuttava korttiin (otsikko, avainsanat tai teksti).
 *   Sana voi olla yhdyssanan osa: "taulukko" löytää "tilastotaulukko".
 * - Pisteytys: otsikko > avainsanat > teksti.
 * - Taivutus: pitkä sana, joka ei osu, kokeillaan ilman kahta viimeistä kirjainta
 *   ("julkaisu" → "julkai" löytää "julkaise").
 *
 * Puhdas moduuli: testataan komennolla `npm run test:ohje`.
 */

import type { OhjeKortti } from "./tyypit";

/** Merkki kerrallaan, joten indeksit vastaavat alkuperäistä tekstiä (otteen rajaus). */
export function normalisoi(teksti: string): string {
  let tulos = "";
  for (const merkki of teksti) {
    const perus = merkki.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
    const yksi = perus.length === 1 ? perus : (perus[0] ?? " ");
    // Merkit, jotka eivät ole kirjaimia tai numeroita, välilyönneiksi; pituus säilyy.
    const kelpaa = /[\p{L}\p{N}]/u.test(yksi) ? yksi : " ";
    tulos += merkki.length === 2 ? `${kelpaa} ` : kelpaa;
  }
  return tulos;
}

export function hakusanat(kysely: string): string[] {
  return normalisoi(kysely)
    .split(/\s+/)
    .filter((s) => s.length > 0);
}

export const PISTEET = {
  otsikko: 20,
  otsikonSananAlku: 10,
  avainsana: 8,
  avainsananAlku: 4,
  teksti: 1,
} as const;

export type Hakutulos = {
  kortti: OhjeKortti;
  pisteet: number;
  /** Lyhyt ote tekstistä ensimmäisen osuman ympäriltä (tyhjä, jos osui vain otsikkoon). */
  ote: string;
};

function sananAlussa(teksti: string, sana: string): boolean {
  return new RegExp(`(^|\\s)${sana.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(teksti);
}

function laskeOsumat(teksti: string, sana: string): number {
  let n = 0;
  let i = teksti.indexOf(sana);
  while (i !== -1 && n < 5) {
    n += 1;
    i = teksti.indexOf(sana, i + sana.length);
  }
  return n;
}

function osumanPisteet(otsikko: string, avainsanat: string[], teksti: string, sana: string): number {
  let osa = 0;
  if (otsikko.includes(sana)) osa += PISTEET.otsikko + (sananAlussa(otsikko, sana) ? PISTEET.otsikonSananAlku : 0);
  for (const a of avainsanat) {
    if (a.includes(sana)) osa += PISTEET.avainsana + (sananAlussa(a, sana) ? PISTEET.avainsananAlku : 0);
  }
  return osa + laskeOsumat(teksti, sana) * PISTEET.teksti;
}

export function otteenRajaus(teksti: string, sanat: string[], pituus = 140): string {
  const norm = normalisoi(teksti);
  let alku = -1;
  for (const s of sanat) {
    const i = norm.indexOf(s);
    if (i !== -1 && (alku === -1 || i < alku)) alku = i;
  }
  if (alku === -1) return "";
  const vasen = Math.max(0, alku - Math.floor(pituus / 3));
  const oikea = Math.min(teksti.length, vasen + pituus);
  return `${vasen > 0 ? "…" : ""}${teksti.slice(vasen, oikea).trim()}${oikea < teksti.length ? "…" : ""}`;
}

/** Hakee kortit; tyhjä kysely palauttaa tyhjän listan. */
export function haeOhjeista(kortit: readonly OhjeKortti[], kysely: string): Hakutulos[] {
  const sanat = hakusanat(kysely);
  if (sanat.length === 0) return [];
  const tulokset: Hakutulos[] = [];
  for (const kortti of kortit) {
    const otsikko = normalisoi(kortti.otsikko);
    const avainsanat = kortti.avainsanat.map(normalisoi);
    const teksti = normalisoi(kortti.teksti);
    let pisteet = 0;
    let kaikki = true;
    for (const sana of sanat) {
      let osa = osumanPisteet(otsikko, avainsanat, teksti, sana);
      // Taivutus: "julkaisu" ei ole sanassa "julkaise". Pitkästä sanasta kokeillaan
      // vartaloa ilman kahta viimeistä kirjainta (vähintään 4), puolilla pisteillä.
      if (osa === 0 && sana.length >= 6) osa = osumanPisteet(otsikko, avainsanat, teksti, sana.slice(0, -2)) / 2;
      if (osa === 0) {
        kaikki = false;
        break;
      }
      pisteet += osa;
    }
    if (kaikki) tulokset.push({ kortti, pisteet, ote: otteenRajaus(kortti.teksti, sanat) });
  }
  return tulokset.sort((a, b) => b.pisteet - a.pisteet || a.kortti.otsikko.localeCompare(b.kortti.otsikko, "fi"));
}
