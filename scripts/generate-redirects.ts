/**
 * Generoi `lib/redirects.ts`:n vanhan sivuston URL-listasta.
 *
 * Ajo: `npm run redirects`            (lukee Sanityn development-datasetin)
 *      `npm run redirects -- --offline` (vain säännöt; ei Sanity-yhteyttä)
 *
 * Lähteet etusijajärjestyksessä (ensimmäinen osuma voittaa):
 *  1. data/manual-redirects.csv  — käsin tehdyt poikkeukset (`vanha,uusi` per rivi)
 *  2. Sanity: dokumenttien `legacyUrl` ja `muutLegacyUrlit` — AUKTORITATIIVINEN.
 *     Kohde on dokumentin oma reitti (`lib/path.ts` → `documentRoute`), joten
 *     ohjaus ei voi osoittaa slugiin, jota ei ole olemassa.
 *  3. Alla olevat EXACT-, TOIMINTA-, PELAAJAT- ja RULES-kartoitukset — fallback
 *     sivuille, joilla ei ole omaa dokumenttia (kehykset, hubit, yhdistetyt).
 *
 * Kaikki vanhat osoitteet: data/crawl-status.tsv (tuotettu `npm run crawl`).
 *
 * Miksi generoitu eikä käsin ylläpidetty: vanhoja URL:eja on 198. Käsin
 * ylläpidetty lista ajautuu erilleen todellisuudesta hiljaa, ja jokainen
 * puuttuva ohjaus on menetetty sivu hakukoneessa.
 *
 * Lisäksi Blogspot-blogin kirjoitukset (docs/14 §5): `/blogspot/<blogin polku>` →
 * uutisen reitti, Sanityn `blogspot.polku`-kentästä. Bloggerin teema ohjaa
 * kävijän tähän polkuun, joten koko kartoitus pysyy tällä sivustolla.
 *
 * Skripti EPÄONNISTUU jos jokin vanha URL jää kartoittamatta. Se on
 * tarkoituksellista: hiljainen aukko on pahempi kuin punainen build.
 */
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  LITMANEN_LOUKKAANTUMISET_PATH,
  LITMANEN_PATH,
  LITMANEN_PATSAS_PATH,
  documentRoute,
  routableProjection,
  type RoutableDoc,
} from "../lib/path";
import { MAAKUNNAT, SUOMI } from "../lib/maakunnat";
import { isCountryLevelPlace } from "../lib/places";
import { slugify as placeSlug } from "../lib/slugify";
import { JULKINEN_RAVINTOLA } from "../lib/ravintola-arvosana";
import { sanityWriteToken } from "./lib/sanity-token";

const STATUS_FILE = join(process.cwd(), "data", "crawl-status.tsv");
const MANUAL_FILE = join(process.cwd(), "data", "manual-redirects.csv");
const BLOGSPOT_MAP = join(process.cwd(), "data", "normalized", "blogspot-map.json");
const OUT_FILE = join(process.cwd(), "lib", "redirects.ts");

/** Kehyssivut — eivät ole sisältöä, ohjataan etusivulle. */
const FRAME_PAGES = new Set(["index.html", "yla.htm", "links.htm", "etusivu.htm"]);

/**
 * Tarkat kartoitukset. Nämä ovat päätöksiä, ei arvauksia — katso
 * `docs/02-information-architecture.md`. Sanityn `legacyUrl` ohittaa nämä;
 * lista pidetään silti ajan tasalla, jotta `--offline`-ajo tuottaa saman.
 */
