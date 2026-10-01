import { stegaClean } from "next-sanity";

import type { SectionNavItem } from "@/components/layout/section-nav";
import {
  MESTARUUSMAAT,
  mestaruusmaaPath,
  resolveMestaruusmaa,
  type Mestaruusmaa,
} from "@/lib/ulkomaiset-mestarit";
import type { TilastoDoc } from "@/sanity/lib/queries/arkisto";

/**
 * Ulkomaiset mestarit -hubin ja maasivujen yhteinen ryhmittely. Maiden nimet
 * ja järjestys tulevat `lib/ulkomaiset-mestarit.ts`:stä; taulukon maa Sanitysta.
 */

export interface MaaGroup extends Mestaruusmaa {
  href: string;
  tilastot: TilastoDoc[];
}

/** Taulukon maa. Esikatselussa arvo voi sisältää stega-merkkejä. */
export function maaOf(tilasto: Pick<TilastoDoc, "mestaruusmaa" | "slug">): string {
  return resolveMestaruusmaa(stegaClean(tilasto.mestaruusmaa), stegaClean(tilasto.slug));
}

/** Maat määritellyssä järjestyksessä; maat ilman taulukoita jätetään pois. */
export function groupByMaa(tilastot: TilastoDoc[]): MaaGroup[] {
  return MESTARUUSMAAT.map((maa) => ({
    ...maa,
    href: mestaruusmaaPath(maa.value),
    tilastot: tilastot.filter((tilasto) => maaOf(tilasto) === maa.value),
  })).filter((group) => group.tilastot.length > 0);
}

/** Maavalikko: yksi välilehti per maa, jolla on taulukoita. */
export function maaNav(groups: MaaGroup[]): SectionNavItem[] {
  return groups.map((group) => ({ label: group.title, href: group.href }));
}
