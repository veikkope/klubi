/**
 * Ohjausgeneraattorin syötteet ja tulos (scripts/generate-redirects.ts,
 * docs/24 askel 12, docs/23 Y19).
 *
 * Generaattoria ei ajeta (se lukisi Sanityä ja kirjoittaisi lib/redirects.ts:n).
 * Testi varmistaa, että gitissä oleva syöte data/crawl-status.tsv ja gitissä
 * oleva tulos lib/redirects.ts sopivat yhteen: jokaisella vanhan sivuston
 * osoitteella on täsmälleen yksi ohjaus, kohteet ovat sivuston omia polkuja
 * eivätkä ketjuudu toiseen kiinteään ohjaukseen, ja generaattorin oletus-
 * datasetti on production (vain luku).
 *
 * Ajo: npm run test:ohjausgeneraattori
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { blogspotRedirects, legacyRedirects } from "../lib/redirects";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const STATUS_FILE = join(process.cwd(), "data", "crawl-status.tsv");
const GENERAATTORI = join(process.cwd(), "scripts", "generate-redirects.ts");

/** Sama jäsennys kuin generaattorissa: kolmas sarake, alun kauttaviivat pois. */
function crawlPolut(): string[] {
  return readFileSync(STATUS_FILE, "utf-8")
    .split(/\r?\n/)
    .map((rivi) => rivi.split("\t")[2]?.trim().replace(/^\/+/, ""))
    .filter((polku): polku is string => Boolean(polku));
}

test("data/crawl-status.tsv on repossa ja kolmisarakkeinen", () => {
  assert.ok(existsSync(STATUS_FILE), "data/crawl-status.tsv puuttuu (pitää olla gitissä, .gitignore-poikkeus)");
  const rivit = readFileSync(STATUS_FILE, "utf-8").split(/\r?\n/).filter(Boolean);
  assert.ok(rivit.length >= 190, `rivejä ${rivit.length}`);
  for (const rivi of rivit) {
    const [tila, koko, polku] = rivi.split("\t");
    assert.match(tila, /^\d{3}$/, rivi);
    assert.match(koko, /^\d+$/, rivi);
    assert.ok(polku && polku.trim().length > 0, rivi);
  }
});

test(".gitignore ei piilota data/crawl-status.tsv:tä", () => {
  const rivit = readFileSync(join(process.cwd(), ".gitignore"), "utf-8").split(/\r?\n/).map((r) => r.trim());
  const piilotus = rivit.lastIndexOf("/data/crawl-status.tsv");
  const poikkeus = rivit.lastIndexOf("!/data/crawl-status.tsv");
  assert.ok(piilotus === -1 || poikkeus > piilotus, "poikkeuksen !/data/crawl-status.tsv pitää tulla piilotuksen jälkeen");
});

test("jokaisella vanhan sivuston osoitteella on täsmälleen yksi ohjaus", () => {
  const lahteet = new Map<string, number>();
  for (const r of legacyRedirects) lahteet.set(r.source, (lahteet.get(r.source) ?? 0) + 1);
  const kaksoset = [...lahteet].filter(([, n]) => n > 1).map(([s]) => s);
  assert.deepEqual(kaksoset, [], "sama lähde useammin kuin kerran");
  const puuttuvat = [...new Set(crawlPolut())].filter((polku) => !lahteet.has(`/${polku}`));
  assert.deepEqual(puuttuvat, [], "crawlin osoitteita ilman ohjausta: aja npm run redirects");
});

test("crawlin ulkopuoliset ohjaukset ovat vain sisäisiä siirtoja (ei .htm)", () => {
  const crawl = new Set(crawlPolut().map((p) => `/${p}`));
  const muut = legacyRedirects.map((r) => r.source).filter((s) => !crawl.has(s));
  for (const lahde of muut) assert.doesNotMatch(lahde, /\.html?$/i, `${lahde} ei ole crawlissa`);
  assert.ok(muut.length <= 5, `crawlin ulkopuolisia ${muut.length}`);
});

test("kohteet ovat sivuston omia polkuja eivätkä ketjuudu kiinteään ohjaukseen", () => {
  const lahteet = new Set([...legacyRedirects, ...blogspotRedirects].map((r) => r.source.toLowerCase()));
  for (const r of [...legacyRedirects, ...blogspotRedirects]) {
    assert.match(r.destination, /^\/(?!\/)/, `${r.source} → ${r.destination}`);
    assert.equal(r.permanent, true, r.source);
    const polku = r.destination.split(/[?#]/)[0].toLowerCase();
    assert.notEqual(polku, r.source.toLowerCase(), `${r.source} ohjaa itseensä`);
    assert.ok(!lahteet.has(polku), `${r.source} → ${r.destination} on ketju`);
  }
});

test("blogiohjaukset ovat /blogspot/-polkuja uutisiin", () => {
  assert.ok(blogspotRedirects.length > 0);
  for (const r of blogspotRedirects) {
    assert.match(r.source, /^\/blogspot\//, r.source);
    assert.match(r.destination, /^\/uutiset\//, `${r.source} → ${r.destination}`);
  }
});

test("generaattorin oletusdatasetti on production", () => {
  const lahde = readFileSync(GENERAATTORI, "utf-8");
  const funktio = /function redirectsDataset\(\)[^{]*\{([\s\S]*?)\n\}/.exec(lahde)?.[1] ?? "";
  assert.match(funktio, /\?\?\s*"production";/, "oletuksen pitää olla production");
  assert.doesNotMatch(lahde, /development-datasetin/, "kommentti mainitsee yhä developmentin oletuksena");
});

console.log(`\n${ok} testiä ok`);