const EXACT: Record<string, string> = {
  "yleista.htm": "/klubi",
  "klubi.htm": "/klubi",
  "english.htm": "/english",
  "historia.htm": "/jalkapalloarkisto",
  "arvostelu.htm": "/jalkapalloarkisto/huuhkajat",
  "otteluihin.htm": "/jalkapalloarkisto/huuhkajat",
  "pelaajatilasto.htm": "/jalkapalloarkisto/huuhkajat",
  "pelaajienottelumaara.htm": "/jalkapalloarkisto/huuhkajat",
  "englanninylintasohuuhkajat.htm": "/jalkapalloarkisto/huuhkajat",
  "suomenika.htm": "/jalkapalloarkisto/huuhkajat",
  "suomenparasavauskokoonpano.htm": "/jalkapalloarkisto/huuhkajat",
  "suomen%20paras%20avauskokoonpano.htm": "/jalkapalloarkisto/huuhkajat",
  "veikkaus.htm": "/klubi/palloveikkaus",
  "veikkausarvokisat.htm": "/klubi/palloveikkaus/arvokisat",
  "veikkausmaaottelujentulos.htm": "/klubi/palloveikkaus/maaottelut",
  "veikkauspalloveikkaus.htm": "/klubi/palloveikkaus/veikkausliiga",
  "otsikkoarkisto.htm": "/uutiset/arkisto",
  "suomi.htm": "/jalkapalloarkisto/mestarit",
  "suomenvalmentajat.htm": "/jalkapalloarkisto/valmentajat",
  "suomenvalmentajientulot.htm": "/jalkapalloarkisto/valmentajat#valmentajien-palkat",
  "vuodenpelaaja.htm": "/jalkapalloarkisto/vuoden-pelaajat",
  "FIFAvuodenpelaaja.htm": "/jalkapalloarkisto/vuoden-pelaajat",
  "/FIFAvuodenpelaaja.htm": "/jalkapalloarkisto/vuoden-pelaajat",
  "euroopan_paras_pelaaja.htm": "/jalkapalloarkisto/euroopan-paras",
  "maailmanparhaat.htm": "/jalkapalloarkisto/maailman-parhaat",
  "top10jalkapallosaavutukset.htm": "/jalkapalloarkisto/saavutukset",
  "top10jalkapallojarkytykset.htm": "/jalkapalloarkisto/jarkytykset",
  "fifaranking.htm": "/jalkapalloarkisto/fifa-ranking",
  "lupaavia.htm": "/jalkapalloarkisto/lupaavat",
  "pikkuhuuhkajat.htm": "/jalkapalloarkisto/arvokisat/u21-em-2009",
  "unohtumattomat.htm": "/jalkapalloarkisto/tilastot/unohtumattomat",
  "puutteellisetjarjestelyt.htm": "/jalkapalloarkisto/tilastot/puutteelliset-jarjestelyt",
  "puheenjohtajat.htm": "/jalkapalloarkisto/palloliitto",
  "englanti.htm": "/jalkapalloarkisto/ulkomaiset-mestarit/englanti",
  "venaja.htm": "/jalkapalloarkisto/ulkomaiset-mestarit/venaja",
  "toriparkki.htm": "/toriparkki",
  "toriparkkilahti.htm": "/toriparkki",
  "Kuu.htm": "/ravintolat/kuu",
  "Loiste.htm": "/ravintolat/ravintola-loiste-vaakuna",
  "Salud.htm": "/ravintolat/salud",
  "ruokailu.htm": "/ravintolat",
  "ruokailutop5.htm": "/ravintolat",
  "stadionit.htm": "/jalkapalloarkisto/stadionit",
  "eurocuptilasto.htm": "/jalkapalloarkisto/eurocupit/champions-league",
  "uefacup.htm": "/jalkapalloarkisto/eurocupit/europa-league",
  "cupvoittajiencup.htm": "/jalkapalloarkisto/eurocupit/conference-league",
  "supercup.htm": "/jalkapalloarkisto/eurocupit/super-cup",
  "intercontinental.htm": "/jalkapalloarkisto/eurocupit/intercontinental",
  "maanosaliittojencup.htm": "/jalkapalloarkisto/eurocupit/intercontinental",
  "kansojenliiga.htm": "/jalkapalloarkisto/arvokisat",
  "mmtilasto.htm": "/jalkapalloarkisto/arvokisat",
  "emtilasto.htm": "/jalkapalloarkisto/arvokisat",
};

/**
 * Uuden sivuston sisäiset siirrot. Nämä eivät ole vanhoja .htm-osoitteita
 * vaan polkuja, jotka ovat olleet olemassa uudessa rakenteessa ja siirtyneet.
 * Ne eivät tule crawl-datasta, joten ne luetellaan tässä.
 */
const INTERNAL_MOVES: Record<string, string> = {
  yhteystiedot: "/klubi/yhteystiedot",
  // Säännöt-sivu poistettiin 29.9.2026 turhana; vanha osoite klubin etusivulle.
  "klubi/saannot": "/klubi",
};

/** Klubin toimintamuodot: vanha tiedostonimi → uusi slug. */
const TOIMINTA: Record<string, string> = {
  "talkoot.htm": "talkoot",
  "vappu.htm": "vappu",
  "molkky.htm": "molkky",
  "vuosikokous.htm": "vuosikokous",
  "jouluruokailu.htm": "jouluruokailu",
  "ilotulitukset.htm": "ilotulitukset",
  "venetsialaiset.htm": "venetsialaiset",
  "matkailu.htm": "matkailu",
  "musiikki.htm": "musiikki",
};

/** Pelaajasivut. */
const PELAAJAT: Record<string, string> = {
  "litmanen.htm": LITMANEN_LOUKKAANTUMISET_PATH,
  "litmanenjari.htm": LITMANEN_PATH,
  "litmanenjaripatsas.htm": LITMANEN_PATSAS_PATH,
};

