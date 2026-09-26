/**
 * Arvostelulomakkeen jaettu tila.
 *
 * Omassa moduulissaan, koska `actions.ts` on merkitty `"use server"` eikä
 * sellainen tiedosto saa viedä muuta kuin asynkronisia funktioita. Sekä
 * palvelintoiminto että lomakekomponentti lukevat nämä täältä, jolloin
 * kenttänimet ja virheavaimet ovat yhdessä paikassa.
 */

export const REVIEW_FIELDS = [
  "ravintola",
  "nimi",
  "sahkoposti",
  "tahdet",
  "kommentti",
] as const;

export type ReviewField = (typeof REVIEW_FIELDS)[number];

export const REVIEW_FIELD_LABELS: Record<ReviewField, string> = {
  ravintola: "Ravintola",
  nimi: "Nimi",
  sahkoposti: "Sähköposti",
  tahdet: "Arvosana",
  kommentti: "Arvostelu",
};

export type ReviewFormState = {
  status: "idle" | "success" | "error";
  /** Koko lomaketta koskeva viesti (onnistuminen tai tekninen virhe). */
  message: string | null;
  fieldErrors: Partial<Record<ReviewField, string>>;
  /** Syötetyt arvot, jotta käyttäjän ei tarvitse kirjoittaa niitä uudelleen. */
  values: Record<ReviewField, string>;
};

export const EMPTY_REVIEW_VALUES: Record<ReviewField, string> = {
  ravintola: "",
  nimi: "",
  sahkoposti: "",
  tahdet: "",
  kommentti: "",
};

export const INITIAL_REVIEW_STATE: ReviewFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  values: EMPTY_REVIEW_VALUES,
};

/** Lomakekentän id — sama sekä `<label for>`:ssä että virhelinkissä. */
export function reviewFieldId(field: ReviewField): string {
  return `arvostelu-${field}`;
}

export function reviewErrorId(field: ReviewField): string {
  return `arvostelu-${field}-virhe`;
}
