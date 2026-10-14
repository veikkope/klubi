/**
 * Sanityn kiintiön suojaukset (docs/decisions/001-sanity-kiintio.md):
 * kiintiövirheen tunnistus (sanity/lib/kiintio.ts) ja robots.txt:n rajaukset,
 * jotka pitävät botit poissa loputtomista suodatin- ja hakuyhdistelmistä
 * päästäen ne silti sisältöön (app/robots.ts).
 *
 * Ajo: npm run test:kiintio
 */
import assert from "node:assert/strict";

import robots from "../app/robots";
import { onKiintioTaynna } from "../sanity/lib/kiintio";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

test("402 tunnistetaan kiintiöksi kaikissa Sanity-clientin muodoissa", () => {
  assert.equal(onKiintioTaynna({ statusCode: 402 }), true);
  assert.equal(onKiintioTaynna({ response: { statusCode: 402 } }), true);
  assert.equal(onKiintioTaynna({ response: { body: { error: "plan_limit_reached" } } }), true);
});

test("muut virheet eivät ole kiintiövirheitä", () => {
  assert.equal(onKiintioTaynna({ statusCode: 429 }), false);
  assert.equal(onKiintioTaynna({ statusCode: 500 }), false);
  assert.equal(onKiintioTaynna(new Error("verkko")), false);
  assert.equal(onKiintioTaynna(null), false);
  assert.equal(onKiintioTaynna("402"), false);
});

/**
 * Googlen tulkinta: pisin osuva sääntö voittaa, tasatilanteessa Allow.
 * `*` vastaa mitä tahansa merkkijonoa, `$` rivin loppua.
 */
function sallittu(polku: string, allow: string[], disallow: string[]): boolean {
  const osuu = (saanto: string) => {
    const lauseke = saanto
      .replace(/[.+?^{}()|[\]\\]/g, "\\$&")
      .replace(/\*/g, ".*");
    return new RegExp(`^${lauseke}`).test(polku);
  };
  const pisin = (saannot: string[]) => Math.max(-1, ...saannot.filter(osuu).map((s) => s.length));
  return pisin(allow) >= pisin(disallow);
}

const saannot = robots().rules;
const kaikki = (Array.isArray(saannot) ? saannot : [saannot]).find((r) => r.userAgent === "*");
assert.ok(kaikki, "robots.txt:stä puuttuu User-agent: *");
const lista = (arvo: string | string[] | undefined) => (arvo === undefined ? [] : Array.isArray(arvo) ? arvo : [arvo]);
const onSallittu = (polku: string) => sallittu(polku, lista(kaikki.allow), lista(kaikki.disallow));

test("sisältö ja listat ovat boteille auki", () => {
  for (const polku of [
    "/",
    "/ravintolat",
    "/ravintolat/ravintola-x",
    "/ravintolat/odottavat",
    "/uutiset",
    "/uutiset?kategoria=klubi",
    "/uutiset?kategoria=klubi&sivu=3",
    "/uutiset/otsikko",
    "/uutiset/tunniste/huuhkajat?sivu=2",
    "/jalkapalloarkisto/huuhkajat",
    "/api/og?video=abc",
  ]) {
    assert.equal(onSallittu(polku), true, `pitäisi olla sallittu: ${polku}`);
  }
});

test("rajaus- ja hakuyhdistelmät sekä hallinta on estetty", () => {
  for (const polku of [
    "/ravintolat?kaupunki=lahti",
    "/ravintolat?maakunta=paijat-hame&maakunta=uusimaa&sivu=4",
    "/ravintolat/odottavat?kaupunki=lahti&q=pizza",
    "/uutiset?q=litmanen",
    "/uutiset?kategoria=klubi&q=litmanen",
    "/studio",
    "/api/revalidate",
  ]) {
    assert.equal(onSallittu(polku), false, `pitäisi olla estetty: ${polku}`);
  }
});

test("tekoälycrawlereilla on samat rajaukset", () => {
  for (const r of Array.isArray(saannot) ? saannot : [saannot]) {
    assert.deepEqual(lista(r.disallow), lista(kaikki.disallow), `${String(r.userAgent)}: eri rajaukset`);
  }
});

console.log(`\n${ok} testiä ok`);
