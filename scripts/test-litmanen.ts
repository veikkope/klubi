/**
 * Litmanen-osion apurien testit (lib/lehtileikkeet.ts, lib/loukkaantumiset.ts).
 *
 * Ajo: npm run test:litmanen
 */
import assert from "node:assert/strict";

import type { PortableTextBlock } from "@portabletext/react";

import { KOKONAAN_ALLE, leikkeenOte, OTTEEN_PITUUS, ryhmitteleVuosittain, vuosivali } from "../lib/lehtileikkeet";
import { loukkaantumisYhteenveto, vammaryhma } from "../lib/loukkaantumiset";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const kappale = (text: string, style = "normal") =>
  ({ _type: "block", _key: text, style, children: [{ _type: "span", text }] }) as PortableTextBlock;
const kuva = { _type: "imageWithAlt", _key: "k" } as unknown as PortableTextBlock;

test("ryhmitteleVuosittain: peräkkäiset saman vuoden jutut yhteen", () => {
  const r = ryhmitteleVuosittain([{ julkaistu: "2025-10-27" }, { julkaistu: "2025-01-01" }, { julkaistu: "2022-03-01" }]);
  assert.deepEqual(
    r.map((g) => [g.vuosi, g.leikkeet.length]),
    [
      ["2025", 2],
      ["2022", 1],
    ],
  );
});

const virke = (n: number) => `Tämä on testivirke numero ${n} jossa on muutama sana lisää.`;
const pitka = Array.from({ length: 20 }, (_, i) => virke(i)).join(" ");

test("leikkeenOte: lyhyt juttu näytetään kokonaan (null)", () => {
  assert.equal(leikkeenOte([kappale("Lyhyt juttu.")]), null);
  assert.equal(leikkeenOte(null), null);
  assert.ok(pitka.length >= KOKONAAN_ALLE);
});

test("leikkeenOte: pitkästä jutusta kokonaisia virkkeitä tavoitepituuteen asti", () => {
  const ote = leikkeenOte([kappale(pitka)]);
  assert.ok(ote);
  assert.ok(ote.length <= OTTEEN_PITUUS, ote);
  assert.ok(ote.endsWith("."), ote);
  assert.ok(pitka.startsWith(ote));
});

test("leikkeenOte: kappaleet ja kuvat yhdistetään, kuvat ohitetaan", () => {
  const ote = leikkeenOte([kuva, kappale(virke(1)), kappale(pitka)]);
  assert.ok(ote?.startsWith(virke(1)));
});

test("leikkeenOte: ilman virkerajaa katkaistaan sanan kohdalta", () => {
  const ote = leikkeenOte([kappale("sana ".repeat(300))]);
  assert.ok(ote?.endsWith("…"));
  assert.ok((ote?.length ?? 0) <= OTTEEN_PITUUS + 1);
});

test("vuosivali", () => {
  assert.equal(vuosivali("2009-05-10", "2025-10-27"), "2009–2025");
  assert.equal(vuosivali("2025-01-01", "2025-10-27"), "2025");
  assert.equal(vuosivali(null, null), null);
});

test("vammaryhma: ensimmäinen osuma ratkaisee", () => {
  assert.equal(vammaryhma("nilkka- ja akillesjännevamma"), "Akillesjänne");
  assert.equal(vammaryhma("takareisivamma"), "Reisi ja nivus");
  assert.equal(vammaryhma("korona"), "Sairaudet");
  assert.equal(vammaryhma("hiertymiä jaloissa"), "Muut");
});

const sarakkeet = [
  { key: "vuosi", label: "Vuosi" },
  { key: "kuukausi", label: "Ajankohta" },
  { key: "vamma", label: "Vamma" },
];
const rivi = (vuosi: string, vamma: string) => ({
  cells: [
    { key: "vuosi", value: vuosi },
    { key: "vamma", value: vamma },
  ],
});

test("loukkaantumisYhteenveto: määrät, vuodet ja tyhjät välivuodet", () => {
  const y = loukkaantumisYhteenveto(sarakkeet, [
    rivi("1995", "polvivamma"),
    rivi("1995", "nilkkavamma"),
    rivi("1997", "polvivamma"),
    rivi("x", "polvivamma"),
  ]);
  assert.ok(y);
  assert.equal(y.maara, 3);
  assert.deepEqual(y.vuosittain, [
    { vuosi: 1995, maara: 2 },
    { vuosi: 1996, maara: 0 },
    { vuosi: 1997, maara: 1 },
  ]);
  assert.deepEqual(y.pahimmatVuodet, [1995]);
  assert.deepEqual(y.ryhmittain[0], { nimi: "Polvi", maara: 2 });
});

test("loukkaantumisYhteenveto: Muut aina viimeisenä", () => {
  const y = loukkaantumisYhteenveto(sarakkeet, [
    rivi("2000", "pikkuvaivoja"),
    rivi("2000", "pikkuvaivoja"),
    rivi("2001", "polvivamma"),
  ]);
  assert.equal(y?.ryhmittain.at(-1)?.nimi, "Muut");
});

test("loukkaantumisYhteenveto: ilman vuosi- tai vammasaraketta null", () => {
  assert.equal(loukkaantumisYhteenveto([{ key: "a", label: "A" }], [rivi("2000", "x")]), null);
});

console.log(`\n${ok} testiä läpi.`);