/**
 * Järjestyksessä sovellettavat säännöt. Ensimmäinen osuma voittaa, joten
 * tarkemmat kuviot ovat ylempänä.
 */
const RULES: { pattern: RegExp; to: (m: RegExpMatchArray) => string }[] = [
  // Arvokisat: MM2010.htm, EM2024.htm → /arvokisat/mm-2010
  { pattern: /^(MM|EM)(\d{4})\.htm$/i, to: (m) => `/jalkapalloarkisto/arvokisat/${m[1].toLowerCase()}-${m[2]}` },

  // Otteluarkistot: ottelut2024ja2025.htm → Huuhkajien ottelut
  { pattern: /^ottelut\d{4}ja\d{4}\.htm$/i, to: () => "/jalkapalloarkisto/huuhkajat" },
  { pattern: /^maaottelut[\d_]+\.htm$/i, to: () => "/jalkapalloarkisto/huuhkajat" },

  // Uutis- ja blogiarkisto: kommentit2007q1.htm, blogi2012q3.htm → vuoden arkisto
  { pattern: /^(?:kommentit|blogi)\D*(\d{4}).*\.htm$/i, to: (m) => `/uutiset/arkisto/${m[1]}` },
  { pattern: /^kommentit.*\.htm$/i, to: () => "/uutiset/arkisto" },
  { pattern: /^blogi.*\.htm$/i, to: () => "/uutiset/arkisto" },

  // Stadionit: stadionlahtiurheilukeskus.htm → /stadionit/lahtiurheilukeskus
  { pattern: /^stadion(.+)\.htm$/i, to: (m) => `/jalkapalloarkisto/stadionit/${slugify(m[1])}` },

  // Ravintolat kaupungeittain: ruokailulahti.htm → /ravintolat?kaupunki=lahti
  { pattern: /^ruokailu(.+)\.htm$/i, to: (m) => `/ravintolat?kaupunki=${slugify(m[1])}` },

  // Yksittäiset stadion-/paikkasivut jotka eivät ala sanalla "stadion"
  { pattern: /^(wembleylontoo|ateenanolympiastadion|pietarikrestovskystadium)\.htm$/i,
    to: (m) => `/jalkapalloarkisto/stadionit/${slugify(m[1])}` },
];

/** Suomalainen slug: ä→a, ö→o, pienet kirjaimet, väliviivat. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[äå]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveByRules(path: string): string | null {
  if (FRAME_PAGES.has(path)) return "/";
  if (EXACT[path]) return EXACT[path];

  const toiminta = TOIMINTA[path];
  if (toiminta) return `/klubi/toiminta/${toiminta}`;

  const pelaaja = PELAAJAT[path];
  if (pelaaja) return pelaaja;

  for (const rule of RULES) {
    const match = path.match(rule.pattern);
    if (match) return rule.to(match);
  }
  return null;
}

async function readManual(): Promise<Map<string, string>> {
  const manual = new Map<string, string>();
  try {
    const csv = await readFile(MANUAL_FILE, "utf-8");
    for (const line of csv.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [from, to] = trimmed.split(",").map((part) => part.trim());
      if (from && to) manual.set(from.replace(/^\//, ""), to);
    }
  } catch {
    // Manuaalitiedosto on valinnainen.
  }
  return manual;
}

/* -------------------------------------------------------------------------- */
/* Sanity: legacyUrl → dokumentin reitti                                      */
/* -------------------------------------------------------------------------- */

interface LegacyDoc extends RoutableDoc {
  legacyUrl?: string | null;
  muutLegacyUrlit?: string[] | null;
  publishedAt?: string | null;
  jarjestys?: number | null;
  /** Vain ravintoloilla: viitattu kaupunkidokumentti. */
  city?: { slug?: string | null; name?: string | null; country?: string | null; maakunta?: string | null } | null;
  /** Vain ravintoloilla. */
  closed?: boolean | null;
  /**
   * Vain ravintoloilla: ei näy sivustolla (alle kaksi klubilaista arvioijaa,
   * lib/ravintola-arvosana.ts). Ei omaa sivua eikä kuulu aluenäkymiin.
   */
  piilotettu?: boolean | null;
}

interface Candidate {
  doc: LegacyDoc;
  /** Onko osoite dokumentin pää-`legacyUrl` (true) vai `muutLegacyUrlit`-listassa. */
  primary: boolean;
  path: string;
  anchor?: string;
}

/**
 * Tyyppien etusija, kun useampi dokumentti jakaa saman vanhan osoitteen.
 * Oma sivu voittaa listaussivun osion: esim. MM2010.htm on sekä arvokisan
 * että sen kahdeksan lohkotaulukon `legacyUrl`, ja ohjaus menee kisasivulle.
 */
