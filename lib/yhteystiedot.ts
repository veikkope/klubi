import { stegaClean } from "next-sanity";

import { sanityFetch } from "@/sanity/lib/fetch";

/**
 * Klubin sähköpostiosoite Studion Yhteystiedoista (Sivun asetukset →
 * Yhteystiedot). Ainoa lähde: osoitetta ei kovakoodata mihinkään. Jos kenttä on
 * tyhjä tai Sanityyn ei saada yhteyttä, palautetaan null, jolloin osoitetta ei
 * näytetä (docs/16 §5).
 */
export async function getYhteysSahkoposti(): Promise<string | null> {
  const email = await sanityFetch<string | null>({
    query: /* groq */ `*[_type == "yhteystiedot"][0].email`,
    tags: ["yhteystiedot"],
    fallback: null,
  });
  return stegaClean(email)?.trim() || null;
}

/** Virheilmoituksen loppu: "…osoitteeseen x@y." tai yleinen kehotus, jos osoitetta ei ole. */
export async function ilmoitaOsoitteeseen(): Promise<string> {
  const email = await getYhteysSahkoposti();
  return email ? `Ilmoitathan asiasta osoitteeseen ${email}.` : "Yritä myöhemmin uudelleen.";
}
