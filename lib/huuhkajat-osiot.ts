/**
 * Huuhkajat-sivun osiot. Yksi totuus kolmelle käyttäjälle: Sanity-skeeman
 * valintalista (`jalkapalloTilasto.huuhkajatOsio`), reititys (`lib/path.ts`)
 * ja sivut (`app/(public)/jalkapalloarkisto/huuhkajat`).
 *
 * `value` on sekä Sanityyn tallentuva arvo että pysyvä URL-segmentti
 * (/jalkapalloarkisto/huuhkajat/[osio]). Arvoa ei saa muuttaa: vanhojen
 * osoitteiden ohjaukset osoittavat siihen. Nimen ja kuvauksen voi muuttaa.
 *
 * Tiedosto ei tuo mitään muuta moduulia, jotta sitä voi käyttää sekä
 * Next.js-sovelluksesta, Studiosta että `tsx`-skripteistä.
 */

export interface HuuhkajatOsio {
  /** Sanity-arvo ja URL-segmentti. */
  value: string;
  title: string;
  /** Kortin ja sivun johdanto. */
  lead: string;
  /** 120–160 merkkiä, kirjoitettu hakutulokseen. */
  description: string;
  /**
   * Hub-sivun kohta: "aiheet" = oma kortti, "karsinnat" = listataan
   * karsintasarjojen alla (Kansojen liiga kuuluu EM-karsintojen yhteyteen).
   */
  hubKohta: "aiheet" | "karsinnat";
  /**
   * Osion taulukko kuuluu jonkin kauden karsintasivulle (Kansojen liigan
   * lohko pelataan samana vuonna kuin karsinnat). Taulukolle valitaan
   * Studiossa kauden karsintasivu, jolla taulukko näytetään otteluiden
   * yhteydessä, ja osiosivu linkittää taulukolta otteluihin.
   */
  kaudenOttelut?: boolean;
}

export const HUUHKAJAT_OSIOT: HuuhkajatOsio[] = [
  {
    value: "pelaajatilastot",
    title: "Pelaajatilastot",
    lead: "Eniten A-maaotteluita pelanneet ja eniten maaleja tehneet Huuhkajat.",
    description:
      "Suomen miesten maajoukkueen pelaajatilastot: eniten A-maaotteluita pelanneet ja eniten maaleja tehneet pelaajat taulukoina.",
    hubKohta: "aiheet",
  },
  {
    value: "huuhkaja-arvostelu",
    title: "Huuhkaja-arvostelu",
    lead: "Klubin oma arvostelu: ottelun parhaille jaetut Huuhkajat pelaajittain ja otteluittain.",
    description:
      "Lahden Suomalaisen Klubin Huuhkaja-arvostelu: A-maaottelujen parhaille pelaajille jaetut Huuhkajat pelaajittain ja otteluittain.",
    hubKohta: "aiheet",
  },
  {
    value: "kansojen-liiga",
    title: "Kansojen liiga",
    lead: "Suomen lohkot ja loppusarjataulukot Kansojen liigan kausilta.",
    description:
      "Suomen miesten maajoukkue Kansojen liigassa: lohkojen loppusarjataulukot kausittain vuodesta 2018 alkaen.",
    hubKohta: "karsinnat",
    kaudenOttelut: true,
  },
  {
    value: "avauskokoonpano",
    title: "Paras avauskokoonpano",
    lead: "Suomen paras avauskokoonpano ja pelaajien seurat vuosi vuodelta.",
    description:
      "Suomen paras avauskokoonpano vuosittain: missä seuroissa Huuhkajien avauskokoonpanon pelaajat pelasivat kunakin vuonna.",
    hubKohta: "aiheet",
  },
  {
    value: "englanti",
    title: "Englannin pääsarjassa",
    lead: "Englannin ylimmällä sarjatasolla pelanneet Huuhkajat ja heidän seuransa.",
    description:
      "Suomalaiset Englannin ylimmällä sarjatasolla: pelaajat, ensimmäiset ottelut, ottelu- ja maalimäärät sekä seurat.",
    hubKohta: "aiheet",
  },
  {
    value: "muut",
    title: "Muut tilastot",
    lead: "Huuhkajien tilastot, joille ei ole omaa osiota.",
    description:
      "Suomen miesten maajoukkueen muut tilastot Lahden Suomalaisen Klubin jalkapalloarkistossa.",
    hubKohta: "aiheet",
  },
];

/** Osio, johon taulukko päätyy, kun osiota ei ole valittu. */
export const HUUHKAJAT_OSIO_OLETUS = "muut";

/** Tallennettu arvo → tunnettu osio. Tuntematon tai puuttuva → "muut". */
export function resolveHuuhkajatOsio(value: string | null | undefined): string {
  const clean = value?.trim();
  return clean && HUUHKAJAT_OSIOT.some((osio) => osio.value === clean)
    ? clean
    : HUUHKAJAT_OSIO_OLETUS;
}

/** Liitetäänkö osion taulukot kauden karsintasivuun (`kaudenOttelut`-kenttä). */
export function osioLiittyyKauteen(value: string | null | undefined): boolean {
  return findHuuhkajatOsio(value?.trim() ?? "")?.kaudenOttelut === true;
}

export function findHuuhkajatOsio(value: string): HuuhkajatOsio | undefined {
  return HUUHKAJAT_OSIOT.find((osio) => osio.value === value);
}
