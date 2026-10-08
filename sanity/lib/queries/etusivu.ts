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
import { NAKYVA_UUTINEN } from "@/sanity/lib/queries/julkaisu";
import { kuva, runko } from "@/sanity/lib/queries/kuvat";
import { uutisKortti } from "@/sanity/lib/queries/uutiskortti";
import { linkkiProjektio } from "@/sanity/lib/queries/linkki";
import { JULKINEN_RAVINTOLA } from "@/lib/ravintola-arvosana";
import { TUOREIN_ARVIO } from "@/sanity/lib/queries/ravintolat";

import type { StatColumn, StatRow } from "@/components/ui/stat-table";

/** Yläosan pääjutun projektio: sama uutiskortti kuin `recentUutisetQuery` (UutinenCard). */
const nostoKortti = uutisKortti;

/**
 * Etusivun singleton.
 *
 * Yläosan pääjutuksi valitaan Studiossa nostettu juttu, kun se on voimassa
 * (`heroNostoAsti` puuttuu tai ei ole mennyt), muuten uusin juttu. Näin
 * yläosa vaihtuu itsestään, kun uusi juttu julkaistaan.
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
    heroImage{${kuva}},
    heroLaskuri,
    "heroNosto": coalesce(
      select(
        defined(heroNosto->slug.current)
          && (!defined(heroNostoAsti) || dateTime(heroNostoAsti) > dateTime(now()))
          // Ajastettu juttu nousee pääjutuksi vasta julkaisuajastaan.
          && (!defined(heroNosto->publishedAt) || dateTime(heroNosto->publishedAt) <= dateTime(now()))
          => heroNosto->{${nostoKortti}}
      ),
      *[${NAKYVA_UUTINEN}] | order(publishedAt desc)[0]{${nostoKortti}}
    ),
    // Linkit: osoite lasketaan sivulla (ratkaiseLinkit, linkinOsoite).
    heroCtas[]{ label, primary, ${linkkiProjektio} },
    seuraavaOttelu{ ottelu, kilpailu, aika },
    // Piilotettu lohko (piilota == true) säilyy Studiossa mutta ei renderöidy (docs/24 askel 1).
    blocks[piilota != true]{
      _type,
      _key,
      eyebrow,
      heading,
      count,
      ottelutHeading,
      ottelutCount,
      vainMaajoukkue,
      seurat,
      laskuri,
      tapahtumatHeading,
      tapahtumatCount,
      body[]{${runko}},
      image{${kuva}},
      ctaLabel,
      // Vanha merkkijono luetaan, kunnes linkit on muunnettu (docs/24 askel 5).
      ctaHref,
      ctaLinkki{ ${linkkiProjektio} },
      "city": city->{ "_ref": _id, name }
    }
  }
`);

/**
 * Ravintolat-spotlight: tuoreimmin arvioidut ensin (klubin käynti tai
 * klubilaisen arvostelu, ks. TUOREIN_ARVIO).
 *
 * Vain arvosanan saaneet (`ratingOverall`, tai vanhoissa `stars`).
 * Lopettaneita ravintoloita ei nosteta etusivulle.
 */
export const etusivuRavintolatQuery = defineQuery(`
  *[_type == "ravintola" && defined(slug.current) && closed != true && ${JULKINEN_RAVINTOLA}
    && ($cityId == null || city._ref == $cityId)
    && coalesce(ratingOverall, stars, 0) > 0]
    | order(coalesce(${TUOREIN_ARVIO}, "0000-00-00") desc, name asc)[0...$count]{
    _id,
    name,
    "slug": slug.current,
    "city": city->{ name, "slug": slug.current },
    stars,
    ratingOverall,
    priceLevel,
    tuomio,
    stadionHuomio,
    "image": images[0]{${kuva}}
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
