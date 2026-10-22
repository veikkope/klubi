/**
 * Ravintoloiden tiivistelmästä arvosana- ja osoitevirke pois (palaute 22.10.2026).
 *
 * Tuontiskripti (`scripts/import-ravintolat.ts`) kokosi tiivistelmän vanhan
 * sivuston faktoista: "Klubin arvio 3,4/5 (ruoka 3,3, …). Santa Fe sijaitsee
 * osoitteessa …. Klubi on vieraillut ravintolassa 15 kertaa …". Arvosana ja
 * osoite näkyvät jo sivun arvosanakortissa, ja tekstin arvosana jäi
 * tuontihetken lukuun, vaikka kortin arvosana lasketaan nyt klubilaisten
 * arvosanoista (lib/ravintola-arvosana.ts). Siksi ne olivat ristiriidassa.
 *
 * Poistetaan vain tuontiskriptin tuottamat virkkeet tekstin alusta. Toinen
 * palaute (23.10.2026): myös käyntivirke jäi tuontihetken lukuun, vaikka sivu
 * laskee käynnit itse otsikkoon ja sivupalkkiin. Jos jäljelle jää pelkkä
 * tuonnin käynti- tai "toiminta loppunut" -virke, kenttä poistetaan, jolloin
 * hakukone saa ajantasaisen kootun kuvauksen. Isän kirjoittama teksti jää.
 * Myös luonnokset käsitellään samalla säännöllä. Idempotentti.
 *
 * Ajo:
 *   npx tsx scripts/kerta/2026-10-22-ravintolat-tiivistelma.ts                     # development, kuivaharjoitus
 *   npx tsx scripts/kerta/2026-10-22-ravintolat-tiivistelma.ts --vie               # development, kirjoitus
 *   npx tsx scripts/kerta/2026-10-22-ravintolat-tiivistelma.ts --production        # production, kuivaharjoitus
 *   npx tsx scripts/kerta/2026-10-22-ravintolat-tiivistelma.ts --production --vie  # varmuuskopio + kirjoitus
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import { createClient } from "@sanity/client";

import { sanityWriteToken } from "../lib/sanity-token";

/** "Klubin arvio 3,4/5 (ruoka 3,3, hinta 3,4, viihtyvyys 3,4)." */
const ARVIO = /^Klubin arvio \d+,\d\/5(?: \([^)]*\))?\.(?:\s+|$)/;
/** Koko jäljelle jäävä teksti on tuonnin käynti- ja/tai suljettu-virke. */
const VAIN_KAYNNIT =
  /^(?:Klubi on vieraillut ravintolassa \d+ kertaa (?:vuosina \d{4}–\d{4}|vuonna \d{4})\.|Klubi vieraili ravintolassa vuonna \d{4}\.)?\s*(?:Ravintolan toiminta on sittemmin loppunut\.)?$/;
interface Ravintola {
  _id: string;
  _rev: string;
  name: string;
  address: string | null;
  city: string | null;
  tiivistelma: string;
}

/**
 * Sijaintivirke sellaisena kuin tuontiskripti sen kirjoitti ravintolan omista
 * tiedoista. Väljä lauseke veisi osoitteen pisteiden ("Rautatienk. 5") takia
 * mukanaan isän perään kirjoittaman tekstin, joten poistetaan vain täsmälleen
 * tämä virke. Jos nimeä tai osoitetta on muutettu tuonnin jälkeen, virke ei
 * osu ja se raportoidaan Studiossa korjattavaksi.
 */
function sijaintivirkkeet(r: Ravintola): string[] {
  const nimi = r.name.trim();
  const osoite = r.address?.trim();
  const kaupunki = r.city?.trim();
  const virkkeet: string[] = [];
  if (osoite) {
    virkkeet.push(`${nimi} sijaitsee osoitteessa ${osoite}.`);
    if (kaupunki) virkkeet.push(`${nimi} sijaitsee osoitteessa ${osoite}, ${kaupunki}.`);
  }
  if (kaupunki) virkkeet.push(`${nimi} sijaitsee kaupungissa ${kaupunki}.`);
  // Pisin ensin: "…osoitteessa X, Lahti." ennen kuin "…osoitteessa X.".
  return virkkeet.sort((a, b) => b.length - a.length);
}

