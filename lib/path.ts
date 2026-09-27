/**
 * Sivupolku-apurit. `sivu`-dokumenttien slug voi sisältää kauttaviivoja
 * (esim. "klubi/saannot"), jolloin polku on /klubi/saannot.
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
 * Tiedosto ei tuo mitään muuta moduulia, jotta sitä voi käyttää sekä
 * Next.js-sovelluksesta että `tsx`-skripteistä.
 */
export interface RoutableDoc {
  _id: string;
  _type: string;
  slug?: string | null;
  category?: string | null;
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
  huuhkajat: "/jalkapalloarkisto/huuhkajat",
  champions: "/jalkapalloarkisto/mestarit",
  valmentajat: "/jalkapalloarkisto/valmentajat",
  "valmentajien-palkat": "/jalkapalloarkisto/valmentajat",
  "vuoden-pelaaja": "/jalkapalloarkisto/vuoden-pelaajat",
  "ballon-dor": "/jalkapalloarkisto/euroopan-paras",
  saavutukset: "/jalkapalloarkisto/saavutukset",
  lupaavat: "/jalkapalloarkisto/lupaavat",
  "fifa-ranking": "/jalkapalloarkisto/fifa-ranking",
  eurocup: "/jalkapalloarkisto/eurocupit/champions-league",
  "uefa-cup": "/jalkapalloarkisto/eurocupit/europa-league",
  "conference-league": "/jalkapalloarkisto/eurocupit/conference-league",
  "super-cup": "/jalkapalloarkisto/eurocupit/super-cup",
  intercontinental: "/jalkapalloarkisto/eurocupit/intercontinental",
  // Mitalitaulukot; lohkotaulukot näkyvät kisansa sivulla (parent).
  arvokisa: "/jalkapalloarkisto/arvokisat",
  "ulkomaiset-mestarit": "/jalkapalloarkisto/ulkomaiset-mestarit",
  palloliitto: "/jalkapalloarkisto/palloliitto",
};

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

  const base = TYPE_BASE[doc._type];
  if (base) return slug ? { path: `${base}/${slug}` } : null;

  if (doc._type !== "jalkapalloTilasto" || !slug) return null;

  // Viitattu taulukko näkyy viittaajansa sivulla (lohkot, loukkaantumiset, mölkky…).
  if (doc.parent) {
    const parentRoute = documentRoute({ _id: "", ...doc.parent });
    if (parentRoute) return { path: parentRoute.path, anchor: slug };
  }

  const category = doc.category ?? "";
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
  "parent": *[
    _type in ["arvokisa", "pelaaja", "klubiToiminta", "sivu"]
    && references(^._id)
    && !(_id in path("drafts.**"))
  ] | order(_type asc, _id asc)[0]{ _type, "slug": slug.current }
`;
