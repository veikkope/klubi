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

import type { PortableTextBlock } from "@portabletext/react";
import type { SanityImage } from "@/lib/types";

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
  seoTitle: string | null;
  seoDescription: string | null;
};

/**
 * Yksittäinen `sivu`-dokumentti polulla. Klubi-osion sivut käyttävät
 * slugeja "klubi", "klubi/saannot" ja "klubi/palloveikkaus".
 */
export const klubiSivuQuery = defineQuery(`
  *[_type == "sivu" && slug.current == $slug][0]{
    _id,
    _updatedAt,
    title,
    "slug": slug.current,
    tiivistelma,
    ingress,
    hero,
    body,
    seoTitle,
    seoDescription
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
  paikka: string | null;
  kuvaus: string | null;
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
    "kuva": kuvat[0],
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
    kuvaus,
    kuvat,
    seoTitle,
    seoDescription,
    "vuodet": vuodet[] | order(vuosi desc){
      _key,
      vuosi,
      paivamaara,
      paikka,
      kuvaus,
      kuvat
    }
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
    image,
    bio,
    email,
    phone
  }
`);
