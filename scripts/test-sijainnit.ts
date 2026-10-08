/**
 * Esikatselun Näkyy sivulla -tiedon ja tilastoryhmien testit (docs/24 askel 11,
 * lib/sijainnit.ts, lib/tilasto-kategoriat.ts, sanity/presentation.ts).
 *
 * - 23 kategoriaa samassa järjestyksessä kuin ennen, jokaisella ryhmä ja sääntö sivulle
 * - Studion ryhmät: jokainen taulukko täsmälleen yhdessä ryhmässä (GROQ groq-js:llä)
 * - sijainnit kaikille tyypeille, myös taulukko usealla sivulla
 * - aiemman objektikartan sivutyypit, lehtileike ja etusivu: sama tulos kuin ennen
 * - SIJAINTI_KYSELY ja sitemapin `parent` (VIITTAAJA) groq-js:llä
 * - funktiomuotoinen ratkaisija (sanity/presentation.ts) valekaupalla
 *
 * Productionin data ja sivusto: `npm run verify:sijainnit`.
 *
 * Ajo: npm run test:sijainnit
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { evaluate, parse } from "groq-js";
import { firstValueFrom, isObservable, of, throwError } from "rxjs";

import { HUUHKAJAT_OSIOT } from "../lib/huuhkajat-osiot";
import { OSIOSIVUT } from "../lib/osiosivut";
import {
  LITMANEN_LEHTILEIKKEET_PATH,
  LITMANEN_LOUKKAANTUMISET_PATH,
  LITMANEN_PATSAS_PATH,
  LITMANEN_SLUG,
  TILASTO_CATEGORY_DETAIL,
  TILASTO_CATEGORY_PAGE,
  documentHref,
  lehtileikeAnkkuri,
} from "../lib/path";
import {
  EI_OSOITETTA_VIESTI,
  OTTELU_ILMAN_AIKAA_VIESTI,
  OTTELU_NAKYY_ALUN_JALKEEN_MS,
  PELATTU_OTTELU_VIESTI,
  EI_SIVULLA_VIESTI,
  ENTINEN_JASEN_VIESTI,
  PIILOTETTU_KOMMENTTI_VIESTI,
  SIJAINTITYYPIT,
  SIVUTYYPIT,
  dokumentinSijainnit,
  tilastonSijainnit,
  type SijaintiDoc,
  type SijaintiTila,
} from "../lib/sijainnit";
import {
  TILASTORYHMAT,
  TILASTORYHMA_OLETUS,
  TILASTO_KATEGORIAT,
  TILASTO_KATEGORIA_VALINNAT,
  kategorianNimi,
  ryhmanKategoriat,
  ryhmanSuodatin,
  tilastonRyhma,
} from "../lib/tilasto-kategoriat";
import {
  SIJAINTI_KUUNTELU,
  SIJAINTI_KYSELY,
  SIJAINTI_PROJEKTIO,
  sijaintiParametrit,
} from "../sanity/lib/queries/sijainti";
import { VIITTAAJA, sitemapTilastotQuery } from "../sanity/lib/queries/sitemap";

let ok = 0;
async function test(nimi: string, fn: () => void | Promise<void>) {
  await fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

async function groq<T>(kysely: string, dataset: unknown[], params: Record<string, unknown> = {}): Promise<T> {
  return (await (await evaluate(parse(kysely), { dataset, params })).get()) as T;
}

/** Skeeman valintalista ennen askelta 11 (jalkapalloTilasto.ts), järjestys ja nimet. */
const ENNEN = [
  ["FIFA-ranking", "fifa-ranking"],
  ["Suomen mestarit", "champions"],
  ["Huuhkajat (maajoukkueen tilastot)", "huuhkajat"],
  ["Huuhkajien valmentajat", "valmentajat"],
  ["Valmentajien palkat", "valmentajien-palkat"],
  ["Vuoden pelaaja", "vuoden-pelaaja"],
  ["Lupaavat pelaajat", "lupaavat"],
  ["Ballon d'Or", "ballon-dor"],
  ["Maailman paras avaus", "maailman-parhaat"],
  ["Suomen jalkapallon saavutukset", "saavutukset"],
  ["Suomen jalkapallon järkytykset", "jarkytykset"],
  ["Champions League / Eurocup", "eurocup"],
  ["Europa League / UEFA Cup", "uefa-cup"],
  ["UEFA Super Cup", "super-cup"],
  ["Conference League / Cup Winners' Cup", "conference-league"],
  ["Intercontinental / Club World Cup", "intercontinental"],
  ["Karsinta", "karsinta"],
  ["Arvokisatilasto (MM, EM, Kansojen liiga)", "arvokisa"],
  ["Pelaajatilasto (yksittäinen pelaaja)", "pelaaja"],
  ["Ulkomaiden mestarit (Englanti, Venäjä …)", "ulkomaiset-mestarit"],
  ["Palloliiton puheenjohtajat", "palloliitto"],
  ["Klubin omat tilastot (veikkaus, mölkky, jouluruokailu)", "klubi"],
  ["Muu tilasto", "muu"],
].map(([title, value]) => ({ title, value }));

