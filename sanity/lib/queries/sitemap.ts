import { defineQuery } from "next-sanity";

/**
 * Sitemapin kyselyt. Yksi kysely per reittiperhe, jotta `lastModified` tulee
 * dokumentin todellisesta `_updatedAt`-arvosta eikä buildin ajankohdasta.
 *
 * Omassa tiedostossaan, koska sitemap ei kuulu millekään yksittäiselle
 * sivuosiolle ja sen kyselyt ovat tarkoituksella minimaalisia: vain slug ja
 * muokkausaika, ei sisältöä.
 */

export interface SitemapRow {
  slug: string | null;
  updatedAt: string | null;
}

/** Dokumenttityypit joilla on yksi sivu per dokumentti. */
export const sitemapByTypeQuery = defineQuery(`
  *[_type == $type && defined(slug.current)] | order(_updatedAt desc) {
    "slug": slug.current,
    "updatedAt": _updatedAt
  }
`);

/**
 * Tilastot reitin päättelyä varten (`lib/path.ts` → `documentRoute`).
 * Vain omalla sivullaan näkyvät tilastot päätyvät sitemapiin; listaussivujen
 * osiot (ankkurit) eivät ole erillisiä URL:eja.
 */
export interface SitemapTilastoRow {
  _id: string;
  _type: string;
  slug: string | null;
  category: string | null;
  parent: { _type: string; slug: string | null } | null;
  updatedAt: string | null;
}

export const sitemapTilastotQuery = defineQuery(`
  *[_type == "jalkapalloTilasto" && defined(slug.current)] | order(_updatedAt desc) {
    _id,
    _type,
    "slug": slug.current,
    category,
    "parent": *[
      _type in ["arvokisa", "pelaaja", "klubiToiminta", "sivu"]
      && references(^._id)
      && !(_id in path("drafts.**"))
    ] | order(_type asc, _id asc)[0]{ _type, "slug": slug.current },
    "updatedAt": _updatedAt
  }
`);

/** Uutisarkiston vuodet — omat reittinsä /uutiset/arkisto/[vuosi]. */
export const sitemapArchiveYearsQuery = defineQuery(`
  *[_type == "uutinen" && defined(publishedAt)]
    | order(publishedAt desc) {
      "slug": string::split(publishedAt, "-")[0],
      "updatedAt": _updatedAt
    }
`);
