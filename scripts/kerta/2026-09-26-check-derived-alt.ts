/** Tarkistus: kuinka moni alt-teksti on johdettavissa tiedostonimestä ja miltä tulos näyttää. Ajo: npx tsx scripts/kerta/2026-09-26-check-derived-alt.ts */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { deriveAltFromFilename } from "../lib/derive-alt";
import type { KuvaRecord } from "../download-images";

const INVENTORY = join(process.cwd(), "data", "normalized", "kuvat.json");

async function main() {
  const inventory = JSON.parse(await readFile(INVENTORY, "utf-8")) as KuvaRecord[];
  const missing = inventory.filter((k) => k.ok && k.altTexts.length === 0);

  let derived = 0;
  for (const record of missing) {
    if (deriveAltFromFilename(record.file)) derived += 1;
  }

  console.log(`Ilman alt-tekstiä: ${missing.length}`);
  console.log(`  johdettavissa:   ${derived} (${Math.round((derived / missing.length) * 100)} %)`);
  console.log(`  ei johdettavissa:${missing.length - derived}\n`);

  console.log("Näyte:");
  for (const record of missing.slice(0, 14)) {
    const alt = deriveAltFromFilename(record.file);
    console.log(`  ${(alt ?? "(ei johdettavissa)").padEnd(46)} ← ${record.file}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
