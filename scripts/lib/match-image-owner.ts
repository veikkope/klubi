/**
 * Päättelee, kenelle kuva kuuluu tiedostonimen perusteella.
 *
 * Miksi tätä tarvitaan: jäsennin liittää kuvan siihen ravintolaan, joka oli
 * käsittelyssä kun kuva kohdattiin. Osalla vanhoista sivuista kuvat ovat
 * samalla rivillä ravintolan kanssa (liitos oikein), osalla ne on koottu
 * listan loppuun (kaikki päätyvät viimeiselle ravintolalle — väärin).
 *
 * Tiedostonimet ovat kuvaajan omia kuvauksia, esim.
 * `ruokailulontoo131226McDonaldsFulham.JPG`, joten oikea omistaja löytyy
 * nimestä luotettavammin kuin sijainnista sivulla.
 */

/** Pelkistää vertailua varten: pienet kirjaimet, ei ääkkösiä, ei välimerkkejä. */
export function fold(input: string): string {
  return input
    .toLowerCase()
    .replace(/[äå]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]/g, "");
}

/** Sanat, jotka eivät yksilöi ravintolaa ja jotka jätetään vertailusta pois. */
const STOPWORDS = new Set([
  "ravintola",
  "restaurant",
  "cafe",
  "kahvila",
  "bar",
  "baari",
  "hotel",
  "hotelli",
  "pizzeria",
  "grill",
  "grilli",
  "the",
  "and",
]);

/**
 * Pisteyttää nimen ja tiedostonimen vastaavuuden.
 *
 * 0 = ei osumaa. Suurempi luku = varmempi ja tarkempi osuma, jolloin
 * pisimmän osuman voittaja on oikea silloin kun kaksi ravintolaa osuu samaan
 * tiedostoon (esim. "Rosso" ja "Rosso Lahti").
 */
export function scoreMatch(name: string, file: string): number {
  const haystack = fold(file);
  const folded = fold(name);
  if (folded.length >= 4 && haystack.includes(folded)) {
    // Koko nimi löytyy — vahvin mahdollinen osuma.
    return 1000 + folded.length;
  }

  const words = name
    .split(/[\s/,&'’-]+/)
    .map(fold)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
  if (words.length === 0) return 0;

  const hits = words.filter((w) => haystack.includes(w));
  if (hits.length === 0) return 0;
  if (hits.length / words.length < 0.5) return 0;

  return hits.reduce((sum, w) => sum + w.length, 0);
}

export interface OwnerCandidate {
  key: string;
  name: string;
}

/**
 * Valitsee parhaan omistajan. Palauttaa `null` jos yksikään ei osu — silloin
 * kuva jätetään mieluummin liittämättä kuin arvataan väärin.
 */
export function bestOwner(
  file: string,
  candidates: OwnerCandidate[],
): OwnerCandidate | null {
  let best: OwnerCandidate | null = null;
  let bestScore = 0;

  for (const candidate of candidates) {
    const score = scoreMatch(candidate.name, file);
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best;
}
