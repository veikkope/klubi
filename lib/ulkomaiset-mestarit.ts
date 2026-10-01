/**
 * Ulkomaiset mestarit -sivun maat. Yksi totuus kolmelle käyttäjälle: Sanity-
 * skeeman valintalista (`jalkapalloTilasto.mestaruusmaa`), reititys
 * (`lib/path.ts`) ja sivut (`app/(public)/jalkapalloarkisto/ulkomaiset-mestarit`).
 *
 * `value` on sekä Sanityyn tallentuva arvo että pysyvä URL-segmentti
 * (/jalkapalloarkisto/ulkomaiset-mestarit/[maa]). Arvoa ei saa muuttaa:
 * vanhojen osoitteiden ohjaukset osoittavat siihen.
 *
 * Tiedosto ei tuo mitään muuta moduulia, jotta sitä voi käyttää sekä
 * Next.js-sovelluksesta, Studiosta että `tsx`-skripteistä.
 */

export interface Mestaruusmaa {
  /** Sanity-arvo ja URL-segmentti. */
  value: string;
  /** Valikon ja kortin nimi. */
  title: string;
  /** Sivun otsikko. */
  pageTitle: string;
  /** Kortin ja sivun johdanto. */
  lead: string;
  /** 120–160 merkkiä, kirjoitettu hakutulokseen. */
  description: string;
  /** Ennen `mestaruusmaa`-kenttää tuodut taulukot tunnistetaan slugista. */
  slugEtuliite: string;
}

export const ULKOMAISET_MESTARIT_PATH = "/jalkapalloarkisto/ulkomaiset-mestarit";

export const MESTARUUSMAAT: Mestaruusmaa[] = [
  {
    value: "englanti",
    title: "Englanti",
    pageTitle: "Englannin mestarit",
    lead:
      "Englannin liigamestarit, FA Cupin ja liigacupin voittajat vuosi vuodelta " +
      "sekä seurojen mestaruudet ja cupvoitot yhteensä.",
    description:
      "Englannin jalkapallomestarit vuosittain sekä seurojen liigamestaruudet, FA Cupin ja liigacupin voitot taulukoina.",
    slugEtuliite: "englannin-",
  },
  {
    value: "venaja",
    title: "Venäjä",
    pageTitle: "Venäjän mestarit",
    lead: "Venäjän ja Neuvostoliiton jalkapallomestarit ja cupin voittajat vuodesta 1936.",
    description:
      "Venäjän ja Neuvostoliiton jalkapallomestarit ja cupin voittajat vuosi vuodelta vuodesta 1936 taulukkona.",
    slugEtuliite: "venajan-",
  },
];

/** Maa, johon taulukko kuuluu, kun kenttä on tyhjä. */
export const MESTARUUSMAA_OLETUS = "englanti";

/**
 * Taulukon maa: kentän arvo, sen puuttuessa slugin etuliite
 * ("venajan-mestarit"), muuten oletusmaa.
 */
export function resolveMestaruusmaa(
  value: string | null | undefined,
  slug?: string | null,
): string {
  const clean = value?.trim();
  if (clean && MESTARUUSMAAT.some((maa) => maa.value === clean)) return clean;
  const fromSlug = MESTARUUSMAAT.find((maa) => slug?.startsWith(maa.slugEtuliite));
  return fromSlug?.value ?? MESTARUUSMAA_OLETUS;
}

export function findMestaruusmaa(value: string): Mestaruusmaa | undefined {
  return MESTARUUSMAAT.find((maa) => maa.value === value);
}

/** Maan sivu, esim. `/jalkapalloarkisto/ulkomaiset-mestarit/venaja`. */
export function mestaruusmaaPath(maa: string): string {
  return `${ULKOMAISET_MESTARIT_PATH}/${maa}`;
}
