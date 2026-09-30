/**
 * Päivittää tietosuojaselosteen ravintola-arvostelujen kohdat kattamaan
 * arvostelujen kuvat (docs/18 §7).
 *
 * Ajo:  npx tsx scripts/lisaa-kuvat-tietosuojaan.ts               (development)
 *       npx tsx scripts/lisaa-kuvat-tietosuojaan.ts --production  (tuotanto, varmuuskopio ensin: npm run backup)
 *
 * Kohdat tunnistetaan tekstin alusta, ei avaimista, joten Studiossa tehdyt
 * muut muokkaukset säilyvät. Jos hallitus on jo muotoillut kohdan uudelleen
 * niin, ettei alku täsmää, kohta jätetään rauhaan ja siitä kerrotaan.
 * Patchataan julkaistu dokumentti ja mahdollinen luonnos. Ajo on idempotentti.
 */
import { createClient } from "@sanity/client";

import { sanityWriteToken } from "./lib/sanity-token";

const DATASET = process.argv.includes("--production") ? "production" : "development";
const IDS = ["sivu-tietosuoja", "drafts.sivu-tietosuoja"];

/** Tekstin alku → uusi teksti. Uusi teksti alkaa samoin, joten toinen ajo ei muuta mitään. */
const MUUTOKSET: { alku: string; vanha: string; uusi: string }[] = [
  {
    alku: "Tiedot: arvostelijan itse antama nimi",
    vanha: "Tiedot: arvostelijan itse antama nimi, arvosana ja arvosteluteksti.",
    uusi:
      "Tiedot: arvostelijan itse antama nimi, arvosana ja arvosteluteksti sekä mahdolliset kuvat (enintään 3). " +
      "Kuvista poistetaan sijainti- ja laitetiedot ennen tallennusta.",
  },
  {
    alku: "Säilytys: julkaistut arvostelut",
    vanha: "Säilytys: julkaistut arvostelut säilyvät sivustolla, julkaisematta jätetyt poistetaan. Poistamme arvostelun pyynnöstä.",
    uusi:
      "Säilytys: julkaistut arvostelut säilyvät sivustolla, julkaisematta jätetyt poistetaan kuvineen. " +
      "Poistamme arvostelun ja sen kuvat pyynnöstä.",
  },
];

type Span = { _key: string; text?: string };
type Lohko = { _key: string; children?: Span[] };
type Doc = { _id: string; body?: Lohko[] };

const teksti = (b: Lohko) => (b.children ?? []).map((c) => c.text ?? "").join("").trim();

async function main() {
  const token = sanityWriteToken();
  if (!token) throw new Error("Kirjoitustoken puuttuu (.env.local tai npx sanity login).");
  const client = createClient({ projectId: "zyrukn4s", dataset: DATASET, apiVersion: "2024-10-01", token, useCdn: false });

  const docs = await client.fetch<Doc[]>(`*[_id in $ids]{_id, body}`, { ids: IDS });
  if (docs.length === 0) {
    console.log(`${DATASET}: tietosuojaselostetta ei ole, ei muutettavaa.`);
    return;
  }

  for (const doc of docs) {
    let patch = client.patch(doc._id);
    let muutettu = 0;
    for (const m of MUUTOKSET) {
      const lohko = (doc.body ?? []).find((b) => teksti(b).startsWith(m.alku));
      const nyt = lohko ? teksti(lohko) : null;
      if (!lohko || nyt === m.uusi) continue;
      if (nyt !== m.vanha) {
        console.log(`${DATASET} ${doc._id}: kohtaa on muokattu Studiossa, päivitä käsin:\n  "${nyt}"`);
        continue;
      }
      // Yksi tekstiosa uudella tekstillä; kohdassa ei ole muotoiluja (ks. luo-tietosuojaseloste.ts).
      const [eka] = lohko.children ?? [];
      patch = patch.set({ [`body[_key=="${lohko._key}"].children`]: [{ ...eka, text: m.uusi, marks: [] }] });
      muutettu += 1;
    }
    if (muutettu === 0) {
      console.log(`${DATASET} ${doc._id}: ei muutettavaa.`);
      continue;
    }
    await patch.commit();
    console.log(`${DATASET} ${doc._id}: päivitetty ${muutettu} kohtaa.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
