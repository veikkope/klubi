import { stegaClean } from "next-sanity";

import {
  HUUHKAJAT_OSIOT,
  HUUHKAJAT_OSIO_OLETUS,
  resolveHuuhkajatOsio,
  type HuuhkajatOsio,
} from "@/lib/huuhkajat-osiot";
import { huuhkajatOsioPath } from "@/lib/path";
import type { TilastoLink } from "@/sanity/lib/queries/arkisto";

/**
 * Huuhkajat-hubin ja osiosivujen yhteinen ryhmittely. Osioiden nimet ja
 * järjestys tulevat `lib/huuhkajat-osiot.ts`:stä; taulukon osio Sanitysta.
 */

export interface OsioGroup extends HuuhkajatOsio {
  href: string;
  taulukot: TilastoLink[];
}

/** Taulukon osio. Esikatselussa arvo voi sisältää stega-merkkejä. */
export function osioOf(taulukko: Pick<TilastoLink, "huuhkajatOsio">): string {
  return resolveHuuhkajatOsio(stegaClean(taulukko.huuhkajatOsio));
}

/** Osiot määritellyssä järjestyksessä; tyhjät osiot jätetään pois. */
export function groupByOsio(taulukot: TilastoLink[]): OsioGroup[] {
  return HUUHKAJAT_OSIOT.map((osio) => ({
    ...osio,
    href: huuhkajatOsioPath(osio.value),
    taulukot: taulukot.filter((taulukko) => osioOf(taulukko) === osio.value),
  })).filter((group) => group.taulukot.length > 0);
}

/** `huuhkajatOsioQuery`-kyselyn parametrit. */
export function osioQueryParams(osio: string) {
  return {
    osio,
    oletus: HUUHKAJAT_OSIO_OLETUS,
    tunnetut: HUUHKAJAT_OSIOT.map((item) => item.value).filter(
      (value) => value !== HUUHKAJAT_OSIO_OLETUS,
    ),
  };
}
