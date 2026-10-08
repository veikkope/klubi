/**
 * Käyttämättömien tiedostojen siivous käsin (docs/24 askel 7, K4). Yöllinen
 * huolto (app/api/huolto) tekee saman joka yö; tällä tarkistetaan lista ennen
 * ensimmäistä poistoa (docs/24 P7). `--poista` poistaa vain samat tiedostot,
 * jotka huolto poistaisi nyt (7 päivää käyttämättä huollon muistiinpanon
 * mukaan): se ei ohita armoaikaa eikä poista mitään "heti".
 * Säännöt: lib/tiedostosiivous.ts. Logiikka: sanity/lib/tiedostosiivous.ts.
 *
 * Ajo:  npm run siivoa:tiedostot                              (development, vain listaus)
 *       npm run siivoa:tiedostot -- --nyt=2026-10-20          (listaus: mitä poistettaisiin tuona päivänä)
 *       npm run siivoa:tiedostot -- --poista                  (development, poistaa)
 *       npm run siivoa:tiedostot -- --production              (tuotanto, vain listaus)
 *       npm run siivoa:tiedostot -- --production --poista     (tuotanto: varmuuskopio ensin, sitten poisto)
 *
 * Oletuksena mitään ei poisteta eikä kirjoiteta. Poistetaan vain tiedostot
 * (`sanity.fileAsset`), joihin mikään dokumentti (luonnokset mukaan lukien) ei
 * viittaa ja jotka yöllinen huolto on havainnut käyttämättömiksi yli 7 päivää
 * sitten. Varmuuskopiotiedostoihin ei kosketa koskaan. Muistiinpanoa
 * (`sivustonTila.huolto`) tämä skripti ei muuta: sen kirjoittaa vain huolto.
 */
import { spawnSync } from "node:child_process";

import { createClient } from "@sanity/client";

import { poistoAikaisintaan } from "../lib/tiedostosiivous";
import { siivoaOrvotTiedostot } from "../sanity/lib/tiedostosiivous";
import { sanityWriteToken } from "./lib/sanity-token";

const DATASET = process.argv.includes("--production") ? "production" : "development";
const POISTA = process.argv.includes("--poista");
const NYT_ARG = process.argv.find((a) => a.startsWith("--nyt="))?.slice("--nyt=".length);

const pvm = (aika: string | Date) => new Date(aika).toISOString().slice(0, 10);

async function main() {
  if (POISTA && NYT_ARG) throw new Error("--nyt on vain listausta varten: sitä ei voi käyttää yhdessä --poista-valinnan kanssa.");
  const nyt = NYT_ARG ? new Date(`${NYT_ARG}T12:00:00Z`) : new Date();
  if (Number.isNaN(nyt.getTime())) throw new Error(`Virheellinen päivä: --nyt=${NYT_ARG} (muoto VVVV-KK-PP).`);

  const token = sanityWriteToken();
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!token || !projectId) throw new Error("Token tai NEXT_PUBLIC_SANITY_PROJECT_ID puuttuu (.env.local tai npx sanity login).");
  const client = createClient({ projectId, dataset: DATASET, apiVersion: "2024-10-01", token, useCdn: false, perspective: "raw" });

  // Ensin aina listaus; poisto vasta sen jälkeen (productionissa varmuuskopion jälkeen).
  const lista = await siivoaOrvotTiedostot(client, { dryRun: true, nyt, havaintohetki: new Date() });
  console.log(
    `${DATASET}${NYT_ARG ? ` (laskettu päivälle ${NYT_ARG})` : ""}: ` +
      `${lista.orvot.length} käyttämätöntä tiedostoa, joista ${lista.siivottavat.length} poistettaisiin nyt. ` +
      `Varmuuskopiotiedostoja ${lista.varmuuskopiotiedostoja} (suojattu, ei koskaan poisteta).`,
  );
  const siivottavat = new Set(lista.siivottavat.map((a) => a._id));
  for (const o of lista.orvot) {
    const kt = o.size ? `${Math.round(o.size / 1000)} kt` : "";
    const tila = siivottavat.has(o._id)
      ? "POISTETAAN"
      : `poistetaan aikaisintaan ${pvm(poistoAikaisintaan(o, o.havaittu, nyt))}`;
    console.log(
      `  - ${o._id}  ladattu ${pvm(o._createdAt ?? nyt)}  havaittu ${pvm(o.havaittu)}  ${o.originalFilename ?? "(nimetön)"}  ${kt}  → ${tila}`,
    );
  }

  if (!POISTA) {
    console.log("\nKuivaharjoitus: mitään ei poistettu. Poista lisäämällä --poista.");
    return;
  }
  if (lista.siivottavat.length === 0) {
    console.log("\nEi poistettavaa.");
    return;
  }
  if (DATASET === "production") {
    console.log("\nVarmuuskopio productionista");
    const tulos = spawnSync("npm", ["run", "backup"], { stdio: "inherit", shell: process.platform === "win32" });
    if (tulos.status !== 0) {
      console.error("Varmuuskopio epäonnistui: mitään ei poistettu.");
      process.exit(1);
    }
  }
  const { poistetut, epaonnistuneet } = await siivoaOrvotTiedostot(client, { nyt });
  console.log(`\nPoistettu ${poistetut.length}${epaonnistuneet.length ? `, epäonnistui ${epaonnistuneet.length}` : ""}.`);
  if (epaonnistuneet.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
