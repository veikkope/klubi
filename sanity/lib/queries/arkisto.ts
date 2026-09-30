/**
 * Jalkapalloarkiston GROQ-kyselyt.
 *
 * Kaikki arkiston sisältö tulee `jalkapalloTilasto`-dokumenteista. Dokumentin
 * `columns` ja `rows` on muotoiltu niin, että ne menevät sellaisenaan
 * `<StatTable />`-komponentille — siksi projektio ei muotoile niitä uudelleen.
 *
 * Sivun ja sisällön välinen sidos on yksinomaan `category`-kentässä: yksi
 * kategoria vastaa yhtä sivua. Slugin nimeämiseen perustuvia suodattimia ei
 * käytetä, koska ne siirtäisivät sivun toiminnan kiinni siihen, miten taulukko
 * sattuu olemaan nimetty Studiossa.
 *
 * Tämä tiedosto on jalkapalloarkisto-agentin oma (ks. docs/11 §3). Yhteistä
 * `sanity/lib/queries.ts`:ää ei muokata rinnakkaisajon aikana.
 */

import { defineQuery } from "next-sanity";
import { lqip, runko } from "@/sanity/lib/queries/kuvat";
import type { PortableTextBlock } from "@portabletext/react";

import type { StatColumn, StatRow } from "@/components/ui/stat-table";
import type { SanityImage } from "@/lib/types";

/** Cache-tagit revalidointia varten — sama tyyppinimi kuin skeemassa. */
export const arkistoTags = ["jalkapalloTilasto"];

/** Yksi tilastotaulukko sivulla renderöitävässä muodossa. */
export interface TilastoDoc {
  _id: string;
  _updatedAt: string | null;
  title: string;
  slug: string | null;
  tiivistelma: string | null;
  category: string | null;
  /** Huuhkajat-sivun osio (`lib/huuhkajat-osiot.ts`), vain kategoriassa "huuhkajat". */
  huuhkajatOsio: string | null;
  intro: PortableTextBlock[] | null;
  columns: StatColumn[] | null;
  rows: StatRow[] | null;
  /** Taulukon alla näytettävä teksti: otteluraportit, kokoonpanot, selitteet. */
  lisatiedot: PortableTextBlock[] | null;
  kuvat: SanityImage[] | null;
  /** Päivä, jolloin taulukon tiedot on viimeksi tarkistettu (ISO-päivä). */
  paivitetty: string | null;
  jarjestys: number | null;
  sources: string[] | null;
}

/** Kevyt rivi hub-sivujen laskureita ja tuoreussignaalia varten. */
export interface TilastoSummary {
  category: string | null;
  updatedAt: string | null;
}

const tilastoProjection = /* groq */ `
  _id,
  _updatedAt,
  title,
  "slug": slug.current,
  tiivistelma,
  category,
  huuhkajatOsio,
  intro[]{${runko}},
  columns[]{ key, label, type },
  rows[]{ cells[]{ key, value } },
  lisatiedot[]{${runko}},
  kuvat[]{ _key, alt, caption, asset, hotspot, crop, ${lqip} },
  paivitetty,
  jarjestys,
  "sources": coalesce(sources, [])
`;

/** Yhden kategorian kaikki tilastot. */
export const tilastotByCategoryQuery = defineQuery(/* groq */ `
  *[_type == "jalkapalloTilasto" && category == $category]
    | order(coalesce(jarjestys, 1000) asc, title asc){
    ${tilastoProjection}
  }
`);

/** Usean kategorian tilastot yhdellä haulla (eurocup-hubin esikatselut). */
export const tilastotByCategoriesQuery = defineQuery(/* groq */ `
  *[_type == "jalkapalloTilasto" && category in $categories]
    | order(coalesce(jarjestys, 1000) asc, title asc){
    ${tilastoProjection}
  }
`);

/** Yksittäinen tilasto kategorian sisältä slugilla. */
export const tilastoBySlugQuery = defineQuery(/* groq */ `
  *[
    _type == "jalkapalloTilasto"
    && category == $category
    && slug.current == $slug
  ][0]{
    ${tilastoProjection}
  }
`);

/** Kategorian slugit `generateStaticParams`-funktiolle. */
export const tilastoSlugsByCategoryQuery = defineQuery(/* groq */ `
  *[
    _type == "jalkapalloTilasto"
    && category == $category
    && defined(slug.current)
  ].slug.current
`);

/** Taulukon otsikkotiedot ilman rivejä — hub-sivun kortteja ja linkkejä varten. */
export interface TilastoLink {
  _id: string;
  _updatedAt: string | null;
  title: string;
  slug: string | null;
  tiivistelma: string | null;
  huuhkajatOsio: string | null;
}

const tilastoLinkProjection = /* groq */ `
  _id,
  _updatedAt,
  title,
  "slug": slug.current,
  tiivistelma,
  huuhkajatOsio
`;

/**
 * Huuhkajat-hub: maajoukkueen taulukot osioittain ryhmiteltäviksi ja
 * karsintasarjat linkkeinä. Rivejä ei haeta — hub näyttää vain sisällön.
 */
export const huuhkajatHubQuery = defineQuery(/* groq */ `{
  "taulukot": *[_type == "jalkapalloTilasto" && category == "huuhkajat"]
    | order(coalesce(jarjestys, 1000) asc, title asc){ ${tilastoLinkProjection} },
  "karsinnat": *[
    _type == "jalkapalloTilasto" && category == "karsinta" && defined(slug.current)
  ] | order(coalesce(jarjestys, 1000) asc, title asc){ ${tilastoLinkProjection} }
}`);

export interface HuuhkajatHub {
  taulukot: TilastoLink[];
  karsinnat: TilastoLink[];
}

/**
 * Yhden Huuhkajat-osion taulukot. `$tunnetut` = osioiden arvot ilman
 * oletusosiota; oletusosioon ("muut") päätyvät myös taulukot, joiden osio
 * puuttuu tai on tuntematon, jotta mikään taulukko ei katoa sivustolta.
 */
export const huuhkajatOsioQuery = defineQuery(/* groq */ `
  *[
    _type == "jalkapalloTilasto"
    && category == "huuhkajat"
    && select(
      $osio == $oletus => !(huuhkajatOsio in $tunnetut),
      huuhkajatOsio == $osio
    )
  ] | order(coalesce(jarjestys, 1000) asc, title asc){
    ${tilastoProjection}
  }
`);

/** Koko arkiston yhteenveto: montako taulukkoa per kategoria ja milloin muokattu. */
export const arkistoSummaryQuery = defineQuery(/* groq */ `
  *[_type == "jalkapalloTilasto" && defined(category)]{
    category,
    "updatedAt": _updatedAt
  }
`);
