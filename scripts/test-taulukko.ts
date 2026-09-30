/**
 * Taulukkoeditorin sääntöjen testit (docs/19).
 *
 * Ajo: npm run test:taulukko
 *
 * Testaa puhtaan moduulin lib/taulukko.ts: päivämäärien ja lukujen muunnokset
 * suuntaan ja toiseen, Excel-liitoksen jäsennyksen, sarakeavaimet ja
 * tyyppien arvauksen. Lopuksi editorin patchit (sanity/components/
 * taulukkoeditori/patchit.ts) ajetaan Sanityn omalla mutaatiomoottorilla,
 * joten ne testataan samalla tavalla kuin Content Lake ne soveltaa.
 */
import assert from "node:assert/strict";

import { Mutation } from "@sanity/mutator";
import { toMutationPatches, type FormPatch } from "sanity";

import {
  arvaaTyyppi,
  formatPaivays,
  jasennaRuudukko,
  naytettavaArvo,
  normalisoiArvo,
  onRuudukko,
  parsePaivays,
  ruudukkoTekstiksi,
  sarakeavain,
  tunnistaErotin,
  tyyppivaroitus,
} from "../lib/taulukko";
import {
  asetaSolu,
  korvaaTaulukko,
  lisaaRivit,
  lisaaSarake,
  muokkaaSaraketta,
  poistaRivi,
  poistaSarake,
  siirraRivi,
  siirraSaraketta,
  soluArvo,
  uusiRivi,
  type Rivi,
  type Sarake,
} from "../sanity/components/taulukkoeditori/patchit";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

test("päivämäärä suomalaisittain → ISO", () => {
  assert.equal(parsePaivays("26.9.2026"), "2026-09-26");
  assert.equal(parsePaivays("26.09.2026"), "2026-09-26");
  assert.equal(parsePaivays(" 1.1.1908 "), "1908-01-01");
  assert.equal(parsePaivays("9/2026"), "2026-09");
  assert.equal(parsePaivays("09.2026"), "2026-09");
});

test("päivämääräväli → ISO-väli", () => {
  assert.equal(parsePaivays("30.1.–1.2.2009"), "2009-01-30/2009-02-01");
  assert.equal(parsePaivays("30.–31.1.2009"), "2009-01-30/2009-01-31");
  assert.equal(parsePaivays("30.12.2008 - 2.1.2009"), "2008-12-30/2009-01-02");
  assert.equal(parsePaivays("11.6.—11.7.2010"), "2010-06-11/2010-07-11");
});

test("ISO kelpaa sellaisenaan", () => {
  assert.equal(parsePaivays("2026-09-26"), "2026-09-26");
  assert.equal(parsePaivays("2026-09"), "2026-09");
  assert.equal(parsePaivays("2009-01-30/2009-02-01"), "2009-01-30/2009-02-01");
});

test("virheelliset päivämäärät hylätään", () => {
  assert.equal(parsePaivays("31.2.2026"), null);
  assert.equal(parsePaivays("13/2026"), null);
  assert.equal(parsePaivays("kevät 1998"), null);
  assert.equal(parsePaivays("2.2.–1.2.2009"), null, "alku lopun jälkeen");
  assert.equal(parsePaivays("26.9."), null, "vuosi puuttuu");
  assert.equal(parsePaivays(""), null);
});

test("näyttömuoto ja tallennusmuoto kulkevat edestakaisin", () => {
  for (const iso of ["2026-09-26", "2026-09", "2009-01-30/2009-02-01", "2009-01-30/2009-01-31", "2008-12-30/2009-01-02"]) {
    const naytetty = formatPaivays(iso);
    assert.equal(parsePaivays(naytetty), iso, `${iso} → ${naytetty}`);
  }
  assert.equal(formatPaivays("2009-01-30/2009-01-31"), "30.–31.01.2009");
  assert.equal(formatPaivays("kevät 1998"), "kevät 1998");
});

test("solun arvo normalisoidaan sarakkeen tyypin mukaan", () => {
  assert.equal(normalisoiArvo("61 035", "number"), "61035");
  assert.equal(normalisoiArvo("61 035", "number"), "61035");
  assert.equal(normalisoiArvo("n. 5000", "number"), "n. 5000");
  assert.equal(normalisoiArvo("26.9.2026", "date"), "2026-09-26");
  assert.equal(normalisoiArvo("kevät 1998", "date"), "kevät 1998");
  assert.equal(normalisoiArvo("  Suomi  ", "text"), "Suomi");
  assert.equal(normalisoiArvo("26.9.2026", "text"), "26.9.2026", "tekstisarake ei muunna");
  assert.equal(normalisoiArvo("   ", "number"), "");
  assert.equal(naytettavaArvo("2026-09-26", "date"), "26.09.2026");
  assert.equal(naytettavaArvo(null, "date"), "");
});

