/**
 * Sivuston tilan säännöt Studion Aloitukseen (lib/sivuston-tila.ts, docs/24 askel 7).
 * Aika: nyt = 2026-10-08T12:00Z (Helsingissä to 8.10. klo 15.00).
 *
 * Ajo: npm run test:sivuston-tila
 */
import assert from "node:assert/strict";

import {
  ajankohta,
  DATASETIT,
  huoltoajonKirjaus,
  huollonTila,
  ikaPaivina,
  julkaisemattomienTila,
  KIINTIO,
  kiintionTila,
  kokonaistila,
  luku,
  otteluhaunTila,
  otteluhaunViesti,
  puuttuvatPerustiedot,
  pvmSuomeksi,
  TILA_ID,
  varmuuskopionTila,
  type AjonTulos,
  type TilaRivi,
} from "../lib/sivuston-tila";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const NYT = new Date("2026-10-08T12:00:00Z");
const NBSP = String.fromCharCode(0xa0);
const tunteja = (n: number) => new Date(NYT.getTime() - n * 3_600_000).toISOString();

const huolto = (tulokset: AjonTulos[], muuta: Record<string, unknown> = {}) => ({
  aika: "2026-10-08T02:02:00Z", // klo 5.02 Helsingissä
  onnistui: true,
  viimeisinOnnistunut: "2026-10-08T02:02:00Z",
  tulokset,
  ...muuta,
});
const perus: AjonTulos[] = [
  { nimi: "arvosanat", tila: "ok", viesti: "Korjattu 0", maara: 0 },
  { nimi: "kuvat", tila: "ok", viesti: "Poistettu 0 vanhaa arvostelukuvaa", maara: 0 },
  { nimi: "tiedostot", tila: "ok", viesti: "Ei käyttämättömiä tiedostoja.", maara: 0 },
  { nimi: "otteluhaku", tila: "ok", viesti: "Veikkausliiga: 198 ottelua, joista 12 tulevaa", maara: 198 },
];

test("tunnukset ja vakiot", () => {
  assert.deepEqual(TILA_ID, { huolto: "sivustonTila.huolto", varmuuskopio: "sivustonTila.varmuuskopio" });
  assert.equal(KIINTIO, 10_000);
  assert.deepEqual([...DATASETIT], ["production", "development"]);
});

test("apurit: päivät, kellonaika ja luvut suomeksi", () => {
  assert.equal(pvmSuomeksi("2026-10-05"), "ma 5.10.2026");
  assert.equal(ikaPaivina("2026-10-05", NYT), 3);
  // Helsingin päivä: 7.10. klo 23.30 UTC on jo 8.10. Helsingissä.
  assert.equal(ikaPaivina("2026-10-07T23:30:00Z", NYT), 0);
  assert.equal(ajankohta(new Date("2026-10-08T02:02:00Z"), NYT), "tänä aamuna klo 5.02");
  assert.equal(ajankohta(new Date("2026-10-08T11:10:00Z"), NYT), "tänään klo 14.10");
  assert.equal(ajankohta(new Date("2026-10-07T02:02:00Z"), NYT), "eilen klo 5.02");
  assert.equal(ajankohta(new Date("2026-10-05T01:00:00Z"), NYT), "ma 5.10.2026 klo 4.00");
  assert.equal(luku(7679), `7${NBSP}679`);
  assert.equal(luku(10_000), `10${NBSP}000`);
  assert.equal(luku(999), "999");
});

test("varmuuskopio: enintään 8 päivää vanha on ok", () => {
  const r = varmuuskopionTila({ paiva: "2026-10-05", dokumentteja: 5544 }, null, NYT);
  assert.equal(r.tila, "ok");
  assert.equal(r.teksti, `Viimeisin kopio ma 5.10.2026 (3 päivää sitten), 5${NBSP}544 dokumenttia.`);
  assert.equal(varmuuskopionTila({ paiva: "2026-09-30" }, null, NYT).tila, "ok", "tasan 8 päivää");
  assert.equal(varmuuskopionTila({ paiva: "2026-10-08" }, null, NYT).teksti, "Viimeisin kopio to 8.10.2026 (tänään).");
});