const TYPE_PRIORITY = [
  "sivu",
  "klubiToiminta",
  "arvokisa",
  "pelaaja",
  "stadion",
  "ravintola",
  "uutinen",
  "jalkapalloTilasto",
];

/**
 * Ravintoloiden pää-`legacyUrl` on kaupunkisivu (ruokailulahti.htm), jonka
 * jakaa kymmeniä ravintoloita — kaupunkisivu ohjautuu suodatettuun listaan
 * säännöllä. Ravintolan omat vanhat sivut (Kuu.htm) ovat `muutLegacyUrlit`issa.
 */
const SHARED_LEGACY_TYPES = new Set(["ravintola"]);

/**
 * Vanhan ravintolasivun (ruokailu*.htm) kohde johdetaan sivun ravintoloista:
 * tarkin hakemistonäkymä, joka sisältää KAIKKI sivun ravintolat.
 *
 *  1. kaikki samassa kaupungissa       → `?kaupunki=<slug>`
 *     (ei maa-tason viitettä, ks. `lib/places.ts`)
 *  2. kaikki Suomessa, yksi maakunta    → `?maakunta=<arvo>`
 *  3. kaikki Suomessa, 2–3 maakuntaa    → `?maakunta=<a>,<b>` (sivu ylittää maakuntarajan,
 *     esim. Uusimaa-sivun Riihimäki on Kanta-Hämeessä)
 *  4. kaikki samassa maassa            → `?maa=<slug>`
 *  5. muuten                           → `/ravintolat`
 *
 * Jos sivulla on toimintansa lopettaneita ravintoloita, kohteeseen lisätään
 * `lopettaneet=1`: vanha sivu listasi ne, ja oletusnäkymä piilottaa ne.
 *
 * Kattavuus lasketaan simuloimalla hakemiston suodatin (sama logiikka kuin
 * `sanity/lib/queries/ravintolat.ts`:n `directoryFilter`) kaikkiin ravintoloihin.
 * Alle 100 % → ajo epäonnistuu.
 */
const MAX_MAAKUNNAT = 3;

/** Sivun ravintolat: pää-`legacyUrl` tai `muutLegacyUrlit`. Koostesivut eivät ole aluesivuja. */
const RAVINTOLA_PAGE = /^ruokailu.+\.htm$/;
const RAVINTOLA_INDEX_PAGES = new Set(["ruokailu.htm", "ruokailutop5.htm"]);

interface ViewFilter {
  kaupunki?: string;
  maa?: string;
  maakunta?: string[];
  lopettaneet?: boolean;
}

/** Sama parametrijärjestys kuin `components/ravintola-filters.tsx`:n `buildRavintolaHref`. */
function viewHref(v: ViewFilter): string {
  const parts: string[] = [];
  if (v.kaupunki) parts.push(`kaupunki=${v.kaupunki}`);
  if (v.maa) parts.push(`maa=${v.maa}`);
  if (v.maakunta?.length) parts.push(`maakunta=${v.maakunta.join(",")}`);
  if (v.lopettaneet) parts.push("lopettaneet=1");
  return parts.length ? `/ravintolat?${parts.join("&")}` : "/ravintolat";
}

function inView(doc: LegacyDoc, v: ViewFilter): boolean {
  const city = doc.city ?? {};
  if (v.kaupunki && city.slug !== v.kaupunki) return false;
  if (v.maa && (!city.country || placeSlug(city.country) !== v.maa)) return false;
  if (v.maakunta?.length && !(city.country === SUOMI && city.maakunta && v.maakunta.includes(city.maakunta))) {
    return false;
  }
  if (!v.lopettaneet && doc.closed === true) return false;
  return true;
}

interface RavintolaPageReport {
  sivu: string;
  kohde: string;
  taso: "kaupunki" | "maakunta" | "maakunnat" | "maa" | "kaikki";
  sivunRavintoloita: number;
  naytetaan: number;
  nakymanKoko: number;
}

