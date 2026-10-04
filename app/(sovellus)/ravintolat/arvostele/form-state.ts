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
  "kayntipaiva",
  "ruoka",
  "hinta",
  "viihtyvyys",
  "kommentti",
  "kuvat",
  "nimi",
] as const;

export type ReviewField = (typeof REVIEW_FIELDS)[number];

export const REVIEW_FIELD_LABELS: Record<ReviewField, string> = {
  ravintola: "Ravintola",
  uusiNimi: "Ravintolan nimi",
  uusiKaupunki: "Kaupunki",
  uusiMaa: "Maa",
  uusiLisatieto: "Osoite tai verkkosivu",
  kayntipaiva: "Käyntipäivä",
  ruoka: "Ruoka",
  hinta: "Hinta",
  viihtyvyys: "Viihtyvyys",
  kommentti: "Arvostelu",
  kuvat: "Kuvat",
  nimi: "Nimesi",
};

/**
 * Lomakkeelle palautettavat tekstiarvot. Kuvat eivät kulje palvelimen kautta
 * takaisin: ne pysyvät selaimen muistissa (review-form.tsx), joten virheen
 * jälkeen kävijän ei tarvitse valita niitä uudelleen.
 */
export type ReviewValues = Record<Exclude<ReviewField, "kuvat">, string> & {
  /** "1", kun kävijä ehdottaa uutta ravintolaa. */
  uusi: string;
  /** Valitun klubilaisen `_id`; tyhjä, kun arvostelija ei ole klubilainen. */
  klubilainen: string;
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
  // Tyhjä = tämä päivä: lomake täyttää sen selaimessa, palvelin varmistaa.
  kayntipaiva: "",
  ruoka: "",
  hinta: "",
  viihtyvyys: "",
  kommentti: "",
  nimi: "",
  klubilainen: "",
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
  { field: "ruoka", schemaField: "ratingFood", hint: "Maku, laatu, annokset" },
  { field: "hinta", schemaField: "ratingPrice", hint: "Hinta-laatu, 5 = erinomainen" },
  { field: "viihtyvyys", schemaField: "ratingAtmosphere", hint: "Tunnelma, palvelu, miljöö" },
] as const satisfies readonly { field: ReviewField; schemaField: string; hint: string }[];

/** Osa-alueen arvosana 1,0–5,0 yhden desimaalin tarkkuudella. */
export const RATING_MIN = 1;
export const RATING_MAX = 5;

/** Laitteelle muistettu arvostelija (localStorage), ettei nimeä kysytä joka kerta. */
export const ARVOSTELIJA_AVAIN = "klubi.arvostelija";

export type Arvostelija = {
  /** Klubilaisen `_id`; tyhjä, kun arvostelija ei ole klubilainen. */
  klubilainen: string;
  nimi: string;
};

/** Vanhin hyväksyttävä käyntipäivä (klubin ensimmäiset ravintolakäynnit). */
export const KAYNTIPAIVA_MIN = "1990-01-01";

const helsinkiPaiva = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Helsinki",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Tämä päivä Helsingin aikaa, "YYYY-MM-DD" (sama selaimessa ja palvelimella). */
export function tanaan(): string {
  return helsinkiPaiva.format(new Date());
}

/**
 * Käyntipäivän tarkistus. Palauttaa virheilmoituksen tai null.
 * Päivä ei saa olla tulevaisuudessa eikä ennen `KAYNTIPAIVA_MIN`-päivää.
 */
export function kayntipaivaVirhe(arvo: string, tama = tanaan()): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(arvo);
  const paiva = m ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))) : null;
  if (!paiva || paiva.toISOString().slice(0, 10) !== arvo) return "Anna käyntipäivä muodossa pp.kk.vvvv.";
  if (arvo > tama) return "Käyntipäivä ei voi olla tulevaisuudessa.";
  if (arvo < KAYNTIPAIVA_MIN) return "Tarkista käyntipäivän vuosi.";
  return null;
}

/** Arvosteluteksti on vapaaehtoinen; pelkät arvosanat riittävät. */
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
