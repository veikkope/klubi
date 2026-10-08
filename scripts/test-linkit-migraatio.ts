/**
 * Linkkien migraation säännöt (scripts/lib/linkit-migraatio.ts, docs/24 askel 5):
 * osoite muuttuu viittaukseksi vain, kun polku ratkeaa yksiselitteisesti
 * julkaistuun dokumenttiin; kaikki muut saavat tyypin Muu osoite; kävijän
 * osoite ei muutu; ajo kahdesti ei muuta mitään.
 *
 * Ajo: npm run test:linkit-migraatio
 */
import assert from "node:assert/strict";

import type { LinkinKohde } from "../lib/linkki";
import { LITMANEN_PATH } from "../lib/path";
import {
  arvoPolussa,
  dokumentinMuutokset,
  jasennaPolku,
  linkitIlmanTyyppia,
  linkkienOsoitteet,
  miksiOsoite,
  muunnaLinkki,
  muuttuneetOsoitteet,
  rakennaHakemisto,
  ratkaisePolku,
  sovellaOperaatiot,
  tekstinLinkkienMuutokset,
  type HakemistonKohde,
  type Ratkaisu,
} from "./lib/linkit-migraatio";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const kohde = (_type: string, slug: string, piilossa = false): HakemistonKohde => ({
  _id: `${_type}-${slug.replaceAll("/", "-")}`,
  _type,
  slug,
  nimi: slug,
  piilossa,
});

const RIVIT: HakemistonKohde[] = [
  kohde("sivu", "klubi"),
  kohde("sivu", "klubi/toiminta"),
  kohde("sivu", "jalkapalloarkisto"),
  kohde("sivu", "jalkapalloarkisto/arvokisat"),
  kohde("klubiToiminta", "matkailu"),
  kohde("arvokisa", "em-2008"),
  kohde("pelaaja", "jari-litmanen"),
  kohde("uutinen", "2008-07-21-ateena"),
  kohde("uutinen", "2099-01-01-ajastettu", true),
  // Monitulkintainen: uutinen ja sivu samalla polulla.
  kohde("uutinen", "kaksi"),
  kohde("sivu", "uutiset/kaksi"),
  // Luonnos ei kelpaa kohteeksi.
  { ...kohde("sivu", "luonnos"), _id: "drafts.sivu-luonnos" },
];
const hakemisto = rakennaHakemisto(RIVIT);
const ratkaisu: Ratkaisu = {
  kohteet: new Map(RIVIT.filter((r) => !r._id.startsWith("drafts.")).map((r) => [r._id, r as LinkinKohde])),
  tiedostot: new Map(),
};
const viittaus = (_ref: string) => ({ tyyppi: "sivu", kohde: { _type: "reference", _ref } });

/** Muunnos, toinen ajo ja kävijän osoitteet. */
function muunna<T extends Record<string, unknown>>(doc: T, h = hakemisto) {
  const { operaatiot, muutokset } = dokumentinMuutokset(doc, h);
  const uusi = sovellaOperaatiot(doc, operaatiot);
  assert.deepEqual(muuttuneetOsoitteet(doc, uusi, ratkaisu), [], "kävijän osoite ei saa muuttua");
  assert.deepEqual(linkitIlmanTyyppia(uusi), [], "jokaisella linkillä on tyyppi");
  assert.deepEqual(dokumentinMuutokset(uusi, h).operaatiot, [], "toinen ajo ei muuta mitään");
  return { uusi, operaatiot, muutokset };
}

test("muunnaLinkki: sivuston oma polku → viittaus julkaistuun dokumenttiin", () => {
  assert.deepEqual(muunnaLinkki({ href: "/klubi" }, hakemisto), viittaus("sivu-klubi"));
  assert.deepEqual(muunnaLinkki({ href: "/klubi/toiminta/matkailu" }, hakemisto), viittaus("klubiToiminta-matkailu"));
  assert.deepEqual(muunnaLinkki({ href: "/jalkapalloarkisto/arvokisat/em-2008" }, hakemisto), viittaus("arvokisa-em-2008"));
  assert.deepEqual(muunnaLinkki({ href: LITMANEN_PATH }, hakemisto), viittaus("pelaaja-jari-litmanen"));
  assert.deepEqual(muunnaLinkki({ url: "/uutiset/2008-07-21-ateena" }, hakemisto), viittaus("uutinen-2008-07-21-ateena"));
});

