/**
 * Vie migraation NDJSON-tiedoston Sanityn development-datasetiin.
 *
 * Ajo:  npx tsx scripts/sanity-import.ts data/migration-<tyyppi>.ndjson
 *       (package.json: `npm run migrate:<tyyppi>` kutsuu tätä viimeisenä)
 *
 * Miksi oma kääre eikä suora `sanity dataset import`:
 *  - Kohde on kovakoodattu `development` (docs/12 §0: production-datasettiin ei
 *    kirjoiteta migraation aikana). Kääre kieltäytyy muista dataseteista.
 *  - Kirjoitustoken luetaan `.env.local`-tiedostosta prosessin sisällä eikä sitä
 *    tulosteta tai välitetä komentoriville.
 *  - `--replace` tekee ajosta idempotentin: deterministiset `_id`:t korvautuvat.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

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
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    console.error("SANITY_API_WRITE_TOKEN puuttuu .env.local-tiedostosta.");
    process.exit(1);
  }

  console.log(`Tuodaan ${file} → ${DATASET} (--replace)`);
  const result = spawnSync(
    "npx",
    ["sanity", "dataset", "import", file, DATASET, "--replace"],
    {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: { ...process.env, SANITY_AUTH_TOKEN: token },
    },
  );
  process.exit(result.status ?? 1);
}

main();
