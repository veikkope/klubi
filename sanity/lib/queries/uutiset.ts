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
import { kuva, runko } from "@/sanity/lib/queries/kuvat";
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
  /** Tunnisteet (lib/tunnisteet.ts), blogin "labels". */
  tunnisteet?: string[] | null;
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
      coverImage{${kuva}},
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
      image{${kuva}}`;

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

/**
 * Uutishaku (lib/haku.ts). `$terms` = GROQ-kuviot, esim. ["huuhkaj*", "fc*"]:
 * kaikkien pitää löytyä otsikosta, ingressistä, tekstistä tai tunnisteista
 * (lib/tunnisteet.ts). Järjestys
 * osuvuuden mukaan (otsikko painaa eniten), sitten uusin ensin.
 */
const uutinenHakuFilter = `${uutinenListFilter} && ([title, excerpt, pt::text(body)] + coalesce(tunnisteet, [])) match $terms`;

export const uutisetHakuQuery = defineQuery(`
  {
    "items": *[${uutinenHakuFilter}]
      | score(
          boost(title match $terms, 3),
          boost(tunnisteet match $terms, 2),
          boost(excerpt match $terms, 2),
          pt::text(body) match $terms
        )
      | order(_score desc, publishedAt desc)[$start...$end]{${uutinenCardFields}
    },
    "total": count(*[${uutinenHakuFilter}])
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
    body[]{${runko}},
    lahde{ nimi, url, pvm },
    ulkoinenLinkki,
    "author": author->{ name, role },
    kommentointi{ kaytossa, tyyppi, sulkeutuu, vaihtoehdot, sijoituksia, maalikuningas, ohje },
    tunnisteet,
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

/** Uutissivun selauslinkki: otsikko ja osoite. */
export type UutinenNaapuri = { title: string; slug: string; publishedAt: string };

export type UutinenNaapurit = {
  vanhempi: UutinenNaapuri | null;
  uudempi: UutinenNaapuri | null;
};

/**
 * Julkaisujärjestyksessä edellinen ja seuraava uutinen. Parametrit: $id
 * (uutisen _id), $publishedAt. Samalla hetkellä julkaistut järjestetään
 * _id:n mukaan, jottei yhtään ohiteta eikä selaus jää kehään.
 */
export const uutinenNaapuritQuery = defineQuery(`
  {
    "vanhempi": *[${uutinenFilter} && (publishedAt < $publishedAt
      || (publishedAt == $publishedAt && _id < $id))]
      | order(publishedAt desc, _id desc)[0]{ title, "slug": slug.current, publishedAt },
    "uudempi": *[${uutinenFilter} && (publishedAt > $publishedAt
      || (publishedAt == $publishedAt && _id > $id))]
      | order(publishedAt asc, _id asc)[0]{ title, "slug": slug.current, publishedAt }
  }
`);

/* -------------------------------------------------------------------------- */
/* Tunnisteet (lib/tunnisteet.ts)                                              */
/* -------------------------------------------------------------------------- */

/**
 * Jokaisen uutisen tunnistelista: hakemisto, slugin → nimien kartoitus ja
 * määrät lasketaan tästä sovelluksessa (`kokoaTunnisteet`). GROQ ei osaa
 * johtaa slugia nimestä, ja ~500 lyhyttä listaa on kevyt hakea kerralla.
 */
export type TunnisteRivi = { tunnisteet: string[]; paivitetty: string };

export const uutisetTunnisteetQuery = defineQuery(`
  *[${uutinenFilter} && count(tunnisteet) > 0]{ tunnisteet, "paivitetty": _updatedAt }
`);

/**
 * Yhden tunnisteen uutiset. `$nimet` = tunnisteen kaikki kirjoitusasut
 * ("Huuhkajat", "huuhkajat"). Parametrit: $nimet, $start, $end.
 */
const tunnisteFilter = `${uutinenFilter} && count((tunnisteet[])[@ in $nimet]) > 0`;

export const uutisetTunnisteellaQuery = defineQuery(`
  {
    "items": *[${tunnisteFilter}] | order(publishedAt desc)[$start...$end]{${uutinenCardFields}
    },
    "total": count(*[${tunnisteFilter}])
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
    description[]{${runko}},
    signupUrl,
    signupEmail,
    seoTitle,
    seoDescription
  }
`);
