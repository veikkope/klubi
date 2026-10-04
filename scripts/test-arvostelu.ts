/**
 * Ravintola-arvostelun vaiheiden ja luonnoksen sääntöjen testit.
 *
 * Ajo: npm run test:arvostelu
 *
 * Testaa puhtaan sääntömoduulin (app/(sovellus)/ravintolat/arvostele/vaiheet.ts)
 * ilman selainta: mitkä vaiheet näytetään, milloin eteenpäin pääsee, mihin
 * palvelimen virhe vie ja miten laitteelle tallennettu luonnos ja muistettu
 * arvostelija luetaan (myös rikkinäisinä ja vanhentuneina).
 */
import assert from "node:assert/strict";

import {
  LUONNOS_IKA_MS,
  lueArvostelija,
  lueLuonnos,
  luonnoksenArvot,
  luonnosLomakkeesta,
  luonnosTyhja,
  naytettavat,
  parseScore,
  sallittuVaihe,
  vaiheValmis,
  virheenVaihe,
  type Edistyminen,
} from "../app/(sovellus)/ravintolat/arvostele/vaiheet";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const tyhja: Edistyminen = {
  arvostelija: null,
  ravintola: null,
  arvosanat: { ruoka: null, hinta: null, viihtyvyys: null },
};
const valmis: Edistyminen = {
  arvostelija: { klubilainen: "k1", nimi: "Pekka" },
  ravintola: "valittu",
  arvosanat: { ruoka: 4, hinta: 3.5, viihtyvyys: 4.2 },
};
const nyt = Date.UTC(2026, 9, 4, 12);
const idt = new Set(["r1", "r2"]);

test("vaiheet: nimi kysytään vain, kun sitä ei muisteta", () => {
  assert.deepEqual(naytettavat(true), ["kuka", "ravintola", "arvosanat", "lisaa"]);
  assert.deepEqual(naytettavat(false), ["ravintola", "arvosanat", "lisaa"]);
});

test("valmius: nimi vähintään 2 merkkiä, ravintola valittu tai uusi, kaikki kolme arvosanaa", () => {
  assert.equal(vaiheValmis("kuka", tyhja), false);
  assert.equal(vaiheValmis("kuka", { ...tyhja, arvostelija: { klubilainen: "", nimi: " A " } }), false);
  assert.equal(vaiheValmis("kuka", { ...tyhja, arvostelija: { klubilainen: "", nimi: "Ari" } }), true);
  assert.equal(vaiheValmis("ravintola", { ...tyhja, ravintola: "uusi" }), true);
  assert.equal(vaiheValmis("arvosanat", { ...tyhja, arvosanat: { ruoka: 4, hinta: 3, viihtyvyys: null } }), false);
  assert.equal(vaiheValmis("arvosanat", valmis), true);
  assert.equal(vaiheValmis("lisaa", tyhja), true);
});

test("rajaus: eteenpäin ei pääse keskeneräisen vaiheen yli", () => {
  const v = naytettavat(false);
  assert.equal(sallittuVaihe("lisaa", v, tyhja), "ravintola");
  assert.equal(sallittuVaihe("lisaa", v, { ...tyhja, ravintola: "valittu" }), "arvosanat");
  assert.equal(sallittuVaihe("lisaa", v, valmis), "lisaa");
  // Taaksepäin pääsee aina.
  assert.equal(sallittuVaihe("ravintola", v, valmis), "ravintola");
  // Vaihe, jota ei näytetä, vie ensimmäiseen.
  assert.equal(sallittuVaihe("kuka", v, valmis), "ravintola");
});

test("palvelimen virhe vie ensimmäiseen virheelliseen vaiheeseen", () => {
  const v = naytettavat(true);
  assert.equal(virheenVaihe({ kommentti: "x", hinta: "y" }, v), "arvosanat");
  assert.equal(virheenVaihe({ uusiKaupunki: "x" }, v), "ravintola");
  assert.equal(virheenVaihe({ nimi: "x" }, v), "kuka");
  // Nimeä ei kysytä: ei vaihetta (yhteenveto näyttää virheen).
  assert.equal(virheenVaihe({ nimi: "x" }, naytettavat(false)), null);
  assert.equal(virheenVaihe({}, v), null);
});

