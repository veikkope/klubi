import { slugify } from "./slugify";

/**
 * Maa- tai aluetason viite: kaupunkidokumentti, jonka nimi on maan nimi
 * ("Portugali", "Ruotsi", "Venäjä"). Ravintolaputki käyttää niitä, kun
 * ravintolan kaupunki ei selviä lähteestä (`scripts/import-ravintolat.ts`).
 * Ne eivät ole kaupunkeja, joten kaupunkisuodatin ei tarjoa niitä eikä
 * ohjausgeneraattori ohjaa niihin `?kaupunki=`-parametrilla; ravintolat
 * löytyvät maasuodattimella. Sääntö johdetaan datasta, joten erillistä
 * lippukenttää (jota isän pitäisi muistaa ylläpitää) ei tarvita.
 */
export function isCountryLevelPlace(place: { name?: string | null; country?: string | null }): boolean {
  return Boolean(place.name && place.country && slugify(place.name) === slugify(place.country));
}
