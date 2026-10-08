/**
 * Studion linkkikenttien tarkistuksen testit (lib/linkki.ts): "www."-alkuiset
 * ja kauttaviivattomat osoitteet päätyisivät sivulla 404:ään.
 *
 * Linkkiobjekti (docs/24 askel 4): tyyppi, kävijän osoite, liitetiedostot
 * (lib/liite.ts), polun käänteinen haku (lib/path.ts) ja kohteen tila.
 *
 * Ajo: npm run test:linkki
 */
import assert from "node:assert/strict";

import {
  kohteenTilaViesti,
  LINKIN_KOHDETYYPIT,
  linkinKuvaus,
  linkinOsoite,
  linkinTyyppi,
  linkinOsoiteTaiVanha,
  onKeskenerainenLinkki,
  osoiteKaytossa,
  puuttuukoLinkinKohde,
  tarkistaOsoite,
  valittuTyyppi,
  onLinkkiTaytetty,
  ratkaiseLinkit,
  sisainenPolku,
  tarkistaLinkki,
  type LinkkiData,
} from "../lib/linkki";
import {
  liitteenTiedot,
  tarkistaLiitetiedosto,
  tiedostonKoko,
  tiedostonOsoite,
  tiedostonPaate,
  tiedostonTyyppi,
} from "../lib/liite";
import { documentHref, documentRoute, LITMANEN_PATH, LITMANEN_SLUG, polunKohteet, TYPE_BASE } from "../lib/path";
import { ilmanStegaa } from "../lib/stega";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const virhe = (href: string, ...skeemat: Parameters<typeof tarkistaLinkki>[1][]) => {
  const tulos = tarkistaLinkki(href, ...skeemat);
  assert.equal(typeof tulos, "string", `${href} piti hylätä`);
  return tulos as string;
};

test("tyhjä arvo kelpaa (pakollisuus on kentän oma sääntö)", () => {
  assert.equal(tarkistaLinkki(""), true);
  assert.equal(tarkistaLinkki(null), true);
  assert.equal(tarkistaLinkki(undefined), true);
});

test("sivuston oma polku, täysi osoite, sähköposti ja puhelin kelpaavat", () => {
  for (const href of [
    "/",
    "/uutiset",
    "/klubi/hallitus#jasenet",
    "/uutiset?sivu=2",
    "https://www.palloliitto.fi",
    "http://example.com/polku",
    "HTTPS://WWW.PALLOLIITTO.FI",
    "mailto:sihteeri@example.com",
    "tel:+358401234567",
  ]) {
    assert.equal(tarkistaLinkki(href), true, href);
  }
});

test('"www."-alku hylätään ja ohje ehdottaa https://-alkua', () => {
  assert.equal(virhe("www.palloliitto.fi"), 'Lisää alkuun "https://", esim. https://www.palloliitto.fi');
  assert.match(virhe("WWW.Palloliitto.fi"), /https:\/\/WWW\.Palloliitto\.fi/);
});

test("polku ilman alun kauttaviivaa hylätään", () => {
  assert.match(virhe("uutiset"), /alkaa "\/"/);
  assert.match(virhe("palloliitto.fi"), /alkaa "\/"/);
  assert.match(virhe("../uutiset"), /alkaa "\/"/);
});

test("protokollaton ja vaarallinen osoite hylätään", () => {
  assert.match(virhe("//example.com"), /yhdellä "\/"/);
  assert.match(virhe("javascript:alert(1)"), /alkaa "\/"/);
  assert.match(virhe("ftp://example.com"), /alkaa "\/"/);
});

