/**
 * Generoi `lib/redirects.ts`:n vanhan sivuston URL-listasta.
 *
 * Ajo: `npm run redirects`
 * Lähde: data/crawl-status.tsv (tuotettu `npm run crawl`)
 *        data/manual-redirects.csv (valinnainen, `vanha,uusi` per rivi)
 *
 * Miksi generoitu eikä käsin ylläpidetty: vanhoja URL:eja on 198. Käsin
 * ylläpidetty lista ajautuu erilleen todellisuudesta hiljaa, ja jokainen
 * puuttuva ohjaus on menetetty sivu hakukoneessa.
 *
 * Skripti EPÄONNISTUU jos jokin vanha URL jää kartoittamatta. Se on
 * tarkoituksellista: hiljainen aukko on pahempi kuin punainen build.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const STATUS_FILE = join(process.cwd(), "data", "crawl-status.tsv");
const MANUAL_FILE = join(process.cwd(), "data", "manual-redirects.csv");
const OUT_FILE = join(process.cwd(), "lib", "redirects.ts");

/** Kehyssivut — eivät ole sisältöä, ohjataan etusivulle. */
const FRAME_PAGES = new Set(["index.html", "yla.htm", "links.htm", "etusivu.htm"]);

/**
 * Tarkat kartoitukset. Nämä ovat päätöksiä, ei arvauksia — katso
 * `docs/02-information-architecture.md`.
 */
const EXACT: Record<string, string> = {
  "yleista.htm": "/klubi",
  "klubi.htm": "/klubi",
  "english.htm": "/klubi",
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
  "veikkausarvokisat.htm": "/klubi/palloveikkaus",
  "veikkausmaaottelujentulos.htm": "/klubi/palloveikkaus",
  "veikkauspalloveikkaus.htm": "/klubi/palloveikkaus",
  "otsikkoarkisto.htm": "/uutiset/arkisto",
  "suomi.htm": "/jalkapalloarkisto/mestarit",
  "suomenvalmentajat.htm": "/jalkapalloarkisto/valmentajat",
  "suomenvalmentajientulot.htm": "/jalkapalloarkisto/valmentajat#palkat",
  "vuodenpelaaja.htm": "/jalkapalloarkisto/vuoden-pelaajat",
  "FIFAvuodenpelaaja.htm": "/jalkapalloarkisto/vuoden-pelaajat",
  "/FIFAvuodenpelaaja.htm": "/jalkapalloarkisto/vuoden-pelaajat",
  "euroopan_paras_pelaaja.htm": "/jalkapalloarkisto/euroopan-paras",
  "maailmanparhaat.htm": "/jalkapalloarkisto/euroopan-paras",
  "top10jalkapallosaavutukset.htm": "/jalkapalloarkisto/saavutukset",
  "top10jalkapallojarkytykset.htm": "/jalkapalloarkisto/saavutukset",
  "fifaranking.htm": "/jalkapalloarkisto/fifa-ranking",
  "lupaavia.htm": "/jalkapalloarkisto/lupaavat",
  "pikkuhuuhkajat.htm": "/jalkapalloarkisto/pelaajat",
  "unohtumattomat.htm": "/jalkapalloarkisto",
  "puutteellisetjarjestelyt.htm": "/jalkapalloarkisto/stadionit",
  "matkailu.htm": "/klubi/toiminta",
  "musiikki.htm": "/klubi/toiminta",
  "puheenjohtajat.htm": "/klubi/hallitus",
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
};

/** Pelaajasivut. */
const PELAAJAT: Record<string, string> = {
  "litmanen.htm": "jari-litmanen",
  "litmanenjari.htm": "jari-litmanen",
  "litmanenjaripatsas.htm": "jari-litmanen",
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

  // Uutis- ja blogiarkisto: kommentit2007q1.htm, blogi2012q3.htm
  { pattern: /^kommentit.*\.htm$/i, to: () => "/uutiset/arkisto" },
  { pattern: /^blogi.*\.htm$/i, to: () => "/uutiset/arkisto" },

  // Stadionit: stadionlahtiurheilukeskus.htm → /stadionit/lahtiurheilukeskus
  { pattern: /^stadion(.+)\.htm$/i, to: (m) => `/jalkapalloarkisto/stadionit/${slugify(m[1])}` },

  // Ravintolat kaupungeittain: ruokailulahti.htm → /ravintolat?kaupunki=lahti
  { pattern: /^ruokailu(.+)\.htm$/i, to: (m) => `/ravintolat?kaupunki=${slugify(m[1])}` },

  // Yksittäiset stadion-/paikkasivut jotka eivät ala sanalla "stadion"
  { pattern: /^(wembleylontoo|ateenanolympiastadion|pietarikrestovskystadium)\.htm$/i,
    to: (m) => `/jalkapalloarkisto/stadionit/${slugify(m[1])}` },

  // Maakohtaiset kooste- ja muistelusivut
  { pattern: /^(englanti|venaja|toriparkki|toriparkkilahti|Kuu|Loiste|Salud)\.htm$/i,
    to: () => "/jalkapalloarkisto" },
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

function resolve(path: string): string | null {
  if (FRAME_PAGES.has(path)) return "/";
  if (EXACT[path]) return EXACT[path];

  const toiminta = TOIMINTA[path];
  if (toiminta) return `/klubi/toiminta/${toiminta}`;

  const pelaaja = PELAAJAT[path];
  if (pelaaja) return `/jalkapalloarkisto/pelaajat/${pelaaja}`;

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

async function main() {
  const tsv = await readFile(STATUS_FILE, "utf-8");
  const paths = tsv
    .split(/\r?\n/)
    // Crawl-data sisältää sekä "sivu.htm" että "/sivu.htm" -muotoja; ilman
    // normalisointia syntyisi ohjaus osoitteesta "//sivu.htm".
    .map((line) => line.split("\t")[2]?.trim().replace(/^\/+/, ""))
    .filter((path): path is string => Boolean(path));

  const manual = await readManual();
  const mapped = new Map<string, string>(Object.entries(INTERNAL_MOVES));
  const unmapped: string[] = [];

  for (const path of [...new Set(paths)]) {
    const destination = manual.get(path) ?? resolve(path);
    if (destination) {
      mapped.set(path, destination);
    } else {
      unmapped.push(path);
    }
  }

  if (unmapped.length > 0) {
    console.error(
      `\nVIRHE: ${unmapped.length} vanhaa URL:ia jäi kartoittamatta.\n` +
        `Lisää ne data/manual-redirects.csv:hen (muoto: vanha.htm,/uusi/polku) ` +
        `tai laajenna skriptin sääntöjä.\n\n` +
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

  const file = `import type { Redirect } from "next/dist/lib/load-custom-routes";

/**
 * Vanhojen .htm-URL:ien ohjaukset uusiin osoitteisiin.
 *
 * GENEROITU TIEDOSTO — älä muokkaa käsin.
 * Aja \`npm run redirects\` uudelleen, tai lisää poikkeus
 * \`data/manual-redirects.csv\`:hen.
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
`;

  await writeFile(OUT_FILE, file, "utf-8");

  const destinations = new Set(mapped.values());
  console.log(`
Vanhoja URL:eja ......... ${mapped.size}
Kohdeosoitteita ......... ${destinations.size}
Manuaalisia poikkeuksia . ${manual.size}
Kartoittamatta .......... 0

Kirjoitettu: ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