test("tyyppivaroitukset", () => {
  assert.equal(tyyppivaroitus("1400", "number"), null);
  assert.ok(tyyppivaroitus("n. 5000", "number"));
  assert.ok(tyyppivaroitus("98", "year"));
  assert.equal(tyyppivaroitus("2026-09-26", "date"), null);
  assert.ok(tyyppivaroitus("syksy", "date"));
  assert.equal(tyyppivaroitus("mitä tahansa", "text"), null);
  assert.equal(tyyppivaroitus("", "number"), null);
});

test("sarakeavain on pysyvä ja uniikki", () => {
  assert.equal(sarakeavain("Kotijoukkue", []), "kotijoukkue");
  assert.equal(sarakeavain("Päävalmentaja", []), "paavalmentaja");
  assert.equal(sarakeavain("Pisteet", ["pisteet"]), "pisteet-2");
  assert.equal(sarakeavain("Pisteet", ["pisteet", "pisteet-2"]), "pisteet-3");
  assert.equal(sarakeavain("!!!", []), "sarake");
  assert.equal(sarakeavain("#", ["sarake"]), "sarake-2");
});

test("tyypin arvaus", () => {
  assert.equal(arvaaTyyppi(["1998", "2004", ""]), "year");
  assert.equal(arvaaTyyppi(["12", "1 400", "-3"]), "number");
  assert.equal(arvaaTyyppi(["26.9.2026", "1.1.2020"]), "date");
  assert.equal(arvaaTyyppi(["https://palloliitto.fi"]), "link");
  assert.equal(arvaaTyyppi(["Suomi", "12"]), "text");
  assert.equal(arvaaTyyppi(["", ""]), "text");
});

test("erottimen tunnistus", () => {
  assert.equal(tunnistaErotin("a\tb\nc\td"), "\t");
  assert.equal(tunnistaErotin("a;b;c\n1,5;2;3"), ";", "suomalainen Excel-CSV");
  assert.equal(tunnistaErotin("a,b\n1,2"), ",");
  assert.equal(tunnistaErotin('"a;b",c'), ",", "lainattu erotin ei lasku");
  assert.equal(tunnistaErotin("yksi sarake\ntoinen"), "\t");
});

test("Excelin leikepöydän jäsennys", () => {
  assert.deepEqual(jasennaRuudukko("Nimi\tPisteet\r\nSimo\t1400\r\nIlpo\t1200\r\n"), [
    ["Nimi", "Pisteet"],
    ["Simo", "1400"],
    ["Ilpo", "1200"],
  ]);
  // Solu, jossa rivinvaihto, sarkain ja lainausmerkki (Excel lainaa sen).
  assert.deepEqual(jasennaRuudukko('"rivi 1\nrivi 2"\t"sanoi ""moi"""\nb\tc'), [
    ["rivi 1\nrivi 2", 'sanoi "moi"'],
    ["b", "c"],
  ]);
  // Lyhyet rivit tasataan, lopun tyhjät rivit poistuvat.
  assert.deepEqual(jasennaRuudukko("a\tb\tc\nd\n\t\n"), [
    ["a", "b", "c"],
    ["d", "", ""],
  ]);
  assert.deepEqual(jasennaRuudukko("x;y\n1;2", ";"), [
    ["x", "y"],
    ["1", "2"],
  ]);
});

test("yksittäinen arvo ei ole ruudukko", () => {
  assert.equal(onRuudukko("Suomi"), false);
  assert.equal(onRuudukko("Suomi\n"), false, "Excel lisää yhden solun perään rivinvaihdon");
  assert.equal(onRuudukko("a\tb"), true);
  assert.equal(onRuudukko("a\nb"), true);
});

test("vienti Exceliin ja takaisin säilyttää sisällön", () => {
  const ruudukko = [
    ["Nimi", "Huomio"],
    ["Simo", 'sanoi "moi"\ntoisella rivillä'],
    ["Ilpo", "a\tb"],
  ];
  assert.deepEqual(jasennaRuudukko(ruudukkoTekstiksi(ruudukko)), ruudukko);
});


// ---------------------------------------------------------------------------
// Editorin patchit Sanityn mutaatiomoottorilla
// ---------------------------------------------------------------------------

type Doc = { _id: string; _type: string; columns?: Sarake[]; rows?: Rivi[] };

function sovella(doc: Doc, patchit: FormPatch[]): Doc {
  const mutations = toMutationPatches(patchit).map((p) => ({ patch: { id: doc._id, ...p } }));
  return new Mutation({ mutations }).apply(doc as never) as Doc;
}