function ravintolaViewFor(restaurants: LegacyDoc[]): { view: ViewFilter; taso: RavintolaPageReport["taso"] } {
  const lopettaneet = restaurants.some((r) => r.closed === true) || undefined;
  const cities = new Set(restaurants.map((r) => r.city?.slug ?? ""));
  const only = restaurants[0]?.city;
  if (cities.size === 1 && only?.slug && !isCountryLevelPlace(only)) {
    return { view: { kaupunki: only.slug, lopettaneet }, taso: "kaupunki" };
  }
  if (restaurants.every((r) => r.city?.country === SUOMI && r.city.maakunta)) {
    const present = new Set(restaurants.map((r) => r.city!.maakunta!));
    const ordered = MAAKUNNAT.map((m) => m.value as string).filter((m) => present.has(m));
    if (ordered.length === 1) return { view: { maakunta: ordered, lopettaneet }, taso: "maakunta" };
    if (ordered.length <= MAX_MAAKUNNAT) return { view: { maakunta: ordered, lopettaneet }, taso: "maakunnat" };
  }
  const countries = new Set(restaurants.map((r) => (r.city?.country ? placeSlug(r.city.country) : "")));
  if (countries.size === 1 && !countries.has("")) {
    return { view: { maa: [...countries][0], lopettaneet }, taso: "maa" };
  }
  return { view: { lopettaneet }, taso: "kaikki" };
}

function ravintolaPageDestinations(docs: LegacyDoc[]): {
  destinations: Map<string, { to: string; why: string }>;
  report: RavintolaPageReport[];
} {
  const all = docs.filter((d) => d._type === "ravintola" && !d.piilotettu);
  const byPage = new Map<string, LegacyDoc[]>();
  for (const doc of all) {
    const pages = new Set(
      [doc.legacyUrl, ...(doc.muutLegacyUrlit ?? [])]
        .filter((u): u is string => Boolean(u))
        .map(legacyKey)
        .filter((k) => RAVINTOLA_PAGE.test(k) && !RAVINTOLA_INDEX_PAGES.has(k)),
    );
    for (const key of pages) byPage.set(key, [...(byPage.get(key) ?? []), doc]);
  }
  const destinations = new Map<string, { to: string; why: string }>();
  const report: RavintolaPageReport[] = [];
  for (const [key, restaurants] of [...byPage.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const { view, taso } = ravintolaViewFor(restaurants);
    const to = viewHref(view);
    const naytetaan = restaurants.filter((r) => inView(r, view)).length;
    const nakymanKoko = all.filter((r) => inView(r, view)).length;
    report.push({ sivu: key, kohde: to, taso, sivunRavintoloita: restaurants.length, naytetaan, nakymanKoko });
    destinations.set(key, {
      to,
      why: `${taso}: ${naytetaan}/${restaurants.length} sivun ravintolaa, näkymässä ${nakymanKoko}`,
    });
  }
  return { destinations, report };
}

async function fetchLegacyDocs(): Promise<LegacyDoc[]> {
  const query = /* groq */ `*[
    !(_id in path("drafts.**"))
    && (defined(legacyUrl) || defined(muutLegacyUrlit))
  ]{
    ${routableProjection},
    legacyUrl,
    muutLegacyUrlit,
    publishedAt,
    jarjestys,
    "city": select(_type == "ravintola" => city->{ "slug": slug.current, name, country, maakunta }),
    "closed": select(_type == "ravintola" => closed),
    "piilotettu": select(_type == "ravintola" => !${JULKINEN_RAVINTOLA})
  }`;
  const docs = await sanityQuery<LegacyDoc[]>(query);
  console.log(`Sanity (${redirectsDataset()}): ${docs.length} dokumenttia, joilla vanha osoite`);
  // Tyhjä tulos tarkoittaa lähes aina puuttuvaa lukuoikeutta (yksityinen
  // datasetti ilman tokenia), ei sitä, että ohjaukset olisi poistettu. Tyhjä
  // lib/redirects.ts rikkoisi satoja vanhoja osoitteita hiljaa.
  if (docs.length === 0) {
    throw new Error(
      `Sanity (${redirectsDataset()}) palautti 0 dokumenttia, joilla on vanha osoite. ` +
        "Tarkista lukuoikeus (`npx sanity login` tai SANITY_API_WRITE_TOKEN .env.local-tiedostossa) " +
        "ja datasetti. lib/redirects.ts jätettiin ennalleen.",
    );
  }
  return docs;
}

/* -------------------------------------------------------------------------- */
/* Blogspot                                                                   */
/* -------------------------------------------------------------------------- */

interface BlogspotDoc extends RoutableDoc {
  polku: string;
}

/**
 * Blogin polku → uutisen reitti. Sanity on auktoritatiivinen (slug voi muuttua
 * Studiossa); `--offline`-ajossa käytetään importin karttaa, jos se on olemassa.
 */
async function blogspotDestinations(offline: boolean): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (offline) {
    if (!existsSync(BLOGSPOT_MAP)) return out;
    const map = JSON.parse(await readFile(BLOGSPOT_MAP, "utf-8")) as { polku: string; uusi: string }[];
    for (const row of map) out.set(row.polku, row.uusi);
    return out;
  }
  const query = /* groq */ `*[
    _type == "uutinen" && defined(blogspot.polku) && !(_id in path("drafts.**"))
  ] | order(blogspot.polku asc){ ${routableProjection}, "polku": blogspot.polku }`;
  for (const doc of await sanityQuery<BlogspotDoc[]>(query)) {
    const route = documentRoute(doc);
    if (route) out.set(doc.polku, route.path);
  }
  return out;
}

