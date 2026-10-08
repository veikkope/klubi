/**
 * Ajonaikaisten ohjausten säännöt (lib/ohjaukset.ts, docs/24 askel 8).
 *
 * Kattaa polkujen normalisoinnin, ohjauksen ratkaisun (ketjut, silmukat,
 * deterministinen valinta), lyhytosoitteen tarkistuksen, webhookin aiempien
 * osoitteiden yhdistämisen ja atomiset mutaatiot (K2), Studion tiedon,
 * kaupungin vanhan tunnisteen sekä rakennetestit: jokainen app/(public)-reitti
 * käyttää ohjaaTaiEiLoydy-funktiota notFound():n sijaan, ja kyselyn
 * tyyppilista vastaa ohjattavia tyyppejä.
 *
 * Ajo: npm run test:ohjaukset
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { Mutation } from "@sanity/mutator";
import { evaluate, parse } from "groq-js";

import { korjaaKaupunki, RAVINTOLA_DEFAULT_FILTERS } from "../components/ravintola-filters";
import {
  OHJATTAVAT_TYYPIT,
  TUNNISTE_TYYPIT,
  aiempienPolkujenMuutos,
  aiempienPolkujenMutaatiot,
  itsekorjausSallittu,
  KOPIOSTA_POISTETTAVAT,
  normalisoiPolku,
  omaPolku,
  osoitteenMuutos,
  polunMuutosViesti,
  ratkaiseOhjaus,
  tarkistaOhjauksenLahde,
  tyhjennaKopiosta,
  yhdistaAiemmatPolut,
  type AiempiDokumentti,
  type OhjausKartta,
  type OhjausRivi,
} from "../lib/ohjaukset";
import { KOODIIN_SIDOTUT_SIVUT } from "../lib/path";
import { blogspotRedirects, legacyRedirects } from "../lib/redirects";
import type { RavintolatFacetData } from "../sanity/lib/queries/ravintolat";
import { ohjauskarttaQuery } from "../sanity/lib/queries/ohjaukset";
import {
  YRITYKSET,
  aiemmanOsoitteenKasittely,
  tallennaAiempiOsoite,
  type KirjoittavaClient,
} from "../sanity/lib/aiemmat-polut";

let ok = 0;
function test(nimi: string, fn: () => void | Promise<void>) {
  return Promise.resolve(fn()).then(() => {
    ok += 1;
    console.log(`✓ ${nimi}`);
  });
}

const kartta = (ohjaukset: OhjausRivi[] = [], dokumentit: AiempiDokumentti[] = []): OhjausKartta => ({ ohjaukset, dokumentit });
const ohjaus = (lahde: string, kohdeHref: string | null, _id = `ohjaus-${lahde}`): OhjausRivi => ({ _id, lahde, kohdeHref });

// Silmukkatestit kirjaavat console.errorin tarkoituksella: hiljennetään ja lasketaan.
let virheita = 0;
const alkuperainenError = console.error;
function hiljaa<T>(fn: () => T): T {
  console.error = () => {
    virheita += 1;
  };
  try {
    return fn();
  } finally {
    console.error = alkuperainenError;
  }
}

/** Webhookin tallennuksen lokit pois testin tulosteesta. */
async function hiljaaAsync<T>(fn: () => Promise<T>): Promise<T> {
  const [log, warn, error] = [console.log, console.warn, console.error];
  console.log = console.warn = console.error = () => {};
  try {
    return await fn();
  } finally {
    [console.log, console.warn, console.error] = [log, warn, error];
  }
}

