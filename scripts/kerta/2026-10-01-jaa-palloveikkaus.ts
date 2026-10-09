/**
 * Jakaa palloveikkaussivun (`klubi/palloveikkaus`) kolmeksi alasivuksi:
 * maaottelujen tulosveikkaus, arvokisaveikkaus ja Veikkausliigan palloveikkaus.
 * Jokaisella veikkauksella on oma sivunsa, säännöt ja taulukot; hubiin jää
 * yläbanneri ja tiivistelmä, ja se listaa alasivut kortteina.
 *
 * Ajo:
 *   npx tsx scripts/kerta/2026-10-01-jaa-palloveikkaus.ts                         # development, kuivaharjoitus
 *   npx tsx scripts/kerta/2026-10-01-jaa-palloveikkaus.ts --vie                # development, kirjoitus
 *   npx tsx scripts/kerta/2026-10-01-jaa-palloveikkaus.ts --production         # production, kuivaharjoitus
 *   npx tsx scripts/kerta/2026-10-01-jaa-palloveikkaus.ts --production --vie   # varmuuskopio + kirjoitus + tarkistus
 *
 * Säännöt (CLAUDE.md, docs/17 §D):
 *  - Alasivut luodaan `createIfNotExists`: olemassa olevaa ei ylikirjoiteta.
 *  - Hubin patch (`ifRevisionId`) ja alasivut samassa transaktiossa.
 *  - Keskeytyy, jos hubilla on luonnos tai se on jo jaettu.
 *  - Productioniin aina varmuuskopion jälkeen. Oletuksena kuivaharjoitus.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import { createClient } from "@sanity/client";

import { sanityWriteToken } from "../lib/sanity-token";

const HUB_ID = "sivu-klubi-palloveikkaus";

type Ref = { _key: string; _ref: string; _type: "reference" };
type Block = { _key: string; _type: string; style?: string; listItem?: string; children?: { text?: string }[] };
type Hub = {
  _id: string;
  _rev: string;
  body?: Block[];
  tilastot?: Ref[];
  muutLegacyUrlit?: string[];
};

interface Alasivu {
  osa: string;
  title: string;
  /** Hubin h2-otsikko, jonka alla olevat lohkot siirtyvät alasivulle. */
  otsikko: string;
  tiivistelma: string;
  legacyUrl: string;
  /** Mitkä hubin taulukot kuuluvat tälle sivulle. */
  taulukko: (ref: string) => boolean;
  /** Lohkot, jotka olivat pelkkiä väliotsikoita vanhalla sivulla. */
  pudota?: string[];
}

const ALASIVUT: Alasivu[] = [
  {
    osa: "maaottelut",
    title: "Maaottelujen tulosveikkaus",
    otsikko: "Maaottelujen tulosveikkaus",
    tiivistelma:
      "Klubin jäsenten tulosveikkaukset Huuhkajien maaotteluihin: veikkauksen säännöt ja jokaisen veikatun ottelun veikkaukset.",
    legacyUrl: "/veikkausmaaottelujentulos.htm",
    taulukko: (ref) => ref === "jalkapalloTilasto-klubi-maaottelujen-tulosveikkaus",
  },
  {
    osa: "arvokisat",
    title: "Arvokisaveikkaus",
    otsikko: "Arvokisaveikkaus",
    tiivistelma:
      "Jalkapallon arvokisojen voittajaveikkaus: klubin jäsenten veikkaukset MM- ja EM-kisojen parhaista joukkueista vuodesta 1998.",
    legacyUrl: "/veikkausarvokisat.htm",
    taulukko: (ref) => ref.startsWith("jalkapalloTilasto-klubi-arvokisaveikkaus-"),
    pudota: ["Jalkapallon arvokisojen voittajaveikkaus"],
  },
  {
    osa: "veikkausliiga",
    title: "Veikkausliigan palloveikkaus",
    otsikko: "Veikkausliigan palloveikkaus",
    tiivistelma:
      "Veikkausliigan palloveikkaus: klubin jäsenten veikkaamat sarjataulukot ja veikkauksen lopputilanne kausittain vuodesta 2006.",
    legacyUrl: "/veikkauspalloveikkaus.htm",
    taulukko: (ref) => ref.startsWith("jalkapalloTilasto-klubi-palloveikkaus-"),
    pudota: ["Palloveikkaus"],
  },
];

