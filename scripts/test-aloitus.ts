/**
 * Aloitus-näkymän tehtävärekisteri ja kysely (sanity/lib/tehtavat.ts, docs/24 askel 7).
 * Kysely ajetaan groq-js:llä pientä dataa vasten.
 *
 * Ajo: npm run test:aloitus
 */
import assert from "node:assert/strict";

import { evaluate, parse } from "groq-js";

import { TILA_ID } from "../lib/sivuston-tila";
import {
  ALOITUS_KYSELY,
  aloituksenParametrit,
  JULKAISEMATTOMISTA_POIS,
  KIINTIO_KYSELY,
  TARKISTETTAVAT_TYYPIT,
  TEHTAVAT,
  tehtavanPolku,
} from "../sanity/lib/tehtavat";

let ok = 0;
async function test(nimi: string, fn: () => void | Promise<void>) {
  await fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

async function aja(kysely: string, dataset: Record<string, unknown>[], params: Record<string, unknown> = {}) {
  return (await evaluate(parse(kysely, { params }), { dataset, params })).get();
}

async function main() {
  await test("TEHTAVAT: tunnisteet uniikkeja, laskuri on count(…) ja suodatin epätyhjä", () => {
    const idt = TEHTAVAT.map((t) => t.id);
    assert.equal(new Set(idt).size, idt.length);
    assert.deepEqual(idt, ["arvostelut", "kommentit", "julkaisemattomat", "ajastetut", "tarkistettavat"]);
    for (const t of TEHTAVAT) {
      assert.ok(t.laskuri.startsWith("count("), t.id);
      assert.ok(t.suodatin.trim().length > 0, t.id);
      assert.ok(t.otsikko && t.kuvaus, t.id);
      assert.match(t.id, /^[a-z-]+$/, "Studion polun tunnus");
    }
    assert.equal(tehtavanPolku("julkaisemattomat"), "/studio/structure/tehtavat;julkaisemattomat");
  });

  await test("julkaisemattomat: pois-joukossa sivustonTila, varmuuskopio ja arvostelut", () => {
    const t = TEHTAVAT.find((x) => x.id === "julkaisemattomat");
    assert.ok(t?.params);
    const pois = t.params.pois as string[];
    for (const tyyppi of ["sivustonTila", "varmuuskopio", "ravintolaKayttajaArvostelu"]) assert.ok(pois.includes(tyyppi), tyyppi);
    assert.equal(pois, JULKAISEMATTOMISTA_POIS);
  });

  await test("tarkistettavat-tyypit siirretty rekisteriin", () => {
    const t = TEHTAVAT.find((x) => x.id === "tarkistettavat");
    assert.deepEqual(t?.params?.tyypit, TARKISTETTAVAT_TYYPIT.map((x) => x.tyyppi));
    assert.ok(TARKISTETTAVAT_TYYPIT.some((x) => x.tyyppi === "uutinen"));
  });

  await test("kyselyt jäsentyvät (GROQ)", () => {
    const params = aloituksenParametrit();
    parse(ALOITUS_KYSELY, { params });
    parse(KIINTIO_KYSELY);
    for (const t of TEHTAVAT) {
      parse(t.laskuri, { params: t.params ?? {} });
      parse(`*[${t.suodatin}]`, { params: t.params ?? {} });
    }
    assert.equal(params.huoltoId, TILA_ID.huolto);
    assert.equal(params.varmuuskopioId, TILA_ID.varmuuskopio);
  });

  const tuleva = new Date(Date.now() + 7 * 24 * 3_600_000).toISOString();
  const eilen = new Date(Date.now() - 24 * 3_600_000).toISOString();
  const dataset: Record<string, unknown>[] = [
    { _id: "drafts.arvostelu-1", _type: "ravintolaKayttajaArvostelu" },
    { _id: "arvostelu-2", _type: "ravintolaKayttajaArvostelu" },
    { _id: "kommentti-1", _type: "kommentti", lahetetty: eilen },
    { _id: "kommentti-2", _type: "kommentti", lahetetty: "2020-01-01T00:00:00Z" },
    { _id: "drafts.uutinen-1", _type: "uutinen", publishedAt: eilen },
    { _id: "uutinen-2", _type: "uutinen", publishedAt: tuleva, needsReview: true },
    // Julkaistu on tarkistettava, mutta luonnoksessa merkki on poistettu: Studion lista näyttää luonnoksen.
    { _id: "uutinen-3", _type: "uutinen", publishedAt: eilen, needsReview: true },
    { _id: "drafts.uutinen-3", _type: "uutinen", publishedAt: eilen, needsReview: false },
    // Julkaisuversio ei ole listoissa.
    { _id: "versions.r1.uutinen-4", _type: "uutinen", publishedAt: tuleva, needsReview: true },
    // Julkaisematon kommentti näkyy listassa ja laskurissa.
    { _id: "drafts.kommentti-3", _type: "kommentti", lahetetty: eilen },
    { _id: "drafts.sivustonTila.huolto", _type: "sivustonTila" },
    { _id: "drafts.varmuuskopio-x", _type: "varmuuskopio" },
    { _id: "varmuuskopio-2026-09-28", _type: "varmuuskopio", paiva: "2026-09-28", dokumentteja: 5000 },
    { _id: "varmuuskopio-2026-10-05", _type: "varmuuskopio", paiva: "2026-10-05", dokumentteja: 5544 },
    { _id: TILA_ID.huolto, _type: "sivustonTila", aika: "2026-10-08T02:02:00Z", onnistui: true, tulokset: [] },
    { _id: "yhteystiedot", _type: "yhteystiedot", email: "klubi@example.fi" },
    { _id: "hallitus-1", _type: "hallitusJasen", nykyinen: false },
    {
      _id: "etusivu",
      _type: "etusivu",
      blocks: [
        { _type: "esittely", _key: "a", piilota: true },
        { _type: "esittely", _key: "b", image: { asset: { _ref: "image-x" } } },
      ],
    },
    { _id: "image-x", _type: "sanity.imageAsset" },
    { _id: "_.groups.public", _type: "system.group" },
  ];

  await test("Aloituksen kysely: laskurit, varmuuskopio, huolto ja perustiedot", async () => {
    const tulos = (await aja(ALOITUS_KYSELY, dataset, aloituksenParametrit())) as Record<string, unknown>;
    assert.deepEqual(tulos.laskurit, {
      arvostelut: 1,
      kommentit: 2, // julkaistu ja pelkkä luonnos
      julkaisemattomat: 3, // uutisten ja kommentin luonnokset: ei arvostelua, tilaa eikä varmuuskopiota
      ajastetut: 1,
      tarkistettavat: 1, // uutinen-3:n luonnos ei ole tarkistettava, versio ei ole listassa
    });
    assert.deepEqual(tulos.varmuuskopio, { paiva: "2026-10-05", dokumentteja: 5544 });
    assert.equal((tulos.huolto as { aika: string }).aika, "2026-10-08T02:02:00Z");
    assert.equal(tulos.varmuuskopioAjo, null);
    assert.deepEqual(tulos.perustiedot, {
      sahkoposti: true,
      osoite: false,
      puhelin: false,
      hallitus: 0,
      esittelykuva: true, // piilotettu lohko ohitetaan
    });
  });

  await test("esittelykuva: puuttuu vain, kun näkyvässä esittelylohkossa ei ole kuvaa", async () => {
    const ilman = dataset.map((d) =>
      d._id === "etusivu" ? { ...d, blocks: [{ _type: "esittely", _key: "b" }, { _type: "uutiset", _key: "c" }] } : d,
    );
    const a = (await aja(ALOITUS_KYSELY, ilman, aloituksenParametrit())) as { perustiedot: { esittelykuva: boolean } };
    assert.equal(a.perustiedot.esittelykuva, false);
    const eiLohkoa = dataset.map((d) => (d._id === "etusivu" ? { ...d, blocks: [{ _type: "uutiset", _key: "c" }] } : d));
    const b = (await aja(ALOITUS_KYSELY, eiLohkoa, aloituksenParametrit())) as { perustiedot: { esittelykuva: boolean } };
    assert.equal(b.perustiedot.esittelykuva, true, "ei esittelylohkoa: ei puutetta");
  });

  await test("kiintiön laskenta: sisältö luonnoksineen, ei tiedostoja eikä järjestelmää", async () => {
    // Kaikki paitsi kuva ja _.groups (luonnokset ja versiot kuuluvat kiintiöön).
    assert.equal(await aja(KIINTIO_KYSELY, dataset), dataset.length - 2);
  });

  console.log(`\n${ok} testiä ok`);
}

main().catch((virhe) => {
  console.error(virhe);
  process.exit(1);
});
