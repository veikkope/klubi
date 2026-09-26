import { defineQuery } from "next-sanity";

import type { SanityImage } from "@/lib/types";
import type { PortableTextBlock } from "@portabletext/react";

/**
 * Ravintolaosion GROQ-kyselyt.
 *
 * Omassa tiedostossaan `sanity/lib/queries.ts`:n sijaan, koska Gate 1:n agentit
 * kirjoittavat rinnakkain — jaettu kyselytiedosto tuottaisi konflikteja
 * (`docs/11-maali-ja-rinnakkaistoteutus.md` §3).
 *
 * Arvosanoista: vanhalla sivustolla arvio annettiin sekä tähtinä että kolmena
 * osa-arviona (Ruoka / Hinta / Viihtyvyys). `ratingOverall` on ensisijainen —
 * `stars` on vain nopea visuaalinen signaali, ja siksi kaikissa vertailuissa
 * käytetään `coalesce(ratingOverall, stars)`:ia jottei vanhemmat, pelkillä
 * tähdillä arvioidut ravintolat putoa suodattimista pois.
 */

// ── Tyypit ────────────────────────────────────────────────────────────────────
// Käsin kirjoitetut, koska typegeniä ei voi ajaa ennen kuin Sanity-projekti on
// luotu. Muoto vastaa alla olevia projektioita kenttä kentältä.

export type RavintolaCity = {
  name?: string | null;
  slug?: string | null;
  country?: string | null;
};

/** Hakemistokortin data. Yhteensopiva `lib/types.ts`:n `RavintolaCard`:in kanssa. */
export type RavintolaCardData = {
  _id: string;
  name: string;
  slug: string;
  city?: RavintolaCity | null;
  stars?: number | null;
  ratingOverall?: number | null;
  ratingFood?: number | null;
  ratingPrice?: number | null;
  ratingAtmosphere?: number | null;
  priceLevel?: string | null;
  cuisine?: string[] | null;
  closed?: boolean | null;
  tiivistelma?: string | null;
  image?: SanityImage;
};

