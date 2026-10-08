/**
 * Päävalikon ja siitä johdetun alatunnisteen testit (lib/navigaatio.ts,
 * docs/24 askel 4).
 *
 * Ajo: npm run test:navigaatio
 */
import assert from "node:assert/strict";

import { defaultNavigation } from "../lib/defaults";
import {
  alatunnisteenSarakkeet,
  onYleissivuAlavalikossa,
  ratkaiseNavigaatio,
  SIVUSTO_SARAKE,
  YLEISESITTELY,
  type RaakaNavigaatioKohta,
} from "../lib/navigaatio";
import { piilotaTyhjat } from "../lib/osiot";
import type { NavigationItem } from "../lib/types";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const viittaus = (_type: string, slug: string, nimi = slug) => ({
  tyyppi: "sivu",
  kohde: { _id: `${_type}-${slug.replaceAll("/", "-")}`, _type, slug, nimi, piilossa: false },
});

/**
 * Productionin valikko 8.10.2026 sekamuodossa, kuten se on askeleen 5
 * muunnoksen jälkeen: 4 viittausta (/klubi ×2, /klubi/palloveikkaus,
 * Litmanen) ja 12 vanhaa osoitetta. Vanhat osoitteet säilyvät kaksoislukua varten.
 */
const PRODUCTION: RaakaNavigaatioKohta[] = [
  {
    label: "Jalkapallo",
    href: "/jalkapalloarkisto",
    children: [
      { label: "Jalkapalloarkisto", href: "/jalkapalloarkisto" },
      { label: "Huuhkajat", href: "/jalkapalloarkisto/huuhkajat" },
      { label: "Arvokisat", href: "/jalkapalloarkisto/arvokisat" },
      { label: "Suomen mestarit", href: "/jalkapalloarkisto/mestarit" },
      { label: "Litmanen", href: "/jalkapalloarkisto/litmanen", ...viittaus("pelaaja", "jari-litmanen") },
      { label: "Stadionit", href: "/jalkapalloarkisto/stadionit" },
    ],
  },
  { label: "Ottelut", href: "/ottelut" },
  { label: "Ravintola-arviot", href: "/ravintolat" },
  { label: "Uutiset", href: "/uutiset" },
  {
    label: "Klubi",
    href: "/klubi",
    ...viittaus("sivu", "klubi"),
    children: [
      { label: "Esittely", href: "/klubi", ...viittaus("sivu", "klubi") },
      { label: "Toiminta", href: "/klubi/toiminta" },
      { label: "Hallitus", href: "/klubi/hallitus" },
      { label: "Palloveikkaus", href: "/klubi/palloveikkaus", ...viittaus("sivu", "klubi/palloveikkaus") },
      { label: "Yhteystiedot", href: "/klubi/yhteystiedot" },
    ],
  },
];

/** Nykyinen valikko kävijälle (sama kuin ennen askelta 4). */
const ODOTETTU: NavigationItem[] = [
  {
    label: "Jalkapallo",
    href: "/jalkapalloarkisto",
    children: [
      { label: "Jalkapalloarkisto", href: "/jalkapalloarkisto" },
      { label: "Huuhkajat", href: "/jalkapalloarkisto/huuhkajat" },
      { label: "Arvokisat", href: "/jalkapalloarkisto/arvokisat" },
      { label: "Suomen mestarit", href: "/jalkapalloarkisto/mestarit" },
      { label: "Litmanen", href: "/jalkapalloarkisto/litmanen" },
      { label: "Stadionit", href: "/jalkapalloarkisto/stadionit" },
    ],
  },
  { label: "Ottelut", href: "/ottelut" },
  { label: "Ravintola-arviot", href: "/ravintolat" },
  { label: "Uutiset", href: "/uutiset" },
  {
    label: "Klubi",
    href: "/klubi",
    children: [
      { label: "Esittely", href: "/klubi" },
      { label: "Toiminta", href: "/klubi/toiminta" },
      { label: "Hallitus", href: "/klubi/hallitus" },
      { label: "Palloveikkaus", href: "/klubi/palloveikkaus" },
      { label: "Yhteystiedot", href: "/klubi/yhteystiedot" },
    ],
  },
];

test("productionin valikko sekamuodossa → täsmälleen nykyiset osoitteet", () => {
  assert.deepEqual(ratkaiseNavigaatio(PRODUCTION), ODOTETTU);
});

test("viittaus voittaa vanhan osoitteen (osoite seuraa sivun muutosta)", () => {
  const [klubi] = ratkaiseNavigaatio([{ label: "Klubi", href: "/klubi", ...viittaus("sivu", "klubi/uusi") }]);
  assert.equal(klubi.href, "/klubi/uusi");
});

