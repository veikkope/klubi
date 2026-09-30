/**
 * Jaetut GROQ-kyselyt: layout, geneeriset `sivu`-dokumentit ja galleria.
 *
 * Osiokohtaiset kyselyt ovat `sanity/lib/queries/`-kansiossa (klubi, arkisto,
 * ravintolat, uutiset, etusivu). Tänne jäävät vain ne, joita useampi osio
 * käyttää tai jotka eivät kuulu millekään yksittäiselle osiolle.
 *
 * Yksi aito GROQ-rajoite tässä projektissa: `order()` ei ota kenttänimeä
 * muuttujasta — `order($field desc)` tulkitsee `$field`:n arvoksi, ei kentäksi.
 * Lajittelu on siksi valittava kyselyä rakennettaessa.
 *
 * Viipalointi parametreilla (`[0...$count]`, `[$offset...$end]`) sen sijaan
 * TOIMII Sanityn API:a vasten. Huom: paikallinen `groq-js`-parseri hylkää sen,
 * joten sillä tehty validointi antaa tässä väärän negatiivisen.
 *
 * SEO-kentät ovat litteitä (`seoTitle`, `seoDescription`) — `seo` on Studion
 * kenttäryhmän nimi, ei kenttä. Sen projisointi palauttaa aina nullin.
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
    // Singleton luodaan migraatiossa tyhjänä (docs/12 §3 M6): tyhjä lista
    // eikä null, jotta sivut eivät kaadu ennen kuin sihteeri täyttää kentät.
    "socials": coalesce(socials[]{ platform, url }, []),
    location
  }
`;

export const sivuWithAncestorsQuery = /* groq */ `
  {
    "sivu": *[_type == "sivu" && slug.current == $slug][0]{
      _id,
      title,
      "slug": slug.current,
      kieli,
      hero,
      ingress,
      tiivistelma,
      body,
      seoTitle,
      seoDescription,
      "updatedAt": _updatedAt
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

/** Uusimmat uutiset etusivun nostoon. */
export const recentUutisetQuery = /* groq */ `
  *[_type == "uutinen" && defined(slug.current)]
    | order(publishedAt desc)[0...$count]{
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    tiivistelma,
    coverImage,
    categories
  }
`;

/** Tulevat tapahtumat etusivun nostoon. */
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

export const galleriaListQuery = /* groq */ `
  *[_type == "galleriaAlbumi" && defined(slug.current)]
    | order(date desc){
    _id,
    title,
    "slug": slug.current,
    date,
    tiivistelma,
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
    tiivistelma,
    coverImage,
    images,
    "updatedAt": _updatedAt,
    "event": event->{ title, "slug": slug.current }
  }
`;

export const allGalleriaSlugsQuery = /* groq */ `
  *[_type == "galleriaAlbumi" && defined(slug.current)][].slug.current
`;