test('muunnaLinkki: "/ottelut" ilman dokumenttia → osoite; kun sivu-ottelut on olemassa → viittaus', () => {
  assert.deepEqual(muunnaLinkki({ href: "/ottelut" }, hakemisto), { tyyppi: "osoite" });
  const laajempi = rakennaHakemisto([...RIVIT, kohde("sivu", "ottelut")]);
  assert.deepEqual(muunnaLinkki({ href: "/ottelut" }, laajempi), viittaus("sivu-ottelut"));
  // Ajo P3:n jälkeen: aiemmin osoitteeksi jäänyt muuttuu nyt viittaukseksi.
  assert.deepEqual(muunnaLinkki({ tyyppi: "osoite", href: "/ottelut" }, laajempi), viittaus("sivu-ottelut"));
  assert.equal(muunnaLinkki({ tyyppi: "osoite", href: "/ottelut" }, hakemisto), null);
});

test("muunnaLinkki: ankkurit, kyselyt, ulkoiset ja ratkeamattomat jäävät osoitteiksi", () => {
  for (const href of [
    "#",
    "#mitalistit",
    "/jalkapalloarkisto/arvokisat#em-kisojen-mitalistit",
    "/klubi?sivu=2",
    "/klubi/",
    "/uutiset/arkisto/2016",
    "https://www.palloliitto.fi",
    "http://www.youtube.com/watch?v=TKPfLOSz3DA",
    "mailto:a@b.fi",
    "www.x.fi",
    "//klubi",
  ]) {
    assert.deepEqual(muunnaLinkki({ href }, hakemisto), { tyyppi: "osoite" }, href);
  }
  assert.equal(miksiOsoite("/jalkapalloarkisto/arvokisat#em", hakemisto), "ankkuri tai kysely");
  assert.equal(miksiOsoite("/uutiset/arkisto/2016", hakemisto), "ei julkaistua dokumenttia");
  assert.equal(miksiOsoite("https://x.fi", hakemisto), "ulkoinen");
});

test("muunnaLinkki: YouTube-url klubin toiminnasta kopioidaan href-kenttään", () => {
  assert.deepEqual(muunnaLinkki({ url: "https://youtu.be/lKIb8wsb0MA" }, hakemisto), {
    tyyppi: "osoite",
    href: "https://youtu.be/lKIb8wsb0MA",
  });
});

test("muunnaLinkki: vain yksiselitteinen, julkaistu ja näkyvä kohde kelpaa", () => {
  assert.equal(ratkaisePolku("/uutiset/kaksi", hakemisto), null, "uutinen ja sivu samalla polulla");
  assert.equal(miksiOsoite("/uutiset/kaksi", hakemisto), "monitulkintainen");
  assert.deepEqual(muunnaLinkki({ href: "/uutiset/kaksi" }, hakemisto), { tyyppi: "osoite" });
  assert.deepEqual(muunnaLinkki({ href: "/uutiset/2099-01-01-ajastettu" }, hakemisto), { tyyppi: "osoite" }, "ajastettu");
  assert.deepEqual(muunnaLinkki({ href: "/luonnos" }, hakemisto), { tyyppi: "osoite" }, "vain luonnos");
  const tuplat = rakennaHakemisto([kohde("sivu", "klubi"), { ...kohde("sivu", "klubi"), _id: "toinen" }]);
  assert.equal(ratkaisePolku("/klubi", tuplat), null, "kaksi julkaistua samalla slugilla");
});

test("muunnaLinkki: uuteen välilehteen avautuva tai tekstitön vuoden linkki jää osoitteeksi", () => {
  // Viittaus muuttaisi kävijän näkemää: uusi välilehti katoaisi tai tekstin tilalle tulisi kohteen nimi.
  assert.deepEqual(muunnaLinkki({ href: "/klubi", newTab: true }, hakemisto), { tyyppi: "osoite" });
  assert.deepEqual(muunnaLinkki({ url: "/klubi", ilmanTekstia: true }, hakemisto), { tyyppi: "osoite", href: "/klubi" });
  assert.deepEqual(muunnaLinkki({ href: "/klubi", newTab: false }, hakemisto), {
    tyyppi: "sivu",
    kohde: { _type: "reference", _ref: "sivu-klubi" },
  });
});

