import { stegaClean } from "next-sanity";

import type { UutinenKategoria } from "@/lib/types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { kaytetytKategoriatQuery, kategoriaPolullaQuery } from "@/sanity/lib/queries/kategoriat";

/**
 * Uutiskategoriat tulevat Sanitysta (`uutisKategoria`, docs/09): sihteeri
 * lisää ja nimeää ne Studiossa. Välimuistitagi "uutisKategoria" tyhjenee
 * webhookista; nimet näkyvät uutissivuilla, joten webhook tyhjentää samalla
 * myös "uutinen"-tagin (app/api/revalidate).
 */

export type KategoriaSivulle = UutinenKategoria & { kuvaus?: string | null };

/** Kategoriat, joissa on uutisia (suodatin). */
export function haeKaytetytKategoriat(): Promise<UutinenKategoria[]> {
  return sanityFetch<UutinenKategoria[]>({
    query: kaytetytKategoriatQuery,
    tags: ["uutisKategoria", "uutinen"],
    fallback: [],
  });
}

/**
 * Kategoria osoitteen `?kategoria=` arvolla. Löytyy myös aiemmalla polulla
 * (esim. yhdistetty "jasentieto"), jolloin `value` on nykyinen polku ja
 * kutsuja ohjaa sinne.
 */
export async function haeKategoria(polku: string | null | undefined): Promise<KategoriaSivulle | null> {
  const puhdas = stegaClean(polku ?? "").trim();
  if (!puhdas || puhdas.length > 96) return null;
  return sanityFetch<KategoriaSivulle | null>({
    query: kategoriaPolullaQuery,
    params: { polku: puhdas },
    tags: ["uutisKategoria"],
    fallback: null,
  });
}
