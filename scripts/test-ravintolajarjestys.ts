/**
 * Ravintolahakemiston järjestykset (sanity/lib/queries/ravintolat.ts).
 *
 * Sääntö (12.10.2026): arvosanajärjestyksissä (Parhaat, Paras ruoka, Paras
 * hinta, Paras viihtyvyys) tasapisteet ratkaisee ensin eri arvioijien määrä,
 * sitten tuorein arvio. Kokonaisarvosana ei ratkaise osa-arvosanan tasapisteitä.
 *
 * Kysely ajetaan groq-js:llä sellaisenaan, joten testi valvoo oikeaa GROQ:ta.
 *
 * Ajo: npm run test:ravintolajarjestys
 */
import assert from "node:assert/strict";
import { evaluate, parse } from "groq-js";

import { ravintolatDirectoryQuery, type RavintolatOrdering } from "../sanity/lib/queries/ravintolat";

let ok = 0;
async function test(nimi: string, fn: () => Promise<void>) {
  await fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

type Arvosanat = { kokonais?: number; ruoka?: number; hinta?: number; viihtyvyys?: number };

/** Laskettu arvosana (klubilaisten keskiarvo). */
function ravintola(name: string, a: Arvosanat, arvioijia: number, viimeisinArvio: string | null) {
  return {
    _id: name,
    _type: "ravintola",
    name,
    slug: { current: name.toLowerCase().replace(/\s+/g, "-") },
    ratingOverall: a.kokonais,
    ratingFood: a.ruoka,
    ratingPrice: a.hinta,
    ratingAtmosphere: a.viihtyvyys,
    automaattinenArvosana: { arvioijia, viimeisinArvio },
  };
}

/** Vanhan sivuston arvosana: ei arvioijamäärää, käyntipäivä `visits`-listassa. */
function vanha(name: string, a: Arvosanat, kaynti: string) {
  return {
    _id: name,
    _type: "ravintola",
    name,
    slug: { current: name.toLowerCase().replace(/\s+/g, "-") },
    ratingOverall: a.kokonais,
    ratingFood: a.ruoka,
    ratingPrice: a.hinta,
    ratingAtmosphere: a.viihtyvyys,
    visits: [kaynti],
  };
}

const params = {
  citySlug: null,
  countryNames: null,
  maakuntaSlugs: null,
  minRating: null,
  includeClosed: false,
  terms: null,
};

async function jarjestys(dataset: object[], ordering: RavintolatOrdering): Promise<string[]> {
  const kysely = ravintolatDirectoryQuery({ ordering, page: 1 });
  const tulos = (await (await evaluate(parse(kysely), { dataset, params })).get()) as { name: string }[];
  return tulos.map((r) => r.name);
}

// Tilanne kuvakaappauksesta 12.10.2026: kaikilla viihtyvyys 4,0, kokonais vaihtelee.
const tasapisteet = [
  ravintola("Rataskaevu16", { kokonais: 4.1, ruoka: 4.0, hinta: 4.0, viihtyvyys: 4.0 }, 3, "2018-10-05"),
  ravintola("Demo", { kokonais: 4.1, ruoka: 4.0, hinta: 4.0, viihtyvyys: 4.0 }, 2, "2020-07-01"),
  ravintola("Retro Enoteca", { kokonais: 4.0, ruoka: 4.0, hinta: 4.0, viihtyvyys: 4.0 }, 2, "2026-07-10"),
  ravintola("Literatur Cafe", { kokonais: 3.9, ruoka: 4.0, hinta: 4.0, viihtyvyys: 4.0 }, 4, "2018-06-01"),
  ravintola("HEJM", { kokonais: 3.9, ruoka: 4.0, hinta: 4.0, viihtyvyys: 4.0 }, 2, "2025-07-20"),
];
const odotettu = ["Literatur Cafe", "Rataskaevu16", "Retro Enoteca", "HEJM", "Demo"];

async function main() {
  for (const ordering of ["ruoka", "hinta", "viihtyvyys"] as const) {
    await test(`${ordering}: tasapisteissä arvioijamäärä, sitten tuorein arvio (ei kokonaisarvosana)`, async () => {
      assert.deepEqual(await jarjestys(tasapisteet, ordering), odotettu);
    });
  }

  await test("parhaat: tasapisteissä arvioijamäärä, sitten tuorein arvio", async () => {
    const samat = tasapisteet.map((r) => ({ ...r, ratingOverall: 4.0 }));
    assert.deepEqual(await jarjestys(samat, "arvosana"), odotettu);
  });

  await test("osa-arvosana ratkaisee ennen arvioijamäärää", async () => {
    const data = [
      ravintola("Monta arvioijaa", { kokonais: 4.5, viihtyvyys: 3.9 }, 6, "2026-01-01"),
      ravintola("Paras viihtyvyys", { kokonais: 3.0, viihtyvyys: 4.6 }, 2, "2010-01-01"),
    ];
    assert.deepEqual(await jarjestys(data, "viihtyvyys"), ["Paras viihtyvyys", "Monta arvioijaa"]);
  });

  await test("vertailu yhden desimaalin tarkkuudella, kuten kortti näyttää", async () => {
    const data = [
      ravintola("Vanha laskenta", { ruoka: 4.04 }, 2, "2019-01-01"),
      ravintola("Enemmän arvioijia", { ruoka: 4.0 }, 3, "2018-01-01"),
    ];
    assert.deepEqual(await jarjestys(data, "ruoka"), ["Enemmän arvioijia", "Vanha laskenta"]);
  });

  await test("vanhan sivuston arvosana (ei arvioijamäärää) häviää tasapisteet", async () => {
    const data = [
      vanha("Vanha", { kokonais: 4.0, hinta: 4.0 }, "2026-09-01"),
      ravintola("Uusi", { kokonais: 4.0, hinta: 4.0 }, 2, "2015-01-01"),
    ];
    assert.deepEqual(await jarjestys(data, "hinta"), ["Uusi", "Vanha"]);
    assert.deepEqual(await jarjestys(data, "arvosana"), ["Uusi", "Vanha"]);
  });

  await test("parhaat: pelkät tähdet (vanhin aineisto) käyvät arvosanasta", async () => {
    const tahdet = { ...vanha("Tähdet", {}, "2005-01-01"), stars: 4.5 };
    const data = [ravintola("Laskettu", { kokonais: 4.0 }, 3, "2026-01-01"), tahdet];
    assert.deepEqual(await jarjestys(data, "arvosana"), ["Tähdet", "Laskettu"]);
  });

  await test("puuttuva osa-arvosana loppuun", async () => {
    const data = [
      ravintola("Ei ruokaa", { kokonais: 5.0 }, 5, "2026-01-01"),
      ravintola("Heikko ruoka", { kokonais: 2.0, ruoka: 1.0 }, 2, "2010-01-01"),
    ];
    assert.deepEqual(await jarjestys(data, "ruoka"), ["Heikko ruoka", "Ei ruokaa"]);
  });

  await test("sama arvioijamäärä ja päivä: nimen mukaan", async () => {
    const data = [
      ravintola("Bravo", { viihtyvyys: 4.0 }, 2, "2020-01-01"),
      ravintola("Alfa", { viihtyvyys: 4.0 }, 2, "2020-01-01"),
    ];
    assert.deepEqual(await jarjestys(data, "viihtyvyys"), ["Alfa", "Bravo"]);
  });

  console.log(`\n${ok} testiä ok`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
