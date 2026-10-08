/**
 * Varmuuskopiosta palauttamisen sääntöjen testit (lib/palautus.ts).
 *
 * Ajo: npm run test:palautus
 */
import assert from "node:assert/strict";

import {
  dokumentinNimi,
  etsiDokumentti,
  heikennaPuuttuvatViittaukset,
  julkaistuId,
  luonnosVarmuuskopiosta,
  osuuHakuun,
  poistetutDokumentit,
  viitatutTunnisteet,
  voiPalauttaa,
} from "../lib/palautus";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const kopio = [
  JSON.stringify({ _type: "uutinen", _id: "uutinen-1", _rev: "r1", title: "Vuosikokous 2026" }),
  // Sama tunniste osana pidempää: ei saa sekoittua.
  JSON.stringify({ _id: "uutinen-10", _type: "uutinen", _rev: "r10", title: "Kevätretki" }),
  JSON.stringify({ _id: "sivu-historia", _type: "sivu", title: "Historia" }),
  JSON.stringify({ _id: "etusivu", _type: "etusivu", heroEyebrow: "Klubi" }),
  JSON.stringify({ _id: "kommentti-1", _type: "kommentti", nimi: "Matti" }),
  JSON.stringify({ _id: "image-abc-10x10-jpg", _type: "sanity.imageAsset" }),
  JSON.stringify({ _id: "hallitus-1", _type: "hallitusJasen", name: "Ärrä Öljynen" }),
  "",
].join("\n");

test("palautettavat tyypit", () => {
  assert.equal(voiPalauttaa("uutinen"), true);
  assert.equal(voiPalauttaa("etusivu"), true, "singleton");
  assert.equal(voiPalauttaa("varmuuskopio"), false);
  assert.equal(voiPalauttaa("kommentti"), false, "moderointi poistaa tarkoituksella");
  assert.equal(voiPalauttaa("ravintolaKayttajaArvostelu"), false);
  assert.equal(voiPalauttaa("sanity.imageAsset"), false);
  assert.equal(voiPalauttaa("system.group"), false);
  assert.equal(voiPalauttaa(undefined), false);
});

test("tunniste ilman etuliitteitä", () => {
  assert.equal(julkaistuId("drafts.uutinen-1"), "uutinen-1");
  assert.equal(julkaistuId("versions.r123.uutinen-1"), "uutinen-1");
  assert.equal(julkaistuId("uutinen-1"), "uutinen-1");
});

test("dokumentin haku kopiosta", () => {
  assert.equal(etsiDokumentti(kopio, "uutinen-1")?.title, "Vuosikokous 2026");
  assert.equal(etsiDokumentti(kopio, "drafts.uutinen-1")?.title, "Vuosikokous 2026", "luonnoksen tunnisteella");
  assert.equal(etsiDokumentti(kopio, "uutinen-10")?.title, "Kevätretki", "ei sekoitu uutinen-1:een");
  assert.equal(etsiDokumentti(kopio, "uutinen-2"), null);
  assert.equal(etsiDokumentti("", "uutinen-1"), null, "tyhjä kopio");
});

test("luonnos kopiosta: drafts-tunniste, ei aikaleimoja eikä revisiota", () => {
  const luonnos = luonnosVarmuuskopiosta({
    _id: "uutinen-1",
    _type: "uutinen",
    _rev: "r1",
    _createdAt: "2026-01-01T00:00:00Z",
    _updatedAt: "2026-02-01T00:00:00Z",
    // Export API:n luonnosmetatieto: ei saa kirjoittaa takaisin.
    _system: { base: { id: "uutinen-1", rev: "r0" } },
    title: "Vuosikokous",
    body: [{ _type: "block", _key: "a" }],
    kuva: { _type: "image", asset: { _type: "reference", _ref: "image-abc-10x10-jpg" } },
  });
  assert.deepEqual(luonnos, {
    _id: "drafts.uutinen-1",
    _type: "uutinen",
    title: "Vuosikokous",
    body: [{ _type: "block", _key: "a" }],
    kuva: { _type: "image", asset: { _type: "reference", _ref: "image-abc-10x10-jpg" } },
  });
  assert.equal(luonnosVarmuuskopiosta({ _id: "drafts.x", _type: "sivu" })._id, "drafts.x", "ei tuplaetuliitettä");
});