const teksti = (block: Block) => (block.children ?? []).map((c) => c.text ?? "").join("").trim();

/** Hubin h2-osion lohkot (ilman otsikkoa); alaotsikot nousevat tasolla ylöspäin. */
function osionLohkot(body: Block[], sivu: Alasivu): Block[] {
  const alku = body.findIndex((b) => b.style === "h2" && teksti(b) === sivu.otsikko);
  if (alku < 0) throw new Error(`Hubista puuttuu otsikko "${sivu.otsikko}".`);
  const loppu = body.findIndex((b, i) => i > alku && b.style === "h2");
  return body
    .slice(alku + 1, loppu < 0 ? undefined : loppu)
    .filter((b) => !(b.style === "normal" && !b.listItem && sivu.pudota?.includes(teksti(b))))
    .map((b) => (b.style === "h3" ? { ...b, style: "h2" } : b));
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

  const [hub, luonnos] = await Promise.all([
    client.getDocument<Hub>(HUB_ID),
    client.getDocument(`drafts.${HUB_ID}`),
  ]);
  if (!hub) throw new Error(`Dokumenttia ${HUB_ID} ei ole datasetissä ${dataset}.`);
  if (luonnos) {
    console.error("Palloveikkaussivulla on julkaisematon luonnos. Julkaise tai hylkää se Studiossa ja aja uudelleen.");
    process.exit(1);
  }
  const tilastot = hub.tilastot ?? [];
  if (tilastot.length === 0) {
    console.log(`Dataset ${dataset}: palloveikkaussivu on jo jaettu (ei taulukoita hubissa). Ei tehtävää.`);
    return;
  }

  const body = hub.body ?? [];
  const docs = ALASIVUT.map((sivu) => ({
    _id: `${HUB_ID}-${sivu.osa}`,
    _type: "sivu",
    title: sivu.title,
    slug: { _type: "slug", current: `klubi/palloveikkaus/${sivu.osa}` },
    kieli: "fi",
    tiivistelma: sivu.tiivistelma,
    body: osionLohkot(body, sivu),
    tilastot: tilastot.filter((t) => sivu.taulukko(t._ref)),
    legacyUrl: sivu.legacyUrl,
    needsReview: false,
  }));

  const jaetut = new Set(docs.flatMap((d) => d.tilastot.map((t) => t._ref)));
  const jaamatta = tilastot.filter((t) => !jaetut.has(t._ref));
  if (jaamatta.length > 0) {
    throw new Error(`Taulukot ilman alasivua: ${jaamatta.map((t) => t._ref).join(", ")}`);
  }

  console.log(`Dataset ${dataset}:`);
  for (const d of docs) {
    console.log(`  + /${d.slug.current}: ${d.title}, ${d.body.length} lohkoa, ${d.tilastot.length} taulukkoa, ${d.legacyUrl}`);
  }
  console.log(`  ~ /klubi/palloveikkaus: pääsisältö (${body.length} lohkoa), taulukot (${tilastot.length}) ja muut vanhat osoitteet siirtyvät alasivuille`);

  if (!vie) {
    console.log(`\nKuivaharjoitus: mitään ei kirjoitettu. Kirjoita: npx tsx scripts/kerta/2026-10-01-jaa-palloveikkaus.ts ${dataset === "production" ? "--production " : ""}--vie`);
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
  for (const d of docs) tx.createIfNotExists(d);
  tx.patch(HUB_ID, (p) => p.ifRevisionId(hub._rev).unset(["body", "tilastot", "muutLegacyUrlit"]));
  await tx.commit({ visibility: "sync" });

  const tarkistus = await client.fetch<{ alasivuja: number; hubTaulukoita: number }>(
    `{
      "alasivuja": count(*[_type == "sivu" && _id in $ids && count(tilastot) > 0]),
      "hubTaulukoita": count(*[_id == $hub][0].tilastot)
    }`,
    { ids: docs.map((d) => d._id), hub: HUB_ID },
  );
  if (tarkistus.alasivuja !== docs.length || tarkistus.hubTaulukoita > 0) {
    console.error(`Tarkistus epäonnistui: ${JSON.stringify(tarkistus)}`);
    process.exit(1);
  }
  console.log(`✓ Palloveikkaus jaettu ${docs.length} alasivuksi (${dataset}).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
