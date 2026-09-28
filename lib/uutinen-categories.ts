import { stegaClean } from "next-sanity";

import type { UutinenCategory } from "@/lib/types";

/**
 * Uutiskategorioiden metadata. Synkronoi `sanity/schemas/documents/uutinen.ts`
 * -tiedoston `categories.options.list` -taulukon kanssa.
 */
export const UUTINEN_CATEGORIES: {
  value: UutinenCategory;
  label: string;
}[] = [
  // Tyyliopas (Sivut v3): jalkapallojuttujen pääkategoriat
  { value: "otteluraportti", label: "Otteluraportti" },
  { value: "kannattajakulttuuri", label: "Kannattajakulttuuri" },
  { value: "tiedote", label: "Tiedote" },
  { value: "tapahtumaraportti", label: "Tapahtumaraportti" },
  { value: "jasentieto", label: "Jäsentieto" },
  { value: "jalkapallo", label: "Jalkapallo" },
  { value: "ravintola", label: "Ravintola" },
  { value: "blogi", label: "Blogikirjoitus" },
  { value: "palloveikkaus", label: "Palloveikkaus" },
  { value: "matkakuvaus", label: "Matkakuvaus" },
];

const labelMap = new Map(UUTINEN_CATEGORIES.map((c) => [c.value, c.label]));

// Arvot tulevat Sanitysta: luonnosnäkymän stega-merkit poistetaan ennen
// hakua, muuten Map ei löydä avainta.
export function categoryLabel(value: string): string {
  return labelMap.get(stegaClean(value) as UutinenCategory) ?? value;
}

export function isValidCategory(value: string | undefined | null): value is UutinenCategory {
  if (!value) return false;
  return labelMap.has(stegaClean(value) as UutinenCategory);
}
