/**
 * Osioiden sivujen testit (docs/24 askel 3): rekisteri lib/osiosivut.ts,
 * lukitus, reittien kattavuus, tekstien ratkaisu ja siemen.
 *
 * Tärkein sääntö: dokumentin luonti (`luo:osiosivut`) ei muuta sivuston
 * näkymää eikä hakukonekuvauksia (testi 5, docs/24 Liite A K1).
 *
 * Ajo: npm run test:osiosivut
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  ARKISTON_OSIOT,
  OSIOSIVUT,
  OSIOSIVU_SLUGIT,
  johdantoPakollinen,
  luokitteleOsioSivut,
  osioSivu,
  osioSivuId,
  osioSivuSiemen,
  piilotaKentta,
  ratkaiseOsioSivu,
  type OsioSivu,
} from "../lib/osiosivut";
import {
  HALLITUS_SIVU_SLUG,
  KLUBI_SIVU_SLUG,
  KOODIIN_SIDOTUT_SIVUT,
  PALLOVEIKKAUS_SLUG,
  TIETOSUOJA_SLUG,
  TOIMINTA_SIVU_SLUG,
} from "../lib/path";
import { VAHIMMAISARVIOIJAT } from "../lib/ravintola-arvosana";
import { tarkistaSivunPolku } from "../lib/sivupolku";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const o = (slug: string): OsioSivu => {
  const loytyi = osioSivu(slug);
  assert.ok(loytyi, `rekisterissä ei ole polkua ${slug}`);
  return loytyi;
};

/** Ilman vertailukenttiä, jotka kertovat dokumentin olemassaolosta. */
function nakyva(tekstit: ReturnType<typeof ratkaiseOsioSivu>) {
  const { title, lead, description, seoTitle, korttiteksti } = tekstit;
  return { title, lead, description, seoTitle, korttiteksti };
}

/**
 * Arkiston sivujen `<meta name="description">` ennen tekstien siirtoa Studioon
 * (page.tsx-tiedostojen vakiot, main 9be342c). Kuvaus ei saa muuttua ennen
 * eikä jälkeen dokumenttien luonnin (K1).
 */
const ARKISTON_META_KUVAUKSET: Record<string, string> = {
  jalkapalloarkisto:
    "Klubin jalkapalloarkisto: Huuhkajien ottelut, arvokisat, Suomen mestarit, eurocupit, valmentajat ja FIFA-ranking taulukoina.",
  "jalkapalloarkisto/huuhkajat":
    "Suomen miesten maajoukkueen otteluhistoria ja pelaajatilastot: maaottelut, maalintekijät ja edustusmäärät taulukoina.",
  "jalkapalloarkisto/arvokisat":
    "Jalkapallon arvokisat kisa kerrallaan: isäntämaat, voittajat ja Suomen sijoitus. Kisat on ryhmitelty kisatyypin mukaan, uusin vuosi ensin.",
  "jalkapalloarkisto/mestarit":
    "Suomen jalkapallon mestaruuden voittaneet seurat vuosi vuodelta — mestaruussarjan ja Veikkausliigan voittajat yhdessä taulukossa.",
  "jalkapalloarkisto/eurocupit":
    "Euroopan seurajoukkuekilpailut yhdessä: Champions League, Europa League, Conference League, Super Cup ja Intercontinental.",
  "jalkapalloarkisto/vuoden-pelaajat":
    "Suomen vuoden jalkapalloilijat ja FIFA:n vuoden pelaajat omina taulukkoinaan — palkitut vuosittain seuroineen ja maineen.",
  "jalkapalloarkisto/euroopan-paras":
    "Ballon d'Or eli Euroopan parhaan jalkapalloilijan palkinto vuodesta 1956: voittajat, seurat ja maat vuosittain taulukkona.",
  "jalkapalloarkisto/maailman-parhaat":
    "Maailman paras avauskokoonpano vuosittain: jokaisen vuoden yksitoista pelaajaa pelipaikkoineen ja maineen sekä kenttäkaaviot.",
  "jalkapalloarkisto/valmentajat":
    "Suomen miesten maajoukkueen päävalmentajat kausittain sekä tiedot valmentajien palkoista yhtenä koottuna taulukkona.",
  "jalkapalloarkisto/fifa-ranking":
    "Suomen sijoitus FIFA:n maailmanlistalla vuosittain sekä listan kärkimaat. Ranking päivittyy FIFA:n julkaisujen mukaan.",
  "jalkapalloarkisto/lupaavat":
    "Vuosina 1980–1991 lupaavimmiksi valitut suomalaiset jalkapalloilijat: palkitut vuosittain seuroineen yhtenä taulukkona.",
  "jalkapalloarkisto/saavutukset":
    "Suomen jalkapallon kymmenen suurinta saavutusta: ottelu, turnaus, päivämäärä, paikka, tulos ja yleisömäärä.",
  "jalkapalloarkisto/jarkytykset":
    "Suomen jalkapallon suurimmat järkytykset: ottelu, turnaus, päivämäärä, paikka, tulos ja yleisömäärä.",
  "jalkapalloarkisto/ulkomaiset-mestarit":
    "Englannin ja Venäjän jalkapallomestarit vuosi vuodelta sekä Englannin seurojen mestaruudet ja cupvoitot taulukoina.",
  "jalkapalloarkisto/palloliitto":
    "Suomen Palloliiton puheenjohtajat kausittain taulukkona Lahden Suomalaisen Klubin jalkapalloarkistossa.",
  "jalkapalloarkisto/stadionit":
    "Jalkapallostadionit, joilla Huuhkajat ja klubin matkat ovat käyneet. Stadionit on ryhmitelty maan mukaan, Suomi ensin.",
  "jalkapalloarkisto/tilastot":
    "Jalkapalloarkiston erilliset koosteet, jotka eivät kuulu mihinkään sarjaan: unohtumattomat ottelut ja puutteelliset järjestelyt.",
};

