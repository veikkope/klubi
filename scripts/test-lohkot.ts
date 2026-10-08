/**
 * Tekstin lohkojen, kuvien poiminnan ja uutiskortin testit (docs/24 askel 2 ja 2b):
 * lib/sisaltolohkot.ts sekä GROQ-projektiot `runko`, `korttikuva()` ja
 * `uutisKortti` groq-js:llä ajettuina (sama kielen toteutus kuin Sanityssa).
 *
 * Ajo: npm run test:lohkot
 */
import assert from "node:assert/strict";

import { evaluate, parse } from "groq-js";

import { lukuaika } from "../lib/artikkeli";
import {
  KUVAN_MIN_LEVEYS_SISALTO,
  PERUSLOHKOT,
  RIKKAAT_LOHKOT,
  ensimmainenIsoKuva,
  korttiOte,
  korttiTeksti,
  kuvanMitat,
  sisallonKuvat,
} from "../lib/sisaltolohkot";
import { runko } from "../sanity/lib/queries/kuvat";
import { uutisKortti } from "../sanity/lib/queries/uutiskortti";

let ok = 0;
async function test(nimi: string, fn: () => void | Promise<void>) {
  await fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const kuvaRef = (id: string, w: number, h = 1000) => `image-${id}-${w}x${h}-jpg`;
const kuva = (id: string, w: number, h = 1000) => ({
  _type: "imageWithAlt",
  _key: id,
  alt: `Kuva ${id}`,
  asset: { _type: "reference", _ref: kuvaRef(id, w, h) },
});
const sarjanKuva = (id: string, w: number | null, h = 1000) => ({
  _type: "galleriaKuva",
  _key: id,
  ...(w === null ? {} : { asset: { _type: "reference", _ref: kuvaRef(id, w, h) } }),
});
const kuvasarja = (...kuvat: ReturnType<typeof sarjanKuva>[]) => ({
  _type: "kuvasarja",
  _key: `sarja-${kuvat.map((k) => k._key).join("")}`,
  kuvaus: "Klubin vappu 2026",
  asettelu: "ruudukko",
  kuvat,
});
const kappale = (text: string, extra: Record<string, unknown> = {}) => ({
  _type: "block",
  _key: text.slice(0, 8),
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: "s", text, marks: [] }],
  ...extra,
});

