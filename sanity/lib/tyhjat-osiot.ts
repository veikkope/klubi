import { PIILOTETTAVAT_OSIOT, tyhjatOsiot } from "@/lib/osiot";
import { sanityFetch } from "@/sanity/lib/fetch";

/**
 * Osiot, joissa ei ole julkaistua sisältöä (lib/osiot.ts). Välimuisti
 * tyhjenee tyypin tagilla, joten ensimmäinen julkaisu tuo osion näkyviin.
 */
const query = `{ ${PIILOTETTAVAT_OSIOT.map(
  ({ polku, tyyppi }) => `"${polku}": count(*[_type == "${tyyppi}" && defined(slug.current)])`,
).join(", ")} }`;

export async function haeTyhjatOsiot(): Promise<Set<string>> {
  const maarat = await sanityFetch<Record<string, number>>({
    query,
    tags: PIILOTETTAVAT_OSIOT.map(({ tyyppi }) => tyyppi),
    fallback: {},
  });
  return tyhjatOsiot(maarat);
}
