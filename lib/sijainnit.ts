import { findHuuhkajatOsio, resolveHuuhkajatOsio } from "./huuhkajat-osiot";
import { osioSivu } from "./osiosivut";
import {
  LITMANEN_LOUKKAANTUMISET_PATH,
  TILASTO_CATEGORY_DETAIL,
  documentHref,
  documentRoute,
  type RoutableDoc,
} from "./path";
import { kategorianNimi, tilastoKategoria } from "./tilasto-kategoriat";
import { ULKOMAISET_MESTARIT_PATH, findMestaruusmaa, resolveMestaruusmaa } from "./ulkomaiset-mestarit";

/**
 * Esikatselun "Näkyy sivulla" -linkit (docs/24 askel 11, docs/23 Y36): millä
 * sivulla dokumentti näkyy kävijälle. Studio näyttää linkit lomakkeen
 * yläpuolella ja avaa sivun esikatseluun (sanity/presentation.ts).
 *
 * Reitti tulee samasta `documentRoute`-funktiosta kuin sitemap ja ohjaukset
 * (lib/path.ts), joten linkki ei voi osoittaa eri paikkaan kuin ne.
 * Tilastotaulukko voi näkyä usealla sivulla (esim. Kansojen liigan lohko
 * Huuhkajat-osiossa ja kauden karsintasivulla, mitalitaulukko jokaisen
 * siihen viittaavan kisan sivulla): ensimmäinen linkki on sama kuin sitemapin
 * osoite, ja loput samoilla säännöillä kuin sivujen omat kyselyt
 * (sanity/lib/queries/arkisto.ts). Tarkistus productionin dataa ja sivustoa
 * vasten: `npm run verify:sijainnit`.
 *
 * Puhdas moduuli (vain suhteelliset tuonnit), jotta testit ajetaan tsx:llä.
 */

/** Sama muoto kuin Sanityn `DocumentLocation` (sanity/presentation). */
export interface Sijainti {
  title: string;
  href: string;
}

/** Sama muoto kuin Sanityn `DocumentLocationsState`. */
export interface SijaintiTila {
  locations: Sijainti[];
  message?: string;
  tone?: "positive" | "caution" | "critical";
}

/** Taulukkoon viittaava dokumentti (arvokisa, pelaaja, klubin toiminta, sivu). */
export interface SijainninViittaaja {
  _type: string;
  slug?: string | null;
  nimi?: string | null;
}

/** `SIJAINTI_KYSELY`n tulos (sanity/lib/queries/sijainti.ts). */
export type SijaintiDoc = RoutableDoc & {
  nimi?: string | null;
  /** ottelu: alkamisaika (ISO). */
  aika?: string | null;
  /** hallitusJasen: false = entinen jäsen. */
  nykyinen?: boolean | null;
  /** kommentti: piilotettu sivustolta. */
  piilotettu?: boolean | null;
  /** ohjaus: osoite, joka ohjautuu. */
  lahde?: string | null;
  /** kommentti: uutinen, jonka alla kommentti on. */
  uutinen?: { nimi?: string | null; slug?: string | null } | null;
  /** klubiArvio: arvioitu ravintola. */
  ravintola?: { nimi?: string | null; slug?: string | null } | null;
  /** jalkapalloTilasto: kaikki viittaajat samassa järjestyksessä kuin sitemapin `parent`. */
  viittaajat?: SijainninViittaaja[] | null;
  /** jalkapalloTilasto (Huuhkajat): kauden karsintasivu. */
  kaudenOttelut?: { nimi?: string | null; slug?: string | null; category?: string | null } | null;
};

/** Tyypit, joilla on oma sivu (sama lista kuin ennen askelta 11). */
export const SIVUTYYPIT = [
  "uutinen",
  "tapahtuma",
  "ravintola",
  "galleriaAlbumi",
  "arvokisa",
  "pelaaja",
  "stadion",
  "klubiToiminta",
  "sivu",
] as const;

/** Tyypit, joille esikatselu näyttää Näkyy sivulla -tiedon. */
export const SIJAINTITYYPIT: ReadonlySet<string> = new Set<string>([
  ...SIVUTYYPIT,
  "etusivu",
  "lehtileike",
  "jalkapalloTilasto",
  "ottelu",
  "hallitusJasen",
  "kommentti",
  "klubiArvio",
  "uutisKategoria",
  "ohjaus",
]);

export const EI_SIVULLA_VIESTI =
  "Taulukko ei näy vielä millään sivulla. Lisää se sivun, klubin toiminnan tai pelaajan Taulukot-kenttään ja julkaise.";
export const EI_OSOITETTA_VIESTI =
  "Taulukko ei näy vielä millään sivulla. Täytä Osoite sivustolla -kenttä (Luo-painike) ja julkaise.";
