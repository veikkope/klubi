import type { SanityClient } from "next-sanity";

import type { huoltoajonKirjaus } from "../../lib/sivuston-tila";
import type { OrpoTiedosto } from "../../lib/tiedostosiivous";

/**
 * Ajastetun tehtävän tulos järjestelmädokumenttiin `sivustonTila.<tehtävä>`
 * (docs/24 askel 7). Studion Aloitus lukee sen.
 *
 * Kirjauksen virhe ei kaada ajoa: se näkyy vain lokissa, ja Aloitus näyttää
 * silloin vanhentuneen ajon punaisena. Pistetunnus (`sivustonTila.huolto`) ei
 * näy julkisesta datasetistä tunnistautumattomille.
 */
export type Kirjaus = ReturnType<typeof huoltoajonKirjaus> & {
  /** Huollon muistiinpano käyttämättömistä tiedostoista (lib/tiedostosiivous.ts). */
  orvotTiedostot?: OrpoTiedosto[];
};

export async function kirjaaAjo(
  client: SanityClient,
  id: string,
  tehtava: "huolto" | "varmuuskopio",
  kirjaus: Kirjaus,
): Promise<void> {
  try {
    await client
      .transaction()
      .createIfNotExists({ _id: id, _type: "sivustonTila", tehtava })
      .patch(id, (p) => p.set(kirjaus))
      .commit({ visibility: "async" });
  } catch (error) {
    console.error(`[${tehtava}] tilan kirjaus epäonnistui:`, error instanceof Error ? error.message : error);
  }
}
