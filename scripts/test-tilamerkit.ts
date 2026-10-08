/**
 * Studion tilamerkkien testit (lib/tilamerkit.ts, sanity/merkit.ts, docs/24 askel 10).
 *
 * Päätös 8.10.2026: merkit Ajastettu, Tarkistettava, Odottaa toista arvioijaa
 * ja Piilotettu. "Ei vielä sivustolla" ja "Entinen jäsen" karsittiin.
 * Ravintolan sääntö testataan samoilla tapauksilla myös GROQ-ehtoa
 * JULKINEN_RAVINTOLA vasten (groq-js), jotta merkki ja sivusto eivät erkane.
 *
 * Ajo: npm run test:tilamerkit
 */
import assert from "node:assert/strict";

import { evaluate, parse } from "groq-js";
import type { DocumentBadgeProps } from "sanity";

import { JULKINEN_RAVINTOLA, VAHIMMAISARVIOIJAT } from "../lib/ravintola-arvosana";
import {
  ajastetunSelite,
  merkkienNimetTyypille,
  odottavanSelite,
  onAjastettu,
  onJulkinenRavintola,
  onPiilotettu,
  onTarkistettava,
  tarkistettavanSelite,
  type RavintolanArvosana,
} from "../lib/tilamerkit";
import { merkitTyypille } from "../sanity/merkit";
import { TARKISTETTAVAT_TYYPIT } from "../sanity/lib/tehtavat";

