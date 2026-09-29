/**
 * Kommentin ja veikkauksen validointi (docs/15 §4). Puhdas moduuli ilman
 * Sanity-riippuvuutta, jotta sääntöjä voi testata erikseen
 * (`scripts/test-kommentit.ts`).
 *
 * Lomakkeen kentät:
 *  - `nimi`, `teksti`
 *  - sarjajärjestys: `sija-<i>` = joukkueen `vaihtoehdot[i]` sijoitus (1…N)
 *  - voittajaveikkaus: `paikka-<p>` = sijan p (1…k) joukkue, `maalikuningas`
 */
import {
  NIMI_MAX,
  TEKSTI_MAX,
  VEIKKAUS_MAX,
  sijojenMaara,
  type KommenttiField,
  type Kommentointi,
} from "./form-state";

export interface KommenttiInput {
  nimi: string;
  teksti: string;
  /** Lomakkeen raakakentät (`sija-*`, `paikka-*`, `maalikuningas`). */
  kentat: Record<string, string>;
}

export interface ValidointiTulos {
  fieldErrors: Partial<Record<KommenttiField, string>>;
  /** Veikkaus järjestettynä (sija 1 ensin); tyhjä kommentissa. */
  jarjestys: string[];
  maalikuningas: string;
}

/** Välilyönnit yhdeksi ja reunat pois; ohjausmerkit pois. */
export function siisti(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f​-‏⁠﻿]/g, "")
    .replace(/[^\S\n]+/g, " ")
    .trim();
}

/**
 * Jäsenen antama järjestys lomakkeen kentistä myös silloin, kun se ei ole
 * kelvollinen — virheen jälkeen lomake näyttää sen sellaisenaan.
 */
export function jarjestysLomakkeelta(k: Kommentointi, kentat: Record<string, string>): string[] {
  if (k.tyyppi === "sarjajarjestys") {
    const vaihtoehdot = k.vaihtoehdot ?? [];
    return vaihtoehdot
      .map((joukkue, i) => ({ joukkue, i, sija: Number.parseInt(kentat[`sija-${i}`] ?? "", 10) || Infinity }))
      .sort((a, b) => a.sija - b.sija || a.i - b.i)
      .map((r) => r.joukkue);
  }
  if (k.tyyppi === "voittajaveikkaus") {
    return Array.from({ length: sijojenMaara(k) }, (_, p) => siisti(kentat[`paikka-${p + 1}`] ?? ""));
  }
  return [];
}

const samaNimi = (a: string, b: string) => a.trim().toLocaleLowerCase("fi") === b.trim().toLocaleLowerCase("fi");

export function validoi(k: Kommentointi, input: KommenttiInput): ValidointiTulos {
  const fieldErrors: ValidointiTulos["fieldErrors"] = {};
  const tyyppi = k.tyyppi ?? "kommentti";

  if (input.nimi.length < 2) fieldErrors.nimi = "Kirjoita nimesi (vähintään 2 merkkiä).";
  else if (input.nimi.length > NIMI_MAX) fieldErrors.nimi = `Nimi saa olla enintään ${NIMI_MAX} merkkiä.`;

  if (input.teksti.length > TEKSTI_MAX) {
    fieldErrors.teksti = `Kommentti saa olla enintään ${TEKSTI_MAX} merkkiä.`;
  } else if (tyyppi === "kommentti" && input.teksti.length < 2) {
    fieldErrors.teksti = "Kirjoita kommentti.";
  }

  let jarjestys: string[] = [];
  let maalikuningas = "";

  if (tyyppi === "sarjajarjestys") {
    const vaihtoehdot = k.vaihtoehdot ?? [];
    const n = vaihtoehdot.length;
    const sijat = vaihtoehdot.map((_, i) => Number.parseInt(input.kentat[`sija-${i}`] ?? "", 10));
    const kelvolliset = sijat.every((s) => Number.isInteger(s) && s >= 1 && s <= n);
    if (!kelvolliset) {
      fieldErrors.veikkaus = "Anna jokaiselle joukkueelle sijoitus.";
    } else if (new Set(sijat).size !== n) {
      fieldErrors.veikkaus = "Kahdella joukkueella on sama sijoitus. Jokaisella sijalla voi olla vain yksi joukkue.";
    } else {
      jarjestys = vaihtoehdot
        .map((joukkue, i) => ({ joukkue, sija: sijat[i] }))
        .sort((a, b) => a.sija - b.sija)
        .map((r) => r.joukkue);
    }
  }

  if (tyyppi === "voittajaveikkaus") {
    const maara = sijojenMaara(k);
    const vaihtoehdot = k.vaihtoehdot ?? [];
    const paikat = Array.from({ length: maara }, (_, p) => siisti(input.kentat[`paikka-${p + 1}`] ?? ""));
    if (paikat.some((p) => !p)) {
      fieldErrors.veikkaus = `Täytä kaikki ${maara} sijaa.`;
    } else if (paikat.some((p) => p.length > VEIKKAUS_MAX)) {
      fieldErrors.veikkaus = `Joukkueen nimi saa olla enintään ${VEIKKAUS_MAX} merkkiä.`;
    } else if (vaihtoehdot.length && paikat.some((p) => !vaihtoehdot.some((v) => samaNimi(v, p)))) {
      fieldErrors.veikkaus = "Valitse joukkueet listasta.";
    } else if (new Set(paikat.map((p) => p.toLocaleLowerCase("fi"))).size !== paikat.length) {
      fieldErrors.veikkaus = "Sama joukkue on veikkauksessa kahdesti.";
    } else {
      // Listasta valittu nimi tallennetaan listan kirjoitusasulla.
      jarjestys = paikat.map((p) => vaihtoehdot.find((v) => samaNimi(v, p)) ?? p);
    }

    if (k.maalikuningas) {
      maalikuningas = siisti(input.kentat.maalikuningas ?? "");
      if (maalikuningas.length < 2) fieldErrors.maalikuningas = "Kirjoita maalikuninkaan nimi.";
      else if (maalikuningas.length > VEIKKAUS_MAX) {
        fieldErrors.maalikuningas = `Nimi saa olla enintään ${VEIKKAUS_MAX} merkkiä.`;
      }
    }
  }

  return { fieldErrors, jarjestys, maalikuningas };
}
