import { resolveHuuhkajatOsio } from "./huuhkajat-osiot";
import { mestaruusmaaPath, resolveMestaruusmaa } from "./ulkomaiset-mestarit";

/**
 * Sivupolku-apurit. `sivu`-dokumenttien slug voi sisältää kauttaviivoja
 * (esim. "klubi/historia"), jolloin polku on /klubi/historia.
 */

/** Yhdistää URL-segmentit yhdeksi slug-stringiksi. */
export function joinSlug(segments: string[]): string {
  return segments.filter(Boolean).join("/");
}

/** Palauttaa esi-isäsivujen slugit pisimmästä lyhimpään. */
export function ancestorSlugs(segments: string[]): string[] {
  const result: string[] = [];
  for (let i = 1; i < segments.length; i++) {
    result.push(segments.slice(0, i).join("/"));
  }
  return result;
}

/** Lisää johtavan kauttaviivan jos puuttuu. */
export function toHref(slug: string): string {
  return slug.startsWith("/") ? slug : `/${slug}`;
}

/* -------------------------------------------------------------------------- */
/* Dokumentin reitti                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Dokumentin kanoninen osoite sivustolla. Yksi totuus kolmelle käyttäjälle:
 * `scripts/generate-redirects.ts` (vanha URL → uusi), `app/sitemap.ts` ja
 * `scripts/verify-content-routes.ts` (jokainen dokumentti renderöityy).
 *
 * Tiedosto tuo vain riippuvuudettomia moduuleja suhteellisella polulla, jotta
 * sitä voi käyttää sekä Next.js-sovelluksesta että `tsx`-skripteistä.
 */
export interface RoutableDoc {
  _id: string;
  _type: string;
  slug?: string | null;
  category?: string | null;
  /** Huuhkajat-tilaston osio (`lib/huuhkajat-osiot.ts`). */
  huuhkajatOsio?: string | null;
  /** Ulkomaisten mestareiden maa (`lib/ulkomaiset-mestarit.ts`). */
  mestaruusmaa?: string | null;
  /** Lehtileikkeen sivu (`lehtileike.osio`). */
  osio?: string | null;
  /** Lehtileikkeen pelaajan slug. */
  pelaajaSlug?: string | null;
  /** Dokumentti, joka viittaa tähän (arvokisa, pelaaja, toimintamuoto, sivu). */
  parent?: { _type: string; slug?: string | null } | null;
}

export interface DocumentRoute {
  /** Polku ilman ankkuria, esim. `/jalkapalloarkisto/huuhkajat`. */
  path: string;
  /** Ankkuri ilman `#`-merkkiä, kun dokumentti on osa listaussivua. */
  anchor?: string;
}

/** Tyypit, joilla on oma sivu per dokumentti. */
const TYPE_BASE: Record<string, string> = {
  uutinen: "/uutiset",
  tapahtuma: "/tapahtumat",
  ravintola: "/ravintolat",
  galleriaAlbumi: "/galleria",
  arvokisa: "/jalkapalloarkisto/arvokisat",
  pelaaja: "/jalkapalloarkisto/pelaajat",
  stadion: "/jalkapalloarkisto/stadionit",
  klubiToiminta: "/klubi/toiminta",
};

/**
 * `jalkapalloTilasto.category` → listaussivu, jolla tilasto näkyy omana
 * osionaan (ankkuri = slug). Eurocup-sivujen slugit vastaavat tiedostoa
 * `app/(public)/jalkapalloarkisto/eurocupit/competitions.ts`.
 */
