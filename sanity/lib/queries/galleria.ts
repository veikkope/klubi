/**
 * Gallerian GROQ-kyselyt.
 *
 * Erillään jaetusta `sanity/lib/queries.ts`:stä samasta syystä kuin muutkin
 * Gate 1:n kyselyt (docs/11 §3). Jaetut `galleriaListQuery` ja
 * `galleriaBySlugQuery` eivät projisoi `tiivistelma`-kenttää, joka lisättiin
 * `galleriaAlbumi`-skeemaan Gate 1:n aikana — nämä versiot hakevat sen.
 */

import { defineQuery } from "next-sanity";
import { kuva, ruutukuva } from "@/sanity/lib/queries/kuvat";

import type { AlbumCard, AlbumFull } from "@/lib/types";

export const galleriaAlbumitQuery = defineQuery(`
  *[_type == "galleriaAlbumi" && defined(slug.current)]
    | order(date desc){
    _id,
    title,
    "slug": slug.current,
    date,
    tiivistelma,
    coverImage{${kuva}},
    "imageCount": count(images)
  }
`);

/** Etusivun galleria-nosto: uusimmat albumit. */
export const etusivuGalleriaQuery = defineQuery(`
  *[_type == "galleriaAlbumi" && defined(slug.current)]
    | order(date desc)[0...$count]{
    _id,
    title,
    "slug": slug.current,
    date,
    tiivistelma,
    coverImage{${kuva}},
    "imageCount": count(images)
  }
`);

export const galleriaAlbumiBySlugQuery = defineQuery(`
  *[_type == "galleriaAlbumi" && slug.current == $slug][0]{
    _id,
    _updatedAt,
    title,
    "slug": slug.current,
    date,
    tiivistelma,
    coverImage{${kuva}},
    images[]{${ruutukuva}},
    "event": event->{ title, "slug": slug.current }
  }
`);

/** Albumikortti tiivistelmällä täydennettynä. */
export type GalleriaAlbumCard = AlbumCard & {
  tiivistelma?: string | null;
};

/** Koko albumi tiivistelmällä ja muokkausajalla täydennettynä. */
export type GalleriaAlbumFull = AlbumFull & {
  tiivistelma?: string | null;
  _updatedAt?: string | null;
};
