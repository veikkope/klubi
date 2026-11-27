/**
 * Arvokisat-sivun mitalitaulukot oman kisatyyppinsä osioon (lib/arvokisaosiot.ts).
 *
 * Ajo: npm run test:arvokisaosiot
 */
import assert from "node:assert/strict";

import { taulukonKisatyyppi } from "../lib/arvokisaosiot";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

test("tuotannon mitalitaulukot osuvat oikeaan osioon", () => {
  assert.equal(taulukonKisatyyppi("mm-kisojen-mitalistit"), "mm");
  assert.equal(taulukonKisatyyppi("em-kisojen-mitalistit"), "em");
  assert.equal(taulukonKisatyyppi("kansojen-liigan-mitalistit"), "kansojen-liiga");
});

test("muut etuliitteet osuvat oikeaan osioon", () => {
  assert.equal(taulukonKisatyyppi("u21-em-mitalistit"), "u21-em");
  assert.equal(taulukonKisatyyppi("alle-21-vuotiaiden-em"), "u21-em");
  assert.equal(taulukonKisatyyppi("pikkuhuuhkajat"), "u21-em");
  assert.equal(taulukonKisatyyppi("olympialaisten-mitalistit"), "olympialaiset");
});

test("tunnistamaton tai puuttuva osoite jää Mitalistit-osioon", () => {
  assert.equal(taulukonKisatyyppi("maailman-parhaat"), null);
  assert.equal(taulukonKisatyyppi(null), null);
  assert.equal(taulukonKisatyyppi(""), null);
});

console.log(`\n${ok} testiä läpi.`);
