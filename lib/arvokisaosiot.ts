/**
 * Arvokisat-sivun mitalitaulukoiden sijoitus kisatyypin osioon.
 *
 * Asiakkaan toive 27.11.2026: MM- ja EM-kisojen mitalitaulukot (ja MM-taulukon
 * keski-ikäkaavio) näkyvät oman osionsa ensimmäisenä, eivät erillisessä
 * Mitalistit-osiossa sivun lopussa. Taulukko tunnistetaan osoitteen (slug)
 * alusta: "mm-kisojen-mitalistit" → MM-kisat. Taulukko, jota ei tunnisteta,
 * näkyy edelleen sivun lopussa Mitalistit-otsikon alla, joten mikään ei katoa.
 */

import type { Kisatyyppi } from "@/sanity/lib/queries/arkisto-laajennus";

/** Tyypitetty Kisatyyppiin: kirjoitusvirhe kohteessa on käännösvirhe, ei kadonnut taulukko. */
const ETULIITTEET: readonly (readonly [string, Kisatyyppi])[] = [
  ["mm-", "mm"],
  ["em-", "em"],
  ["kansojen-liiga", "kansojen-liiga"],
  ["u21-", "u21-em"],
  ["alle-21", "u21-em"],
  ["pikkuhuuhka", "u21-em"],
  ["olympia", "olympialaiset"],
];

/** Kisatyyppi, jonka osioon taulukko kuuluu, tai null (jää Mitalistit-osioon). */
export function taulukonKisatyyppi(slug: string | null | undefined): Kisatyyppi | null {
  if (!slug) return null;
  const s = slug.toLowerCase();
  return ETULIITTEET.find(([alku]) => s.startsWith(alku))?.[1] ?? null;
}
