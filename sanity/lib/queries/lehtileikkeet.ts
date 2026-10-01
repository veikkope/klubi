/**
 * Lehtileikkeet (docs/20): pelaajasivun lehtijutut osioittain.
 */
import { defineQuery } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/react";

import { kuva, runko } from "@/sanity/lib/queries/kuvat";
import type { UutinenCard } from "@/lib/types";

export type LehtileikeOsio = "lehtileikkeet" | "patsas" | "terveys";

export type Lehtileike = {
  _id: string;
  otsikko: string;
  julkaistu: string;
  lahde?: string | null;
  linkki?: string | null;
  teksti?: PortableTextBlock[] | null;
};

/** Yhden osion jutut, tuorein ensin. Parametrit: $pelaaja (_id), $osio. */
export const lehtileikkeetQuery = defineQuery(`
  *[_type == "lehtileike" && pelaaja._ref == $pelaaja && osio == $osio && defined(julkaistu)]
    | order(julkaistu desc, otsikko asc){
    _id,
    otsikko,
    julkaistu,
    lahde,
    linkki,
    teksti[]{${runko}}
  }
`);

export type LehtileikeOsionYhteenveto = { maara: number; ensimmainen: string | null; viimeisin: string | null };

export type LehtileikeYhteenveto = {
  lehtileikkeet: LehtileikeOsionYhteenveto;
  patsas: LehtileikeOsionYhteenveto;
  terveys: LehtileikeOsionYhteenveto;
  uusimmat: (Omit<Lehtileike, "teksti"> & { osio: LehtileikeOsio; ote?: string | null })[];
};

/** Osioiden määrät ja vuodet sekä uusimmat jutut yleiskatsaukseen. Parametri: $pelaaja. */
export const lehtileikeYhteenvetoQuery = defineQuery(`
  {
    "lehtileikkeet": {
      "maara": count(*[_type == "lehtileike" && pelaaja._ref == $pelaaja && osio == "lehtileikkeet" && defined(julkaistu)]),
      "ensimmainen": *[_type == "lehtileike" && pelaaja._ref == $pelaaja && osio == "lehtileikkeet" && defined(julkaistu)] | order(julkaistu asc)[0].julkaistu,
      "viimeisin": *[_type == "lehtileike" && pelaaja._ref == $pelaaja && osio == "lehtileikkeet" && defined(julkaistu)] | order(julkaistu desc)[0].julkaistu
    },
    "patsas": {
      "maara": count(*[_type == "lehtileike" && pelaaja._ref == $pelaaja && osio == "patsas" && defined(julkaistu)]),
      "ensimmainen": *[_type == "lehtileike" && pelaaja._ref == $pelaaja && osio == "patsas" && defined(julkaistu)] | order(julkaistu asc)[0].julkaistu,
      "viimeisin": *[_type == "lehtileike" && pelaaja._ref == $pelaaja && osio == "patsas" && defined(julkaistu)] | order(julkaistu desc)[0].julkaistu
    },
    "terveys": {
      "maara": count(*[_type == "lehtileike" && pelaaja._ref == $pelaaja && osio == "terveys" && defined(julkaistu)]),
      "ensimmainen": *[_type == "lehtileike" && pelaaja._ref == $pelaaja && osio == "terveys" && defined(julkaistu)] | order(julkaistu asc)[0].julkaistu,
      "viimeisin": *[_type == "lehtileike" && pelaaja._ref == $pelaaja && osio == "terveys" && defined(julkaistu)] | order(julkaistu desc)[0].julkaistu
    },
    "uusimmat": *[_type == "lehtileike" && pelaaja._ref == $pelaaja && defined(julkaistu)]
      | order(julkaistu desc)[0...3]{
      _id,
      otsikko,
      julkaistu,
      lahde,
      linkki,
      osio,
      "ote": pt::text(teksti[_type == "block"][0])
    }
  }
`);

/**
 * Uutiset, joilla on annettu tunniste (kirjainkoosta riippumatta). Nostoiksi
 * (`items`) vain ne, joiden otsikko vastaa hakua: tunniste on myös esim.
 * patsaalla pidettyjen tapahtumien uutisilla, jotka eivät kerro pelaajasta.
 * `total` laskee kaikki tunnisteen uutiset (linkki tunnistesivulle).
 * Parametrit: $tunniste (pienillä kirjaimilla), $otsikossa (GROQ match, esim. "litma*"), $maara.
 */
export const uutisetTunnisteenMukaanQuery = defineQuery(`
  {
    "items": *[_type == "uutinen" && defined(slug.current) && count((tunnisteet[])[lower(@) == $tunniste]) > 0
      && ($otsikossa == null || title match $otsikossa)]
      | order(publishedAt desc)[0...$maara]{
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      excerpt,
      tiivistelma,
      coverImage{${kuva}},
      categories
    },
    "total": count(*[_type == "uutinen" && defined(slug.current) && count((tunnisteet[])[lower(@) == $tunniste]) > 0])
  }
`);

export type TunnisteenUutiset = { items: UutinenCard[]; total: number };
