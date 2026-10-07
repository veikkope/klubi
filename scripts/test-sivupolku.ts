/**
 * Sivun polkusääntöjen testit (lib/sivupolku.ts).
 *
 * Tarkistaa myös, että jokainen app-kansion reitti on varattu: uusi koodireitti
 * ei saa jäädä listalta pois, muuten saman polun sivu ei näkyisi koskaan.
 *
 * Ajo: npm run test:sivupolku
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { KOODIIN_SIDOTUT_SIVUT } from "../lib/path";
import { VARATUT_KLUBIN_POLUT, VARATUT_YLATASON_POLUT, tarkistaSivunPolku } from "../lib/sivupolku";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const kelpaa = (slug: string) => tarkistaSivunPolku(slug) === true;

test("vapaat polut kelpaavat", () => {
  for (const slug of ["saannot", "english", "toriparkki", "klubi/historia", "klubi/historia/1990-luku"]) {
    assert.equal(kelpaa(slug), true, slug);
  }
});

test("lukitut sivut ja palloveikkauksen alasivut kelpaavat", () => {
  for (const slug of KOODIIN_SIDOTUT_SIVUT) assert.equal(kelpaa(slug), true, slug);
  assert.equal(kelpaa("tietosuoja"), true);
  assert.equal(kelpaa("klubi/palloveikkaus/veikkausliiga"), true);
  assert.equal(kelpaa("klubi/palloveikkaus/a/b"), false, "liian syvä");
});

test("koodin reitit on varattu koko polulta", () => {
  for (const slug of [
    "uutiset",
    "uutiset/oma",
    "ottelut",
    "blogspot",
    "jalkapalloarkisto/historia",
    "klubi/yhteystiedot",
    "klubi/toiminta/matkailu",
    "klubi/hallitus/2026",
  ]) {
    assert.equal(kelpaa(slug), false, slug);
  }
  assert.match(String(tarkistaSivunPolku("ottelut")), /sivuston oma osio/);
});

test("muoto", () => {
  assert.equal(kelpaa(""), false);
  assert.equal(kelpaa("Isot-Kirjaimet"), false);
  assert.equal(kelpaa("kaksi--viivaa"), false);
  assert.equal(kelpaa("a/b/c/d/e"), false, "yli 4 tasoa");
  assert.equal(kelpaa("x".repeat(97)), false);
});

/** Onko kansiossa (tai sen alla) sivu tai reitti, eli onko se osoite. */
function onReitti(kansio: string): boolean {
  for (const nimi of readdirSync(kansio)) {
    const polku = join(kansio, nimi);
    if (statSync(polku).isDirectory() ? onReitti(polku) : /^(page|route)\.tsx?$/.test(nimi)) return true;
  }
  return false;
}

/** Staattiset reittikansiot: ryhmät (x) avataan, _yksityiset ja [dynaamiset] ohitetaan. */
function reittikansiot(kansio: string): string[] {
  const tulos: string[] = [];
  for (const nimi of readdirSync(kansio)) {
    const polku = join(kansio, nimi);
    if (!statSync(polku).isDirectory() || nimi.startsWith("_") || nimi.startsWith("[")) continue;
    if (/^\(.+\)$/.test(nimi)) tulos.push(...reittikansiot(polku));
    else if (onReitti(polku)) tulos.push(nimi);
  }
  return tulos;
}

test("jokainen app-kansion reitti on varattu", () => {
  const app = join(process.cwd(), "app");
  for (const nimi of reittikansiot(app)) {
    // Pisteelliset (llms.txt) eivät kelpaa polun osaksi muutenkaan.
    if (nimi.includes(".")) continue;
    if (nimi === "klubi") continue;
    assert.ok(VARATUT_YLATASON_POLUT.has(nimi), `app/${nimi}: lisää VARATUT_YLATASON_POLUT-listaan (lib/sivupolku.ts)`);
  }
  const klubi = join(app, "(public)", "klubi");
  assert.ok(existsSync(klubi));
  for (const nimi of reittikansiot(klubi)) {
    assert.ok(VARATUT_KLUBIN_POLUT.has(`klubi/${nimi}`), `klubi/${nimi}: lisää VARATUT_KLUBIN_POLUT-listaan`);
  }
});

console.log(`\n${ok} testiä ok`);