const s0: Sarake = { _key: "c0", key: "sija", label: "Sija", type: "text" };
const s1: Sarake = { _key: "c1", key: "nimi", label: "Nimi", type: "text" };
const s2: Sarake = { _key: "c2", key: "pisteet", label: "Pisteet", type: "number" };
let doc: Doc = {
  _id: "drafts.testi",
  _type: "jalkapalloTilasto",
  columns: [s0, s1, s2],
  rows: [
    {
      _key: "r0",
      cells: [
        { _key: "a", key: "sija", value: "1." },
        { _key: "b", key: "nimi", value: "Simo" },
        { _key: "c", key: "pisteet", value: "1400" },
      ],
    },
    { _key: "r1", cells: [{ _key: "d", key: "sija", value: "2." }, { _key: "e", key: "nimi", value: "Ilpo" }] },
    { _key: "r2", cells: [{ _key: "f", key: "sija", value: "3." }] },
  ],
};
const r0 = doc.rows![0];

// Olemassa olevan solun muutos
doc = sovella(doc, asetaSolu(r0, s1, "Testi"));
assert.equal(soluArvo(doc.rows![0], s1), "Testi");
// Tyhjennys poistaa solun
const ennen = doc.rows![0].cells!.length;
doc = sovella(doc, asetaSolu(doc.rows![0], s1, ""));
assert.equal(doc.rows![0].cells!.length, ennen - 1);
assert.equal(soluArvo(doc.rows![0], s1), "");
// Puuttuvan solun lisäys
doc = sovella(doc, asetaSolu(doc.rows![0], s1, "Uusi"));
assert.equal(soluArvo(doc.rows![0], s1), "Uusi");
ok += 1;
console.log("✓ patchit: solut");

// Rivi ilman cells-kenttää
doc = sovella(doc, lisaaRivit([{ _key: "tyhja" }], "loppuun"));
const tyhja = doc.rows!.find((r) => r._key === "tyhja")!;
doc = sovella(doc, asetaSolu(tyhja, s0, "X"));
assert.equal(soluArvo(doc.rows!.at(-1)!, s0), "X");
ok += 1;
console.log("✓ patchit: rivi ilman soluja");

// Rivien lisäys, siirto, poisto
const n = doc.rows!.length;
const uusi = uusiRivi(doc.columns!, ["99", "Ylle"]);
doc = sovella(doc, lisaaRivit([uusi], { ennen: doc.rows![1]._key }));
assert.equal(doc.rows![1]._key, uusi._key);
doc = sovella(doc, siirraRivi(doc.rows!, doc.rows![1], -1));
assert.equal(doc.rows![0]._key, uusi._key);
doc = sovella(doc, siirraRivi(doc.rows!, doc.rows![0], 1));
assert.equal(doc.rows![1]._key, uusi._key);
doc = sovella(doc, poistaRivi(doc.rows![1]));
assert.equal(doc.rows!.length, n);
ok += 1;
console.log("✓ patchit: rivit");

// Sarakkeet: lisäys, siirto, tyypin vaihto, poisto
doc = sovella(doc, lisaaSarake({ _key: "sk", key: "pvm", label: "Pvm", type: "text" }, { jalkeen: s0._key }));
assert.equal(doc.columns![1]._key, "sk");
const pvm = doc.columns![1];
doc = sovella(doc, asetaSolu(doc.rows![0], pvm, "26.9.2026"));
doc = sovella(doc, muokkaaSaraketta(doc.rows!, pvm, { label: "Päivä", type: "date" }));
assert.equal(doc.columns![1].label, "Päivä");
assert.equal(doc.columns![1].type, "date");
assert.equal(soluArvo(doc.rows![0], doc.columns![1]), "2026-09-26");
doc = sovella(doc, siirraSaraketta(doc.columns!, doc.columns![1], -1));
assert.equal(doc.columns![0]._key, "sk");
doc = sovella(doc, poistaSarake(doc.rows!, doc.columns![0]));
assert.equal(doc.columns!.length, 3);
assert.ok(doc.rows!.every((r) => !(r.cells ?? []).some((c) => c.key === "pvm")));
ok += 1;
console.log("✓ patchit: sarakkeet");

// Tyhjä dokumentti: ensimmäinen sarake ja rivi
let tyhjaDoc: Doc = { _id: "drafts.testi", _type: "jalkapalloTilasto" };
tyhjaDoc = sovella(tyhjaDoc, lisaaSarake({ _key: "a", key: "nimi", label: "Nimi", type: "text" }, "loppuun"));
tyhjaDoc = sovella(tyhjaDoc, lisaaRivit([uusiRivi(tyhjaDoc.columns!, ["Simo"])], "loppuun"));
assert.equal(soluArvo(tyhjaDoc.rows![0], tyhjaDoc.columns![0]), "Simo");
ok += 1;
console.log("✓ patchit: tyhjä dokumentti");

// Korvaus
doc = sovella(doc, korvaaTaulukko([s2], [uusiRivi([s2], ["5"])]));
assert.equal(doc.columns!.length, 1);
assert.equal(doc.rows!.length, 1);
ok += 1;
console.log("✓ patchit: korvaus");

console.log(`\n${ok} testiä ok`);
