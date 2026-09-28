/**
 * GROQ-kyselyt uutisille ja tapahtumille.
 *
 * Oma tiedosto jaetun `sanity/lib/queries.ts`:n sijaan, koska Gate 1:n agentit
 * kirjoittavat rinnakkain — ks. `docs/11-maali-ja-rinnakkaistoteutus.md` §3.
 *
 * Kyselyt kirjoitetaan `defineQuery`-funktiolla, jotta `sanity typegen` tunnistaa
 * ne ja johtaa tulostyypit kyselystä itsestään. Ennen kuin typegen on ajettu
 * (Sanity-projektia ei vielä ole), tulostyypit annetaan käsin alla — ne
 * laajentavat `lib/types.ts`:n muotoja, jotta `NewsCard` ja `EventCard` toimivat
 * myös etusivun lohkojen kanssa.
 */

import { defineQuery } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/react";

import type { Kommentointi, TapahtumaCard, UutinenCard } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Tyypit                                                                      */
/* -------------------------------------------------------------------------- */

export type UutinenListItem = UutinenCard & {
  tiivistelma?: string | null;
};

export type UutinenDetail = UutinenListItem & {
  _updatedAt: string;
  body?: PortableTextBlock[] | null;
  /** Mistä uutinen on lainattu, esim. "palloliitto.fi 07.02.2008". */
  lahde?: { nimi?: string | null; url?: string | null; pvm?: string | null } | null;
  /** Alkuperäinen kirjoitus muualla (esim. klubin Blogspot). */
  ulkoinenLinkki?: string | null;
  author?: { name: string; role?: string | null } | null;
  /** Kommentit ja veikkaus (docs/15). */
  kommentointi?: Kommentointi | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export type TapahtumaListItem = TapahtumaCard & {
  tiivistelma?: string | null;
};

export type TapahtumaDetail = TapahtumaListItem & {
  _updatedAt: string;
  description?: PortableTextBlock[] | null;
  signupUrl?: string | null;
  signupEmail?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

/** Sivutettu tulos: yksi kysely palauttaa sekä sivun että kokonaismäärän. */
export type Paged<T> = {
  items: T[];
  total: number;
};

/** Yksi rivi per dokumentti — vuodet lasketaan sovelluksessa. */
export type ArchiveYearRow = { year: string | null };

/* -------------------------------------------------------------------------- */
/* Projektiot                                                                  */
/* -------------------------------------------------------------------------- */

const uutinenCardFields = `
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      excerpt,
      tiivistelma,
      coverImage,
      categories`;

const tapahtumaCardFields = `
      _id,
      title,
      "slug": slug.current,
      startsAt,
      endsAt,
      location,
      tiivistelma,
      juhla,
      image`;

/** Julkaistu, näkyvä uutinen. */
const uutinenFilter = `_type == "uutinen" && defined(slug.current)`;

/** Kategoriasuodatin on valinnainen: null = kaikki. */
const uutinenListFilter = `${uutinenFilter} && ($category == null || $category in categories)`;

const tapahtumaFilter = `_type == "tapahtuma" && defined(slug.current)`;

/* -------------------------------------------------------------------------- */
/* Uutiset                                                                     */
/* -------------------------------------------------------------------------- */

/** Sivutettu uutislistaus. Parametrit: $category, $start, $end. */
export const uutisetPageQuery = defineQuery(`
  {
    "items": *[${uutinenListFilter}] | order(publishedAt desc)[$start...$end]{${uutinenCardFields}
    },
    "total": count(*[${uutinenListFilter}])
  }
`);

/** Ne kategoriat joista on vähintään yksi uutinen — suodattimen sisältö. */
export const uutisetCategoriesQuery = defineQuery(`
  array::unique(*[${uutinenFilter}].categories[])
`);

export const uutinenSlugsQuery = defineQuery(`
  *[${uutinenFilter}].slug.current
`);

export const uutinenDetailQuery = defineQuery(`
  *[${uutinenFilter} && slug.current == $slug][0]{${uutinenCardFields},
    _updatedAt,
    body,
    lahde{ nimi, url, pvm },
    ulkoinenLinkki,
    "author": author->{ name, role },
    kommentointi{ kaytossa, tyyppi, sulkeutuu, vaihtoehdot, sijoituksia, maalikuningas, ohje },
    seoTitle,
    seoDescription
  }
`);

/** Saman kategorian uutisia. Parametrit: $slug, $categories, $count. */
export const relatedUutisetQuery = defineQuery(`
  *[${uutinenFilter} && slug.current != $slug
    && count((categories[])[@ in $categories]) > 0]
    | order(publishedAt desc)[0...$count]{${uutinenCardFields}
  }
`);

/** Julkaisuvuodet arkiston vuosiluetteloa varten. */
export const uutisetArchiveYearsQuery = defineQuery(`
  *[${uutinenFilter} && defined(publishedAt)]{
    "year": string::split(publishedAt, "-")[0]
  }
`);

/**
 * Yhden vuoden uutiset. Parametrit: $from, $to (ISO-aikaleimat), $start, $end.
 * Vertailu tehdään merkkijonona, koska Sanity tallentaa datetimen ISO-8601:nä.
 */
export const uutisetByYearQuery = defineQuery(`
  {
    "items": *[${uutinenFilter} && publishedAt >= $from && publishedAt < $to]
      | order(publishedAt desc)[$start...$end]{${uutinenCardFields}
    },
    "total": count(*[${uutinenFilter} && publishedAt >= $from && publishedAt < $to])
  }
`);

/* -------------------------------------------------------------------------- */
/* Tapahtumat                                                                  */
/* -------------------------------------------------------------------------- */

export const tulevatTapahtumatQuery = defineQuery(`
  *[${tapahtumaFilter} && startsAt >= now()] | order(startsAt asc){${tapahtumaCardFields}
  }
`);

export const menneetTapahtumatQuery = defineQuery(`
  *[${tapahtumaFilter} && startsAt < now()] | order(startsAt desc){${tapahtumaCardFields}
  }
`);

export const tapahtumaSlugsQuery = defineQuery(`
  *[${tapahtumaFilter}].slug.current
`);

export const tapahtumaDetailQuery = defineQuery(`
  *[${tapahtumaFilter} && slug.current == $slug][0]{${tapahtumaCardFields},
    _updatedAt,
    description,
    signupUrl,
    signupEmail,
    seoTitle,
    seoDescription
  }
`);
