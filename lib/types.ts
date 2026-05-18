/**
 * Yhteiset TypeScript-tyypit Sanity-datalle. Pidä synkronoituna skeemojen
 * (`sanity/schemas/**`) kanssa.
 */

import type { PortableTextBlock } from "@portabletext/react";

export type SanityImage = {
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
      heading?: string;
      count?: number;
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
      heading?: string;
      body?: PortableTextBlock[] | null;
      image?: SanityImage;
      ctaLabel?: string;
      ctaHref?: string;
    }
  | {
      _type: "ravintolatSpotlight";
      _key: string;
      heading?: string;
      city?: { _ref: string; name?: string } | null;
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
  blocks: EtusivuBlock[];
};

export type SivuData = {
  _id: string;
  title: string;
  slug: string;
  hero?: SanityImage;
  ingress?: string | null;
  body?: PortableTextBlock[] | null;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: SanityImage;
  } | null;
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
  | "tiedote"
  | "tapahtumaraportti"
  | "jasentieto"
  | "jalkapallo"
  | "ravintola";

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
  coverImage: SanityImage;
  images: AlbumImage[];
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