/* 1. Rekisteri */

test("rekisterissä 30 sivua, polut ja tunnukset uniikkeja", () => {
  assert.equal(OSIOSIVUT.length, 30);
  assert.equal(OSIOSIVU_SLUGIT.size, 30);
  assert.equal(new Set(OSIOSIVUT.map((s) => osioSivuId(s.slug))).size, 30);
  assert.equal(osioSivuId("klubi/palloveikkaus"), "sivu-klubi-palloveikkaus");
  assert.equal(osioSivuId("klubi"), "sivu-klubi");
  assert.equal(osioSivuId("jalkapalloarkisto/fifa-ranking"), "sivu-jalkapalloarkisto-fifa-ranking");
});

test("arkiston 16 osiota ja etusivu ovat rekisterissä", () => {
  assert.equal(ARKISTON_OSIOT.length, 16);
  for (const osio of ARKISTON_OSIOT) o(`jalkapalloarkisto/${osio}`);
  assert.equal(OSIOSIVUT.filter((s) => s.ryhma === "jalkapalloarkisto").length, 17);
  assert.equal(osioSivu("jalkapalloarkisto/litmanen"), undefined, "Litmanen ei ole osion sivu");
  assert.equal(osioSivu("toriparkki"), undefined);
  assert.equal(osioSivu(undefined), undefined);
});

/* 2. Lukitus */

test("jokainen osion sivu on lukittu ja polku kelpaa", () => {
  assert.equal(KOODIIN_SIDOTUT_SIVUT.length, 31);
  assert.ok(KOODIIN_SIDOTUT_SIVUT.includes(TIETOSUOJA_SLUG));
  for (const { slug } of OSIOSIVUT) {
    assert.ok(KOODIIN_SIDOTUT_SIVUT.includes(slug), slug);
    assert.equal(tarkistaSivunPolku(slug), true, slug);
  }
});

test("Klubin vakiot löytyvät rekisteristä", () => {
  for (const slug of [KLUBI_SIVU_SLUG, HALLITUS_SIVU_SLUG, TOIMINTA_SIVU_SLUG, PALLOVEIKKAUS_SLUG]) {
    assert.equal(o(slug).ryhma, "klubi", slug);
  }
});

/* 3–4. Reitit */

const PUBLIC = join(process.cwd(), "app", "(public)");

test("jokaisella osion sivulla on oma page.tsx", () => {
  for (const { slug } of OSIOSIVUT) {
    assert.ok(existsSync(join(PUBLIC, ...slug.split("/"), "page.tsx")), `app/(public)/${slug}/page.tsx puuttuu`);
  }
});

