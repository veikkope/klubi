import type { UutinenCategory } from "@/lib/types";

/**
 * Uutiskategorioiden metadata. Synkronoi `sanity/schemas/documents/uutinen.ts`
 * -tiedoston `categories.options.list` -taulukon kanssa.
 */
export const UUTINEN_CATEGORIES: {
  value: UutinenCategory;
  label: string;
}[] = [
  { value: "tiedote", label: "Tiedote" },
  { value: "tapahtumaraportti", label: "Tapahtumaraportti" },
  { value: "jasentieto", label: "Jäsentieto" },
  { value: "jalkapallo", label: "Jalkapallo" },
  { value: "ravintola", label: "Ravintola" },
];

const labelMap = new Map(UUTINEN_CATEGORIES.map((c) => [c.value, c.label]));

export function categoryLabel(value: string): string {
  return labelMap.get(value as UutinenCategory) ?? value;
}

export function isValidCategory(value: string | undefined | null): value is UutinenCategory {
  if (!value) return false;
  return labelMap.has(value as UutinenCategory);
}
