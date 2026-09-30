/**
 * Kävijöiden orpojen arvostelukuvien siivous käsin, tarvittaessa (docs/18).
 * Logiikka: sanity/lib/arvostelukuvat-siivous.ts.
 *
 * Ajo:  npm run siivoa:arvostelukuvat                          (development, vain listaus)
 *       npm run siivoa:arvostelukuvat -- --poista              (development, poistaa)
 *       npm run siivoa:arvostelukuvat -- --production          (tuotanto, vain listaus)
 *       npm run siivoa:arvostelukuvat -- --production --poista (tuotanto, poistaa)
 *
 * Oletuksena mitään ei poisteta. Poistetaan vain lomakkeen lataamat kuvat,
 * joihin mikään dokumentti (luonnokset mukaan lukien) ei viittaa ja jotka ovat
 * vanhempia kuin vuorokausi.
 */
import { createClient } from "@sanity/client";

import { cleanupOrphanReviewPhotos } from "../sanity/lib/arvostelukuvat-siivous";
import { sanityWriteToken } from "./lib/sanity-token";

const DATASET = process.argv.includes("--production") ? "production" : "development";
const POISTA = process.argv.includes("--poista");

async function main() {
  const token = sanityWriteToken();
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!token || !projectId) throw new Error("Kirjoitustoken tai NEXT_PUBLIC_SANITY_PROJECT_ID puuttuu (.env.local tai npx sanity login).");
  const client = createClient({ projectId, dataset: DATASET, apiVersion: "2024-10-01", token, useCdn: false, perspective: "raw" });

  const { orphans, deleted, failed } = await cleanupOrphanReviewPhotos(client, { dryRun: !POISTA });
  if (orphans.length === 0) {
    console.log(`${DATASET}: ei orpoja arvostelukuvia.`);
    return;
  }
  console.log(`${DATASET}: ${orphans.length} orpoa arvostelukuvaa:`);
  for (const o of orphans) {
    const kt = o.size ? `${Math.round(o.size / 1000)} kt` : "";
    console.log(`  - ${o._id}  ${o._createdAt.slice(0, 10)}  ${o.originalFilename ?? ""}  ${kt}`);
  }
  if (!POISTA) {
    console.log("\nMitään ei poistettu. Poista lisäämällä --poista.");
    return;
  }
  console.log(`\nPoistettu ${deleted.length}${failed.length ? `, epäonnistui ${failed.length}` : ""}.`);
  if (failed.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