export const TILASTO_CATEGORY_PAGE: Record<string, string> = {
  champions: "/jalkapalloarkisto/mestarit",
  valmentajat: "/jalkapalloarkisto/valmentajat",
  "valmentajien-palkat": "/jalkapalloarkisto/valmentajat",
  "vuoden-pelaaja": "/jalkapalloarkisto/vuoden-pelaajat",
  "ballon-dor": "/jalkapalloarkisto/euroopan-paras",
  "maailman-parhaat": "/jalkapalloarkisto/maailman-parhaat",
  saavutukset: "/jalkapalloarkisto/saavutukset",
  jarkytykset: "/jalkapalloarkisto/jarkytykset",
  lupaavat: "/jalkapalloarkisto/lupaavat",
  "fifa-ranking": "/jalkapalloarkisto/fifa-ranking",
  eurocup: "/jalkapalloarkisto/eurocupit/champions-league",
  "uefa-cup": "/jalkapalloarkisto/eurocupit/europa-league",
  "conference-league": "/jalkapalloarkisto/eurocupit/conference-league",
  "super-cup": "/jalkapalloarkisto/eurocupit/super-cup",
  intercontinental: "/jalkapalloarkisto/eurocupit/intercontinental",
  // Mitalitaulukot; lohkotaulukot näkyvät kisansa sivulla (parent).
  arvokisa: "/jalkapalloarkisto/arvokisat",
  palloliitto: "/jalkapalloarkisto/palloliitto",
};

export const HUUHKAJAT_PATH = "/jalkapalloarkisto/huuhkajat";

/**
 * Litmanen-osio: Jari Litmasen profiili ja hänen loukkaantumistaulukkonsa
 * omina sivuinaan. Korvaa yleisen pelaajalistan valikossa.
 */
export const LITMANEN_SLUG = "jari-litmanen";
export const LITMANEN_PATH = "/jalkapalloarkisto/litmanen";
export const LITMANEN_LOUKKAANTUMISET_PATH = `${LITMANEN_PATH}/loukkaantumiset`;
export const LITMANEN_LEHTILEIKKEET_PATH = `${LITMANEN_PATH}/lehtileikkeet`;
export const LITMANEN_PATSAS_PATH = `${LITMANEN_PATH}/patsas`;

/**
 * Klubi-osion sivut, joiden reitit hakevat sisältönsä kiinteällä slugilla
 * (app/(public)/klubi/…). Studio lukitsee näiden slugit (sivu.ts): muutos
 * veisi koko sivun 404:ään, eikä redirect auttaisi.
 */
export const KLUBI_SIVU_SLUG = "klubi";
export const HALLITUS_SIVU_SLUG = "klubi/hallitus";
export const TOIMINTA_SIVU_SLUG = "klubi/toiminta";
export const PALLOVEIKKAUS_SLUG = "klubi/palloveikkaus";
export const KOODIIN_SIDOTUT_SIVUT: readonly string[] = [
  KLUBI_SIVU_SLUG,
  HALLITUS_SIVU_SLUG,
  TOIMINTA_SIVU_SLUG,
  PALLOVEIKKAUS_SLUG,
];

/** Lehtileikkeen `osio` → Litmanen-osion sivu (docs/20). */
const LEHTILEIKE_OSIO_PATH: Record<string, string> = {
  lehtileikkeet: LITMANEN_LEHTILEIKKEET_PATH,
  patsas: LITMANEN_PATSAS_PATH,
  terveys: LITMANEN_LOUKKAANTUMISET_PATH,
};

/** Lehtileikkeen ankkuri sivulla: pysyvä, koska `_id` ei muutu. */
export function lehtileikeAnkkuri(id: string): string {
  return `leike-${id.replace(/^drafts\./, "").replace(/[^a-zA-Z0-9-]/g, "-")}`;
}

/** Huuhkajat-osion sivu, esim. `/jalkapalloarkisto/huuhkajat/pelaajatilastot`. */
export function huuhkajatOsioPath(osio: string): string {
  return `${HUUHKAJAT_PATH}/${osio}`;
}

/** Kategoriat, joiden jokaisella tilastolla on oma sivu `<polku>/<slug>`. */
export const TILASTO_CATEGORY_DETAIL: Record<string, string> = {
  karsinta: "/jalkapalloarkisto/karsinnat",
  muu: "/jalkapalloarkisto/tilastot",
};

