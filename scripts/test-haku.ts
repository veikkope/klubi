/**
 * Uutishaun hakusanojen testit (lib/haku.ts).
 *
 * Ajo: npm run test:haku
 */
import assert from "node:assert/strict";

import { HAKU_MAX_PITUUS, HAKU_MAX_SANAT, hakusanat, siistiHaku } from "../lib/haku";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

test("taivutus: pitkistä sanoista alkuosa", () => {
  assert.deepEqual(hakusanat("Huuhkajat"), ["huuhkaj*"]);
  assert.deepEqual(hakusanat("mölkky"), ["mölkk*"]);
  assert.deepEqual(hakusanat("Lahti"), ["laht*"]);
  assert.deepEqual(hakusanat("pizza"), ["pizz*"]);
  assert.deepEqual(hakusanat("HJK"), ["hjk*"], "lyhyt sana sellaisenaan");
  assert.deepEqual(hakusanat("2026"), ["2026*"], "luku sellaisenaan");
});

test("useampi sana, kaikkien pitää löytyä", () => {
  assert.deepEqual(hakusanat("FC Lahti"), ["fc*", "laht*"]);
  assert.deepEqual(hakusanat("  Suomi   -  Valko-Venäjä "), ["suom*", "valk*", "venäj*"]);
});

test("erikoismerkit eivät päädy kyselyyn", () => {
  assert.deepEqual(hakusanat('mölkky* "] | order(x)'), ["mölkk*", "orde*"]);
  assert.deepEqual(hakusanat("***"), []);
  assert.deepEqual(hakusanat("a"), [], "liian lyhyt");
  assert.deepEqual(hakusanat(""), []);
  assert.deepEqual(hakusanat(undefined), []);
});

test("toistot ja enimmäismäärä", () => {
  assert.deepEqual(hakusanat("Lahti lahti LAHTI"), ["laht*"]);
  assert.equal(hakusanat("yksi kaksi kolme neljä viisi kuusi seitsemän kahdeksan").length, HAKU_MAX_SANAT);
});

test("syötteen siistiminen", () => {
  assert.equal(siistiHaku("  FC   Lahti  "), "FC Lahti");
  assert.equal(siistiHaku("x".repeat(500)).length, HAKU_MAX_PITUUS);
  assert.equal(siistiHaku(null), "");
});

console.log(`\n${ok} testiä ok`);
