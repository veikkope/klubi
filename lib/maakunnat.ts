import { stegaClean } from "next-sanity";

/**
 * Suomen 19 maakuntaa (Tilastokeskuksen maakuntaluokitus, voimassa 2021–2025).
 *
 * `value` on tallennettu arvo ja samalla URL-parametri (`/ravintolat?maakunta=uusimaa`):
 * se on `lib/slugify.ts`:n tulos `title`-nimestä, joten GROQ voi verrata sitä
 * suoraan ilman merkkijonomuunnoksia.
 *
 * Käyttäjät:
 *  - `sanity/schemas/documents/kaupunki.ts` (`maakunta`-kentän valintalista)
 *  - `components/ravintola-filters.tsx` (suodatin ja rajausnapit)
 *  - `scripts/lib/maakunnat.ts` (kunta → maakunta -taulukko)
 *
 * Luettelo on virallinen luokitus, ei sisältöä, joten se on koodissa eikä
 * Sanityssa (vrt. `lib/ravintola-cuisines.ts`).
 */
export const MAAKUNNAT = [
  { value: "uusimaa", title: "Uusimaa" },
  { value: "varsinais-suomi", title: "Varsinais-Suomi" },
  { value: "satakunta", title: "Satakunta" },
  { value: "kanta-hame", title: "Kanta-Häme" },
  { value: "pirkanmaa", title: "Pirkanmaa" },
  { value: "paijat-hame", title: "Päijät-Häme" },
  { value: "kymenlaakso", title: "Kymenlaakso" },
  { value: "etela-karjala", title: "Etelä-Karjala" },
  { value: "etela-savo", title: "Etelä-Savo" },
  { value: "pohjois-savo", title: "Pohjois-Savo" },
  { value: "pohjois-karjala", title: "Pohjois-Karjala" },
  { value: "keski-suomi", title: "Keski-Suomi" },
  { value: "etela-pohjanmaa", title: "Etelä-Pohjanmaa" },
  { value: "pohjanmaa", title: "Pohjanmaa" },
  { value: "keski-pohjanmaa", title: "Keski-Pohjanmaa" },
  { value: "pohjois-pohjanmaa", title: "Pohjois-Pohjanmaa" },
  { value: "kainuu", title: "Kainuu" },
  { value: "lappi", title: "Lappi" },
  { value: "ahvenanmaa", title: "Ahvenanmaa" },
] as const;

export type MaakuntaValue = (typeof MAAKUNNAT)[number]["value"];

/** Maa, jonka kaupungeilla on maakunta. Sama merkkijono kuin `kaupunki.country`. */
export const SUOMI = "Suomi";
/** `?maa=`-parametrin arvo Suomelle. */
export const SUOMI_SLUG = "suomi";

// Arvot voivat tulla Sanitysta luonnosnäkymän stega-merkkeineen: puhdistetaan
// ennen hakua.
const titles = new Map<string, string>(MAAKUNNAT.map((m) => [m.value, m.title]));

export function maakuntaTitle(value: string | null | undefined): string | null {
  return value ? (titles.get(stegaClean(value)) ?? null) : null;
}

export function isMaakunta(value: string | null | undefined): value is MaakuntaValue {
  return Boolean(value) && titles.has(stegaClean(value) as string);
}