test("dokumentin nimi listaan", () => {
  assert.equal(dokumentinNimi({ _id: "a", title: "Otsikko" }), "Otsikko");
  assert.equal(dokumentinNimi({ _id: "a", otsikko: "Leike" }), "Leike");
  assert.equal(dokumentinNimi({ _id: "a", name: "Ravintola" }), "Ravintola");
  assert.equal(dokumentinNimi({ _id: "a", title: "  ", nimi: "Nimi" }), "Nimi", "tyhjä ohitetaan");
  assert.equal(dokumentinNimi({ _id: "etusivu" }), "etusivu", "varalla tunniste");
});

test("poistetut dokumentit: vain palautettavat, joita ei enää ole", () => {
  const olemassa = new Set(["uutinen-1", "etusivu"]);
  const poistetut = poistetutDokumentit(kopio, olemassa);
  assert.deepEqual(
    poistetut.map((d) => d.id),
    ["sivu-historia", "uutinen-10", "hallitus-1"],
    "aakkosjärjestys suomeksi (Ä viimeisenä), ei kommentteja eikä kuvia",
  );
  assert.equal(poistetut[0].tyyppi, "sivu");
});

test("haku nimestä", () => {
  assert.equal(osuuHakuun("Vuosikokous 2026", "vuosikokous"), true);
  assert.equal(osuuHakuun("Vuosikokous 2026", "2026 vuosi"), true, "sanat missä järjestyksessä tahansa");
  assert.equal(osuuHakuun("Ärrä Öljynen", "öljy"), true, "ääkköset");
  assert.equal(osuuHakuun("Kevätretki", "syysretki"), false);
});

test("puuttuvat viittaukset heikoiksi, olemassa olevat ennallaan (myös sisäkkäiset ja tekstin linkit)", () => {
  const ref = (id: string) => ({ _type: "reference", _ref: id });
  const doc = {
    _id: "drafts.navigaatio",
    _type: "navigaatio",
    items: [
      {
        _key: "a",
        label: "Klubi",
        tyyppi: "sivu",
        kohde: ref("sivu-klubi"),
        children: [{ _key: "b", kohde: ref("sivu-poistettu") }],
      },
    ],
    body: [
      {
        _type: "block",
        _key: "c",
        markDefs: [{ _type: "link", _key: "m", tyyppi: "sivu", kohde: ref("uutinen-poistettu") }],
        children: [{ _type: "span", _key: "s", text: "linkki", marks: ["m"] }],
      },
    ],
    kuva: { _type: "image", asset: ref("image-abc-10x10-jpg") },
  };
  assert.deepEqual(viitatutTunnisteet(doc).sort(), [
    "image-abc-10x10-jpg",
    "sivu-klubi",
    "sivu-poistettu",
    "uutinen-poistettu",
  ]);
  const tulos = heikennaPuuttuvatViittaukset(doc, new Set(["sivu-klubi", "image-abc-10x10-jpg"]));
  assert.deepEqual(tulos.items[0].kohde, ref("sivu-klubi"), "olemassa oleva ennallaan");
  assert.deepEqual(tulos.items[0].children[0].kohde, { ...ref("sivu-poistettu"), _weak: true }, "sisäkkäinen");
  assert.deepEqual(tulos.body[0].markDefs[0].kohde, { ...ref("uutinen-poistettu"), _weak: true }, "tekstin linkki");
  assert.deepEqual(tulos.kuva.asset, ref("image-abc-10x10-jpg"));
  assert.equal(tulos.body[0].children[0].text, "linkki", "muu sisältö säilyy");
  assert.equal("_weak" in doc.items[0].children[0].kohde, false, "alkuperäistä ei muuteta");
});

console.log(`\n${ok} testiä ok`);
