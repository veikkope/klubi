import { defineQuery } from "next-sanity";

/**
 * Studiossa lisätyt ottelut ja klubin merkinnät (docs/05 `ottelu`).
 * Haetaan vuorokauden verran taaksepäin, jotta tänään jo alkanut ottelu ei
 * katoa listalta kesken päivän — lopullinen suodatus tehdään lib/ottelut.ts:ssä.
 */
export const tulevatOttelutQuery = defineQuery(`
  *[_type == "ottelu" && defined(aika) && dateTime(aika) > dateTime(now()) - 60*60*24]
    | order(aika asc){
    _id,
    aika,
    koti,
    vieras,
    kilpailu,
    stadion,
    klubiPaikalla,
    vierasmatka
  }
`);