async function main() {
  await test("RIKKAAT_LOHKOT ilman toistoja, PERUSLOHKOT osajoukko oikeassa järjestyksessä", () => {
    assert.equal(new Set(RIKKAAT_LOHKOT).size, RIKKAAT_LOHKOT.length);
    assert.deepEqual([...PERUSLOHKOT], ["imageWithAlt", "kokoonpano", "youtubeVideo"]);
    for (const l of PERUSLOHKOT) assert.ok((RIKKAAT_LOHKOT as readonly string[]).includes(l), l);
    assert.ok((RIKKAAT_LOHKOT as readonly string[]).includes("kuvasarja"));
  });

  await test("kuvanMitat: mitat viittauksesta, tiedosto tai puuttuva → null", () => {
    assert.deepEqual(kuvanMitat({ asset: { _ref: "image-abc-2016x1512-jpg" } }), { w: 2016, h: 1512 });
    assert.equal(kuvanMitat({ asset: { _ref: "file-abc-pdf" } }), null);
    assert.equal(kuvanMitat(undefined), null);
    assert.equal(kuvanMitat(null), null);
  });

  await test("sisallonKuvat: kuvat ja kuvasarjan kuvat järjestyksessä, ilman assetia pois", () => {
    const A = kuva("A", 800);
    const B = sarjanKuva("B", 900);
    const C = sarjanKuva("C", null);
    const D = kuva("D", 700);
    const tulos = sisallonKuvat([kappale("Teksti"), A, kuvasarja(B, C), D]);
    assert.deepEqual(tulos, [A, B, D]);
    assert.deepEqual(sisallonKuvat(null), []);
    assert.deepEqual(sisallonKuvat([{ _type: "imageWithAlt" }]), []);
  });

  await test("ensimmainenIsoKuva: 397 px ohitetaan, kuvasarjan 1645 px valitaan", () => {
    const iso = sarjanKuva("iso", 1645, 2048);
    assert.equal(ensimmainenIsoKuva([kuva("pieni", 397), kuvasarja(sarjanKuva("p2", 300), iso)]), iso);
    assert.equal(ensimmainenIsoKuva([kuva("pieni", 397), kuvasarja(sarjanKuva("p2", 300))]), null);
    assert.equal(ensimmainenIsoKuva(undefined), null);
    assert.equal(KUVAN_MIN_LEVEYS_SISALTO, 600);
    // Raja on "vähintään": tasan 600 px kelpaa.
    const tasan = kuva("tasan", 600);
    assert.equal(ensimmainenIsoKuva([tasan]), tasan);
  });

  await test("lukuaika ei muutu, kun tekstissä on kuvasarja", () => {
    const sanoja = Array.from({ length: 400 }, (_, i) => `sana${i}`).join(" ");
    const pelkka = [kappale(sanoja)];
    const sarjalla = [kappale(sanoja), kuvasarja(sarjanKuva("x", 1000), sarjanKuva("y", 1000))];
    assert.equal(lukuaika(sarjalla), lukuaika(pelkka));
    assert.notEqual(lukuaika(pelkka), null);
  });

  await test("korttiOte: välilyönnit yhdeksi, enintään 200 merkkiä sanarajalla ja …", () => {
    assert.equal(korttiOte(null), null);
    assert.equal(korttiOte("   \n "), null);
    assert.equal(korttiOte("Ohjelma:\n\n10:00  Lähtö torilta."), "Ohjelma: 10:00 Lähtö torilta.");
    const pitka = Array.from({ length: 50 }, (_, i) => `sana${i}`).join(" "); // yli 250 merkkiä
    const ote = korttiOte(pitka);
    assert.ok(ote && ote.length <= 200, `pituus ${ote?.length}`);
    assert.ok(ote.endsWith("…"));
    // Ei katkea kesken sanan: viimeinen sana ennen "…" on kokonainen sana tekstistä.
    const viimeinen = ote.slice(0, -1).split(" ").at(-1)!;
    assert.ok(pitka.split(" ").includes(viimeinen), viimeinen);
    assert.equal(korttiOte("Lyhyt teksti."), "Lyhyt teksti.");
  });

  await test("korttiTeksti: Lyhenne ensin, muuten tekstin alku", () => {
    assert.equal(korttiTeksti({ excerpt: "A", ote: "B" }), "A");
    assert.equal(korttiTeksti({ ote: "B" }), "B");
    assert.equal(korttiTeksti({ excerpt: "  ", ote: "B" }), "B");
    assert.equal(korttiTeksti({}), null);
  });

  /* ---------------------------------------------------------------------- */
  /* GROQ (groq-js)                                                          */
  /* ---------------------------------------------------------------------- */

  const asset = (id: string, w: number) => ({
    _id: kuvaRef(id, w),
    _type: "sanity.imageAsset",
    metadata: {
      dimensions: { width: w, height: 1000 },
      lqip: `lqip-${id}`,
      palette: { dominant: { background: `#${id}` } },
    },
  });
  const dataset = [
    asset("kansi", 1200),
    asset("pieni", 397),
    asset("iso", 2016),
    asset("s300", 300),
    asset("s1500", 1500),
    {
      _id: "a",
      _type: "uutinen",
      title: "Kansikuva",
      slug: { current: "a" },
      excerpt: "Lyhenne",
      coverImage: { _type: "imageWithAlt", alt: "Kansi", asset: { _type: "reference", _ref: kuvaRef("kansi", 1200) } },
      body: [kuva("iso", 2016)],
    },
    {
      _id: "b",
      _type: "uutinen",
      title: "Tekstikuvat",
      slug: { current: "b" },
      tiivistelma: "Tiivistelmä",
      body: [kappale("Alku"), kuva("pieni", 397), kuva("iso", 2016)],
    },
    {
      _id: "c",
      _type: "uutinen",
      title: "Kuvasarja",
      slug: { current: "c" },
      body: [
        kappale("Eka kappale."),
        { ...kappale("Luettelon kohta."), listItem: "bullet", level: 1 },
        kappale("Otsikko", { style: "h2" }),
        kasvatettuSarja(),
        kappale("Toka kappale."),
        kappale("Kolmas kappale."),
        kappale("Neljäs kappale."),
      ],
    },
    {
      _id: "d",
      _type: "uutinen",
      title: "Ei kuvia",
      slug: { current: "d" },
      excerpt: "Lyhenne",
      // Kansikuvaobjekti ilman assetia (keskeneräinen lataus) ei kelpaa.
      coverImage: { _type: "imageWithAlt" },
      body: [kappale("Pelkkää tekstiä."), kuva("pieni", 397)],
    },
  ];
  function kasvatettuSarja() {
    return kuvasarja(sarjanKuva("s300", 300), sarjanKuva("s1500", 1500), sarjanKuva("kesken", null));
  }

  async function aja<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
    const tulos = await evaluate(parse(query, { params }), { dataset, params });
    return (await tulos.get()) as T;
  }
  type Kortti = {
    _id: string;
    excerpt: string | null;
    ote: string | null;
    tiivistelma: string | null;
    coverImage: { asset?: { _ref?: string }; lqip?: string; alt?: string } | null;
  };
  const kortit = await aja<Kortti[]>(`*[_type == "uutinen"] | order(_id asc){${uutisKortti}}`);
  const kortti = (id: string) => kortit.find((k) => k._id === id)!;

  await test("groq (a): kansikuva voittaa tekstin kuvan", () => {
    assert.equal(kortti("a").coverImage?.asset?._ref, kuvaRef("kansi", 1200));
    assert.equal(kortti("a").coverImage?.alt, "Kansi");
    assert.equal(kortti("a").coverImage?.lqip, "lqip-kansi");
  });

  await test("groq (b): ilman kansikuvaa tekstin ensimmäinen ≥600 px kuva", () => {
    assert.equal(kortti("b").coverImage?.asset?._ref, kuvaRef("iso", 2016));
    assert.equal(kortti("b").coverImage?.lqip, "lqip-iso");
  });

  await test("groq (c): kuvasarjan ensimmäinen iso kuva", () => {
    assert.equal(kortti("c").coverImage?.asset?._ref, kuvaRef("s1500", 1500));
    assert.equal(kortti("c").coverImage?.lqip, "lqip-s1500");
  });

  await test("groq (d): ei isoa kuvaa → null", () => {
    assert.equal(kortti("d").coverImage, null);
  });

  await test("groq (e): runko lisää kuvasarjan kuviin lqip ja vari, kuvan lqip säilyy", async () => {
    const body = await aja<Record<string, unknown>[]>(`*[_id == "c"][0].body[]{${runko}}`);
    const sarja = body.find((b) => b._type === "kuvasarja") as {
      kuvaus: string;
      asettelu: string;
      kuvat: { _key: string; lqip: string; vari: string }[];
    };
    // Keskeneräinen kuva (ei assetia) jää pois, muut kentät säilyvät.
    assert.deepEqual(
      sarja.kuvat.map((k) => [k._key, k.lqip, k.vari]),
      [
        ["s300", "lqip-s300", "#s300"],
        ["s1500", "lqip-s1500", "#s1500"],
      ],
    );
    assert.equal(sarja.kuvaus, "Klubin vappu 2026");
    assert.equal(sarja.asettelu, "ruudukko");
    const bBody = await aja<Record<string, unknown>[]>(`*[_id == "b"][0].body[]{${runko}}`);
    const kuvat = bBody.filter((b) => b._type === "imageWithAlt");
    assert.deepEqual(
      kuvat.map((k) => k.lqip),
      ["lqip-pieni", "lqip-iso"],
    );
    assert.equal(bBody[0].lqip, undefined, "tekstikappale ei saa lqip-kenttää");
  });

  await test("groq (f): Lyhenne, Tiivistelmä ja tekstin alku kortissa", () => {
    // Lyhenne on: ote puuttuu.
    assert.equal(kortti("a").excerpt, "Lyhenne");
    assert.equal(kortti("a").ote, null);
    // Vain Tiivistelmä: excerpt = tiivistelmä, ote puuttuu.
    assert.equal(kortti("b").excerpt, "Tiivistelmä");
    assert.equal(kortti("b").ote, null);
    // Ei kumpaakaan: kolmen ensimmäisen tavallisen kappaleen teksti
    // (luettelo, otsikko ja kuvasarja ohitetaan).
    assert.equal(kortti("c").excerpt, null);
    assert.equal(kortti("c").ote, "Eka kappale.\n\nToka kappale.\n\nKolmas kappale.");
    assert.equal(korttiTeksti(kortti("c")), "Eka kappale. Toka kappale. Kolmas kappale.");
  });

  console.log(`\n${ok} testiä läpi.`);
}

main().catch((virhe) => {
  console.error(virhe);
  process.exit(1);
});
