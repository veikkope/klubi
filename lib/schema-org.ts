/**
 * schema.org-rakenteet JSON-LD:tä varten.
 *
 * Kaksi tarkoitusta:
 *  1. Klassinen SEO — rikastetut hakutulokset (tähdet, tapahtuma-ajat, murupolku)
 *  2. GEO — vastausmoottori tunnistaa yhdistyksen entiteetiksi eikä merkkijonoksi
 *
 * Katso `docs/11-maali-ja-rinnakkaistoteutus.md` §6–7.
 */

import {
  absoluteUrl,
  foundingYear,
  siteCity,
  siteCountry,
  siteDescription,
  siteName,
  siteProfiles,
  siteUrl,
} from "@/lib/site";

type Json = Record<string, unknown>;

/** Poistaa tyhjät kentät, jotta JSON-LD ei sisällä nulleja. */
function compact(input: Json): Json {
  return Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) =>
        value !== null &&
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0),
    ),
  );
}

export const organizationId = `${siteUrl}/#organization`;
export const websiteId = `${siteUrl}/#website`;

export function organizationSchema(contact?: {
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  email?: string | null;
  phone?: string | null;
}): Json {
  return compact({
    "@type": "Organization",
    "@id": organizationId,
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    foundingDate: foundingYear,
    sameAs: siteProfiles,
    email: contact?.email,
    telephone: contact?.phone,
    address: compact({
      "@type": "PostalAddress",
      streetAddress: contact?.address,
      postalCode: contact?.postalCode,
      addressLocality: contact?.city ?? siteCity,
      addressCountry: siteCountry,
    }),
  });
}

export function websiteSchema(): Json {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: siteUrl,
    name: siteName,
    inLanguage: "fi-FI",
    publisher: { "@id": organizationId },
  };
}

/** Sama muoto kuin `components/layout/breadcrumbs.tsx` — viimeisellä ei ole linkkiä. */
export interface Crumb {
  label: string;
  href?: string;
}

export function breadcrumbSchema(trail: Crumb[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) =>
      compact({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.label,
        item: crumb.href ? absoluteUrl(crumb.href) : undefined,
      }),
    ),
  };
}

export function articleSchema(input: {
  title: string;
  description?: string | null;
  path: string;
  image?: string | null;
  publishedAt?: string | null;
  modifiedAt?: string | null;
}): Json {
  return compact({
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    image: input.image,
    datePublished: input.publishedAt,
    dateModified: input.modifiedAt ?? input.publishedAt,
    inLanguage: "fi-FI",
    author: { "@id": organizationId },
    publisher: { "@id": organizationId },
  });
}

export function eventSchema(input: {
  title: string;
  description?: string | null;
  path: string;
  startDate?: string | null;
  endDate?: string | null;
  locationName?: string | null;
  locationAddress?: string | null;
  image?: string | null;
}): Json {
  return compact({
    "@type": "Event",
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    startDate: input.startDate,
    endDate: input.endDate,
    image: input.image,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: { "@id": organizationId },
    location: input.locationName
      ? compact({
          "@type": "Place",
          name: input.locationName,
          address: input.locationAddress ?? siteCity,
        })
      : undefined,
  });
}

export function restaurantSchema(input: {
  name: string;
  description?: string | null;
  path: string;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  phone?: string | null;
  website?: string | null;
  image?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  closed?: boolean;
}): Json {
  return compact({
    "@type": "Restaurant",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    telephone: input.phone,
    sameAs: input.website,
    image: input.image,
    address: compact({
      "@type": "PostalAddress",
      streetAddress: input.address,
      postalCode: input.postalCode,
      addressLocality: input.city,
      addressCountry: siteCountry,
    }),
    // Arvion antaa klubi, ei yleisö — kerrotaan se rehellisesti.
    review:
      typeof input.rating === "number"
        ? {
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: input.rating,
              bestRating: 5,
              worstRating: 0,
            },
            author: { "@id": organizationId },
          }
        : undefined,
    ...(input.closed ? { additionalProperty: { "@type": "PropertyValue", name: "Toiminta loppunut", value: true } } : {}),
  });
}

export function datasetSchema(input: {
  title: string;
  description?: string | null;
  path: string;
  modifiedAt?: string | null;
}): Json {
  return compact({
    "@type": "Dataset",
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    dateModified: input.modifiedAt,
    inLanguage: "fi-FI",
    creator: { "@id": organizationId },
    license: `${siteUrl}/klubi`,
  });
}

export function placeSchema(input: {
  name: string;
  description?: string | null;
  path: string;
  /** `StadiumOrArena` stadioneille, muuten `Place`. */
  placeType?: "Place" | "StadiumOrArena";
  city?: string | null;
  country?: string | null;
  capacity?: number | null;
  openedYear?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  image?: string | null;
}): Json {
  return compact({
    "@type": input.placeType ?? "Place",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    image: input.image,
    maximumAttendeeCapacity: input.capacity,
    foundingDate: input.openedYear ? String(input.openedYear) : undefined,
    address: compact({
      "@type": "PostalAddress",
      addressLocality: input.city,
      addressCountry: input.country,
    }),
    geo:
      typeof input.latitude === "number" && typeof input.longitude === "number"
        ? {
            "@type": "GeoCoordinates",
            latitude: input.latitude,
            longitude: input.longitude,
          }
        : undefined,
  });
}

export function personSchema(input: {
  name: string;
  description?: string | null;
  path: string;
  birthDate?: string | null;
  image?: string | null;
}): Json {
  return compact({
    "@type": "Person",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    birthDate: input.birthDate,
    image: input.image,
  });
}

export function collectionPageSchema(input: {
  title: string;
  description?: string | null;
  path: string;
  itemCount?: number | null;
}): Json {
  return compact({
    "@type": "CollectionPage",
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    inLanguage: "fi-FI",
    isPartOf: { "@id": websiteId },
    ...(typeof input.itemCount === "number"
      ? { mainEntity: { "@type": "ItemList", numberOfItems: input.itemCount } }
      : {}),
  });
}

export function webPageSchema(input: {
  title: string;
  description?: string | null;
  path: string;
  modifiedAt?: string | null;
}): Json {
  return compact({
    "@type": "WebPage",
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    dateModified: input.modifiedAt,
    inLanguage: "fi-FI",
    isPartOf: { "@id": websiteId },
  });
}
