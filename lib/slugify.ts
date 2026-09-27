/**
 * Yhteinen slug-apuri nimistä johdetuille tunnisteille (kaupunki, maa, maakunta).
 *
 * "Venäjä" → "venaja", "Tšekki" → "tsekki", "München" → "munchen",
 * "Päijät-Häme" → "paijat-hame", "Iso-Britannia" → "iso-britannia".
 *
 * Sama funktio on käytössä ravintolaputkessa (kaupunkien slugit,
 * `scripts/import-ravintolat.ts`), hakemiston suodattimissa (`?maa=`) ja
 * ohjausgeneraattorissa (`scripts/generate-redirects.ts`), jotta sama nimi
 * tuottaa kaikkialla saman osoitteen.
 *
 * Ääkköset puretaan suomalaisittain (ä → a, ö → o), muut tarkkeet
 * Unicode-hajotuksella (é → e, š → s).
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[äå]/g, "a")
    .replace(/[öø]/g, "o")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
