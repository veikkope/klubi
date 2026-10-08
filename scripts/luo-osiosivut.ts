/**
 * Osioiden sivut Sanityyn (docs/24 askel 3): luo puuttuvat lukitut
 * `sivu`-dokumentit (lib/osiosivut.ts, 30 polkua) koodin oletusteksteillä.
 * Sivuston näkymä ja hakukonekuvaukset eivät muutu (testi: npm run test:osiosivut).
 *
 * Ajo:
 *   npm run luo:osiosivut                                # development, kuivaharjoitus
 *   npm run luo:osiosivut -- --vie                       # development, kirjoitus
 *   npm run luo:osiosivut -- --production                # production, kuivaharjoitus
 *   npm run luo:osiosivut -- --production --vie          # varmuuskopio + luonti + tarkistus
 *
 * Järjestys productionissa (docs/24 luku 5, P3): ensin deploy (koodi lukee
 * dokumentin, jos sellainen on, ja muuten oletuksen), sitten samana päivänä
 * kuivaharjoitus ja kirjoitus. Odotettu tulos 8.10.2026: 28 luotavaa,
 * 2 olemassa (klubi, klubi/palloveikkaus), 0 ristiriitaa.
 *
 * Säännöt (CLAUDE.md, docs/17 §D): vain `createIfNotExists` (olemassa olevaan
 * ei kosketa), yksi transaktio, productioniin aina varmuuskopion jälkeen.
 * Ristiriita (polulla tai tunnuksella väärä dokumentti) keskeyttää ennen
 * kirjoitusta. Ajo on idempotentti.
 *
 * Peruutus: poista luodut dokumentit tunnuksen perusteella (lista tulosteessa).
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import { createClient } from "@sanity/client";

import {
  OSIOSIVUT,
  luokitteleOsioSivut,
  osioSivuId,
  osioSivuSiemen,
  type OsioSivuSiemen,
} from "../lib/osiosivut";
import { sanityWriteToken } from "./lib/sanity-token";

type Rivi = { _id: string; slug: string | null };
type Tarkistettava = Pick<OsioSivuSiemen, "_id" | "title" | "tiivistelma" | "seoDescription"> & { slug: string | null };

const alku = (teksti: string | undefined, pituus = 60) =>
  !teksti ? "(ei johdantoa)" : teksti.length > pituus ? `${teksti.slice(0, pituus).trimEnd()}…` : teksti;

async function main() {
  const vie = process.argv.includes("--vie");
  const dataset = process.argv.includes("--production") ? "production" : "development";
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = sanityWriteToken();
  if (!projectId || !token) {
    console.error("NEXT_PUBLIC_SANITY_PROJECT_ID tai token puuttuu (.env.local tai npx sanity login).");
    process.exit(1);
  }
  const client = createClient({ projectId, dataset, apiVersion: "2025-08-15", token, useCdn: false, perspective: "raw" });

  const slugit = OSIOSIVUT.map((o) => o.slug);
  const idt = slugit.map(osioSivuId);
  const rivit = await client.fetch<Rivi[]>(
    `*[_type == "sivu" && (slug.current in $slugit || _id in $idt || _id in $luonnosIdt)]{ _id, "slug": slug.current }`,
    { slugit, idt, luonnosIdt: idt.map((id) => `drafts.${id}`) },
  );
  const { luotavat, olemassa, ristiriidat } = luokitteleOsioSivut(rivit);

  console.log(`Dataset ${dataset}`);
  console.log(
    `  Luotavia ${luotavat.length} / ${OSIOSIVUT.length}, jo olemassa ${olemassa.length}` +
      `${olemassa.length ? ` (${olemassa.map((o) => o.slug).join(", ")})` : ""}, ristiriitoja ${ristiriidat.length}`,
  );
  for (const o of luotavat) {
    console.log(`  + /${o.slug} · ${o.oletus.title} · ${alku(o.oletus.lead ?? undefined)}  [${osioSivuId(o.slug)}]`);
  }
  if (ristiriidat.length) {
    console.error("\nRistiriita: korjaa Studiossa ennen ajoa (mitään ei kirjoitettu).");
    for (const r of ristiriidat) console.error(`  ✗ ${r}`);
    process.exit(1);
  }

  if (!vie) {
    console.log(
      `\nKuivaharjoitus: mitään ei kirjoitettu. Kirjoita: npm run luo:osiosivut -- ` +
        `${dataset === "production" ? "--production " : ""}--vie`,
    );
    return;
  }
  if (luotavat.length === 0) {
    console.log("\nEi luotavaa.");
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

  // Yksi transaktio: joko kaikki luodaan tai ei mitään. createIfNotExists ei
  // koske dokumenttiin, jonka joku ehti luoda Studiossa ajon aikana.
  const tx = client.transaction();
  for (const o of luotavat) tx.createIfNotExists(osioSivuSiemen(o));
  await tx.commit({ visibility: "sync" });
  // Tunnukset heti, jotta peruutus onnistuu, vaikka tarkistus alla epäonnistuisi.
  console.log(`
Luodut tunnukset (peruutusta varten): ${luotavat.map((o) => osioSivuId(o.slug)).join(", ")}`);

  // Tarkistus: 30/30 olemassa (julkaistuna tai pelkkänä luonnoksena, jos isä
  // ehti muokata sivua Studiossa ennen ajoa), ja luotujen tekstit vastaavat siementä.
  const julkaistut = await client.fetch<Tarkistettava[]>(
    `*[_type == "sivu" && _id in $idt]{ _id, "slug": slug.current, title, tiivistelma, seoDescription }`,
    { idt },
  );
  const luonnokset = await client.fetch<string[]>(
    `*[_type == "sivu" && _id in $luonnosIdt]._id`,
    { luonnosIdt: idt.map((id) => `drafts.${id}`) },
  );
  const loytyy = new Set([...julkaistut.map((d) => d._id), ...luonnokset.map((id) => id.replace(/^drafts\./, ""))]);
  const virheet: string[] = [];
  if (loytyy.size !== OSIOSIVUT.length) {
    virheet.push(`olemassa ${loytyy.size} / ${OSIOSIVUT.length}`);
  }
  const vainLuonnos = idt.filter((id) => !julkaistut.some((d) => d._id === id) && loytyy.has(id));
  if (vainLuonnos.length) console.log(`  Huom: vain luonnoksena (julkaisematon muokkaus Studiossa): ${vainLuonnos.join(", ")}`);
  for (const o of luotavat) {
    const siemen = osioSivuSiemen(o);
    const doc = julkaistut.find((d) => d._id === siemen._id);
    if (!doc) {
      virheet.push(`${siemen._id} puuttuu`);
      continue;
    }
    if (doc.slug !== o.slug) virheet.push(`${siemen._id}: osoite ${doc.slug}`);
    if (doc.title !== siemen.title) virheet.push(`${siemen._id}: otsikko`);
    if ((doc.tiivistelma ?? undefined) !== siemen.tiivistelma) virheet.push(`${siemen._id}: tiivistelmä`);
    if ((doc.seoDescription ?? undefined) !== siemen.seoDescription) virheet.push(`${siemen._id}: hakukonekuvaus`);
  }
  if (virheet.length) {
    console.error(`Tarkistus epäonnistui (${dataset}):`);
    for (const v of virheet) console.error(`  ✗ ${v}`);
    process.exit(1);
  }
  console.log(`✓ ${dataset}: ${luotavat.length} osiosivua luotu, ${loytyy.size}/${OSIOSIVUT.length} olemassa.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
