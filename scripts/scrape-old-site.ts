/**
 * Scrape-skripti vanhan lahdensuomalainenklubi.com -sivuston inventointiin.
 *
 * Ajo: `npm run scrape`
 *
 * Lukee sivut listalta, hakee niiden sisällön, tallentaa raakaformaatissa
 * data/raw-content.json -tiedostoon. Älä modifioi sisältöä tässä vaiheessa —
 * import-to-sanity.ts vastaa normalisoinnista.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { load } from "cheerio";

const BASE = "https://www.lahdensuomalainenklubi.com";

const TARGETS = [
  "/",
  // Jalkapalloarkisto
  "/fifaranking.htm",
  "/suomi.htm",
  "/suomenvalmentajat.htm",
  "/suomenvalmentajientulot.htm",
  "/vuodenpelaaja.htm",
  "/FIFAvuodenpelaaja.htm",
  "/euroopan_paras_pelaaja.htm",
  "/top10jalkapallosaavutukset.htm",
  "/ottelut2012ja2013.htm",
  "/intercontinental.htm",
  "/cupvoittajiencup.htm",
  "/uefacup.htm",
  "/supercup.htm",
  "/eurocuptilasto.htm",
  "/lupaavia.htm",
  "/Kommentit2022.htm",
  // Stadionit
  "/stadionit.htm",
  "/stadionlahtiurheilukeskus.htm",
  "/stadionhelsinkiolympiastadion.htm",
  // Ravintolat
  "/ruokailu.htm",
  "/ruokailulahti.htm",
  "/ruokailuhameenlinna.htm",
  "/ruokailulappeenranta.htm",
  "/ruokailupirkanmaa.htm",
  "/ruokailukokkola.htm",
  "/ruokailuuusimaa.htm",
  "/ruokailukreikka.htm",
];

interface ScrapedTable {
  caption?: string;
  headers: string[];
  rows: string[][];
}

interface ScrapedPage {
  url: string;
  fetchedAt: string;
  httpStatus: number;
  title: string;
  bodyText: string;
  headings: { level: number; text: string }[];
  paragraphs: string[];
  tables: ScrapedTable[];
  links: { href: string; text: string }[];
  images: { src: string; alt: string | null }[];
  rawHtml: string;
}

async function scrapePage(path: string): Promise<ScrapedPage> {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  const fetchedAt = new Date().toISOString();
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 KlubiMigrationBot/1.0 (+contact via lahdensuomalainenklubi.com)",
      },
    });
    const html = await res.text();
    const $ = load(html);

    const headings: ScrapedPage["headings"] = [];
    $("h1, h2, h3, h4").each((_, el) => {
      const tag = (el as { tagName: string }).tagName.toLowerCase();
      const level = Number(tag.replace("h", ""));
      const text = $(el).text().trim();
      if (text) headings.push({ level, text });
    });

    const paragraphs: string[] = [];
    $("p").each((_, el) => {
      const text = $(el).text().trim();
      if (text) paragraphs.push(text);
    });

    const tables: ScrapedTable[] = [];
    $("table").each((_, tableEl) => {
      const $table = $(tableEl);
      const caption = $table.find("caption").text().trim() || undefined;
      const headers: string[] = [];
      $table.find("tr").first().find("th, td").each((_, th) => {
        headers.push($(th).text().trim());
      });
      const rows: string[][] = [];
      $table.find("tr").slice(1).each((_, tr) => {
        const row: string[] = [];
        $(tr).find("td").each((_, td) => {
          row.push($(td).text().trim());
        });
        if (row.length) rows.push(row);
      });
      tables.push({ caption, headers, rows });
    });

    const links: ScrapedPage["links"] = [];
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href")?.trim();
      const text = $(el).text().trim();
      if (href) links.push({ href, text });
    });

    const images: ScrapedPage["images"] = [];
    $("img").each((_, el) => {
      const src = $(el).attr("src")?.trim();
      const alt = $(el).attr("alt")?.trim() ?? null;
      if (src) images.push({ src, alt });
    });

    return {
      url,
      fetchedAt,
      httpStatus: res.status,
      title: $("title").text().trim() || $("h1").first().text().trim(),
      bodyText: $("body").text().replace(/\s+/g, " ").trim(),
      headings,
      paragraphs,
      tables,
      links,
      images,
      rawHtml: html,
    };
  } catch (error) {
    console.error(`Virhe ladattaessa ${url}:`, error);
    return {
      url,
      fetchedAt,
      httpStatus: 0,
      title: "",
      bodyText: "",
      headings: [],
      paragraphs: [],
      tables: [],
      links: [],
      images: [],
      rawHtml: "",
    };
  }
}

async function main() {
  console.log(`Aloitetaan scrape: ${TARGETS.length} sivua`);
  const results: ScrapedPage[] = [];
  for (const path of TARGETS) {
    process.stdout.write(`  ${path} ... `);
    const page = await scrapePage(path);
    results.push(page);
    console.log(`OK (${page.httpStatus}, ${page.paragraphs.length} kpl)`);
    await new Promise((r) => setTimeout(r, 600)); // pieni viive
  }

  const outPath = join(process.cwd(), "data", "raw-content.json");
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(results, null, 2), "utf-8");

  const summary = {
    total: results.length,
    failed: results.filter((r) => r.httpStatus !== 200).length,
    totalParagraphs: results.reduce((sum, r) => sum + r.paragraphs.length, 0),
    totalTables: results.reduce((sum, r) => sum + r.tables.length, 0),
    totalImages: results.reduce((sum, r) => sum + r.images.length, 0),
  };
  console.log("\nValmis. Yhteenveto:", summary);
  console.log(`Data tallennettu: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