/** Staattiset sivut (ei [dynaamisia] osia, _yksityiset ohitetaan) polkuina. */
function staattisetSivut(kansio: string, polku: string[] = []): string[] {
  const tulos: string[] = [];
  for (const nimi of readdirSync(kansio)) {
    const koko = join(kansio, nimi);
    if (statSync(koko).isDirectory()) {
      if (nimi.startsWith("_") || nimi.startsWith("[")) continue;
      tulos.push(...staattisetSivut(koko, [...polku, nimi]));
    } else if (nimi === "page.tsx") {
      tulos.push(polku.join("/"));
    }
  }
  return tulos;
}

/** Staattiset sivut, jotka eivät ole osioiden sivuja (perustelu docs/24 askel 3). */
const POIKKEUKSET = new Set([
  "", // etusivu: oma singleton
  "uutiset/tunniste", // pelkkä uudelleenohjaus
  "jalkapalloarkisto/litmanen", // sisältö pelaaja- ja lehtileikedokumenteista
  "jalkapalloarkisto/litmanen/lehtileikkeet",
  "jalkapalloarkisto/litmanen/patsas",
  "jalkapalloarkisto/litmanen/loukkaantumiset",
]);

test("kattavuus: jokainen staattinen sivu on rekisterissä tai poikkeus", () => {
  const sivut = staattisetSivut(PUBLIC);
  assert.ok(sivut.length >= 36, `liian vähän sivuja (${sivut.length})`);
  for (const polku of sivut) {
    assert.ok(
      OSIOSIVU_SLUGIT.has(polku) || POIKKEUKSET.has(polku),
      `app/(public)/${polku}: lisää lib/osiosivut.ts:n rekisteriin tai tämän testin poikkeuksiin`,
    );
  }
  for (const poikkeus of POIKKEUKSET) assert.ok(sivut.includes(poikkeus), `poikkeusta ${poikkeus} ei enää ole`);
});

/* 5. Ei näkyvää muutosta */

test("siemenestä luotu dokumentti näyttää täsmälleen samat tekstit kuin puuttuva", () => {
  for (const sivu of OSIOSIVUT) {
    assert.deepEqual(
      nakyva(ratkaiseOsioSivu(osioSivuSiemen(sivu), sivu)),
      nakyva(ratkaiseOsioSivu(null, sivu)),
      sivu.slug,
    );
  }
});

test("arkiston sivujen meta-kuvaus on sama ennen ja jälkeen luonnin (K1)", () => {
  assert.equal(Object.keys(ARKISTON_META_KUVAUKSET).length, 17);
  for (const [slug, kuvaus] of Object.entries(ARKISTON_META_KUVAUKSET)) {
    const sivu = o(slug);
    assert.equal(ratkaiseOsioSivu(null, sivu).description, kuvaus, `${slug} ilman dokumenttia`);
    assert.equal(ratkaiseOsioSivu(osioSivuSiemen(sivu), sivu).description, kuvaus, `${slug} siemenen jälkeen`);
  }
});

/* 6. ratkaiseOsioSivu */

test("ratkaiseOsioSivu: oletukset ja varakentät", () => {
  const uutiset = o("uutiset");
  const ilman = ratkaiseOsioSivu(null, uutiset);
  assert.equal(ilman.title, "Uutiset");
  assert.equal(ilman.lead, uutiset.oletus.lead);
  assert.equal(ilman.description, uutiset.oletus.lead);
  assert.equal(ilman.seoTitle, "Uutiset");
  assert.equal(ilman.loytyi, false);
  assert.equal(ilman.updatedAt, null);

  const valit = ratkaiseOsioSivu({ title: "   ", tiivistelma: " " }, uutiset);
  assert.equal(valit.title, "Uutiset", "pelkät välilyönnit → oletus");
  assert.equal(valit.lead, uutiset.oletus.lead);
  assert.equal(valit.loytyi, true);

  const ingressi = ratkaiseOsioSivu({ title: "Uutiset", tiivistelma: "", ingress: "Vanha ingressi." }, uutiset);
  assert.equal(ingressi.lead, "Vanha ingressi.", "Ingressi on Tiivistelmän varana");
  assert.equal(ingressi.description, "Vanha ingressi.", "kuvaus seuraa johdantoa, kun dokumentti on olemassa");

  const seo = ratkaiseOsioSivu(
    { title: "Uutiset", tiivistelma: "Johdanto.", seoDescription: " Hakukuvaus. ", seoTitle: "Klubin uutiset", _updatedAt: "2026-10-08T10:00:00Z" },
    uutiset,
  );
  assert.equal(seo.description, "Hakukuvaus.", "seoDescription voittaa johdannon");
  assert.equal(seo.seoTitle, "Klubin uutiset");
  assert.equal(seo.updatedAt, "2026-10-08T10:00:00Z");
});