const tilasto = (over: Partial<SijaintiDoc>): SijaintiDoc => ({
  _id: "t1",
  _type: "jalkapalloTilasto",
  slug: "taulukko",
  nimi: "Taulukko",
  ...over,
});

const hrefit = (tila: SijaintiTila | null) => tila?.locations.map((l) => l.href) ?? null;

async function main() {
  /* ── Kategoriat ja ryhmät ─────────────────────────────────────────────── */

  await test("23 uniikkia kategoriaa, sama järjestys ja nimet kuin skeemassa ennen", () => {
    assert.equal(TILASTO_KATEGORIAT.length, 23);
    assert.equal(new Set(TILASTO_KATEGORIAT.map((k) => k.value)).size, 23);
    assert.deepEqual(TILASTO_KATEGORIA_VALINNAT, ENNEN);
  });

  await test("jokaisella kategorialla on ryhmä ja sääntö sivulle", () => {
    const ryhmat = new Set(TILASTORYHMAT.map((r) => r.id));
    for (const k of TILASTO_KATEGORIAT) {
      assert.ok(ryhmat.has(k.ryhma), `${k.value}: ryhmä ${k.ryhma}`);
      const saanto =
        k.value in TILASTO_CATEGORY_PAGE ||
        k.value in TILASTO_CATEGORY_DETAIL ||
        k.value === "huuhkajat" ||
        k.value === "ulkomaiset-mestarit" ||
        k.vaatiiViittaajan === true;
      assert.ok(saanto, `${k.value}: ei sääntöä sivulle`);
    }
    // Ja toisin päin: jokainen reitityksen kategoria on valintalistalla.
    const arvot = new Set(TILASTO_KATEGORIAT.map((k) => k.value));
    for (const k of [...Object.keys(TILASTO_CATEGORY_PAGE), ...Object.keys(TILASTO_CATEGORY_DETAIL)]) {
      assert.ok(arvot.has(k), `reitityksen kategoria ${k} puuttuu listasta`);
    }
    assert.deepEqual(
      TILASTO_KATEGORIAT.filter((k) => k.vaatiiViittaajan).map((k) => k.value),
      ["pelaaja", "klubi"],
    );
  });

  await test("ryhmät: viisi, järjestys ja ryhmien kategoriat", () => {
    assert.deepEqual(
      TILASTORYHMAT.map((r) => r.otsikko),
      ["Klubin omat tilastot", "Huuhkajat", "Karsinnat", "Arvokisat", "Muut arkiston taulukot"],
    );
    assert.deepEqual(ryhmanKategoriat("klubi"), ["klubi"]);
    assert.deepEqual(ryhmanKategoriat("huuhkajat"), ["huuhkajat"]);
    assert.deepEqual(ryhmanKategoriat("karsinnat"), ["karsinta"]);
    assert.deepEqual(ryhmanKategoriat("arvokisat"), ["arvokisa"]);
    assert.equal(ryhmanKategoriat("muut").length, 19);
    assert.equal(tilastonRyhma(undefined), TILASTORYHMA_OLETUS);
    assert.equal(tilastonRyhma("tuntematon"), TILASTORYHMA_OLETUS);
    assert.equal(tilastonRyhma("karsinta"), "karsinnat");
  });

  await test("kategorianNimi", () => {
    assert.equal(kategorianNimi("valmentajien-palkat"), "Valmentajien palkat");
    assert.equal(kategorianNimi("klubi"), "Klubin omat tilastot (veikkaus, mölkky, jouluruokailu)");
    assert.equal(kategorianNimi("vanha-arvo"), "vanha-arvo");
    assert.equal(kategorianNimi(null), "Kategoria puuttuu");
    assert.equal(kategorianNimi(""), "Kategoria puuttuu");
  });

  await test("Studion ryhmät (GROQ): jokainen taulukko täsmälleen yhdessä ryhmässä", async () => {
    const dataset = [
      ...TILASTO_KATEGORIAT.map((k, i) => ({ _id: `t${i}`, _type: "jalkapalloTilasto", category: k.value })),
      ...TILASTO_KATEGORIAT.map((k, i) => ({ _id: `drafts.t${i}`, _type: "jalkapalloTilasto", category: k.value })),
      { _id: "ilman", _type: "jalkapalloTilasto" },
      { _id: "drafts.ilman2", _type: "jalkapalloTilasto", category: null },
      { _id: "tyhja", _type: "jalkapalloTilasto", category: "" },
      { _id: "tuntematon", _type: "jalkapalloTilasto", category: "vanha-arvo" },
      { _id: "muu-tyyppi", _type: "sivu", category: "klubi" },
    ];
    const kaikki = dataset.filter((d) => d._type === "jalkapalloTilasto").map((d) => d._id);
    const nahty = new Map<string, string>();
    for (const r of TILASTORYHMAT) {
      const { filter, params } = ryhmanSuodatin(r.id);
      const idt = await groq<string[]>(`*[${filter}]._id`, dataset, params);
      for (const id of idt) {
        assert.ok(!nahty.has(id), `${id} sekä ryhmässä ${nahty.get(id)} että ${r.id}`);
        nahty.set(id, r.id);
        const doc = dataset.find((d) => d._id === id) as { category?: string | null };
        assert.equal(tilastonRyhma(doc.category), r.id, `${id}: tilastonRyhma vs. suodatin`);
      }
    }
    assert.deepEqual([...nahty.keys()].sort(), [...kaikki].sort());
  });

  /* ── Taulukon sijainnit ───────────────────────────────────────────────── */

  await test("taulukko: viittaajan sivu (klubi/sivu, klubin toiminta, arvokisa)", () => {
    assert.deepEqual(
      dokumentinSijainnit(
        tilasto({
          category: "klubi",
          viittaajat: [{ _type: "sivu", slug: "klubi/palloveikkaus/veikkausliiga", nimi: "Veikkausliiga" }],
        }),
      ),
      { locations: [{ title: "Veikkausliiga", href: "/klubi/palloveikkaus/veikkausliiga#taulukko" }] },
    );
    assert.deepEqual(
      hrefit(dokumentinSijainnit(tilasto({ category: "klubi", viittaajat: [{ _type: "klubiToiminta", slug: "molkky" }] }))),
      ["/klubi/toiminta/molkky#taulukko"],
    );
    assert.deepEqual(
      hrefit(dokumentinSijainnit(tilasto({ category: "arvokisa", viittaajat: [{ _type: "arvokisa", slug: "em-2008" }] }))),
      ["/jalkapalloarkisto/arvokisat/em-2008#taulukko"],
    );
  });

  await test("taulukko ilman sijaintia: huomio (klubi ja pelaaja ilman viittaajaa)", () => {
    for (const category of ["klubi", "pelaaja"]) {
      assert.deepEqual(dokumentinSijainnit(tilasto({ category })), {
        locations: [],
        message: EI_SIVULLA_VIESTI,
        tone: "caution",
      });
    }
    // Viittaajan kopiossa ilman osoitetta taulukko ei näy vielä missään.
    assert.equal(dokumentinSijainnit(tilasto({ category: "klubi", viittaajat: [{ _type: "sivu", slug: null }] }))?.message, EI_SIVULLA_VIESTI);
    // Osoite puuttuu (luonnos): arkiston taulukko näkyy vasta osoitteen jälkeen.
    assert.equal(dokumentinSijainnit(tilasto({ slug: null, category: "champions" }))?.message, EI_OSOITETTA_VIESTI);
    assert.equal(dokumentinSijainnit(tilasto({ slug: null, category: "klubi" }))?.message, EI_SIVULLA_VIESTI);
  });

  await test("taulukko: Huuhkajat-osio, oletusosio ja kauden karsintasivu", () => {
    assert.deepEqual(
      dokumentinSijainnit(tilasto({ category: "huuhkajat", huuhkajatOsio: "pelaajatilastot" })),
      { locations: [{ title: "Huuhkajat: Pelaajatilastot", href: "/jalkapalloarkisto/huuhkajat/pelaajatilastot#taulukko" }] },
    );
    assert.deepEqual(
      hrefit(dokumentinSijainnit(tilasto({ category: "huuhkajat", huuhkajatOsio: null }))),
      ["/jalkapalloarkisto/huuhkajat/muut#taulukko"],
    );
    assert.deepEqual(
      dokumentinSijainnit(
        tilasto({
          slug: "kansojen-liiga-2026-2027",
          category: "huuhkajat",
          huuhkajatOsio: "kansojen-liiga",
          kaudenOttelut: { nimi: "EM 2028 -karsinta", slug: "em-2028", category: "karsinta" },
        }),
      ),
      {
        locations: [
          { title: "Huuhkajat: Kansojen liiga", href: "/jalkapalloarkisto/huuhkajat/kansojen-liiga#kansojen-liiga-2026-2027" },
          { title: "EM 2028 -karsinta", href: "/jalkapalloarkisto/karsinnat/em-2028#kansojen-liiga-2026-2027" },
        ],
      },
    );
    // Viittaus muuhun kuin karsintaan ei näy karsintasivulla (karsintaBySlugQuery).
    assert.equal(
      hrefit(dokumentinSijainnit(tilasto({ category: "huuhkajat", kaudenOttelut: { slug: "x", category: "muu" } })))?.length,
      1,
    );
    // Kauden karsintasivu vain Huuhkajat-taulukolle.
    assert.equal(
      hrefit(dokumentinSijainnit(tilasto({ category: "muu", kaudenOttelut: { slug: "x", category: "karsinta" } })))?.length,
      1,
    );
  });

  await test("taulukko: oma sivu (karsinta, muu), maa ja arkiston sivut", () => {
    assert.deepEqual(
      dokumentinSijainnit(tilasto({ category: "karsinta", slug: "em-2028", nimi: "EM 2028" })),
      { locations: [{ title: "EM 2028", href: "/jalkapalloarkisto/karsinnat/em-2028" }] },
    );
    assert.deepEqual(hrefit(dokumentinSijainnit(tilasto({ category: "muu" }))), ["/jalkapalloarkisto/tilastot/taulukko"]);
    assert.deepEqual(
      dokumentinSijainnit(tilasto({ category: "ulkomaiset-mestarit", slug: "venajan-mestarit" })),
      {
        locations: [
          { title: "Venäjän mestarit", href: "/jalkapalloarkisto/ulkomaiset-mestarit/venaja#venajan-mestarit" },
        ],
      },
    );
    assert.deepEqual(dokumentinSijainnit(tilasto({ category: "valmentajien-palkat" })), {
      locations: [{ title: "Huuhkajien valmentajat", href: "/jalkapalloarkisto/valmentajat#taulukko" }],
    });
    assert.deepEqual(dokumentinSijainnit(tilasto({ category: "eurocup" })), {
      locations: [
        { title: "Champions League / Eurocup", href: "/jalkapalloarkisto/eurocupit/champions-league#taulukko" },
      ],
    });
    // Jokaisella arkiston kategorialla on ilman viittaajaa täsmälleen sitemapin osoite.
    for (const k of TILASTO_KATEGORIAT.filter((x) => !x.vaatiiViittaajan)) {
      const doc = tilasto({ category: k.value });
      assert.deepEqual(hrefit(dokumentinSijainnit(doc)), [documentHref(doc)], k.value);
    }
  });

  await test("taulukko usealla sivulla: mitalitaulukko jokaisen kisan sivulla, ei arvokisasivulla", () => {
    const doc = tilasto({
      slug: "kansojen-liigan-mitalistit",
      category: "arvokisa",
      viittaajat: [
        { _type: "arvokisa", slug: "kansojen-liiga-2019", nimi: "Kansojen liiga 2019" },
        { _type: "arvokisa", slug: "kansojen-liiga-2021", nimi: "Kansojen liiga 2021" },
      ],
    });
    assert.deepEqual(hrefit(dokumentinSijainnit(doc)), [
      "/jalkapalloarkisto/arvokisat/kansojen-liiga-2019#kansojen-liigan-mitalistit",
      "/jalkapalloarkisto/arvokisat/kansojen-liiga-2021#kansojen-liigan-mitalistit",
    ]);
    // Ilman kisaa arvokisasivun mitalitaulukoissa; sivun Taulukot-kenttä ei poista sitä sieltä.
    assert.deepEqual(hrefit(dokumentinSijainnit(tilasto({ category: "arvokisa" }))), ["/jalkapalloarkisto/arvokisat#taulukko"]);
    assert.deepEqual(
      hrefit(dokumentinSijainnit(tilasto({ category: "arvokisa", viittaajat: [{ _type: "sivu", slug: "x" }] }))),
      ["/x#taulukko", "/jalkapalloarkisto/arvokisat#taulukko"],
    );
    // Arkiston taulukko, johon sivu viittaa: molemmat sivut, sitemapin osoite ensin.
    const mestarit = tilasto({ category: "champions", viittaajat: [{ _type: "sivu", slug: "klubi/x" }] });
    assert.deepEqual(hrefit(dokumentinSijainnit(mestarit)), ["/klubi/x#taulukko", "/jalkapalloarkisto/mestarit#taulukko"]);
    assert.equal(dokumentinSijainnit(mestarit)?.locations[0].href, documentHref({ ...mestarit, parent: { _type: "sivu", slug: "klubi/x" } }));
  });

  await test("taulukko: Litmasen loukkaantumiset ja muun pelaajan sivu", () => {
    assert.deepEqual(
      dokumentinSijainnit(tilasto({ category: "pelaaja", viittaajat: [{ _type: "pelaaja", slug: LITMANEN_SLUG, nimi: "Jari Litmanen" }] })),
      { locations: [{ title: "Loukkaantumiset", href: `${LITMANEN_LOUKKAANTUMISET_PATH}#taulukko` }] },
    );
    assert.deepEqual(
      hrefit(dokumentinSijainnit(tilasto({ category: "pelaaja", viittaajat: [{ _type: "pelaaja", slug: "teemu-pukki" }] }))),
      ["/jalkapalloarkisto/pelaajat/teemu-pukki#taulukko"],
    );
  });

  await test("taulukko: osion sivu ilman Taulukot-kenttää ei näytä taulukkoa", () => {
    const ilmanTaulukoita = OSIOSIVUT.filter((o) => !o.kentat.includes("tilastot"));
    const taulukoilla = OSIOSIVUT.filter((o) => o.kentat.includes("tilastot"));
    assert.ok(ilmanTaulukoita.length > 0 && taulukoilla.length > 0);
    for (const o of ilmanTaulukoita) {
      assert.equal(
        dokumentinSijainnit(tilasto({ category: "klubi", viittaajat: [{ _type: "sivu", slug: o.slug }] }))?.message,
        EI_SIVULLA_VIESTI,
        o.slug,
      );
    }
    for (const o of taulukoilla) {
      assert.deepEqual(
        hrefit(dokumentinSijainnit(tilasto({ category: "klubi", viittaajat: [{ _type: "sivu", slug: o.slug }] }))),
        [`/${o.slug}#taulukko`],
      );
    }
  });

  await test("taulukko: sama osoite vain kerran", () => {
    const doc = tilasto({
      category: "klubi",
      viittaajat: [
        { _type: "sivu", slug: "a" },
        { _type: "sivu", slug: "a" },
      ],
    });
    assert.deepEqual(tilastonSijainnit(doc).map((l) => l.href), ["/a#taulukko"]);
  });

  /* ── Muut tyypit ───────────────────────────────────────────────────────── */

  await test("ottelu: näkyy vain otteluohjelmassa olevana (tuleva tai alkanut enintään 2 h sitten)", async () => {
    const NYT = new Date("2026-10-08T12:00:00Z");
    const ottelu = (aika?: string | null) => dokumentinSijainnit({ _id: "o", _type: "ottelu", aika }, NYT);
    const nakyy = {
      locations: [
        { title: "Ottelut", href: "/ottelut" },
        { title: "Etusivu", href: "/" },
      ],
    };
    assert.deepEqual(ottelu("2026-10-20T15:00:00Z"), nakyy);
    assert.deepEqual(ottelu("2026-10-08T10:00:00Z"), nakyy); // alkoi tasan 2 h sitten
    assert.deepEqual(ottelu("2026-10-08T09:59:59Z"), { locations: [], message: PELATTU_OTTELU_VIESTI });
    assert.deepEqual(ottelu(null), { locations: [], message: OTTELU_ILMAN_AIKAA_VIESTI, tone: "caution" });
    assert.deepEqual(ottelu("ei aika"), { locations: [], message: OTTELU_ILMAN_AIKAA_VIESTI, tone: "caution" });
    assert.equal(OTTELU_NAKYY_ALUN_JALKEEN_MS, 2 * 60 * 60 * 1000);
    // Sivuston kysely (tulevatOttelutQuery) hakee 24 h ikkunan, joten 2 h sääntö ratkaisee.
    const { tulevatOttelutQuery } = await import("../sanity/lib/queries/ottelut");
    assert.match(tulevatOttelutQuery, /dateTime\(now\(\)\) - 60\*60\*24/);
    const ottelut = readFileSync("lib/ottelut.ts", "utf8");
    assert.match(ottelut, /Date\.now\(\) - OTTELU_NAKYY_ALUN_JALKEEN_MS/);
  });

  await test("hallituksen jäsen, kommentti, arvosana, uutiskategoria, ohjaus", () => {
    assert.deepEqual(dokumentinSijainnit({ _id: "h", _type: "hallitusJasen" }), {
      locations: [{ title: "Hallitus", href: "/klubi/hallitus" }],
    });
    assert.deepEqual(hrefit(dokumentinSijainnit({ _id: "h", _type: "hallitusJasen", nykyinen: true })), ["/klubi/hallitus"]);
    assert.deepEqual(dokumentinSijainnit({ _id: "h", _type: "hallitusJasen", nykyinen: false }), {
      locations: [],
      message: ENTINEN_JASEN_VIESTI,
    });
    assert.deepEqual(
      dokumentinSijainnit({ _id: "k", _type: "kommentti", uutinen: { nimi: "Veikkaus 2027", slug: "veikkaus-2027" } }),
      { locations: [{ title: "Veikkaus 2027", href: "/uutiset/veikkaus-2027" }] },
    );
    assert.deepEqual(
      dokumentinSijainnit({ _id: "k", _type: "kommentti", piilotettu: true, uutinen: { slug: "x" } }),
      { locations: [], message: PIILOTETTU_KOMMENTTI_VIESTI, tone: "caution" },
    );
    assert.equal(dokumentinSijainnit({ _id: "k", _type: "kommentti", uutinen: null }), null);
    assert.deepEqual(
      dokumentinSijainnit({ _id: "a", _type: "klubiArvio", ravintola: { nimi: "Torero", slug: "torero" } }),
      { locations: [{ title: "Torero", href: "/ravintolat/torero" }] },
    );
    assert.equal(dokumentinSijainnit({ _id: "a", _type: "klubiArvio", ravintola: null }), null);
    assert.deepEqual(dokumentinSijainnit({ _id: "c", _type: "uutisKategoria", slug: "jasentiedote", nimi: "Jäsentiedote" }), {
      locations: [{ title: "Uutiset: Jäsentiedote", href: "/uutiset?kategoria=jasentiedote" }],
    });
    assert.equal(dokumentinSijainnit({ _id: "c", _type: "uutisKategoria" }), null);
    assert.deepEqual(dokumentinSijainnit({ _id: "x", _type: "ohjaus", lahde: "/jasenmaksu" }), {
      locations: [{ title: "Ohjattava osoite", href: "/jasenmaksu" }],
    });
    for (const lahde of ["/", "", null, "jasenmaksu", "//evil.example"]) {
      assert.equal(dokumentinSijainnit({ _id: "x", _type: "ohjaus", lahde }), null, String(lahde));
    }
    assert.equal(dokumentinSijainnit({ _id: "x", _type: "kaupunki", slug: "lahti" }), null);
  });

  /* ── Sama tulos kuin aiemmalla objektikartalla ─────────────────────────── */

  /** Aiempi `sanity/presentation.ts` (ennen askelta 11), sellaisenaan. */
  const vanhaSivutyyppi = (tyyppi: string, doc: { title?: string; name?: string; nimi?: string; slug?: string } | null) => {
    const href = doc?.slug ? documentHref({ _id: "", _type: tyyppi, slug: doc.slug }) : null;
    return href ? { locations: [{ title: doc?.title ?? doc?.name ?? doc?.nimi ?? "Sivu", href }] } : null;
  };
  const vanhaLehtileike = (doc: { id?: string; otsikko?: string; osio?: string; pelaajaSlug?: string } | null) => {
    const href = doc?.id
      ? documentHref({ _id: doc.id, _type: "lehtileike", osio: doc.osio, pelaajaSlug: doc.pelaajaSlug })
      : null;
    return href ? { locations: [{ title: doc?.otsikko ?? "Lehtileike", href }] } : null;
  };

  await test("sivutyypit: sama sijainti kuin aiemmalla objektikartalla", () => {
    const slugit = [undefined, "x", "klubi/historia", LITMANEN_SLUG, "uutiset", "tietosuoja"];
    for (const tyyppi of SIVUTYYPIT) {
      for (const slug of slugit) {
        for (const nimi of [undefined, "Nimi"]) {
          // Kysely antaa nimen coalesce(title, name, nimi, otsikko) -muodossa.
          const vanha = vanhaSivutyyppi(tyyppi, { title: nimi, slug });
          const uusi = dokumentinSijainnit({ _id: "d", _type: tyyppi, slug, nimi });
          assert.deepEqual(uusi, vanha, `${tyyppi} ${slug} ${nimi}`);
        }
      }
    }
    assert.deepEqual(hrefit(dokumentinSijainnit({ _id: "p", _type: "pelaaja", slug: LITMANEN_SLUG })), ["/jalkapalloarkisto/litmanen"]);
  });

  await test("lehtileike ja etusivu: sama sijainti kuin aiemmalla objektikartalla", () => {
    const tapaukset = [
      { id: "lehtileike-1", otsikko: "Juttu", osio: "lehtileikkeet", pelaajaSlug: LITMANEN_SLUG },
      { id: "drafts.lehtileike-2", otsikko: "Patsas", osio: "patsas", pelaajaSlug: LITMANEN_SLUG },
      { id: "lehtileike-3", osio: "terveys", pelaajaSlug: LITMANEN_SLUG },
      { id: "lehtileike-4", otsikko: "Oletusosio", pelaajaSlug: LITMANEN_SLUG },
      { id: "lehtileike-5", otsikko: "Muu pelaaja", osio: "lehtileikkeet", pelaajaSlug: "teemu-pukki" },
      { id: "lehtileike-6", otsikko: "Ilman pelaajaa", osio: "lehtileikkeet" },
      { id: "lehtileike-7", osio: "tuntematon", pelaajaSlug: LITMANEN_SLUG },
    ];
    for (const t of tapaukset) {
      const uusi = dokumentinSijainnit({
        _id: t.id,
        _type: "lehtileike",
        nimi: t.otsikko,
        osio: t.osio,
        pelaajaSlug: t.pelaajaSlug,
      });
      assert.deepEqual(uusi, vanhaLehtileike(t), t.id);
    }
    assert.deepEqual(hrefit(dokumentinSijainnit({ _id: "lehtileike-1", _type: "lehtileike", osio: "patsas", pelaajaSlug: LITMANEN_SLUG })), [
      `${LITMANEN_PATSAS_PATH}#${lehtileikeAnkkuri("lehtileike-1")}`,
    ]);
    assert.ok(hrefit(dokumentinSijainnit({ _id: "l", _type: "lehtileike", pelaajaSlug: LITMANEN_SLUG }))?.[0].startsWith(`${LITMANEN_LEHTILEIKKEET_PATH}#leike-`));
    // Etusivu: aiempi defineLocations({ locations: [{ title: "Etusivu", href: "/" }] }).
    assert.deepEqual(dokumentinSijainnit({ _id: "etusivu", _type: "etusivu" }), {
      locations: [{ title: "Etusivu", href: "/" }],
    });
  });

  await test("jokainen aiemman objektikartan tyyppi on yhä mukana", () => {
    for (const t of [...SIVUTYYPIT, "lehtileike", "etusivu"]) assert.ok(SIJAINTITYYPIT.has(t), t);
    for (const t of ["jalkapalloTilasto", "ottelu", "hallitusJasen", "kommentti", "klubiArvio", "uutisKategoria", "ohjaus"]) {
      assert.ok(SIJAINTITYYPIT.has(t), t);
    }
  });

  /* ── GROQ: SIJAINTI_KYSELY ja sitemapin parent ─────────────────────────── */

  const dataset = [
    { _id: "t-klubi", _type: "jalkapalloTilasto", title: "Mölkky 2020", slug: { current: "molkky-2020" }, category: "klubi" },
    {
      _id: "t-kl",
      _type: "jalkapalloTilasto",
      title: "Kansojen liiga 2026–2027",
      slug: { current: "kl-2026" },
      category: "huuhkajat",
      huuhkajatOsio: "kansojen-liiga",
      kaudenOttelut: { _type: "reference", _ref: "t-karsinta" },
    },
    { _id: "t-karsinta", _type: "jalkapalloTilasto", title: "EM 2028 -karsinta", slug: { current: "em-2028" }, category: "karsinta" },
    { _id: "t-mitalit", _type: "jalkapalloTilasto", title: "Mitalit", slug: { current: "mitalit" }, category: "arvokisa" },
    { _id: "toiminta-molkky", _type: "klubiToiminta", title: "Mölkky", slug: { current: "molkky" }, tilastot: [{ _ref: "t-klubi" }] },
    { _id: "sivu-b", _type: "sivu", title: "B", slug: { current: "b" }, tilastot: [{ _ref: "t-klubi" }] },
    { _id: "sivu-a", _type: "sivu", title: "A", slug: { current: "a" }, tilastot: [{ _ref: "t-klubi" }] },
    { _id: "drafts.sivu-c", _type: "sivu", title: "C", slug: { current: "c" }, tilastot: [{ _ref: "t-klubi" }] },
    { _id: "uutinen-x", _type: "uutinen", title: "X", slug: { current: "x" }, viite: { _ref: "t-klubi" } },
    { _id: "arvokisa-2021", _type: "arvokisa", name: "KL 2021", slug: { current: "kl-2021" }, tilastot: [{ _ref: "t-mitalit" }] },
    { _id: "arvokisa-2019", _type: "arvokisa", name: "KL 2019", slug: { current: "kl-2019" }, tilastot: [{ _ref: "t-mitalit" }] },
    { _id: "uutinen-v", _type: "uutinen", title: "Veikkaus", slug: { current: "veikkaus" } },
    { _id: "kommentti-1", _type: "kommentti", nimi: "Kävijä", uutinen: { _ref: "uutinen-v" } },
    { _id: "ravintola-t", _type: "ravintola", name: "Torero", slug: { current: "torero" } },
    { _id: "arvio-1", _type: "klubiArvio", ravintola: { _ref: "ravintola-t" } },
    { _id: "pelaaja-jl", _type: "pelaaja", name: "Jari Litmanen", slug: { current: LITMANEN_SLUG } },
    { _id: "leike-1", _type: "lehtileike", otsikko: "Juttu", osio: "patsas", pelaaja: { _ref: "pelaaja-jl" } },
    { _id: "kat-1", _type: "uutisKategoria", title: "Jäsentiedote", slug: { current: "jasentiedote" } },
    { _id: "ohjaus-1", _type: "ohjaus", lahde: "/jasenmaksu" },
    { _id: "hallitus-1", _type: "hallitusJasen", name: "Jäsen", nykyinen: false },
  ];
  const sijainti = async (id: string) => dokumentinSijainnit(await groq<SijaintiDoc>(SIJAINTI_KYSELY, dataset, { id }));

  await test("SIJAINTI_KYSELY: viittaajat järjestyksessä, luonnos ja muut tyypit pois", async () => {
    const doc = await groq<SijaintiDoc>(SIJAINTI_KYSELY, dataset, { id: "t-klubi" });
    assert.deepEqual(doc.viittaajat, [
      { _type: "klubiToiminta", slug: "molkky", nimi: "Mölkky" },
      { _type: "sivu", slug: "a", nimi: "A" },
      { _type: "sivu", slug: "b", nimi: "B" },
    ]);
    assert.deepEqual(hrefit(dokumentinSijainnit(doc)), ["/klubi/toiminta/molkky#molkky-2020", "/a#molkky-2020", "/b#molkky-2020"]);
    // Muilla tyypeillä viittaajia ei haeta.
    assert.equal((await groq<SijaintiDoc>(SIJAINTI_KYSELY, dataset, { id: "toiminta-molkky" })).viittaajat, null);
  });

  await test("SIJAINTI_KYSELY: ensimmäinen sijainti = sitemapin parent (VIITTAAJA)", async () => {
    const rivit = await groq<(SijaintiDoc & { parent: SijaintiDoc["parent"] })[]>(sitemapTilastotQuery, dataset);
    assert.equal(rivit.length, 4);
    for (const rivi of rivit) {
      const doc = await groq<SijaintiDoc>(SIJAINTI_KYSELY, dataset, { id: rivi._id });
      assert.equal(dokumentinSijainnit(doc)?.locations[0]?.href, documentHref(rivi), rivi._id);
    }
  });

  await test("sitemapin parent: sama tulos kuin ennen VIITTAAJA-vientiä", async () => {
    const vanha = /* groq */ `*[_type == "jalkapalloTilasto"]{ _id, "parent": *[
      _type in ["arvokisa", "pelaaja", "klubiToiminta", "sivu"]
      && references(^._id)
      && !(_id in path("drafts.**"))
    ] | order(_type asc, _id asc)[0]{ _type, "slug": slug.current } }`;
    const uusi = `*[_type == "jalkapalloTilasto"]{ _id, "parent": ${VIITTAAJA} }`;
    assert.deepEqual(await groq(uusi, dataset), await groq(vanha, dataset));
    assert.ok(sitemapTilastotQuery.includes(VIITTAAJA));
  });

  await test("SIJAINTI_KYSELY: kauden karsintasivu, mitalitaulukko ja muut tyypit", async () => {
    assert.deepEqual(hrefit(await sijainti("t-kl")), [
      "/jalkapalloarkisto/huuhkajat/kansojen-liiga#kl-2026",
      "/jalkapalloarkisto/karsinnat/em-2028#kl-2026",
    ]);
    assert.deepEqual(hrefit(await sijainti("t-mitalit")), [
      "/jalkapalloarkisto/arvokisat/kl-2019#mitalit",
      "/jalkapalloarkisto/arvokisat/kl-2021#mitalit",
    ]);
    assert.deepEqual(await sijainti("kommentti-1"), { locations: [{ title: "Veikkaus", href: "/uutiset/veikkaus" }] });
    assert.deepEqual(await sijainti("arvio-1"), { locations: [{ title: "Torero", href: "/ravintolat/torero" }] });
    assert.deepEqual(hrefit(await sijainti("leike-1")), [`${LITMANEN_PATSAS_PATH}#${lehtileikeAnkkuri("leike-1")}`]);
    assert.equal((await sijainti("leike-1"))?.locations[0].title, "Juttu");
    assert.deepEqual(hrefit(await sijainti("kat-1")), ["/uutiset?kategoria=jasentiedote"]);
    assert.deepEqual(hrefit(await sijainti("ohjaus-1")), ["/jasenmaksu"]);
    assert.equal((await sijainti("hallitus-1"))?.message, ENTINEN_JASEN_VIESTI);
    assert.deepEqual(await sijainti("arvokisa-2019"), {
      locations: [{ title: "KL 2019", href: "/jalkapalloarkisto/arvokisat/kl-2019" }],
    });
    assert.ok(SIJAINTI_PROJEKTIO.includes("viittaajat"));
  });

  /* ── Ratkaisija (sanity/presentation.ts) ──────────────────────────────── */

  await test("funktiomuotoinen ratkaisija: etusivu ilman kyselyä, tuntematon tyyppi null, julkaistu tunnus", async () => {
    const { locations } = await import("../sanity/presentation");
    type Kysely = { fetch: string; listen: string };
    type Asetukset = { perspective: unknown; throttleTime?: number; tag?: string };
    const kutsut: { kysely: Kysely; params: { id: string; idt: string[] }; asetukset: Asetukset }[] = [];
    const tulevaAika = new Date(Date.now() + 86_400_000).toISOString();
    const kauppa = (virhe = false) =>
      ({
        listenQuery: (kysely: Kysely, params: { id: string; idt: string[] }, asetukset: Asetukset) => {
          kutsut.push({ kysely, params, asetukset });
          if (virhe) return throwError(() => new Error("HTTP 429"));
          return of(dataset.find((d) => d._id === params.id) ? { _id: params.id, _type: "ottelu", aika: tulevaAika } : null);
        },
      }) as unknown as Parameters<typeof locations>[1]["documentStore"];
    const documentStore = kauppa();
    const kutsu = (type: string, id: string, perspectiveStack: string[] = ["drafts"], store = documentStore) =>
      locations({ id, type, version: undefined, perspectiveStack } as Parameters<typeof locations>[0], {
        documentStore: store,
      });

    assert.deepEqual(kutsu("etusivu", "etusivu"), { locations: [{ title: "Etusivu", href: "/" }] });
    assert.equal(kutsu("kaupunki", "k"), null);
    assert.equal(kutsut.length, 0);

    const tulos = kutsu("ottelu", "drafts.ohjaus-1");
    assert.ok(isObservable(tulos));
    assert.deepEqual(await firstValueFrom(tulos), {
      locations: [
        { title: "Ottelut", href: "/ottelut" },
        { title: "Etusivu", href: "/" },
      ],
    });
    // Haku ja kuuntelu erikseen (kuten Sanityn useReferringDocuments), throttle ja tag.
    assert.deepEqual(kutsut[0], {
      kysely: { fetch: SIJAINTI_KYSELY, listen: SIJAINTI_KUUNTELU },
      params: { id: "ohjaus-1", idt: ["ohjaus-1", "drafts.ohjaus-1"] },
      asetukset: { perspective: ["drafts"], throttleTime: 1000, tag: "klubi.sijainnit" },
    });
    const puuttuva = kutsu("ottelu", "ei-ole", []);
    assert.ok(isObservable(puuttuva));
    assert.equal(await firstValueFrom(puuttuva), null);
    assert.equal(kutsut[1].asetukset.perspective, "drafts");
    // Virhe (429, katkos): ei jäädä tilaan "Ratkaistaan sijainteja…", vaan tieto jää pois.
    const virhe = kutsu("jalkapalloTilasto", "t1", ["drafts"], kauppa(true));
    assert.ok(isObservable(virhe));
    assert.equal(await firstValueFrom(virhe), null);
  });

  await test("kuuntelu: dokumentti, sen luonnos ja viittaajat; ei muita (groq-js)", async () => {
    const params = sijaintiParametrit("t-klubi");
    const osuvat = await groq<string[]>(`${SIJAINTI_KUUNTELU}._id`, [...dataset, { _id: "drafts.t-klubi", _type: "jalkapalloTilasto" }], params);
    assert.deepEqual(
      [...osuvat].sort(),
      ["drafts.sivu-c", "drafts.t-klubi", "sivu-a", "sivu-b", "t-klubi", "toiminta-molkky", "uutinen-x"].sort(),
    );
    // Kysely hyväksyy samat parametrit (ylimääräinen $idt ei haittaa).
    assert.equal((await groq<SijaintiDoc>(SIJAINTI_KYSELY, dataset, params))._id, "t-klubi");
  });

  // Huuhkajat-osioiden nimet tulevat rekisteristä (tarkistus, ettei lista ole tyhjä).
  assert.ok(HUUHKAJAT_OSIOT.length > 0);

  console.log(`\n${ok} testiä ok`);
}

main().catch((virhe) => {
  console.error(virhe);
  process.exit(1);
});
