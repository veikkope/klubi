import { catchError, map, of } from "rxjs";
import { getPublishedId } from "sanity";
import type { DocumentLocationResolver } from "sanity/presentation";

import { SIJAINTITYYPIT, dokumentinSijainnit, type SijaintiDoc } from "../lib/sijainnit";
import { SIJAINTI_KUUNTELU, SIJAINTI_KYSELY, sijaintiParametrit } from "./lib/queries/sijainti";

/**
 * Esikatselun "Näkyy sivulla" -tiedot: Studio näyttää dokumentin yläpuolella
 * linkin sivulle (tai sivuille), jolla sisältö näkyy, ja avaa sen
 * esikatseluun. Säännöt ovat tiedostossa lib/sijainnit.ts (docs/24 askel 11):
 * reitti tulee samasta `documentRoute`-funktiosta kuin sitemap ja ohjaukset
 * (lib/path.ts), joten linkki ei voi osoittaa väärään paikkaan.
 *
 * Funktiomuoto korvaa aiemman tyyppikohtaisen objektikartan kokonaan: myös
 * etusivu, lehtileike ja sivutyypit ratkaistaan `dokumentinSijainnit`-funktiolla
 * samoin tuloksin kuin ennen (testattu: npm run test:sijainnit).
 *
 * Haku ja kuuntelu on erotettu kuten Sanityn omassa useReferringDocuments-
 * koukussa: kysely haetaan uudelleen, kun dokumentti itse (julkaistu tai
 * luonnos) tai siihen viittaava dokumentti muuttuu, enintään kerran sekunnissa.
 * Virhe (esim. 429 tai katkos) ei jätä banneria tilaan "Ratkaistaan
 * sijainteja…": sijaintitieto jää silloin pois.
 *
 * Sanityn rajoite: kun ratkaisija on funktio, banneri aloittaa tilasta
 * "Ratkaistaan sijainteja…" kaikilla tyypeillä ja tyhjenee vasta tilauksen
 * (useEffect) jälkeen, vaikka palautamme muille tyypeille heti null.
 * Objektikartalla tuntemattomilla tyypeillä tilaa ei ollut lainkaan.
 */
export const SIJAINTI_THROTTLE_MS = 1000;

export const locations: DocumentLocationResolver = (params, { documentStore }) => {
  // Etusivu on aina "/", kyselyä ei tarvita.
  if (params.type === "etusivu") return dokumentinSijainnit({ _id: params.id, _type: "etusivu" });
  if (!SIJAINTITYYPIT.has(params.type)) return null;
  const perspective = params.perspectiveStack.length > 0 ? params.perspectiveStack : "drafts";
  return documentStore
    .listenQuery(
      { fetch: SIJAINTI_KYSELY, listen: SIJAINTI_KUUNTELU },
      sijaintiParametrit(getPublishedId(params.id)),
      { perspective, throttleTime: SIJAINTI_THROTTLE_MS, tag: "klubi.sijainnit" },
    )
    .pipe(
      map((doc: SijaintiDoc | null) => (doc ? dokumentinSijainnit(doc) : null)),
      catchError(() => of(null)),
    );
};
