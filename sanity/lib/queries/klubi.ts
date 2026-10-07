/**
 * Klubi-osion GROQ-kyselyt ja niiden tulostyypit.
 *
 * Oma tiedosto jaetun `sanity/lib/queries.ts`:n sijaan: rinnakkaiset agentit
 * kirjoittavat omiin osioihinsa, jolloin sama tiedosto ei voi joutua
 * ylikirjoitetuksi. Katso `docs/11-maali-ja-rinnakkaistoteutus.md` §3.
 *
 * Kyselyt kirjoitetaan `defineQuery`-funktiolla, jotta `npm run typegen`
 * tunnistaa ne ja johtaa tulostyypit kyselystä itsestään. Tyypit alla ovat
 * käsin kirjoitettu välivaihe: Sanity-projektia ei ole vielä luotu, joten
 * `sanity/sanity.types.ts` ei ole olemassa. Kun typegen on ajettu, nämä
 * korvataan generoiduilla — älä laajenna niitä sitä ennen enempää kuin
 * kyselyt vaativat.
 */

import { defineQuery } from "next-sanity";
import { kuva, runko } from "@/sanity/lib/queries/kuvat";
import { tilastoProjection } from "@/sanity/lib/queries/arkisto";

import type { PortableTextBlock } from "@portabletext/react";
import type { SanityImage } from "@/lib/types";
import type { TilastoDoc } from "@/sanity/lib/queries/arkisto";

/* ── Sivu-dokumentit (esittely, säännöt, palloveikkaus) ──────────────────── */

export type KlubiSivu = {
  _id: string;
  _updatedAt: string | null;
  title: string;
  slug: string;
  tiivistelma: string | null;
  ingress: string | null;
  hero: SanityImage;
  body: PortableTextBlock[] | null;
  /** Sivulla näytettävät taulukot (esim. palloveikkauksen tulokset). */
  tilastot: TilastoDoc[] | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

/**
 * Yksittäinen `sivu`-dokumentti polulla. Klubi-osion sivut käyttävät
 * slugeja "klubi" ja "klubi/palloveikkaus".
 */
export const klubiSivuQuery = defineQuery(`
  *[_type == "sivu" && slug.current == $slug][0]{
    _id,
    _updatedAt,
    title,
    "slug": slug.current,
    tiivistelma,
    ingress,
    hero{${kuva}},
    body[]{${runko}},
    tilastot[]->{ ${tilastoProjection} },
    seoTitle,
    seoDescription
  }
`);

/** Sivun alasivu (esim. palloveikkauksen veikkaukset) kortiksi ja valikkoon. */
export type KlubiAlasivu = {
  _id: string;
  title: string;
  slug: string;
  tiivistelma: string | null;
  taulukoita: number | null;
};

/**
 * Sivun alasivut: slug "klubi/palloveikkaus/arvokisat" on sivun
 * "klubi/palloveikkaus" alasivu (`$prefix` = "klubi/palloveikkaus/").
 * Järjestys on luontijärjestys.
 */
export const klubiAlasivutQuery = defineQuery(`
  *[_type == "sivu" && string::startsWith(slug.current, $prefix)] | order(_createdAt asc, title asc){
    _id,
    title,
    "slug": slug.current,
    tiivistelma,
    "taulukoita": count(tilastot)
  }
`);

/* ── Toimintamuodot ──────────────────────────────────────────────────────── */

export type KlubiToimintaCard = {
  _id: string;
  title: string;
  slug: string;
  tiivistelma: string | null;
  kuva: SanityImage;
  vuosiMaara: number | null;
  uusinVuosi: number | null;
};

export type KlubiToimintaVuosi = {
  _key: string;
  vuosi: number | null;
  paivamaara: string | null;
  /** Kun samana vuonna on useita kertoja, esim. "Pääsiäisen mölkky". */
  otsikko: string | null;
  /** Monesko kerta, esim. vuosikokous (11). */
  jarjestysnumero: number | null;
  osallistujat: string[] | null;
  paikka: string | null;
  kuvaus: string | null;
  /** Linkki lisätietoon, esim. matkakuvaus blogissa tai video. */
  linkki: { url: string | null; teksti: string | null } | null;
  kuvat: SanityImage[] | null;
};

export type KlubiToiminta = {
  _id: string;
  _updatedAt: string | null;
  title: string;
  slug: string;
  tiivistelma: string | null;
  kuvaus: PortableTextBlock[] | null;
  kuvat: SanityImage[] | null;
  vuodet: KlubiToimintaVuosi[] | null;
  /** Toimintaan liittyvät taulukot (mölkyn pistetaulukot, jouluruokailutilasto). */
  tilastot: TilastoDoc[] | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

/** Kaikki toimintamuodot listaukseen. Järjestys tulee Studiosta. */
export const klubiToimintaListQuery = defineQuery(`
  *[_type == "klubiToiminta" && defined(slug.current)]
    | order(jarjestys asc, title asc){
    _id,
    title,
    "slug": slug.current,
    tiivistelma,
    "kuva": kuvat[0]{${kuva}},
    "vuosiMaara": count(vuodet),
    "uusinVuosi": math::max(vuodet[].vuosi)
  }
`);

/** Yksi toimintamuoto. Vuosimerkinnät uusin ensin. */
export const klubiToimintaBySlugQuery = defineQuery(`
  *[_type == "klubiToiminta" && slug.current == $slug][0]{
    _id,
    _updatedAt,
    title,
    "slug": slug.current,
    tiivistelma,
    kuvaus[]{${runko}},
    kuvat[]{${kuva}},
    seoTitle,
    seoDescription,
    "vuodet": vuodet[] | order(vuosi desc, paivamaara desc){
      _key,
      vuosi,
      paivamaara,
      otsikko,
      jarjestysnumero,
      osallistujat,
      paikka,
      kuvaus,
      linkki{ url, teksti },
      kuvat[]{${kuva}}
    },
    tilastot[]->{ ${tilastoProjection} }
  }
`);

/**
 * Sisarlinkit yksittäiselle toimintamuodolle — ei orpoja sivuja.
 *
 * Viipale on vakio eikä parametri: GROQ vaatii viipaleelta vakioluvut, ja
 * `$count` kaatuisi jäsennyksessä. Neljä riittää ristiinlinkitykseen.
 */
export const klubiToimintaSiblingsQuery = defineQuery(`
  *[_type == "klubiToiminta" && defined(slug.current) && slug.current != $slug]
    | order(jarjestys asc, title asc)[0...4]{
    _id,
    title,
    "slug": slug.current,
    tiivistelma
  }
`);

export const klubiToimintaSlugsQuery = defineQuery(`
  *[_type == "klubiToiminta" && defined(slug.current)][].slug.current
`);

/* ── Hallitus ────────────────────────────────────────────────────────────── */

export type HallitusJasen = {
  _id: string;
  name: string;
  role: string;
  image: SanityImage;
  bio: string | null;
  email: string | null;
  phone: string | null;
};

export const hallitusListQuery = defineQuery(`
  *[_type == "hallitusJasen"] | order(order asc, name asc){
    _id,
    name,
    role,
    image{${kuva}},
    bio,
    email,
    phone
  }
`);
