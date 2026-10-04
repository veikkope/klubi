/**
 * Paluuosoitteen testit (lib/paluuosoite.ts): avoimen uudelleenohjauksen esto.
 *
 * Ajo: npm run test:paluuosoite
 */
import assert from "node:assert/strict";

import { omaPaluuosoite } from "../lib/paluuosoite";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const PYYNTO = "https://www.lahdensuomalainenklubi.com/api/draft-mode/disable";
const paluu = (arvo: string | null) => omaPaluuosoite(arvo, PYYNTO).href;
const ETUSIVU = "https://www.lahdensuomalainenklubi.com/";

test("oma polku säilyy hakuineen ja ankkureineen", () => {
  assert.equal(
    paluu("/uutiset/otsikko?sivu=2#kommentit"),
    "https://www.lahdensuomalainenklubi.com/uutiset/otsikko?sivu=2#kommentit",
  );
});

test("puuttuva tai tyhjä paluu → etusivu", () => {
  assert.equal(paluu(null), ETUSIVU);
  assert.equal(paluu(""), ETUSIVU);
});

test("absoluuttinen tai protokollaton vieras osoite → etusivu", () => {
  for (const arvo of [
    "https://example.com/",
    "//example.com",
    "/\\example.com",
    "\\\\example.com",
    "javascript:alert(1)",
  ]) {
    assert.equal(paluu(arvo), ETUSIVU, arvo);
  }
});

test("sarkain, rivinvaihto ja rivinalku polussa eivät ohita tarkistusta", () => {
  for (const arvo of ["/\t/example.com", "/\n/example.com", "/\r/example.com", "/\t\\example.com"]) {
    assert.equal(paluu(arvo), ETUSIVU, JSON.stringify(arvo));
  }
});

test("käyttäjätietoja ei voi ujuttaa osoitteeseen", () => {
  assert.equal(new URL(paluu("/@example.com")).host, "www.lahdensuomalainenklubi.com");
});

console.log(`\n${ok} testiä OK`);
