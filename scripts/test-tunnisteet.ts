/**
 * Uutisten tunnisteiden testit (lib/tunnisteet.ts).
 *
 * Ajo: npm run test:tunnisteet
 */
import assert from "node:assert/strict";

import {
  bloginTunniste,
  kokoaTunnisteet,
  liittyvatTunnisteet,
  ryhmitaAlkukirjaimittain,
  siistiTunnisteLista,
  suosituimmat,
  tarkistaTunnisteet,
  TUNNISTEITA_MAX,
  tunnisteHref,
  tunnisteSlug,
} from "../lib/tunnisteet";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

test("slug: ääkköset, välimerkit ja kirjainkoko", () => {
  assert.equal(tunnisteSlug("Valko-Venäjä"), "valko-venaja");
  assert.equal(tunnisteSlug("  Osteria  Dei Gusti "), "osteria-dei-gusti");
  assert.equal(tunnisteSlug("Stefan's Steakhouse"), "stefan-s-steakhouse");
  assert.equal(tunnisteSlug("2H+K"), "2h-k");
  assert.equal(tunnisteSlug("HUUHKAJAT"), tunnisteSlug("huuhkajat"));
  assert.equal(tunnisteSlug("+++"), "");
  assert.equal(tunnisteHref("Valko-Venäjä"), "/uutiset/tunniste/valko-venaja");
  assert.equal(tunnisteHref("!!"), null, "osoitteeton tunniste ei ole linkki");
});

test("blogin tunnistesivun polku", () => {
  assert.equal(bloginTunniste("/search/label/Valko-Ven%C3%A4j%C3%A4"), "Valko-Venäjä");
  assert.equal(bloginTunniste("/search/label/Lahden%20Suomalainen%20Klubi%20ry"), "Lahden Suomalainen Klubi ry");
  assert.equal(bloginTunniste("/search/label/Huuhkajat/"), "Huuhkajat");
  assert.equal(bloginTunniste("/search/label/Canal%2B"), "Canal+");
  assert.equal(bloginTunniste("/search/label/2H+K"), "2H+K", "+ on kirjaimellinen");
  assert.equal(bloginTunniste("/search/label/100%"), null, "rikkinäinen koodaus");
  assert.equal(bloginTunniste("/search"), null);
  assert.equal(bloginTunniste("/2019/03/milano.html"), null);
  assert.equal(bloginTunniste("/search/label/"), null);
});

test("lista tallennettavaksi: siistitty, toistot ja tyhjät pois", () => {
  assert.deepEqual(siistiTunnisteLista([" Huuhkajat ", "huuhkajat", "", "+++", "Lahti", 5]), ["Huuhkajat", "Lahti"]);
  assert.deepEqual(siistiTunnisteLista(null), []);
});

test("kokoaminen: saman slugin muodot yhdeksi, yleisin nimeksi", () => {
  const t = kokoaTunnisteet([
    ["Huuhkajat", "Lahti"],
    ["huuhkajat"],
    ["Huuhkajat", "Huuhkajat"],
    null,
    ["Ö-tunniste", "Ärrä"],
  ]);
  const h = t.find((x) => x.slug === "huuhkajat")!;
  assert.equal(h.nimi, "Huuhkajat");
  assert.deepEqual(h.nimet, ["Huuhkajat", "huuhkajat"]);
  assert.equal(h.maara, 3, "sama tunniste samassa uutisessa kerran");
  assert.deepEqual(
    t.map((x) => x.nimi),
    ["Huuhkajat", "Lahti", "Ärrä", "Ö-tunniste"],
    "suomalainen aakkosjärjestys",
  );
});

test("kokoaminen: tasapelissä isolla alkava muoto", () => {
  const [t] = kokoaTunnisteet([["ruokailu"], ["Ruokailu"]]);
  assert.equal(t.nimi, "Ruokailu");
});

test("suosituimmat ja ryhmittely", () => {
  const t = kokoaTunnisteet([["B", "a"], ["B"], ["2026"], ["Äänekoski"]]);
  assert.deepEqual(suosituimmat(t, 2).map((x) => x.nimi), ["B", "2026"]);
  assert.deepEqual(
    ryhmitaAlkukirjaimittain(t).map((r) => r.kirjain),
    ["0–9", "A", "B", "Ä"],
  );
});

test("liittyvät tunnisteet", () => {
  const listat = [
    ["Huuhkajat", "Olympiastadion", "Helsinki"],
    ["Huuhkajat", "Olympiastadion"],
    ["Huuhkajat", "Teemu Pukki"],
    ["Huuhkajat", "Olympiastadion", "Teemu Pukki"],
    ["Lahti"],
  ];
  // Huuhkajilla 4 uutista → vähintään kaksi yhteistä: Helsinki (1) jää pois.
  assert.deepEqual(liittyvatTunnisteet(listat, "huuhkajat", 5).map((x) => x.nimi), ["Olympiastadion", "Teemu Pukki"]);
  assert.deepEqual(liittyvatTunnisteet(listat, "helsinki", 5).map((x) => x.nimi), ["Huuhkajat", "Olympiastadion"]);
  assert.deepEqual(liittyvatTunnisteet(listat, "lahti", 5), []);
  assert.deepEqual(liittyvatTunnisteet(listat, "ei-ole", 5), []);
});

test("kyselyn nimet sisältävät siistimättömät muodot", () => {
  const [t] = kokoaTunnisteet([["Lahti"], ["Lahti "]]);
  assert.equal(t.maara, 2);
  assert.deepEqual(t.nimet, ["Lahti", "Lahti "]);
});

test("Studion validointi", () => {
  assert.equal(tarkistaTunnisteet(undefined), true);
  assert.equal(tarkistaTunnisteet(["Huuhkajat", "Lahti"]), true);
  assert.match(String(tarkistaTunnisteet(["Huuhkajat", "huuhkajat"])), /ovat sama tunniste/);
  assert.match(String(tarkistaTunnisteet(["Lahti", "Lahti"])), /kahdesti/);
  assert.match(String(tarkistaTunnisteet(["  "])), /Tyhjä/);
  assert.match(String(tarkistaTunnisteet(["Lahti "])), /välilyöntejä/);
  assert.match(String(tarkistaTunnisteet(["???"])), /kirjaimia tai numeroita/);
  assert.match(String(tarkistaTunnisteet(["x".repeat(51)])), /liian pitkä/);
  assert.match(
    String(tarkistaTunnisteet(Array.from({ length: TUNNISTEITA_MAX + 1 }, (_, i) => `t${i}`))),
    /Enintään/,
  );
});

console.log(`\n${ok} testiä läpi.`);
