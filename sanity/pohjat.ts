import type { Template } from "sanity";

import { osioSivu, osioSivuSiemen } from "../lib/osiosivut";
import { singletonTypes } from "./schemas";

/**
 * Studion mallipohjat (docs/24 §2.7). Yksi paikka: askel 3 lisää osion sivun
 * pohjan, myöhemmät askeleet valmiit pohjat.
 *
 * - Singletoneja, varmuuskopioita ja sivuston tilaa ei luoda käsin (ajastus tekee ne).
 * - `lukittu-sivu`: osion sivu (lib/osiosivut.ts), jota ei vielä ole
 *   datasetissä. Studion rakenne avaa sen kiinteällä tunnuksella, ja pohja
 *   täyttää lomakkeen koodin oletusteksteillä (sama kuin `luo:osiosivut`).
 */

/** Ajastettujen tehtävien kirjoittamat tyypit: ei pohjaa (docs/24 §2.7). */
const AJASTUKSEN_TYYPIT: ReadonlySet<string> = new Set(["varmuuskopio", "sivustonTila"]);

/** Pohjat, jotka tarvitsevat parametrin: ne eivät näy Luo-valikossa. */
export const PIILOTETUT_POHJAT: ReadonlySet<string> = new Set(["lukittu-sivu"]);

const lukittuSivu: Template<{ slug: string }> = {
  id: "lukittu-sivu",
  title: "Osion sivu",
  schemaType: "sivu",
  parameters: [{ name: "slug", type: "string" }],
  value: ({ slug }: { slug: string }) => {
    const o = osioSivu(slug);
    if (!o) return { slug: { _type: "slug", current: slug } };
    // Tunnus ja tyyppi tulevat Studiolta; loput samat kuin skriptin siemenessä.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, _type, ...arvot } = osioSivuSiemen(o);
    return arvot;
  },
};

export function pohjat(prev: Template[]): Template[] {
  return [
    ...prev.filter(({ schemaType }) => !singletonTypes.has(schemaType) && !AJASTUKSEN_TYYPIT.has(schemaType)),
    lukittuSivu as Template,
  ];
}
