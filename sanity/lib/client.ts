import "server-only";

import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, hasSanity, projectId, readToken } from "../env";

/**
 * Sivuston lukuclient (vain palvelimella).
 *
 * Datasetit ovat yksityisiä (docs/17 §A4): ilman tunnusta kuka tahansa voisi
 * lukea suoraan rajapinnasta myös sivulta piilotetut kommentit ja
 * varmuuskopiotiedostojen osoitteet. Siksi jokainen haku kulkee Viewer-
 * roolisella lukutokenilla. `perspective: "published"` pitää luonnokset
 * (esim. hyväksymättömät arvostelut) poissa, vaikka token näkisi ne.
 *
 * Token ei päädy selaimeen: `server-only` kaataa buildin, jos tätä tiedostoa
 * yritetään tuoda Client Componentiin. Kuvat eivät tarvitse tokenia, koska
 * Sanityn kuva-CDN on julkinen myös yksityisessä datasetissä.
 */
export const client: SanityClient | null = hasSanity
  ? createClient({
      projectId: projectId!,
      dataset,
      apiVersion,
      useCdn: true,
      token: readToken,
      perspective: "published",
      stega: {
        studioUrl: "/studio",
      },
    })
  : null;

if (hasSanity && !readToken) {
  console.warn(
    "[sanity] SANITY_API_READ_TOKEN puuttuu: yksityisestä datasetistä ei voi lukea, ja kaikki haut epäonnistuvat.",
  );
}
