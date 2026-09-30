/**
 * Viikoittaisen varmuuskopion sääntöjen testit (lib/varmuuskopio.ts).
 *
 * Ajo: npm run test:varmuuskopio
 */
import assert from "node:assert/strict";

import { kopionPaiva, kuuluuKopioon, poistettavat, SAILYTETTAVAT, suodataVienti } from "../lib/varmuuskopio";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

test("vain julkaistu sisältö kuuluu kopioon", () => {
  assert.equal(kuuluuKopioon({ _id: "uutinen-1", _type: "uutinen" }), true);
  assert.equal(kuuluuKopioon({ _id: "image-abc-100x100-jpg", _type: "sanity.imageAsset" }), true);
  assert.equal(kuuluuKopioon({ _id: "drafts.uutinen-1", _type: "uutinen" }), false, "luonnos");
  assert.equal(kuuluuKopioon({ _id: "drafts.arvostelu-1", _type: "ravintolaKayttajaArvostelu" }), false, "hyväksymätön arvostelu");
  assert.equal(kuuluuKopioon({ _id: "versions.r1.uutinen-1", _type: "uutinen" }), false, "julkaisuversio");
  assert.equal(kuuluuKopioon({ _type: "uutinen" }), false, "ei id:tä");
});

test("varmuuskopiot eivät päädy seuraavaan kopioon", () => {
  assert.equal(kuuluuKopioon({ _id: "varmuuskopio-2026-10-05", _type: "varmuuskopio" }), false);
  assert.equal(
    kuuluuKopioon({ _id: "file-abc-gz", _type: "sanity.fileAsset", originalFilename: "varmuuskopio-2026-10-05.ndjson.gz" }),
    false,
  );
  assert.equal(
    kuuluuKopioon({ _id: "file-def-pdf", _type: "sanity.fileAsset", originalFilename: "saannot.pdf" }),
    true,
    "muut tiedostot kuuluvat",
  );
});

test("NDJSON-suodatus", () => {
  const ndjson = [
    JSON.stringify({ _id: "uutinen-1", _type: "uutinen", title: "A" }),
    JSON.stringify({ _id: "drafts.uutinen-1", _type: "uutinen", title: "A (luonnos)" }),
    "",
    JSON.stringify({ _id: "varmuuskopio-2026-10-05", _type: "varmuuskopio" }),
    JSON.stringify({ _id: "ravintola-2", _type: "ravintola" }),
    "",
  ].join("\n");
  const { rivit, maara } = suodataVienti(ndjson);
  assert.equal(maara, 2);
  assert.deepEqual(
    rivit.map((r) => JSON.parse(r)._id),
    ["uutinen-1", "ravintola-2"],
  );
});

test("päiväys Helsingin aikaa", () => {
  // Maanantai 01.00 UTC (ajastus) = 04.00 Helsingissä kesäaikaan.
  assert.equal(kopionPaiva(new Date("2026-10-05T01:00:00Z")), "2026-10-05");
  // Sunnuntai 22.30 UTC talviaikaan = maanantai 00.30 Helsingissä.
  assert.equal(kopionPaiva(new Date("2026-12-06T22:30:00Z")), "2026-12-07");
});

test("säilytetään 12 uusinta", () => {
  // 15 kopiota 1.–15.1., uusin ensin.
  const kopiot = Array.from({ length: 15 }, (_, i) => ({ paiva: `2026-01-${String(15 - i).padStart(2, "0")}` }));
  const pois = poistettavat(kopiot);
  assert.equal(SAILYTETTAVAT, 12);
  assert.deepEqual(
    pois.map((k) => k.paiva),
    ["2026-01-03", "2026-01-02", "2026-01-01"],
  );
  assert.deepEqual(poistettavat(kopiot.slice(0, 5)), [], "alle 12: ei poistoja");
  // Järjestys syötteessä ei vaikuta.
  assert.deepEqual(
    poistettavat([...kopiot].sort(() => 0.5 - Math.random())).map((k) => k.paiva).sort(),
    ["2026-01-01", "2026-01-02", "2026-01-03"],
  );
});

console.log(`\n${ok} testiä ok`);
