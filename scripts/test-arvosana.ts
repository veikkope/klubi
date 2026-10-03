/**
 * Ravintolan arvosanalaskennan testit (lib/ravintola-arvosana.ts).
 *
 * Ajo: npm run test:arvosana
 */
import assert from "node:assert/strict";

import {
  automaattinen,
  laskeArvosana,
  paivaksi,
  voimassaOlevat,
  type Arvosanat,
  type KlubilaisenArvio,
} from "../lib/ravintola-arvosana";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const taulukko = (arvioija: string, r: number, h: number, v: number, paiva = "2020-01-01"): KlubilaisenArvio => ({
  arvioija,
  nimi: arvioija,
  ratingFood: r,
  ratingPrice: h,
  ratingAtmosphere: v,
  paiva,
  tuotu: true,
  lahde: "arvosana",
});
const lomake = (arvioija: string, r: number, h: number, v: number, paiva: string): KlubilaisenArvio => ({
  arvioija,
  nimi: arvioija,
  ratingFood: r,
  ratingPrice: h,
  ratingAtmosphere: v,
  paiva,
  tuotu: false,
  lahde: "arvostelu",
});
const vanha: Arvosanat = { ratingOverall: 3.6, ratingFood: 3.5, ratingPrice: 3.8, ratingAtmosphere: 3.5 };

test("ei painoja: kokonaisarvosana on osa-arvosanojen keskiarvo", () => {
  const t = laskeArvosana([taulukko("Ilpo", 3.5, 2.9, 3.2)]);
  assert.equal(t.arvosanat.ratingOverall, 3.2); // (3,5 + 2,9 + 3,2) / 3 = 3,2
});

test("ravintolan arvosana on klubilaisten keskiarvo", () => {
  const t = laskeArvosana([taulukko("Ilpo", 4, 3, 5), taulukko("Olli", 5, 3, 4)]);
  assert.deepEqual(t.arvosanat, { ratingOverall: 4, ratingFood: 4.5, ratingPrice: 3, ratingAtmosphere: 4.5 });
  assert.equal(t.arvioijia, 2);
});

test("uusi arvio korvaa saman klubilaisen vanhan: vaikutus 1/10", () => {
  const kymmenen = Array.from({ length: 10 }, (_, i) => taulukko(`A${i}`, 3, 3, 3));
  const t = laskeArvosana([...kymmenen, lomake("A0", 5, 5, 5, "2026-09-30T18:35:54Z")]);
  assert.equal(t.arvioijia, 10, "sama arvioija ei tule kahdesti");
  assert.equal(t.arvosanat.ratingOverall, 3.2); // (9 × 3 + 5) / 10
});

test("samana päivänä lomake voittaa taulukon", () => {
  const [v] = voimassaOlevat([taulukko("Veikko", 3, 3, 3, "2026-09-30"), lomake("Veikko", 4, 4, 4, "2026-09-30T18:00:00Z")]);
  assert.equal(v.lahde, "arvostelu");
});

test("vanhempi lomake ei korvaa uudempaa taulukon riviä", () => {
  const [v] = voimassaOlevat([taulukko("Veikko", 3, 3, 3, "2026-09-27"), lomake("Veikko", 4, 4, 4, "2025-01-01T12:00:00Z")]);
  assert.equal(v.lahde, "arvosana");
});

test("pyöristys yhteen desimaaliin", () => {
  const t = laskeArvosana([taulukko("A", 4.2, 3.1, 4.4), taulukko("B", 3.9, 3.3, 4.0), taulukko("C", 4.5, 3.0, 3.8)]);
  assert.equal(t.arvosanat.ratingFood, 4.2);
  assert.equal(t.arvosanat.ratingPrice, 3.1);
  assert.equal(t.arvosanat.ratingOverall, 3.8);
});

test("2,85 pyöristyy ylöspäin 2,9:ään (liukuluku 2,8499…)", () => {
  const t = laskeArvosana([taulukko("A", 2.9, 3, 3), taulukko("B", 2.8, 3, 3)]);
  assert.equal(t.arvosanat.ratingFood, 2.9);
});

test("tuorein arvio Helsingin päivänä", () => {
  assert.equal(paivaksi("2026-10-02T22:30:00Z"), "2026-10-03", "klo 22.30 UTC on Helsingissä jo seuraava päivä");
  const t = laskeArvosana([taulukko("A", 4, 4, 4, "2026-08-01"), lomake("B", 4, 4, 4, "2026-10-02T22:30:00Z")]);
  assert.equal(t.viimeisinArvio, "2026-10-03");
});

test("automaattisuus: taulukkodata tai ei vanhaa arvosanaa", () => {
  assert.equal(automaattinen(vanha, [taulukko("A", 3, 3, 3)]), true, "taulukko kattaa vanhan arvosanan");
  assert.equal(automaattinen(null, [lomake("A", 3, 3, 3, "2026-10-03T12:00:00Z")]), true, "uusi ravintola (Central)");
  assert.equal(
    automaattinen(vanha, [lomake("A", 3, 3, 3, "2026-10-03T12:00:00Z")]),
    false,
    "vanha arvosana ilman taulukkoa pysyy: yksi arvio ei korvaa usean keskiarvoa",
  );
  assert.equal(automaattinen(null, []), false);
});

console.log(`\n${ok} testiä ok`);