function redirectsDataset(): string {
  return process.env.SANITY_REDIRECTS_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? "development";
}

/**
 * Luku tokenilla: production on yksityinen Growth-kokeilun ajan, ja ilman
 * tokenia kysely palauttaisi tyhjän tuloksen virheettä. `sanityWriteToken`
 * käyttää .env.local-tiedoston tokenia tai Sanity CLI:n kirjautumista.
 */
async function sanityQuery<T>(query: string): Promise<T> {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) {
    throw new Error(
      "NEXT_PUBLIC_SANITY_PROJECT_ID puuttuu. Aja `npm run redirects -- --offline`, " +
        "jos haluat generoida ohjaukset pelkillä säännöillä.",
    );
  }
  // Luku on turvallista mistä tahansa datasetista; oletus on migraation development.
  const token = sanityWriteToken() ?? process.env.SANITY_API_READ_TOKEN;
  const url =
    `https://${projectId}.api.sanity.io/v2024-10-01/data/query/${redirectsDataset()}` +
    `?query=${encodeURIComponent(query)}&perspective=published`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`Sanity-kysely epäonnistui: HTTP ${res.status}`);
  return ((await res.json()) as { result: T }).result;
}

/** `/Sivu.htm`, `sivu.htm` → `sivu.htm` (vertailuavain; kirjainkoko ei ratkaise). */
function legacyKey(url: string): string {
  return url.trim().replace(/^\/+/, "").toLowerCase();
}

function buildCandidates(docs: LegacyDoc[]): Map<string, Candidate[]> {
  const byUrl = new Map<string, Candidate[]>();
  const add = (url: string, doc: LegacyDoc, primary: boolean) => {
    const route = documentRoute(doc);
    if (!route) return;
    const key = legacyKey(url);
    const list = byUrl.get(key) ?? [];
    list.push({ doc, primary, path: route.path, anchor: route.anchor });
    byUrl.set(key, list);
  };
  for (const doc of docs) {
    // Piilotetulla ravintolalla ei ole sivua; sen aluesivu ohjautuu aluenäkymään muiden mukana.
    if (doc.piilotettu) continue;
    if (doc.legacyUrl && !SHARED_LEGACY_TYPES.has(doc._type)) add(doc.legacyUrl, doc, true);
    for (const other of doc.muutLegacyUrlit ?? []) {
      // Ravintolan muu osoite, joka on aluesivu, ohjautuu aluenäkymään (ravintolaPageDestinations).
      if (SHARED_LEGACY_TYPES.has(doc._type) && RAVINTOLA_PAGE.test(legacyKey(other))) continue;
      add(other, doc, false);
    }
  }
  return byUrl;
}

function typeRank(type: string): number {
  const index = TYPE_PRIORITY.indexOf(type);
  return index === -1 ? TYPE_PRIORITY.length : index;
}

function compareCandidates(a: Candidate, b: Candidate): number {
  return (
    typeRank(a.doc._type) - typeRank(b.doc._type) ||
    Number(b.primary) - Number(a.primary) ||
    // Oma sivu ennen listaussivun osiota (karsintasivu ennen Huuhkajat#…).
    Number(Boolean(a.anchor)) - Number(Boolean(b.anchor)) ||
    (a.doc.jarjestys ?? 1_000) - (b.doc.jarjestys ?? 1_000) ||
    a.doc._id.localeCompare(b.doc._id)
  );
}

/**
 * Valitsee ohjauksen kohteen yhden vanhan osoitteen ehdokkaista.
 *
 *  - Uutiset: vuosisivu (kommentit2008q4.htm) sisältää monta merkintää →
 *    `/uutiset/arkisto/<vuosi>`. Vuosi on tiedostonimen vuosi, jos sillä on
 *    merkintöjä, muuten yleisin merkintöjen vuosi. Yhden merkinnän sivu → uutinen.
 *  - Muut: paras ehdokas `compareCandidates`-järjestyksessä. Jos saman tyypin
 *    omia sivuja on useita (kansojenliiga.htm → viisi kautta), kohde on niiden
 *    yhteinen listaussivu.
 */