test("muunnaLinkki: jo muunnettu tai tyhjä → null", () => {
  assert.equal(muunnaLinkki({ tyyppi: "sivu", href: "/klubi" }, hakemisto), null);
  assert.equal(muunnaLinkki({ tyyppi: "tiedosto" }, hakemisto), null);
  assert.equal(muunnaLinkki({ tyyppi: "osoite", href: "https://x.fi" }, hakemisto), null);
  assert.equal(muunnaLinkki({}, hakemisto), null);
  assert.equal(muunnaLinkki(null, hakemisto), null);
});

test("tekstinLinkkienMuutokset: sisäinen, ulkoinen ja sisäkkäinen linkki; avain, href ja newTab säilyvät", () => {
  const doc = {
    _id: "klubiToiminta-x",
    _type: "klubiToiminta",
    body: [
      {
        _key: "b1",
        _type: "block",
        children: [],
        markDefs: [
          { _key: "m1", _type: "link", href: "/klubi" },
          { _key: "m2", _type: "link", href: "https://www.palloliitto.fi", newTab: true },
        ],
      },
      { _key: "b2", _type: "block", children: [], markDefs: [{ _key: "m3", _type: "link", href: "/klubi?x=1" }] },
      { _key: "k1", _type: "imageWithAlt" },
    ],
    vuodet: [
      {
        _key: "v1",
        kuvaus: [
          { _key: "b3", _type: "block", markDefs: [{ _key: "m4", _type: "link", href: "/klubi/toiminta", newTab: true }] },
        ],
      },
    ],
  };
  const tulos = tekstinLinkkienMuutokset(doc, hakemisto);
  assert.deepEqual(tulos, [
    { polku: 'body[_key=="b1"].markDefs[_key=="m1"]', uusi: { _key: "m1", _type: "link", href: "/klubi", ...viittaus("sivu-klubi") } },
    {
      polku: 'body[_key=="b1"].markDefs[_key=="m2"]',
      uusi: { _key: "m2", _type: "link", href: "https://www.palloliitto.fi", newTab: true, tyyppi: "osoite" },
    },
    { polku: 'body[_key=="b2"].markDefs[_key=="m3"]', uusi: { _key: "m3", _type: "link", href: "/klubi?x=1", tyyppi: "osoite" } },
    {
      polku: 'vuodet[_key=="v1"].kuvaus[_key=="b3"].markDefs[_key=="m4"]',
      // Uuteen välilehteen avautuva sisäinen linkki jää osoitteeksi: viittaus avautuisi samaan välilehteen.
      uusi: { _key: "m4", _type: "link", href: "/klubi/toiminta", newTab: true, tyyppi: "osoite" },
    },
  ]);
  muunna(doc);
});

test("valikko: koko items-taulukko uudelleen, href ja muut kentät säilyvät", () => {
  const nav = {
    _id: "navigaatio",
    _type: "navigaatio",
    items: [
      {
        _key: "jalkapallo",
        label: "Jalkapallo",
        href: "/jalkapalloarkisto",
        highlight: false,
        children: [
          { _key: "j1", label: "Arvokisat", href: "/jalkapalloarkisto/arvokisat" },
          { _key: "j2", label: "Litmanen", href: LITMANEN_PATH },
        ],
      },
      { _key: "ottelut", label: "Ottelut", href: "/ottelut" },
      { _key: "ulkoinen", label: "Palloliitto", href: "https://www.palloliitto.fi" },
    ],
  };
  const { uusi, operaatiot, muutokset } = muunna(nav);
  assert.deepEqual(operaatiot.map((o) => [o.tyyppi, o.polku]), [["set", "items"]]);
  assert.deepEqual(uusi.items[0], {
    _key: "jalkapallo",
    label: "Jalkapallo",
    href: "/jalkapalloarkisto",
    highlight: false,
    ...viittaus("sivu-jalkapalloarkisto"),
    children: [
      { _key: "j1", label: "Arvokisat", href: "/jalkapalloarkisto/arvokisat", ...viittaus("sivu-jalkapalloarkisto-arvokisat") },
      { _key: "j2", label: "Litmanen", href: LITMANEN_PATH, ...viittaus("pelaaja-jari-litmanen") },
    ],
  });
  assert.deepEqual(uusi.items[1], { _key: "ottelut", label: "Ottelut", href: "/ottelut", tyyppi: "osoite" });
  assert.deepEqual(
    muutokset.map((m) => m.tulos),
    ["viittaus", "viittaus", "viittaus", "tyyppi", "tyyppi"],
  );
});

