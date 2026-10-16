/**
 * FIFA-ranking taulukoksi ja kuvaajaksi (docs/decisions/002): vie
 * `data/fifa-ranking.tsv`:n (sihteerin Excel "Suomi_Fifa_ranking 2026
 * October.xlsx", vaihtokuukausi uudelle valmentajalle) tilaston
 * `jalkapalloTilasto-fifa-ranking` taulukoksi ja kytkee kuvaajan päälle.
 *
 * Samalla korvataan vanha versio:
 *  - johdannon vanha rankingkuva (Excelistä tehty PNG, lohko i0) ja sen alla
 *    ollut käsin kirjoitettu "2026 / Huhtikuu -> 73" -rivi (i1) poistetaan;
 *    luvut lasketaan nyt taulukosta. Uutiset ja niiden kuvat jäävät.
 *  - vanhentunut tiivistelmä sekä osiosivun johdanto, hakukoneteksti ja
 *    korttiteksti ("listan kärkimaat", joita sivulla ei ole) päivitetään.
 *
 * Idempotentti ja varovainen: jokainen muutos tehdään vain, jos kenttä on yhä
 * migraation jäljiltä (isän muokkaamaa ei kosketa). Taulukkoa ei korvata, jos
 * siinä on jo rivejä.
 *
 * Ajo:
 *   npx tsx scripts/kerta/2026-10-16-fifa-ranking.ts                         # development, kuivaharjoitus
 *   npx tsx scripts/kerta/2026-10-16-fifa-ranking.ts --vie                   # development, kirjoitus
 *   npx tsx scripts/kerta/2026-10-16-fifa-ranking.ts --production            # production, kuivaharjoitus
 *   npx tsx scripts/kerta/2026-10-16-fifa-ranking.ts --production --vie      # varmuuskopio + kirjoitus
 *
 * Productioniin vasta, kun koodi (kenttä `kaavio`) on deployattu.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { createClient } from "@sanity/client";

import { jasennaPisteet, tarkistaSijoitushistoria, tunnusluvut } from "../../lib/sijoitushistoria";
import { sanityWriteToken } from "../lib/sanity-token";

const TILASTO = "jalkapalloTilasto-fifa-ranking";
const OSIOSIVU = "sivu-jalkapalloarkisto-fifa-ranking";

const VANHA_KUVA = "image-b4d90677ccbb723f048d0f5f3a729080343cf4af-1182x781-png";
const VANHA_RIVI = "Huuhkajien FIFA-ranking 2026 / Huhtikuu";

const TIIVISTELMA = {
  vanha:
    "Huuhkajien FIFA-ranking 2026 / Huhtikuu -> 73. Suomen koko FIFA-ranking historian sijoituksien keskiarvo on 59.",
  uusi: "Suomen sijoitus jokaisella FIFA:n julkaisemalla maailmanlistalla elokuusta 1993 alkaen.",
};

/** Osiosivun tekstit: vanha = lib/osiosivut.ts:n aiempi oletus, uusi = nykyinen. */
const OSIOSIVU_TEKSTIT = {
  tiivistelma: {
    vanha:
      "FIFA on julkaissut maailmanlistaa vuodesta 1992. Taulukot seuraavat Suomen sijoitusta ja listan kärkimaita julkaisukierroksittain.",
    uusi:
      "FIFA on julkaissut miesten maailmanlistaa vuodesta 1992. Kuvaaja seuraa Huuhkajien sijoitusta jokaisella listalla elokuusta 1993 alkaen, päävalmentajittain.",
  },
  seoDescription: {
    vanha:
      "Suomen sijoitus FIFA:n maailmanlistalla vuosittain sekä listan kärkimaat. Ranking päivittyy FIFA:n julkaisujen mukaan.",
    uusi:
      "Huuhkajien sijoitus FIFA:n maailmanlistalla kuukausittain vuodesta 1993: kuvaaja, paras ja heikoin sija, keskiarvo ja päävalmentajien kaudet.",
  },
  korttiteksti: {
    vanha: "Suomen sijoitus FIFA:n maailmanlistalla ja listan kärkimaat.",
    uusi: "Huuhkajien sijoitus FIFA:n maailmanlistalla kuukausittain vuodesta 1993.",
  },
} as const;

