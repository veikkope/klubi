/**
 * Luo tietosuojaselosteen Sanity-sivuksi `/tietosuoja` (docs/16, este 5).
 *
 * Ajo:  npx tsx scripts/luo-tietosuojaseloste.ts               (development)
 *       npx tsx scripts/luo-tietosuojaseloste.ts --production  (tuotanto)
 *
 * Sisältö kuuluu Sanityyn (CLAUDE.md §1), joten tämä on kertaluonteinen
 * pohja: `createIfNotExists` ei koskaan ylikirjoita sivua, jota on jo muokattu
 * Studiossa. Seloste kattaa GDPR:n artiklan 13 vähimmäistiedot sivuston
 * todellisista käsittelyistä (kommentit, arvostelut, lokit). Hallituksen on
 * vahvistettava kohdat, jotka on listattu kenttään "Mitä tarkistaa".
 */
import { createHash } from "node:crypto";
import { createClient } from "@sanity/client";

import { sanityWriteToken } from "./lib/sanity-token";

const DATASET = process.argv.includes("--production") ? "production" : "development";
const ID = "sivu-tietosuoja";

type Rivi = { tyyli?: "normal" | "h2" | "h3"; teksti: string; lista?: boolean };

const SISALTO: Rivi[] = [
  { teksti: "Tämä seloste kertoo, mitä henkilötietoja Lahden Suomalainen Klubi ry käsittelee tällä verkkosivustolla, mihin tarkoitukseen ja kuinka kauan. Seloste perustuu EU:n yleiseen tietosuoja-asetukseen (GDPR, artiklat 13 ja 14)." },
  { tyyli: "h2", teksti: "Rekisterinpitäjä" },
  { teksti: "Lahden Suomalainen Klubi ry, Lahti." },
  { teksti: "Yhteydenotot tietosuoja-asioissa: info@lahdensuomalainenklubi.com." },
  { tyyli: "h2", teksti: "Mitä tietoja käsittelemme ja miksi" },
  { tyyli: "h3", teksti: "Kommentit ja veikkaukset" },
  { lista: true, teksti: "Tiedot: kirjoittajan itse antama nimi sekä viesti tai veikkaus." },
  { lista: true, teksti: "Tarkoitus: jäsenten veikkausten ja kommenttien julkaiseminen sivustolla." },
  { lista: true, teksti: "Peruste: kirjoittajan suostumus (GDPR 6 art. 1 a). Nimi ja viesti näkyvät sivulla julkisesti." },
  { lista: true, teksti: "Säilytys: viestit säilyvät sivuston arkistossa. Poistamme viestin pyynnöstä. Vanhan Blogspot-blogin veikkauskommentit on siirretty sivustolle samoin perustein." },
  { tyyli: "h3", teksti: "Ravintola-arvostelut" },
  { lista: true, teksti: "Tiedot: arvostelijan itse antama nimi, arvosana ja arvosteluteksti sekä mahdolliset kuvat (enintään 3). Kuvista poistetaan sijainti- ja laitetiedot ennen tallennusta." },
  { lista: true, teksti: "Tarkoitus ja peruste: arvostelun julkaiseminen ravintolan sivulla arvostelijan suostumuksella (GDPR 6 art. 1 a). Arvostelu julkaistaan vasta tarkistuksen jälkeen." },
  { lista: true, teksti: "Säilytys: julkaistut arvostelut säilyvät sivustolla, julkaisematta jätetyt poistetaan kuvineen. Poistamme arvostelun ja sen kuvat pyynnöstä." },
  { tyyli: "h3", teksti: "Palvelimen lokitiedot" },
  { lista: true, teksti: "Sivuston palvelin tallentaa teknisiä lokitietoja, kuten IP-osoitteen ja pyynnön ajankohdan, tietoturvan ja vianetsinnän vuoksi (oikeutettu etu, GDPR 6 art. 1 f). Lokit säilyvät lyhyen ajan palveluntarjoajan käytännön mukaan." },
  { tyyli: "h2", teksti: "Evästeet ja selaimen tallennus" },
  { teksti: "Sivusto ei käytä seuranta-, analytiikka- eikä mainosevästeitä. Kommenttilomake voi muistaa antamasi nimen omassa selaimessasi, jotta sitä ei tarvitse kirjoittaa uudelleen. Tieto ei lähde selaimesta, ja sen voi poistaa tyhjentämällä selaimen sivustotiedot." },
  { tyyli: "h2", teksti: "Kenelle tietoja luovutetaan" },
  { teksti: "Tietoja ei myydä eikä luovuteta markkinointiin. Sivuston toteuttamiseen käytämme seuraavia palveluntarjoajia, jotka käsittelevät tietoja lukuumme:" },
  { lista: true, teksti: "Vercel Inc. (sivuston palvelin, Yhdysvallat)" },
  { lista: true, teksti: "Sanity AS (sisällönhallinta, jossa kommentit ja arvostelut säilytetään)" },
  { teksti: "Kun tietoja siirretään EU:n ulkopuolelle, siirto perustuu EU:n ja Yhdysvaltojen väliseen tietosuojakehykseen tai Euroopan komission hyväksymiin vakiosopimuslausekkeisiin." },
  { tyyli: "h2", teksti: "Oikeutesi" },
  { teksti: "Sinulla on oikeus tarkastaa tietosi, pyytää niiden oikaisemista tai poistamista, rajoittaa niiden käsittelyä ja vastustaa käsittelyä. Jos käsittely perustuu suostumukseen, voit perua sen milloin tahansa. Pyynnöt voi lähettää yllä olevaan osoitteeseen." },
  { teksti: "Jos katsot, että tietojasi käsitellään lainvastaisesti, voit tehdä valituksen tietosuojavaltuutetun toimistolle (tietosuoja.fi)." },
  { teksti: "Tietoja ei käytetä automaattiseen päätöksentekoon eikä profilointiin." },
  { tyyli: "h2", teksti: "Selosteen muutokset" },
  { teksti: "Päivitämme selostetta, kun sivuston toiminta muuttuu. Tämä versio on laadittu syyskuussa 2026." },
];