export type RavintolaDetail = RavintolaCardData & {
  _updatedAt?: string | null;
  address?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  website?: string | null;
  location?: { lat: number; lng: number } | null;
  closedNote?: string | null;
  pros?: string[] | null;
  cons?: string[] | null;
  visitedAt?: string | null;
  visits?: string[] | null;
  visitContext?: string | null;
  review?: PortableTextBlock[] | null;
  images?: SanityImage[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  userReviews: RavintolaUserReview[];
  related: RavintolaCardData[];
};

export type RavintolaUserReview = {
  _id: string;
  reviewerName?: string | null;
  stars?: number | null;
  comment?: string | null;
  submittedAt?: string | null;
};

export type RavintolatFacetData = {
  cities: { name: string | null; slug: string | null; count: number }[];
  cuisines: (string | null)[];
  total: number;
  closedCount: number;
  /** Varhaisimman kirjatun käynnin päivä, esim. "1997-10-11". */
  firstVisitYear: string | null;
};

/** Arvostelulomakkeen valintalista. */
export type RavintolaOption = {
  _id: string;
  name: string;
  slug?: string | null;
  city?: string | null;
};

// ── Projektiot ────────────────────────────────────────────────────────────────

const cardProjection = /* groq */ `
  _id,
  name,
  "slug": slug.current,
  "city": city->{ name, "slug": slug.current, country },
  stars,
  ratingOverall,
  ratingFood,
  ratingPrice,
  ratingAtmosphere,
  priceLevel,
  cuisine,
  closed,
  tiivistelma,
  "image": images[0]
`;

/**
 * Hakemiston suodatin. Kaikki parametrit ovat pakollisia kutsussa, mutta
 * `null` tarkoittaa "ei rajausta".
 *
 *  $citySlug      kaupungin slug tai null
 *  $cuisine       yksi ruokatyyppi tai null
 *  $minRating     vähimmäisarvosana (0–5) tai null
 *  $includeClosed true = myös toimintansa lopettaneet
 */
const directoryFilter = /* groq */ `
  _type == "ravintola" && defined(slug.current)
  && ($citySlug == null || city->slug.current == $citySlug)
  && ($cuisine == null || $cuisine in cuisine)
  && ($minRating == null || coalesce(ratingOverall, stars, 0) >= $minRating)
  && ($includeClosed == true || closed != true)
`;

// ── Kyselyt ───────────────────────────────────────────────────────────────────

/** Montako ravintolaa yhdellä hakemistosivulla. */
export const RAVINTOLAT_PAGE_SIZE = 24;

const ORDERINGS = {
  arvosana: "coalesce(ratingOverall, stars, 0) desc, name asc",
  nimi: "name asc",
} as const;

export type RavintolatOrdering = keyof typeof ORDERINGS;

/**
 * Hakemiston sivullinen ravintoloita.
 *
 * Kysely rakennetaan funktiolla eikä `defineQuery`-vakiona kahdesta syystä:
 *  - GROQ:n viipalointi (`[a...b]`) vaatii kokonaislukuliteraalit; `$offset`
 *    ei kelpaa, joten sivunumero on leivottava kyselyyn
 *  - `order()` ei ota kenttänimeä muuttujasta, joten lajittelu valitaan tässä
 *
 * Injektiopintaa ei synny: molemmat interpoloitavat arvot ovat koodin omia —
 * `ORDERINGS`-taulukon vakio ja tästä funktiosta laskettu kokonaisluku.
 */
export function ravintolatDirectoryQuery(
  ordering: RavintolatOrdering,
  page: number,
): string {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const offset = (safePage - 1) * RAVINTOLAT_PAGE_SIZE;
  const end = offset + RAVINTOLAT_PAGE_SIZE;
  return `*[${directoryFilter}]
    | order(${ORDERINGS[ordering]})
    [${offset}...${end}]{${cardProjection}}`;
}

/** Suodattimien osumamäärä — näytetään "N ravintolaa" ilman koko listan latausta. */
export const ravintolatCountQuery = defineQuery(`
  count(*[${directoryFilter}])
`);

/**
 * Suodatinvalikoiden sisältö. Vain arvot joista on ravintoloita — tyhjiä
 * valintoja ei tarjota.
 */
export const ravintolatFacetsQuery = defineQuery(`{
  "cities": *[_type == "kaupunki" && defined(slug.current)
      && count(*[_type == "ravintola" && references(^._id)]) > 0]
    | order(name asc){
      name,
      "slug": slug.current,
      "count": count(*[_type == "ravintola" && references(^._id) && closed != true])
    },
  "cuisines": array::unique(*[_type == "ravintola" && defined(cuisine)].cuisine[]),
  "total": count(*[_type == "ravintola" && defined(slug.current) && closed != true]),
  "closedCount": count(*[_type == "ravintola" && closed == true]),
  "firstVisitYear": *[_type == "ravintola" && defined(visitedAt)]
    | order(visitedAt asc)[0].visitedAt
}`);

export const ravintolaBySlugQuery = defineQuery(`
  *[_type == "ravintola" && slug.current == $slug][0]{
    ${cardProjection},
    _updatedAt,
    address,
    postalCode,
    phone,
    website,
    location,
    closedNote,
    pros,
    cons,
    visitedAt,
    visits,
    visitContext,
    review,
    images,
    seoTitle,
    seoDescription,
    "userReviews": *[_type == "ravintolaKayttajaArvostelu"
      && restaurant._ref == ^._id && status == "approved"]
      | order(submittedAt desc){
        _id,
        reviewerName,
        stars,
        comment,
        submittedAt
      },
    "related": *[_type == "ravintola" && defined(slug.current)
      && _id != ^._id && closed != true && city._ref == ^.city._ref]
      | order(coalesce(ratingOverall, stars, 0) desc, name asc)[0...3]{${cardProjection}}
  }
`);

export const ravintolaSlugsQuery = defineQuery(`
  *[_type == "ravintola" && defined(slug.current)].slug.current
`);

/** Arvostelulomakkeen ravintolavalikko — myös lopettaneet, käynti on voinut olla ennen. */
export const ravintolaOptionsQuery = defineQuery(`
  *[_type == "ravintola" && defined(slug.current)] | order(name asc){
    _id,
    name,
    "slug": slug.current,
    "city": city->name
  }
`);
