/**
 * Valmiiden pohjien ja [täytä: …] -säännön testit (lib/pohjat.ts,
 * sanity/pohjat.ts, docs/24 askel 10).
 *
 * Ajo: npm run test:pohjat
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { evaluate, parse } from "groq-js";
import { createSchema, resolveInitialValue, type InitialValueResolverContext, type Template } from "sanity";

import {
  POHJAN_KATEGORIAT,
  TAYTA,
  kategoriatSlugeilla,
  klubiArvioPohja,
  palloveikkausKausiPohja,
  palloveikkausTilannePohja,
  taytaVielaSaanto,
  taytettavatKohdat,
  tamaPaiva,
  tamaVuosi,
  vuosikokousNumero,
  vuosikokousPohja,
  type UutisPohja,
} from "../lib/pohjat";
import { tarkistaTunnisteet } from "../lib/tunnisteet";
import { KATEGORIAT_KYSELY, PIILOTETUT_POHJAT, RAVINTOLA_JULKAISTU_KYSELY, pohjat } from "../sanity/pohjat";
import { TILASTO_KATEGORIAT, tilastoPohjanId } from "../lib/tilasto-kategoriat";
import { schemaTypes } from "../sanity/schemas";

let ok = 0;
async function test(nimi: string, fn: () => void | Promise<void>) {
  await fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const NYT = new Date("2027-03-10T09:00:00Z");

function tarkistaRakenne(pohja: UutisPohja, nimi: string) {
  assert.ok(pohja.body.length > 0, `${nimi}: body`);
  for (const b of pohja.body) {
    assert.equal(b._type, "block", nimi);
    assert.equal(b.style, "normal", nimi);
    assert.ok(b._key, `${nimi}: blockin _key`);
    assert.deepEqual(b.markDefs, [], `${nimi}: markDefs`);
    for (const s of b.children) {
      assert.ok(s._key, `${nimi}: spanin _key`);
      assert.deepEqual(s.marks, [], `${nimi}: marks`);
    }
  }
  const avaimet = pohja.body.flatMap((b) => [b._key, ...b.children.map((s) => s._key)]);
  assert.equal(new Set(avaimet).size, avaimet.length, `${nimi}: avaimet uniikkeja`);
  for (const k of pohja.kategoriat) {
    assert.equal(k._type, "reference");
    assert.ok(k._key, `${nimi}: kategorian _key`);
  }
  assert.ok((pohja.excerpt ?? "").length <= 200, `${nimi}: Lyhenne enintään 200 merkkiä`);
  assert.equal(tarkistaTunnisteet(pohja.tunnisteet), true, `${nimi}: tunnisteet kelpaavat`);
  assert.ok(!Number.isNaN(Date.parse(pohja.publishedAt)), `${nimi}: julkaisuaika`);
}

/**
 * Studion getClient-korvike: kategoriakysely palauttaa annetut rivit,
 * ravintolakysely sen, onko tunnus julkaistujen joukossa. `virhe` kaataa haun.
 */
function konteksti(rivit: unknown[], { julkaistut = [] as string[], virhe = false } = {}) {
  const kutsut: Record<string, unknown>[] = [];
  const context = {
    getClient: () => ({
      fetch: async (kysely: string, params: Record<string, unknown>) => {
        if (virhe) throw new Error("verkkovirhe");
        if (kysely === RAVINTOLA_JULKAISTU_KYSELY) return julkaistut.includes(String(params.id));
        kutsut.push(params);
        return rivit;
      },
    }),
  } as unknown as InitialValueResolverContext;
  return { context, kutsut };
}

const HEIKKO = { _weak: true, _strengthenOnPublish: { type: "ravintola" } };

const KATEGORIAT = [
  { _id: "uutisKategoria-tapahtumaraportti", slug: "tapahtumaraportti", aiemmatPolut: ["jasentieto"] },
  { _id: "uutisKategoria-jalkapallo", slug: "jalkapallo" },
  { _id: "uutisKategoria-palloveikkaus", slug: "palloveikkaus" },
];

