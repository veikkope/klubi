/**
 * Kommentti- ja veikkauslomakkeen jaettu tila ja tyypit (docs/15).
 *
 * Omassa moduulissaan, koska `actions.ts` on `"use server"` eikä saa viedä muuta
 * kuin asynkronisia funktioita. Palvelintoiminto, validointi ja lomake lukevat
 * kenttänimet täältä.
 */

import type { Kommentointi } from "@/lib/types";

export type { KommenttiItem, Kommentointi, KommentointiTyyppi } from "@/lib/types";

export type KommenttiField = "nimi" | "teksti" | "veikkaus" | "maalikuningas";

export const KOMMENTTI_FIELD_LABELS: Record<KommenttiField, string> = {
  nimi: "Nimi",
  teksti: "Kommentti",
  veikkaus: "Veikkaus",
  maalikuningas: "Maalikuningas",
};

export const NIMI_MAX = 40;
export const TEKSTI_MAX = 1000;
export const VEIKKAUS_MAX = 60;

export type KommenttiFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<Record<KommenttiField, string>>;
  /**
   * Syötetyt arvot virhetilanteessa, jotta mitään ei tarvitse kirjoittaa
   * uudelleen. Veikkaus järjestettynä listana (sija 1 ensin).
   */
  values: {
    nimi: string;
    teksti: string;
    jarjestys: string[];
    maalikuningas: string;
  };
  /** Kasvaa jokaisella onnistuneella lähetyksellä: lomake tyhjennetään. */
  lahetyksia: number;
};

export const INITIAL_KOMMENTTI_STATE: KommenttiFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  values: { nimi: "", teksti: "", jarjestys: [], maalikuningas: "" },
  lahetyksia: 0,
};

/** Onko kommentointi auki nyt? */
export function kommentointiAuki(k: Kommentointi | null | undefined, now = new Date()): boolean {
  if (!k?.kaytossa) return false;
  if (k.sulkeutuu && new Date(k.sulkeutuu).getTime() <= now.getTime()) return false;
  return true;
}

/** Sijoitusten määrä veikkauksessa (kommentissa 0). */
export function sijojenMaara(k: Kommentointi): number {
  if (k.tyyppi === "sarjajarjestys") return k.vaihtoehdot?.length ?? 0;
  if (k.tyyppi === "voittajaveikkaus") return Math.min(10, Math.max(1, k.sijoituksia ?? 4));
  return 0;
}

/** Kommenttilistan välimuistitagi (haku ja `updateTag` lähetyksen jälkeen). */
export function kommentitTag(uutinenId: string): string {
  return `kommentit:${uutinenId}`;
}

export function kommenttiFieldId(field: KommenttiField): string {
  return `kommentti-${field}`;
}

export function kommenttiErrorId(field: KommenttiField): string {
  return `kommentti-${field}-virhe`;
}
