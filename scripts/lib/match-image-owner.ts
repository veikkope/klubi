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
 *
 * `fold`, `scoreMatch` ja `bestOwner` ovat alkuperäinen rajapinta (myös muut
 * putket käyttävät `fold`ia). `rankOwners` on korjauskierroksen tarkempi
 * vertailu: lyhyet nimet (Kuu, C, MA), kirjoitusvirheet (Tocororo/Tocoroco),
 * osoite (PlazaMayor) ja tasapelien tunnistus.
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
  "restaurante",
  "ristorante",
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

// ── Tarkempi vertailu (korjauskierros 1) ──────────────────────────────────────

export interface OwnerOption extends OwnerCandidate {
  /** Katuosoite: "Plaza Mayor, Madrid" → PlazaMayor-kuva. */
  address?: string;
  /** Kaupunki: poistetaan tiedostonimestä ennen nimen vertailua ja käytetään tasapelin ratkaisuun. */
  city?: string;
  /** Käyntipäivät ISO-muodossa: tiedostonimen päiväys ratkaisee samannimisten tasapelin. */
  visits?: string[];
}

/** Tiedostonimen yleiset etuliitteet ja lyhenteet, jotka eivät kerro omistajasta. */
const FILE_NOISE = ["ruokailu"];
/** Kaupunkien lyhenteet tiedostonimissä. */
const CITY_ABBREVIATIONS: Record<string, string[]> = { lappeenranta: ["lpr"] };

/** Levenshtein-etäisyys enintään `max`; palauttaa max+1 jos ylittyy. */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Löytyykö sana tiedostonimestä, kirjoitusvirheen salliva (≥ 6 merkin sanoilla 1 merkki). */
function fuzzyIncludes(haystack: string, word: string): boolean {
  if (haystack.includes(word)) return true;
  if (word.length < 6) return false;
  for (let len = word.length - 1; len <= word.length + 1; len++) {
    for (let i = 0; i + len <= haystack.length; i++) {
      if (distance(haystack.slice(i, i + len), word, 1) <= 1) return true;
    }
  }
  return false;
}