test("varmuuskopio: yli 8 päivää tai ei kopiota on virhe ohjeineen", () => {
  const r = varmuuskopionTila({ paiva: "2026-09-29", dokumentteja: 5000 }, null, NYT);
  assert.equal(r.tila, "virhe");
  assert.equal(r.teksti, "Viikkovarmuuskopiota ei ole tehty 9 päivään.");
  assert.match(r.ohje ?? "", /Vercel → Cron Jobs → \/api\/varmuuskopio/);
  assert.match(r.ohje ?? "", /Sisältösi on tallessa/);
  assert.doesNotMatch(r.ohje ?? "", /tukihenkilö/, "repo on julkinen: kehittäjä, ei nimiä");
  assert.equal(varmuuskopionTila(null, null, NYT).tila, "virhe");
});

test("varmuuskopio: epäonnistunut ajo uudempi kuin kopio on virhe", () => {
  const ajo = {
    aika: "2026-10-05T01:00:30Z",
    onnistui: false,
    viimeisinOnnistunut: "2026-09-28T01:00:30Z",
    tulokset: [{ nimi: "varmuuskopio", tila: "virhe" as const, viesti: "Export API: HTTP 403" }],
  };
  const r = varmuuskopionTila({ paiva: "2026-09-28", dokumentteja: 5500 }, ajo, NYT);
  assert.equal(r.tila, "virhe");
  assert.equal(r.teksti, "Viikkovarmuuskopio epäonnistui ma 5.10.2026 klo 4.00: Export API: HTTP 403.");
  // Vanhempi epäonnistuminen ei peitä tuoretta onnistunutta kopiota.
  const vanha = { ...ajo, aika: "2026-09-28T01:00:00Z" };
  assert.equal(varmuuskopionTila({ paiva: "2026-10-05" }, vanha, NYT).tila, "ok");
});

test("varmuuskopio: kopio tallessa mutta vanhojen kierto epäonnistui → huomio, ei virhe", () => {
  const ajo = {
    aika: "2026-10-05T01:00:30Z",
    onnistui: true,
    tulokset: [
      { nimi: "varmuuskopio", tila: "ok" as const, viesti: "5544 dokumenttia", maara: 5544 },
      { nimi: "kierto", tila: "huomio" as const, viesti: "Vanhojen kopioiden poisto epäonnistui: HTTP 429" },
    ],
  };
  const r = varmuuskopionTila({ paiva: "2026-10-05", dokumentteja: 5544 }, ajo, NYT);
  assert.equal(r.tila, "huomio");
  assert.match(r.teksti, /^Viimeisin kopio ma 5\.10\.2026 \(3 päivää sitten\).* Vanhojen kopioiden poisto epäonnistui: HTTP 429\.$/);
  // Vanhempi ajo ei koske uudempaa kopiota.
  assert.equal(varmuuskopionTila({ paiva: "2026-10-06" }, ajo, NYT).tila, "ok");
});

test("huolto: tuntematon ennen ensimmäistä ajoa", () => {
  const r = huollonTila(null, NYT);
  assert.equal(r.tila, "tuntematon");
  assert.match(r.teksti, /ensimmäisen yön jälkeen/);
});

test("huolto: ok-teksti", () => {
  const r = huollonTila(huolto(perus), NYT);
  assert.equal(r.tila, "ok");
  assert.equal(
    r.teksti,
    "Viimeksi tänä aamuna klo 5.02. Arvosanoja korjattu 0, vanhoja arvostelukuvia poistettu 0, käyttämättömiä tiedostoja poistettu 0.",
  );
});

test("huolto: yli 30 tuntia vanha on virhe (myös kirjoitustokenin oikeuksien menetys)", () => {
  assert.equal(huollonTila(huolto(perus, { aika: tunteja(29) }), NYT).tila, "ok");
  const r = huollonTila(huolto(perus, { aika: tunteja(31) }), NYT);
  assert.equal(r.tila, "virhe");
  assert.equal(r.teksti, "Yöllinen huolto ei ole käynyt 1 vuorokauteen.");
  assert.equal(huollonTila(huolto(perus, { aika: tunteja(50) }), NYT).teksti, "Yöllinen huolto ei ole käynyt 2 vuorokauteen.");
  assert.match(r.ohje ?? "", /Kerro kehittäjälle/);
});

test("huolto: korjatut arvosanat → huomio", () => {
  const tulokset = perus.map((t) => (t.nimi === "arvosanat" ? { ...t, tila: "huomio" as const, maara: 2 } : t));
  const r = huollonTila(huolto(tulokset), NYT);
  assert.equal(r.tila, "huomio");
  assert.match(r.teksti, /korjaamaan 2 ravintolan arvosanan/);
});

