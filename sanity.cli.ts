import { defineCliConfig } from "sanity/cli";

import { dataset, projectId } from "./sanity/env";

/**
 * Sanity CLI -konfiguraatio.
 *
 * Tarvitaan komennoille `sanity schema extract`, `sanity typegen generate`
 * ja `sanity dataset import`. Arvot luetaan samasta paikasta kuin sovellus
 * (`sanity/env.ts`), jottei projektitunnus ole kahdessa paikassa.
 *
 * Huom: `dataset` on oletus, jonka voi ohittaa komentoriviltä:
 *   npx sanity dataset import data/migration.ndjson production
 */
export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  /** Studio on upotettu Next.js-sovellukseen, ei erillinen. */
  studioHost: undefined,
});
