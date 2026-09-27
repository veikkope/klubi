/**
 * Jalkapalloarkiston laajennusosiot: arvokisat, pelaajat ja stadionit.
 *
 * Oma tiedostonsa, koska Gate 1:n agentit kirjoittavat rinnakkain eikä
 * yhteiseen `sanity/lib/queries.ts`:ään voi koskea ilman että joku ylikirjoittaa
 * toisen työn. Katso `docs/11-maali-ja-rinnakkaistoteutus.md` §3.
 *
 * Kyselyt kirjoitetaan `defineQuery`-funktiolla **kokonaisina merkkijonoina**
 * ilman interpolointia: `sanity typegen` lukee lähdekoodia staattisesti eikä
 * tunnista koostettua kyselyä. Toisteinen projektio on siis tarkoituksellinen —
 * se on hinta siitä, että tyypit voidaan myöhemmin generoida.
 *
 * Tulostyypit ovat toistaiseksi käsin kirjoitettuina, koska Sanity-projektia ei
 * ole vielä luotu eikä `npm run typegen` ole ajettavissa. Ne vastaavat kyselyn
 * projektiota kenttä kentältä.
 */

import { defineQuery } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/react";

import type { SanityImage } from "@/lib/types";
import type { TilastoDoc } from "@/sanity/lib/queries/arkisto";

/* -------------------------------------------------------------------------- */
/* Jaetut tyypit                                                              */
/* -------------------------------------------------------------------------- */

/** Tilastotaulukon sarake. Vastaa `jalkapalloTilasto.columns`-kenttää. */
export type TilastoColumn = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "year" | "link" | null;
};

/** Tilastotaulukon rivi. Vastaa `jalkapalloTilasto.rows`-kenttää. */
export type TilastoRow = {
  cells?: { key: string; value?: string | null }[] | null;
};

export type TilastoTable = {
  _id: string;
  title: string;
  slug: string | null;
  tiivistelma?: string | null;
  columns?: TilastoColumn[] | null;
  rows?: TilastoRow[] | null;
};

/**
 * Suodattaa pois dokumentit joilta puuttuu slug.
 *
 * Kysely rajaa ne jo pois, mutta tyyppitasolla `slug` on nullable — tämä tekee
 * siitä varmasti merkkijonon, jolloin linkkiä ei tarvitse rakentaa arvaamalla.
 */
export function withSlug<T extends { slug: string | null }>(
  items: T[],
): (T & { slug: string })[] {
  return items.filter((item): item is T & { slug: string } =>
    Boolean(item.slug),
  );
}

/* -------------------------------------------------------------------------- */
/* Arvokisat                                                                  */
/* -------------------------------------------------------------------------- */

/** Kisatyypit listaussivun ryhmittelyjärjestyksessä. */
export const KISATYYPIT = [
  "mm",
  "em",
  "kansojen-liiga",
  "olympialaiset",
  "u21-em",
  "muu",
] as const;

export type Kisatyyppi = (typeof KISATYYPIT)[number];

const KISATYYPPI_LABELS: Record<Kisatyyppi, string> = {
  mm: "MM-kisat",
  em: "EM-kisat",
  "kansojen-liiga": "Kansojen liiga",
  olympialaiset: "Olympialaiset",
  "u21-em": "Alle 21-vuotiaiden EM",
  muu: "Muut kisat",
};

/** Kisatyypin näkyvä nimi. Tuntematon arvo palautetaan sellaisenaan. */
export function kisatyyppiLabel(value?: string | null): string {
  if (!value) return KISATYYPPI_LABELS.muu;
  return KISATYYPPI_LABELS[value as Kisatyyppi] ?? value;
}

export type ArvokisaCard = {
  _id: string;
  title: string;
  slug: string | null;
  tiivistelma?: string | null;
  kisatyyppi?: string | null;
  vuosi?: number | null;
  isantamaat?: string[] | null;
  voittaja?: string | null;
  suomenSijoitus?: string | null;
};

