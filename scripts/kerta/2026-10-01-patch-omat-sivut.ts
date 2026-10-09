/**
 * Taulukot omille sivuilleen vaihtamalla niiden kategoria:
 *  - TOP 10 järkytykset: `saavutukset` → `jarkytykset` (/jalkapalloarkisto/jarkytykset)
 *  - Maailman paras avaus: `ballon-dor` → `maailman-parhaat` (/jalkapalloarkisto/maailman-parhaat)
 *
 * Ajo:
 *   npx tsx scripts/kerta/2026-10-01-patch-omat-sivut.ts                         # development, kuivaharjoitus
 *   npx tsx scripts/kerta/2026-10-01-patch-omat-sivut.ts --vie                # development, kirjoitus
 *   npx tsx scripts/kerta/2026-10-01-patch-omat-sivut.ts --production         # production, kuivaharjoitus
 *   npx tsx scripts/kerta/2026-10-01-patch-omat-sivut.ts --production --vie   # varmuuskopio + kirjoitus
 *
 * Productioniin vasta, kun uudet sivut on julkaistu: muuten taulukko katoaa
 * vanhalta sivulta ennen kuin uusi sivu on olemassa.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import { createClient } from "@sanity/client";

import { sanityWriteToken } from "../lib/sanity-token";

const SIIRROT = [
  { id: "jalkapalloTilasto-top10-jarkytykset", category: "jarkytykset" },
  { id: "jalkapalloTilasto-maailman-parhaat-pelaajat", category: "maailman-parhaat" },
];

type Tilasto = { _id: string; _rev: string; category?: string };

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

  const ids = SIIRROT.map((s) => s.id);
  const [tilastot, luonnokset] = await Promise.all([
    client.fetch<Tilasto[]>(`*[_id in $ids]{ _id, _rev, category }`, { ids }),
    client.fetch<string[]>(`*[_id in $ids]._id`, { ids: ids.map((id) => `drafts.${id}`) }),
  ]);
  if (luonnokset.length > 0) {
    console.error(`Julkaisemattomia luonnoksia: ${luonnokset.join(", ")}. Julkaise tai hylkää ne Studiossa ja aja uudelleen.`);
    process.exit(1);
  }

  console.log(`Dataset ${dataset}:`);
  const tehtavat = SIIRROT.flatMap((siirto) => {
    const tilasto = tilastot.find((t) => t._id === siirto.id);
    if (!tilasto) {
      console.log(`  ! ${siirto.id}: ei datasetissä, ohitetaan`);
      return [];
    }
    if (tilasto.category === siirto.category) return [];
    console.log(`  ~ ${siirto.id}: kategoria ${tilasto.category} → ${siirto.category}`);
    return [{ tilasto, category: siirto.category }];
  });
  if (tehtavat.length === 0) {
    console.log("  Ei tehtävää.");
    return;
  }

  if (!vie) {
    console.log(`\nKuivaharjoitus: mitään ei kirjoitettu. Kirjoita: npx tsx scripts/kerta/2026-10-01-patch-omat-sivut.ts ${dataset === "production" ? "--production " : ""}--vie`);
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

  const tx = client.transaction();
  for (const { tilasto, category } of tehtavat) {
    tx.patch(tilasto._id, (p) => p.ifRevisionId(tilasto._rev).set({ category }));
  }
  await tx.commit({ visibility: "sync" });
  console.log(`✓ ${tehtavat.length} taulukkoa siirretty omille sivuilleen (${dataset}).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
