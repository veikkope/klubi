/**
 * Sijoitushistorian laskenta ja Studion tarkistus (lib/sijoitushistoria.ts,
 * docs/decisions/002).
 *
 * Säännöt:
 *  - kuvaaja ja tunnusluvut lasketaan taulukon riveistä (ei käsin kirjoitettuja lukuja)
 *  - kuukausi VVVV/KK (myös VVVV-KK, VVVV/K ja KK/VVVV), sija kokonaisluku 1–250
 *  - kuukausi vain kerran; aikajärjestysvirhe on varoitus, ei virhe
 *  - vaihtokuukausi kuuluu uudelle valmentajalle (data/fifa-ranking.tsv)
 *  - Excel-tuonnin otsikot (Aika, Sija, Valmentaja) tunnistetaan
 *  - etusivun arkistolohko ei näytä sijoitushistorian vanhimpia rivejä
 *    (1993) "tuoreimpana rankingina", vaan saa kaikki rivit nostoa varten
 *
 * Ajo: npm run test:sijoitushistoria
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { evaluate, parse } from "groq-js";

import {
  jasennaKuukausi,
  jasennaPisteet,
  jasennaSija,
  jaot,
  tarkistaSijoitushistoria,
  tunnistaSarakkeet,
  tunnusluvut,
  valmentajakaudet,
  viimeisetVuodet,
  type Rivi,
  type Sarake,
} from "../lib/sijoitushistoria";
import { etusivuArkistoQuery } from "../sanity/lib/queries/etusivu";

let ok = 0;
// Testit ajetaan järjestyksessä yhtenä ketjuna (osa on asynkronisia, groq-js).
let ketju: Promise<void> = Promise.resolve();
function test(nimi: string, fn: () => void | Promise<void>) {
  ketju = ketju.then(async () => {
    await fn();
    ok += 1;
    console.log(`✓ ${nimi}`);
  });
}

const SARAKKEET: Sarake[] = [
  { key: "kuukausi", label: "Kuukausi", type: "text" },
  { key: "sija", label: "Sija", type: "number" },
  { key: "valmentaja", label: "Valmentaja", type: "text" },
];

function rivi(kuukausi: string, sija: string, valmentaja = "Friis"): Rivi {
  return {
    cells: [
      { key: "kuukausi", value: kuukausi },
      { key: "sija", value: sija },
      { key: "valmentaja", value: valmentaja },
    ],
  };
}

test("kuukauden muodot", () => {
  assert.equal(jasennaKuukausi("2026/10"), "2026-10");
  assert.equal(jasennaKuukausi("2026-10"), "2026-10");
  assert.equal(jasennaKuukausi(" 2026/1 "), "2026-01");
  assert.equal(jasennaKuukausi("10/2026"), "2026-10");
  assert.equal(jasennaKuukausi("2026/13"), null);
  assert.equal(jasennaKuukausi("lokakuu 2026"), null);
  assert.equal(jasennaKuukausi(""), null);
});

test("sija on kokonaisluku 1–250", () => {
  assert.equal(jasennaSija("75"), 75);
  assert.equal(jasennaSija("75."), 75);
  assert.equal(jasennaSija("0"), null);
  assert.equal(jasennaSija("750"), null);
  assert.equal(jasennaSija("7,5"), null);
  assert.equal(jasennaSija(""), null);
});

test("Excel-tuonnin otsikot tunnistetaan", () => {
  assert.deepEqual(
    tunnistaSarakkeet([
      { key: "aika", label: "Aika", type: "text" },
      { key: "sija", label: "Sija", type: "number" },
      { key: "valmentaja", label: "Valmentaja", type: "text" },
    ]),
    { kuukausi: "aika", sija: "sija", valmentaja: "valmentaja" },
  );
  // Tuntemattomat nimet: kuukausi ensimmäinen, sija ensimmäinen numerosarake.
  assert.deepEqual(
    tunnistaSarakkeet([
      { key: "x", label: "X", type: "text" },
      { key: "y", label: "Y", type: "number" },
    ]),
    { kuukausi: "x", sija: "y", valmentaja: null },
  );
  assert.equal(tunnistaSarakkeet([{ key: "x", label: "X" }]), null);
});

test("kelvollinen taulukko ei anna ongelmia; tyhjä rivi ohitetaan", () => {
  const ongelmat = tarkistaSijoitushistoria(SARAKKEET, [rivi("2026/09", "75"), rivi("2026/10", "75"), { cells: [] }]);
  assert.deepEqual(ongelmat, []);
});

test("virheet kertovat rivin ja oikean muodon", () => {
  const ongelmat = tarkistaSijoitushistoria(SARAKKEET, [
    rivi("2026/09", "75"),
    rivi("2026/9", "75"),
    rivi("syys 2026", "x"),
    rivi("2026/11", "", ""),
  ]);
  const virheet = ongelmat.filter((o) => o.taso === "virhe").map((o) => o.viesti);
  assert.ok(virheet.some((v) => v.startsWith("Rivi 2:") && v.includes("rivillä 1")), "tupla kuukausi");
  assert.ok(virheet.some((v) => v.startsWith("Rivi 3:") && v.includes("esim. 2026/10")), "kuukauden muoto");
  assert.ok(virheet.some((v) => v.startsWith("Rivi 3:") && v.includes("sija")), "sijan muoto");
  assert.ok(virheet.some((v) => v.startsWith("Rivi 4:") && v.includes("sija puuttuu")), "sija puuttuu");
  assert.ok(virheet.some((v) => v.startsWith("Rivi 4:") && v.includes("valmentaja puuttuu")), "valmentaja puuttuu");
});

test("aikajärjestysvirhe on varoitus ja kuvaaja järjestää itse", () => {
  const rivit = [rivi("2026/10", "75"), rivi("2026/09", "72")];
  const ongelmat = tarkistaSijoitushistoria(SARAKKEET, rivit);
  assert.deepEqual(ongelmat.map((o) => o.taso), ["varoitus"]);
  assert.deepEqual(jasennaPisteet(SARAKKEET, rivit).map((p) => p.kuukausi), ["2026-09", "2026-10"]);
});

test("puuttuvat sarakkeet ovat virhe", () => {
  const [ongelma] = tarkistaSijoitushistoria([{ key: "vuosi", label: "Vuosi", type: "text" }], []);
  assert.equal(ongelma.taso, "virhe");
  assert.match(ongelma.viesti, /Kuukausi ja Sija/);
});

test("valmentajakaudet ja tunnusluvut", () => {
  const pisteet = jasennaPisteet(SARAKKEET, [
    rivi("2024/11", "69", "Kanerva 3"),
    rivi("2024/12", "69", "Kanerva 3"),
    rivi("2025/01", "69"),
    rivi("2025/02", "66"),
    rivi("2025/03", "72"),
  ]);
  const kaudet = valmentajakaudet(pisteet);
  assert.deepEqual(
    kaudet.map((k) => [k.valmentaja, k.alku, k.loppu, k.listoja, k.paras, k.heikoin]),
    [
      ["Kanerva 3", "2024-11", "2024-12", 2, 69, 69],
      ["Friis", "2025-01", "2025-03", 3, 66, 72],
    ],
  );
  const t = tunnusluvut(pisteet)!;
  assert.equal(t.nykyinen.sija, 72);
  assert.equal(t.edellinen?.sija, 66);
  assert.equal(t.paras.kuukausi, "2025-02");
  // Sama heikoin sija kahdesti: aikaisin voittaa.
  assert.equal(t.heikoin.kuukausi, "2025-03");
  assert.equal(Math.round(t.keskiarvo * 10) / 10, 69);
});

test("akselin jaot ovat tasaisia", () => {
  assert.deepEqual(jaot(30, 120, 5), [40, 60, 80, 100, 120]);
  assert.deepEqual(jaot(50, 80, 3), [50, 60, 70, 80]);
});

test("data/fifa-ranking.tsv: lähdedata kelpaa ja vastaa vanhaa sivua", () => {
  const [otsikko, ...rivit] = readFileSync("data/fifa-ranking.tsv", "utf8").trim().split("\n");
  assert.equal(otsikko, "Kuukausi\tSija\tValmentaja");
  const taulukko = rivit.map((r) => {
    const [kk, sija, valmentaja] = r.split("\t");
    return rivi(kk, sija, valmentaja);
  });
  assert.deepEqual(tarkistaSijoitushistoria(SARAKKEET, taulukko), []);
  const pisteet = jasennaPisteet(SARAKKEET, taulukko);
  const t = tunnusluvut(pisteet)!;
  // Vanha sivu: "Suomen koko FIFA-ranking historian sijoituksien keskiarvo on 59",
  // paras 33 (maaliskuu 2007), heikoin 110 (kesä 2017).
  assert.equal(Math.round(t.keskiarvo), 59);
  assert.deepEqual([t.paras.sija, t.paras.kuukausi], [33, "2007-03"]);
  assert.deepEqual([t.heikoin.sija, t.heikoin.kuukausi], [110, "2017-07"]);
  // Vaihtokuukausi kuuluu uudelle valmentajalle.
  assert.equal(pisteet.find((p) => p.kuukausi === "1994-10")?.valmentaja, "Ikäläinen");
  assert.equal(valmentajakaudet(pisteet).length, 14);
});

test("viimeiset vuodet lasketaan kalenterista uusimmasta listasta", () => {
  const pisteet = jasennaPisteet(SARAKKEET, [
    rivi("2020/09", "56"),
    rivi("2020/10", "55"),
    rivi("2020/11", "54"),
    rivi("2025/10", "72"),
  ]);
  // 5 vuotta = 60 kuukautta uusin mukaan lukien: 11/2020–10/2025.
  assert.deepEqual(viimeisetVuodet(pisteet, 5).map((p) => p.kuukausi), ["2020-11", "2025-10"]);
  assert.deepEqual(viimeisetVuodet([], 5), []);
});

test("etusivun lohko: sijoitushistoria kokonaan, muu taulukko viisi riviä", async () => {
  const rivit = Array.from({ length: 8 }, (_, i) => ({ _key: `r${i}`, cells: [{ key: "kuukausi", value: `2026/0${i + 1}` }] }));
  const tilasto = (kaavio?: string) => ({
    _id: "fifa",
    _type: "jalkapalloTilasto",
    category: "fifa-ranking",
    slug: { current: "fifa-ranking" },
    ...(kaavio ? { kaavio } : {}),
    rows: rivit,
  });
  const aja = async (doc: object) =>
    (await (await evaluate(parse(etusivuArkistoQuery), { dataset: [doc] })).get()) as { fifa: { rows: unknown[] } };
  assert.equal((await aja(tilasto("sijoitushistoria"))).fifa.rows.length, 8);
  assert.equal((await aja(tilasto())).fifa.rows.length, 5);
});

ketju.then(
  () => console.log(`\n${ok} testiä läpi.`),
  (virhe: unknown) => {
    console.error(virhe);
    process.exit(1);
  },
);
