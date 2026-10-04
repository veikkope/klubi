/**
 * Uutishaun hakusanat (sanity/lib/queries/uutiset.ts → uutisetHakuQuery).
 *
 * Haku tehdään Sanityn GROQ-tekstihaulla (`match` + `score`): ei erillistä
 * hakuindeksiä eikä ulkoista palvelua, joten Studiossa julkaistu uutinen löytyy
 * heti. GROQ ei tunne suomen taivutusta, joten pitkistä sanoista käytetään
 * alkuosaa: "huuhkajat" → `huuhkaj*` löytää myös "Huuhkajien" ja "Huuhkajille".
 * Kaikkien sanojen pitää löytyä (otsikosta, ingressistä tai tekstistä).
 *
 * Puhdas moduuli: testataan komennolla `npm run test:haku`.
 */

/** Hakukentän enimmäispituus ja sanojen enimmäismäärä (kohtuullinen kysely). */
export const HAKU_MAX_PITUUS = 100;
export const HAKU_MAX_SANAT = 6;
/** Lyhyempi sana ei rajaa mitään järkevästi (esim. "fc" kyllä, "a" ei). */
const MIN_SANA = 2;

/** Käyttäjän syöte siistittynä (näytetään sivulla ja pidetään URL:ssa). */
export function siistiHaku(syote: string | undefined | null): string {
  return (syote ?? "").replace(/\s+/g, " ").trim().slice(0, HAKU_MAX_PITUUS);
}

/**
 * Suomen taivutuksen karkea huomiointi: pitkästä sanasta pudotetaan loppu,
 * jolloin päätteet ja monikot osuvat. Lyhyet sanat ja luvut sellaisenaan.
 */
function alkuosa(sana: string): string {
  if (/^\d+$/.test(sana)) return sana;
  if (sana.length >= 7) return sana.slice(0, -2);
  if (sana.length >= 5) return sana.slice(0, -1);
  return sana;
}

/**
 * GROQ `match` -kuviot: ["huuhkaj*", "fc*"]. Tyhjä lista = ei hakua.
 * Erikoismerkit (myös GROQ:n `*`) poistetaan, joten syöte ei voi muuttaa kyselyä.
 */
export function hakusanat(syote: string | undefined | null): string[] {
  const sanat = siistiHaku(syote)
    .toLocaleLowerCase("fi")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/[\s-]+/)
    .filter((sana) => sana.length >= MIN_SANA);
  return [...new Set(sanat)].slice(0, HAKU_MAX_SANAT).map((sana) => `${alkuosa(sana)}*`);
}

/**
 * Selaimessa tehtävän haun vertailumuoto: pienet kirjaimet, ei diakriittejä
 * eikä välimerkkejä ("Hämeenlinna" löytyy haulla "hameenlinna", "Café" haulla
 * "cafe"). Ravintola-arvostelun haku ja odottavien ravintoloiden haku käyttävät
 * tätä, samoin palvelin uuden ravintolan kaksoiskappaleen tunnistamisessa.
 */
export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fi-FI")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