test("etusivu: pikalinkit taulukkona, lohkon ctaLinkki omalla polullaan, ctaHref säilyy", () => {
  const etusivu = {
    _id: "etusivu",
    _type: "etusivu",
    heroCtas: [
      { _key: "a", label: "Klubi", href: "/klubi", primary: true },
      { _key: "b", label: "Muu", href: "https://x.fi", primary: false },
    ],
    blocks: [
      { _key: "uutiset", _type: "uutiset" },
      { _key: "esittely", _type: "esittely", ctaLabel: "Lue lisää", ctaHref: "/klubi" },
      { _key: "arkisto", _type: "jalkapalloarkisto", ctaHref: "/jalkapalloarkisto/arvokisat#x" },
      { _key: "valmis", _type: "jalkapalloarkisto", ctaLinkki: { _type: "linkki", ...viittaus("sivu-klubi") } },
    ],
  };
  const { uusi, operaatiot } = muunna(etusivu);
  assert.deepEqual(
    operaatiot.map((o) => [o.tyyppi, o.polku]),
    [
      ["set", "heroCtas"],
      ["set", 'blocks[_key=="esittely"].ctaLinkki'],
      ["set", 'blocks[_key=="arkisto"].ctaLinkki'],
    ],
  );
  assert.deepEqual(uusi.blocks[1], {
    _key: "esittely",
    _type: "esittely",
    ctaLabel: "Lue lisää",
    ctaHref: "/klubi",
    ctaLinkki: { _type: "linkki", ...viittaus("sivu-klubi") },
  });
  assert.deepEqual(uusi.blocks[2].ctaLinkki, { _type: "linkki", tyyppi: "osoite", href: "/jalkapalloarkisto/arvokisat#x" });
  assert.equal((uusi.heroCtas[1] as { tyyppi?: string }).tyyppi, "osoite");
});

test("klubin toiminta: url → viittaus tai osoite (href kopioidaan), url säilyy", () => {
  const toiminta = {
    _id: "klubiToiminta-matkailu",
    _type: "klubiToiminta",
    vuodet: [
      { _key: "v1", linkki: { teksti: "Matkakuvaus", url: "/uutiset/2008-07-21-ateena" } },
      { _key: "v2", linkki: { teksti: "Video", url: "https://youtu.be/lKIb8wsb0MA" } },
      { _key: "v3", linkki: { teksti: "Pelkkä teksti" } },
      { _key: "v4" },
    ],
  };
  const { uusi, operaatiot, muutokset } = muunna(toiminta);
  assert.equal(operaatiot.length, 2);
  assert.deepEqual(uusi.vuodet[0].linkki, {
    teksti: "Matkakuvaus",
    url: "/uutiset/2008-07-21-ateena",
    ...viittaus("uutinen-2008-07-21-ateena"),
  });
  assert.deepEqual(uusi.vuodet[1].linkki, {
    teksti: "Video",
    url: "https://youtu.be/lKIb8wsb0MA",
    tyyppi: "osoite",
    href: "https://youtu.be/lKIb8wsb0MA",
  });
  assert.deepEqual(uusi.vuodet[2].linkki, { teksti: "Pelkkä teksti" });
  assert.deepEqual(muutokset.map((m) => m.tulos), ["viittaus", "osoite"]);
});

test("kävijän osoite on sama ennen ja jälkeen: ajastettu kohde jää osoitteeksi", () => {
  const doc = {
    _id: "sivu-x",
    _type: "sivu",
    body: [
      {
        _key: "b",
        _type: "block",
        markDefs: [
          { _key: "a", _type: "link", href: "/uutiset/2099-01-01-ajastettu" },
          { _key: "c", _type: "link", href: "/uutiset/2008-07-21-ateena" },
        ],
      },
    ],
  };
  const { uusi } = muunna(doc);
  const osoitteet = linkkienOsoitteet(uusi, ratkaisu);
  assert.equal(osoitteet.get('body[_key=="b"].markDefs[_key=="a"]'), "/uutiset/2099-01-01-ajastettu");
  assert.equal(osoitteet.get('body[_key=="b"].markDefs[_key=="c"]'), "/uutiset/2008-07-21-ateena");
  // Jos kohde olisi piilossa, viittaus piilottaisi linkin: tarkistus huomaa sen.
  const piilossa: Ratkaisu = {
    ...ratkaisu,
    kohteet: new Map([...ratkaisu.kohteet, ["uutinen-2008-07-21-ateena", { ...kohde("uutinen", "2008-07-21-ateena"), piilossa: true }]]),
  };
  assert.equal(muuttuneetOsoitteet(doc, uusi, piilossa).length, 1);
});

