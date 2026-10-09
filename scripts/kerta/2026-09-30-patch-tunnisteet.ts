/**
 * Täyttää uutisten muokattavan Tunnisteet-kentän (`tunnisteet`) blogin
 * alkuperäisistä tunnisteista (`blogspot.tunnisteet`), docs/14 §3.
 *
 * Ajo:
 *   npx tsx scripts/kerta/2026-09-30-patch-tunnisteet.ts                             # development, kuivaharjoitus
 *   npx tsx scripts/kerta/2026-09-30-patch-tunnisteet.ts --vie                    # development, kirjoitus
 *   npx tsx scripts/kerta/2026-09-30-patch-tunnisteet.ts --production             # production, kuivaharjoitus
 *   npx tsx scripts/kerta/2026-09-30-patch-tunnisteet.ts --production --vie       # varmuuskopio + kirjoitus + tarkistus
 *
 * Säännöt (CLAUDE.md, docs/17 §D):
 *  - **Vain puuttuvat.** Kosketaan vain uutisiin, joilla `tunnisteet` puuttuu
 *    kokonaan, ja kirjoitetaan `setIfMissing`: isän Studiossa muokkaamat (myös
 *    tyhjennetyt → kenttä puuttuu) tunnisteet eivät muutu, koska ajo tehdään
 *    kerran ennen kuin kenttää on voinut muokata. Toinen ajo ei löydä mitään.
 *  - Myös luonnokset (`drafts.`), jotta julkaisu ei pudota tunnisteita.
 *  - **Production vasta, kun kentän sisältävä Studio on julkaistu** (muuten
 *    Studio näyttää kentän tuntemattomana), ja aina varmuuskopion jälkeen.
 *  - Oletuksena kuivaharjoitus: kirjoitus vaatii `--vie`.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import { createClient } from "@sanity/client";

import { siistiTunnisteLista, TUNNISTEITA_MAX } from "../../lib/tunnisteet";
import { sanityWriteToken } from "../lib/sanity-token";

type Rivi = { _id: string; _rev: string; title?: string; alkuperaiset: string[] };

const ERA = 100;

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

  const kysely = `*[_type == "uutinen" && count(blogspot.tunnisteet) > 0 && !defined(tunnisteet)]{
    _id, _rev, title, "alkuperaiset": blogspot.tunnisteet
  }`;
  const rivit = await client.fetch<Rivi[]>(kysely);
  const patchit = rivit
    .map((r) => ({ ...r, tunnisteet: siistiTunnisteLista(r.alkuperaiset) }))
    .filter((r) => r.tunnisteet.length > 0);

  const luonnoksia = patchit.filter((r) => r._id.startsWith("drafts.")).length;
  const muuttuneita = patchit.filter((r) => r.tunnisteet.length !== r.alkuperaiset.length);
  const liianMonta = patchit.filter((r) => r.tunnisteet.length > TUNNISTEITA_MAX);
  console.log(`Dataset ${dataset}: täytettäviä uutisia ${patchit.length} (joista luonnoksia ${luonnoksia}).`);
  if (muuttuneita.length) {
    console.log(`Siistimisessä pudotettiin toistoja tai osoitteettomia ${muuttuneita.length} uutisesta:`);
    for (const r of muuttuneita) console.log(`  ${r._id}: ${r.alkuperaiset.join(", ")} → ${r.tunnisteet.join(", ")}`);
  }
  if (liianMonta.length) {
    console.log(`Huom: ${liianMonta.length} uutisessa yli ${TUNNISTEITA_MAX} tunnistetta (Studio varoittaa muokatessa).`);
  }
  if (patchit.length === 0) {
    console.log("Ei täytettävää.");
    return;
  }
  for (const r of patchit.slice(0, 5)) console.log(`  ${r.title ?? r._id}: ${r.tunnisteet.join(", ")}`);
  if (patchit.length > 5) console.log(`  … ja ${patchit.length - 5} muuta`);

  if (!vie) {
    console.log(`\nKuivaharjoitus: mitään ei kirjoitettu. Kirjoita: npx tsx scripts/kerta/2026-09-30-patch-tunnisteet.ts ${dataset === "production" ? "--production " : ""}--vie`);
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

  // `ifRevisionId`: jos dokumenttia muokataan kesken ajon, sen patch hylätään
  // (ja koko erä), eikä mitään kirjoiteta vanhan tiedon päälle. Aja silloin uudelleen.
  for (let i = 0; i < patchit.length; i += ERA) {
    const tx = client.transaction();
    for (const r of patchit.slice(i, i + ERA)) {
      tx.patch(r._id, (p) => p.ifRevisionId(r._rev).setIfMissing({ tunnisteet: r.tunnisteet }));
    }
    await tx.commit({ visibility: "async" });
    console.log(`  ${Math.min(i + ERA, patchit.length)}/${patchit.length}`);
  }

  // Kyselyindeksi päivittyy viiveellä: yritetään uudelleen ennen virhettä.
  let jaljella = -1;
  for (let yritys = 1; yritys <= 10; yritys += 1) {
    jaljella = await client.fetch<number>(`count(*[_id in $idt && !defined(tunnisteet)])`, {
      idt: patchit.map((r) => r._id),
    });
    if (jaljella === 0) break;
    await new Promise((valmis) => setTimeout(valmis, 2000));
  }
  if (jaljella !== 0) {
    console.error(`Tarkistus: ${jaljella} uutiselta puuttuu yhä tunnisteet. Aja uudelleen.`);
    process.exit(1);
  }
  console.log(`✓ ${patchit.length} uutisen tunnisteet täytetty (${dataset}).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
