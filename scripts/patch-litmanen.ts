/**
 * Litmanen-osio: päävalikon "Pelaajat"-linkki → "Litmanen", ja vanha
 * litmanen.htm (loukkaantumissivu) ohjautuu loukkaantumistaulukon sivulle
 * eikä profiiliin.
 *
 * Ajo:
 *   npm run patch:litmanen                         # development, kuivaharjoitus
 *   npm run patch:litmanen -- --vie                # development, kirjoitus
 *   npm run patch:litmanen -- --production         # production, kuivaharjoitus
 *   npm run patch:litmanen -- --production --vie   # varmuuskopio + kirjoitus
 *
 * Säännöt (CLAUDE.md, docs/17 §D): dokumenttikohtaiset patchit `ifRevisionId`-
 * ehdolla samassa transaktiossa, productioniin aina varmuuskopion jälkeen.
 * Isän omia valikkomuutoksia ei kosketa: vain href `/jalkapalloarkisto/pelaajat`.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import { createClient } from "@sanity/client";

import { LITMANEN_PATH } from "../lib/path";
import { sanityWriteToken } from "./lib/sanity-token";

const NAV_ID = "navigaatio";
const PELAAJA_ID = "pelaaja-jari-litmanen";
const VANHA_HREF = "/jalkapalloarkisto/pelaajat";
const LOUKKAANTUMIS_URL = "/litmanen.htm";

type Linkki = { _key: string; label?: string; href?: string; children?: Linkki[] };
type Navigaatio = { _id: string; _rev: string; items?: Linkki[] };
type Pelaaja = { _id: string; _rev: string; muutLegacyUrlit?: string[] };

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

  const [nav, navLuonnos, pelaaja, pelaajaLuonnos] = await Promise.all([
    client.getDocument<Navigaatio>(NAV_ID),
    client.getDocument(`drafts.${NAV_ID}`),
    client.getDocument<Pelaaja>(PELAAJA_ID),
    client.getDocument(`drafts.${PELAAJA_ID}`),
  ]);
  if (navLuonnos || pelaajaLuonnos) {
    console.error("Navigaatiolla tai Jari Litmasen sivulla on julkaisematon luonnos. Julkaise tai hylkää se Studiossa ja aja uudelleen.");
    process.exit(1);
  }

  const muutokset: string[] = [];
  let uudetItems: Linkki[] | null = null;
  if (nav?.items) {
    let osui = false;
    const korvaa = (l: Linkki): Linkki =>
      l.href === VANHA_HREF ? ((osui = true), { ...l, label: "Litmanen", href: LITMANEN_PATH }) : l;
    const items = nav.items.map((item) => ({
      ...korvaa(item),
      ...(item.children ? { children: item.children.map(korvaa) } : {}),
    }));
    if (osui) {
      uudetItems = items;
      muutokset.push(`  ~ navigaatio: "Pelaajat" (${VANHA_HREF}) → "Litmanen" (${LITMANEN_PATH})`);
    }
  }

  const muut = pelaaja?.muutLegacyUrlit ?? [];
  const uudetMuut = muut.filter((url) => url.toLowerCase() !== LOUKKAANTUMIS_URL);
  if (pelaaja && uudetMuut.length !== muut.length) {
    muutokset.push(`  ~ ${PELAAJA_ID}: ${LOUKKAANTUMIS_URL} pois muista vanhoista osoitteista (ohjautuu loukkaantumistaulukolle)`);
  }

  console.log(`Dataset ${dataset}:`);
  if (muutokset.length === 0) {
    console.log("  Ei tehtävää.");
    return;
  }
  console.log(muutokset.join("\n"));

  if (!vie) {
    console.log(`\nKuivaharjoitus: mitään ei kirjoitettu. Kirjoita: npm run patch:litmanen -- ${dataset === "production" ? "--production " : ""}--vie`);
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
  if (nav && uudetItems) tx.patch(NAV_ID, (p) => p.ifRevisionId(nav._rev).set({ items: uudetItems }));
  if (pelaaja && uudetMuut.length !== muut.length) {
    tx.patch(PELAAJA_ID, (p) => p.ifRevisionId(pelaaja._rev).set({ muutLegacyUrlit: uudetMuut }));
  }
  await tx.commit({ visibility: "sync" });
  console.log(`✓ Litmanen-osion sisältömuutokset kirjoitettu (${dataset}).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
