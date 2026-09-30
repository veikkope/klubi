/**
 * Joukkueiden nimien vertailun testit (lib/joukkueet.ts, docs/13).
 *
 * Ajo: npm run test:joukkueet
 */
import assert from "node:assert/strict";

import { ehdotaJoukkue, normalizeTeam } from "../lib/joukkueet";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const TUNNETUT = [
  "Suomi",
  "FC Lahti",
  "HJK",
  "SJK",
  "KuPS",
  "FC Inter",
  "Ilves",
  "IFK Mariehamn",
  "VPS",
  "AC Oulu",
  "Gnistan",
  "FF Jaro",
  "TPS",
];

test("vertailumuoto ohittaa kirjainkoon, välilyönnit ja välimerkit", () => {
  assert.equal(normalizeTeam(" FC Lahti "), "fclahti");
  assert.equal(normalizeTeam("fc-lahti"), "fclahti");
  assert.equal(normalizeTeam("Suomi (naiset)"), "suominaiset");
});

test("täsmäävä nimi ei saa ehdotusta", () => {
  assert.equal(ehdotaJoukkue("FC Lahti", TUNNETUT), null);
  assert.equal(ehdotaJoukkue("fc lahti", TUNNETUT), null);
  assert.equal(ehdotaJoukkue("suomi", TUNNETUT), null);
  assert.equal(ehdotaJoukkue("SJK", TUNNETUT), null, "lähellä HJK:ta, mutta itse tunnettu");
});

test("kirjoitusvirhe saa ehdotuksen", () => {
  assert.equal(ehdotaJoukkue("FC Lahi", TUNNETUT), "FC Lahti");
  assert.equal(ehdotaJoukkue("FC Lahtii", TUNNETUT), "FC Lahti");
  assert.equal(ehdotaJoukkue("FC Lathi", TUNNETUT), "FC Lahti", "paikanvaihto");
  assert.equal(ehdotaJoukkue("Soumi", TUNNETUT), "Suomi", "paikanvaihto on yksi muutos");
  assert.equal(ehdotaJoukkue("Suomu", TUNNETUT), "Suomi");
  assert.equal(ehdotaJoukkue("IFK Mariehanm", TUNNETUT), "IFK Mariehamn");
  assert.equal(ehdotaJoukkue("Gnistam", TUNNETUT), "Gnistan");
});

test("eri joukkue ei saa ehdotusta", () => {
  for (const nimi of [
    "Albania",
    "Valko-Venäjä",
    "San Marino",
    "Ruotsi",
    "Suomi U21",
    "Suomi (naiset)",
    "Viro",
    "PK-35",
    "JJK",
    "KTP",
    "TPV",
  ]) {
    assert.equal(ehdotaJoukkue(nimi, TUNNETUT), null, nimi);
  }
});

test("tyhjä tai hyvin lyhyt nimi ja tyhjä lista", () => {
  assert.equal(ehdotaJoukkue("", TUNNETUT), null);
  assert.equal(ehdotaJoukkue("HK", TUNNETUT), null);
  assert.equal(ehdotaJoukkue("HKJ", TUNNETUT), null, "lyhenteitä ei verrata");
  assert.equal(ehdotaJoukkue("FC Lahden", []), null);
});

console.log(`\n${ok} testiä ok`);