const TARKISTETTAVAA = [
  "Hallitus vahvistaa ennen domainin siirtoa:",
  "• info@lahdensuomalainenklubi.com on toimiva ja luettu osoite (tai vaihda oikeaan).",
  "• Lisää halutessasi yhdistyksen Y-tunnus ja postiosoite kohtaan Rekisterinpitäjä.",
  "• Palveluntarjoajien siirtoperusteet ovat ajan tasalla (Vercel, Sanity).",
].join("\n");

const key = (s: string) => createHash("sha1").update(`${ID}|${s}`).digest("hex").slice(0, 12);

function body() {
  return SISALTO.map((r, i) => ({
    _key: key(`b${i}`),
    _type: "block",
    style: r.tyyli ?? "normal",
    markDefs: [],
    ...(r.lista ? { listItem: "bullet", level: 1 } : {}),
    children: [{ _key: key(`b${i}s0`), _type: "span", text: r.teksti, marks: [] }],
  }));
}

async function main() {
  const token = sanityWriteToken();
  if (!token) throw new Error("Kirjoitustoken puuttuu (.env.local tai npx sanity login).");
  const client = createClient({ projectId: "zyrukn4s", dataset: DATASET, apiVersion: "2024-10-01", token, useCdn: false });
  const olemassa = await client.fetch<string | null>(`*[_id == $id][0]._id`, { id: ID });
  await client.createIfNotExists({
    _id: ID,
    _type: "sivu",
    title: "Tietosuojaseloste",
    slug: { _type: "slug", current: "tietosuoja" },
    ingress: "Mitä henkilötietoja sivusto käsittelee, miksi ja kuinka kauan.",
    body: body(),
    needsReview: true,
    tarkistettavaa: TARKISTETTAVAA,
  });
  console.log(`${DATASET}: ${olemassa ? "sivu oli jo olemassa, ei muutettu" : "tietosuojaseloste luotu (/tietosuoja)"}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