function siivoaTiivistelma(r: Ravintola): string {
  let teksti = r.tiivistelma.trim().replace(ARVIO, "");
  for (const virke of sijaintivirkkeet(r)) {
    const loppu = teksti.slice(virke.length);
    if (teksti.startsWith(virke) && (loppu === "" || /^\s/.test(loppu))) {
      teksti = loppu;
      break;
    }
  }
  teksti = teksti.trim();
  return VAIN_KAYNNIT.test(teksti) ? "" : teksti;
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

  // Julkaistut ja luonnokset; julkaisuversioita (versions.*) ei muokata.
  const haku = `*[_type == "ravintola" && defined(tiivistelma) && !(_id in path("versions.**"))]{ _id, _rev, name, address, "city": city->name, tiivistelma }`;
  const ravintolat = await client.fetch<Ravintola[]>(haku);
  const versiot = await client.fetch<string[]>(
    `*[_type == "ravintola" && _id in path("versions.**") && tiivistelma match "sijaitsee"]._id`,
  );

  const muutokset = ravintolat
    .map((r) => ({ ...r, uusi: siivoaTiivistelma(r) }))
    .filter((r) => r.uusi !== r.tiivistelma.trim());

  console.log(`Dataset ${dataset}: ${ravintolat.length} ravintolalla tiivistelmä, muutettavia ${muutokset.length}.`);
  for (const r of muutokset.slice(0, 8)) {
    console.log(`\n  ${r._id} (${r.name})\n    ennen: ${r.tiivistelma}\n    jälkeen: ${r.uusi || "(kenttä poistetaan)"}`);
  }
  if (muutokset.length > 8) console.log(`\n  … ja ${muutokset.length - 8} muuta`);
  const tyhjia = muutokset.filter((r) => !r.uusi).length;
  console.log(`\nKenttä poistetaan kokonaan ${tyhjia} ravintolalta (vain tuonnin virkkeitä).`);
  const jaljella = ravintolat
    .map((r) => ({ _id: r._id, uusi: siivoaTiivistelma(r) }))
    .filter((r) => / sijaitsee (?:osoitteessa|kaupungissa) |Klubin arvio \d/.test(r.uusi));
  if (jaljella.length > 0) {
    console.log(`\nHuom: ${jaljella.length} tiivistelmään jää arvosana- tai osoitevirke (muokattu teksti, ei kosketa; korjaa Studiossa):`);
    for (const r of jaljella) console.log(`  ${r._id}: ${r.uusi}`);
  }
  if (versiot.length > 0) {
    console.log(`\nHuom: julkaisuversioita, joita ei muokata: ${versiot.join(", ")}`);
  }

  if (muutokset.length === 0) {
    console.log("\nEi tehtävää.");
    return;
  }
  if (!vie) {
    console.log(
      `\nKuivaharjoitus: mitään ei kirjoitettu. Kirjoita: npx tsx scripts/kerta/2026-10-22-ravintolat-tiivistelma.ts ${dataset === "production" ? "--production " : ""}--vie`,
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

  // ifRevisionId: jos isä muokkasi tiivistelmää varmuuskopion aikana, kyseinen
  // kirjoitus epäonnistuu eikä mitään kirjoiteta. Aja silloin uudelleen.
  const tx = client.transaction();
  for (const r of muutokset) {
    tx.patch(r._id, (p) => (r.uusi ? p.ifRevisionId(r._rev).set({ tiivistelma: r.uusi }) : p.ifRevisionId(r._rev).unset(["tiivistelma"])));
  }
  await tx.commit({ visibility: "sync" });
  console.log(`\n✓ ${muutokset.length} tiivistelmää päivitetty (${dataset}).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