let ok = 0;
async function test(nimi: string, fn: () => void | Promise<void>) {
  await fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const NYT = new Date("2026-10-08T12:00:00Z");
const TULEVA = "2026-10-20T15:30:00Z";
const MENNYT = "2026-10-01T08:00:00Z";

/** Badge-komponentin kutsu pelkillä versioilla (muut EditState-kentät eivät vaikuta). */
const merkki = (tyyppi: string, draft: Record<string, unknown> | null, published: Record<string, unknown> | null) =>
  merkitTyypille(tyyppi)
    .map((m) => m({ id: "x", type: tyyppi, draft, published } as unknown as DocumentBadgeProps))
    .filter((d): d is NonNullable<typeof d> => d !== null);

async function main() {
  await test("onAjastettu: tuleva → true; mennyt, puuttuva ja virheellinen → false", () => {
    assert.equal(onAjastettu(TULEVA, NYT), true);
    assert.equal(onAjastettu(MENNYT, NYT), false);
    assert.equal(onAjastettu(undefined, NYT), false);
    assert.equal(onAjastettu("", NYT), false);
    assert.equal(onAjastettu("ei päivä", NYT), false);
    assert.equal(onAjastettu(12345, NYT), false);
  });

  await test("ajastetunSelite: julkaistu ajastus, luonnoksen uusi aika ja ei ajastusta", () => {
    assert.equal(ajastetunSelite(null, { publishedAt: TULEVA }, NYT), "Tulee sivustolle 20. lokakuuta 2026 klo 18.30.");
    assert.equal(
      ajastetunSelite({ publishedAt: TULEVA }, { publishedAt: TULEVA }, NYT),
      "Tulee sivustolle 20. lokakuuta 2026 klo 18.30.",
      "luonnos, sama aika",
    );
    assert.match(ajastetunSelite({ publishedAt: TULEVA }, null, NYT) ?? "", /kun painat Julkaise\.$/, "vain luonnos");
    assert.match(
      ajastetunSelite({ publishedAt: TULEVA }, { publishedAt: MENNYT }, NYT) ?? "",
      /kun painat Julkaise\.$/,
      "luonnoksessa uusi aika",
    );
    assert.equal(ajastetunSelite({ publishedAt: MENNYT }, { publishedAt: TULEVA }, NYT), null, "luonnos ratkaisee");
    assert.equal(ajastetunSelite(null, null, NYT), null);
  });

  await test("onTarkistettava ja selite", () => {
    assert.equal(onTarkistettava({ needsReview: true }), true);
    assert.equal(onTarkistettava({ needsReview: false }), false);
    assert.equal(onTarkistettava({}), false);
    assert.equal(onTarkistettava(undefined), false);
    assert.equal(onTarkistettava({ needsReview: "true" }), false);
    assert.match(tarkistettavanSelite({ tarkistettavaa: "Päivä puuttui." }), /^Lue kohta Mitä tarkistaa\./);
    assert.match(tarkistettavanSelite({}), /^Tarkista tiedot\./);
  });

  // Viisi suunnitelman tapausta ja reunatapaukset; odotus = JULKINEN_RAVINTOLA.
  const RAVINTOLAT: [string, RavintolanArvosana, boolean][] = [
    ["arvioijia 1", { automaattinenArvosana: { arvioijia: 1 }, ratingOverall: 4 }, false],
    ["arvioijia 2", { automaattinenArvosana: { arvioijia: 2 }, ratingOverall: 4 }, true],
    ["ei automaattista, ratingOverall 3.4", { ratingOverall: 3.4 }, true],
    ["ei automaattista, stars 4", { stars: 4 }, true],
    ["automaattinen, arvioijia 0, ratingOverall 4", { automaattinenArvosana: { arvioijia: 0 }, ratingOverall: 4 }, false],
    ["ei arvosanaa lainkaan", {}, false],
    ["automaattinen ilman arvioijamäärää", { automaattinenArvosana: {}, stars: 4 }, false],
    ["arvioijia 3", { automaattinenArvosana: { arvioijia: 3 } }, true],
    ["null-arvot", { automaattinenArvosana: null, ratingOverall: null, stars: null }, false],
  ];

  await test("onJulkinenRavintola: tapaukset", () => {
    for (const [nimi, doc, odotus] of RAVINTOLAT) assert.equal(onJulkinenRavintola(doc), odotus, nimi);
    assert.equal(onJulkinenRavintola(null), false);
  });

  await test("onJulkinenRavintola = JULKINEN_RAVINTOLA (groq-js, sama data)", async () => {
    const dataset = RAVINTOLAT.map(([nimi, doc]) => ({
      _id: nimi,
      _type: "ravintola",
      // GROQ:ssa null ja puuttuva ovat sama: jätetään null-kentät pois kuten Sanity.
      ...Object.fromEntries(Object.entries(doc ?? {}).filter(([, v]) => v !== null)),
    }));
    const julkiset = (await (
      await evaluate(parse(`*[_type == "ravintola" && ${JULKINEN_RAVINTOLA}]._id`), { dataset })
    ).get()) as string[];
    for (const [nimi, doc] of RAVINTOLAT) {
      assert.equal(onJulkinenRavintola(doc), julkiset.includes(nimi), `pariteetti: ${nimi}`);
    }
  });

  await test("odottavanSelite: arvioijien määrä ja sääntö", () => {
    assert.equal(
      odottavanSelite({ automaattinenArvosana: { arvioijia: 1 } }),
      `Klubilaisten arvosanoja 1. Ravintola näkyy sivustolla, kun vähintään ${VAHIMMAISARVIOIJAT} klubilaista on arvioinut sen.`,
    );
    assert.match(odottavanSelite(null), /^Klubilaisten arvosanoja 0\./);
  });

  await test("onPiilotettu: julkaistu versio ratkaisee", () => {
    assert.equal(onPiilotettu(null, { piilotettu: true }), true);
    assert.equal(onPiilotettu({ piilotettu: false }, { piilotettu: true }), true, "piilotus muuttaa julkaistua");
    assert.equal(onPiilotettu({ piilotettu: true }, null), true, "pelkkä luonnos");
    assert.equal(onPiilotettu(null, { piilotettu: false }), false);
    assert.equal(onPiilotettu(null, null), false);
  });

  const TARKISTETTAVAT = TARKISTETTAVAT_TYYPIT.map(({ tyyppi }) => tyyppi);

  await test("merkkienNimetTyypille: vain päätetyt merkit", () => {
    assert.deepEqual(merkkienNimetTyypille("uutinen", TARKISTETTAVAT), ["ajastettu", "tarkistettava"]);
    assert.deepEqual(merkkienNimetTyypille("ravintola", TARKISTETTAVAT), ["tarkistettava", "odottaaToistaArvioijaa"]);
    assert.deepEqual(merkkienNimetTyypille("kommentti", TARKISTETTAVAT), ["piilotettu"]);
    assert.deepEqual(merkkienNimetTyypille("sivu", TARKISTETTAVAT), ["tarkistettava"]);
    for (const tyyppi of ["hallitusJasen", "sivustonTila", "varmuuskopio", "etusivu", "klubiArvio", "ravintolaKayttajaArvostelu"]) {
      assert.deepEqual(merkkienNimetTyypille(tyyppi, TARKISTETTAVAT), [], tyyppi);
    }
    for (const tyyppi of TARKISTETTAVAT) {
      assert.ok(merkkienNimetTyypille(tyyppi, TARKISTETTAVAT).includes("tarkistettava"), tyyppi);
    }
  });

  await test("merkitTyypille: merkit tekstinä oikeilla väreillä", () => {
    const ajastettu = merkki("uutinen", null, { publishedAt: "2999-01-01T10:00:00Z", needsReview: true });
    assert.deepEqual(
      ajastettu.map((d) => [d.label, d.color]),
      [
        ["Ajastettu", "primary"],
        ["Tarkistettava", "warning"],
      ],
    );
    assert.match(ajastettu[0].title ?? "", /^Tulee sivustolle /);

    assert.deepEqual(merkki("uutinen", { publishedAt: MENNYT }, null), [], "julkaisematon: ei omaa merkkiä");

    const odottava = merkki("ravintola", null, { automaattinenArvosana: { arvioijia: 1 } });
    assert.deepEqual(odottava.map((d) => d.label), ["Odottaa toista arvioijaa"]);
    assert.equal(odottava[0].color, "warning");
    assert.deepEqual(
      merkki("ravintola", { name: "Uusi" }, null),
      [],
      "julkaisematon ravintola: Sanityn oma tila riittää",
    );
    assert.deepEqual(merkki("ravintola", null, { automaattinenArvosana: { arvioijia: 2 } }), []);

    const piilotettu = merkki("kommentti", null, { piilotettu: true });
    assert.deepEqual(piilotettu.map((d) => [d.label, d.color]), [["Piilotettu", "danger"]]);

    assert.deepEqual(merkki("hallitusJasen", null, { nykyinen: false }), [], "entinen jäsen: ei merkkiä");
    for (const d of [...ajastettu, ...odottava, ...piilotettu]) {
      assert.ok(d.label && d.title, "teksti ja selite, ei pelkkä väri");
    }
  });

  console.log(`\n${ok} testiä ok`);
}

main().catch((virhe) => {
  console.error(virhe);
  process.exit(1);
});