test("rikkinäinen https-alku hylätään", () => {
  assert.match(virhe("https:palloliitto.fi"), /https:\/\//);
  assert.match(virhe("https:/palloliitto.fi"), /https:\/\//);
  assert.match(virhe("https://"), /https:\/\//);
});

test("välilyönnit hylätään", () => {
  assert.match(virhe(" /uutiset"), /välilyönnit/);
  assert.match(virhe("/uutiset "), /välilyönnit/);
  assert.match(virhe("/klubin uutiset"), /välilyöntejä/);
});

test("rajattu skeemalista: mailto ja tel eivät kelpaa, ohje ei mainitse niitä", () => {
  const vain = ["http", "https"] as const;
  assert.equal(tarkistaLinkki("https://example.com", vain), true);
  assert.equal(tarkistaLinkki("/uutiset/2019-03-10-milano", vain), true);
  const ohje = virhe("mailto:sihteeri@example.com", vain);
  assert.doesNotMatch(ohje, /mailto/);
  assert.match(virhe("www.example.com", vain), /https:\/\/www\.example\.com/);
});

test("täysi ohje mainitsee kaikki sallitut muodot", () => {
  assert.equal(
    virhe("uutiset"),
    'Sivuston oma sivu alkaa "/" (esim. /uutiset), ulkoinen osoite "https://", sähköposti "mailto:" ja puhelinnumero "tel:".',
  );
});

test("sisäisen linkin polku kohteen tarkistukseen", () => {
  assert.equal(sisainenPolku("/uutiset"), "/uutiset");
  assert.equal(sisainenPolku("/klubi/hallitus#jasenet"), "/klubi/hallitus", "ankkuri pois");
  assert.equal(sisainenPolku("/ravintolat?kaupunki=lahti"), "/ravintolat", "kysely pois");
  assert.equal(sisainenPolku("/tapahtumat/"), "/tapahtumat", "loppukauttaviiva pois");
  assert.equal(sisainenPolku("/"), "/");
  assert.equal(sisainenPolku("https://example.com/uutiset"), null, "ulkoinen");
  assert.equal(sisainenPolku("//example.com"), null);
  assert.equal(sisainenPolku("mailto:a@b.fi"), null);
  assert.equal(sisainenPolku(""), null);
});

/* ---------------------------- Linkkiobjekti ---------------------------- */

const sivu = (_type: string, slug: string | null, extra: Partial<NonNullable<LinkkiData["kohde"]>> = {}): LinkkiData => ({
  tyyppi: "sivu",
  kohde: { _id: `${_type}-x`, _type, slug, nimi: "Nimi", piilossa: false, ...extra },
});

test("linkinTyyppi: valinta, vanha muoto ja tyhjä", () => {
  assert.equal(linkinTyyppi({ tyyppi: "sivu" }), "sivu");
  assert.equal(linkinTyyppi({ tyyppi: "tiedosto", href: "/x" }), "tiedosto", "valinta voittaa vanhan osoitteen");
  assert.equal(linkinTyyppi({ href: "/x" }), "osoite", "vanha muoto ilman tyyppiä");
  assert.equal(linkinTyyppi({ tyyppi: null, href: "https://a.fi" }), "osoite");
  assert.equal(linkinTyyppi({}), null);
  assert.equal(linkinTyyppi(null), null);
  assert.equal(linkinTyyppi({ tyyppi: "tuntematon" }), null);
});

test("linkinTyyppi kestää luonnosnäkymän stega-merkit", () => {
  const stega = "​‌‍﻿​‌";
  assert.equal(ilmanStegaa(`sivu${stega}`), "sivu");
  assert.equal(linkinTyyppi({ tyyppi: `sivu${stega}` }), "sivu");
  assert.equal(liitteenTiedot({ extension: `pdf${stega}` }), "PDF");
});

test("linkinOsoite: Sivuston sivu kohteen reitistä", () => {
  assert.equal(linkinOsoite(sivu("uutinen", "2008-06-01-voittajaveikkaus")), "/uutiset/2008-06-01-voittajaveikkaus");
  assert.equal(linkinOsoite(sivu("sivu", "klubi")), "/klubi");
  assert.equal(linkinOsoite(sivu("sivu", "klubi/palloveikkaus")), "/klubi/palloveikkaus");
  assert.equal(linkinOsoite(sivu("pelaaja", "jari-litmanen")), "/jalkapalloarkisto/litmanen");
  assert.equal(linkinOsoite(sivu("klubiToiminta", "matkailu")), "/klubi/toiminta/matkailu");
  assert.equal(linkinOsoite(sivu("arvokisa", "em-2008")), "/jalkapalloarkisto/arvokisat/em-2008");
});

test("linkinOsoite: piilossa oleva tai puuttuva kohde → null", () => {
  assert.equal(linkinOsoite({ tyyppi: "sivu", kohde: null }), null, "julkaisematon kohde (deref null)");
  assert.equal(linkinOsoite(sivu("uutinen", "ajastettu", { piilossa: true })), null, "ajastettu uutinen");
  assert.equal(linkinOsoite(sivu("ravintola", "odottaa", { piilossa: true })), null, "odottaa toista arvioijaa");
  assert.equal(linkinOsoite(sivu("uutinen", null)), null, "ei osoitetta");
  assert.equal(linkinOsoite(sivu("kaupunki", "lahti")), null, "tyypillä ei ole sivua");
  assert.equal(linkinOsoite({ tyyppi: "sivu", href: "/klubi", kohde: null }), null, "vanhaa osoitetta ei käytetä");
});

test("linkinOsoite: Muu osoite tarkistetaan", () => {
  assert.equal(linkinOsoite({ href: "/ottelut" }), "/ottelut");
  assert.equal(linkinOsoite({ tyyppi: "osoite", href: "https://x.fi" }), "https://x.fi");
  assert.equal(linkinOsoite({ href: "mailto:a@b.fi" }), "mailto:a@b.fi");
  assert.equal(linkinOsoite({ href: "www.x.fi" }), null);
  assert.equal(linkinOsoite({ href: "uutiset" }), null);
  assert.equal(linkinOsoite({ tyyppi: "osoite", href: "" }), null);
  assert.equal(linkinOsoite(null), null);
});

test("linkinOsoite: tiedosto", () => {
  const url = "https://cdn.sanity.io/files/p/d/abc.pdf";
  assert.equal(linkinOsoite({ tyyppi: "tiedosto", tiedosto: { url, extension: "pdf" } }), url, "PDF sellaisenaan");
  assert.equal(
    linkinOsoite({
      tyyppi: "tiedosto",
      tiedosto: {
        url: "https://cdn.sanity.io/files/p/d/abc.docx",
        extension: "docx",
        originalFilename: "Jäsenhakemus.docx",
      },
    }),
    `https://cdn.sanity.io/files/p/d/abc.docx?dl=${encodeURIComponent("Jäsenhakemus.docx")}`,
  );
  assert.equal(linkinOsoite({ tyyppi: "tiedosto", tiedosto: { extension: "pdf" } }), null, "ilman osoitetta");
  assert.equal(linkinOsoite({ tyyppi: "tiedosto", tiedosto: null }), null);
  assert.equal(
    tiedostonOsoite({ url: "https://cdn.sanity.io/files/p/d/x.xlsx" }),
    "https://cdn.sanity.io/files/p/d/x.xlsx?dl=",
    "pääte osoitteesta, kun tieto puuttuu",
  );
});

test("liitetiedoston tyyppi, koko ja tiedot", () => {
  assert.equal(tiedostonKoko(245760), "240 kt");
  assert.equal(tiedostonKoko(512), "1 kt");
  assert.equal(tiedostonKoko(1_250_000), "1,2 Mt");
  assert.equal(tiedostonKoko(2_500_000), "2,4 Mt");
  assert.equal(tiedostonKoko(0), null);
  assert.equal(tiedostonKoko(null), null);
  assert.equal(tiedostonTyyppi("pdf"), "PDF");
  assert.equal(tiedostonTyyppi("docx"), "Word");
  assert.equal(tiedostonTyyppi("xlsx"), "Excel");
  assert.equal(tiedostonTyyppi("odt"), "ODT");
  assert.equal(liitteenTiedot({ extension: "pdf", size: 245760 }), "PDF, 240 kt");
  assert.equal(liitteenTiedot({ extension: "xlsx", size: 2_500_000 }), "Excel, 2,4 Mt");
  assert.equal(liitteenTiedot({ extension: "docx" }), "Word");
  assert.equal(liitteenTiedot(null), "");
});

test("liitetiedoston pääte ja sallitut tiedostot", () => {
  assert.equal(tiedostonPaate("file-abc123-pdf"), "pdf");
  assert.equal(tiedostonPaate("file-abc123-DOCX"), "docx");
  assert.equal(tiedostonPaate("image-abc-10x10-jpg"), null);
  assert.equal(tarkistaLiitetiedosto(undefined), true, "tyhjä: pakollisuus on oma sääntönsä");
  assert.equal(tarkistaLiitetiedosto({ asset: { _ref: "file-abc-pdf" } }), true);
  assert.equal(tarkistaLiitetiedosto({ asset: { _ref: "file-abc-xlsx" } }), true);
  assert.match(String(tarkistaLiitetiedosto({ asset: { _ref: "file-abc-doc" } })), /^Sallitut tiedostot: PDF, Word/);
  assert.match(String(tarkistaLiitetiedosto({ asset: { _ref: "file-abc-exe" } })), /Tallenna tiedosto ensin/);
});

test("ratkaiseLinkit pudottaa kohdat ilman linkkiä ja säilyttää järjestyksen", () => {
  const tulos = ratkaiseLinkit<LinkkiData & { label: string }>([
    { label: "Uutiset", href: "/uutiset" },
    { label: "Piilossa", tyyppi: "sivu", kohde: { _id: "u", _type: "uutinen", slug: "x", piilossa: true } },
    { label: "Klubi", tyyppi: "sivu", kohde: { _id: "sivu-klubi", _type: "sivu", slug: "klubi" } },
    { label: "Rikki", href: "www.x.fi" },
  ]);
  assert.deepEqual(
    tulos.map((l) => [l.label, l.href]),
    [
      ["Uutiset", "/uutiset"],
      ["Klubi", "/klubi"],
    ],
  );
  assert.deepEqual(ratkaiseLinkit(null), []);
});

test("jokaisella linkin kohdetyypillä on reitti", () => {
  for (const _type of LINKIN_KOHDETYYPIT) {
    assert.notEqual(documentRoute({ _id: "x", _type, slug: "testi" }), null, _type);
  }
});

test("polunKohteet: documentHref-kierros jokaiselle tyypille", () => {
  for (const _type of Object.keys(TYPE_BASE)) {
    const polku = documentHref({ _id: "x", _type, slug: "testi" })!;
    assert.ok(
      polunKohteet(polku).some((k) => k.tyyppi === _type && k.slug === "testi"),
      `${_type}: ${polku}`,
    );
  }
  assert.ok(polunKohteet("/klubi/historia").some((k) => k.tyyppi === "sivu" && k.slug === "klubi/historia"));
  assert.deepEqual(polunKohteet("/klubi"), [{ tyyppi: "sivu", slug: "klubi" }]);
  assert.deepEqual(polunKohteet("/uutiset/x"), [
    { tyyppi: "uutinen", slug: "x" },
    { tyyppi: "sivu", slug: "uutiset/x" },
  ]);
});

test("polunKohteet: Litmanen ja hylättävät polut", () => {
  assert.ok(polunKohteet(LITMANEN_PATH).some((k) => k.tyyppi === "pelaaja" && k.slug === LITMANEN_SLUG));
  for (const polku of ["/uutiset?sivu=2", "/a#b", "https://x", "/", "//x", "uutiset", ""]) {
    assert.deepEqual(polunKohteet(polku), [], polku);
  }
});

test("kohteenTilaViesti: julkaistu, luonnos, poistettu ja ajastettu", () => {
  const nyt = new Date("2026-10-08T09:00:00Z");
  assert.equal(kohteenTilaViesti({ julkaistu: { _type: "sivu", nimi: "Historia" }, luonnos: true }, nyt), null);
  assert.deepEqual(kohteenTilaViesti({ julkaistu: null, luonnos: true, nimi: "Säännöt" }, nyt), {
    taso: "varoitus",
    viesti: "“Säännöt” ei ole vielä julkaistu. Linkki näkyy sivustolla vasta, kun julkaiset sen.",
  });
  assert.deepEqual(kohteenTilaViesti({ julkaistu: null, luonnos: false }, nyt), {
    taso: "virhe",
    viesti: "Valittua sivua ei enää ole. Valitse toinen sivu.",
  });
  // 9.10.2026 klo 5.05 UTC = 8.05 Suomen aikaa (kesäaika).
  assert.deepEqual(
    kohteenTilaViesti({ julkaistu: { _type: "uutinen", publishedAt: "2026-10-09T05:05:00Z" }, luonnos: false }, nyt),
    { taso: "varoitus", viesti: "Uutinen tulee näkyviin 9.10.2026 klo 8.05. Linkki näkyy sivustolla siitä alkaen." },
  );
  assert.equal(
    kohteenTilaViesti({ julkaistu: { _type: "uutinen", publishedAt: "2026-10-01T05:00:00Z" }, luonnos: false }, nyt),
    null,
    "julkaisuaika mennyt",
  );
});

test("linkinKuvaus Studion alaotsikoksi", () => {
  assert.equal(
    linkinKuvaus({ tyyppi: "sivu", kohdeTyyppi: "klubiToiminta", kohdeSlug: "matkailu" }),
    "→ /klubi/toiminta/matkailu",
  );
  assert.equal(linkinKuvaus({ tyyppi: "sivu", kohdeTyyppi: "sivu", kohdeSlug: "klubi" }), "→ /klubi");
  assert.equal(linkinKuvaus({ href: "/ottelut" }), "→ /ottelut", "vanha muoto");
  assert.equal(linkinKuvaus({ tyyppi: "osoite", href: "https://x.fi" }), "→ https://x.fi");
  assert.equal(linkinKuvaus({ tyyppi: "tiedosto", tiedostonNimi: "saannot.pdf" }), "Tiedosto: saannot.pdf");
  assert.equal(linkinKuvaus({ tyyppi: "sivu" }), "Valitse, mihin linkki vie");
  assert.equal(linkinKuvaus({}), "Valitse, mihin linkki vie");
});

test("onLinkkiTaytetty valitun tyypin mukaan", () => {
  assert.equal(onLinkkiTaytetty({ tyyppi: "sivu", kohde: { _ref: "sivu-klubi" } }), true);
  assert.equal(onLinkkiTaytetty({ tyyppi: "sivu", href: "/klubi" }), false, "vanha osoite ei riitä sivulle");
  assert.equal(onLinkkiTaytetty({ href: "/klubi" }), true, "vanha muoto");
  assert.equal(onLinkkiTaytetty({ tyyppi: "tiedosto", tiedosto: { asset: { _ref: "file-a-pdf" } } }), true);
  assert.equal(onLinkkiTaytetty({ tyyppi: "tiedosto" }), false);
  assert.equal(onLinkkiTaytetty(undefined), false);
});

test("vanhan linkin Osoite-kenttä ei piiloudu tyhjennettäessä, ja tyhjä pakollinen linkki on virhe", () => {
  // Vanha valikkolinkki ilman tyyppiä: isä tyhjentää osoitteen.
  assert.equal(osoiteKaytossa({ href: "/ottelut" }), true);
  assert.equal(osoiteKaytossa({}), true, "tyyppi puuttuu: kenttä pysyy näkyvissä");
  assert.equal(osoiteKaytossa({ tyyppi: "osoite" }), true);
  assert.equal(osoiteKaytossa({ tyyppi: "sivu", href: "/vanha" }), false);
  assert.equal(osoiteKaytossa({ tyyppi: "tiedosto" }), false);
  assert.match(String(tarkistaOsoite("", {}, true)), /Valitse yltä, mihin linkki vie, tai kirjoita osoite/);
  assert.match(String(tarkistaOsoite(undefined, { tyyppi: "osoite" }, true)), /Kirjoita osoite/);
  assert.equal(tarkistaOsoite("", {}, false), true, "valinnainen saa olla tyhjä");
  assert.equal(tarkistaOsoite("", { tyyppi: "sivu" }, true), true, "ei käytössä");
  assert.match(String(tarkistaOsoite("www.x.fi", {}, true)), /https:\/\//);
  assert.equal(tarkistaOsoite("/ottelut", {}, true), true);
  assert.equal(valittuTyyppi({ href: "/x" }), null, "vanha linkki: ei valintaa");
});

test("kaksoisluku: keskeneräinen uusi linkki ei kadota vanhaa osoitetta, mutta siitä varoitetaan", () => {
  // Isä valitsi Sivuston sivu, mutta Sivu on tyhjä (kysely: kohde null).
  const kesken: LinkkiData = { tyyppi: "sivu", href: null, kohde: null, tiedosto: null };
  assert.equal(linkinOsoiteTaiVanha(kesken, "/klubi"), "/klubi");
  assert.equal(linkinOsoiteTaiVanha(null, "/uutiset/x"), "/uutiset/x");
  assert.equal(linkinOsoiteTaiVanha(sivu("sivu", "klubi/uusi"), "/klubi"), "/klubi/uusi", "uusi voittaa");
  assert.equal(linkinOsoiteTaiVanha(kesken, null), null);
  assert.equal(linkinOsoiteTaiVanha(kesken, "www.x.fi"), null, "vanhakin tarkistetaan");
  // Studion raaka-arvo.
  assert.equal(onKeskenerainenLinkki({ tyyppi: "sivu" }), true);
  assert.equal(onKeskenerainenLinkki({ tyyppi: "sivu", kohde: { _ref: "sivu-klubi" } }), false);
  assert.equal(onKeskenerainenLinkki({}), false, "ei valintaa");
  assert.equal(puuttuukoLinkinKohde("Lue lisää", { tyyppi: "sivu" }, "/klubi"), true, "kesken, vaikka vanha on");
  assert.equal(puuttuukoLinkinKohde("Lue lisää", undefined, "/klubi"), false, "vanha riittää");
  assert.equal(puuttuukoLinkinKohde("Lue lisää", undefined, null), true);
  assert.equal(puuttuukoLinkinKohde("Lue lisää", { tyyppi: "osoite", href: "https://x.fi" }, null), false);
  assert.equal(puuttuukoLinkinKohde("", { tyyppi: "sivu" }, null), false, "ei tekstiä");
});

console.log(`\n${ok} testiä läpi.`);
