/**
 * Päivätty varmuuskopio production-datasetista kuvineen (docs/17).
 *
 * Ajo:  npm run backup
 * Tulos: varmuuskopiot/production-<vvvv-kk-pp>.tar.gz (gitignoressa)
 *
 * Aja ennen jokaista suurempaa muutosta (migraatio, domainin siirto) ja
 * kuukausittain. Palautus: npx sanity dataset import <tiedosto> production --replace
 * (korvaa koko datasetin: vain hätätilanteessa).
 */
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";

import { sanityWriteToken } from "./lib/sanity-token";

const pvm = new Date().toISOString().slice(0, 10);
const kohde = `varmuuskopiot/production-${pvm}.tar.gz`;
mkdirSync("varmuuskopiot", { recursive: true });
const token = sanityWriteToken();
const tulos = spawnSync("npx", ["sanity", "dataset", "export", "production", kohde, "--overwrite"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: token ? { ...process.env, SANITY_AUTH_TOKEN: token } : process.env,
});
if (tulos.status === 0) console.log(`\nVarmuuskopio: ${kohde}\nSäilytä kopio myös koneen ulkopuolella (esim. pilvilevy).`);
process.exit(tulos.status ?? 1);
