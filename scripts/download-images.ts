/**
 * Lataa vanhan sivuston kuvat paikallisesti ja inventoi ne.
 *
 * Ajo: `npm run images`
 * Lähde: data/raw-html/*.htm
 * Tulos: data/images/<tiedosto>  +  data/normalized/kuvat.json
 *
 * Miksi paikallisesti ennen Sanityyn vientiä:
 *  - Vanha palvelin on vuodelta ~2003; sitä ei kannata rasittaa useaan kertaan
 *    migraatiota iteroitaessa
 *  - Kuvien vienti on CMS-kohtainen vaihe; inventaario ei ole
 *  - Kuolleet kuvalinkit on tiedettävä ennen kuin niihin viitataan sisällössä
 *
 * Skripti on jatkettavissa: jo ladattuja tiedostoja ei haeta uudelleen.
 */
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { decodeHtml } from "./lib/decode-html";

const BASE = "https://www.lahdensuomalainenklubi.com";
const RAW_DIR = join(process.cwd(), "data", "raw-html");
const OUT_DIR = join(process.cwd(), "data", "images");
const INVENTORY = join(process.cwd(), "data", "normalized", "kuvat.json");

const DELAY = 100;
const IMG_TAG = /<img\b[^>]*>/gi;
/**
 * Attribuutin arvo lainausmerkkityypin mukaan. Aiempi `["']([^"']+)["']`
 * katkesi ensimmäiseen heittomerkkiin: alt="McDonald's Kluuvi" → "McDonald".
 * Arvo voi olla myös ilman lainausmerkkejä (FrontPage: alt=Kuva).
 */
const ATTR = (name: string) =>
  new RegExp(`(?:^|[\\s<])${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i");

function attr(tag: string, name: string): string | undefined {
  const m = ATTR(name).exec(tag);
  return m ? (m[1] ?? m[2] ?? m[3]) : undefined;
}

export interface KuvaRecord {
  /** Alkuperäinen src sellaisenaan. */
  src: string;
  /** Absoluuttinen lähde-URL. */
  url: string;
  /** Paikallinen tiedostonimi `data/images/`-kansiossa. */
  file: string;
  bytes: number;
  contentType: string | null;
  status: number;
  /** Sivut joilla kuva esiintyy (vanhat .htm-nimet). */
  pages: string[];
  /** Kaikki alt-tekstit joita kuvalle on annettu. Useimmiten tyhjä. */
  altTexts: string[];
  ok: boolean;
}

/**
 * Vanhat sivut ovat osin windows-1252, osin UTF-8 väärällä `<meta charset>`:lla.
 * Yhteinen dekooderi (scripts/lib/decode-html.ts): tiukka UTF-8, muuten
 * windows-1252. Aiempi meta-charsetiin luottava versio tuotti alt-tekstiin
 * mojibakea ("McDonald究 Tammisto").
 */
function decode(buf: Buffer): string {
  return decodeHtml(buf).normalize("NFC");
}

/** Turvallinen tiedostonimi: alihakemistot litistetään, kysely pois. */
function localName(src: string): string {
  return src
    .replace(/^\.?\//, "")
    .split("?")[0]
    .split("#")[0]
    .replace(/[/\\]/g, "_");
}

function absoluteUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  return `${BASE}/${src.replace(/^\.?\//, "")}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function alreadyDownloaded(file: string): Promise<number | null> {
  try {
    const info = await stat(join(OUT_DIR, file));
    return info.size > 0 ? info.size : null;
  } catch {
    return null;
  }
}

async function collectReferences(): Promise<Map<string, KuvaRecord>> {
  const files = (await readdir(RAW_DIR)).filter((f) => /\.html?$/i.test(f));
  const byKey = new Map<string, KuvaRecord>();

  for (const page of files) {
    const html = decode(await readFile(join(RAW_DIR, page)));
    for (const tag of html.match(IMG_TAG) ?? []) {
      const src = attr(tag, "src")?.trim();
      if (!src) continue;
      // Ohitetaan inline-data ja ulkoiset isännät: ne eivät ole klubin kuvia.
      if (/^data:/i.test(src)) continue;
      if (/^https?:\/\//i.test(src) && !src.startsWith(BASE)) continue;

      const file = localName(src);
      if (!file) continue;

      const existing = byKey.get(file);
      const alt = attr(tag, "alt")?.trim();

      if (existing) {
        if (!existing.pages.includes(page)) existing.pages.push(page);
        if (alt && !existing.altTexts.includes(alt)) existing.altTexts.push(alt);
      } else {
        byKey.set(file, {
          src,
          url: absoluteUrl(src),
          file,
          bytes: 0,
          contentType: null,
          status: 0,
          pages: [page],
          altTexts: alt ? [alt] : [],
          ok: false,
        });
      }
    }
  }

  return byKey;
}

async function download(record: KuvaRecord): Promise<void> {
  const cached = await alreadyDownloaded(record.file);
  if (cached !== null) {
    record.bytes = cached;
    record.status = 200;
    record.ok = true;
    return;
  }

  try {
    const res = await fetch(record.url, {
      headers: { "User-Agent": "KlubiMigrationBot/1.0" },
      signal: AbortSignal.timeout(30_000),
    });
    record.status = res.status;
    record.contentType = res.headers.get("content-type");

    if (!res.ok) return;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length === 0) return;

    await writeFile(join(OUT_DIR, record.file), buffer);
    record.bytes = buffer.length;
    record.ok = true;
  } catch (error) {
    record.status = 0;
    console.error(
      `  virhe ${record.src}: ${error instanceof Error ? error.message : error}`,
    );
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const byKey = await collectReferences();
  const records = [...byKey.values()].sort((a, b) => a.file.localeCompare(b.file));
  console.log(`Viittauksia ${records.length} uniikkiin kuvaan. Ladataan...\n`);

  let done = 0;
  for (const record of records) {
    await download(record);
    done += 1;
    if (done % 50 === 0 || done === records.length) {
      console.log(`  ${done} / ${records.length}`);
    }
    if (record.status !== 200) await sleep(DELAY);
  }

  await mkdir(dirname(INVENTORY), { recursive: true });
  await writeFile(INVENTORY, JSON.stringify(records, null, 2), "utf-8");

  const ok = records.filter((r) => r.ok);
  const failed = records.filter((r) => !r.ok);
  const totalBytes = ok.reduce((sum, r) => sum + r.bytes, 0);
  const withAlt = ok.filter((r) => r.altTexts.length > 0);

  console.log(`
Uniikkeja kuvia ......... ${records.length}
Ladattu ................. ${ok.length}
Epäonnistui ............. ${failed.length}
Yhteensä ................ ${(totalBytes / 1024 / 1024).toFixed(1)} MB
Suurin ..................  ${(Math.max(...ok.map((r) => r.bytes)) / 1024 / 1024).toFixed(1)} MB
Alt-teksti alkuperäisessä ${withAlt.length}

Kuvat:      ${OUT_DIR}
Inventaari: ${INVENTORY}`);

  if (failed.length > 0) {
    console.log(`\nEi saatavilla (${failed.length}) — näihin ei saa viitata sisällössä:`);
    for (const record of failed.slice(0, 30)) {
      console.log(`  ${record.status || "virhe"}  ${record.src}  (${record.pages[0]})`);
    }
    if (failed.length > 30) console.log(`  … ja ${failed.length - 30} muuta`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
