/**
 * Saman ravintolan tunnistus nimestä ja kaupungista.
 *
 * Kun klubilaiset arvostelevat yhdessä uuden ravintolan, sama paikka voi tulla
 * eri kirjoitusasuilla ("Ravintola Savu", "savu", "Savu!"). Vertailuavain
 * ohittaa kirjainkoon, ääkköset, välimerkit ja yleissanat (ravintola,
 * restaurant, oy …), jolloin nämä ovat sama ravintola. Eri nimiä ("Savu" ja
 * "Savu Bistro") ei yhdistetä: ne voivat olla eri paikkoja, ja sihteeri
 * ratkaisee ne Studiossa.
 *
 * Käyttäjät (sama sääntö kaikkialla):
 * - arvostelun lähetys (actions.ts): ehdotus liitetään hakemiston ravintolaan
 *   tai yhdenmukaistetaan aiemman odottavan ehdotuksen kanssa
 * - "Hyväksy ja luo ravintola" (sanity/actions): ei kaksoiskappaletta, vaikka
 *   lähetykset olisivat tulleet täsmälleen yhtä aikaa
 * - arvostelun ravintolavaihe: sama ehdotus näkyy kerran
 *
 * Puhdas moduuli: testit npm run test:arvostelu.
 */
import { normalizeSearch } from "./haku";

/** Paikan tyyppiä kuvaavat sanat, jotka eivät erota ravintoloita toisistaan. */
const YLEISSANAT = new Set([
  "ravintola",
  "restaurant",
  "restaurante",
  "ristorante",
  "restoran",
  "oy",
  "ab",
  "ky",
  "the",
]);

/** "Ravintola Savu Oy" → "savu". Pelkistä yleissanoista koostuva nimi säilyy. */
export function nimiAvain(nimi: string): string {
  const sanat = normalizeSearch(nimi).split(" ").filter(Boolean);
  const merkitsevat = sanat.filter((s) => !YLEISSANAT.has(s));
  return (merkitsevat.length ? merkitsevat : sanat).join(" ");
}

/** "Hämeenlinna" ja "hameenlinna" → "hameenlinna". */
export function kaupunkiAvain(kaupunki: string): string {
  return normalizeSearch(kaupunki);
}

/** Vertailuavain nimestä ja kaupungista: "savu|lahti". */
export function ravintolaAvain(nimi: string, kaupunki: string): string {
  return `${nimiAvain(nimi)}|${kaupunkiAvain(kaupunki)}`;
}
