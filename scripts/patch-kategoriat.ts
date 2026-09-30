/**
 * Yhdistää uutisten poistetut kategoriat nykyisiin (lib/uutinen-categories.ts
 * `MERGED_CATEGORIES`, esim. Jäsentieto → Tapahtumat 30.9.2026).
 *
 * Ajo:
 *   npm run patch:kategoriat                             # development, kuivaharjoitus
 *   npm run patch:kategoriat -- --vie                    # development, kirjoitus
 *   npm run patch:kategoriat -- --production             # production, kuivaharjoitus
 *   npm run patch:kategoriat -- --production --vie       # varmuuskopio + kirjoitus + tarkistus
 *
 * Säännöt (CLAUDE.md, docs/17 §D):
 *  - Vain kategoriat-kenttä muuttuu: vanha arvo korvataan uudella samalla
 *    paikalla, ja jos uusi on jo valittuna, vanha vain poistetaan.
 *  - Myös luonnokset (`drafts.`), jotta julkaisu ei palauta vanhaa arvoa.
 *  - Productioniin aina varmuuskopion jälkeen. Oletuksena kuivaharjoitus.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import { createClient } from "@sanity/client";

import { MERGED_CATEGORIES } from "../lib/uutinen-categories";
import { sanityWriteToken } from "./lib/sanity-token";

type Rivi = { _id: string; _rev: string; title?: string; categories: string[] };

const ERA = 100;

function yhdista(categories: string[]): string[] {
  const out: string[] = [];
  for (const c of categories) {
    const uusi = MERGED_CATEGORIES.get(c) ?? c;
    if (!out.includes(uusi)) out.push(uusi);
  }
  return out;
}

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

  const vanhat = [...MERGED_CATEGORIES.keys()];
  const rivit = await client.fetch<Rivi[]>(
    `*[_type == "uutinen" && count((categories[])[@ in $vanhat]) > 0]{ _id, _rev, title, categories }`,
    { vanhat },
  );
  console.log(`Dataset ${dataset}: muutettavia uutisia ${rivit.length}.`);
  for (const r of rivit) console.log(`  ${r.title ?? r._id}: ${r.categories.join(", ")} → ${yhdista(r.categories).join(", ")}`);
  if (rivit.length === 0) return;

  if (!vie) {
    console.log(`\nKuivaharjoitus: mitään ei kirjoitettu. Kirjoita: npm run patch:kategoriat -- ${dataset === "production" ? "--production " : ""}--vie`);
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

  // `ifRevisionId`: kesken ajon muokattu dokumentti hylkää erän. Aja silloin uudelleen.
  for (let i = 0; i < rivit.length; i += ERA) {
    const tx = client.transaction();
    for (const r of rivit.slice(i, i + ERA)) {
      tx.patch(r._id, (p) => p.ifRevisionId(r._rev).set({ categories: yhdista(r.categories) }));
    }
    await tx.commit({ visibility: "async" });
  }

  let jaljella = -1;
  for (let yritys = 1; yritys <= 10; yritys += 1) {
    jaljella = await client.fetch<number>(
      `count(*[_type == "uutinen" && count((categories[])[@ in $vanhat]) > 0])`,
      { vanhat },
    );
    if (jaljella === 0) break;
    await new Promise((valmis) => setTimeout(valmis, 2000));
  }
  if (jaljella !== 0) {
    console.error(`Tarkistus: ${jaljella} uutisella on yhä vanha kategoria. Aja uudelleen.`);
    process.exit(1);
  }
  console.log(`✓ ${rivit.length} uutisen kategoriat yhdistetty (${dataset}).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
