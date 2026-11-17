/**
 * Etusivun tapahtumien otsikko "Nähdään" pois (palaute 17.11.2026).
 *
 * Etusivun v3-migraatio (2026-09-30) kirjoitti Otteluohjelma ja tapahtumat
 * -lohkon kenttään `tapahtumatHeading` tyylioppaan esimerkkiarvon "Nähdään".
 * Otsikko ei kerro, mitä lohkossa on. Kenttä poistetaan, jolloin sivu näyttää
 * koodin oletuksen "Tulevat tapahtumat" (components/blocks/otteluohjelma-block.tsx).
 *
 * Kosketaan vain kenttään, jonka arvo on täsmälleen "Nähdään": jos isä on
 * kirjoittanut oman otsikon, se jää. Myös luonnos käsitellään. Idempotentti.
 * Ei vaadi deployta, mutta ilman uutta koodia oletus olisi yhä "Nähdään",
 * joten aja productioniin vasta deployn jälkeen.
 *
 * Ajo:
 *   npx tsx scripts/kerta/2026-11-17-tapahtumien-otsikko.ts                     # development, kuivaharjoitus
 *   npx tsx scripts/kerta/2026-11-17-tapahtumien-otsikko.ts --vie               # development, kirjoitus
 *   npx tsx scripts/kerta/2026-11-17-tapahtumien-otsikko.ts --production        # production, kuivaharjoitus
 *   npx tsx scripts/kerta/2026-11-17-tapahtumien-otsikko.ts --production --vie  # varmuuskopio + kirjoitus
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import { createClient } from "@sanity/client";

import { sanityWriteToken } from "../lib/sanity-token";

const VANHA = "Nähdään";
const TIEDOSTO = "scripts/kerta/2026-11-17-tapahtumien-otsikko.ts";

interface Etusivu {
  _id: string;
  _rev: string;
  lohkot: { _key: string; tapahtumatHeading: string | null }[] | null;
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

  // Julkaistu ja luonnos; julkaisuversioita (versions.*) ei muokata.
  const dokumentit = await client.fetch<Etusivu[]>(
    `*[_type == "etusivu" && !(_id in path("versions.**"))]{ _id, _rev, "lohkot": blocks[_type == "otteluohjelma"]{ _key, tapahtumatHeading } }`,
  );

  const muutokset = dokumentit
    .map((d) => ({
      ...d,
      avaimet: (d.lohkot ?? []).filter((l) => l.tapahtumatHeading?.trim() === VANHA).map((l) => l._key),
    }))
    .filter((d) => d.avaimet.length > 0);

  console.log(`Dataset ${dataset}: ${dokumentit.length} etusivudokumenttia, muutettavia ${muutokset.length}.`);
  for (const d of dokumentit) {
    for (const l of d.lohkot ?? []) {
      const poistetaan = l.tapahtumatHeading?.trim() === VANHA;
      console.log(`  ${d._id} / lohko ${l._key}: "${l.tapahtumatHeading ?? "(tyhjä)"}"${poistetaan ? " → kenttä poistetaan" : " (ei kosketa)"}`);
    }
  }

  if (muutokset.length === 0) {
    console.log("\nEi tehtävää.");
    return;
  }
  if (!vie) {
    console.log(`\nKuivaharjoitus: mitään ei kirjoitettu. Kirjoita: npx tsx ${TIEDOSTO} ${dataset === "production" ? "--production " : ""}--vie`);
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

  // ifRevisionId: jos isä muokkasi etusivua varmuuskopion aikana, kirjoitus
  // epäonnistuu eikä mitään kirjoiteta. Aja silloin uudelleen.
  const tx = client.transaction();
  for (const d of muutokset) {
    tx.patch(d._id, (p) =>
      p.ifRevisionId(d._rev).unset(d.avaimet.map((avain) => `blocks[_key=="${avain}"].tapahtumatHeading`)),
    );
  }
  await tx.commit({ visibility: "sync" });
  console.log(`\n✓ Otsikko poistettu ${muutokset.length} dokumentista (${dataset}).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