function pickDestination(legacyPath: string, candidates: Candidate[]): { to: string; why: string } {
  const sorted = [...candidates].sort(compareCandidates);
  const best = sorted[0];

  if (best.doc._type === "uutinen") {
    const news = sorted.filter((c) => c.doc._type === "uutinen");
    if (news.length === 1) return { to: best.path, why: "uutinen" };
    const years = news.map((c) => (c.doc.publishedAt ?? "").slice(0, 4)).filter(Boolean);
    const fileYear = legacyPath.match(/(\d{4})/)?.[1];
    let year = fileYear && years.includes(fileYear) ? fileYear : undefined;
    if (!year) {
      const counts = new Map<string, number>();
      for (const y of years) counts.set(y, (counts.get(y) ?? 0) + 1);
      year = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0].localeCompare(a[0]))[0]?.[0];
    }
    return year
      ? { to: `/uutiset/arkisto/${year}`, why: `${news.length} uutista → vuosiarkisto` }
      : { to: "/uutiset/arkisto", why: `${news.length} uutista ilman päiväystä` };
  }

  const sameLevel = sorted.filter(
    (c) => c.doc._type === best.doc._type && !c.anchor && !best.anchor,
  );
  const distinctPages = new Set(sameLevel.map((c) => c.path));
  if (distinctPages.size > 1) {
    const listing = best.path.replace(/\/[^/]+$/, "");
    return { to: listing, why: `${distinctPages.size} × ${best.doc._type} → listaus` };
  }

  return {
    to: best.anchor ? `${best.path}#${best.anchor}` : best.path,
    why: `${best.doc._type}${sorted.length > 1 ? ` (${sorted.length} ehdokasta)` : ""}`,
  };
}

/* -------------------------------------------------------------------------- */