async function main() {
  await test("1. normalisoiPolku", () => {
    assert.equal(normalisoiPolku("/Jasenmaksu/"), "/jasenmaksu");
    assert.equal(normalisoiPolku("jasenmaksu"), "/jasenmaksu");
    assert.equal(normalisoiPolku("/a//b"), "/a/b");
    assert.equal(normalisoiPolku("/%C3%A4"), "/ä");
    assert.equal(normalisoiPolku("/%E0%A4%A"), "/%e0%a4%a", "rikkinäinen koodaus ei kaada");
    assert.equal(normalisoiPolku("/"), null);
    assert.equal(normalisoiPolku(""), null);
    assert.equal(normalisoiPolku("/x?y=1#z"), "/x");
    assert.equal(normalisoiPolku(`/${"a".repeat(300)}`), null, "yli 300 merkkiä");
  });

  await test("2. omaPolku", () => {
    assert.equal(omaPolku("/x?y#z"), "/x?y#z");
    assert.equal(omaPolku("https://www.lahdensuomalainenklubi.com/x"), "/x");
    assert.equal(omaPolku("https://lahdensuomalainenklubi.com/x?y=1#z"), "/x?y=1#z");
    assert.equal(omaPolku("https://palloliitto.fi/x"), null);
    assert.equal(omaPolku("//evil.com"), null);
    assert.equal(omaPolku("mailto:x@y.fi"), null);
  });

  await test("3. tarkistaOhjauksenLahde: kelvolliset ja virheet", () => {
    for (const lahde of ["/jasenmaksu", "/klubi/saannot-2027", "/uutiset/vanha-juttu", "/a1/b2"]) {
      assert.equal(tarkistaOhjauksenLahde(lahde), true, lahde);
    }
    const virhe = (lahde: string, alku: string) => {
      const tulos = tarkistaOhjauksenLahde(lahde);
      assert.equal(typeof tulos, "string", lahde);
      assert.ok((tulos as string).startsWith(alku), `${lahde}: ${tulos}`);
    };
    virhe("", "Kirjoita osoite, esim. /jasenmaksu.");
    virhe("jasenmaksu", "Osoite alkaa kauttaviivalla");
    virhe(" /x", "Poista välilyönnit");
    virhe("/", "Etusivua ei voi ohjata.");
    virhe("/Jasenmaksu", "Käytä pieniä kirjaimia: /jasenmaksu");
    virhe("/jäsenmaksu", 'Virheellinen kohta "jäsenmaksu"');
    virhe("/x/", "Poista kauttaviiva osoitteen lopusta.");
    virhe("/x?y", "Osoitteessa ei voi olla ?- tai #-merkkiä.");
    virhe("/x#y", "Osoitteessa ei voi olla ?- tai #-merkkiä.");
    virhe("/a--b", 'Virheellinen kohta "a--b"');
    virhe("/studio/x", "Osoite /studio on sivuston oma");
    virhe("/api/x", "Osoite /api on sivuston oma");
    virhe("/blogspot/x", "Osoite /blogspot on sivuston oma");
    virhe("https://www.lahdensuomalainenklubi.com/x", "Kirjoita vain sivuston osoitteen loppuosa");
    virhe("/a/b/c/d/e/f/g", "Osoite on liian pitkä.");
    virhe(`/${"a".repeat(120)}`, "Osoite on liian pitkä.");
  });

  await test("R7. koodiin sidotut sivut: /uutiset virhe, /uutiset/vanha-juttu kelpaa", () => {
    assert.equal(tarkistaOhjauksenLahde("/uutiset"), "Osoitteessa /uutiset on jo sivu. Valitse toinen osoite.");
    assert.equal(tarkistaOhjauksenLahde("/tietosuoja"), "Osoitteessa /tietosuoja on jo sivu. Valitse toinen osoite.");
    assert.equal(tarkistaOhjauksenLahde("/jalkapalloarkisto/mestarit"), "Osoitteessa /jalkapalloarkisto/mestarit on jo sivu. Valitse toinen osoite.");
    for (const slug of KOODIIN_SIDOTUT_SIVUT) assert.notEqual(tarkistaOhjauksenLahde(`/${slug}`), true, slug);
    assert.equal(tarkistaOhjauksenLahde("/uutiset/vanha-juttu"), true);
  });

  await test("staattiset ohjaukset ennallaan: .htm- ja blogiosoitteisiin ei voi tehdä ohjausta", () => {
    assert.ok(legacyRedirects.length >= 188, "vanhan sivuston ohjaukset");
    assert.ok(blogspotRedirects.length >= 500, "blogin ohjaukset");
    for (const r of legacyRedirects) {
      if (r.source.endsWith(".htm")) assert.notEqual(tarkistaOhjauksenLahde(r.source), true, r.source);
    }
    for (const r of blogspotRedirects) assert.notEqual(tarkistaOhjauksenLahde(r.source), true, r.source);
    // Muutama vanha osoite on kelvollista muotoa (esim. /klubi/saannot): Studion HEAD-tarkistus
    // kertoo kiinteästä ohjauksesta, ja staattinen ohjaus voittaa joka tapauksessa, koska
    // next.config.ts:n ohjaukset ajetaan ennen reittejä eikä 404-haaraa koskaan saavuteta.
    assert.equal(ratkaiseOhjaus("/arvostelu.htm", kartta()), null);
  });

  await test("4.–6. lyhytosoite sivulle, ulkoinen kohde, mailto", () => {
    assert.deepEqual(ratkaiseOhjaus("/jasenmaksu", kartta([ohjaus("/jasenmaksu", "/klubi/saannot")])), {
      kohde: "/klubi/saannot",
      pysyva: false,
    });
    assert.deepEqual(ratkaiseOhjaus("/lomake", kartta([ohjaus("/lomake", "https://forms.gle/x")])), {
      kohde: "https://forms.gle/x",
      pysyva: false,
    });
    assert.equal(ratkaiseOhjaus("/posti", kartta([ohjaus("/posti", "mailto:x@y.fi")])), null);
    assert.equal(ratkaiseOhjaus("/tyhja", kartta([ohjaus("/tyhja", null)])), null, "kohde puuttuu");
    assert.deepEqual(
      ratkaiseOhjaus("/omasivu", kartta([ohjaus("/omasivu", "https://www.lahdensuomalainenklubi.com/klubi")])),
      { kohde: "/klubi", pysyva: false },
      "oman sivuston täysi osoite → polku",
    );
  });

  await test("7. aiempi osoite → nykyinen (308), kirjainkoko ja lopun kauttaviiva", () => {
    const k = kartta([], [{ _id: "u1", _type: "uutinen", slug: "uusi", aiemmatPolut: ["/uutiset/vanha"] }]);
    const odotettu = { kohde: "/uutiset/uusi", pysyva: true };
    assert.deepEqual(ratkaiseOhjaus("/uutiset/vanha", k), odotettu);
    assert.deepEqual(ratkaiseOhjaus("/Uutiset/Vanha/", k), odotettu);
    assert.equal(ratkaiseOhjaus("/uutiset/muu", k), null);
  });

  await test("8. monta uudelleennimeämistä: /a ja /b → /c yhdellä hypyllä", () => {
    const k = kartta([], [{ _id: "s", _type: "sivu", slug: "c", aiemmatPolut: ["/a", "/b"] }]);
    assert.deepEqual(ratkaiseOhjaus("/a", k), { kohde: "/c", pysyva: true });
    assert.deepEqual(ratkaiseOhjaus("/b", k), { kohde: "/c", pysyva: true });
  });

  await test("9. ohjaus voittaa automaattisen", () => {
    const k = kartta(
      [ohjaus("/vanha", "/klubi")],
      [{ _id: "s", _type: "sivu", slug: "uusi", aiemmatPolut: ["/vanha"] }],
    );
    assert.deepEqual(ratkaiseOhjaus("/vanha", k), { kohde: "/klubi", pysyva: false });
  });

  await test("10.–11. ketjut: ohjaus → ohjaus → sivu ja ohjaus → aiempi osoite", () => {
    const k = kartta([ohjaus("/x", "/y"), ohjaus("/y", "/z")]);
    assert.deepEqual(ratkaiseOhjaus("/x", k), { kohde: "/z", pysyva: false });
    const k2 = kartta([ohjaus("/x", "/vanha")], [{ _id: "s", _type: "sivu", slug: "uusi", aiemmatPolut: ["/vanha"] }]);
    assert.deepEqual(ratkaiseOhjaus("/x", k2), { kohde: "/uusi", pysyva: false });
  });

  await test("ketju päättyy elävään sivuun: aiempi osoite ja Sivuston sivu -kohde", () => {
    // W oli aiemmin /uutiset/a, ja X on nyt /uutiset/a: X:n vanha osoite vie X:lle, ei W:lle.
    const k = kartta([], [
      { _id: "w", _type: "uutinen", slug: "w", aiemmatPolut: ["/uutiset/a"] },
      { _id: "x", _type: "uutinen", slug: "a", aiemmatPolut: ["/uutiset/c"] },
    ]);
    assert.deepEqual(ratkaiseOhjaus("/uutiset/c", k), { kohde: "/uutiset/a", pysyva: true });
    // Ohjauksen kohde Sivuston sivu (X): ketju päättyy X:n sivuun.
    const k2 = kartta([{ ...ohjaus("/lyhyt", "/uutiset/a"), kohdeOnSivu: true }], k.dokumentit);
    assert.deepEqual(ratkaiseOhjaus("/lyhyt", k2), { kohde: "/uutiset/a", pysyva: false });
    // Muu osoite sivuston sisällä jatkaa ketjua (vanha polku → nykyinen).
    const k3 = kartta([ohjaus("/lyhyt", "/uutiset/c")], k.dokumentit);
    assert.deepEqual(ratkaiseOhjaus("/lyhyt", k3), { kohde: "/uutiset/a", pysyva: false });
    // Sivuston sivu, jonka reitti on ohjauksen oma osoite: silmukka, ei ikuista ohjausta.
    hiljaa(() => assert.equal(ratkaiseOhjaus("/lyhyt", kartta([{ ...ohjaus("/lyhyt", "/lyhyt"), kohdeOnSivu: true }])), null));
  });

  await test("ohjaus etusivulle", () => {
    assert.deepEqual(ratkaiseOhjaus("/koti", kartta([ohjaus("/koti", "/")])), { kohde: "/", pysyva: false });
    assert.deepEqual(
      ratkaiseOhjaus("/koti", kartta([ohjaus("/koti", "https://www.lahdensuomalainenklubi.com/")])),
      { kohde: "/", pysyva: false },
    );
    assert.deepEqual(ratkaiseOhjaus("/a", kartta([ohjaus("/a", "/koti"), ohjaus("/koti", "/#alku")])), {
      kohde: "/#alku",
      pysyva: false,
    });
  });

  await test("12. silmukka → null (ei kaadu)", () => {
    hiljaa(() => {
      assert.equal(ratkaiseOhjaus("/x", kartta([ohjaus("/x", "/y"), ohjaus("/y", "/x")])), null);
      assert.equal(ratkaiseOhjaus("/x", kartta([ohjaus("/x", "/x")])), null);
    });
  });

  await test("13. yli viiden hypyn ketju → viides kohde", () => {
    const k = kartta(["/a", "/b", "/c", "/d", "/e", "/f", "/g"].slice(0, 6).map((p, i, l) => ohjaus(p, l[i + 1] ?? "/g")));
    assert.deepEqual(ratkaiseOhjaus("/a", k), { kohde: "/f", pysyva: false });
  });

  await test("14. kohde on pyyntö itse → null", () => {
    const k = kartta([], [{ _id: "u", _type: "uutinen", slug: "x", aiemmatPolut: ["/uutiset/x"] }]);
    hiljaa(() => assert.equal(ratkaiseOhjaus("/uutiset/x", k), null));
  });

  await test("15. sama aiempi osoite kahdella: uusin _updatedAt voittaa syötteen järjestyksestä riippumatta", () => {
    const vanha: AiempiDokumentti = { _id: "a", _type: "sivu", slug: "vanhempi", aiemmatPolut: ["/p"], _updatedAt: "2026-01-01T00:00:00Z" };
    const uusi: AiempiDokumentti = { _id: "b", _type: "sivu", slug: "uudempi", aiemmatPolut: ["/p"], _updatedAt: "2026-05-01T00:00:00Z" };
    assert.equal(ratkaiseOhjaus("/p", kartta([], [vanha, uusi]))?.kohde, "/uudempi");
    assert.equal(ratkaiseOhjaus("/p", kartta([], [uusi, vanha]))?.kohde, "/uudempi");
    // Tasatilanteessa pienin _id.
    const c: AiempiDokumentti = { ...uusi, _id: "c", slug: "kolmas" };
    assert.equal(ratkaiseOhjaus("/p", kartta([], [c, uusi]))?.kohde, "/uudempi");
    assert.equal(ratkaiseOhjaus("/p", kartta([], [uusi, c]))?.kohde, "/uudempi");
    // Ohjauksista ensimmäinen _id-järjestyksessä.
    const o = [ohjaus("/q", "/kaksi", "ohjaus-b"), ohjaus("/q", "/yksi", "ohjaus-a")];
    assert.equal(ratkaiseOhjaus("/q", kartta(o))?.kohde, "/yksi");
  });

  await test("prosenttikoodaus: /uutiset/%C3%A4iti ja /uutiset/äiti ratkeavat samoin", () => {
    const k = kartta([], [{ _id: "u", _type: "uutinen", slug: "aiti", aiemmatPolut: ["/uutiset/äiti"] }]);
    assert.deepEqual(ratkaiseOhjaus("/uutiset/%C3%A4iti", k), { kohde: "/uutiset/aiti", pysyva: true });
    assert.deepEqual(ratkaiseOhjaus("/uutiset/äiti", k), { kohde: "/uutiset/aiti", pysyva: true });
    const k2 = kartta([], [{ _id: "u", _type: "uutinen", slug: "aiti", aiemmatPolut: ["/uutiset/%C3%A4iti"] }]);
    assert.deepEqual(ratkaiseOhjaus("/uutiset/äiti", k2), { kohde: "/uutiset/aiti", pysyva: true });
    assert.equal(ratkaiseOhjaus("/uutiset/%E0%A4%A", k), null, "virheellinen koodaus ei kaada");
    assert.deepEqual(ratkaiseOhjaus("/uutiset/%E0%A4%A", kartta([], [{ ...k.dokumentit[0], aiemmatPolut: ["/uutiset/%E0%A4%A"] }])), {
      kohde: "/uutiset/aiti",
      pysyva: true,
    });
  });

  await test("toisto aiemmissa osoitteissa ei haittaa", () => {
    const k = kartta([], [{ _id: "u", _type: "uutinen", slug: "uusi", aiemmatPolut: ["/uutiset/a", "/uutiset/a"] }]);
    assert.deepEqual(ratkaiseOhjaus("/uutiset/a", k), { kohde: "/uutiset/uusi", pysyva: true });
  });

  await test("16. tilastot: oma sivu ja ankkuri", () => {
    const k = kartta([], [
      { _id: "t1", _type: "jalkapalloTilasto", slug: "uusi", category: "karsinta", aiemmatPolut: ["/jalkapalloarkisto/karsinnat/vanha"] },
      { _id: "t2", _type: "jalkapalloTilasto", slug: "uusi2", category: "champions", aiemmatPolut: ["/vanha-ankkuri"] },
    ]);
    assert.equal(ratkaiseOhjaus("/jalkapalloarkisto/karsinnat/vanha", k)?.kohde, "/jalkapalloarkisto/karsinnat/uusi");
    assert.equal(ratkaiseOhjaus("/vanha-ankkuri", k)?.kohde, "/jalkapalloarkisto/mestarit#uusi2");
  });

  await test("17. yhdistaAiemmatPolut (D:n tapaukset)", () => {
    assert.deepEqual(yhdistaAiemmatPolut(undefined, undefined, "/a", "/b"), ["/a"]);
    assert.equal(yhdistaAiemmatPolut(["/a"], undefined, "/a", "/b"), null);
    assert.deepEqual(yhdistaAiemmatPolut(["/a"], undefined, "/b", "/a"), ["/b"], "paluu aiempaan poistaa sen listalta");
    assert.equal(yhdistaAiemmatPolut(["/a"], undefined, null, "/c"), null);
    assert.equal(yhdistaAiemmatPolut(["/a"], undefined, "/c", "/c"), null);
  });

  await test("K2. yhdistaAiemmatPolut: itsekorjaus, ei toistoja, tyhjä ja puuttuva lista, rinnakkaiset muutokset", () => {
    // Julkaisu luonnoksesta, josta webhookin lisäys puuttui: ennen-listan /a palautetaan.
    assert.deepEqual(yhdistaAiemmatPolut([], ["/a"], "/b", "/c"), ["/b", "/a"]);
    assert.deepEqual(yhdistaAiemmatPolut(null, ["/a"], null, "/c"), ["/a"], "itsekorjaus ilman osoitteen muutosta");
    assert.equal(yhdistaAiemmatPolut(["/a"], ["/a"], "/c", "/c"), null);
    // Uusi osoite ei koskaan jää listalle, ei edes ennen-listasta.
    assert.deepEqual(yhdistaAiemmatPolut(["/a", "/c"], ["/a", "/c"], "/b", "/c"), ["/a", "/b"]);
    assert.deepEqual(yhdistaAiemmatPolut(["/a", "/a"], undefined, "/b", "/c"), ["/a", "/b"], "ei toistoja");
    assert.deepEqual(yhdistaAiemmatPolut([], [], "/a", "/b"), ["/a"], "tyhjä lista");
    assert.deepEqual(yhdistaAiemmatPolut(undefined, null, "/a", "/b"), ["/a"], "puuttuva lista");
    // Kaksi nopeaa julkaisua (A→B ja B→C): webhookit näkevät molemmat nykyisen C:n.
    const ensimmainen = aiempienPolkujenMuutos([], [], "/a", "/c");
    const toinen = aiempienPolkujenMuutos([], [], "/b", "/c");
    const tulos = [...(ensimmainen?.lisaa ?? []), ...(toinen?.lisaa ?? [])];
    assert.deepEqual(tulos.sort(), ["/a", "/b"]);
  });

  await test("K2. atomiset mutaatiot: insert tyhjään ja puuttuvaan listaan setIfMissingin jälkeen, rinnakkaiset ajot", () => {
    const sovella = (doc: Record<string, unknown>, mutaatiot: unknown[]) =>
      mutaatiot.reduce<Record<string, unknown>>(
        (d, m) => new Mutation({ mutations: [m as never] }).apply(d as never) as Record<string, unknown>,
        doc,
      );
    const pohja = { _id: "sivu-x", _type: "sivu", _rev: "r1", slug: { current: "c" } };

    // Puuttuva kenttä: setIfMissing + insert after [-1].
    const m1 = aiempienPolkujenMutaatiot("sivu-x", aiempienPolkujenMuutos(undefined, undefined, "/a", "/c")!);
    assert.deepEqual(m1[0], { patch: { id: "sivu-x", setIfMissing: { aiemmatPolut: [] } } }, "ensin setIfMissing");
    assert.ok(m1.every((m) => !("set" in m.patch)), "ei koko listan settiä");
    assert.deepEqual(sovella(pohja, m1).aiemmatPolut, ["/a"]);
    // Tyhjä lista.
    assert.deepEqual(sovella({ ...pohja, aiemmatPolut: [] }, m1).aiemmatPolut, ["/a"]);

    // Rinnakkaiset ajot (A→B ja B→C): kumpikin laskee muutoksensa samasta tilasta, ja
    // lisäykset sovelletaan peräkkäin: kumpikaan ei ylikirjoita toista.
    const a = aiempienPolkujenMutaatiot("sivu-x", aiempienPolkujenMuutos([], [], "/a", "/c")!);
    const b = aiempienPolkujenMutaatiot("sivu-x", aiempienPolkujenMuutos([], [], "/b", "/c")!);
    assert.deepEqual(sovella({ ...pohja, aiemmatPolut: [] }, [...a, ...b]).aiemmatPolut, ["/a", "/b"]);
    assert.deepEqual(sovella({ ...pohja, aiemmatPolut: [] }, [...b, ...a]).aiemmatPolut, ["/b", "/a"]);

    // Paluu aiempaan osoitteeseen: unset poistaa sen, ja vanha lisätään.
    const paluu = aiempienPolkujenMutaatiot("sivu-x", aiempienPolkujenMuutos(["/a"], ["/a"], "/b", "/a")!);
    assert.deepEqual(sovella({ ...pohja, aiemmatPolut: ["/a"] }, paluu).aiemmatPolut, ["/b"]);

    // Satunnainen toisto siivotaan seuraavalla ajolla.
    const toisto = aiempienPolkujenMuutos(["/a", "/b", "/a"], ["/a", "/b", "/a"], "/c", "/c");
    assert.deepEqual(toisto, { lisaa: [], poista: [], toistot: ["/a"] });
    assert.deepEqual(sovella({ ...pohja, aiemmatPolut: ["/a", "/b", "/a"] }, aiempienPolkujenMutaatiot("sivu-x", toisto!)).aiemmatPolut, ["/b", "/a"]);

    // Webhookin oma patch laukaisee uuden webhookin: ei muutosta, ei silmukkaa.
    assert.equal(aiempienPolkujenMuutos(["/a"], [], "/c", "/c"), null);
    assert.equal(aiempienPolkujenMuutos(["/a"], ["/a"], "/c", "/c"), null);
    // Lainausmerkki osoitteessa ei riko suodatinta.
    const lainaus = aiempienPolkujenMutaatiot("x", { lisaa: [], poista: ['/a"b'], toistot: [] });
    assert.deepEqual(lainaus[1], { patch: { id: "x", unset: ['aiemmatPolut[@ == "/a\\"b"]'] } });
  });

  await test("18. osoitteenMuutos", () => {
    assert.deepEqual(
      osoitteenMuutos("sivu", { slug: "klubi/historia" }, { _id: "s", _type: "sivu", slug: "klubi/tarina" }),
      { vanha: "/klubi/historia", uusi: "/klubi/tarina" },
    );
    assert.deepEqual(osoitteenMuutos("uutinen", { slug: "a" }, { _id: "u", _type: "uutinen", slug: "b" }), {
      vanha: "/uutiset/a",
      uusi: "/uutiset/b",
    });
    assert.deepEqual(
      osoitteenMuutos("jalkapalloTilasto", { slug: "x", category: "muu" }, { _id: "t", _type: "jalkapalloTilasto", slug: "x", category: "karsinta" }),
      { vanha: "/jalkapalloarkisto/tilastot/x", uusi: "/jalkapalloarkisto/karsinnat/x" },
    );
    const lohko = osoitteenMuutos(
      "jalkapalloTilasto",
      { slug: "lohko-a" },
      { _id: "t", _type: "jalkapalloTilasto", slug: "lohko-b", parent: { _type: "arvokisa", slug: "mm-2026" } },
    );
    assert.equal(lohko.vanha, null, "taulukko viittaajan sivulla: yhteistä sivua ei tallenneta");
    assert.deepEqual(osoitteenMuutos("kaupunki", { slug: "lahti" }, { _id: "k", _type: "kaupunki", slug: "lahti-fi" }), {
      vanha: "lahti",
      uusi: "lahti-fi",
    });
    assert.deepEqual(osoitteenMuutos("uutisKategoria", { slug: "a" }, { _id: "k", _type: "uutisKategoria", slug: "b" }), {
      vanha: "a",
      uusi: "b",
    });
    assert.deepEqual(osoitteenMuutos("lehtileike", { slug: "a" }, { _id: "l", _type: "lehtileike", slug: "b" }), {
      vanha: null,
      uusi: null,
    });
    assert.deepEqual(osoitteenMuutos("uutinen", null, { _id: "u", _type: "uutinen", slug: "b" }), { vanha: null, uusi: "/uutiset/b" });
  });

  await test("18b. osion yhteistä sivua ei tallenneta aiemmaksi osoitteeksi (ankkuri)", () => {
    const tilasto = (category: string, extra = {}) => ({ _id: "t", _type: "jalkapalloTilasto", slug: "x", category, ...extra });
    assert.deepEqual(osoitteenMuutos("jalkapalloTilasto", { slug: "x", category: "champions" }, tilasto("valmentajat")), {
      vanha: null,
      uusi: "/jalkapalloarkisto/valmentajat",
    });
    const huuhkajat = osoitteenMuutos(
      "jalkapalloTilasto",
      { slug: "x", category: "huuhkajat", huuhkajatOsio: "pelaajatilastot" },
      tilasto("huuhkajat", { huuhkajatOsio: "maajoukkue" }),
    );
    assert.equal(huuhkajat.vanha, null);
    assert.equal(osoitteenMuutos("jalkapalloTilasto", { slug: "y", category: "champions" }, tilasto("champions")).vanha, null);
    // Omalta sivulta osion yhteiselle sivulle: vanha oma sivu tallennetaan.
    assert.deepEqual(osoitteenMuutos("jalkapalloTilasto", { slug: "x", category: "muu" }, tilasto("champions")), {
      vanha: "/jalkapalloarkisto/tilastot/x",
      uusi: "/jalkapalloarkisto/mestarit",
    });
  });

  await test("itsekorjaus vain, kun osoite muuttui tai edellinen versio on tuore", () => {
    const nyt = new Date("2026-10-08T12:00:00Z");
    assert.equal(itsekorjausSallittu({ slug: "a" }, "/a", "/b", nyt), true, "osoite muuttui");
    assert.equal(itsekorjausSallittu({ _updatedAt: "2026-10-08T11:55:00Z" }, "/b", "/b", nyt), true, "5 min sitten");
    assert.equal(itsekorjausSallittu({ _updatedAt: "2026-10-08T11:49:00Z" }, "/b", "/b", nyt), false, "11 min sitten");
    assert.equal(itsekorjausSallittu({}, "/b", "/b", nyt), false, "ei aikaa");
    assert.equal(itsekorjausSallittu(null, "/b", "/c", nyt), false);
  });

  await test("tyhjennaKopiosta: kopio ei peri vanhoja osoitteita", () => {
    assert.ok(KOPIOSTA_POISTETTAVAT.includes("aiemmatPolut") && KOPIOSTA_POISTETTAVAT.includes("muutLegacyUrlit"));
    const doc = { _id: "a", _type: "sivu", title: "T", body: [1], aiemmatPolut: ["/x"], muutLegacyUrlit: ["/y.htm"] };
    assert.deepEqual(tyhjennaKopiosta(doc), { _id: "a", _type: "sivu", title: "T", body: [1] });
    assert.deepEqual(doc.aiemmatPolut, ["/x"], "alkuperäinen ennallaan");
  });

  await test("webhookin käsittely: vanha projektio, luonti, ei muutosta, osoitteen muutos", () => {
    assert.equal(aiemmanOsoitteenKasittely({ _type: "sivu", slug: "a" }), "varoitus");
    assert.equal(aiemmanOsoitteenKasittely({ _type: "kaupunki", slug: "a" }), "varoitus");
    assert.equal(aiemmanOsoitteenKasittely({ _type: "etusivu" }), "ohita");
    assert.equal(aiemmanOsoitteenKasittely({ _id: "s", _type: "sivu", slug: "a", operaatio: "create", ennen: null }), "ohita");
    assert.equal(aiemmanOsoitteenKasittely({ _id: "s", _type: "sivu", slug: "a", operaatio: "delete", ennen: { slug: "a" } }), "ohita");
    assert.equal(aiemmanOsoitteenKasittely({ _id: "r", _type: "ravintola", slug: "a", operaatio: "update", ennen: { slug: "a" } }), "ohita");
    assert.equal(aiemmanOsoitteenKasittely({ _id: "s", _type: "sivu", slug: "b", operaatio: "update", ennen: { slug: "a" } }), "tarkista");
    assert.equal(aiemmanOsoitteenKasittely({ _id: "t", _type: "jalkapalloTilasto", slug: "a", operaatio: "update", ennen: { slug: "a" } }), "tarkista");
    assert.equal(
      aiemmanOsoitteenKasittely({ _id: "s", _type: "sivu", slug: "a", operaatio: "update", ennen: { slug: "a", aiemmatPolut: ["/x"] } }),
      "tarkista",
    );
  });

  await test("tallennaAiempiOsoite: versiot, puuttuva dokumentti, ristiriita, lopullinen virhe, itsekorjauksen ikkuna", async () => {
    type Haku = { doc: Record<string, unknown> | null; versiot: { _id: string; aiemmatPolut?: string[] }[] };
    const korvike = (haut: Haku[], virheet: (Error & { statusCode?: number })[] = []) => {
      const kirjoitukset: { patch: { id: string } }[][] = [];
      let hakuja = 0;
      const client: KirjoittavaClient = {
        fetch: async <T,>() => haut[Math.min(hakuja++, haut.length - 1)] as T,
        mutate: async (m) => {
          const virhe = virheet.shift();
          if (virhe) throw virhe;
          kirjoitukset.push(m);
          return {};
        },
      };
      return { client, kirjoitukset, hakuja: () => hakuja };
    };
    const ristiriita = () => Object.assign(new Error("Conflict"), { statusCode: 409 });
    const kutsu = { _id: "sivu-1", _type: "sivu", slug: "uusi", ennen: { slug: "vanha" } };
    const doc = { _id: "sivu-1", _type: "sivu", slug: "uusi" };
    const idt = (k: { patch: { id: string } }[]) => [...new Set(k.map((m) => m.patch.id))];

    // Vain julkaistu versio: ei patchia puuttuvaan luonnokseen.
    const a = korvike([{ doc, versiot: [{ _id: "sivu-1" }] }]);
    assert.equal(await hiljaaAsync(() => tallennaAiempiOsoite(a.client, kutsu)), "ok");
    assert.deepEqual(idt(a.kirjoitukset[0]), ["sivu-1"]);

    // Julkaistu ja luonnos: vain se, josta osoite puuttuu.
    const b = korvike([{ doc, versiot: [{ _id: "sivu-1" }, { _id: "drafts.sivu-1", aiemmatPolut: ["/vanha"] }] }]);
    assert.equal(await hiljaaAsync(() => tallennaAiempiOsoite(b.client, kutsu)), "ok");
    assert.deepEqual(idt(b.kirjoitukset[0]), ["sivu-1"]);
    const b2 = korvike([{ doc, versiot: [{ _id: "sivu-1" }, { _id: "drafts.sivu-1" }] }]);
    assert.equal(await hiljaaAsync(() => tallennaAiempiOsoite(b2.client, kutsu)), "ok");
    assert.deepEqual(idt(b2.kirjoitukset[0]), ["sivu-1", "drafts.sivu-1"], "yksi transaktio molemmille");

    // Dokumentti poistettiin välissä.
    const c = korvike([{ doc: null, versiot: [] }]);
    assert.equal(await hiljaaAsync(() => tallennaAiempiOsoite(c.client, kutsu)), "ei-muutosta");
    assert.equal(c.kirjoitukset.length, 0);

    // Ristiriita kahdesti, sitten onnistuu: tuore haku joka kerralla.
    const d = korvike([{ doc, versiot: [{ _id: "sivu-1" }] }], [ristiriita(), ristiriita()]);
    assert.equal(await hiljaaAsync(() => tallennaAiempiOsoite(d.client, kutsu)), "ok");
    assert.equal(d.hakuja(), 3);

    // Ristiriita joka kerta: lopullinen virhe (webhook vastaa 500).
    const e = korvike([{ doc, versiot: [{ _id: "sivu-1" }] }], Array.from({ length: YRITYKSET }, ristiriita));
    assert.equal(await hiljaaAsync(() => tallennaAiempiOsoite(e.client, kutsu)), "virhe");
    assert.equal(e.hakuja(), YRITYKSET);

    // Muu virhe: ei uudelleenyritystä.
    const f = korvike([{ doc, versiot: [{ _id: "sivu-1" }] }], [new Error("verkko")]);
    assert.equal(await hiljaaAsync(() => tallennaAiempiOsoite(f.client, kutsu)), "virhe");
    assert.equal(f.hakuja(), 1);

    // Osoite ei muuttunut eikä ennen-listaa: ei hakua.
    const g = korvike([{ doc, versiot: [] }]);
    assert.equal(await tallennaAiempiOsoite(g.client, { ...kutsu, ennen: { slug: "uusi" } }), "ei-muutosta");
    assert.equal(g.hakuja(), 0);

    // Itsekorjaus vain tuoreelle edelliselle versiolle: kehittäjän poisto pysyy.
    const nyt = () => new Date("2026-10-08T12:00:00Z");
    const ennen = { slug: "uusi", aiemmatPolut: ["/a", "/virhe"] };
    const h = korvike([{ doc, versiot: [{ _id: "sivu-1", aiemmatPolut: ["/a"] }] }]);
    const vanhaVersio = { ...kutsu, ennen: { ...ennen, _updatedAt: "2026-10-08T10:00:00Z" } };
    assert.equal(await hiljaaAsync(() => tallennaAiempiOsoite(h.client, vanhaVersio, nyt)), "ei-muutosta");
    const i = korvike([{ doc, versiot: [{ _id: "sivu-1", aiemmatPolut: ["/a"] }] }]);
    const tuoreVersio = { ...kutsu, ennen: { ...ennen, _updatedAt: "2026-10-08T11:59:00Z" } };
    assert.equal(await hiljaaAsync(() => tallennaAiempiOsoite(i.client, tuoreVersio, nyt)), "ok");
  });

  await test("19. polunMuutosViesti ja alasivut", () => {
    const sivu = polunMuutosViesti("uutinen", undefined, "vanha");
    assert.equal(sivu.taso, "info");
    assert.ok(sivu.viesti.includes("ohjautuu automaattisesti"));
    assert.ok(sivu.viesti.startsWith('Julkaistu osoite on "vanha".'));
    for (const category of ["mestarit", "champions", "huuhkajat"]) {
      const t = polunMuutosViesti("jalkapalloTilasto", category, "x");
      assert.equal(t.taso, "info");
      assert.ok(t.viesti.includes("(#x)"), category);
    }
    assert.ok(polunMuutosViesti("jalkapalloTilasto", "karsinta", "x").viesti.includes("ohjautuu automaattisesti"));
    assert.ok(polunMuutosViesti("kaupunki", undefined, "lahti").viesti.includes("?kaupunki=lahti"));
    assert.ok(polunMuutosViesti("uutisKategoria", undefined, "x").viesti.includes("/uutiset?kategoria=x"));
    assert.equal(polunMuutosViesti("lehtileike", undefined, "x").taso, "warning");
    // Alasivujen viesti vain, kun alasivuja on.
    assert.ok(!polunMuutosViesti("sivu", undefined, "klubi/historia", 0).viesti.includes("alasivu"));
    assert.ok(polunMuutosViesti("sivu", undefined, "klubi/historia", 1).viesti.includes("Tällä sivulla on 1 alasivu:"));
    assert.ok(polunMuutosViesti("sivu", undefined, "klubi/historia", 3).viesti.includes("Alasivujen osoitteet eivät muutu. Tällä sivulla on 3 alasivua: muuta niiden osoitteet erikseen."));
    assert.ok(!polunMuutosViesti("uutinen", undefined, "x", 3).viesti.includes("alasivu"), "vain sivulla");
  });

  await test("kaupungin vanha tunniste (korjaaKaupunki)", () => {
    const facets = {
      cities: [
        { name: "Lahti", slug: "lahti-fi", country: "Suomi", maakunta: "paijat-hame", count: 3, aiemmatTunnisteet: ["lahti"] },
        { name: "Tampere", slug: "tampere", country: "Suomi", maakunta: "pirkanmaa", count: 2 },
      ],
      countries: [],
      maakunnat: [],
      total: 5,
      closedCount: 0,
      firstVisitYear: null,
    } satisfies RavintolatFacetData;
    const f = (kaupunki: string | null) => ({ ...RAVINTOLA_DEFAULT_FILTERS, kaupunki });
    assert.equal(korjaaKaupunki(f("lahti"), facets).kaupunki, "lahti-fi", "vanha → uusi");
    assert.equal(korjaaKaupunki(f("tampere"), facets).kaupunki, "tampere", "nykyinen ennallaan");
    assert.equal(korjaaKaupunki(f("oulu"), facets).kaupunki, "oulu", "tuntematon ennallaan");
    assert.equal(korjaaKaupunki(f(null), facets).kaupunki, null);
  });

  await test("22. ohjauskartan kysely: tyyppilista = OHJATTAVAT_TYYPIT, piilotetut pois", async () => {
    const lista = /_type in \[([^\]]+)\]\s*&& count\(aiemmatPolut\)/.exec(ohjauskarttaQuery)?.[1];
    assert.ok(lista, "tyyppilista löytyy");
    const tyypit = [...lista.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(new Set(tyypit), new Set(OHJATTAVAT_TYYPIT));
    assert.equal(tyypit.length, OHJATTAVAT_TYYPIT.size);

    const nyt = new Date().toISOString();
    const dataset = [
      { _id: "ohjaus-b", _type: "ohjaus", lahde: "/b", minne: { tyyppi: "osoite", href: "https://forms.gle/x" } },
      { _id: "ohjaus-a", _type: "ohjaus", lahde: "/a", minne: { tyyppi: "sivu", kohde: { _type: "reference", _ref: "sivu-1" } } },
      { _id: "ohjaus-kesken", _type: "ohjaus" },
      { _id: "sivu-1", _type: "sivu", slug: { current: "klubi/saannot" }, title: "Säännöt", aiemmatPolut: ["/saannot"], _updatedAt: nyt },
      { _id: "uutinen-ajastettu", _type: "uutinen", slug: { current: "tuleva" }, publishedAt: "2999-01-01T00:00:00Z", aiemmatPolut: ["/uutiset/x"] },
      { _id: "uutinen-1", _type: "uutinen", slug: { current: "uusi" }, publishedAt: "2020-01-01T00:00:00Z", aiemmatPolut: ["/uutiset/vanha"] },
      { _id: "kaupunki-1", _type: "kaupunki", slug: { current: "lahti" }, aiemmatPolut: ["lahti-vanha"] },
    ];
    const tulos = (await (await evaluate(parse(ohjauskarttaQuery), { dataset })).get()) as {
      ohjaukset: { _id: string; lahde: string; minne: { tyyppi: string; href?: string; kohde?: { slug: string } } }[];
      dokumentit: { _id: string; slug: string; aiemmatPolut: string[] }[];
    };
    assert.deepEqual(tulos.ohjaukset.map((o) => o._id), ["ohjaus-a", "ohjaus-b"], "_id-järjestys, keskeneräinen pois");
    assert.equal(tulos.ohjaukset[0].minne.kohde?.slug, "klubi/saannot", "viittaus puretaan");
    assert.deepEqual(tulos.dokumentit.map((d) => d._id).sort(), ["sivu-1", "uutinen-1"], "ajastettu uutinen ja tunnisteet pois");
  });

  await test("23. reitit käyttävät ohjaaTaiEiLoydy(polku) notFound():n sijaan", () => {
    const juuri = join(process.cwd(), "app", "(public)");
    const loydetyt: string[] = [];
    let kutsuja = 0;
    const kay = (kansio: string) => {
      for (const nimi of readdirSync(kansio)) {
        const polku = join(kansio, nimi);
        if (statSync(polku).isDirectory()) {
          kay(polku);
          continue;
        }
        if (!/\.tsx?$/.test(nimi)) continue;
        const rivit = readFileSync(polku, "utf-8").split("\n");
        rivit.forEach((rivi, i) => {
          const koodi = rivi.trim();
          if (koodi.startsWith("*") || koodi.startsWith("//") || koodi.startsWith("/*")) return;
          if (/\bnotFound\s*\(/.test(koodi)) loydetyt.push(`${polku}:${i + 1}`);
          if (/ohjaaTaiEiLoydy\(/.test(koodi) && !koodi.startsWith("import")) kutsuja += 1;
        });
      }
    };
    kay(juuri);
    assert.deepEqual(
      loydetyt,
      [],
      `Käytä ohjaaTaiEiLoydy(polku) notFound():n sijaan (docs/07): muuten lyhytosoitteet ja muuttuneet osoitteet eivät toimi tässä reitissä.\n${loydetyt.join("\n")}`,
    );
    assert.ok(kutsuja >= 21, `ohjaaTaiEiLoydy-kutsuja ${kutsuja}, odotettiin vähintään 21`);
  });

  await test("24. polkuMuuttunut-säännön tyypit ovat ohjattavia tai tunnisteita", () => {
    const kansio = join(process.cwd(), "sanity", "schemas", "documents");
    const kayttajat: string[] = [];
    for (const nimi of readdirSync(kansio)) {
      const sisalto = readFileSync(join(kansio, nimi), "utf-8");
      if (!/polkuMuuttunut\(/.test(sisalto)) continue;
      const tyyppi = /defineType\(\{\s*name:\s*"([^"]+)"/.exec(sisalto)?.[1];
      assert.ok(tyyppi, nimi);
      kayttajat.push(tyyppi);
      assert.ok(OHJATTAVAT_TYYPIT.has(tyyppi) || TUNNISTE_TYYPIT.has(tyyppi), `${tyyppi} (${nimi})`);
    }
    assert.ok(kayttajat.length >= 12, `polkuMuuttunut-käyttäjiä ${kayttajat.length}`);
  });

  assert.ok(virheita >= 3, "silmukat kirjattiin console.erroriin");
  console.log(`\n${ok} testiä ok`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
