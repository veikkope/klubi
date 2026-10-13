/**
 * Otteluohjelman rajauksen testit (lib/ottelusuodatus.ts, docs/13).
 *
 * - Studiossa lisätty ottelu näkyy aina (13.10.2026 "Suomi U21" katosi etusivulta)
 * - automaattisesta syötteestä vain Huuhkajat ja valitut seurat
 * - laskuri näyttää vain Huuhkajat, ei Studion U21-ottelua
 *
 * Ajo: npm run test:ottelusuodatus
 */
import assert from "node:assert/strict";

import { ottelunSuodatin, tarvitaanSyote, type SuodatettavaOttelu } from "../lib/ottelusuodatus";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const huuhkajat: SuodatettavaOttelu = { koti: "Suomi", vieras: "San Marino", maajoukkue: true, studiossa: true };
const u21: SuodatettavaOttelu = { koti: "Suomi U21", vieras: "Irlanti U21", maajoukkue: false, studiossa: true };
const lahti: SuodatettavaOttelu = { koti: "HJK", vieras: "FC Lahti", maajoukkue: false, studiossa: false };
const muu: SuodatettavaOttelu = { koti: "HJK", vieras: "KuPS", maajoukkue: false, studiossa: false };
const kaikki = [huuhkajat, u21, lahti, muu];

test("etusivun oletus: Huuhkajat, Studion U21 ja FC Lahti, ei muita syötteen otteluita", () => {
  const nakyy = kaikki.filter(ottelunSuodatin({ vainMaajoukkue: true, seurat: ["fc lahti"] }));
  assert.deepEqual(nakyy, [huuhkajat, u21, lahti]);
});

test("tyhjä seuralista: Studion ottelut näkyvät silti", () => {
  const nakyy = kaikki.filter(ottelunSuodatin({ vainMaajoukkue: true }));
  assert.deepEqual(nakyy, [huuhkajat, u21]);
});

test("rajaus pois: kaikki ottelut", () => {
  assert.deepEqual(kaikki.filter(ottelunSuodatin({})), kaikki);
});

test("laskuri: vain Huuhkajat, ei U21:tä", () => {
  const nakyy = kaikki.filter(ottelunSuodatin({ vainHuuhkajat: true, seurat: ["FC Lahti"] }));
  assert.deepEqual(nakyy, [huuhkajat]);
});

test("syöte haetaan vain kun seurajoukkueita tarvitaan", () => {
  assert.equal(tarvitaanSyote({}), true);
  assert.equal(tarvitaanSyote({ vainMaajoukkue: true }), false);
  assert.equal(tarvitaanSyote({ vainMaajoukkue: true, seurat: [" "] }), false);
  assert.equal(tarvitaanSyote({ vainMaajoukkue: true, seurat: ["FC Lahti"] }), true);
  assert.equal(tarvitaanSyote({ vainHuuhkajat: true }), false);
});

test("seurat = null (GROQ, kenttä tyhjä): ei kaadu", () => {
  assert.deepEqual(kaikki.filter(ottelunSuodatin({ vainMaajoukkue: true, seurat: null })), [huuhkajat, u21]);
  assert.equal(tarvitaanSyote({ vainMaajoukkue: true, seurat: null }), false);
});

console.log(`\n${ok} testiä OK`);