/**
 * Palauttaa dokumentin reitin tai `null`, jos dokumentilla ei ole omaa
 * näkymää (esim. `kaupunki` on pelkkä viitedokumentti).
 */
export function documentRoute(doc: RoutableDoc): DocumentRoute | null {
  const slug = doc.slug ?? null;

  if (doc._type === "sivu") return slug ? { path: toHref(slug) } : null;

  // Singleton: vanha etusivu.htm → uusi etusivu.
  if (doc._type === "etusivu") return { path: "/" };

  if (doc._type === "pelaaja" && slug === LITMANEN_SLUG) return { path: LITMANEN_PATH };

  // Lehtileikkeillä on sivu vain Litmanen-osiossa; muiden pelaajien jutut näkyvät
  // vasta, kun niille tehdään oma osio.
  if (doc._type === "lehtileike") {
    const path = doc.pelaajaSlug === LITMANEN_SLUG ? LEHTILEIKE_OSIO_PATH[doc.osio ?? "lehtileikkeet"] : null;
    return path ? { path, anchor: lehtileikeAnkkuri(doc._id) } : null;
  }

  const base = TYPE_BASE[doc._type];
  if (base) return slug ? { path: `${base}/${slug}` } : null;

  if (doc._type !== "jalkapalloTilasto" || !slug) return null;

  // Viitattu taulukko näkyy viittaajansa sivulla (lohkot, loukkaantumiset, mölkky…).
  if (doc.parent) {
    // Litmasen taulukot ovat omalla loukkaantumissivullaan, eivät profiilissa.
    if (doc.parent._type === "pelaaja" && doc.parent.slug === LITMANEN_SLUG) {
      return { path: LITMANEN_LOUKKAANTUMISET_PATH, anchor: slug };
    }
    const parentRoute = documentRoute({ _id: "", ...doc.parent });
    if (parentRoute) return { path: parentRoute.path, anchor: slug };
  }

  const category = doc.category ?? "";

  // Huuhkajat jakautuvat osiosivuille; taulukko on osiosivun ankkuri.
  if (category === "huuhkajat") {
    return { path: huuhkajatOsioPath(resolveHuuhkajatOsio(doc.huuhkajatOsio)), anchor: slug };
  }

  // Ulkomaiset mestarit jakautuvat maiden sivuille.
  if (category === "ulkomaiset-mestarit") {
    return { path: mestaruusmaaPath(resolveMestaruusmaa(doc.mestaruusmaa, slug)), anchor: slug };
  }

  const detail = TILASTO_CATEGORY_DETAIL[category];
  if (detail) return { path: `${detail}/${slug}` };

  const page = TILASTO_CATEGORY_PAGE[category];
  if (page) return { path: page, anchor: slug };

  return null;
}

/** Reitti merkkijonona, ankkuri mukana. */
export function documentHref(doc: RoutableDoc): string | null {
  const route = documentRoute(doc);
  if (!route) return null;
  return route.anchor ? `${route.path}#${route.anchor}` : route.path;
}

/**
 * GROQ-projektio, joka tuottaa `RoutableDoc`-kentät. Viittaaja haetaan vain
 * tyypeistä, jotka näyttävät viittaamansa taulukot omalla sivullaan.
 */
export const routableProjection = /* groq */ `
  _id,
  _type,
  "slug": slug.current,
  category,
  huuhkajatOsio,
  mestaruusmaa,
  osio,
  "pelaajaSlug": pelaaja->slug.current,
  "parent": *[
    _type in ["arvokisa", "pelaaja", "klubiToiminta", "sivu"]
    && references(^._id)
    && !(_id in path("drafts.**"))
  ] | order(_type asc, _id asc)[0]{ _type, "slug": slug.current }
`;