test("ratkaiseOsioSivu: erikoistapaukset", () => {
  const ravintolat = o("ravintolat");
  assert.equal(ratkaiseOsioSivu(null, ravintolat).lead, null, "ravintolasivun johdanto lasketaan datasta");
  assert.equal(ratkaiseOsioSivu({ title: "Ravintola-arviot" }, ravintolat).lead, null);
  assert.equal(ratkaiseOsioSivu(osioSivuSiemen(ravintolat), ravintolat).description, ravintolat.oletus.description);

  const tunnisteet = o("uutiset/tunnisteet");
  assert.equal(ratkaiseOsioSivu(null, tunnisteet).seoTitle, "Uutisten tunnisteet");
  assert.equal(ratkaiseOsioSivu(null, tunnisteet).title, "Tunnisteet");

  const mestarit = o("jalkapalloarkisto/mestarit");
  assert.equal(ratkaiseOsioSivu({ title: "Suomen mestarit", korttiteksti: "" }, mestarit).korttiteksti, mestarit.oletus.kortti);
  assert.equal(ratkaiseOsioSivu({ title: "Suomen mestarit", korttiteksti: "Oma." }, mestarit).korttiteksti, "Oma.");
  assert.equal(ratkaiseOsioSivu(null, o("uutiset")).korttiteksti, null);

  // Klubin sivuilla ei ole oletusjohdantoa eikä -kuvausta: sivuston yleinen kuvaus.
  assert.equal(ratkaiseOsioSivu(null, o("klubi/hallitus")).description, null);
  assert.equal(ratkaiseOsioSivu({ title: "Hallitus" }, o("klubi/hallitus")).description, null);
});

/* 7. Pakollinen johdanto */

test("Tiivistelmä on pakollinen 24 sivulla, valinnainen Klubin viidellä ja ravintoloilla", () => {
  const valinnaiset = OSIOSIVUT.filter((s) => !johdantoPakollinen(s)).map((s) => s.slug);
  assert.deepEqual(valinnaiset.sort(), [
    "klubi",
    "klubi/hallitus",
    "klubi/palloveikkaus",
    "klubi/toiminta",
    "klubi/yhteystiedot",
    "ravintolat",
  ]);
  assert.equal(OSIOSIVUT.filter(johdantoPakollinen).length, 24);
});

/* 8. Pituudet */

test("oletustekstien pituudet mahtuvat Studion suosituksiin", () => {
  for (const { slug, oletus } of OSIOSIVUT) {
    if (oletus.lead) assert.ok(oletus.lead.length <= 300, `${slug}: johdanto ${oletus.lead.length} merkkiä`);
    if (oletus.kortti) assert.ok(oletus.kortti.length <= 140, `${slug}: kortti ${oletus.kortti.length} merkkiä`);
    if (oletus.seoTitle) assert.ok(oletus.seoTitle.length <= 70, slug);
  }
  assert.ok(o("ravintolat/odottavat").oletus.lead?.includes(String(VAHIMMAISARVIOIJAT)));
});

/* 9. Siemen */

