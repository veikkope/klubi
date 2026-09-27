/**
 * Etusivun GROQ-kyselyt.
 *
 * Omassa tiedostossaan, ei jaetussa `sanity/lib/queries.ts`:ssä — ks.
 * `docs/11-maali-ja-rinnakkaistoteutus.md` §3: rinnakkaiset agentit eivät
 * kirjoita samaan tiedostoon.
 *
 * Kyselyt kirjoitetaan `defineQuery`-funktiolla, jotta `sanity typegen`
 * tunnistaa ne ja johtaa tulostyypit kyselystä itsestään.
 *
 * Uutis- ja tapahtumanostot käyttävät jaettuja `recentUutisetQuery`- ja
 * `upcomingTapahtumatQuery`-kyselyitä: niiden muoto on jo oikea, eikä samaa
 * projektiota kannata ylläpitää kahdessa paikassa.
 */

import { defineQuery } from "next-sanity";

import type { StatColumn, StatRow } from "@/components/ui/stat-table";

/**
 * Etusivun singleton.
 *
 * Kaupunkiviittauksesta otetaan sekä dokumentin id (`_ref`, jolla ravintolat
 * suodatetaan) että nimi. Ilman `_id`-projektiota dereferoidussa objektissa ei
 * ole `_ref`-kenttää lainkaan, jolloin suodatin jäisi hiljaa pois päältä.
 */
export const etusivuQuery = defineQuery(`
  *[_type == "etusivu"][0]{
    heroEyebrow,
    heroTitle,
    heroDescription,
    heroImage,
    heroCtas[]{ label, href, primary },
    seuraavaOttelu{ ottelu, kilpailu, aika },
    blocks[]{
      _type,
      _key,
      heading,
      count,
      body,
      image,
      ctaLabel,
      ctaHref,
      "city": city->{ "_ref": _id, name }
    }
  }
`);

/**
 * Ravintolat-spotlight: parhaiten arvioidut ensin.
 *
 * Järjestysperuste on `ratingOverall` (0–5, yksi desimaali) — se on tarkin
 * arvo. `stars` on karkeampi pikavalinta ja toimii varalla, jotta vanhat
 * ravintolat joilta puuttuu kokonaisarvosana eivät katoa listalta.
 * Lopettaneita ravintoloita ei nosteta etusivulle.
 */
export const etusivuRavintolatQuery = defineQuery(`
  *[_type == "ravintola" && defined(slug.current) && closed != true
    && ($cityId == null || city._ref == $cityId)
    && coalesce(ratingOverall, stars, 0) > 0]
    | order(coalesce(ratingOverall, stars, 0) desc, name asc)[0...$count]{
    _id,
    name,
    "slug": slug.current,
    "city": city->{ name, "slug": slug.current },
    "stars": coalesce(ratingOverall, stars, 0),
    priceLevel,
    cuisine,
    "image": images[0]
  }
`);

/**
 * Jalkapalloarkiston teaser.
 *
 * Nostaa tuoreimman FIFA-rankingin viisi ensimmäistä riviä (docs/02 §"Etusivun
 * rakenne") ja arkiston kokoluvut. Luvut kertovat kävijälle, kuinka laajasta
 * aineistosta on kyse — ne ovat dataa, eivät markkinointitekstiä.
 */
export const etusivuArkistoQuery = defineQuery(`
  {
    "arvokisat": count(*[_type == "arvokisa" && defined(slug.current)]),
    "pelaajat": count(*[_type == "pelaaja" && defined(slug.current)]),
    "stadionit": count(*[_type == "stadion" && defined(slug.current)]),
    "tilastot": count(*[_type == "jalkapalloTilasto" && defined(slug.current)]),
    "fifa": *[_type == "jalkapalloTilasto" && category == "fifa-ranking"
      && defined(slug.current)] | order(_updatedAt desc)[0]{
      title,
      "slug": slug.current,
      _updatedAt,
      columns[]{ key, label, type },
      "rows": rows[0...5]{ cells[]{ key, value } }
    }
  }
`);

/** `etusivuArkistoQuery`-kyselyn tulos. */
export type ArkistoTeaserData = {
  arvokisat: number;
  pelaajat: number;
  stadionit: number;
  tilastot: number;
  fifa: {
    title: string;
    slug: string;
    _updatedAt: string;
    columns: StatColumn[] | null;
    rows: StatRow[] | null;
  } | null;
};
