/**
 * Ravintoloiden arvosanat klubilaisten arvosteluista (lib/ravintola-arvosana.ts).
 *
 * Webhook (app/api/revalidate) laskee arvosanat aina, kun arvostelu muuttuu.
 * Tämä skripti tekee saman käsin: käyttöönotto, ruokailutaulukon tuonnin
 * jälkeinen laskenta ja varmistus, jos webhook on ollut pois päältä.
 *
 * Ajo:
 *   npm run laske:arvosanat                         # kuivaharjoitus, development
 *   npm run laske:arvosanat -- --vie                # kirjoittaa developmentiin
 *   npm run laske:arvosanat -- --production --vie   # varmuuskopio + production
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import { createClient } from "@sanity/client";

import { paivitaArvosanat } from "../lib/ravintola-arvosana";
import { sanityWriteToken } from "./lib/sanity-token";

const muoto = (x: number | null) => (x === null ? "–" : x.toFixed(1).replace(".", ","));

async function main() {
  const vie = process.argv.includes("--vie");
  const dataset = process.argv.includes("--production") ? "production" : "development";
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = sanityWriteToken();
  if (!projectId || !token) {
    console.error("NEXT_PUBLIC_SANITY_PROJECT_ID tai kirjoitustoken puuttuu (.env.local tai npx sanity login).");
    process.exit(1);
  }
  const client = createClient({ projectId, dataset, apiVersion: "2025-08-15", token, useCdn: false, perspective: "raw" });

  const muutokset = await paivitaArvosanat(client, { kuiva: true });

  console.log(`Dataset ${dataset}: ${muutokset.length} ravintolan arvosana muuttuisi`);
  for (const m of muutokset) {
    const e = m.ennen;
    const j = m.jalkeen;
    console.log(
      `  ${m.name}: ${muoto(e.ratingOverall)} → ${muoto(j.ratingOverall)}` +
        ` (ruoka ${muoto(j.ratingFood)}, hinta ${muoto(j.ratingPrice)}, viihtyvyys ${muoto(j.ratingAtmosphere)};` +
        ` ${m.arvioijia} klubilaista)`,
    );
  }
  if (muutokset.length === 0) {
    console.log("  Ei tehtävää.");
    return;
  }
  if (!vie) {
    console.log(
      `\nKuivaharjoitus: mitään ei kirjoitettu. Kirjoita: npm run laske:arvosanat -- ${dataset === "production" ? "--production " : ""}--vie`,
    );
    return;
  }

  if (dataset === "production") {
    console.log("\nVarmuuskopio productionista");
    const tulos = spawnSync("npm", ["run", "backup"], { stdio: "inherit", shell: process.platform === "win32" });
    if (tulos.status !== 0) {
      console.error("Varmuuskopio epäonnistui: mitään ei kirjoitettu.");
      process.exit(1);
    }
  }

  const kirjoitetut = await paivitaArvosanat(client);
  console.log(`✓ Kirjoitettu (${dataset}): ${kirjoitetut.length} ravintolan arvosana.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