const SARAKKEET = [
  { _key: "kuukausi", key: "kuukausi", label: "Kuukausi", type: "text" },
  { _key: "sija", key: "sija", label: "Sija", type: "number" },
  { _key: "valmentaja", key: "valmentaja", label: "Valmentaja", type: "text" },
];

interface IntroLohko {
  _key: string;
  _type: string;
  asset?: { _ref?: string };
  teksti?: string;
}

interface Tilasto {
  _rev: string;
  tiivistelma?: string;
  kaavio?: string;
  rivit: number;
  columns?: { key: string; label?: string; type?: string }[];
  rows?: { cells?: { key: string; value?: string }[] }[];
  intro?: IntroLohko[];
}

type Osiosivu = { _rev: string } & Partial<Record<keyof typeof OSIOSIVU_TEKSTIT, string>>;

function lueTsv() {
  const [otsikko, ...rivit] = readFileSync("data/fifa-ranking.tsv", "utf8").trim().split("\n");
  if (otsikko !== "Kuukausi\tSija\tValmentaja") throw new Error(`data/fifa-ranking.tsv: odottamaton otsikkorivi "${otsikko}"`);
  return rivit.map((r, i) => {
    const [kuukausi, sija, valmentaja] = r.split("\t").map((s) => s.trim());
    return {
      _key: `r${i}`,
      cells: [
        { _key: "kuukausi", key: "kuukausi", value: kuukausi },
        { _key: "sija", key: "sija", value: sija },
        { _key: "valmentaja", key: "valmentaja", value: valmentaja },
      ],
    };
  });
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

  const rivit = lueTsv();
  const ongelmat = tarkistaSijoitushistoria(SARAKKEET, rivit);
  if (ongelmat.length > 0) {
    console.error("data/fifa-ranking.tsv ei kelpaa:\n" + ongelmat.map((o) => `  ${o.viesti}`).join("\n"));
    process.exit(1);
  }
  const t = tunnusluvut(jasennaPisteet(SARAKKEET, rivit))!;
  console.log(
    `Lähde: ${rivit.length} kuukautta, uusin ${t.nykyinen.kuukausi} sija ${t.nykyinen.sija}, ` +
      `paras ${t.paras.sija}, heikoin ${t.heikoin.sija}, keskiarvo ${t.keskiarvo.toFixed(1)}`,
  );

  const [tilasto, osiosivu, luonnokset] = await Promise.all([
    client.fetch<Tilasto | null>(
      `*[_id == $id][0]{ _rev, tiivistelma, kaavio, "rivit": count(rows), columns[]{ key, label, type }, rows[]{ cells[]{ key, value } }, intro[]{ _key, _type, asset, "teksti": pt::text(@) } }`,
      { id: TILASTO },
    ),
    client.fetch<Osiosivu | null>(`*[_id == $id][0]{ _rev, tiivistelma, seoDescription, korttiteksti }`, { id: OSIOSIVU }),
    client.fetch<string[]>(`*[_id in $ids]._id`, { ids: [`drafts.${TILASTO}`, `drafts.${OSIOSIVU}`] }),
  ]);
  if (!tilasto) {
    console.error(`Dataset ${dataset}: dokumenttia ${TILASTO} ei löydy.`);
    process.exit(1);
  }
  if (luonnokset.length > 0) {
    console.error(`Julkaisemattomia luonnoksia: ${luonnokset.join(", ")}. Julkaise tai hylkää ne Studiossa ja aja uudelleen.`);
    process.exit(1);
  }

  console.log(`\nDataset ${dataset}, ${TILASTO}:`);
  const asetaTilasto: Record<string, unknown> = {};
  const poistaTilasto: string[] = [];

  if ((tilasto.rivit ?? 0) > 0) {
    console.log(`  = taulukossa on jo ${tilasto.rivit} riviä, ei korvata`);
  } else {
    console.log(`  + taulukko: ${SARAKKEET.length} saraketta, ${rivit.length} riviä`);
    asetaTilasto.columns = SARAKKEET;
    asetaTilasto.rows = rivit;
  }
  // Kuvaaja vain, jos taulukko kelpaa sille: muuten tiukka tarkistus estäisi
  // isää julkaisemasta mitään muutosta dokumenttiin.
  const kelpaa =
    "rows" in asetaTilasto ||
    tarkistaSijoitushistoria(tilasto.columns, tilasto.rows).every((o) => o.taso !== "virhe");
  if (tilasto.kaavio) {
    console.log(`  = kuvaaja on jo valittu (${tilasto.kaavio})`);
  } else if (!kelpaa) {
    console.log("  ? nykyinen taulukko ei kelpaa kuvaajalle (Kuukausi, Sija, Valmentaja): kuvaajaa ei kytketä");
  } else {
    console.log("  + kuvaaja: sijoitushistoria");
    asetaTilasto.kaavio = "sijoitushistoria";
  }
  if (tilasto.tiivistelma === TIIVISTELMA.vanha) {
    console.log(`  ~ tiivistelmä → "${TIIVISTELMA.uusi}"`);
    asetaTilasto.tiivistelma = TIIVISTELMA.uusi;
  } else {
    console.log("  = tiivistelmä on muokattu, ei muuteta");
  }
  for (const lohko of tilasto.intro ?? []) {
    if (lohko._type === "imageWithAlt" && lohko.asset?._ref === VANHA_KUVA) {
      console.log(`  - johdannosta vanha rankingkuva (${lohko._key})`);
      poistaTilasto.push(`intro[_key=="${lohko._key}"]`);
    } else if (lohko._type === "block" && lohko.teksti?.startsWith(VANHA_RIVI)) {
      console.log(`  - johdannosta käsin kirjoitettu rivi "${lohko.teksti.slice(0, 60)}…" (${lohko._key})`);
      poistaTilasto.push(`intro[_key=="${lohko._key}"]`);
    }
  }

  const asetaOsiosivu: Record<string, string> = {};
  if (osiosivu) {
    console.log(`\n${OSIOSIVU}:`);
    for (const [kentta, { vanha, uusi }] of Object.entries(OSIOSIVU_TEKSTIT) as [keyof typeof OSIOSIVU_TEKSTIT, { vanha: string; uusi: string }][]) {
      if (osiosivu[kentta] === vanha) {
        console.log(`  ~ ${kentta} → "${uusi}"`);
        asetaOsiosivu[kentta] = uusi;
      } else {
        console.log(`  = ${kentta} on muokattu, ei muuteta`);
      }
    }
  }

  const muutoksia = Object.keys(asetaTilasto).length + poistaTilasto.length + Object.keys(asetaOsiosivu).length;
  if (muutoksia === 0) {
    console.log("\nEi tehtävää.");
    return;
  }
  if (!vie) {
    console.log(
      `\nKuivaharjoitus: mitään ei kirjoitettu. Kirjoita: npx tsx scripts/kerta/2026-10-16-fifa-ranking.ts ${dataset === "production" ? "--production " : ""}--vie`,
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

  // Uudelleen juuri ennen kirjoitusta: varmuuskopion aikana avattu luonnos
  // julkaisisi myöhemmin tämän muutoksen yli (ifRevisionId suojaa vain julkaistua).
  const myohaiset = await client.fetch<string[]>(`*[_id in $ids || _id in path("versions.**") && (_id match $t || _id match $o)]._id`, {
    ids: [`drafts.${TILASTO}`, `drafts.${OSIOSIVU}`],
    t: `*${TILASTO}`,
    o: `*${OSIOSIVU}`,
  });
  if (myohaiset.length > 0) {
    console.error(`Julkaisemattomia luonnoksia tai versioita: ${myohaiset.join(", ")}. Mitään ei kirjoitettu.`);
    process.exit(1);
  }

  const tx = client.transaction();
  tx.patch(TILASTO, (p) => {
    let patch = p.ifRevisionId(tilasto._rev);
    if (Object.keys(asetaTilasto).length > 0) patch = patch.set(asetaTilasto);
    if (poistaTilasto.length > 0) patch = patch.unset(poistaTilasto);
    return patch;
  });
  if (osiosivu && Object.keys(asetaOsiosivu).length > 0) {
    tx.patch(OSIOSIVU, (p) => p.ifRevisionId(osiosivu._rev).set(asetaOsiosivu));
  }
  await tx.commit({ visibility: "sync" });
  console.log(`\n✓ FIFA-ranking päivitetty (${dataset}, ${muutoksia} muutosta).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