test("huolto: tiedostojen poiston virhe → huomio, ei virhe", () => {
  const tulokset = perus.map((t) =>
    t.nimi === "tiedostot" ? { ...t, tila: "huomio" as const, viesti: "1 tiedoston poisto epäonnistui." } : t,
  );
  const r = huollonTila(huolto(tulokset), NYT);
  assert.equal(r.tila, "huomio");
  assert.equal(r.teksti, "Huolto tänä aamuna klo 5.02: 1 tiedoston poisto epäonnistui.");
});

test("huolto: epäonnistunut ajo on virhe, otteluhaku ei vaikuta", () => {
  const tulokset: AjonTulos[] = [
    { nimi: "arvosanat", tila: "virhe", viesti: "Arvosanojen laskenta epäonnistui: Insufficient permissions." },
    ...perus.slice(1).map((t) => (t.nimi === "otteluhaku" ? { ...t, tila: "virhe" as const, viesti: "Aikakatkaisu" } : t)),
  ];
  const r = huollonTila(huolto(tulokset, { onnistui: false }), NYT);
  assert.equal(r.tila, "virhe");
  assert.equal(
    r.teksti,
    "Huolto epäonnistui tänä aamuna klo 5.02: Arvosanojen laskenta epäonnistui: Insufficient permissions.",
  );
  // Pelkkä otteluhaun virhe ei tee huollosta huomiota.
  const vainHaku = perus.map((t) => (t.nimi === "otteluhaku" ? { ...t, tila: "virhe" as const, viesti: "HTTP 500" } : t));
  assert.equal(huollonTila(huolto(vainHaku), NYT).tila, "ok");
});

test("otteluhaku: ok, virhe ohjeineen, kauden aikana 0 → huomio, talvella 0 → ok", () => {
  const ok1 = otteluhaunTila(huolto(perus), NYT);
  assert.equal(ok1.tila, "ok");
  assert.equal(ok1.teksti, "Veikkausliiga: 198 ottelua, joista 12 tulevaa.");
  assert.equal(otteluhaunViesti("Taso", 5, 1), "Taso: 5 ottelua, joista 1 tulevaa");

  const virhe = perus.map((t) => (t.nimi === "otteluhaku" ? { ...t, tila: "virhe" as const, viesti: "Aikakatkaisu", maara: 0 } : t));
  const v = otteluhaunTila(huolto(virhe), NYT);
  assert.equal(v.tila, "virhe");
  assert.equal(v.teksti, "Otteluohjelman haku epäonnistui: Aikakatkaisu.");
  assert.equal(
    v.ohje,
    "Ottelut-sivulla ja etusivulla näkyvät vain Studioon lisätyt ottelut. Lisää tärkeät ottelut käsin (Ottelut → +) ja kerro kehittäjälle.",
  );

  const tyhja = perus.map((t) => (t.nimi === "otteluhaku" ? { ...t, maara: 0, viesti: "Veikkausliiga: 0 ottelua, joista 0 tulevaa" } : t));
  assert.equal(otteluhaunTila(huolto(tyhja), NYT).tila, "huomio", "lokakuu");
  assert.equal(otteluhaunTila(huolto(tyhja), new Date("2026-03-15T12:00:00Z")).tila, "huomio", "maaliskuu");
  const talvi = otteluhaunTila(huolto(tyhja), new Date("2026-12-15T12:00:00Z"));
  assert.equal(talvi.tila, "ok");
  assert.match(talvi.teksti, /^Talvitauko: /);
  assert.equal(otteluhaunTila(huolto(tyhja), new Date("2027-02-10T12:00:00Z")).tila, "ok", "helmikuu");
  assert.equal(otteluhaunTila(huolto(tyhja), new Date("2026-11-01T12:00:00Z")).tila, "ok", "marraskuu");
  assert.equal(otteluhaunTila(null, NYT).tila, "tuntematon");
});