export const ENTINEN_JASEN_VIESTI = "Entinen jäsen: ei näy hallitussivulla.";
export const PIILOTETTU_KOMMENTTI_VIESTI = "Piilotettu kommentti: ei näy sivustolla.";
export const PELATTU_OTTELU_VIESTI = "Ottelu on jo pelattu: ei näy enää otteluohjelmassa.";
export const OTTELU_ILMAN_AIKAA_VIESTI = "Ottelulta puuttuu alkamisaika: ei näy otteluohjelmassa.";

/**
 * Kuinka kauan alkanut ottelu näkyy otteluohjelmassa (käynnissä oleva ottelu).
 * Yksi arvo: lib/ottelut.ts (`getTulevatOttelut`) käyttää samaa.
 */
export const OTTELU_NAKYY_ALUN_JALKEEN_MS = 2 * 60 * 60 * 1000;

/**
 * Ottelun sijainnit: Ottelut-sivu ja etusivu, kun ottelu on otteluohjelmassa
 * (alkanut enintään 2 h sitten tai tulossa, sama ehto kuin getTulevatOttelut).
 * Seura- ja määrärajausta (etusivun lohkon asetukset) ei arvioida.
 */
function ottelunTila(doc: SijaintiDoc, nyt: Date): SijaintiTila {
  const alku = doc.aika ? Date.parse(doc.aika) : NaN;
  if (Number.isNaN(alku)) return { locations: [], message: OTTELU_ILMAN_AIKAA_VIESTI, tone: "caution" };
  if (alku < nyt.getTime() - OTTELU_NAKYY_ALUN_JALKEEN_MS) return { locations: [], message: PELATTU_OTTELU_VIESTI };
  return { locations: [{ title: sivunNimi("/ottelut", "Ottelut"), href: "/ottelut" }, ETUSIVU] };
}

const ETUSIVU: Sijainti = { title: "Etusivu", href: "/" };