async function main() {
  await test("vuosikokouksen numero", () => {
    assert.equal(vuosikokousNumero(2026), 19);
    assert.equal(vuosikokousNumero(2027), 20);
  });

  await test("päivä ja vuosi Helsingin aikaa", () => {
    assert.equal(tamaPaiva(new Date("2026-10-08T21:30:00Z")), "2026-10-09", "keskiyön jälkeen Suomessa");
    assert.equal(tamaVuosi(new Date("2026-12-31T22:30:00Z")), 2027, "uudenvuodenyö");
    assert.equal(tamaVuosi(NYT), 2027);
  });

  await test("vuosikokouksen pohja: kentät ja avaimet", () => {
    const p = vuosikokousPohja(2027, "uutisKategoria-tapahtumaraportti", NYT);
    assert.equal(p.title, "Lahden Suomalainen Klubi ry - vuosikokous 2027");
    assert.ok(p.excerpt.startsWith("Lahden Suomalainen Klubi ry:n 20. vuosikokous"), p.excerpt);
    assert.equal(p.kategoriat.length, 1);
    assert.equal(p.kategoriat[0]._ref, "uutisKategoria-tapahtumaraportti");
    assert.equal(p.body.length, 4);
    assert.equal(p.body[0].children[0].text, p.excerpt, "ensimmäinen kappale on sama kuin Lyhenne");
    assert.equal(p.publishedAt, NYT.toISOString());
    assert.equal(p.kommentointi, undefined, "kenttien omat oletukset säilyvät");
    tarkistaRakenne(p, "vuosikokous");
  });

  await test("tapahtumatId null → kategoriat []", () => {
    assert.deepEqual(vuosikokousPohja(2027, null, NYT).kategoriat, []);
  });

  await test("palloveikkauksen tilanne ja uusi kausi", () => {
    const t = palloveikkausTilannePohja(2027, ["uutisKategoria-jalkapallo", "uutisKategoria-palloveikkaus"], NYT);
    assert.ok(t.title.startsWith("Palloveikkaus tilanne 2027 / "), t.title);
    assert.equal(t.kategoriat.length, 2);
    tarkistaRakenne(t, "tilanne");

    const k = palloveikkausKausiPohja(2027, ["uutisKategoria-jalkapallo", null], NYT);
    assert.equal(k.title, "Palloveikkaus 2027");
    assert.deepEqual(k.kommentointi, { kaytossa: true, tyyppi: "sarjajarjestys" });
    assert.equal(k.kategoriat.length, 1, "puuttuva kategoria jää pois");
    assert.ok(k.excerpt.includes("kauden 2027"));
    tarkistaRakenne(k, "kausi");
  });

  await test("pohjissa ei henkilötietoja (julkinen datasetti)", () => {
    const teksti = JSON.stringify([
      vuosikokousPohja(2027, null, NYT),
      palloveikkausTilannePohja(2027, [], NYT),
      palloveikkausKausiPohja(2027, [], NYT),
    ]);
    assert.doesNotMatch(teksti, /@|\+358|\b0\d{1,2}[ -]?\d{5,}/, "ei sähköpostia eikä puhelinnumeroa");
  });

  await test("taytettavatKohdat: 2 / 1 / 0 / 0 / 0", () => {
    assert.equal(taytettavatKohdat("Klo [täytä: kellonaika] paikassa [täytä: paikka].").length, 2);
    const pt = [
      { _type: "block", children: [{ _type: "span", text: "Kokous " }, { _type: "span", text: "[täytä: päivä]", marks: ["strong"] }] },
      { _type: "kuvasarja", kuvaus: "[täytä: ei tekstikappale]" },
    ];
    assert.deepEqual(taytettavatKohdat(pt), ["[täytä: päivä]"]);
    assert.equal(taytettavatKohdat("[1] viite").length, 0);
    assert.equal(taytettavatKohdat("(täytä)").length, 0);
    assert.equal(taytettavatKohdat(null).length, 0);
  });

  await test("kohta, joka on jaettu kahteen spaniin, löytyy (muotoilu kesken kohdan)", () => {
    const pt = [{ _type: "block", children: [{ _type: "span", text: "[täytä: " }, { _type: "span", text: "paikka]" }] }];
    assert.deepEqual(taytettavatKohdat(pt), ["[täytä: paikka]"]);
  });

  await test("isot kirjaimet: [Täytä: …] tunnistetaan", () => {
    assert.equal(taytettavatKohdat("[TÄYTÄ: x]").length, 1);
  });

  await test("TAYTA ilman g-lippua: sama syöte kahdesti peräkkäin tunnistetaan molemmilla kerroilla", () => {
    assert.equal(TAYTA.flags.includes("g"), false);
    const syote = "Kokous [täytä: päivä]";
    assert.equal(TAYTA.test(syote), true);
    assert.equal(TAYTA.test(syote), true, "ei lastIndex-tilaa");
    assert.notEqual(taytaVielaSaanto(syote), true);
    assert.notEqual(taytaVielaSaanto(syote), true, "sääntö toisella kerralla");
    assert.deepEqual(taytettavatKohdat(syote), taytettavatKohdat(syote));
  });

  await test("taytaVielaSaanto: virheteksti, puhdas teksti → true", () => {
    assert.equal(
      taytaVielaSaanto("Klo [täytä: kellonaika] [täytä: paikka]"),
      "Täytä vielä hakasulkeissa olevat kohdat: [täytä: kellonaika], [täytä: paikka]",
    );
    assert.equal(taytaVielaSaanto("Kokous pidetään lauantaina klo 11.30."), true);
    assert.equal(taytaVielaSaanto(undefined), true);
    assert.equal(taytaVielaSaanto([]), true);
  });

  await test("taytaVielaSaanto: pohjat sisältävät kohtia, paitsi uuden kauden otsikko ja Lyhenne", () => {
    const v = vuosikokousPohja(2027, null, NYT);
    const t = palloveikkausTilannePohja(2027, [], NYT);
    const k = palloveikkausKausiPohja(2027, [], NYT);
    assert.equal(taytaVielaSaanto(v.title), true, "vuosikokouksen otsikko valmis");
    assert.notEqual(taytaVielaSaanto(v.excerpt), true);
    assert.notEqual(taytaVielaSaanto(v.body), true);
    assert.notEqual(taytaVielaSaanto(t.title), true);
    assert.notEqual(taytaVielaSaanto(t.excerpt), true);
    assert.notEqual(taytaVielaSaanto(t.body), true);
    assert.equal(taytaVielaSaanto(k.title), true);
    assert.equal(taytaVielaSaanto(k.excerpt), true);
    assert.notEqual(taytaVielaSaanto(k.body), true);
  });

  await test("kategoriatSlugeilla: järjestys, aiempi polku, nykyinen slug voittaa, puuttuva pois", () => {
    assert.deepEqual(kategoriatSlugeilla(KATEGORIAT, ["palloveikkaus", "jalkapallo"]), [
      "uutisKategoria-palloveikkaus",
      "uutisKategoria-jalkapallo",
    ]);
    const nimetty = [{ _id: "uutisKategoria-tapahtumaraportti", slug: "tapahtumat", aiemmatPolut: ["tapahtumaraportti"] }];
    assert.deepEqual(kategoriatSlugeilla(nimetty, ["tapahtumaraportti"]), ["uutisKategoria-tapahtumaraportti"]);
    const kaksi = [
      { _id: "vanha", slug: "x", aiemmatPolut: ["tapahtumaraportti"] },
      { _id: "uusi", slug: "tapahtumaraportti" },
    ];
    assert.deepEqual(kategoriatSlugeilla(kaksi, ["tapahtumaraportti"]), ["uusi"]);
    assert.deepEqual(kategoriatSlugeilla([], ["jalkapallo"]), []);
  });

  await test("KATEGORIAT_KYSELY (groq-js): slug tai aiempi polku, ei luonnoksia eikä muita tyyppejä", async () => {
    const dataset = [
      { _id: "uutisKategoria-tapahtumaraportti", _type: "uutisKategoria", slug: { current: "tapahtumat" }, aiemmatPolut: ["tapahtumaraportti"] },
      { _id: "drafts.uutisKategoria-jalkapallo", _type: "uutisKategoria", slug: { current: "jalkapallo" } },
      { _id: "uutisKategoria-jalkapallo", _type: "uutisKategoria", slug: { current: "jalkapallo" } },
      { _id: "uutisKategoria-ravintola", _type: "uutisKategoria", slug: { current: "ravintola" } },
      { _id: "sivu-jalkapallo", _type: "sivu", slug: { current: "jalkapallo" } },
    ];
    const params = { slugit: ["tapahtumaraportti", "jalkapallo"] };
    const rivit = (await (await evaluate(parse(KATEGORIAT_KYSELY, { params }), { dataset, params })).get()) as {
      _id: string;
    }[];
    assert.deepEqual(rivit.map((r) => r._id).sort(), ["uutisKategoria-jalkapallo", "uutisKategoria-tapahtumaraportti"]);
  });

  await test("klubiArvio-ravintolalle: ravintola ilman drafts.-etuliitettä ja tämä päivä", () => {
    assert.deepEqual(klubiArvioPohja("drafts.ravintola-abc", new Date("2026-10-08T21:30:00Z")), {
      ravintola: { _type: "reference", _ref: "ravintola-abc" },
      paiva: "2026-10-09",
    });
  });

  await test("klubiArvio-ravintolalle: luonnosravintolaan heikko viittaus, joka vahvistuu julkaisussa", () => {
    assert.deepEqual(klubiArvioPohja("drafts.r1", NYT, false).ravintola, { _type: "reference", _ref: "r1", ...HEIKKO });
    assert.deepEqual(klubiArvioPohja("r1", NYT, true).ravintola, { _type: "reference", _ref: "r1" });
  });

  await test("RAVINTOLA_JULKAISTU_KYSELY (groq-js, published-näkökulma: luonnos ei riitä)", async () => {
    const dataset = [
      { _id: "r1", _type: "ravintola" },
      { _id: "drafts.r2", _type: "ravintola" },
    ];
    const julkaistut = dataset.filter((d) => !d._id.startsWith("drafts."));
    const aja = async (id: string) =>
      (await evaluate(parse(RAVINTOLA_JULKAISTU_KYSELY), { dataset: julkaistut, params: { id } })).get();
    assert.equal(await aja("r1"), true);
    assert.equal(await aja("r2"), false);
  });

  await test("sanity/pohjat: rekisteri, piilotetut ja suodatus", () => {
    const edelliset = [
      { id: "uutinen", title: "Uutinen", schemaType: "uutinen", value: {} },
      { id: "etusivu", title: "Etusivu", schemaType: "etusivu", value: {} },
      { id: "sivustonTila", title: "Sivuston tila", schemaType: "sivustonTila", value: {} },
      { id: "varmuuskopio", title: "Varmuuskopio", schemaType: "varmuuskopio", value: {} },
    ] as Template[];
    const tulos = pohjat(edelliset);
    assert.deepEqual(
      tulos.map((t) => t.id),
      [
        "uutinen",
        "lukittu-sivu",
        "uutinen-vuosikokous",
        "uutinen-palloveikkaus-tilanne",
        "uutinen-palloveikkaus-kausi",
        "klubiArvio-ravintolalle",
        "jalkapalloTilasto-kategoria",
        ...TILASTO_KATEGORIAT.map(({ value }) => tilastoPohjanId(value)),
      ],
    );
    // Parametria vaativat ja tilastoryhmän pohjat eivät näy Luo-valikossa.
    for (const t of tulos) {
      const ryhmanPohja = t.id.startsWith("tilasto-");
      assert.equal(PIILOTETUT_POHJAT.has(t.id), Boolean(t.parameters?.length) || ryhmanPohja, t.id);
    }
  });

  await test("tilastoryhmän pohjat: jokaisella kategorialla oma pohja valmiilla kategorialla", () => {
    // Sanity käyttää listan kohdan tunnusta pohjan tunnuksena (sanity/structure.ts),
    // joten jokaisen ryhmän kategorian pohjan on oltava rekisterissä omalla tunnuksellaan.
    const tulos = pohjat([]);
    for (const { value } of TILASTO_KATEGORIAT) {
      const pohja = tulos.find((t) => t.id === tilastoPohjanId(value));
      assert.ok(pohja, value);
      assert.equal(pohja.schemaType, "jalkapalloTilasto");
      assert.deepEqual(pohja.value, { category: value });
    }
    const rakenne = readFileSync(join(process.cwd(), "sanity", "structure.ts"), "utf8");
    assert.ok(rakenne.includes("initialValueTemplateItem(tilastoPohjanId(category))"), "rakenne käyttää kategorian pohjaa");
    assert.ok(!/initialValueTemplateItem\([^)]*\)\s*\.id\(/.test(rakenne), "listan kohdan .id() muuttaisi pohjan tunnuksen");
  });

  await test("jalkapalloTilasto-kategoria: kategoria valmiina, tuntematon jätetään valitsematta", () => {
    const pohja = pohjat([]).find((t) => t.id === "jalkapalloTilasto-kategoria")!;
    assert.equal(pohja.schemaType, "jalkapalloTilasto");
    const arvo = pohja.value as (p: { category: string }) => Record<string, unknown>;
    assert.deepEqual(arvo({ category: "karsinta" }), { category: "karsinta" });
    assert.deepEqual(arvo({ category: "vanha-arvo" }), {});
  });

  await test("sanity/pohjat: arvot haetaan kategorioineen (getClient)", async () => {
    const tulos = pohjat([]);
    const pohja = (id: string) => tulos.find((t) => t.id === id)!;
    const arvo = async (id: string, rivit: unknown[]) => {
      const { context, kutsut } = konteksti(rivit);
      const v = pohja(id).value as (p: unknown, c: InitialValueResolverContext) => Promise<UutisPohja>;
      return { tulos: await v({}, context), kutsut };
    };

    const v = await arvo("uutinen-vuosikokous", KATEGORIAT);
    assert.deepEqual(v.kutsut, [{ slugit: [...POHJAN_KATEGORIAT.vuosikokous] }]);
    assert.deepEqual(v.tulos.kategoriat.map((k) => k._ref), ["uutisKategoria-tapahtumaraportti"]);
    assert.match(v.tulos.title, /^Lahden Suomalainen Klubi ry - vuosikokous \d{4}$/);

    const ilman = await arvo("uutinen-vuosikokous", []);
    assert.deepEqual(ilman.tulos.kategoriat, [], "kategoriaa ei löydy: pohja toimii silti");

    const t = await arvo("uutinen-palloveikkaus-tilanne", KATEGORIAT);
    assert.deepEqual(t.tulos.kategoriat.map((k) => k._ref), ["uutisKategoria-jalkapallo", "uutisKategoria-palloveikkaus"]);
    const k = await arvo("uutinen-palloveikkaus-kausi", KATEGORIAT);
    assert.equal(k.tulos.kommentointi?.tyyppi, "sarjajarjestys");

    const arvio = pohja("klubiArvio-ravintolalle").value as (
      p: { ravintolaId: string },
      c: InitialValueResolverContext,
    ) => Promise<{ ravintola: Record<string, unknown> }>;
    const julkaistuun = await arvio({ ravintolaId: "drafts.r1" }, konteksti([], { julkaistut: ["r1"] }).context);
    assert.deepEqual(julkaistuun.ravintola, { _type: "reference", _ref: "r1" }, "julkaistu: vahva viittaus");
    const luonnokseen = await arvio({ ravintolaId: "r2" }, konteksti([], { julkaistut: ["r1"] }).context);
    assert.deepEqual(luonnokseen.ravintola, { _type: "reference", _ref: "r2", ...HEIKKO }, "vain luonnos");
    const virheessa = await arvio({ ravintolaId: "r1" }, konteksti([], { virhe: true }).context);
    assert.deepEqual(virheessa.ravintola, { _type: "reference", _ref: "r1", ...HEIKKO }, "virhe: heikko, toimii molemmissa");
  });

  await test("sanity/pohjat: kategoriahaun virhe → pohja ilman kategoriaa", async () => {
    const { context } = konteksti(KATEGORIAT, { virhe: true });
    for (const id of ["uutinen-vuosikokous", "uutinen-palloveikkaus-tilanne", "uutinen-palloveikkaus-kausi"]) {
      const v = pohjat([]).find((t) => t.id === id)!.value as (p: unknown, c: InitialValueResolverContext) => Promise<UutisPohja>;
      const tulos = await v({}, context);
      assert.deepEqual(tulos.kategoriat, [], id);
      assert.ok(tulos.title.length > 0 && tulos.body.length > 0, id);
    }
  });

  await test("Sanityn resolveInitialValue: pohja kelpaa ja kenttien omat oletukset säilyvät", async () => {
    // Sanity ajoittaa kenttien oletukset selaimen window.scheduleriin; Nodessa riittää tyhjä window.
    (globalThis as { window?: unknown }).window ??= globalThis;
    const schema = createSchema({ name: "testi", types: schemaTypes });
    const { context } = konteksti(KATEGORIAT, { julkaistut: ["r1"] });
    const ctx = { ...context, schema, currentUser: null, projectId: "p", dataset: "d" } as InitialValueResolverContext;
    const tulos = pohjat([]);
    const ratkaise = (id: string, params: Record<string, unknown> = {}) =>
      resolveInitialValue(schema, tulos.find((t) => t.id === id)!, params, ctx) as Promise<Record<string, unknown>>;

    const kausi = await ratkaise("uutinen-palloveikkaus-kausi");
    assert.deepEqual(kausi.kommentointi, { kaytossa: true, tyyppi: "sarjajarjestys", sijoituksia: 4, maalikuningas: true });
    assert.equal(kausi._type, "uutinen");
    const kokous = await ratkaise("uutinen-vuosikokous");
    assert.equal((kokous.kommentointi as { kaytossa: boolean }).kaytossa, false, "kentän oletus ilman pohjan arvoa");
    assert.equal(kokous.needsReview, false);
    assert.equal(kokous.slug, undefined, "osoite luodaan otsikosta (Luo)");
    const arvio = await ratkaise("klubiArvio-ravintolalle", { ravintolaId: "drafts.r1" });
    assert.deepEqual(arvio.ravintola, { _type: "reference", _ref: "r1" });
    assert.match(String(arvio.paiva), /^\d{4}-\d{2}-\d{2}$/);
    // Sanity hyväksyy heikon viittauksen kentät pohjan arvossa (ALLOWED_REF_PROPS).
    const luonnos = await ratkaise("klubiArvio-ravintolalle", { ravintolaId: "r2" });
    assert.deepEqual(luonnos.ravintola, { _type: "reference", _ref: "r2", ...HEIKKO });
  });

  await test("uutinen.ts: [täytä]-sääntö otsikossa, Lyhenteessä ja tekstissä", () => {
    const lahde = readFileSync(join(process.cwd(), "sanity/schemas/documents/uutinen.ts"), "utf8");
    assert.equal(lahde.match(/rule\.custom\(taytaVielaSaanto\)/g)?.length, 3);
  });

  console.log(`\n${ok} testiä ok`);
}

main().catch((virhe) => {
  console.error(virhe);
  process.exit(1);
});
