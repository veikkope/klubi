/**
 * Uutiskategoriat koodista Sanityyn (4.10.2026): luo Uutiskategoria-dokumentit
 * (scripts/lib/uutiskategoriat.ts) ja muuttaa uutisten `categories`-merkkijonot
 * `kategoriat`-viittauksiksi. Polut säilyvät, joten ?kategoria=…-linkit toimivat.
 *
 * Ajo:
 *   npm run patch:uutiskategoriat                                   # development, kuivaharjoitus
 *   npm run patch:uutiskategoriat -- --vie                          # development, kirjoitus
 *   npm run patch:uutiskategoriat -- --production                   # production, kuivaharjoitus
 *   npm run patch:uutiskategoriat -- --production --vie             # varmuuskopio + kirjoitus + tarkistus
 *   ... --poista-vanhat                                             # lisäksi vanha `categories`-kenttä pois
 *
 * Vaiheet productionissa (vanha koodi lukee `categories`, uusi `kategoriat`):
 *   1. --production --vie                  ennen deployta: lisää viittaukset, vanha kenttä jää
 *   2. deploy
 *   3. --production --vie --poista-vanhat  deployn jälkeen: välissä luodut uutiset + vanha kenttä pois
 *
 * Säännöt (CLAUDE.md, docs/17 §D): kategoriat luodaan vain, jos niitä ei ole
 * (createIfNotExists: sihteerin muutoksia ei kirjoiteta yli). Uutisesta muuttuu
 * vain kategoriakenttä, myös luonnoksissa. Productioniin aina varmuuskopion jälkeen.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import { createClient } from "@sanity/client";

import { sanityWriteToken } from "./lib/sanity-token";
import {
  KATEGORIASIEMENET,
  kategoriaDokumentti,
  kategoriaViittaukset,
  tuntematonKategoria,
} from "./lib/uutiskategoriat";

type Rivi = { _id: string; _rev: string; title?: string; categories?: (string | null)[]; onKategoriat: boolean };

const ERA = 100;

async function main() {
  const vie = process.argv.includes("--vie");
  const poistaVanhat = process.argv.includes("--poista-vanhat");
  const dataset = process.argv.includes("--production") ? "production" : "development";
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = sanityWriteToken();
  if (!projectId || !token) {
    console.error("NEXT_PUBLIC_SANITY_PROJECT_ID tai kirjoitustoken puuttuu (.env.local tai npx sanity login).");
    process.exit(1);
  }
  const client = createClient({ projectId, dataset, apiVersion: "2025-08-15", token, useCdn: false, perspective: "raw" });

  const olemassa = new Set(
    await client.fetch<string[]>(`*[_id in $idt]._id`, { idt: KATEGORIASIEMENET.map((s) => kategoriaDokumentti(s)._id) }),
  );
  const luotavat = KATEGORIASIEMENET.filter((s) => !olemassa.has(kategoriaDokumentti(s)._id));

  const rivit = await client.fetch<Rivi[]>(
    `*[_type == "uutinen" && defined(categories)]{ _id, _rev, title, categories, "onKategoriat": defined(kategoriat) }`,
  );
  const lisattavat = rivit.filter((r) => !r.onKategoriat && kategoriaViittaukset(r.categories?.filter(Boolean) as string[]).length > 0);
  const tuntemattomat = new Map<string, number>();
  for (const r of rivit) {
    for (const arvo of r.categories ?? []) {
      if (arvo && tuntematonKategoria(arvo)) tuntemattomat.set(arvo, (tuntemattomat.get(arvo) ?? 0) + 1);
    }
  }

  console.log(`Dataset ${dataset}`);
  console.log(`  Luotavia kategorioita: ${luotavat.length} / ${KATEGORIASIEMENET.length}${luotavat.length ? ` (${luotavat.map((s) => s.nimi).join(", ")})` : ""}`);
  console.log(`  Uutisia, joilla vanha kenttä: ${rivit.length}, joista viittaukset lisätään: ${lisattavat.length}`);
  if (poistaVanhat) console.log(`  Vanha categories-kenttä poistetaan: ${rivit.length} uutisesta`);
  if (tuntemattomat.size) {
    console.log(`  ⚠ Tuntemattomat arvot (ei siirretä): ${[...tuntemattomat].map(([a, n]) => `${a} ×${n}`).join(", ")}`);
  }

  if (!vie) {
    console.log(
      `\nKuivaharjoitus: mitään ei kirjoitettu. Kirjoita: npm run patch:uutiskategoriat -- ` +
        `${dataset === "production" ? "--production " : ""}--vie${poistaVanhat ? " --poista-vanhat" : ""}`,
    );
    return;
  }
  if (luotavat.length === 0 && lisattavat.length === 0 && !(poistaVanhat && rivit.length > 0)) {
    console.log("\nEi muutettavaa.");
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

  if (luotavat.length) {
    const tx = client.transaction();
    for (const s of luotavat) tx.createIfNotExists(kategoriaDokumentti(s));
    await tx.commit();
  }

  // `ifRevisionId`: kesken ajon muokattu dokumentti hylkää erän. Aja silloin uudelleen.
  const muutettavat = poistaVanhat ? rivit : lisattavat;
  for (let i = 0; i < muutettavat.length; i += ERA) {
    const tx = client.transaction();
    for (const r of muutettavat.slice(i, i + ERA)) {
      tx.patch(r._id, (p) => {
        let patch = p.ifRevisionId(r._rev);
        const viittaukset = kategoriaViittaukset(r.categories?.filter(Boolean) as string[]);
        if (!r.onKategoriat && viittaukset.length) patch = patch.set({ kategoriat: viittaukset });
        return poistaVanhat ? patch.unset(["categories"]) : patch;
      });
    }
    await tx.commit({ visibility: "async" });
  }

  // Tarkistus: jokaisella vanhan kentän uutisella on viittaukset (tai kenttä on poistettu).
  const tarkistus = poistaVanhat
    ? `count(*[_type == "uutinen" && defined(categories)])`
    : `count(*[_type == "uutinen" && defined(categories) && !defined(kategoriat)
         && count((categories[])[@ in $tunnetut]) > 0])`;
  const tunnetut = KATEGORIASIEMENET.flatMap((s) => [s.polku, ...(s.aiemmatPolut ?? [])]);
  let jaljella = -1;
  for (let yritys = 1; yritys <= 10; yritys += 1) {
    jaljella = await client.fetch<number>(tarkistus, { tunnetut });
    if (jaljella === 0) break;
    await new Promise((valmis) => setTimeout(valmis, 2000));
  }
  const kategorioita = await client.fetch<number>(`count(*[_type == "uutisKategoria"])`);
  if (jaljella !== 0) {
    console.error(`Tarkistus: ${jaljella} uutista on yhä käsittelemättä. Aja uudelleen.`);
    process.exit(1);
  }
  console.log(
    `✓ ${dataset}: kategorioita ${kategorioita}, viittaukset lisätty ${lisattavat.length} uutiseen` +
      `${poistaVanhat ? `, vanha kenttä poistettu ${rivit.length} uutisesta` : ""}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