test("puuttuva kohde: alalinkki pois, pääkohta ensimmäisestä alalinkistä tai kokonaan pois", () => {
  const julkaisematon = { tyyppi: "sivu", kohde: null };
  const tulos = ratkaiseNavigaatio([
    {
      label: "Klubi",
      ...julkaisematon,
      children: [
        { label: "Säännöt", ...julkaisematon },
        { label: "Hallitus", href: "/klubi/hallitus" },
      ],
    },
    { label: "Piilossa", ...julkaisematon },
    { label: "Ajastettu", tyyppi: "sivu", kohde: { ...viittaus("uutinen", "x").kohde, piilossa: true } },
    { label: "Rikki", href: "www.palloliitto.fi" },
    { label: "Tyhjä alavalikko", href: "/ottelut", children: [{ label: "Pois", ...julkaisematon }] },
  ]);
  assert.deepEqual(tulos, [
    { label: "Klubi", href: "/klubi/hallitus", children: [{ label: "Hallitus", href: "/klubi/hallitus" }] },
    { label: "Tyhjä alavalikko", href: "/ottelut" },
  ]);
});

test("vanha muoto ja varavalikko (defaultNavigation) ennallaan", () => {
  assert.deepEqual(
    ratkaiseNavigaatio([{ label: "Uutiset", href: "/uutiset", highlight: false, children: null }]),
    [{ label: "Uutiset", href: "/uutiset", highlight: false }],
  );
  assert.deepEqual(ratkaiseNavigaatio(defaultNavigation.items), defaultNavigation.items);
  assert.deepEqual(ratkaiseNavigaatio(null), []);
});

test("onYleissivuAlavalikossa", () => {
  assert.equal(onYleissivuAlavalikossa(ODOTETTU[0]), true, "Jalkapalloarkisto = pääkohdan sivu");
  assert.equal(onYleissivuAlavalikossa(ODOTETTU[4]), true, "Esittely = /klubi");
  assert.equal(
    onYleissivuAlavalikossa({ label: "Klubi", href: "/klubi", children: [{ label: "Hallitus", href: "/klubi/hallitus" }] }),
    false,
  );
  assert.equal(onYleissivuAlavalikossa({ label: "Uutiset", href: "/uutiset" }), false);
});

test("alatunniste productionin valikosta: Sivusto, Jalkapallo ja Klubi", () => {
  const sarakkeet = alatunnisteenSarakkeet(ratkaiseNavigaatio(PRODUCTION));
  assert.deepEqual(
    sarakkeet.map((s) => [s.otsikko, s.linkit.map((l) => l.label)]),
    [
      [SIVUSTO_SARAKE, ["Ottelut", "Ravintola-arviot", "Uutiset"]],
      ["Jalkapallo", ["Jalkapalloarkisto", "Huuhkajat", "Arvokisat", "Suomen mestarit", "Litmanen", "Stadionit"]],
      ["Klubi", ["Esittely", "Toiminta", "Hallitus", "Palloveikkaus", "Yhteystiedot"]],
    ],
  );
  assert.deepEqual(sarakkeet[0].linkit, [
    { label: "Ottelut", href: "/ottelut" },
    { label: "Ravintola-arviot", href: "/ravintolat" },
    { label: "Uutiset", href: "/uutiset" },
  ]);
});

test("alavalikko ilman pääkohdan sivua: ensimmäisenä Yleisesittely", () => {
  const [sarake] = alatunnisteenSarakkeet([
    { label: "Klubi", href: "/klubi", children: [{ label: "Hallitus", href: "/klubi/hallitus" }] },
  ]);
  assert.deepEqual(sarake, {
    otsikko: "Klubi",
    linkit: [
      { label: YLEISESITTELY, href: "/klubi" },
      { label: "Hallitus", href: "/klubi/hallitus" },
    ],
  });
});

test("ei alavalikottomia kohtia → ei Sivusto-saraketta; tyhjä valikko → ei sarakkeita", () => {
  const sarakkeet = alatunnisteenSarakkeet([ODOTETTU[0], ODOTETTU[4]]);
  assert.deepEqual(
    sarakkeet.map((s) => s.otsikko),
    ["Jalkapallo", "Klubi"],
  );
  assert.deepEqual(alatunnisteenSarakkeet([]), []);
});

test("tyhjät osiot piilotetaan ennen sarakkeita: tyhjäksi jäänyt alavalikko siirtyy Sivusto-sarakkeeseen", () => {
  const valikko = ratkaiseNavigaatio([
    { label: "Uutiset", href: "/uutiset" },
    { label: "Tapahtumat", href: "/tapahtumat" },
    { label: "Kuvat", href: "/klubi", children: [{ label: "Galleria", href: "/galleria" }] },
  ]);
  const tyhjat = new Set(["/tapahtumat", "/galleria"]);
  const sarakkeet = alatunnisteenSarakkeet(piilotaTyhjat(valikko, tyhjat));
  assert.deepEqual(sarakkeet, [
    {
      otsikko: SIVUSTO_SARAKE,
      linkit: [
        { label: "Uutiset", href: "/uutiset" },
        { label: "Kuvat", href: "/klubi" },
      ],
    },
  ]);
});

console.log(`\n${ok} testiä läpi.`);
