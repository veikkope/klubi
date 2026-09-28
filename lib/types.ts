/**
 * Yhteiset TypeScript-tyypit Sanity-datalle. Pidä synkronoituna skeemojen
 * (`sanity/schemas/**`) kanssa.
 */

import type { PortableTextBlock } from "@portabletext/react";

export type SanityImage = {
  _key?: string;
  _type?: "imageWithAlt" | "image";
  asset?: { _ref?: string; _id?: string; url?: string } | null;
  alt?: string | null;
  caption?: string | null;
  hotspot?: { x: number; y: number } | null;
} | null;

export type NavigationItem = {
  label: string;
  href: string;
  highlight?: boolean;
  children?: { label: string; href: string }[];
};

export type NavigationData = {
  items: NavigationItem[];
};

export type SocialLink = {
  platform: "youtube" | "facebook" | "instagram" | "linkedin" | "x";
  url: string;
};

export type ContactData = {
  address: string;
  postalCode: string;
  city: string;
  email: string;
  phone?: string | null;
  yTunnus?: string | null;
  iban?: string | null;
  socials: SocialLink[];
  location?: { lat: number; lng: number } | null;
};

export type HeroCta = { label: string; href: string; primary?: boolean };

export type EtusivuBlock =
  | {
      _type: "uutiset";
      _key: string;
      eyebrow?: string;
      heading?: string;
      count?: number;
    }
  | {
      _type: "otteluohjelma";
      _key: string;
      ottelutHeading?: string;
      ottelutCount?: number;
      tapahtumatHeading?: string;
      tapahtumatCount?: number;
    }
  | {
      _type: "tapahtumat";
      _key: string;
      heading?: string;
      count?: number;
    }
  | {
      _type: "esittely";
      _key: string;
      eyebrow?: string;
      heading?: string;
      body?: PortableTextBlock[] | null;
      image?: SanityImage;
      ctaLabel?: string;
      ctaHref?: string;
    }
  | {
      _type: "ravintolatSpotlight";
      _key: string;
      eyebrow?: string;
      heading?: string;
      city?: { _ref: string; name?: string } | null;
      count?: number;
    }
  | {
      _type: "jalkapalloarkisto";
      _key: string;
      heading?: string;
      body?: string;
      ctaLabel?: string;
      ctaHref?: string;
    }
  | {
      _type: "galleria";
      _key: string;
      heading?: string;
      count?: number;
    }
  | {
      _type: "cta";
      _key: string;
      heading: string;
      body?: string;
      ctaLabel: string;
      ctaHref: string;
    };

export type EtusivuData = {
  heroEyebrow?: string;
  heroTitle: string;
  heroDescription: string;
  heroImage?: SanityImage;
  heroCtas?: HeroCta[];
  /** Vanhan etusivun "Seuraavaksi"-nosto. Ei enää näytetä (otteluohjelma korvaa). */
  seuraavaOttelu?: { ottelu?: string | null; kilpailu?: string | null; aika?: string | null } | null;
  blocks: EtusivuBlock[];
};

export type SivuData = {
  _id: string;
  title: string;
  slug: string;
  hero?: SanityImage;
  ingress?: string | null;
  /** Itsenäinen 2–3 virkkeen tiivistelmä — sivun ingressi ja siteerattava vastaus. */
  tiivistelma?: string | null;
  body?: PortableTextBlock[] | null;
  /**
   * SEO-kentät ovat litteitä, koska `seo` on Studion kenttäryhmän nimi eikä
   * kenttä. Objektimuotoinen `seo`-projektio palautti aina nullin.
   */
  seoTitle?: string | null;
  seoDescription?: string | null;
  updatedAt?: string | null;
};

export type SivuAncestor = {
  title: string;
  slug: string;
};

export type SivuWithAncestors = {
  sivu: SivuData | null;
  ancestors: SivuAncestor[];
};

export type UutinenCategory =
  | "otteluraportti"
  | "kannattajakulttuuri"
  | "tiedote"
  | "tapahtumaraportti"
  | "jasentieto"
  | "jalkapallo"
  | "ravintola"
  | "blogi"
  | "palloveikkaus"
  | "matkakuvaus";

export type UutinenCard = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  excerpt: string;
  coverImage?: SanityImage;
  categories?: UutinenCategory[] | null;
};

export type UutinenAuthor = {
  name: string;
  role?: string;
  image?: SanityImage;
};

export type UutinenFull = UutinenCard & {
  body?: PortableTextBlock[] | null;
  author?: UutinenAuthor | null;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: SanityImage;
  } | null;
};

export type TapahtumaCard = {
  _id: string;
  title: string;
  slug: string;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
  /** Yhden rivin kuvaus korttiin. */
  tiivistelma?: string | null;
  /** Juhla tai merkkipäivä: kortti saa messinkikorostuksen. */
  juhla?: boolean | null;
  image?: SanityImage;
};

export type TapahtumaFull = TapahtumaCard & {
  description?: PortableTextBlock[] | null;
  signupUrl?: string | null;
  signupEmail?: string | null;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: SanityImage;
  } | null;
};

export type AlbumCard = {
  _id: string;
  title: string;
  slug: string;
  date: string;
  tiivistelma?: string | null;
  coverImage: SanityImage;
  imageCount: number;
};

export type AlbumImage = {
  _key?: string;
  asset?: { _ref?: string; _id?: string; url?: string } | null;
  alt?: string | null;
  caption?: string | null;
};

export type AlbumFull = {
  _id: string;
  title: string;
  slug: string;
  date: string;
  tiivistelma?: string | null;
  coverImage: SanityImage;
  images: AlbumImage[];
  updatedAt?: string | null;
  event?: { title: string; slug: string } | null;
};

export type RavintolaCard = {
  _id: string;
  name: string;
  slug: string;
  city?: { name: string; slug: string } | null;
  stars: number;
  priceLevel?: string | null;
  cuisine?: string[] | null;
  image?: SanityImage;
};

export type UserReview = {
  _id: string;
  reviewerName: string;
  stars: number;
  comment: string;
  submittedAt: string;
};

export type RavintolaFull = {
  _id: string;
  name: string;
  slug: string;
  city?: { name: string; slug: string; country?: string } | null;
  address?: string | null;
  location?: { lat: number; lng: number } | null;
  cuisine?: string[] | null;
  priceLevel?: string | null;
  stars: number;
  review?: PortableTextBlock[] | null;
  visitedAt?: string | null;
  images?: SanityImage[] | null;
  website?: string | null;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: SanityImage;
  } | null;
  userReviews: UserReview[];
};

export type RavintolatFacets = {
  cities: { name: string; slug: string }[];
  cuisines: string[];
  priceLevels: string[];
};

/* Kommentit ja veikkaus (docs/15) */

export type KommentointiTyyppi = "kommentti" | "sarjajarjestys" | "voittajaveikkaus";

/** `uutinen.kommentointi` Sanitysta. */
export interface Kommentointi {
  kaytossa?: boolean | null;
  tyyppi?: KommentointiTyyppi | null;
  sulkeutuu?: string | null;
  vaihtoehdot?: string[] | null;
  sijoituksia?: number | null;
  maalikuningas?: boolean | null;
  ohje?: string | null;
}

/** Sivulla näytettävä kommentti. */
export interface KommenttiItem {
  _id: string;
  nimi: string;
  teksti?: string | null;
  veikkaus?: { jarjestys?: string[] | null; maalikuningas?: string | null } | null;
  lahetetty: string;
  lahde?: "sivusto" | "blogspot" | null;
}
