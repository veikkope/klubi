/**
 * Asettaa Huuhkajat-taulukoille osion (`huuhkajatOsio`), jonka mukaan
 * Huuhkajat-sivu jakautuu osiosivuihin (/jalkapalloarkisto/huuhkajat/[osio]).
 *
 * Ajo:   npx tsx scripts/kerta/2026-09-30-patch-huuhkajat-osiot.ts               (development)
 *        npx tsx scripts/kerta/2026-09-30-patch-huuhkajat-osiot.ts --production  (tuotanto; ensin npm run backup)
 *        lisää --dry-run nähdäksesi muutokset kirjoittamatta
 *
 * Vain lisäys: kenttä asetetaan `setIfMissing`-operaatiolla, joten Studiossa
 * valittua osiota ei koskaan korvata. Idempotentti: toinen ajo ei muuta mitään.
 * Luonnokset (drafts.*) saavat saman arvon, jotta julkaisu ei kumoa sitä.
 */
import { createClient } from "@sanity/client";

import { huuhkajatOsioForSlug } from "../lib/huuhkajat-osio";
import { sanityWriteToken } from "../lib/sanity-token";

const DATASET = process.argv.includes("--production") ? "production" : "development";
const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  const token = sanityWriteToken();
  if (!token) throw new Error("Kirjoitustoken puuttuu (.env.local tai npx sanity login).");
  const client = createClient({ projectId: "zyrukn4s", dataset: DATASET, apiVersion: "2024-10-01", token, useCdn: false });

  const docs = await client.fetch<{ _id: string; slug: string | null }[]>(
    `*[_type == "jalkapalloTilasto" && category == "huuhkajat" && !defined(huuhkajatOsio)]
      | order(_id asc){ _id, "slug": slug.current }`,
  );

  const tx = client.transaction();
  const rivit: string[] = [];
  for (const doc of docs) {
    const osio = huuhkajatOsioForSlug(doc.slug ?? "");
    rivit.push(`  ${osio.padEnd(20)} ${doc._id}`);
    tx.patch(doc._id, (p) => p.setIfMissing({ huuhkajatOsio: osio }));
  }
  if (docs.length > 0 && !DRY_RUN) await tx.commit();

  console.log(`
Datasetti ............... ${DATASET}${DRY_RUN ? " (kuiva ajo, ei kirjoitettu)" : ""}
Osio asetettu ........... ${docs.length}${docs.length === 0 ? " (ajan tasalla)" : ""}
${rivit.join("\n")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
