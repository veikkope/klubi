/**
 * Viikoittaisen varmuuskopion säännöt (app/api/varmuuskopio, docs/17 §D).
 *
 * Varmuuskopio tallennetaan Sanityyn, jonka ilmaistason datasetti on julkinen:
 * tallennettu tiedosto on teknisesti ladattavissa, jos sen osoite tiedetään.
 * Siksi kopioon otetaan vain julkaistu sisältö, joka näkyy jo sivustolla.
 * Luonnokset (esim. hyväksymättömät arvostelut) ja julkaisuversiot jäävät pois.
 *
 * Puhdas moduuli: testataan komennolla `npm run test:varmuuskopio`.
 */

/** Montako viikkokopiota säilytetään (≈ kolme kuukautta). */
export const SAILYTETTAVAT = 12;

export const VARMUUSKOPIO_TYYPPI = "varmuuskopio";
export const TIEDOSTON_ETULIITE = "varmuuskopio-";

type Dokumentti = { _id?: string; _type?: string; originalFilename?: string };

/**
 * Otetaanko dokumentti kopioon: vain julkaistut, ei itse varmuuskopioita eikä
 * niiden tiedostoja (kopio ei kasva jokaisella kerralla edellisten verran).
 * Ei myöskään Sanityn järjestelmädokumentteja (`_.groups.*`: käyttöoikeusryhmät
 * jäsenineen, `_.retention.*`): ne eivät ole julkisia eikä niitä palauteta.
 */
export function kuuluuKopioon(doc: Dokumentti): boolean {
  const id = doc._id ?? "";
  if (!id || id.startsWith("drafts.") || id.startsWith("versions.") || id.startsWith("_.")) return false;
  if (doc._type?.startsWith("system.")) return false;
  if (doc._type === VARMUUSKOPIO_TYYPPI) return false;
  if (doc._type === "sanity.fileAsset" && doc.originalFilename?.startsWith(TIEDOSTON_ETULIITE)) return false;
  return true;
}

/** Suodattaa Export API:n NDJSON-vastauksen. Palauttaa rivit ja määrän. */
export function suodataVienti(ndjson: string): { rivit: string[]; maara: number } {
  const rivit: string[] = [];
  for (const rivi of ndjson.split("\n")) {
    if (!rivi.trim()) continue;
    const doc = JSON.parse(rivi) as Dokumentti;
    if (kuuluuKopioon(doc)) rivit.push(rivi);
  }
  return { rivit, maara: rivit.length };
}

/** Kopion päiväys Helsingin aikaa: 2026-10-05. */
export function kopionPaiva(nyt: Date): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Helsinki" }).format(nyt);
}

/** Poistettavat kopiot: kaikki uusimpien `SAILYTETTAVAT` jälkeen (lista uusin ensin). */
export function poistettavat<T extends { paiva: string }>(kopiot: T[], sailytettavat = SAILYTETTAVAT): T[] {
  return [...kopiot].sort((a, b) => b.paiva.localeCompare(a.paiva)).slice(sailytettavat);
}