function significantWords(text: string): string[] {
  return text
    .split(/[\s/,&'’().-]+/)
    .map(fold)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
}

/** Tiedostonimi ilman päätettä, päiväystä, etuliitettä ja kaupunkia: "ruokailuraxhelsinki141019.jpg" → "rax". */
function residue(file: string, cities: string[]): string {
  let r = fold(file.replace(/\.[a-z0-9]+(\.[a-z0-9]+)?$/i, ""));
  r = r.replace(/\d+[a-z]?$/, "").replace(/^\d+/, "");
  for (const noise of FILE_NOISE) if (r.startsWith(noise)) r = r.slice(noise.length);
  for (const city of cities) {
    for (const token of [fold(city), ...(CITY_ABBREVIATIONS[fold(city)] ?? [])]) {
      if (!token) continue;
      if (r.startsWith(token)) r = r.slice(token.length);
      if (r.endsWith(token)) r = r.slice(0, -token.length);
    }
  }
  return r.replace(/\d+/g, "");
}

/** Tiedostonimen camelCase-osat: "ruokailuCTampere190905" → ["ruokailu", "c", "tampere"]. */
function camelTokens(file: string): string[] {
  return file
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/([a-zåäö0-9])([A-ZÅÄÖ])/g, "$1 $2")
    .replace(/([A-ZÅÄÖ]+)([A-ZÅÄÖ][a-zåäö])/g, "$1 $2")
    .replace(/(\d+)/g, " $1 ")
    .split(/[\s_+-]+/)
    .map(fold)
    .filter(Boolean);
}

/**
 * Päiväys tiedostonimestä ISO-muodossa. Kuvaajan käytäntö on yymmdd
 * ("ruokailulahti…161113" = 2016-11-13), vanhimmissa ddmmyy tai ddmmyyyy.
 * Palauttaa kaikki kelvolliset tulkinnat.
 */
export function fileDates(file: string): string[] {
  const out: string[] = [];
  const valid = (y: number, m: number, d: number) => m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1990 && y <= 2030;
  const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  for (const [, digits] of file.matchAll(/(?<!\d)(\d{6}|\d{8})(?!\d)/g)) {
    const n = digits.match(/\d\d/g)!.map(Number);
    if (digits.length === 8) {
      const [a, b, c, d] = n;
      if (valid(c * 100 + d, b, a)) out.push(iso(c * 100 + d, b, a)); // ddmmyyyy
      if (valid(a * 100 + b, c, d)) out.push(iso(a * 100 + b, c, d)); // yyyymmdd
    } else {
      const [a, b, c] = n;
      if (valid(2000 + a, b, c)) out.push(iso(2000 + a, b, c)); // yymmdd
      if (valid(2000 + c, b, a)) out.push(iso(2000 + c, b, a)); // ddmmyy
    }
  }
  return out;
}

/**
 * Pisteytys: täsmällinen jäännös (3000) > lyhyt nimi camelCase-osana (900) >
 * nimen osuma, jossa pisteet = osuneiden merkkien määrä + oma kaupunki
 * tiedostonimessä (+10) + osoitteen sana (+10). Käyntipäivä tiedostonimessä
 * (+5000) ratkaisee aina: sama nimi ja sama päivä on vahvin mahdollinen näyttö.
 *
 * Osuneiden merkkien määrä (eikä "koko nimi löytyi" -bonus) ratkaisee, jotta
 * "McDonald's - Temple Row" voittaa pelkän "McDonald's":in tiedostossa
 * `ruokailuBirminghamMcDonaldsTempleStreet…`.
 */
function scoreOption(file: string, option: OwnerOption): number {
  const haystack = fold(file);
  const name = fold(option.name);
  const nameCore = significantWords(option.name).join("");
  const cityToken = option.city ? fold(option.city) : "";
  const cityBonus = cityToken && haystack.includes(cityToken) ? 10 : 0;
  const dates = fileDates(file);
  const dateBonus = option.visits?.some((v) => dates.includes(v)) ? 5000 : 0;

  // 1. Jäännös on täsmälleen nimi: "kuu021012" → Kuu, "raxhelsinki" → Rax.
  const rest = residue(file, [option.city ?? ""]);
  if (rest && (rest === name || (nameCore && rest === nameCore))) {
    return 3000 + rest.length + cityBonus + dateBonus;
  }

  // 2. Lyhyt nimi omana camelCase-osanaan: "ruokailuCTampere" → C, "PietariMA" → MA.
  if (name.length > 0 && name.length < 4 && camelTokens(file).includes(name)) {
    return 900 + cityBonus + dateBonus;
  }

  // 3. Koko nimi tai riittävä osa sanoista (kirjoitusvirheet sallien).
  //    Pelkkä kaupunki EI ole nimen osuma: "Valo / Savonlinna" ei omista
  //    kuvaa `ruokailuSavonlinnaSarastro250724.jpg` vain siksi, että
  //    kaupunki on sekä nimessä että tiedostonimessä. Siksi kaupunkisana
  //    poistetaan nimen sanoista ja kaupunki tiedostonimestä ennen sanavertailua
  //    (myös taivutettu "Savonlinnan" osuisi muuten sumeasti "savonlinna"an).
  //    Kaupunki vaikuttaa vain `cityBonus`-lisänä, kun nimi on jo osunut.
  let nameScore = 0;
  if (name.length >= 4 && haystack.includes(name)) {
    nameScore = name.length;
  } else {
    const cityTokens = cityToken ? [cityToken, ...(CITY_ABBREVIATIONS[cityToken] ?? [])] : [];
    const nameHaystack = cityTokens.reduce((h, t) => h.split(t).join("##"), haystack);
    const words = significantWords(option.name).filter((w) => !cityTokens.includes(w));
    const hits = words.filter((w) => fuzzyIncludes(nameHaystack, w));
    const firstHit = words.length > 0 && hits.includes(words[0]) && words[0].length >= 6;
    if (hits.length > 0 && (hits.length / words.length >= 0.5 || firstHit)) {
      nameScore = hits.reduce((s, w) => s + w.length, 0);
    }
  }

  // 4. Osoite: "Plaza Mayor, Madrid" → PlazaMayor; myös tasapelin ratkaisija.
  const addressWords = significantWords(option.address ?? "").filter(
    (w) => w !== cityToken && !/\d/.test(w),
  );
  const addressHits = addressWords.filter((w) => haystack.includes(w));
  const addressScore = addressHits.reduce((s, w) => s + w.length, 0);

  if (nameScore > 0) return nameScore + (addressScore > 0 ? 10 : 0) + cityBonus + dateBonus;
  if (addressWords.length >= 2 && addressHits.length === addressWords.length) {
    return addressScore + cityBonus + dateBonus;
  }
  return 0;
}

/**
 * Pisteyttää kaikki ehdokkaat. Palauttaa parhaat (useampi = tasapeli) tai
 * `null`, jos yksikään ei osu. `requireCity`: koostesivujen kuvissa omistaja
 * haetaan kaikista ravintoloista, joten vaaditaan täsmällinen nimi tai
 * nimi + kaupunki tiedostonimessä.
 */
export function rankOwners<T extends OwnerOption>(
  file: string,
  candidates: T[],
  options: { requireCity?: boolean } = {},
): { score: number; ties: T[] } | null {
  let bestScore = 0;
  let ties: T[] = [];
  for (const candidate of candidates) {
    let score = scoreOption(file, candidate);
    if (options.requireCity && score > 0 && score < 3000) {
      const city = candidate.city ? fold(candidate.city) : "";
      if (!city || !fold(file).includes(city)) score = 0;
    }
    if (score > bestScore) {
      bestScore = score;
      ties = [candidate];
    } else if (score > 0 && score === bestScore) {
      ties.push(candidate);
    }
  }
  return bestScore > 0 ? { score: bestScore, ties } : null;
}
