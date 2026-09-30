/**
 * Blogin uudet kirjoitukset (ja niiden kommentit) productioniin (docs/14 §6).
 *
 * Ajo:
 *   npm run sync:blogspot                        # 1. blogi → development (hakee, jäsentää, tuo)
 *   npm run sync:blogspot:production             # 2. kuivaharjoitus: listaa, mitä vietäisiin
 *   npm run sync:blogspot:production -- --vie    # 3. varmuuskopio + vienti + tarkistus
 *
 * Säännöt (CLAUDE.md, docs/17 §D):
 *  - **Vain lisäys.** Viedään vain dokumentit, joiden `_id` puuttuu productionista.
 *    Tuotannossa jo olevia ei kosketa, joten isän Studiossa tekemät muokkaukset
 *    säilyvät. Blogissa muokattuja vanhoja kirjoituksia ei päivitetä (tarkoituksella).
 *  - **Varmuuskopio ensin** (`npm run backup`); jos se epäonnistuu, vientiä ei tehdä.
 *  - **Oletuksena kuivaharjoitus**: production-kirjoitus vaatii `--vie`.
 *
 * Kommentit viedään vain, jos niiden uutinen on productionissa tai tulee samassa
 * viennissä, jotta viittaus ei jää roikkumaan.
 *
 * Vanhojen blogiosoitteiden ohjaus (/blogspot/…) toimii uusille kirjoituksille
 * ilman deployta (app/blogspot/[...polku]/route.ts). `npm run redirects` kannattaa
 * silti ajaa ja commitoida, jotta staattinen lista pysyy täydellisenä.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";

import { createClient } from "@sanity/client";

import { sanityWriteToken } from "./lib/sanity-token";

const DATASET = "production";
const LAHTEET = ["data/migration-blogspot.ndjson", "data/migration-blogspot-kommentit.ndjson"];
const VALIAIKAINEN = "data/sync-blogspot-production.ndjson";

type Doc = {
  _id: string;
  _type: string;
  title?: string;
  publishedAt?: string;
  uutinen?: { _ref?: string };
};

function lueNdjson(tiedosto: string): Doc[] {
  if (!existsSync(tiedosto)) {
    console.error(`${tiedosto} puuttuu. Aja ensin: npm run sync:blogspot`);
    process.exit(1);
  }
  return readFileSync(tiedosto, "utf8")
    .split("\n")
    .filter((rivi) => rivi.trim())
    .map((rivi) => JSON.parse(rivi) as Doc);
}

function aja(komento: string, argumentit: string[], env?: NodeJS.ProcessEnv): number {
  const tulos = spawnSync(komento, argumentit, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: env ?? process.env,
  });
  return tulos.status ?? 1;
}

async function main() {
  const vie = process.argv.includes("--vie");
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = sanityWriteToken();
  if (!projectId || !token) {
    console.error("NEXT_PUBLIC_SANITY_PROJECT_ID tai kirjoitustoken puuttuu (.env.local tai npx sanity login).");
    process.exit(1);
  }
  const client = createClient({ projectId, dataset: DATASET, apiVersion: "2025-08-15", token, useCdn: false });

  const docs = LAHTEET.flatMap(lueNdjson);
  const idt = docs.map((d) => d._id);
  // Myös luonnokset: jos isä on jo luonut samalla id:llä luonnoksen, sitä ei ohiteta.
  const olemassa = new Set<string>(
    await client.fetch<string[]>(`*[_id in $idt || _id in $luonnokset]._id`, {
      idt,
      luonnokset: idt.map((id) => `drafts.${id}`),
    }),
  );
  const onTuotannossa = (id: string) => olemassa.has(id) || olemassa.has(`drafts.${id}`);

  const uudetUutiset = docs.filter((d) => d._type === "uutinen" && !onTuotannossa(d._id));
  const uutisetTuotannossa = new Set([
    ...docs.filter((d) => d._type === "uutinen" && onTuotannossa(d._id)).map((d) => d._id),
    ...uudetUutiset.map((d) => d._id),
  ]);
  const uudetKommentit = docs.filter(
    (d) => d._type === "kommentti" && !onTuotannossa(d._id) && uutisetTuotannossa.has(d.uutinen?._ref ?? ""),
  );
  const vietavat = [...uudetUutiset, ...uudetKommentit];

  console.log(`Blogin dokumentteja: ${docs.length}, productionissa jo: ${docs.length - vietavat.length}`);
  if (vietavat.length === 0) {
    console.log("Production on ajan tasalla. Ei vietävää.");
    return;
  }
  console.log(`\nVietäisiin ${uudetUutiset.length} kirjoitusta ja ${uudetKommentit.length} kommenttia:`);
  for (const d of uudetUutiset) console.log(`  + ${d.publishedAt?.slice(0, 10) ?? "?"}  ${d.title}`);

  if (!vie) {
    console.log("\nKuivaharjoitus: mitään ei kirjoitettu. Vie productioniin: npm run sync:blogspot:production -- --vie");
    return;
  }

  console.log("\n1/3 Varmuuskopio productionista");
  if (aja("npm", ["run", "backup"]) !== 0) {
    console.error("Varmuuskopio epäonnistui: vientiä ei tehty.");
    process.exit(1);
  }

  console.log(`\n2/3 Vienti → ${DATASET} (--missing)`);
  writeFileSync(VALIAIKAINEN, vietavat.map((d) => JSON.stringify(d)).join("\n") + "\n");
  try {
    const status = aja("npx", ["sanity", "dataset", "import", VALIAIKAINEN, "--dataset", DATASET, "--missing"], {
      ...process.env,
      SANITY_AUTH_TOKEN: token,
    });
    if (status !== 0) process.exit(status);
  } finally {
    unlinkSync(VALIAIKAINEN);
  }

  console.log("\n3/3 Tarkistus");
  // Kyselyindeksi päivittyy kirjoituksen jälkeen viiveellä (sekunteja):
  // yritetään uudelleen ennen kuin vienti todetaan epäonnistuneeksi.
  let loytyi = 0;
  for (let yritys = 1; yritys <= 10; yritys += 1) {
    loytyi = await client.fetch<number>(`count(*[_id in $idt])`, { idt: vietavat.map((d) => d._id) });
    if (loytyi === vietavat.length) break;
    await new Promise((valmis) => setTimeout(valmis, 2000));
  }
  if (loytyi !== vietavat.length) {
    console.error(`Productionissa ${loytyi}/${vietavat.length} viedystä dokumentista. Tarkista vienti.`);
    process.exit(1);
  }
  console.log(`✓ ${loytyi}/${vietavat.length} dokumenttia productionissa.`);
  console.log("\nSeuraavaksi: npm run redirects (commitoi lib/redirects.ts, jos se muuttui).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