/** Osion sivun nimi (lib/osiosivut.ts), muuten `varalla`. */
function sivunNimi(path: string, varalla: string): string {
  return osioSivu(path.replace(/^\//, ""))?.oletus.title ?? varalla;
}

/**
 * Näyttääkö viittaaja taulukkonsa. Osioiden sivuista vain ne, joilla on
 * Taulukot-kenttä (lib/osiosivut.ts `kentat`); muut viittaajat aina.
 */
function viittaajaNayttaa(v: SijainninViittaaja): boolean {
  if (v._type !== "sivu") return true;
  const o = osioSivu(v.slug);
  return !o || o.kentat.includes("tilastot");
}

/** Viittaajan sivu ja ankkuri (sama sääntö kuin sitemapin `parent`). */
function viittaajanSijainti(doc: SijaintiDoc, v: SijainninViittaaja): Sijainti | null {
  if (!viittaajaNayttaa(v)) return null;
  const parent = { _type: v._type, slug: v.slug ?? null };
  if (!documentRoute({ _id: "", ...parent })) return null;
  const route = documentRoute({ ...doc, parent });
  if (!route) return null;
  const href = route.anchor ? `${route.path}#${route.anchor}` : route.path;
  const title =
    route.path === LITMANEN_LOUKKAANTUMISET_PATH
      ? sivunNimi(route.path, "Loukkaantumiset")
      : (v.nimi ?? sivunNimi(route.path, doc.nimi ?? "Sivu"));
  return { title, href };
}

/** Kategorian oma sivu, kun viittaajaa ei huomioida (arkiston sivut). */
function kategorianSijainti(doc: SijaintiDoc): Sijainti | null {
  const route = documentRoute({ ...doc, parent: null });
  if (!route) return null;
  const href = route.anchor ? `${route.path}#${route.anchor}` : route.path;
  const category = doc.category ?? "";
  if (category === "huuhkajat") {
    const osio = findHuuhkajatOsio(resolveHuuhkajatOsio(doc.huuhkajatOsio));
    return { title: `Huuhkajat: ${osio?.title ?? "Muut tilastot"}`, href };
  }
  if (category === "ulkomaiset-mestarit") {
    const maa = findMestaruusmaa(resolveMestaruusmaa(doc.mestaruusmaa, doc.slug));
    return { title: maa?.pageTitle ?? sivunNimi(ULKOMAISET_MESTARIT_PATH, "Ulkomaiset mestarit"), href };
  }
  if (TILASTO_CATEGORY_DETAIL[category]) return { title: doc.nimi ?? kategorianNimi(category), href };
  return { title: sivunNimi(route.path, kategorianNimi(category)), href };
}

/**
 * Kaikki sivut, joilla taulukko näkyy, sitemapin osoite ensin. Säännöt
 * vastaavat sivujen kyselyjä:
 * - viittaaja (sivu, klubin toiminta, pelaaja, arvokisa) näyttää Taulukot-kenttänsä;
 * - kategorian sivu näyttää kaikki kategorian taulukot, paitsi arvokisasivu
 *   vain ne, joihin mikään kisa ei viittaa (`arvokisaMitalitaulukotQuery`);
 * - Huuhkajat-taulukko näkyy myös kauden karsintasivulla (`karsintaBySlugQuery`);
 * - Klubin omat tilastot ja pelaajatilastot näkyvät vain viittaajan sivulla.
 */
export function tilastonSijainnit(doc: SijaintiDoc): Sijainti[] {
  if (!doc.slug) return [];
  const viittaajat = doc.viittaajat ?? [];
  const tulos: Sijainti[] = [];
  const lisaa = (s: Sijainti | null) => {
    if (s && !tulos.some((t) => t.href === s.href)) tulos.push(s);
  };

  for (const v of viittaajat) lisaa(viittaajanSijainti(doc, v));

  const kisaViittaa = viittaajat.some((v) => v._type === "arvokisa");
  if (!(doc.category === "arvokisa" && kisaViittaa)) lisaa(kategorianSijainti(doc));

  const kausi = doc.kaudenOttelut;
  if (doc.category === "huuhkajat" && kausi?.slug && kausi.category === "karsinta") {
    lisaa({
      title: kausi.nimi ?? "Karsinta",
      href: `${TILASTO_CATEGORY_DETAIL.karsinta}/${kausi.slug}#${doc.slug}`,
    });
  }
  return tulos;
}

function tilastonTila(doc: SijaintiDoc): SijaintiTila {
  const locations = tilastonSijainnit(doc);
  if (locations.length > 0) return { locations };
  const vaatii = tilastoKategoria(doc.category)?.vaatiiViittaajan === true;
  return {
    locations: [],
    message: !doc.slug && !vaatii ? EI_OSOITETTA_VIESTI : EI_SIVULLA_VIESTI,
    tone: "caution",
  };
}

/**
 * Dokumentin Näkyy sivulla -tieto. `null` = tyypillä ei ole sivua tai
 * dokumentilta puuttuu vielä osoite (Studio ei näytä silloin mitään, kuten
 * ennen askelta 11).
 */
export function dokumentinSijainnit(doc: SijaintiDoc, nyt: Date = new Date()): SijaintiTila | null {
  switch (doc._type) {
    case "etusivu":
      return { locations: [ETUSIVU] };
    case "jalkapalloTilasto":
      return tilastonTila(doc);
    case "lehtileike": {
      const href = documentHref(doc);
      return href ? { locations: [{ title: doc.nimi ?? "Lehtileike", href }] } : null;
    }
    case "ottelu":
      return ottelunTila(doc, nyt);
    case "hallitusJasen":
      return doc.nykyinen === false
        ? { locations: [], message: ENTINEN_JASEN_VIESTI }
        : { locations: [{ title: sivunNimi("/klubi/hallitus", "Hallitus"), href: "/klubi/hallitus" }] };
    case "kommentti": {
      if (doc.piilotettu === true) return { locations: [], message: PIILOTETTU_KOMMENTTI_VIESTI, tone: "caution" };
      const slug = doc.uutinen?.slug;
      const href = slug ? documentHref({ _id: "", _type: "uutinen", slug }) : null;
      return href ? { locations: [{ title: doc.uutinen?.nimi ?? "Uutinen", href }] } : null;
    }
    case "klubiArvio": {
      const slug = doc.ravintola?.slug;
      const href = slug ? documentHref({ _id: "", _type: "ravintola", slug }) : null;
      return href ? { locations: [{ title: doc.ravintola?.nimi ?? "Ravintola", href }] } : null;
    }
    case "uutisKategoria":
      return doc.slug
        ? {
            locations: [
              {
                title: `${sivunNimi("/uutiset", "Uutiset")}: ${doc.nimi ?? doc.slug}`,
                href: `/uutiset?kategoria=${encodeURIComponent(doc.slug)}`,
              },
            ],
          }
        : null;
    case "ohjaus": {
      const lahde = doc.lahde?.trim();
      return lahde && lahde.startsWith("/") && !lahde.startsWith("//") && lahde.length > 1
        ? { locations: [{ title: "Ohjattava osoite", href: lahde }] }
        : null;
    }
    default: {
      if (!(SIVUTYYPIT as readonly string[]).includes(doc._type) || !doc.slug) return null;
      const href = documentHref({ _id: "", _type: doc._type, slug: doc.slug });
      return href ? { locations: [{ title: doc.nimi ?? "Sivu", href }] } : null;
    }
  }
}

