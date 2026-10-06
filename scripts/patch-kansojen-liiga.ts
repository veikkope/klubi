/**
 * Kansojen liigan lohkotaulukot saman kauden karsintasivulle: asettaa
 * taulukon `kaudenOttelut`-viittauksen karsintasivuun, jolla on sama vanha
 * osoite (scripts/lib/kaudet.ts). Sen jälkeen karsintasivu näyttää
 * sarjataulukon otteluiden yhteydessä, ja Kansojen liiga -sivu linkittää
 * taulukolta kauden otteluihin.
 *
 * Ajo:
 *   npm run patch:kansojen-liiga                         # development, kuivaharjoitus
 *   npm run patch:kansojen-liiga -- --vie                # development, kirjoitus
 *   npm run patch:kansojen-liiga -- --production         # production, kuivaharjoitus
 *   npm run patch:kansojen-liiga -- --production --vie   # varmuuskopio + kirjoitus
 *
 * Idempotentti: jo asetettua viittausta ei muuteta (isä on voinut valita sen
 * Studiossa itse). Productioniin vasta deployn jälkeen, kun skeemassa on kenttä.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import { createClient } from "@sanity/client";

import { paritaKaudet, type KausiTaulukko } from "./lib/kaudet";
import { sanityWriteToken } from "./lib/sanity-token";

type Tilasto = KausiTaulukko & { _rev: string; title: string; kaudenOttelut?: string | null };

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

  // Vain julkaistut: luonnoksiin ei kirjoiteta, eikä niitä paritetakaan.
  const tilastot = await client.fetch<Tilasto[]>(
    `*[_type == "jalkapalloTilasto" && category in ["karsinta", "huuhkajat"] && !(_id in path("drafts.**"))]{
      _id, _rev, title, category, huuhkajatOsio, legacyUrl, "kaudenOttelut": kaudenOttelut._ref
    }`,
  );
  const byId = new Map(tilastot.map((t) => [t._id, t]));
  const { parit, ongelmat } = paritaKaudet(tilastot);

  console.log(`Dataset ${dataset}:`);
  const tehtavat = parit.filter((pari) => {
    const taulukko = byId.get(pari.taulukko)!;
    const karsinta = byId.get(pari.karsinta)!;
    if (taulukko.kaudenOttelut) {
      const merkki = taulukko.kaudenOttelut === pari.karsinta ? "=" : "!";
      console.log(`  ${merkki} ${taulukko.title}: viittaus on jo asetettu (${taulukko.kaudenOttelut}), ei muuteta`);
      return false;
    }
    console.log(`  + ${taulukko.title} → ${karsinta.title}`);
    return true;
  });
  for (const ongelma of ongelmat) console.log(`  ? ${ongelma}`);

  if (tehtavat.length === 0) {
    console.log("  Ei tehtävää.");
    return;
  }

  const luonnokset = await client.fetch<string[]>(`*[_id in $ids]._id`, {
    ids: tehtavat.map((pari) => `drafts.${pari.taulukko}`),
  });
  if (luonnokset.length > 0) {
    console.error(`Julkaisemattomia luonnoksia: ${luonnokset.join(", ")}. Julkaise tai hylkää ne Studiossa ja aja uudelleen.`);
    process.exit(1);
  }

  if (!vie) {
    console.log(`\nKuivaharjoitus: mitään ei kirjoitettu. Kirjoita: npm run patch:kansojen-liiga -- ${dataset === "production" ? "--production " : ""}--vie`);
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
  for (const pari of tehtavat) {
    const taulukko = byId.get(pari.taulukko)!;
    tx.patch(taulukko._id, (p) =>
      p.ifRevisionId(taulukko._rev).set({ kaudenOttelut: { _type: "reference", _ref: pari.karsinta } }),
    );
  }
  await tx.commit({ visibility: "sync" });
  console.log(`✓ ${tehtavat.length} Kansojen liigan taulukkoa liitetty kauden karsintasivuun (${dataset}).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
