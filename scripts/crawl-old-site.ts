/**
 * Crawlaa vanhan lahdensuomalainenklubi.com -sivuston kokonaan.
 *
 * Ajo: `npm run crawl`
 * Tulos: data/raw-html/<sivu>.htm  +  data/crawl-status.tsv
 *
 * Korvaa `scripts/scrape-old-site.ts`:n, jonka kovakoodattu URL-lista sisälsi
 * arvattuja osoitteita (esim. /ottelut.htm, /klubi.htm) joita ei ole olemassa.
 * Tämä seuraa oikeita linkkejä, joten mitään ei jää löytymättä.
 *
 * Vanha sivusto on FrontPage-frameset: index.html määrittelee kehykset, ja
 * jokainen osio on oma .htm-tiedostonsa. Siksi crawl lähtee kehyssivuista.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const BASE = "https://www.lahdensuomalainenklubi.com";
const OUT_DIR = join(process.cwd(), "data", "raw-html");
const STATUS_FILE = join(process.cwd(), "data", "crawl-status.tsv");

/** Framesetin kehyssivut — crawlin lähtöpisteet. */
const SEEDS = ["index.html", "yla.htm", "links.htm", "etusivu.htm"];

/** Kohteliaisuusviive pyyntöjen välissä (ms). */
const DELAY = 150;

const HTML_LINK = /(?:href|src)\s*=\s*["']([^"']+)["']/gi;

interface PageResult {
  path: string;
  status: number;
  bytes: number;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Tiedostonimi johon sivu tallennetaan (alihakemistot litistetään). */
function safeName(path: string): string {
  return path.replace(/\//g, "_");
}

/** Poimii sivun sisäiset .htm/.html-linkit. */
function extractLinks(html: string): string[] {
  const found = new Set<string>();
  for (const match of html.matchAll(HTML_LINK)) {
    const raw = match[1].trim().split("#")[0];
    if (!raw) continue;
    if (/^(https?:|mailto:|javascript:|tel:|\/\/)/i.test(raw)) continue;
    if (!/\.html?$/i.test(raw)) continue;
    found.add(raw.replace(/^\.\//, "").replace(/^\//, ""));
  }
  return [...found];
}

async function fetchPage(path: string): Promise<{ status: number; body: string }> {
  try {
    const res = await fetch(`${BASE}/${path}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 KlubiMigrationBot/1.0 (+contact via lahdensuomalainenklubi.com)",
      },
      signal: AbortSignal.timeout(25_000),
    });
    // Vanhat sivut ovat osin windows-1252, osin us-ascii. Tallennetaan
    // tavut sellaisenaan latin1:nä; parserit tunnistavat koodauksen itse.
    const buffer = Buffer.from(await res.arrayBuffer());
    return { status: res.status, body: buffer.toString("latin1") };
  } catch (error) {
    console.error(`  virhe ${path}:`, error instanceof Error ? error.message : error);
    return { status: 0, body: "" };
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const visited = new Set<string>();
  const results: PageResult[] = [];
  let queue = [...SEEDS];

  while (queue.length > 0) {
    const batch = queue.filter((p) => !visited.has(p));
    queue = [];

    for (const path of batch) {
      if (visited.has(path)) continue;
      visited.add(path);

      const { status, body } = await fetchPage(path);
      results.push({ path, status, bytes: body.length });

      if (status === 200) {
        await writeFile(join(OUT_DIR, safeName(path)), body, "latin1");
        for (const link of extractLinks(body)) {
          if (!visited.has(link)) queue.push(link);
        }
      }

      process.stdout.write(
        `  ${String(status).padEnd(4)} ${String(body.length).padStart(7)}  ${path}\n`,
      );
      await sleep(DELAY);
    }
  }

  const tsv = results
    .map((r) => `${r.status}\t${r.bytes}\t${r.path}`)
    .join("\n");
  await writeFile(STATUS_FILE, `${tsv}\n`, "utf-8");

  const ok = results.filter((r) => r.status === 200);
  const failed = results.filter((r) => r.status !== 200);

  console.log(`
Sivuja käyty ............ ${results.length}
Onnistui ................ ${ok.length}
Epäonnistui ............. ${failed.length}${
    failed.length ? `\n  ${failed.map((f) => `${f.status} ${f.path}`).join("\n  ")}` : ""
  }
Tavuja yhteensä ......... ${ok.reduce((s, r) => s + r.bytes, 0).toLocaleString("fi-FI")}

HTML: ${OUT_DIR}
Tila: ${STATUS_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