test("poistaVanhat: href, url ja ctaHref pois vain, kun kävijän osoite ei muutu", () => {
  const etusivu = {
    _id: "etusivu",
    _type: "etusivu",
    heroCtas: [{ _key: "a", label: "Klubi", href: "/klubi", ...viittaus("sivu-klubi") }],
    blocks: [
      { _key: "valmis", _type: "esittely", ctaHref: "/klubi", ctaLinkki: { _type: "linkki", ...viittaus("sivu-klubi") } },
      // Keskeneräinen valinta: sivusto käyttää yhä vanhaa osoitetta, joten se jää.
      { _key: "kesken", _type: "esittely", ctaHref: "/klubi", ctaLinkki: { _type: "linkki", tyyppi: "sivu" } },
    ],
    body: [{ _key: "b", _type: "block", markDefs: [{ _key: "m", _type: "link", href: "https://x.fi", tyyppi: "osoite" }] }],
  };
  const { operaatiot, muutokset } = dokumentinMuutokset(etusivu, hakemisto, { poistaVanhat: true, ratkaisu });
  assert.deepEqual(
    operaatiot.map((o) => [o.tyyppi, o.polku]),
    [
      ["set", "heroCtas"],
      ["unset", 'blocks[_key=="valmis"].ctaHref'],
    ],
  );
  assert.deepEqual(muutokset.map((m) => m.uusi), ["href", "ctaHref"]);
  const uusi = sovellaOperaatiot(etusivu, operaatiot);
  assert.equal((uusi.heroCtas[0] as Record<string, unknown>).href, undefined);
  assert.equal(uusi.blocks[1].ctaHref, "/klubi");
  assert.equal(uusi.body[0].markDefs[0].href, "https://x.fi", "Muu osoite säilyttää osoitteensa");
  assert.deepEqual(muuttuneetOsoitteet(etusivu, uusi, ratkaisu), []);
  assert.deepEqual(dokumentinMuutokset(uusi, hakemisto, { poistaVanhat: true, ratkaisu }).operaatiot, [], "idempotentti");

  const toiminta = {
    _id: "t",
    _type: "klubiToiminta",
    vuodet: [{ _key: "v", linkki: { teksti: "x", url: "/klubi", ...viittaus("sivu-klubi") } }],
  };
  const t = dokumentinMuutokset(toiminta, hakemisto, { poistaVanhat: true, ratkaisu });
  assert.deepEqual(t.operaatiot, [
    { tyyppi: "set", polku: 'vuodet[_key=="v"].linkki', arvo: { teksti: "x", ...viittaus("sivu-klubi") } },
  ]);
});

test("polut ja operaatiot kuten Sanity: set ja unset avaimella", () => {
  assert.deepEqual(jasennaPolku('body[_key=="b1"].markDefs[_key=="m1"]'), [
    { kentta: "body" },
    { avain: "b1" },
    { kentta: "markDefs" },
    { avain: "m1" },
  ]);
  assert.deepEqual(jasennaPolku("items[2].href"), [{ kentta: "items" }, { indeksi: 2 }, { kentta: "href" }]);
  const doc = { _id: "x", _type: "sivu", body: [{ _key: "b1", markDefs: [{ _key: "m1", href: "/a" }] }] };
  const uusi = sovellaOperaatiot(doc, [
    { tyyppi: "set", polku: 'body[_key=="b1"].markDefs[_key=="m1"]', arvo: { _key: "m1", href: "/b" } },
  ]);
  assert.equal(arvoPolussa(uusi, 'body[_key=="b1"].markDefs[_key=="m1"].href'), "/b");
  assert.equal(doc.body[0].markDefs[0].href, "/a", "alkuperäinen ei muutu");
  assert.throws(() => sovellaOperaatiot(doc, [{ tyyppi: "set", polku: 'body[_key=="puuttuu"].x', arvo: 1 }]));
});

console.log(`\n${ok} testiä läpi.`);
