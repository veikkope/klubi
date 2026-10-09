/**
 * Lisää tietosuojaselosteeseen evästeettömät kävijätilastot (GoatCounter,
 * components/kavijatilasto.tsx): oma kohta käsittelyihin, palveluntarjoaja
 * listaan ja selosteen päivityskuukausi.
 *
 * Ajo:  npx tsx scripts/kerta/2026-10-09-lisaa-kavijatilastot-tietosuojaan.ts               (development)
 *       npx tsx scripts/kerta/2026-10-09-lisaa-kavijatilastot-tietosuojaan.ts --production  (tuotanto, varmuuskopio ensin: npm run backup)
 *
 * Lisäyskohdat tunnistetaan edeltävän kohdan tekstin alusta, ei avaimista,
 * joten Studiossa tehdyt muut muokkaukset säilyvät. Jos kohtaa ei löydy, se
 * jätetään rauhaan ja siitä kerrotaan. Patchataan julkaistu dokumentti ja
 * mahdollinen luonnos. Ajo on idempotentti. Jos ajo kaatuu revisiovirheeseen,
 * dokumenttia muokattiin samaan aikaan: aja uudelleen.
 */
import { createHash } from "node:crypto";
import { createClient } from "@sanity/client";

import { sanityWriteToken } from "../lib/sanity-token";

const DATASET = process.argv.includes("--production") ? "production" : "development";
const IDS = ["sivu-tietosuoja", "drafts.sivu-tietosuoja"];

type Rivi = { tyyli?: "h3"; teksti: string; lista?: boolean };

/** Lisättävät lohkot sen kohdan jälkeen, jonka teksti alkaa `jalkeen`. `tunniste` kertoo, onko lisäys jo tehty. */
const LISAYKSET: { jalkeen: string; tunniste: string; rivit: Rivi[] }[] = [
  {
    jalkeen: "Sivuston palvelin tallentaa teknisiä lokitietoja",
    tunniste: "Kävijätilastot",
    rivit: [
      { tyyli: "h3", teksti: "Kävijätilastot" },
      {
        lista: true,
        teksti:
          "Tiedot: avattu sivu, sivu tai palvelu josta sivulle tultiin, selaimen ja käyttöjärjestelmän tyyppi, näytön koko ja maa. " +
          "IP-osoitetta ei tallenneta, selaimeen ei tallenneta mitään eikä evästeitä käytetä.",
      },
      {
        lista: true,
        teksti:
          "Tarkoitus ja peruste: tieto siitä, mitä sivuja luetaan, sivuston kehittämiseksi (oikeutettu etu, GDPR 6 art. 1 f). " +
          "Tilastot ovat koosteita, eikä niistä voi tunnistaa yksittäistä kävijää.",
      },
    ],
  },
  {
    jalkeen: "Sanity AS (sisällönhallinta",
    tunniste: "GoatCounter",
    rivit: [{ lista: true, teksti: "GoatCounter (evästeettömät kävijätilastot)" }],
  },
];

/** Tekstin alku → uusi teksti, kuten scripts/kerta/2026-09-30-lisaa-kuvat-tietosuojaan.ts. */
const MUUTOKSET: { alku: string; vanha: string; uusi: string }[] = [
  {
    alku: "Päivitämme selostetta, kun sivuston toiminta muuttuu.",
    vanha: "Päivitämme selostetta, kun sivuston toiminta muuttuu. Tämä versio on laadittu syyskuussa 2026.",
    uusi: "Päivitämme selostetta, kun sivuston toiminta muuttuu. Tämä versio on päivitetty lokakuussa 2026.",
  },
];

type Span = { _key: string; text?: string };
type Lohko = { _key: string; children?: Span[] };
type Doc = { _id: string; _rev: string; body?: Lohko[] };

const teksti = (b: Lohko) => (b.children ?? []).map((c) => c.text ?? "").join("").trim();
const key = (s: string) => createHash("sha1").update(`kavijatilastot|${s}`).digest("hex").slice(0, 12);

function lohkot(rivit: Rivi[], tunniste: string) {
  return rivit.map((r, i) => ({
    _key: key(`${tunniste}${i}`),
    _type: "block",
    style: r.tyyli ?? "normal",
    markDefs: [],
    ...(r.lista ? { listItem: "bullet", level: 1 } : {}),
    children: [{ _key: key(`${tunniste}${i}s0`), _type: "span", text: r.teksti, marks: [] }],
  }));
}

async function main() {
  const token = sanityWriteToken();
  if (!token) throw new Error("Kirjoitustoken puuttuu (.env.local tai npx sanity login).");
  const client = createClient({ projectId: "zyrukn4s", dataset: DATASET, apiVersion: "2024-10-01", token, useCdn: false });

  const docs = await client.fetch<Doc[]>(`*[_id in $ids]{_id, _rev, body}`, { ids: IDS });
  if (docs.length === 0) {
    console.log(`${DATASET}: tietosuojaselostetta ei ole, ei muutettavaa.`);
    return;
  }

  for (const doc of docs) {
    const body = doc.body ?? [];
    // Patch pitää vain yhden insertin, joten jokainen lisäys on oma patchinsa
    // samassa transaktiossa. Ensimmäinen kantaa revisiolukon: jos dokumentti
    // muuttui lukemisen jälkeen, koko transaktio hylätään.
    let tekstit = client.patch(doc._id).ifRevisionId(doc._rev);
    const lisaykset: ReturnType<typeof client.patch>[] = [];
    const muutetut: string[] = [];

    for (const l of LISAYKSET) {
      if (body.some((b) => teksti(b).startsWith(l.tunniste))) continue;
      const edellinen = body.find((b) => teksti(b).startsWith(l.jalkeen));
      if (!edellinen) {
        console.log(`${DATASET} ${doc._id}: kohtaa "${l.jalkeen}…" ei löytynyt, lisää "${l.tunniste}" käsin.`);
        continue;
      }
      lisaykset.push(client.patch(doc._id).insert("after", `body[_key=="${edellinen._key}"]`, lohkot(l.rivit, l.tunniste)));
      muutetut.push(l.tunniste);
    }

    for (const m of MUUTOKSET) {
      const lohko = body.find((b) => teksti(b).startsWith(m.alku));
      const nyt = lohko ? teksti(lohko) : null;
      if (!lohko || nyt === m.uusi) continue;
      if (nyt !== m.vanha) {
        console.log(`${DATASET} ${doc._id}: kohtaa on muokattu Studiossa, päivitä käsin:\n  "${nyt}"`);
        continue;
      }
      const [eka] = lohko.children ?? [];
      tekstit = tekstit.set({ [`body[_key=="${lohko._key}"].children`]: [{ ...eka, text: m.uusi, marks: [] }] });
      muutetut.push(m.alku);
    }

    if (muutetut.length === 0) {
      console.log(`${DATASET} ${doc._id}: ei muutettavaa.`);
      continue;
    }
    const transaktio = client.transaction().patch(tekstit);
    for (const p of lisaykset) transaktio.patch(p);
    await transaktio.commit();
    console.log(`${DATASET} ${doc._id}: päivitetty ${muutetut.join(", ")}.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
