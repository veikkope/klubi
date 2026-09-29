/**
 * Arvostelulomakkeen jaettu tila.
 *
 * Omassa moduulissaan, koska `actions.ts` on merkitty `"use server"` eikä
 * sellainen tiedosto saa viedä muuta kuin asynkronisia funktioita. Sekä
 * palvelintoiminto että lomakekomponentti lukevat nämä täältä, jolloin
 * kenttänimet ja virheavaimet ovat yhdessä paikassa.
 *
 * Arvosteltava ravintola on joko hakemistosta valittu (`ravintola` = id) tai
 * kävijän ehdottama uusi ravintola (`uusi` = "1" ja `uusi*`-kentät).
 */

export const REVIEW_FIELDS = [
  "ravintola",
  "uusiNimi",
  "uusiKaupunki",
  "uusiMaa",
  "uusiLisatieto",
  "ruoka",
  "hinta",
  "viihtyvyys",
  "kommentti",
  "nimi",
] as const;

export type ReviewField = (typeof REVIEW_FIELDS)[number];

export const REVIEW_FIELD_LABELS: Record<ReviewField, string> = {
  ravintola: "Ravintola",
  uusiNimi: "Ravintolan nimi",
  uusiKaupunki: "Kaupunki",
  uusiMaa: "Maa",
  uusiLisatieto: "Osoite tai verkkosivu",
  ruoka: "Ruoka",
  hinta: "Hinta",
  viihtyvyys: "Viihtyvyys",
  kommentti: "Arvostelu",
  nimi: "Nimesi",
};

export type ReviewValues = Record<ReviewField, string> & {
  /** "1", kun kävijä ehdottaa uutta ravintolaa. */
  uusi: string;
};

export type ReviewFormState = {
  status: "idle" | "success" | "error";
  /** Koko lomaketta koskeva viesti (onnistuminen tai tekninen virhe). */
  message: string | null;
  fieldErrors: Partial<Record<ReviewField, string>>;
  /** Syötetyt arvot, jotta käyttäjän ei tarvitse kirjoittaa niitä uudelleen. */
  values: ReviewValues;
  /** Onnistuneen lähetyksen ravintola kiitosviestiä varten. */
  restaurantName?: string;
};

export const EMPTY_REVIEW_VALUES: ReviewValues = {
  ravintola: "",
  uusi: "",
  uusiNimi: "",
  uusiKaupunki: "",
  uusiMaa: "Suomi",
  uusiLisatieto: "",
  ruoka: "",
  hinta: "",
  viihtyvyys: "",
  kommentti: "",
  nimi: "",
};

export const INITIAL_REVIEW_STATE: ReviewFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  values: EMPTY_REVIEW_VALUES,
};

/**
 * Arvosana annetaan kolmesta osa-alueesta kuten klubin omissa arvioissa.
 * Kokonaisarvosana on niiden keskiarvo (lasketaan kyselyssä, ei tallenneta).
 * `schemaField` on vastaava kenttä Sanityn `ravintolaKayttajaArvostelu`-tyypissä.
 */
export const RATING_FIELDS = [
  { field: "ruoka", schemaField: "ratingFood", hint: "Maku, laatu ja annokset" },
  { field: "hinta", schemaField: "ratingPrice", hint: "Vastine rahalle: 5 = erinomainen hinta-laatusuhde" },
  { field: "viihtyvyys", schemaField: "ratingAtmosphere", hint: "Tunnelma, palvelu ja miljöö" },
] as const satisfies readonly { field: ReviewField; schemaField: string; hint: string }[];

export const COMMENT_MIN = 10;
export const COMMENT_MAX = 1000;

/** Lomakekentän id — sama sekä `<label for>`:ssä että virhelinkissä. */
export function reviewFieldId(field: ReviewField): string {
  return `arvostelu-${field}`;
}

export function reviewErrorId(field: ReviewField): string {
  return `arvostelu-${field}-virhe`;
}

/**
 * Hakuvertailun normalisointi: pienet kirjaimet, ei diakriittejä eikä
 * välimerkkejä ("Hämeenlinna" löytyy haulla "hameenlinna", "Café" haulla "cafe").
 * Käytetään sekä haussa että palvelimella kaksoiskappaleiden tunnistamisessa.
 */
export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fi-FI")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
