/**
 * Tyhjien osioiden piilotuksen testit (lib/osiot.ts).
 *
 * Ajo: npm run test:osiot
 */
import assert from "node:assert/strict";

import { onTyhjassaOsiossa, piilotaTyhjat, tyhjatOsiot } from "../lib/osiot";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

test("tyhjä osio = määrä 0, puuttuva määrä ei piilota", () => {
  assert.deepEqual([...tyhjatOsiot({ "/tapahtumat": 0, "/galleria": 3 })], ["/tapahtumat"]);
  assert.deepEqual([...tyhjatOsiot({})], [], "haku epäonnistui: näytetään kaikki");
  assert.deepEqual([...tyhjatOsiot({ "/tapahtumat": null, "/galleria": 0 })], ["/galleria"]);
});

test("linkki tyhjään osioon", () => {
  const tyhjat = new Set(["/tapahtumat"]);
  assert.equal(onTyhjassaOsiossa("/tapahtumat", tyhjat), true);
  assert.equal(onTyhjassaOsiossa("/tapahtumat/", tyhjat), true, "loppukauttaviiva");
  assert.equal(onTyhjassaOsiossa("/tapahtumat/kevatretki", tyhjat), true, "alasivu");
  assert.equal(onTyhjassaOsiossa("/tapahtumat?vuosi=2026", tyhjat), true, "kysely");
  assert.equal(onTyhjassaOsiossa("/tapahtumat#tulevat", tyhjat), true, "ankkuri");
  assert.equal(onTyhjassaOsiossa("/tapahtumatiedote", tyhjat), false, "eri polku samalla alulla");
  assert.equal(onTyhjassaOsiossa("https://example.com/tapahtumat", tyhjat), false, "ulkoinen");
  assert.equal(onTyhjassaOsiossa(null, tyhjat), false);
  assert.equal(onTyhjassaOsiossa("/tapahtumat", new Set()), false, "ei tyhjiä");
});

test("valikon suodatus alavalikkoineen", () => {
  const valikko = [
    { label: "Uutiset", href: "/uutiset" },
    { label: "Tapahtumat", href: "/tapahtumat" },
    {
      label: "Klubi",
      href: "/klubi",
      children: [
        { label: "Esittely", href: "/klubi" },
        { label: "Kuvagalleria", href: "/galleria" },
      ],
    },
  ];
  const tulos = piilotaTyhjat(valikko, new Set(["/tapahtumat", "/galleria"]));
  assert.deepEqual(
    tulos.map((l) => l.label),
    ["Uutiset", "Klubi"],
  );
  assert.deepEqual(tulos[1].children?.map((l) => l.label), ["Esittely"]);
  assert.equal(piilotaTyhjat(valikko, new Set()), valikko, "ei tyhjiä: sama taulukko");
});

console.log(`\n${ok} testiä ok`);