test("arvosana: pilkku tai piste, yksi desimaali, rajat 1–5", () => {
  assert.equal(parseScore("3,25"), 3.3);
  assert.equal(parseScore("4.0"), 4);
  assert.equal(parseScore("0,9"), null);
  assert.equal(parseScore("5,1"), null);
  assert.equal(parseScore(""), null);
  assert.equal(parseScore("abc"), null);
});

test("luonnos: lomakkeelta ja takaisin", () => {
  const data = new FormData();
  data.set("ravintola", "r1");
  data.set("ruoka", "4,0");
  data.set("kommentti", "Hyvä keitto");
  data.set("nimi", "Pekka"); // ei luonnokseen: muistetaan erikseen
  data.set("kuvat", "x"); // ei luonnokseen
  const l = luonnosLomakkeesta(data, "arvosanat", nyt);
  assert.deepEqual(l.arvot, { ravintola: "r1", ruoka: "4,0", kommentti: "Hyvä keitto" });
  const luettu = lueLuonnos(JSON.stringify(l), idt, nyt + 1000);
  assert.ok(luettu);
  assert.equal(luettu.vaihe, "arvosanat");
  assert.equal(luonnoksenArvot(luettu).ruoka, "4,0");
  assert.equal(luonnoksenArvot(luettu).uusiMaa, "Suomi");
});

test("luonnos: tyhjä, rikkinäinen, vanha tai tuntematon hylätään", () => {
  assert.equal(luonnosTyhja({ kayntipaiva: "2026-10-04", uusiMaa: "Suomi" }), true);
  assert.equal(lueLuonnos(null, idt, nyt), null);
  assert.equal(lueLuonnos("{rikki", idt, nyt), null);
  assert.equal(lueLuonnos(JSON.stringify({ versio: 2, tallennettu: nyt, arvot: { ruoka: "4" } }), idt, nyt), null);
  const vanha = { versio: 1, tallennettu: nyt - LUONNOS_IKA_MS - 1, vaihe: "lisaa", arvot: { ruoka: "4" } };
  assert.equal(lueLuonnos(JSON.stringify(vanha), idt, nyt), null);
});

test("luonnos: poistettu ravintola pois, vieras vaihe ja kenttä siivotaan", () => {
  const l = { versio: 1, tallennettu: nyt, vaihe: "hakkerointi", arvot: { ravintola: "poistettu", hinta: "3", _id: "x" } };
  const luettu = lueLuonnos(JSON.stringify(l), idt, nyt);
  assert.ok(luettu);
  assert.equal(luettu.arvot.ravintola, undefined);
  assert.equal(luettu.vaihe, "ravintola");
  assert.deepEqual(Object.keys(luettu.arvot), ["hinta"]);
  // Pelkkä poistettu ravintola: ei mitään säilytettävää.
  const vainRavintola = { versio: 1, tallennettu: nyt, vaihe: "arvosanat", arvot: { ravintola: "poistettu" } };
  assert.equal(lueLuonnos(JSON.stringify(vainRavintola), idt, nyt), null);
});

test("muistettu arvostelija: klubilaisen nimi Studiosta, poistettu unohdetaan", () => {
  const klubilaiset = [{ _id: "k1", nimi: "Pekka Virtanen" }];
  assert.deepEqual(lueArvostelija(JSON.stringify({ klubilainen: "k1", nimi: "Pekka" }), klubilaiset), {
    klubilainen: "k1",
    nimi: "Pekka Virtanen",
  });
  assert.equal(lueArvostelija(JSON.stringify({ klubilainen: "k9", nimi: "Joku" }), klubilaiset), null);
  assert.deepEqual(lueArvostelija(JSON.stringify({ klubilainen: "", nimi: "  Vieras  " }), klubilaiset), {
    klubilainen: "",
    nimi: "Vieras",
  });
  assert.equal(lueArvostelija(JSON.stringify({ klubilainen: "", nimi: "A" }), klubilaiset), null);
  assert.equal(lueArvostelija("null", klubilaiset), null);
  assert.equal(lueArvostelija("rikki", klubilaiset), null);
});

console.log(`\n${ok} testiä läpi.`);
