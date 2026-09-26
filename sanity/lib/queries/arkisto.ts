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
import type { PortableTextBlock } from "@portabletext/react";

import type { StatColumn, StatRow } from "@/components/ui/stat-table";

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
  intro: PortableTextBlock[] | null;
  columns: StatColumn[] | null;
  rows: StatRow[] | null;
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
  intro,
  columns[]{ key, label, type },
  rows[]{ cells[]{ key, value } },
  "sources": coalesce(sources, [])
`;

/** Yhden kategorian kaikki tilastot. */
export const tilastotByCategoryQuery = defineQuery(/* groq */ `
  *[_type == "jalkapalloTilasto" && category == $category] | order(title asc){
    ${tilastoProjection}
  }
`);

/** Usean kategorian tilastot yhdellä haulla (eurocup-hubin esikatselut). */
export const tilastotByCategoriesQuery = defineQuery(/* groq */ `
  *[_type == "jalkapalloTilasto" && category in $categories] | order(title asc){
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

/** Koko arkiston yhteenveto: montako taulukkoa per kategoria ja milloin muokattu. */
export const arkistoSummaryQuery = defineQuery(/* groq */ `
  *[_type == "jalkapalloTilasto" && defined(category)]{
    category,
    "updatedAt": _updatedAt
  }
`);
