/**
 * Eurocup-alasivujen slug → Sanityn `jalkapalloTilasto.category` -mäppäys.
 *
 * Tämä on ainoa paikka, jossa mäppäys määritellään. Slug on suomenkielinen ja
 * pysyvä osoite; kategoria on skeeman arvo, joka voi olla historiallinen
 * (esim. Cup Winners' Cup → Conference League). Jos kilpailu nimetään
 * uudelleen, slug ei muutu eikä vanha osoite katkea.
 */

export interface EurocupCompetition {
  /** URL-segmentti: /jalkapalloarkisto/eurocupit/[slug] */
  slug: string;
  /** `jalkapalloTilasto.category` -arvo Sanityssa. */
  category: string;
  title: string;
  /** Lyhyt nimi korttiruudukkoon. */
  shortTitle: string;
  /** 120–160 merkkiä, kirjoitettu hakutulokseen eikä katkaistuna. */
  description: string;
  lead: string;
}

export const eurocupCompetitions: EurocupCompetition[] = [
  {
    slug: "champions-league",
    category: "eurocup",
    title: "Champions League",
    shortTitle: "Champions League",
    description:
      "Euroopan cupin ja Mestarien liigan voittajat, finaalit ja suomalaisjoukkueiden otteet klubin jalkapalloarkiston taulukoissa.",
    lead: "Euroopan cup vuodesta 1955 ja Mestarien liiga vuodesta 1992: finaalit, voittajat ja suomalaisjoukkueiden esiintymiset.",
  },
  {
    slug: "europa-league",
    category: "uefa-cup",
    title: "Europa League",
    shortTitle: "Europa League",
    description:
      "UEFA-cupin ja Europa Leaguen voittajat ja finaalit vuodesta 1971 alkaen. Kaikki taulukot luettavassa tekstimuodossa.",
    lead: "UEFA-cup vuodesta 1971 ja Europa League vuodesta 2010: finaalit, voittajat ja suomalaisjoukkueiden otteet.",
  },
  {
    slug: "conference-league",
    category: "conference-league",
    title: "Conference League",
    shortTitle: "Conference League",
    description:
      "Cup-voittajien cupin ja sen seuraajan Conference Leaguen voittajat ja finaalit klubin jalkapalloarkiston taulukoissa.",
    lead: "Cup-voittajien cup 1961–1999 ja sen seuraaja Conference League vuodesta 2021: finaalit ja voittajat.",
  },
  {
    slug: "super-cup",
    category: "super-cup",
    title: "UEFA Super Cup",
    shortTitle: "Super Cup",
    description:
      "UEFA Super Cupin ottelut ja voittajat vuodesta 1972: Mestarien liigan ja Europa Leaguen voittajien kohtaamiset.",
    lead: "Mestarien liigan ja Europa Leaguen voittajien vuosittainen kohtaaminen vuodesta 1972 alkaen.",
  },
  {
    slug: "intercontinental",
    category: "intercontinental",
    title: "Intercontinental Cup",
    shortTitle: "Intercontinental",
    description:
      "Maailmancupin, Toyota Cupin ja seurajoukkueiden MM-kisojen voittajat: Euroopan ja Etelä-Amerikan mestareiden kohtaamiset.",
    lead: "Maailmancup, Toyota Cup ja seurajoukkueiden MM-kisat: maanosien mestareiden kohtaamiset vuodesta 1960.",
  },
];

export const eurocupCategories: string[] = eurocupCompetitions.map(
  (competition) => competition.category,
);

export function findEurocup(slug: string): EurocupCompetition | undefined {
  return eurocupCompetitions.find((competition) => competition.slug === slug);
}
