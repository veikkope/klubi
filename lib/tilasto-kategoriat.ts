/**
 * Jalkapallotilaston kategoriat ja Studion tilastoryhmät (docs/24 askel 11,
 * docs/23 Y36). Yksi lista kolmelle käyttäjälle: skeeman valintalista
 * (`jalkapalloTilasto.category`), Studion ryhmät (sanity/structure.ts) ja
 * esikatselun alaotsikko. Kategorian sivu ratkeaa reitityksessä (lib/path.ts),
 * ja "Näkyy sivulla" -linkit lasketaan tiedostossa lib/sijainnit.ts.
 *
 * Tiedosto ei tuo mitään, jotta sitä voi käyttää myös tsx-skripteistä.
 */

export type TilastoRyhma = "klubi" | "huuhkajat" | "karsinnat" | "arvokisat" | "muut";

export interface TilastoKategoria {
  value: string;
  /** Nimi Studion valintalistassa ja listan alaotsikossa. */
  title: string;
  ryhma: TilastoRyhma;
  /**
   * Taulukko näkyy vain, kun sivu, klubin toiminta tai pelaaja viittaa siihen
   * (Taulukot-kenttä). Muilla kategorioilla on oma sivunsa arkistossa.
   */
  vaatiiViittaajan?: true;
}

/** Nykyiset 23 kategoriaa skeeman valintalistan järjestyksessä. */
export const TILASTO_KATEGORIAT: readonly TilastoKategoria[] = [
  { value: "fifa-ranking", title: "FIFA-ranking", ryhma: "muut" },
  { value: "champions", title: "Suomen mestarit", ryhma: "muut" },
  { value: "huuhkajat", title: "Huuhkajat (maajoukkueen tilastot)", ryhma: "huuhkajat" },
  { value: "valmentajat", title: "Huuhkajien valmentajat", ryhma: "muut" },
  { value: "valmentajien-palkat", title: "Valmentajien palkat", ryhma: "muut" },
  { value: "vuoden-pelaaja", title: "Vuoden pelaaja", ryhma: "muut" },
  { value: "lupaavat", title: "Lupaavat pelaajat", ryhma: "muut" },
  { value: "ballon-dor", title: "Ballon d'Or", ryhma: "muut" },
  { value: "maailman-parhaat", title: "Maailman paras avaus", ryhma: "muut" },
  { value: "saavutukset", title: "Suomen jalkapallon saavutukset", ryhma: "muut" },
  { value: "jarkytykset", title: "Suomen jalkapallon järkytykset", ryhma: "muut" },
  { value: "eurocup", title: "Champions League / Eurocup", ryhma: "muut" },
  { value: "uefa-cup", title: "Europa League / UEFA Cup", ryhma: "muut" },
  { value: "super-cup", title: "UEFA Super Cup", ryhma: "muut" },
  { value: "conference-league", title: "Conference League / Cup Winners' Cup", ryhma: "muut" },
  { value: "intercontinental", title: "Intercontinental / Club World Cup", ryhma: "muut" },
  { value: "karsinta", title: "Karsinta", ryhma: "karsinnat" },
  { value: "arvokisa", title: "Arvokisatilasto (MM, EM, Kansojen liiga)", ryhma: "arvokisat" },
  { value: "pelaaja", title: "Pelaajatilasto (yksittäinen pelaaja)", ryhma: "muut", vaatiiViittaajan: true },
  { value: "ulkomaiset-mestarit", title: "Ulkomaiden mestarit (Englanti, Venäjä …)", ryhma: "muut" },
  { value: "palloliitto", title: "Palloliiton puheenjohtajat", ryhma: "muut" },
  {
    value: "klubi",
    title: "Klubin omat tilastot (veikkaus, mölkky, jouluruokailu)",
    ryhma: "klubi",
    vaatiiViittaajan: true,
  },
  { value: "muu", title: "Muu tilasto", ryhma: "muut" },
];

/** Studion Tilastot-listan ryhmät tässä järjestyksessä. */
export const TILASTORYHMAT: readonly { id: TilastoRyhma; otsikko: string }[] = [
  { id: "klubi", otsikko: "Klubin omat tilastot" },
  { id: "huuhkajat", otsikko: "Huuhkajat" },
  { id: "karsinnat", otsikko: "Karsinnat" },
  { id: "arvokisat", otsikko: "Arvokisat" },
  { id: "muut", otsikko: "Muut arkiston taulukot" },
];

/**
 * Ryhmä, johon tuntematon tai puuttuva kategoria kuuluu Studion listassa:
 * näin mikään taulukko ei katoa ryhmittelystä (esim. kesken jäänyt luonnos).
 */
export const TILASTORYHMA_OLETUS: TilastoRyhma = "muut";

/** Skeeman valintalista. */
export const TILASTO_KATEGORIA_VALINNAT = TILASTO_KATEGORIAT.map(({ title, value }) => ({ title, value }));

/**
 * Tilastoryhmän + -painikkeen pohjan tunnus (sanity/pohjat.ts). Sanity käyttää
 * listan kohdan tunnusta pohjan tunnuksena, joten jokaisella kategorialla on
 * oma pohjansa.
 */
export const tilastoPohjanId = (category: string) => `tilasto-${category}`;

export function tilastoKategoria(value: string | null | undefined): TilastoKategoria | undefined {
  return value ? TILASTO_KATEGORIAT.find((k) => k.value === value) : undefined;
}

/** Kategorian nimi Studion listaan: "Valmentajien palkat"; tuntematon arvo sellaisenaan. */
export function kategorianNimi(value: string | null | undefined): string {
  return tilastoKategoria(value)?.title ?? (value || "Kategoria puuttuu");
}

/** Ryhmän kategoriat valintalistan järjestyksessä. */
export function ryhmanKategoriat(ryhma: TilastoRyhma): string[] {
  return TILASTO_KATEGORIAT.filter((k) => k.ryhma === ryhma).map((k) => k.value);
}

/** Taulukon ryhmä Studion listassa (tuntematon tai puuttuva kategoria → oletusryhmä). */
export function tilastonRyhma(category: string | null | undefined): TilastoRyhma {
  return tilastoKategoria(category)?.ryhma ?? TILASTORYHMA_OLETUS;
}

/**
 * Ryhmän lista Studiossa (GROQ-suodatin ja parametrit). Oletusryhmä ottaa
 * mukaan myös taulukot, joiden kategoria puuttuu tai on tuntematon, jotta
 * jokainen taulukko on täsmälleen yhdessä ryhmässä (testattu: test-sijainnit).
 */
export function ryhmanSuodatin(ryhma: TilastoRyhma): { filter: string; params: Record<string, string[]> } {
  const kategoriat = ryhmanKategoriat(ryhma);
  if (ryhma !== TILASTORYHMA_OLETUS) {
    return { filter: `_type == "jalkapalloTilasto" && category in $kategoriat`, params: { kategoriat } };
  }
  return {
    filter:
      `_type == "jalkapalloTilasto" && (category in $kategoriat || !defined(category) ` +
      `|| !(category in $kaikki))`,
    params: { kategoriat, kaikki: TILASTO_KATEGORIAT.map((k) => k.value) },
  };
}
