import { defineQuery, stegaClean } from "next-sanity";

import { MAAKUNNAT, SUOMI, isMaakunta } from "@/lib/maakunnat";
import { isCountryLevelPlace } from "@/lib/places";
import { slugify } from "@/lib/slugify";
import type { AlbumImage, SanityImage } from "@/lib/types";
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
  closed?: boolean | null;
  tiivistelma?: string | null;
  /** Yhden rivin tuomio korttiin. */
  tuomio?: string | null;
  /** Esim. "15 min stadionille". */
  stadionHuomio?: string | null;
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
  ottelupaivana?: string | null;
  images?: SanityImage[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  userReviews: RavintolaUserReview[];
  related: RavintolaCardData[];
};

export type RavintolaUserReview = {
  _id: string;
  reviewerName?: string | null;
  /** Osa-alueiden keskiarvo 1–5. */
  rating?: number | null;
  ratingFood?: number | null;
  ratingPrice?: number | null;
  ratingAtmosphere?: number | null;
  comment?: string | null;
  /** Kävijän liittämät kuvat (enintään 3, docs/18). */
  kuvat?: AlbumImage[] | null;
  submittedAt?: string | null;
};

/** Kaupunkisuodattimen valinta. */
export type RavintolaCityFacet = {
  name: string;
  slug: string;
  country: string | null;
  /** Vain suomalaisilla kaupungeilla. */
  maakunta: string | null;
  /** Toiminnassa olevat ravintolat (oletusnäkymä ei näytä lopettaneita). */
  count: number;
};

export type RavintolaCountryFacet = {
  name: string;
  /** `?maa=`-arvo: `lib/slugify.ts` maan nimestä, esim. "Venäjä" → "venaja". */
  slug: string;
  /** Kaikki `kaupunki.country`-kirjoitusasut, jotka tuottavat saman slugin. */
  names: string[];
  count: number;
};

export type RavintolaMaakuntaFacet = {
  /** `?maakunta=`-arvo, sama kuin Sanityyn tallennettu arvo. */
  value: string;
  title: string;
  count: number;
};

export type RavintolatFacetData = {
  cities: RavintolaCityFacet[];
  countries: RavintolaCountryFacet[];
  maakunnat: RavintolaMaakuntaFacet[];
  total: number;
  closedCount: number;
  /** Varhaisimman kirjatun käynnin päivä, esim. "1997-10-11". */
  firstVisitYear: string | null;
};

