/**
 * Ravintolan ruokatyypit. Synkronoi
 * `sanity/schemas/documents/ravintola.ts` -tiedoston `cuisine.options.list`
 * -taulukon kanssa.
 */

export const RAVINTOLA_CUISINES: { value: string; label: string }[] = [
  { value: "lounas", label: "Lounas" },
  { value: "pizza", label: "Pizza" },
  { value: "burgeri", label: "Burgeri" },
  { value: "italialainen", label: "Italialainen" },
  { value: "aasialainen", label: "Aasialainen" },
  { value: "suomalainen", label: "Suomalainen" },
  { value: "kreikkalainen", label: "Kreikkalainen" },
  { value: "kahvila", label: "Kahvila" },
  { value: "alacarte", label: "Á la carte" },
  { value: "pikaruoka", label: "Pikaruoka" },
];

const labelMap = new Map(RAVINTOLA_CUISINES.map((c) => [c.value, c.label]));

export function cuisineLabel(value: string): string {
  return labelMap.get(value) ?? value;
}

export function isValidCuisine(value: string | undefined | null): boolean {
  return Boolean(value) && labelMap.has(value as string);
}

export const PRICE_LEVELS = ["€", "€€", "€€€"] as const;

export function isValidPriceLevel(value: string | undefined | null): boolean {
  return Boolean(value) && (PRICE_LEVELS as readonly string[]).includes(value as string);
}