test("osioSivuSiemen: muoto, kortti vain arkistossa ja hakukuvaus vain kun eroaa (K1)", () => {
  for (const sivu of OSIOSIVUT) {
    const siemen = osioSivuSiemen(sivu);
    for (const [avain, arvo] of Object.entries(siemen)) assert.notEqual(arvo, undefined, `${sivu.slug}.${avain}`);
    assert.equal(siemen._id, osioSivuId(sivu.slug));
    assert.equal(siemen._type, "sivu");
    assert.deepEqual(siemen.slug, { _type: "slug", current: sivu.slug });
    assert.equal(siemen.title, sivu.oletus.title);
    assert.equal(siemen.tiivistelma, sivu.oletus.lead ?? undefined);
    assert.equal(
      "korttiteksti" in siemen,
      sivu.ryhma === "jalkapalloarkisto" && sivu.slug !== "jalkapalloarkisto",
      `${sivu.slug}: korttiteksti`,
    );
    const { description, lead } = sivu.oletus;
    assert.equal("seoDescription" in siemen, description !== null && description !== lead, `${sivu.slug}: seoDescription`);
    if ("seoDescription" in siemen) assert.equal(siemen.seoDescription, description);
  }
  assert.equal(OSIOSIVUT.filter((s) => "korttiteksti" in osioSivuSiemen(s)).length, 16);
  assert.equal(osioSivuSiemen(o("uutiset/tunnisteet")).seoTitle, "Uutisten tunnisteet");
});

/* 10. Luokittelu */

/** Productionin sivut 8.10.2026 (docs/24 Liite A). */
const PRODUCTION_SIVUT = [
  { _id: "sivu-english", slug: "english" },
  { _id: "sivu-klubi", slug: "klubi" },
  { _id: "sivu-klubi-palloveikkaus", slug: "klubi/palloveikkaus" },
  { _id: "sivu-klubi-palloveikkaus-arvokisat", slug: "klubi/palloveikkaus/arvokisat" },
  { _id: "sivu-klubi-palloveikkaus-maaottelut", slug: "klubi/palloveikkaus/maaottelut" },
  { _id: "sivu-klubi-palloveikkaus-veikkausliiga", slug: "klubi/palloveikkaus/veikkausliiga" },
  { _id: "sivu-tietosuoja", slug: "tietosuoja" },
  { _id: "sivu-toriparkki", slug: "toriparkki" },
];

test("luokitteleOsioSivut: productionin 8 sivua → 28 luotavaa, 2 olemassa", () => {
  const { luotavat, olemassa, ristiriidat } = luokitteleOsioSivut(PRODUCTION_SIVUT);
  assert.equal(luotavat.length, 28);
  assert.deepEqual(olemassa.map((s) => s.slug), ["klubi", "klubi/palloveikkaus"]);
  assert.deepEqual(ristiriidat, []);
});

test("luokitteleOsioSivut: ristiriidat ja luonnokset", () => {
  const vaaraPolku = luokitteleOsioSivut([{ _id: "sivu-uutiset", slug: "uutiset-vanha" }]);
  assert.equal(vaaraPolku.ristiriidat.length, 1);
  assert.ok(!vaaraPolku.luotavat.some((s) => s.slug === "uutiset"));

  const vaaraTunnus = luokitteleOsioSivut([{ _id: "x", slug: "uutiset" }]);
  assert.equal(vaaraTunnus.ristiriidat.length, 1);
  assert.match(vaaraTunnus.ristiriidat[0], /\/uutiset/);

  const luonnos = luokitteleOsioSivut([{ _id: "drafts.sivu-klubi", slug: "klubi" }]);
  assert.deepEqual(luonnos.olemassa.map((s) => s.slug), ["klubi"]);
  assert.equal(luonnos.luotavat.length, 29);
  assert.deepEqual(luonnos.ristiriidat, []);

  const kaikki = luokitteleOsioSivut(OSIOSIVUT.map((s) => ({ _id: osioSivuId(s.slug), slug: s.slug })));
  assert.equal(kaikki.luotavat.length, 0, "idempotentti: toisella kerralla ei luotavaa");
});

/* 11. Kenttien piilotus */

test("piilotaKentta", () => {
  assert.equal(piilotaKentta("uutiset", "body", undefined), true);
  assert.equal(piilotaKentta("uutiset", "body", [{ _type: "block" }]), false, "olemassa oleva data näkyy");
  assert.equal(piilotaKentta("uutiset", "body", []), true);
  assert.equal(piilotaKentta("klubi", "body", undefined), false);
  assert.equal(piilotaKentta("klubi/palloveikkaus", "tilastot", undefined), false);
  assert.equal(piilotaKentta("klubi/hallitus", "hero", undefined), true);
  assert.equal(piilotaKentta("toriparkki", "body", undefined), false, "omat sivut ennallaan");
  assert.equal(piilotaKentta(undefined, "hero", undefined), false);
});

console.log(`\n${ok} testiä ok`);
