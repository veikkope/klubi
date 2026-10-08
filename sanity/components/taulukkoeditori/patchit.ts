import { insert, set, setIfMissing, unset, type FormPatch, type Path } from "sanity";

import { normalisoiArvo, type SarakeTyyppi } from "../../../lib/taulukko";

/**
 * Taulukkoeditorin muutokset Sanity-patcheina taulukon sisältävän objektin
 * juuresta (dokumentti tai tekstin taulukkolohko, konteksti.tsx).
 *
 * Patchit ovat pieniä ja kohdistuvat `_key`-polkuihin (yksi solu, yksi rivi),
 * eivät koko taulukon ylikirjoituksia. Näin kaksi yhtä aikaa muokkaavaa
 * käyttäjää eivät kumoa toistensa muutoksia, ja versiohistoriasta näkee,
 * mikä solu muuttui.
 */

export interface Sarake {
  _key: string;
  key: string;
  label: string;
  type?: SarakeTyyppi;
}

export interface Solu {
  _key?: string;
  key: string;
  value?: string | null;
}

export interface Rivi {
  _key: string;
  /** Vain tekstin Taulukko-lohkossa (nimetty rivityyppi, taulukkoKentat.ts `riviTyyppi`). */
  _type?: string;
  cells?: Solu[] | null;
}

export function uusiAvain(): string {
  const tavut = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(tavut, (t) => t.toString(16).padStart(2, "0")).join("");
}

const riviPolku = (rivi: Rivi): Path => ["rows", { _key: rivi._key }];

function soluPolku(rivi: Rivi, indeksi: number): Path {
  const solu = rivi.cells?.[indeksi];
  return [...riviPolku(rivi), "cells", solu?._key ? { _key: solu._key } : indeksi];
}

export function soluArvo(rivi: Rivi, sarake: Sarake): string {
  return rivi.cells?.find((c) => c.key === sarake.key)?.value?.trim() ?? "";
}

/**
 * Asettaa yhden solun arvon (jo normalisoituna). Tyhjä arvo poistaa solun,
 * kuten tuonnissa: sivusto tulkitsee puuttuvan solun tyhjäksi.
 */
export function asetaSolu(rivi: Rivi, sarake: Sarake, arvo: string): FormPatch[] {
  const indeksi = rivi.cells?.findIndex((c) => c.key === sarake.key) ?? -1;
  if (!arvo) return indeksi >= 0 ? [unset(soluPolku(rivi, indeksi))] : [];
  if (indeksi >= 0) return [set(arvo, [...soluPolku(rivi, indeksi), "value"])];
  return [
    setIfMissing([], [...riviPolku(rivi), "cells"]),
    insert([{ _key: uusiAvain(), key: sarake.key, value: arvo }], "after", [...riviPolku(rivi), "cells", -1]),
  ];
}

/** Uusi rivi valmiine soluineen (tyhjät arvot jätetään pois). */
export function uusiRivi(sarakkeet: Sarake[], arvot: string[] = [], riviTyyppi?: string): Rivi {
  const cells = sarakkeet.flatMap((sarake, i) => {
    const arvo = normalisoiArvo(arvot[i] ?? "", sarake.type);
    return arvo ? [{ _key: uusiAvain(), key: sarake.key, value: arvo }] : [];
  });
  return { _key: uusiAvain(), ...(riviTyyppi ? { _type: riviTyyppi } : {}), cells };
}

export type Sijainti = { ennen: string } | { jalkeen: string } | "loppuun";

function lisaaTaulukkoon(kentta: "rows" | "columns", kohteet: unknown[], sijainti: Sijainti): FormPatch[] {
  if (sijainti === "loppuun") return [setIfMissing([], [kentta]), insert(kohteet, "after", [kentta, -1])];
  return "ennen" in sijainti
    ? [insert(kohteet, "before", [kentta, { _key: sijainti.ennen }])]
    : [insert(kohteet, "after", [kentta, { _key: sijainti.jalkeen }])];
}

export const lisaaRivit = (rivit: Rivi[], sijainti: Sijainti) => lisaaTaulukkoon("rows", rivit, sijainti);

export const lisaaSarake = (sarake: Sarake, sijainti: Sijainti) => lisaaTaulukkoon("columns", [sarake], sijainti);

export const poistaRivi = (rivi: Rivi): FormPatch[] => [unset(riviPolku(rivi))];

/** Siirto on Sanityssä poisto ja lisäys naapurin toiselle puolelle. */
function siirra<T extends { _key: string }>(kentta: "rows" | "columns", kaikki: T[], kohde: T, suunta: -1 | 1): FormPatch[] {
  const i = kaikki.findIndex((x) => x._key === kohde._key);
  const naapuri = kaikki[i + suunta];
  if (i < 0 || !naapuri) return [];
  return [
    unset([kentta, { _key: kohde._key }]),
    insert([kohde], suunta < 0 ? "before" : "after", [kentta, { _key: naapuri._key }]),
  ];
}

export const siirraRivi = (rivit: Rivi[], rivi: Rivi, suunta: -1 | 1) => siirra("rows", rivit, rivi, suunta);

export const siirraSaraketta = (sarakkeet: Sarake[], sarake: Sarake, suunta: -1 | 1) =>
  siirra("columns", sarakkeet, sarake, suunta);

/** Poistaa sarakkeen ja sen solut kaikilta riveiltä. */
export function poistaSarake(rivit: Rivi[], sarake: Sarake): FormPatch[] {
  const solut = rivit.flatMap((rivi) =>
    (rivi.cells ?? [])
      .map((solu, i) => ({ solu, i }))
      .filter(({ solu }) => solu.key === sarake.key)
      // Indeksipolut (solu ilman _key-avainta) poistetaan lopusta alkuun.
      .reverse()
      .map(({ i }) => unset(soluPolku(rivi, i))),
  );
  return [unset(["columns", { _key: sarake._key }]), ...solut];
}

/**
 * Sarakkeen nimen ja tyypin muutos. Kun tyyppi vaihtuu esim. päivämääräksi,
 * olemassa olevat arvot muunnetaan uuteen muotoon (26.9.2026 → 2026-09-26)
 * siltä osin kuin ne tunnistetaan.
 */
export function muokkaaSaraketta(rivit: Rivi[], vanha: Sarake, uusi: Pick<Sarake, "label" | "type">): FormPatch[] {
  const polku: Path = ["columns", { _key: vanha._key }];
  const patchit: FormPatch[] = [];
  if (uusi.label !== vanha.label) patchit.push(set(uusi.label, [...polku, "label"]));
  if (uusi.type !== vanha.type) {
    patchit.push(set(uusi.type, [...polku, "type"]));
    for (const rivi of rivit) {
      const arvo = soluArvo(rivi, vanha);
      const muunnettu = normalisoiArvo(arvo, uusi.type);
      if (arvo && muunnettu !== arvo) patchit.push(...asetaSolu(rivi, vanha, muunnettu));
    }
  }
  return patchit;
}

/** Koko taulukon korvaus (tuonti). */
export const korvaaTaulukko = (sarakkeet: Sarake[], rivit: Rivi[]): FormPatch[] => [
  set(sarakkeet, ["columns"]),
  set(rivit, ["rows"]),
];
