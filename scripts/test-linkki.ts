/**
 * Studion linkkikenttien tarkistuksen testit (lib/linkki.ts): "www."-alkuiset
 * ja kauttaviivattomat osoitteet päätyisivät sivulla 404:ään.
 *
 * Ajo: npm run test:linkki
 */
import assert from "node:assert/strict";

import { sisainenPolku, tarkistaLinkki } from "../lib/linkki";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const virhe = (href: string, ...skeemat: Parameters<typeof tarkistaLinkki>[1][]) => {
  const tulos = tarkistaLinkki(href, ...skeemat);
  assert.equal(typeof tulos, "string", `${href} piti hylätä`);
  return tulos as string;
};

test("tyhjä arvo kelpaa (pakollisuus on kentän oma sääntö)", () => {
  assert.equal(tarkistaLinkki(""), true);
  assert.equal(tarkistaLinkki(null), true);
  assert.equal(tarkistaLinkki(undefined), true);
});

test("sivuston oma polku, täysi osoite, sähköposti ja puhelin kelpaavat", () => {
  for (const href of [
    "/",
    "/uutiset",
    "/klubi/hallitus#jasenet",
    "/uutiset?sivu=2",
    "https://www.palloliitto.fi",
    "http://example.com/polku",
    "HTTPS://WWW.PALLOLIITTO.FI",
    "mailto:sihteeri@example.com",
    "tel:+358401234567",
  ]) {
    assert.equal(tarkistaLinkki(href), true, href);
  }
});

test('"www."-alku hylätään ja ohje ehdottaa https://-alkua', () => {
  assert.equal(virhe("www.palloliitto.fi"), 'Lisää alkuun "https://", esim. https://www.palloliitto.fi');
  assert.match(virhe("WWW.Palloliitto.fi"), /https:\/\/WWW\.Palloliitto\.fi/);
});

test("polku ilman alun kauttaviivaa hylätään", () => {
  assert.match(virhe("uutiset"), /alkaa "\/"/);
  assert.match(virhe("palloliitto.fi"), /alkaa "\/"/);
  assert.match(virhe("../uutiset"), /alkaa "\/"/);
});

test("protokollaton ja vaarallinen osoite hylätään", () => {
  assert.match(virhe("//example.com"), /yhdellä "\/"/);
  assert.match(virhe("javascript:alert(1)"), /alkaa "\/"/);
  assert.match(virhe("ftp://example.com"), /alkaa "\/"/);
});

test("rikkinäinen https-alku hylätään", () => {
  assert.match(virhe("https:palloliitto.fi"), /https:\/\//);
  assert.match(virhe("https:/palloliitto.fi"), /https:\/\//);
  assert.match(virhe("https://"), /https:\/\//);
});

test("välilyönnit hylätään", () => {
  assert.match(virhe(" /uutiset"), /välilyönnit/);
  assert.match(virhe("/uutiset "), /välilyönnit/);
  assert.match(virhe("/klubin uutiset"), /välilyöntejä/);
});

test("rajattu skeemalista: mailto ja tel eivät kelpaa, ohje ei mainitse niitä", () => {
  const vain = ["http", "https"] as const;
  assert.equal(tarkistaLinkki("https://example.com", vain), true);
  assert.equal(tarkistaLinkki("/uutiset/2019-03-10-milano", vain), true);
  const ohje = virhe("mailto:sihteeri@example.com", vain);
  assert.doesNotMatch(ohje, /mailto/);
  assert.match(virhe("www.example.com", vain), /https:\/\/www\.example\.com/);
});

test("täysi ohje mainitsee kaikki sallitut muodot", () => {
  assert.equal(
    virhe("uutiset"),
    'Sivuston oma sivu alkaa "/" (esim. /uutiset), ulkoinen osoite "https://", sähköposti "mailto:" ja puhelinnumero "tel:".',
  );
});

test("sisäisen linkin polku kohteen tarkistukseen", () => {
  assert.equal(sisainenPolku("/uutiset"), "/uutiset");
  assert.equal(sisainenPolku("/klubi/hallitus#jasenet"), "/klubi/hallitus", "ankkuri pois");
  assert.equal(sisainenPolku("/ravintolat?kaupunki=lahti"), "/ravintolat", "kysely pois");
  assert.equal(sisainenPolku("/tapahtumat/"), "/tapahtumat", "loppukauttaviiva pois");
  assert.equal(sisainenPolku("/"), "/");
  assert.equal(sisainenPolku("https://example.com/uutiset"), null, "ulkoinen");
  assert.equal(sisainenPolku("//example.com"), null);
  assert.equal(sisainenPolku("mailto:a@b.fi"), null);
  assert.equal(sisainenPolku(""), null);
});

console.log(`\n${ok} testiä läpi.`);
