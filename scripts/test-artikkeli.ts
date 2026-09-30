/**
 * Artikkelin tekstiapurien testit (lib/artikkeli.ts).
 *
 * Ajo: npm run test:artikkeli
 */
import assert from "node:assert/strict";

import {
  ensimmainenKappaleIngressiksi,
  lukuaika,
  tekstiRivina,
  tiivistelmaToistaaTekstin,
} from "../lib/artikkeli";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const kappale = (text: string, style = "normal") => ({
  _type: "block",
  style,
  children: [{ _type: "span", text }],
});
const kuva = { _type: "imageWithAlt" };
const sanoja = (n: number) => Array.from({ length: n }, (_, i) => `sana${i}`).join(" ");

test("tekstiRivina: lohkot yhdeksi riviksi, kuvat ohitetaan", () => {
  assert.equal(tekstiRivina([kappale("Eka  kappale."), kuva, kappale("Toka.")]), "Eka kappale. Toka.");
  assert.equal(tekstiRivina(null), "");
  assert.equal(tekstiRivina([]), "");
});

test("lukuaika: lyhyelle tekstille ei arviota", () => {
  assert.equal(lukuaika(null), null);
  assert.equal(lukuaika([kappale(sanoja(149))]), null);
});

test("lukuaika: 180 sanaa minuutissa, pyöristys lähimpään", () => {
  assert.equal(lukuaika([kappale(sanoja(150))]), 1);
  assert.equal(lukuaika([kappale(sanoja(360))]), 2);
  assert.equal(lukuaika([kappale(sanoja(500)), kuva, kappale(sanoja(400))]), 5);
});

test("ingressi: sopivan mittainen tavallinen kappale", () => {
  assert.equal(ensimmainenKappaleIngressiksi([kappale("x".repeat(60)), kappale("toka")]), true);
  assert.equal(ensimmainenKappaleIngressiksi([kappale("x".repeat(320))]), true);
});

test("ingressi: ei liian lyhyelle, liian pitkälle, otsikolle, kuvalle tai listalle", () => {
  assert.equal(ensimmainenKappaleIngressiksi([kappale("Kuvat: Klubi")]), false);
  assert.equal(ensimmainenKappaleIngressiksi([kappale("x".repeat(321))]), false);
  assert.equal(ensimmainenKappaleIngressiksi([kappale("x".repeat(100), "h2")]), false);
  assert.equal(ensimmainenKappaleIngressiksi([kuva, kappale("x".repeat(100))]), false);
  assert.equal(ensimmainenKappaleIngressiksi([{ ...kappale("x".repeat(100)), listItem: "bullet" }]), false);
  assert.equal(ensimmainenKappaleIngressiksi(null), false);
});

test("tiivistelmä toistaa tekstin alun (katkaisu ja välilyönnit eivät haittaa)", () => {
  const runko = [kappale("Suomi voitti Albanian  kotikentällä 2–0 ja nousi lohkon kärkeen.")];
  assert.equal(tiivistelmaToistaaTekstin("Suomi voitti Albanian kotikentällä 2–0…", runko), true);
  assert.equal(tiivistelmaToistaaTekstin("Suomi voitti Albanian kotikentällä...", runko), true);
  assert.equal(tiivistelmaToistaaTekstin("Huuhkajat nousivat lohkon kärkeen.", runko), false);
  assert.equal(tiivistelmaToistaaTekstin("Suomi", runko), false, "alle 20 merkkiä ei vertailla");
  assert.equal(tiivistelmaToistaaTekstin(null, runko), false);
});

console.log(`\n${ok} testiä ok`);
