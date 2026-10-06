/**
 * Kansojen liigan taulukon ja kauden karsintasivun paritus (scripts/lib/kaudet.ts).
 *
 * Ajo: npm run test:kaudet
 */
import assert from "node:assert/strict";

import { osioLiittyyKauteen } from "../lib/huuhkajat-osiot";
import { paritaKaudet } from "./lib/kaudet";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const karsinta = (id: string, legacyUrl: string) => ({ _id: id, category: "karsinta", legacyUrl });
const liiga = (id: string, legacyUrl?: string) => ({
  _id: id,
  category: "huuhkajat",
  huuhkajatOsio: "kansojen-liiga",
  legacyUrl,
});

test("vain Kansojen liigan osio liitetään kauteen", () => {
  assert.equal(osioLiittyyKauteen("kansojen-liiga"), true);
  assert.equal(osioLiittyyKauteen(" kansojen-liiga "), true);
  assert.equal(osioLiittyyKauteen("pelaajatilastot"), false);
  assert.equal(osioLiittyyKauteen(null), false);
});

test("taulukko paritetaan karsintasivuun samalla vanhalla osoitteella", () => {
  const { parit, ongelmat } = paritaKaudet([
    karsinta("karsinta-em-2028", "/ottelut2026ja2027.htm"),
    karsinta("karsinta-mm-2026", "/ottelut2024ja2025.htm"),
    liiga("liiga-2026", "/Ottelut2026ja2027.htm#lohko"),
    liiga("liiga-2024", "/ottelut2024ja2025.htm"),
  ]);
  assert.deepEqual(parit, [
    { taulukko: "liiga-2026", karsinta: "karsinta-em-2028" },
    { taulukko: "liiga-2024", karsinta: "karsinta-mm-2026" },
  ]);
  assert.deepEqual(ongelmat, []);
});

test("muiden osioiden ja kategorioiden taulukot ohitetaan", () => {
  const { parit, ongelmat } = paritaKaudet([
    karsinta("karsinta", "/pelaajatilasto.htm"),
    { _id: "pelaajat", category: "huuhkajat", huuhkajatOsio: "pelaajatilastot", legacyUrl: "/pelaajatilasto.htm" },
    { _id: "arvokisa", category: "arvokisa", legacyUrl: "/pelaajatilasto.htm" },
  ]);
  assert.deepEqual(parit, []);
  assert.deepEqual(ongelmat, []);
});

test("puuttuva tai moniselitteinen karsintasivu raportoidaan, ei arvata", () => {
  const { parit, ongelmat } = paritaKaudet([
    karsinta("a", "/ottelut2030ja2031.htm"),
    karsinta("b", "/ottelut2030ja2031.htm"),
    liiga("kaksi", "/ottelut2030ja2031.htm"),
    liiga("ei-osumaa", "/ottelut2040ja2041.htm"),
    liiga("ei-osoitetta"),
  ]);
  assert.deepEqual(parit, []);
  assert.equal(ongelmat.length, 3);
  assert.match(ongelmat[0], /^kaksi: useita/);
  assert.match(ongelmat[1], /^ei-osumaa: ei karsintasivua/);
  assert.match(ongelmat[2], /^ei-osoitetta: ei karsintasivua/);
});

console.log(`\n${ok} testiä läpi.`);
