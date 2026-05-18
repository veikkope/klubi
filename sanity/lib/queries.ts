/**
 * GROQ-kyselyt sivuston datan hakemiseen. Tyypit `lib/types.ts`:ssä.
 */

export const navigationQuery = /* groq */ `
  *[_type == "navigaatio"][0]{
    items[]{
      label,
      href,
      highlight,
      children[]{ label, href }
    }
  }
`;

export const contactQuery = /* groq */ `
  *[_type == "yhteystiedot"][0]{
    address,
    postalCode,
    city,
    email,
    phone,
    yTunnus,
    iban,
    socials[]{ platform, url },
    location
  }
`;

export const etusivuQuery = /* groq */ `
  *[_type == "etusivu"][0]{
    heroEyebrow,
    heroTitle,
    heroDescription,
    heroImage,
    heroCtas[]{ label, href, primary },
    blocks[]{
      _type,
      _key,
      heading,
      count,
      body,
      image,
      ctaLabel,
      ctaHref,
      "city": city->{ _ref, name }
    }
  }
`;

export const sivuWithAncestorsQuery = /* groq */ `
  {
    "sivu": *[_type == "sivu" && slug.current == $slug][0]{
      _id,
      title,
      "slug": slug.current,
      hero,
      ingress,
      body,
      seo
    },
    "ancestors": *[_type == "sivu" && slug.current in $ancestors]{
      title,
      "slug": slug.current
    }
  }
`;

export const allSivuSlugsQuery = /* groq */ `
  *[_type == "sivu" && defined(slug.current)][].slug.current
`;

export const recentUutisetQuery = /* groq */ `
  *[_type == "uutinen" && defined(slug.current)] | order(publishedAt desc)[0...$count]{
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    coverImage,
    categories
  }
`;

/**
 * Kaikki uutiset, valinnainen kategoriasuodatus. Jos $category on null,
 * palauttaa kaikki uutiset.
 */
export const uutisetListQuery = /* groq */ `
  *[_type == "uutinen" && defined(slug.current)
    && ($category == null || $category in categories)]
    | order(publishedAt desc){
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    coverImage,
    categories
  }
`;

export const uutinenBySlugQuery = /* groq */ `
  *[_type == "uutinen" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    coverImage,
    body,
    categories,
    "author": author->{ name, role, image },
    seo
  }
`;

export const relatedUutisetQuery = /* groq */ `
  *[_type == "uutinen" && defined(slug.current) && slug.current != $slug
    && count((categories[])[@ in $categories]) > 0]
    | order(publishedAt desc)[0...$count]{
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    coverImage,
    categories
  }
`;

export const allUutinenSlugsQuery = /* groq */ `
  *[_type == "uutinen" && defined(slug.current)][].slug.current
`;

export const upcomingTapahtumatQuery = /* groq */ `
  *[_type == "tapahtuma" && defined(slug.current) && startsAt >= now()]
    | order(startsAt asc)[0...$count]{
    _id,
    title,
    "slug": slug.current,
    startsAt,
    endsAt,
    location,
    image
  }
`;

export const allUpcomingTapahtumatQuery = /* groq */ `
  *[_type == "tapahtuma" && defined(slug.current) && startsAt >= now()]
    | order(startsAt asc){
    _id,
    title,
    "slug": slug.current,
    startsAt,
    endsAt,
    location,
    image
  }
`;

export const pastTapahtumatQuery = /* groq */ `
  *[_type == "tapahtuma" && defined(slug.current) && startsAt < now()]
    | order(startsAt desc)[0...$count]{
    _id,
    title,
    "slug": slug.current,
    startsAt,
    endsAt,
    location,
    image
  }
`;

export const tapahtumaBySlugQuery = /* groq */ `
  *[_type == "tapahtuma" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    startsAt,
    endsAt,
    location,
    image,
    description,
    signupUrl,
    signupEmail,
    seo
  }
`;

export const allTapahtumaSlugsQuery = /* groq */ `
  *[_type == "tapahtuma" && defined(slug.current)][].slug.current
`;

export const galleriaListQuery = /* groq */ `
  *[_type == "galleriaAlbumi" && defined(slug.current)]
    | order(date desc){
    _id,
    title,
    "slug": slug.current,
    date,
    coverImage,
    "imageCount": count(images)
  }
`;

export const galleriaBySlugQuery = /* groq */ `
  *[_type == "galleriaAlbumi" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    date,
    coverImage,
    images,
    "event": event->{ title, "slug": slug.current }
  }
`;

export const allGalleriaSlugsQuery = /* groq */ `
  *[_type == "galleriaAlbumi" && defined(slug.current)][].slug.current
`;

export const topRavintolatQuery = /* groq */ `
  *[_type == "ravintola" && defined(slug.current)
    && ($cityId == null || city._ref == $cityId)]
    | order(stars desc, name asc)[0...$count]{
    _id,
    name,
    "slug": slug.current,
    "city": city->{ name, "slug": slug.current },
    stars,
    priceLevel,
    cuisine,
    "image": images[0]
  }
`;

/**
 * Suodatettu ravintolalistaus. Kaikki suodatinparametrit valinnaisia:
 *  $citySlug  — kaupungin slug, esim. "lahti"
 *  $cuisine   — yksi ruokatyyppi (esim. "pizza")
 *  $minStars  — minimitähtimäärä (1–5)
 *  $price     — hintaluokka ("€" | "€€" | "€€€")
 */
export const ravintolatListQuery = /* groq */ `
  *[_type == "ravintola" && defined(slug.current)
    && ($citySlug == null || city->slug.current == $citySlug)
    && ($cuisine == null || $cuisine in cuisine)
    && ($minStars == null || stars >= $minStars)
    && ($price == null || priceLevel == $price)]
    | order(stars desc, name asc){
    _id,
    name,
    "slug": slug.current,
    "city": city->{ name, "slug": slug.current },
    stars,
    priceLevel,
    cuisine,
    "image": images[0]
  }
`;

/** Saatavilla olevat suodatinarvot — vain ne joista on ravintoloita. */
export const ravintolatFacetsQuery = /* groq */ `
  {
    "cities": array::unique(*[_type == "ravintola" && defined(city)]{
      "name": city->name,
      "slug": city->slug.current
    }) | order(name asc),
    "cuisines": array::unique(*[_type == "ravintola"].cuisine[]),
    "priceLevels": array::unique(*[_type == "ravintola" && defined(priceLevel)].priceLevel) | order(@ asc)
  }
`;

export const ravintolaBySlugQuery = /* groq */ `
  *[_type == "ravintola" && slug.current == $slug][0]{
    _id,
    name,
    "slug": slug.current,
    "city": city->{ name, "slug": slug.current, country },
    address,
    location,
    cuisine,
    priceLevel,
    stars,
    review,
    visitedAt,
    images,
    website,
    seo,
    "userReviews": *[_type == "ravintolaKayttajaArvostelu"
      && restaurant._ref == ^._id && status == "approved"]
      | order(submittedAt desc){
      _id,
      reviewerName,
      stars,
      comment,
      submittedAt
    }
  }
`;

export const allRavintolaSlugsQuery = /* groq */ `
  *[_type == "ravintola" && defined(slug.current)][].slug.current
`;
