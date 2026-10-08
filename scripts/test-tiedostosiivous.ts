/**
 * Käyttämättömien tiedostojen siivouksen säännöt (lib/tiedostosiivous.ts,
 * docs/24 askel 7, K4). Erityisesti: varmuuskopiotiedostoihin ei kosketa koskaan.
 *
 * Ajo: npm run test:tiedostosiivous
 */
import assert from "node:assert/strict";

import { evaluate, parse } from "groq-js";
import type { SanityClient } from "next-sanity";

import {
  armoajanRaja,
  muistiinpanoKirjaukseen,
  onSiivottavaTiedosto,
  onVarmuuskopioTiedosto,
  paivitaOrvot,
  poistoAikaisintaan,
  TIEDOSTON_ARMOAIKA_PAIVAA,
  tiedostosiivouksenViesti,
  type TiedostoAsset,
} from "../lib/tiedostosiivous";
import { kuuluuKopioon, TIEDOSTON_ETULIITE } from "../lib/varmuuskopio";
import { TILA_ID } from "../lib/sivuston-tila";
import { siivoaOrvotTiedostot } from "../sanity/lib/tiedostosiivous";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const NYT = new Date("2026-10-08T12:00:00Z");
const paivaaSitten = (n: number) => new Date(NYT.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

const pdf = (ika: number, muuta: Partial<TiedostoAsset> = {}): TiedostoAsset => ({
  _id: `file-abc${ika}-pdf`,
  _type: "sanity.fileAsset",
  _createdAt: paivaaSitten(ika),
  originalFilename: "vuosikokouskutsu.pdf",
  extension: "pdf",
  mimeType: "application/pdf",
  size: 240_000,
  ...muuta,
});

/** Varmuuskopiotiedosto sellaisena kuin app/api/varmuuskopio sen tallentaa. */
const kopio = (ika: number, muuta: Partial<TiedostoAsset> = {}): TiedostoAsset => ({
  _id: `file-kopio${ika}-gz`,
  _type: "sanity.fileAsset",
  _createdAt: paivaaSitten(ika),
  originalFilename: "varmuuskopio-2026-10-05.ndjson.gz",
  extension: "gz",
  mimeType: "application/gzip",
  size: 2_070_000,
  ...muuta,
});

test("armoaika on 7 päivää", () => {
  assert.equal(TIEDOSTON_ARMOAIKA_PAIVAA, 7);
  assert.equal(armoajanRaja(NYT).toISOString(), "2026-10-01T12:00:00.000Z");
});

test("8 päivää vanha, 8 päivää käyttämättä ollut tiedosto siivotaan", () => {
  assert.equal(onSiivottavaTiedosto(pdf(8), NYT, paivaaSitten(8)), true);
});

test("6 päivää vanha tiedosto ei", () => {
  assert.equal(onSiivottavaTiedosto(pdf(6), NYT, paivaaSitten(6)), false);
});

test("vanha tiedosto, joka on ollut käyttämättä vasta päivän, ei (7 päivää käyttämättä)", () => {
  // Esim. liite poistettiin eilen kuukausi sitten ladatulta sivulta: versiohistoria (3 pv) ehtii palauttaa sen.
  assert.equal(onSiivottavaTiedosto(pdf(30), NYT, paivaaSitten(1)), false);
  assert.equal(onSiivottavaTiedosto(pdf(30), NYT, paivaaSitten(7.5)), true);
});

test("ilman havaintopäivää ei poisteta (ensimmäinen yö vain merkitsee)", () => {
  assert.equal(onSiivottavaTiedosto(pdf(365), NYT, undefined), false);
  assert.equal(onSiivottavaTiedosto(pdf(365), NYT, null), false);
  assert.equal(onSiivottavaTiedosto(pdf(365), NYT, "ei päivä"), false);
});

test("varmuuskopiotiedosto ei koskaan, ei vaikka se olisi vuoden vanha", () => {
  const vanha = kopio(365);
  assert.equal(onVarmuuskopioTiedosto(vanha), true);
  assert.equal(onSiivottavaTiedosto(vanha, NYT, paivaaSitten(365)), false);
  // Etuliite on sama kuin varmuuskopion tallennuksessa (lib/varmuuskopio.ts).
  assert.ok(vanha.originalFilename?.startsWith(TIEDOSTON_ETULIITE));
});

test("varmuuskopio tunnistetaan myös ilman etuliitettä (tyyppi, pääte, viittaus)", () => {
  const nimeton = { originalFilename: null };
  assert.equal(onSiivottavaTiedosto(kopio(365, { ...nimeton }), NYT, paivaaSitten(365)), false, "gzip-tyyppi ja gz-pääte");
  assert.equal(
    onSiivottavaTiedosto(kopio(365, { ...nimeton, extension: null }), NYT, paivaaSitten(365)),
    false,
    "pelkkä gzip-tyyppi",
  );
  assert.equal(
    onSiivottavaTiedosto(kopio(365, { originalFilename: "vienti.ndjson", extension: "ndjson", mimeType: null }), NYT, paivaaSitten(365)),
    false,
    "ndjson",
  );
  assert.equal(
    onSiivottavaTiedosto(kopio(365, { originalFilename: "VARMUUSKOPIO-2026-01-05.NDJSON.GZ" }), NYT, paivaaSitten(365)),
    false,
    "isot kirjaimet",
  );
  // Tavallisen näköinen tiedosto, johon varmuuskopio-dokumentti viittaa.
  const viitattu = pdf(365, { _id: "file-viitattu-pdf" });
  assert.equal(onSiivottavaTiedosto(viitattu, NYT, paivaaSitten(365), new Set(["file-viitattu-pdf"])), false);
  assert.equal(onSiivottavaTiedosto(viitattu, NYT, paivaaSitten(365), new Set(["file-muu-pdf"])), true);
});

test("varmuuskopion tiedosto ei myöskään kuulu seuraavaan kopioon (sama tunnistus)", () => {
  assert.equal(kuuluuKopioon({ _id: "file-kopio-gz", _type: "sanity.fileAsset", originalFilename: "varmuuskopio-2026-10-05.ndjson.gz" }), false);
});

test("pelkkä varmuuskopio-etuliite ei suojaa: isän PDF siivotaan, oikea kopio ei", () => {
  const isan = pdf(30, { _id: "file-jasenet-pdf", originalFilename: "varmuuskopio-jasenet.pdf" });
  assert.equal(onVarmuuskopioTiedosto(isan), false);
  assert.equal(onSiivottavaTiedosto(isan, NYT, paivaaSitten(10)), true);
  const oikea = kopio(30, { originalFilename: "varmuuskopio-2026-10-05.ndjson.gz" });
  assert.equal(onVarmuuskopioTiedosto(oikea), true);
  assert.equal(onSiivottavaTiedosto(oikea, NYT, paivaaSitten(30)), false);
});

test("huolto ei nollaa muistiinpanoa, kun siivouksen kysely epäonnistuu", () => {
  const muistio = [{ _key: "file-a-pdf", asset: "file-a-pdf", havaittu: paivaaSitten(5) }];
  assert.deepEqual(muistiinpanoKirjaukseen(muistio), { orvotTiedostot: muistio });
  assert.deepEqual(muistiinpanoKirjaukseen(undefined), {}, "kenttää ei kirjoiteta: edellinen säilyy");
  assert.deepEqual(muistiinpanoKirjaukseen(null), {});
  assert.deepEqual(muistiinpanoKirjaukseen([]), { orvotTiedostot: [] }, "onnistunut kysely ilman orpoja tyhjentää");
});

test("kuva-asset ei kuulu siivoukseen", () => {
  const kuva: TiedostoAsset = { _id: "image-abc-100x100-jpg", _type: "sanity.imageAsset", _createdAt: paivaaSitten(400) };
  assert.equal(onSiivottavaTiedosto(kuva, NYT, paivaaSitten(400)), false);
});

test("puuttuva originalFilename tai luontiaika ei kaada", () => {
  assert.equal(onSiivottavaTiedosto(pdf(10, { originalFilename: undefined, extension: undefined, mimeType: undefined }), NYT, paivaaSitten(10)), true);
  assert.equal(onSiivottavaTiedosto(pdf(10, { _createdAt: undefined }), NYT, paivaaSitten(10)), false);
  assert.equal(onVarmuuskopioTiedosto({ _id: "file-x" }), false);
});

test("muistiinpano: vanha havaintopäivä säilyy, uusi saa nykyhetken, käyttöön otettu putoaa", () => {
  const edelliset = [
    { _key: "file-a-pdf", asset: "file-a-pdf", havaittu: paivaaSitten(5) },
    { _key: "file-b-pdf", asset: "file-b-pdf", havaittu: paivaaSitten(3) },
  ];
  const orvot = [pdf(20, { _id: "file-a-pdf" }), pdf(2, { _id: "file-c-pdf" })];
  const uusi = paivitaOrvot(edelliset, orvot, NYT);
  assert.deepEqual(uusi, [
    { _key: "file-a-pdf", asset: "file-a-pdf", havaittu: paivaaSitten(5) },
    { _key: "file-c-pdf", asset: "file-c-pdf", havaittu: NYT.toISOString() },
  ]);
  assert.deepEqual(paivitaOrvot(null, [], NYT), []);
  // Tunnus on merkkijono, ei viittaus (_ref): muuten tiedosto näyttäisi käytetyltä.
  assert.equal(typeof uusi[0].asset, "string");
  assert.ok(!("_ref" in uusi[0]));
});

test("testiliite: lohko poistetaan, ja tiedosto poistuu vasta 7 päivän kuluttua", () => {
  const liite = pdf(30, { _id: "file-liite-pdf" });
  // Yö 1: huolto havaitsee tiedoston käyttämättömäksi.
  const yo1 = paivitaOrvot([], [liite], NYT);
  assert.equal(onSiivottavaTiedosto(liite, NYT, yo1[0].havaittu), false);
  // Kuuden päivän päästä ei vielä.
  const yo7 = new Date(NYT.getTime() + 6 * 24 * 3_600_000);
  const muistio7 = paivitaOrvot(yo1, [liite], yo7);
  assert.equal(onSiivottavaTiedosto(liite, yo7, muistio7[0].havaittu), false);
  // Kahdeksan päivän päästä kyllä.
  const yo9 = new Date(NYT.getTime() + 8 * 24 * 3_600_000);
  assert.equal(onSiivottavaTiedosto(liite, yo9, paivitaOrvot(muistio7, [liite], yo9)[0].havaittu), true);
  assert.equal(pvmOf(poistoAikaisintaan(liite, yo1[0].havaittu, NYT)), "2026-10-15");
  // Jos liite otetaan välillä uudelleen käyttöön, laskuri alkaa alusta.
  const kaytossa = paivitaOrvot(muistio7, [], yo7);
  assert.deepEqual(kaytossa, []);
});

test("tulosrivin viesti", () => {
  assert.equal(tiedostosiivouksenViesti(0, 0, 0), "Ei käyttämättömiä tiedostoja.");
  assert.equal(tiedostosiivouksenViesti(3, 0, 0), "Poistettu 3 käyttämätöntä tiedostoa.");
  assert.equal(tiedostosiivouksenViesti(1, 0, 0), "Poistettu 1 käyttämätön tiedosto.");
  assert.equal(tiedostosiivouksenViesti(0, 0, 2), "Ei poistettavaa. 2 käyttämätöntä tiedostoa odottaa 7 päivän armoaikaa.");
  assert.equal(tiedostosiivouksenViesti(1, 1, 1), "Poistettu 1 käyttämätön tiedosto. 1 tiedoston poisto epäonnistui. 1 käyttämätön tiedosto odottaa 7 päivän armoaikaa.");
});

function pvmOf(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/* Koko siivous (sanity/lib/tiedostosiivous.ts) groq-js:llä: kysely, suojaus ja poistot. */

type Doc = Record<string, unknown> & { _id: string; _type: string };

function valeClient(dataset: Doc[], poistetut: string[]): SanityClient {
  const client = {
    withConfig: () => client,
    fetch: async (query: string, params: Record<string, unknown>) =>
      (await evaluate(parse(query, { params }), { dataset, params })).get(),
    delete: async (id: string) => {
      poistetut.push(id);
      return {};
    },
  };
  return client as unknown as SanityClient;
}

async function testaaKysely() {
  const vanha = paivaaSitten(60);
  const viite = (ref: string) => ({ _type: "file", asset: { _type: "reference", _ref: ref } });
  const dataset: Doc[] = [
    // Varmuuskopio ja sen tiedosto (viitattu).
    { _id: "varmuuskopio-2026-10-05", _type: "varmuuskopio", tiedosto: viite("file-kopio1-gz") },
    { _id: "file-kopio1-gz", _type: "sanity.fileAsset", _createdAt: vanha, originalFilename: "varmuuskopio-2026-10-05.ndjson.gz", extension: "gz", mimeType: "application/gzip" },
    // Varmuuskopiotiedosto, jonka dokumentti on poistettu: ei silti koskaan poisteta.
    { _id: "file-kopio2-gz", _type: "sanity.fileAsset", _createdAt: vanha, originalFilename: "varmuuskopio-2026-07-06.ndjson.gz", extension: "gz", mimeType: "application/gzip" },
    // Sama ilman nimeä: tunnistetaan tyypistä.
    { _id: "file-kopio3-gz", _type: "sanity.fileAsset", _createdAt: vanha, extension: "gz", mimeType: "application/gzip" },
    // Käytössä oleva liite (julkaistu sivu) ja luonnoksen liite.
    { _id: "sivu-1", _type: "sivu", body: [{ _type: "liite", _key: "a", tiedosto: viite("file-kaytossa-pdf") }] },
    { _id: "file-kaytossa-pdf", _type: "sanity.fileAsset", _createdAt: vanha, originalFilename: "saannot.pdf", extension: "pdf" },
    { _id: "drafts.sivu-2", _type: "sivu", body: [{ _type: "liite", _key: "b", tiedosto: viite("file-luonnos-pdf") }] },
    { _id: "file-luonnos-pdf", _type: "sanity.fileAsset", _createdAt: vanha, originalFilename: "kutsu.pdf", extension: "pdf" },
    // Käyttämättömät: yksi havaittu 10 päivää sitten, yksi uusi.
    { _id: "file-orpo-pdf", _type: "sanity.fileAsset", _createdAt: vanha, originalFilename: "vanha.pdf", extension: "pdf" },
    { _id: "file-uusi-orpo-docx", _type: "sanity.fileAsset", _createdAt: vanha, originalFilename: "luonnos.docx", extension: "docx" },
    // Versioon (julkaisuversio) ja heikolla viittauksella viitatut ovat käytössä.
    { _id: "versions.r1.sivu-3", _type: "sivu", body: [{ _type: "liite", _key: "v", tiedosto: viite("file-versio-pdf") }] },
    { _id: "file-versio-pdf", _type: "sanity.fileAsset", _createdAt: vanha, originalFilename: "ohjelma.pdf", extension: "pdf" },
    { _id: "sivu-4", _type: "sivu", linkki: { tiedosto: { asset: { _type: "reference", _ref: "file-heikko-pdf", _weak: true } } } },
    { _id: "file-heikko-pdf", _type: "sanity.fileAsset", _createdAt: vanha, originalFilename: "saannot-2020.pdf", extension: "pdf" },
    // Isän tavallinen liite, jonka nimi sattuu alkamaan varmuuskopio-: ei suojattu.
    { _id: "file-jasenet-pdf", _type: "sanity.fileAsset", _createdAt: vanha, originalFilename: "varmuuskopio-jasenet.pdf", extension: "pdf", mimeType: "application/pdf" },
    // Käyttämätön kuva ei kuulu tähän siivoukseen.
    { _id: "image-orpo-10x10-jpg", _type: "sanity.imageAsset", _createdAt: vanha },
    {
      _id: TILA_ID.huolto,
      _type: "sivustonTila",
      orvotTiedostot: [
        { _key: "file-orpo-pdf", asset: "file-orpo-pdf", havaittu: paivaaSitten(10) },
        { _key: "file-jasenet-pdf", asset: "file-jasenet-pdf", havaittu: paivaaSitten(10) },
        // Edellisessä muistiinpanossa, mutta nyt käytössä: ei poisteta, putoaa listalta.
        { _key: "file-versio-pdf", asset: "file-versio-pdf", havaittu: paivaaSitten(10) },
        { _key: "file-heikko-pdf", asset: "file-heikko-pdf", havaittu: paivaaSitten(10) },
      ],
    },
  ];

  const kuiva: string[] = [];
  const lista = await siivoaOrvotTiedostot(valeClient(dataset, kuiva), { dryRun: true, nyt: NYT });
  assert.deepEqual(lista.orvot.map((o) => o._id).sort(), ["file-jasenet-pdf", "file-orpo-pdf", "file-uusi-orpo-docx"]);
  assert.deepEqual(lista.siivottavat.map((o) => o._id).sort(), ["file-jasenet-pdf", "file-orpo-pdf"]);
  assert.equal(lista.varmuuskopiotiedostoja, 3, "gzip-tiedostot ja viitattu");
  assert.deepEqual(kuiva, [], "kuivaharjoitus ei poista");

  const poistetut: string[] = [];
  const ajo = await siivoaOrvotTiedostot(valeClient(dataset, poistetut), { nyt: NYT });
  assert.deepEqual(poistetut.sort(), ["file-jasenet-pdf", "file-orpo-pdf"]);
  const suojatut = [
    "file-kopio1-gz",
    "file-kopio2-gz",
    "file-kopio3-gz",
    "file-kaytossa-pdf",
    "file-luonnos-pdf",
    "file-versio-pdf",
    "file-heikko-pdf",
    "image-orpo-10x10-jpg",
  ];
  for (const id of suojatut) assert.ok(!poistetut.includes(id), id);
  assert.deepEqual(ajo.muistiinpano, [
    { _key: "file-uusi-orpo-docx", asset: "file-uusi-orpo-docx", havaittu: NYT.toISOString() },
  ]);
  ok += 1;
  console.log(
    "✓ koko siivous (groq-js): vain yli 7 päivää käyttämättä olleet liitteet poistetaan; varmuuskopiot sekä julkaistun, " +
      "luonnoksen, version ja heikon viittauksen tiedostot eivät",
  );
}

testaaKysely()
  .then(() => console.log(`\n${ok} testiä ok`))
  .catch((virhe) => {
    console.error(virhe);
    process.exit(1);
  });
