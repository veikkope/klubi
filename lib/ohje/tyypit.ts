/**
 * Ylläpito-ohjeen tietomalli (docs/25, lähde docs/ohje/, kirjoitusohje docs/ohje/README.md).
 *
 * Puhdas moduuli: Studio (sanity/components/ohjeet), koostaja
 * (scripts/ohje-koosta.ts) ja testi (scripts/test-ohje.ts) käyttävät samoja tyyppejä.
 */

/** Kortin rakenne: mitä test:ohje vaatii (docs/ohje/README.md). */
export type KortinMuoto = "pikaopas" | "tehtava" | "vianetsinta" | "vapaa";

export type OhjeOsionMaarittely = {
  /** Osion tunnus = kansion nimi docs/ohje/-kansiossa (pikaopas: tiedosto pikaopas.md). */
  id: string;
  otsikko: string;
  /** Oletusmuoto osion korteille (frontmatterin `muoto` voi ohittaa). */
  muoto: KortinMuoto;
};

/** Osiot Ohjeet-työkalun sisällysluettelon järjestyksessä (docs/25 "Uusi rakenne"). */
export const OHJE_OSIOT: readonly OhjeOsionMaarittely[] = [
  { id: "pikaopas", otsikko: "Pikaopas", muoto: "pikaopas" },
  { id: "alkuun", otsikko: "Alkuun", muoto: "tehtava" },
  { id: "tekstit", otsikko: "Tekstit ja kuvat", muoto: "tehtava" },
  { id: "uutiset", otsikko: "Uutiset", muoto: "tehtava" },
  { id: "arkisto", otsikko: "Jalkapalloarkisto", muoto: "tehtava" },
  { id: "ravintolat", otsikko: "Ravintolat", muoto: "tehtava" },
  { id: "ottelut", otsikko: "Ottelut ja tapahtumat", muoto: "tehtava" },
  { id: "klubi", otsikko: "Klubi", muoto: "tehtava" },
  { id: "sivusto", otsikko: "Sivusto", muoto: "tehtava" },
  { id: "turvaverkko", otsikko: "Turvaverkko", muoto: "tehtava" },
  { id: "vianetsinta", otsikko: "Vianetsintä", muoto: "vianetsinta" },
  { id: "hakuteos", otsikko: "Hakuteos", muoto: "vapaa" },
];

export type OhjeOtsikko = {
  /** Ankkuri (HTML:n id). */
  id: string;
  teksti: string;
  taso: number;
};

export type OhjeKortti = {
  /** Tiedostonimi ilman .md-päätettä; uniikki koko ohjeessa. */
  id: string;
  otsikko: string;
  /** Osion tunnus (OHJE_OSIOT). */
  osio: string;
  avainsanat: string[];
  /** Skeematyypit, joiden Ohje-paneelissa kortti näkyy. */
  tyypit: string[];
  kesto: string | null;
  paivitetty: string | null;
  /** Studion HTML (markdown-it, html: false: lähteen raaka-HTML on escapattu). */
  html: string;
  /** Pelkkä teksti hakua varten. */
  teksti: string;
  otsikot: OhjeOtsikko[];
};

export type OhjeOsio = {
  id: string;
  otsikko: string;
  kortit: OhjeKortti[];
};

export type OhjeSisalto = {
  /** Sisällön tiiviste: muuttuu vain, kun sisältö muuttuu. */
  versio: string;
  osiot: OhjeOsio[];
};

/** Studion ja tulosteen julkiset polut (public/studio-ohje/). */
export const OHJE_JULKINEN_POLKU = "/studio-ohje";
export const OHJE_PDF = `${OHJE_JULKINEN_POLKU}/yllapito-ohje.pdf`;
export const PIKAOPAS_PDF = `${OHJE_JULKINEN_POLKU}/pikaopas.pdf`;
export const OHJE_TULOSTE = `${OHJE_JULKINEN_POLKU}/ohje.html`;
/** Ohjeet-työkalun polku Studiossa. */
export const OHJEET_TYOKALU = "/studio/ohjeet";
