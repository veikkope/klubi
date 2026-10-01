import { LITMANEN_SLUG } from "@/lib/path";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  pelaajaBySlugQuery,
  type PelaajaFull,
} from "@/sanity/lib/queries/arkisto-laajennus";

/** Jari Litmasen pelaajadokumentti; profiili ja taulukot samasta hausta. */
export function haeLitmanen() {
  return sanityFetch<PelaajaFull | null>({
    query: pelaajaBySlugQuery,
    params: { slug: LITMANEN_SLUG },
    tags: ["pelaaja", `pelaaja:${LITMANEN_SLUG}`, "jalkapalloTilasto"],
    fallback: null,
  });
}