test("kiintiö on aina arvio: alle 80 % tuntematon, sen yli enintään huomio (ei koskaan virhe eikä ok)", () => {
  const alle = kiintionTila(7679, KIINTIO);
  assert.equal(alle.tila, "tuntematon");
  assert.equal(alle.teksti, `Arviolta 7${NBSP}679 / 10${NBSP}000 dokumenttia (77 %).`);
  assert.match(alle.otsikko, /arvio/);
  assert.equal(kiintionTila(8000, KIINTIO).tila, "huomio", "80 %");
  const lahes = kiintionTila(9900, KIINTIO);
  assert.equal(lahes.tila, "huomio", "99 % → huomio, ei virhe");
  assert.match(lahes.ohje ?? "", /docs\/23 Y4/);
  assert.equal(kiintionTila(12_000, KIINTIO).tila, "huomio", "yli rajan → yhä huomio");
  for (const n of [0, 5000, 7999, 8000, 9500, 9999, 10_000, 20_000]) {
    const t = kiintionTila(n, KIINTIO).tila;
    assert.ok(t === "tuntematon" || t === "huomio", `${n}: ${t}`);
    assert.match(kiintionTila(n, KIINTIO).teksti, /^Arviolta /);
  }
  assert.match(kiintionTila(3900, KIINTIO, { vainTamaDatasetti: true }).teksti, /\(vain tämä datasetti\)\.$/);
  assert.equal(kiintionTila(null).tila, "tuntematon");
});

test("julkaisemattomat", () => {
  assert.deepEqual(julkaisemattomienTila(0), {
    id: "julkaisemattomat",
    otsikko: "Julkaisemattomat muutokset",
    tila: "ok",
    teksti: "Kaikki muutokset on julkaistu.",
  });
  assert.equal(julkaisemattomienTila(1).tila, "huomio");
  assert.match(julkaisemattomienTila(1).teksti, /^Yhdessä dokumentissa/);
  assert.match(julkaisemattomienTila(4).teksti, /^4 dokumentissa on muutos/);
});

test("kokonaistila: pahin tila, tuntematon ei nosta", () => {
  const r = (tila: TilaRivi["tila"]): TilaRivi => ({ id: tila, otsikko: tila, tila, teksti: "" });
  assert.equal(kokonaistila([r("ok"), r("tuntematon")]), "ok");
  assert.equal(kokonaistila([r("ok"), r("huomio"), r("tuntematon")]), "huomio");
  assert.equal(kokonaistila([r("huomio"), r("virhe"), r("ok")]), "virhe");
  assert.equal(kokonaistila([r("tuntematon")]), "tuntematon");
  assert.equal(kokonaistila([]), "tuntematon");
  // Kiintiön arvio ei koskaan tee kokonaistilasta punaista.
  assert.equal(kokonaistila([r("ok"), kiintionTila(9999, KIINTIO)]), "huomio");
});

test("huoltoajonKirjaus", () => {
  const nyt = new Date("2026-10-08T02:02:00Z");
  const onnistui = huoltoajonKirjaus(perus.slice(0, 1), true, nyt);
  assert.deepEqual(onnistui, {
    aika: "2026-10-08T02:02:00.000Z",
    onnistui: true,
    tulokset: [{ _key: "arvosanat", nimi: "arvosanat", tila: "ok", viesti: "Korjattu 0", maara: 0 }],
    viimeisinOnnistunut: "2026-10-08T02:02:00.000Z",
  });
  const epaonnistui = huoltoajonKirjaus([{ nimi: "varmuuskopio", tila: "virhe", viesti: "x" }], false, nyt);
  assert.equal(epaonnistui.onnistui, false);
  assert.ok(!("viimeisinOnnistunut" in epaonnistui), "edellinen onnistunut säilyy dokumentissa");
});

test("puuttuvat perustiedot", () => {
  assert.deepEqual(
    puuttuvatPerustiedot({ sahkoposti: false, osoite: false, puhelin: false, hallitus: 0, esittelykuva: false }).map(
      (p) => p.teksti,
    ),
    [
      "Klubin sähköpostiosoite puuttuu (Yhteystiedot).",
      "Postiosoite puuttuu (Yhteystiedot).",
      "Puhelinnumero puuttuu (Yhteystiedot).",
      "Hallituksen jäseniä ei ole lisätty (Hallitus).",
      "Etusivun Klubista-lohkosta puuttuu kuva (Etusivu → Lohkot).",
    ],
  );
  assert.deepEqual(puuttuvatPerustiedot({ sahkoposti: true, osoite: true, puhelin: true, hallitus: 5, esittelykuva: true }), []);
  // Tuntematon (null) ei ole puuttuva.
  assert.deepEqual(puuttuvatPerustiedot({ sahkoposti: null, hallitus: null, esittelykuva: null }), []);
  assert.deepEqual(puuttuvatPerustiedot(null), []);
  assert.deepEqual(
    puuttuvatPerustiedot({ sahkoposti: true, osoite: true, puhelin: true, hallitus: 0, esittelykuva: false }).map((p) => p.kohde),
    ["hallitus", "etusivu"],
  );
});

console.log(`\n${ok} testiä ok`);