async function main() {
  const offline = process.argv.includes("--offline");
  const tsv = await readFile(STATUS_FILE, "utf-8");
  const paths = tsv
    .split(/\r?\n/)
    // Crawl-data sisältää sekä "sivu.htm" että "/sivu.htm" -muotoja; ilman
    // normalisointia syntyisi ohjaus osoitteesta "//sivu.htm".
    .map((line) => line.split("\t")[2]?.trim().replace(/^\/+/, ""))
    .filter((path): path is string => Boolean(path));

  const manual = await readManual();
  const legacyDocs = offline ? [] : await fetchLegacyDocs();
  const candidates = buildCandidates(legacyDocs);
  const { destinations: ravintolaPages, report: ravintolaReport } = ravintolaPageDestinations(legacyDocs);
  const incomplete = ravintolaReport.filter((r) => r.naytetaan !== r.sivunRavintoloita);
  if (incomplete.length > 0) {
    console.error(
      `\nVIRHE: ${incomplete.length} ravintolasivun ohjaus ei näytä kaikkia sivun ravintoloita:\n` +
        incomplete.map((r) => `  ${r.sivu}: ${r.naytetaan}/${r.sivunRavintoloita} → ${r.kohde}`).join("\n"),
    );
    process.exit(1);
  }

  const mapped = new Map<string, string>(Object.entries(INTERNAL_MOVES));
  const unmapped: string[] = [];
  const source = { manual: 0, sanity: 0, rules: 0 };
  const differsFromRules: string[] = [];

  for (const path of [...new Set(paths)]) {
    const fromManual = manual.get(path);
    const fromSanityCandidates = candidates.get(legacyKey(path));
    const fromSanity = fromSanityCandidates
      ? pickDestination(path, fromSanityCandidates)
      : (ravintolaPages.get(legacyKey(path)) ?? null);
    const fromRules = resolveByRules(path);

    const destination = fromManual ?? fromSanity?.to ?? fromRules;
    if (!destination) {
      unmapped.push(path);
      continue;
    }
    mapped.set(path, destination);
    if (fromManual) source.manual += 1;
    else if (fromSanity) source.sanity += 1;
    else source.rules += 1;

    if (!fromManual && fromSanity && fromRules && fromRules.split("#")[0] !== fromSanity.to.split("#")[0]) {
      differsFromRules.push(`  ${path}: ${fromRules} → ${fromSanity.to} (${fromSanity.why})`);
    }
  }

  // Sanityssa vanha osoite, jota crawl ei tunne: todennäköisesti kirjoitusvirhe.
  const crawlKeys = new Set(paths.map(legacyKey));
  const unknownLegacy = [...candidates.keys()].filter((key) => !crawlKeys.has(key));

  if (unmapped.length > 0) {
    console.error(
      `\nVIRHE: ${unmapped.length} vanhaa URL:ia jäi kartoittamatta.\n` +
        `Lisää ne data/manual-redirects.csv:hen (muoto: vanha.htm,/uusi/polku), ` +
        `aseta dokumentin legacyUrl Sanityssa tai laajenna skriptin sääntöjä.\n\n` +
        unmapped.map((path) => `  ${path}`).join("\n") +
        "\n",
    );
    process.exit(1);
  }

  const entries = [...mapped.entries()].sort(([a], [b]) => a.localeCompare(b, "fi"));
  const lines = entries.map(
    ([from, to]) =>
      `  { source: "/${from}", destination: ${JSON.stringify(to)}, permanent: true },`,
  );

  const blogspot = await blogspotDestinations(offline);
  if (offline && blogspot.size === 0) {
    console.warn("\nHUOM: --offline ilman data/normalized/blogspot-map.json-tiedostoa: blogiohjaukset hoitaa vain app/blogspot-reitti.");
  }
  if (!offline && blogspot.size === 0) {
    throw new Error(
      `Sanity (${redirectsDataset()}) palautti 0 Blogspot-uutista. Tarkista lukuoikeus ja datasetti. ` +
        "lib/redirects.ts jätettiin ennalleen.",
    );
  }
  const blogspotLines = [...blogspot.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([from, to]) =>
        `  { source: ${JSON.stringify(`/blogspot${from}`)}, destination: ${JSON.stringify(to)}, permanent: true },`,
    );
  // Ei yleissääntöä (/blogspot/:polku*): next.config-ohjaukset käsitellään ennen
  // reittejä, joten se nappaisi myös generoinnin jälkeen tuodut kirjoitukset.
  // Muut blogiosoitteet hoitaa app/blogspot/[...polku]/route.ts (Sanity-haku).

  const file = `import type { Redirect } from "next/dist/lib/load-custom-routes";

/**
 * Vanhojen .htm-URL:ien ohjaukset uusiin osoitteisiin.
 *
 * GENEROITU TIEDOSTO — älä muokkaa käsin.
 * Aja \`npm run redirects\` uudelleen, tai lisää poikkeus
 * \`data/manual-redirects.csv\`:hen. Kohteet tulevat ensisijaisesti Sanityn
 * \`legacyUrl\`-kentistä (ks. scripts/generate-redirects.ts).
 *
 * Lähde: vanhan sivuston täysi crawl (${entries.length} osoitetta).
 * Säilytä redirectit vähintään 6 kuukautta julkaisun jälkeen.
 *
 * Next.js palauttaa \`permanent: true\` -ohjaukselle 308:n, jonka hakukoneet
 * käsittelevät kuten 301:n.
 */
export const legacyRedirects: Redirect[] = [
${lines.join("\n")}
];

/**
 * Blogspot-blogin kirjoitukset (${blogspot.size}) → uutiset. Bloggerin teema ohjaa
 * kävijän osoitteeseen /blogspot/<blogin polku> (docs/14 §5). Generoinnin jälkeen
 * tuodut kirjoitukset ja blogin muut sivut (etusivu, tunnisteet, arkistot) hoitaa
 * app/blogspot/[...polku]/route.ts, joka hakee kirjoituksen Sanitystä.
 */
export const blogspotRedirects: Redirect[] = [
${blogspotLines.join("\n")}
];
`;

  await writeFile(OUT_FILE, file, "utf-8");

  const destinations = new Set(mapped.values());
  if (differsFromRules.length > 0) {
    console.log(`\nSanity poikkeaa sääntöjen fallbackista (${differsFromRules.length}):\n${differsFromRules.join("\n")}`);
  }
  if (unknownLegacy.length > 0) {
    console.warn(`\nHUOM: Sanityssa ${unknownLegacy.length} legacyUrl:ia, joita crawl ei tunne:\n${unknownLegacy.map((k) => `  ${k}`).join("\n")}`);
  }
  if (ravintolaReport.length > 0) {
    console.log(
      `\nRavintolasivut (${ravintolaReport.length}): sivu → kohde (taso) — kattavuus, näkymän koko\n` +
        ravintolaReport
          .map(
            (r) =>
              `  ${r.sivu.padEnd(28)} → ${r.kohde.padEnd(56)} ${r.taso.padEnd(9)} ` +
              `${r.naytetaan}/${r.sivunRavintoloita} (${Math.round((100 * r.naytetaan) / r.sivunRavintoloita)} %), näkymässä ${r.nakymanKoko}`,
          )
          .join("\n"),
    );
  }
  console.log(`
Vanhoja URL:eja ......... ${mapped.size}
Kohdeosoitteita ......... ${destinations.size}
  Sanitysta ............. ${source.sanity}
  Säännöistä ............ ${source.rules}
  Manuaalisia ........... ${source.manual}
Kartoittamatta .......... 0
Blogspot-kirjoituksia ... ${blogspot.size}

Kirjoitettu: ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
