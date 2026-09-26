import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Yhdistää luokkanimet ja ratkaisee Tailwind-ristiriidat.
 *
 * Pelkkä clsx jättäisi ristiriitaiset luokat molemmat markkupiin
 * (esim. `p-6 p-4`), jolloin tyylitiedoston järjestys ratkaisisi lopputuloksen
 * — ei se, mitä komponentin kutsuja pyysi. `twMerge` pitää viimeisimmän.
 * Tämä on edellytys sille, että jaetun komponentin ulkoasua voi ylikirjoittaa
 * `className`-propilla luotettavasti.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
