/**
 * Vie migraation NDJSON-tiedoston Sanityn development-datasetiin.
 *
 * Ajo:  npx tsx scripts/sanity-import.ts data/migration-<tyyppi>.ndjson [--missing]
 *       (package.json: `npm run migrate:<tyyppi>` kutsuu tätä viimeisenä)
 *
 * Miksi oma kääre eikä suora `sanity dataset import`:
 *  - Kohde on kovakoodattu `development` (docs/12 §0: production-datasettiin ei
 *    kirjoiteta migraation aikana). Kääre kieltäytyy muista dataseteista.
 *  - Kirjoitustoken luetaan `.env.local`-tiedostosta prosessin sisällä eikä sitä
 *    tulosteta tai välitetä komentoriville.
 *  - `--replace` tekee ajosta idempotentin: deterministiset `_id`:t korvautuvat.
 *  - `--missing` tuo vain dokumentit, joita datasetissa ei vielä ole. Käytetään,
 *    kun sisältöä on jo muokattu Studiossa: esim. blogin uudet kirjoitukset
 *    lisätään, mutta jo tuotuihin tehdyt korjaukset säilyvät (docs/14 §6).
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import { sanityWriteToken } from "./lib/sanity-token";

const DATASET = "development";

function main() {
  const file = process.argv[2];
  if (!file || !file.endsWith(".ndjson") || !existsSync(file)) {
    console.error("Käyttö: npx tsx scripts/sanity-import.ts data/migration-<tyyppi>.ndjson");
    process.exit(1);
  }
  if (process.argv.includes("production")) {
    console.error("Kielletty: migraatio kirjoittaa vain development-datasetiin (docs/12 §0).");
    process.exit(1);
  }

  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const token = sanityWriteToken();
  if (!token) {
    console.error("Kirjoitustoken puuttuu: lisää SANITY_API_WRITE_TOKEN .env.localiin tai aja npx sanity login.");
    process.exit(1);
  }

  const mode = process.argv.includes("--missing") ? "--missing" : "--replace";
  console.log(`Tuodaan ${file} → ${DATASET} (${mode})`);
  const result = spawnSync(
    "npx",
    ["sanity", "dataset", "import", file, DATASET, mode],
    {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: { ...process.env, SANITY_AUTH_TOKEN: token },
    },
  );
  process.exit(result.status ?? 1);
}

main();