/** `ravintolatFacetsQuery`:n raakamuoto ennen `buildRavintolatFacets`-koostetta. */
export type RavintolatFacetsRaw = {
  places: {
    name: string | null;
    slug: string | null;
    country: string | null;
    maakunta: string | null;
    count: number;
  }[];
  total: number;
  closedCount: number;
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
  closed,
  tiivistelma,
  tuomio,
  stadionHuomio,
  "image": images[0]
`;

/**
 * Hakemiston suodatin. Kaikki parametrit ovat pakollisia kutsussa, mutta
 * `null` tarkoittaa "ei rajausta".
 *
 *  $citySlug      kaupungin slug tai null
 *  $countryNames  maan nimet (`kaupunki.country`) tai null. Sivu johtaa ne
 *                 `?maa=`-slugista facettien avulla (`countryNamesForSlug`),
 *                 koska GROQ:ssa ei ole merkkijonon korvausta, jolla slugin
 *                 voisi laskea nimestä kyselyssä. Tuntematon slug → [] → 0 osumaa.
 *  $maakuntaSlugs maakuntien arvot (`kaupunki.maakunta`) tai null. Useampi arvo
 *                 = mikä tahansa niistä (vanhat aluesivut, jotka ylittävät
 *                 maakunnan rajan). Maakunta huomioidaan vain Suomessa.
 *  $minRating     vähimmäisarvosana (0–5) tai null
 *  $includeClosed true = myös toimintansa lopettaneet
 */
const directoryFilter = /* groq */ `
  _type == "ravintola" && defined(slug.current)
  && ($citySlug == null || city->slug.current == $citySlug)
  && ($countryNames == null || city->country in $countryNames)
  && ($maakuntaSlugs == null
      || (city->country == "Suomi" && city->maakunta in $maakuntaSlugs))
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
 * Suodatinvalikoiden raaka-aineisto. Vain paikat, joissa on ravintoloita —
 * tyhjiä valintoja ei tarjota (esim. stadionputken Teplice ja Võru jäävät pois).
 *
 * GROQ:ssa ei ole ryhmittelyä, joten maat ja maakunnat koostetaan
 * paikkalistasta `buildRavintolatFacets`-funktiossa (≈ 90 riviä).
 */
export const ravintolatFacetsQuery = defineQuery(`{
  "places": *[_type == "kaupunki" && defined(slug.current)
      && count(*[_type == "ravintola" && references(^._id)]) > 0]
    | order(name asc){
      name,
      "slug": slug.current,
      country,
      maakunta,
      "count": count(*[_type == "ravintola" && references(^._id) && closed != true])
    },
  "total": count(*[_type == "ravintola" && defined(slug.current) && closed != true]),
  "closedCount": count(*[_type == "ravintola" && closed == true]),
  "firstVisitYear": *[_type == "ravintola" && defined(visitedAt)]
    | order(visitedAt asc)[0].visitedAt
}`);

const fi = (a: string, b: string) => a.localeCompare(b, "fi");

/** Koostaa kaupunki-, maa- ja maakuntavalinnat paikkalistasta. */
export function buildRavintolatFacets(dirty: RavintolatFacetsRaw): RavintolatFacetData {
  // Fasetit ovat vertailu- ja URL-arvoja (maa, maakunta, GROQ-parametrit):
  // luonnosnäkymän stega-merkit pois, muuten vertailut eivät täsmää.
  const raw = stegaClean(dirty);
  const places = raw.places.filter(
    (p): p is RavintolatFacetsRaw["places"][number] & { name: string; slug: string } =>
      Boolean(p.name && p.slug),
  );

  const countries = new Map<string, { names: Map<string, number>; count: number }>();
  const maakunnat = new Map<string, number>();
  for (const place of places) {
    const country = place.country?.trim();
    if (country) {
      const key = slugify(country);
      const entry = countries.get(key) ?? { names: new Map<string, number>(), count: 0 };
      entry.names.set(country, (entry.names.get(country) ?? 0) + 1);
      entry.count += place.count;
      countries.set(key, entry);
    }
    if (country === SUOMI && isMaakunta(place.maakunta)) {
      maakunnat.set(place.maakunta, (maakunnat.get(place.maakunta) ?? 0) + place.count);
    }
  }

  return {
    cities: places
      .filter((p) => !isCountryLevelPlace(p))
      .map((p) => ({
        name: p.name,
        slug: p.slug,
        country: p.country ?? null,
        maakunta: p.country === SUOMI && isMaakunta(p.maakunta) ? p.maakunta : null,
        count: p.count,
      })),
    countries: [...countries.entries()]
      .map(([slug, { names, count }]) => ({
        // Yleisin kirjoitusasu näytetään; kaikki asut rajaavat (`names`).
        name: [...names.entries()].sort((a, b) => b[1] - a[1] || fi(a[0], b[0]))[0][0],
        slug,
        names: [...names.keys()].sort(fi),
        count,
      }))
      // Suomi ensin, muut aakkosjärjestyksessä.
      .sort((a, b) => Number(b.name === SUOMI) - Number(a.name === SUOMI) || fi(a.name, b.name)),
    maakunnat: MAAKUNNAT.filter((m) => maakunnat.has(m.value))
      .map((m) => ({ value: m.value, title: m.title, count: maakunnat.get(m.value) ?? 0 }))
      .sort((a, b) => fi(a.title, b.title)),
    total: raw.total,
    closedCount: raw.closedCount,
    firstVisitYear: raw.firstVisitYear,
  };
}

/** `?maa=`-slug → GROQ:n `$countryNames`. Tuntematon slug → [] (ei osumia). */
export function countryNamesForSlug(facets: RavintolatFacetData, slug: string | null): string[] | null {
  if (!slug) return null;
  return facets.countries.find((c) => c.slug === slug)?.names ?? [];
}

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
    ottelupaivana,
    images,
    seoTitle,
    seoDescription,
    "userReviews": *[_type == "ravintolaKayttajaArvostelu"
      && restaurant._ref == ^._id]
      | order(submittedAt desc){
        _id,
        reviewerName,
        ratingFood,
        ratingPrice,
        ratingAtmosphere,
        "rating": math::avg([ratingFood, ratingPrice, ratingAtmosphere]),
        comment,
        "kuvat": kuvat[defined(asset)]{ _key, alt, asset },
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
