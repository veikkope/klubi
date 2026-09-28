/**
 * Poistaa tietosuojaselosteesta jäsenhakemusta koskevat kohdat: klubi ei ota
 * jäsenhakemuksia vastaan sivuston kautta, joten lomake ja Resend on poistettu.
 *
 * Ajo:  npx tsx scripts/poista-jasenhakemus-tietosuojasta.ts               (development)
 *       npx tsx scripts/poista-jasenhakemus-tietosuojasta.ts --production  (tuotanto, varmuuskopio ensin)
 *
 * Kohdat tunnistetaan tekstistä, ei avaimista, joten Studiossa tehdyt muut
 * muokkaukset säilyvät. Patchataan julkaistu dokumentti ja mahdollinen luonnos.
 * Ajo on idempotentti: toisella kerralla ei poistettavaa löydy.
 */
import { createClient } from "@sanity/client";

import { sanityWriteToken } from "./lib/sanity-token";

const DATASET = process.argv.includes("--production") ? "production" : "development";
const IDS = ["sivu-tietosuoja", "drafts.sivu-tietosuoja"];

/** Poistettavien lohkojen tekstien alut. */
const POISTETTAVAT = [
  "Jäsenhakemus",
  "Tiedot: etu- ja sukunimi, sähköposti, puhelinnumero",
  "Tarkoitus: jäsenhakemuksen käsittely",
  "Peruste: jäsenyyttä koskevan sopimuksen valmistelu",
  "Hakemus lähetetään sähköpostina hallitukselle",
  "Resend (jäsenhakemusten sähköpostilähetys",
];

type Lohko = { _key: string; children?: { text?: string }[] };
type Doc = { _id: string; body?: Lohko[]; tarkistettavaa?: string };

const teksti = (b: Lohko) => (b.children ?? []).map((c) => c.text ?? "").join("").trim();

function uusiTarkistettavaa(vanha: string | undefined) {
  if (!vanha) return vanha;
  return vanha
    .split("\n")
    .filter((rivi) => !rivi.includes("Jäsenhakemusten vastaanottaja"))
    .join("\n")
    .replace("(Vercel, Sanity, Resend)", "(Vercel, Sanity)");
}

async function main() {
  const token = sanityWriteToken();
  if (!token) throw new Error("Kirjoitustoken puuttuu (.env.local tai npx sanity login).");
  const client = createClient({ projectId: "zyrukn4s", dataset: DATASET, apiVersion: "2024-10-01", token, useCdn: false });

  const docs = await client.fetch<Doc[]>(`*[_id in $ids]{_id, body, tarkistettavaa}`, { ids: IDS });
  if (docs.length === 0) {
    console.log(`${DATASET}: tietosuojaselostetta ei ole, ei muutettavaa.`);
    return;
  }

  for (const doc of docs) {
    const poistettavat = (doc.body ?? []).filter((b) => POISTETTAVAT.some((alku) => teksti(b).startsWith(alku)));
    const tarkistettavaa = uusiTarkistettavaa(doc.tarkistettavaa);
    const muuttuuTarkistettavaa = tarkistettavaa !== doc.tarkistettavaa;

    if (poistettavat.length === 0 && !muuttuuTarkistettavaa) {
      console.log(`${DATASET} ${doc._id}: ei muutettavaa.`);
      continue;
    }

    let patch = client.patch(doc._id);
    if (poistettavat.length > 0) patch = patch.unset(poistettavat.map((b) => `body[_key=="${b._key}"]`));
    if (muuttuuTarkistettavaa) patch = patch.set({ tarkistettavaa });
    await patch.commit();

    console.log(`${DATASET} ${doc._id}: poistettu ${poistettavat.length} lohkoa:`);
    for (const b of poistettavat) console.log(`  - ${teksti(b).slice(0, 70)}`);
    if (muuttuuTarkistettavaa) console.log("  + Mitä tarkistaa -kenttä päivitetty");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