export type ArvokisaFull = ArvokisaCard & {
  _updatedAt: string;
  alkuPvm?: string | null;
  loppuPvm?: string | null;
  hopea?: string | null;
  pronssi?: string | null;
  kuvaus?: PortableTextBlock[] | null;
  /** Lohko- ja mitalitaulukot samassa muodossa kuin arkiston tilastosivuilla. */
  tilastot?: TilastoDoc[] | null;
  kuvat?: SanityImage[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export const arvokisatListQuery = defineQuery(`
  *[_type == "arvokisa" && defined(slug.current)] | order(vuosi desc, title asc){
    _id,
    title,
    "slug": slug.current,
    tiivistelma,
    kisatyyppi,
    vuosi,
    isantamaat,
    voittaja,
    suomenSijoitus
  }
`);

export const arvokisaSlugsQuery = defineQuery(`
  *[_type == "arvokisa" && defined(slug.current)][].slug.current
`);

export const arvokisaBySlugQuery = defineQuery(`
  *[_type == "arvokisa" && slug.current == $slug][0]{
    _id,
    _updatedAt,
    title,
    "slug": slug.current,
    tiivistelma,
    kisatyyppi,
    vuosi,
    isantamaat,
    voittaja,
    suomenSijoitus,
    alkuPvm,
    loppuPvm,
    hopea,
    pronssi,
    kuvaus,
    tilastot[]->{
      _id,
      _updatedAt,
      title,
      "slug": slug.current,
      tiivistelma,
      category,
      intro,
      columns[]{ key, label, type },
      rows[]{ cells[]{ key, value } },
      lisatiedot,
      kuvat[]{ _key, alt, caption, asset, hotspot, crop },
      paivitetty,
      jarjestys,
      "sources": coalesce(sources, [])
    },
    kuvat[]{ _key, alt, caption, asset, hotspot, crop },
    seoTitle,
    seoDescription
  }
`);

/**
 * Arvokisatilastot, joihin mikään kisa ei viittaa: MM- ja EM-kisojen sekä
 * Kansojen liigan mitalitaulukot. Lohkotaulukot näkyvät kisansa sivulla.
 */
export const arvokisaMitalitaulukotQuery = defineQuery(`
  *[
    _type == "jalkapalloTilasto"
    && category == "arvokisa"
    && count(*[_type == "arvokisa" && references(^._id)]) == 0
  ] | order(coalesce(jarjestys, 1000) asc, title asc){
    _id,
      _updatedAt,
      title,
      "slug": slug.current,
      tiivistelma,
      category,
      intro,
      columns[]{ key, label, type },
      rows[]{ cells[]{ key, value } },
      lisatiedot,
      kuvat[]{ _key, alt, caption, asset, hotspot, crop },
      paivitetty,
      jarjestys,
      "sources": coalesce(sources, [])
  }
`);

/** Saman kisatyypin muut kisat sisäistä linkitystä varten. */
export const arvokisatRelatedQuery = defineQuery(`
  *[_type == "arvokisa" && defined(slug.current)
    && slug.current != $slug
    && kisatyyppi == $kisatyyppi] | order(vuosi desc)[0...4]{
    _id,
    title,
    "slug": slug.current,
    tiivistelma,
    kisatyyppi,
    vuosi,
    isantamaat,
    voittaja,
    suomenSijoitus
  }
`);

/* -------------------------------------------------------------------------- */
/* Pelaajat                                                                   */
/* -------------------------------------------------------------------------- */

const PELIPAIKKA_LABELS: Record<string, string> = {
  maalivahti: "Maalivahti",
  puolustaja: "Puolustaja",
  keskikentta: "Keskikenttäpelaaja",
  hyokkaaja: "Hyökkääjä",
};

/** Pelipaikan näkyvä nimi. Tuntematon arvo palautetaan sellaisenaan. */
export function pelipaikkaLabel(value?: string | null): string | null {
  if (!value) return null;
  return PELIPAIKKA_LABELS[value] ?? value;
}

export type PelaajaSeura = {
  _key?: string | null;
  seura: string;
  alkuvuosi?: number | null;
  loppuvuosi?: number | null;
};

export type PelaajaCard = {
  _id: string;
  name: string;
  slug: string | null;
  tiivistelma?: string | null;
  pelipaikka?: string | null;
  maaottelut?: number | null;
  maalit?: number | null;
  kuva?: SanityImage | null;
};

export type PelaajaFull = Omit<PelaajaCard, "kuva"> & {
  _updatedAt: string;
  syntymaaika?: string | null;
  seurat?: PelaajaSeura[] | null;
  kuvaus?: PortableTextBlock[] | null;
  /** Pelaajaan liittyvät taulukot, esim. loukkaantumiset. */
  tilastot?: TilastoDoc[] | null;
  kuvat?: SanityImage[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export const pelaajatListQuery = defineQuery(`
  *[_type == "pelaaja" && defined(slug.current)] | order(name asc){
    _id,
    name,
    "slug": slug.current,
    tiivistelma,
    pelipaikka,
    maaottelut,
    maalit,
    "kuva": kuvat[0]{ alt, caption, asset, hotspot, crop }
  }
`);

export const pelaajaSlugsQuery = defineQuery(`
  *[_type == "pelaaja" && defined(slug.current)][].slug.current
`);

export const pelaajaBySlugQuery = defineQuery(`
  *[_type == "pelaaja" && slug.current == $slug][0]{
    _id,
    _updatedAt,
    name,
    "slug": slug.current,
    tiivistelma,
    pelipaikka,
    maaottelut,
    maalit,
    syntymaaika,
    seurat[]{ _key, seura, alkuvuosi, loppuvuosi },
    kuvaus,
    tilastot[]->{
      _id,
      _updatedAt,
      title,
      "slug": slug.current,
      tiivistelma,
      category,
      intro,
      columns[]{ key, label, type },
      rows[]{ cells[]{ key, value } },
      lisatiedot,
      kuvat[]{ _key, alt, caption, asset, hotspot, crop },
      paivitetty,
      jarjestys,
      "sources": coalesce(sources, [])
    },
    kuvat[]{ _key, alt, caption, asset, hotspot, crop },
    seoTitle,
    seoDescription
  }
`);

/** Muut pelaajat sisäistä linkitystä varten. */
export const pelaajatRelatedQuery = defineQuery(`
  *[_type == "pelaaja" && defined(slug.current) && slug.current != $slug]
    | order(coalesce(maaottelut, 0) desc, name asc)[0...4]{
    _id,
    name,
    "slug": slug.current,
    tiivistelma,
    pelipaikka,
    maaottelut,
    maalit,
    "kuva": kuvat[0]{ alt, caption, asset, hotspot, crop }
  }
`);

/* -------------------------------------------------------------------------- */
/* Stadionit                                                                  */
/* -------------------------------------------------------------------------- */

export type StadionCity = {
  name?: string | null;
  slug?: string | null;
  country?: string | null;
};

export type StadionCard = {
  _id: string;
  name: string;
  slug: string | null;
  tiivistelma?: string | null;
  capacity?: number | null;
  openedYear?: number | null;
  city?: StadionCity | null;
  kuva?: SanityImage | null;
};

/** Sanityn `geopoint`. `alt` on korkeus metreinä, ei kuvateksti. */
export type StadionLocation = {
  lat?: number | null;
  lng?: number | null;
  alt?: number | null;
};

export type StadionFull = Omit<StadionCard, "kuva"> & {
  _updatedAt: string;
  address?: string | null;
  location?: StadionLocation | null;
  description?: PortableTextBlock[] | null;
  images?: SanityImage[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export const stadionitListQuery = defineQuery(`
  *[_type == "stadion" && defined(slug.current)]
    | order(city->country asc, name asc){
    _id,
    name,
    "slug": slug.current,
    tiivistelma,
    capacity,
    openedYear,
    "city": city->{ name, "slug": slug.current, country },
    "kuva": images[0]{ alt, caption, asset, hotspot, crop }
  }
`);

export const stadionSlugsQuery = defineQuery(`
  *[_type == "stadion" && defined(slug.current)][].slug.current
`);

export const stadionBySlugQuery = defineQuery(`
  *[_type == "stadion" && slug.current == $slug][0]{
    _id,
    _updatedAt,
    name,
    "slug": slug.current,
    tiivistelma,
    capacity,
    openedYear,
    address,
    "city": city->{ name, "slug": slug.current, country },
    location{ lat, lng, alt },
    description,
    images[]{ _key, alt, caption, asset, hotspot, crop },
    seoTitle,
    seoDescription
  }
`);

/** Saman kaupungin muut stadionit ensin, sitten muut. */
export const stadionitRelatedQuery = defineQuery(`
  *[_type == "stadion" && defined(slug.current) && slug.current != $slug]
    | order(select(city->name == $cityName => 0, 1) asc, name asc)[0...4]{
    _id,
    name,
    "slug": slug.current,
    tiivistelma,
    capacity,
    openedYear,
    "city": city->{ name, "slug": slug.current, country },
    "kuva": images[0]{ alt, caption, asset, hotspot, crop }
  }
`);
