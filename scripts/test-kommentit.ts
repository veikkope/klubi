/**
 * Kommentti- ja veikkauslomakkeen validoinnin testit (docs/15 §4).
 *
 * Ajo: npm run test:kommentit
 *
 * Testaa puhtaan validointimoduulin ilman palvelinta ja Sanityä. Koko ketju
 * (lomake → Server Action → Sanity → sivu) on testattu HTTP:n yli ilman
 * JavaScriptiä; ks. docs/15 §8.
 */
import assert from "node:assert/strict";

import { kommentointiAuki, type Kommentointi } from "../app/(public)/uutiset/_kommentit/form-state";
import { jarjestysLomakkeelta, koodiTasmaa, siisti, validoi } from "../app/(public)/uutiset/_kommentit/validointi";

const joukkueet = ["HJK", "KuPS", "Ilves", "FC Lahti"];
const sarja: Kommentointi = { kaytossa: true, tyyppi: "sarjajarjestys", vaihtoehdot: joukkueet };
const voittaja: Kommentointi = { kaytossa: true, tyyppi: "voittajaveikkaus", sijoituksia: 3, maalikuningas: true };
const kommentti: Kommentointi = { kaytossa: true, tyyppi: "kommentti" };
const perus = { nimi: "Ilpo", teksti: "", koodi: "x" };

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

test("sarjajärjestys: sijat → järjestys", () => {
  const r = validoi(sarja, { ...perus, kentat: { "sija-0": "4", "sija-1": "1", "sija-2": "2", "sija-3": "3" } });
  assert.deepEqual(r.fieldErrors, {});
  assert.deepEqual(r.jarjestys, ["KuPS", "Ilves", "FC Lahti", "HJK"]);
});

test("sarjajärjestys: sama sija kahdesti hylätään", () => {
  const r = validoi(sarja, { ...perus, kentat: { "sija-0": "1", "sija-1": "1", "sija-2": "2", "sija-3": "3" } });
  assert.match(r.fieldErrors.veikkaus ?? "", /sama sijoitus/);
  assert.deepEqual(r.jarjestys, []);
});

test("sarjajärjestys: puuttuva tai rajojen ulkopuolinen sija hylätään", () => {
  assert.ok(validoi(sarja, { ...perus, kentat: { "sija-0": "1", "sija-1": "2", "sija-2": "3" } }).fieldErrors.veikkaus);
  assert.ok(validoi(sarja, { ...perus, kentat: { "sija-0": "0", "sija-1": "2", "sija-2": "3", "sija-3": "5" } }).fieldErrors.veikkaus);
});

test("sarjajärjestys: virheen jälkeen jäsenen järjestys säilyy", () => {
  const k = { "sija-0": "2", "sija-1": "2", "sija-2": "1", "sija-3": "" };
  assert.deepEqual(jarjestysLomakkeelta(sarja, k), ["Ilves", "HJK", "KuPS", "FC Lahti"]);
});

test("voittajaveikkaus: kelvollinen, maalikuningas mukana", () => {
  const r = validoi(voittaja, { ...perus, kentat: { "paikka-1": "Ranska", "paikka-2": "Espanja", "paikka-3": "Saksa", maalikuningas: "Mbappé" } });
  assert.deepEqual(r.fieldErrors, {});
  assert.deepEqual(r.jarjestys, ["Ranska", "Espanja", "Saksa"]);
  assert.equal(r.maalikuningas, "Mbappé");
});

test("voittajaveikkaus: sama maa eri kirjainkoolla hylätään", () => {
  const r = validoi(voittaja, { ...perus, kentat: { "paikka-1": "Ranska", "paikka-2": "ranska", "paikka-3": "Saksa", maalikuningas: "X" } });
  assert.match(r.fieldErrors.veikkaus ?? "", /kahdesti/);
});

test("voittajaveikkaus: listasta valittu nimi tallennetaan listan kirjoitusasulla", () => {
  const lista: Kommentointi = { ...voittaja, maalikuningas: false, vaihtoehdot: ["Ranska", "Espanja", "Saksa", "Italia"] };
  const r = validoi(lista, { ...perus, kentat: { "paikka-1": "ranska", "paikka-2": "ESPANJA", "paikka-3": "Saksa" } });
  assert.deepEqual(r.jarjestys, ["Ranska", "Espanja", "Saksa"]);
  assert.ok(validoi(lista, { ...perus, kentat: { "paikka-1": "Brasilia", "paikka-2": "Espanja", "paikka-3": "Saksa" } }).fieldErrors.veikkaus);
});

test("kommentti: teksti pakollinen, veikkauksessa vapaaehtoinen", () => {
  assert.ok(validoi(kommentti, { ...perus, kentat: {} }).fieldErrors.teksti);
  assert.equal(validoi(kommentti, { ...perus, teksti: "Hyvä peli!", kentat: {} }).fieldErrors.teksti, undefined);
});

test("nimi 2–40 merkkiä, koodi pakollinen", () => {
  assert.ok(validoi(kommentti, { ...perus, nimi: "I", teksti: "ok ok", kentat: {} }).fieldErrors.nimi);
  assert.ok(validoi(kommentti, { ...perus, nimi: "x".repeat(41), teksti: "ok ok", kentat: {} }).fieldErrors.nimi);
  assert.ok(validoi(kommentti, { ...perus, koodi: "", teksti: "ok ok", kentat: {} }).fieldErrors.koodi);
});

test("koodisana: kirjainkoko ja reunavälit ohitetaan", () => {
  assert.ok(koodiTasmaa("  PALLO ", "pallo"));
  assert.ok(koodiTasmaa("Äijä", "äijä"));
  assert.ok(!koodiTasmaa("pallo2", "pallo"));
});

test("siisti: ohjausmerkit ja tuplavälit pois, rivinvaihdot säilyvät", () => {
  assert.equal(siisti("  a​  b\n c\u0007 "), "a b\n c");
});

test("sulkeutuminen", () => {
  assert.ok(kommentointiAuki({ kaytossa: true }));
  assert.ok(!kommentointiAuki({ kaytossa: false }));
  assert.ok(!kommentointiAuki({ kaytossa: true, sulkeutuu: "2020-01-01T00:00:00Z" }));
  assert.ok(kommentointiAuki({ kaytossa: true, sulkeutuu: "2999-01-01T00:00:00Z" }));
});

console.log(`\n${ok} testiä ok`);
