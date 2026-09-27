/**
 * Vie vanhan sivuston kuvat Sanityyn ja liittää ne ravintoladokumentteihin.
 *
 * Ajo:    `npm run import:kuvat` (osana `npm run migrate:ravintolat`, NDJSON-importin jälkeen)
 * Lähde:  data/images/                                  (`npm run images`)
 *         data/normalized/kuvat.json                    (inventaari: alt-tekstit, sivut)
 *         data/normalized/ravintola-kuvat.json          (docId → kuvat, `import-ravintolat.ts`)
 *         data/normalized/ravintola-kuvat-dropped.json  (liittämättä jätetyt perusteluineen)
 *         data/migration-ravintolat.ndjson              (putken dokumentit, siivousta varten)
 * Tulos:  Sanityn assetit + `images`-kenttä ravintoloissa
 *         data/normalized/asset-map.json  (välimuisti, ks. alla)
 *
 * Vaiheet:
 *   0. Siivous: poistaa ravintolaputken vanhentuneet dokumentit (ravintola, jonka
 *      `_id` ei enää ole NDJSON:ssa — esim. slug korjautui "ribs" → "ribs-rock" —
 *      ja kaupunki, johon mikään ei viittaa eikä mikään migraatio-NDJSON sisällä).
 *      `--replace`-import ei poista mitään, joten ilman tätä vanhat dokumentit
 *      jäisivät Studioon ja hakemistoon kaksoiskappaleina. Dokumenttia, johon
 *      viitataan (esim. käyttäjän arvostelu), ei poisteta.
 *   1. Assetit: vain ravintoloiden kuvat, asset-map.json muistaa jo viedyt.
 *   2. Liitos: `images` jokaiseen ravintolaan (`set`, idempotentti).
 *   3. Kattavuus: jokainen ravintolasivujen inventaariokuva on joko liitetty
 *      (sha1 = Sanityn asset-id) tai pudotettu perusteluineen. Hävinneitä 0,
 *      muuten ajo epäonnistuu.
 *
 * Alt-tekstit: katso `resolveAlt()`.
 */
import { createClient, type SanityClient } from "@sanity/client";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile, stat } from "node:fs/promises";
import { basename, join } from "node:path";
import zlib from "node:zlib";

import { decodeEntities } from "./lib/decode-html";
import { reviewSourceAlt } from "./lib/derive-alt";
import { localImageName } from "./lib/image-names";
import type { KuvaRecord } from "./download-images";

const ROOT = process.cwd();
const IMAGES_DIR = join(ROOT, "data", "images");
const INVENTORY = join(ROOT, "data", "normalized", "kuvat.json");
const MAPPING = join(ROOT, "data", "normalized", "ravintola-kuvat.json");
const DROPPED = join(ROOT, "data", "normalized", "ravintola-kuvat-dropped.json");
const ASSET_MAP = join(ROOT, "data", "normalized", "asset-map.json");
const NDJSON = join(ROOT, "data", "migration-ravintolat.ndjson");
const DATA_DIR = join(ROOT, "data");

/** Ravintolasivut, joiden kuvat kuuluvat tämän putken vastuulle. */
const RESTAURANT_PAGE = /^ruokailu.*\.htm$/i;

/** Sanity ei ota vastaan mielivaltaisen suuria assetteja kerralla. */
const MAX_BYTES = 20 * 1024 * 1024;

interface RestaurantImageLink {
  docId: string;
  name: string;
  city: string;
  images: string[];
  captions?: Record<string, string>;
}

type AssetMap = Record<string, string>;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} puuttuu. Lisää se .env.local-tiedostoon ennen ajoa.`);
  }
  return value;
}

/** "Ravintola Herman" ei saa etuliitettä kahdesti; "Hesburger, Paimio" ei toista kaupunkia. */
function restaurantLabel(restaurant: RestaurantImageLink): string {
  const name = restaurant.name.trim();
  const hasPrefix = /^(ravintola|restaurant|ristorante|restaurante)\b/i.test(name);
  const cityInName = restaurant.city && name.toLowerCase().includes(restaurant.city.toLowerCase());
  const place = cityInName || !restaurant.city ? name : `${name}, ${restaurant.city}`;
  return hasPrefix ? place : `Ravintola ${place}`;
}

/**
 * Alt-teksti järjestyksessä:
 *   1. alkuperäinen alt, jos se on kelvollinen (`reviewSourceAlt`: ei
 *      tiedostonimeä, ei rikkinäistä merkistöä; yhteen kirjoitetut sanat erotellaan)
 *   2. lähdesivun kuvateksti ("Ravintola Maistrali, Egina 09.07.2008")
 *   3. ravintolan nimi ja kaupunki (+ järjestysnumero, jos kuvia on useampi)
 *
 * Tiedostonimestä johtamista EI käytetä tässä: ravintolan nimi on tarkempi ja
 * luettavampi kuin `ruokailumammamaria020607.jpg`.
 */
function resolveAlt(
  original: string[],
  caption: string | undefined,
  restaurant: RestaurantImageLink,
  index: number,
  total: number,
): { alt: string; source: "lähde" | "lähde, sanat eroteltu" | "kuvateksti" | "johdettu"; rejected: string[] } {
  const rejected: string[] = [];
  for (const raw of original) {
    const verdict = reviewSourceAlt(decodeEntities(raw), [restaurant.name, restaurant.city]);
    if (verdict.ok) {
      return { alt: verdict.alt.slice(0, 200), source: verdict.changed ? "lähde, sanat eroteltu" : "lähde", rejected };
    }
    if (verdict.reason !== "tyhjä") rejected.push(`${raw} (${verdict.reason})`);
  }
  if (caption) return { alt: caption.slice(0, 200), source: "kuvateksti", rejected };

  const suffix = total > 1 ? ` (kuva ${index + 1}/${total})` : "";
  return { alt: `${restaurantLabel(restaurant)}${suffix}`.slice(0, 200), source: "johdettu", rejected };
}

/**
 * Tunnistaa kuvan todellisen tyypin tavuista.
 *
 * Vanhalla sivustolla osa tiedostoista on väärällä päätteellä: kaksi Lahden
 * ravintolakuvaa on BMP-muodossa `.jpg`-nimen takana. Sanity hylkää ne, jos
 * ilmoitettu tyyppi ei vastaa sisältöä.
 */
function sniffContentType(buffer: Buffer): string | undefined {
  if (buffer.length < 12) return undefined;
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "image/jpeg";
  if (buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") return "image/png";
  if (buffer.subarray(0, 3).toString("latin1") === "GIF") return "image/gif";
  if (buffer.subarray(0, 2).toString("latin1") === "BM") return "image/bmp";
  if (
    buffer.subarray(0, 4).toString("latin1") === "RIFF" &&
    buffer.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return "image/webp";
  }
  return undefined;
}

/**
 * Muuntaa pakkaamattoman 24/32-bittisen BMP:n häviöttömästi PNG:ksi.
 *
 * Sanity hylkää BMP:n ("Invalid image, could not process"): kaksi Lahden
 * ravintolakuvaa (Hesburger Salpausselkä, McDonald's Hollola) on BMP-muodossa
 * `.jpg`-nimen takana. Muunnos on deterministinen (sama BMP → samat PNG-tavut),
 * joten asset-id pysyy samana ajosta toiseen. Ei riippuvuuksia: node:zlib.
 */
function bmpToPng(bmp: Buffer): Buffer | null {
  if (bmp.subarray(0, 2).toString("latin1") !== "BM") return null;
  const offset = bmp.readUInt32LE(10);
  const width = bmp.readInt32LE(18);
  const rawHeight = bmp.readInt32LE(22);
  const bpp = bmp.readUInt16LE(28);
  const compression = bmp.readUInt32LE(30);
  if ((bpp !== 24 && bpp !== 32) || compression !== 0 || width <= 0) return null;
  const height = Math.abs(rawHeight);
  const bytesPerPixel = bpp / 8;
  const stride = Math.ceil((width * bytesPerPixel) / 4) * 4;

  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    const srcRow = rawHeight > 0 ? height - 1 - y : y; // BMP on yleensä alhaalta ylös
    const src = offset + srcRow * stride;
    const dst = y * (width * 3 + 1);
    raw[dst] = 0; // suodatin: ei mitään
    for (let x = 0; x < width; x++) {
      const p = src + x * bytesPerPixel;
      raw[dst + 1 + x * 3] = bmp[p + 2];
      raw[dst + 2 + x * 3] = bmp[p + 1];
      raw[dst + 3 + x * 3] = bmp[p];
    }
  }

  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeAndData = Buffer.concat([Buffer.from(type, "latin1"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(typeAndData) >>> 0);
    return Buffer.concat([len, typeAndData, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bittisyvyys
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Tiedoston tavut sellaisina kuin ne viedään Sanityyn (BMP → PNG). */
async function uploadBytes(file: string): Promise<{ buffer: Buffer; filename: string }> {
  const original = await readFile(join(IMAGES_DIR, file));
  const png = sniffContentType(original) === "image/bmp" ? bmpToPng(original) : null;
  return png
    ? { buffer: png, filename: basename(file).replace(/\.[a-z0-9]+$/i, ".png") }
    : { buffer: original, filename: basename(file) };
}

async function loadAssetMap(): Promise<AssetMap> {
  try {
    return JSON.parse(await readFile(ASSET_MAP, "utf-8")) as AssetMap;
  } catch {
    return {};
  }
}

async function ndjsonIds(file: string): Promise<Set<string>> {
  const text = await readFile(file, "utf-8");
  return new Set(
    text
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => (JSON.parse(line) as { _id: string })._id),
  );
}

/** Vaihe 0: vanhentuneiden ravintola- ja kaupunkidokumenttien siivous. */
async function removeStale(client: SanityClient): Promise<void> {
  const own = await ndjsonIds(NDJSON);
  // Kaupunkeja luovat myös muut putket (stadionit): niiden NDJSON:t luetaan
  // vain, jotta niiden kaupunkeja ei poisteta.
  const { readdir } = await import("node:fs/promises");
  const allMigration = new Set(own);
  for (const file of (await readdir(DATA_DIR)).filter((f) => /^migration-.+\.ndjson$/.test(f))) {
    for (const id of await ndjsonIds(join(DATA_DIR, file))) allMigration.add(id);
  }

  const candidates = await client.fetch<{ _id: string; _type: string; refs: number }[]>(
    `*[(_type == "ravintola" || _type == "kaupunki") && !(_id in path("drafts.**"))]{
      _id, _type, "refs": count(*[references(^._id)])
    }`,
  );
  const stale = candidates.filter((d) =>
    d._type === "ravintola" ? !own.has(d._id) : !allMigration.has(d._id) && d.refs === 0,
  );
  const referenced = stale.filter((d) => d._type === "ravintola" && d.refs > 0);
  const removable = stale.filter((d) => !(d._type === "ravintola" && d.refs > 0));

  // Ravintolat ensin, jotta niihin viitanneet kaupungit vapautuvat.
  const ordered = [...removable].sort((a, b) => (a._type === b._type ? a._id.localeCompare(b._id) : a._type === "ravintola" ? -1 : 1));
  if (ordered.length > 0) {
    let tx = client.transaction();
    for (const d of ordered) tx = tx.delete(d._id);
    await tx.commit();
  }
  // Toinen kierros: kaupungit, jotka vapautuivat poistettujen ravintoloiden myötä.
  const freed = await client.fetch<string[]>(
    `*[_type == "kaupunki" && !(_id in $keep) && count(*[references(^._id)]) == 0]._id`,
    { keep: [...allMigration] },
  );
  if (freed.length > 0) {
    let tx = client.transaction();
    for (const id of freed) tx = tx.delete(id);
    await tx.commit();
  }

  console.log(`Siivous: poistettu ${ordered.length + freed.length} vanhentunutta dokumenttia`);
  for (const d of ordered) console.log(`  - ${d._id}`);
  for (const id of freed) console.log(`  - ${id}`);
  if (referenced.length > 0) {
    console.log(`  Säilytetty ${referenced.length} vanhentunutta ravintolaa, koska niihin viitataan:`);
    for (const d of referenced) console.log(`    ${d._id} (${d.refs} viittausta) — siirrä viittaukset käsin`);
  }
}

async function main() {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const projectId = requireEnv("NEXT_PUBLIC_SANITY_PROJECT_ID");
  // Migraatio kirjoittaa vain development-datasetiin (docs/12 §0).
  const dataset = "development";
  const token = requireEnv("SANITY_API_WRITE_TOKEN");

  const client = createClient({
    projectId,
    dataset,
    token,
    apiVersion: "2024-10-01",
    useCdn: false,
  });

  const [inventory, links, dropped, assetMap] = await Promise.all([
    readFile(INVENTORY, "utf-8").then((t) => JSON.parse(t) as KuvaRecord[]),
    readFile(MAPPING, "utf-8").then((t) => JSON.parse(t) as RestaurantImageLink[]),
    readFile(DROPPED, "utf-8").then((t) => JSON.parse(t) as { file: string; syy: string }[]),
    loadAssetMap(),
  ]);

  // ── 0. Siivous ──────────────────────────────────────────────────────────
  await removeStale(client);

  const byFile = new Map(inventory.map((k) => [k.file, k]));

  // Kaikki ravintoloiden viittaamat kuvat, deduplikoituna.
  const needed = new Set<string>();
  for (const link of links) {
    for (const src of link.images) needed.add(localImageName(src));
  }

  const usable = [...needed].filter((file) => {
    const record = byFile.get(file);
    return Boolean(record?.ok) && (record?.bytes ?? 0) <= MAX_BYTES;
  });
  const unusable = [...needed].filter((f) => !usable.includes(f));

  console.log(`\nRavintoloita joilla kuvia .. ${links.length}`);
  console.log(`Uniikkeja kuvia ............ ${needed.size}`);
  console.log(`  vietävissä ............... ${usable.length}`);
  console.log(`  ei saatavilla / liian iso  ${unusable.length}`);
  console.log(`  jo viety aiemmin ......... ${usable.filter((f) => assetMap[f]).length}`);
  console.log("");

  // ── 1. Assetit ──────────────────────────────────────────────────────────
  let uploaded = 0;
  let failed = 0;

  for (const file of usable) {
    if (assetMap[file]) continue;

    const path = join(IMAGES_DIR, file);
    try {
      await stat(path);
      const { buffer, filename } = await uploadBytes(file);
      // Tavuista tunnistettu tyyppi voittaa vanhan palvelimen otsakkeen:
      // osa tiedostoista on väärällä päätteellä.
      const contentType =
        sniffContentType(buffer) ?? byFile.get(file)?.contentType ?? undefined;
      const asset = await client.assets.upload("image", buffer, {
        filename,
        contentType,
      });
      assetMap[file] = asset._id;
      uploaded += 1;

      if (uploaded % 25 === 0) {
        console.log(`  viety ${uploaded} / ${usable.length}`);
        await writeFile(ASSET_MAP, JSON.stringify(assetMap, null, 2), "utf-8");
      }
    } catch (error) {
      failed += 1;
      console.error(`  virhe ${file}: ${error instanceof Error ? error.message : error}`);
    }
  }

  await writeFile(ASSET_MAP, JSON.stringify(assetMap, null, 2), "utf-8");
  console.log(`Assetteja viety ${uploaded}, virheitä ${failed}.\n`);

  // ── 2. Liitos dokumentteihin ────────────────────────────────────────────
  let patched = 0;
  let skipped = 0;
  let duplicates = 0;
  const altSources: Record<string, number> = {};
  const rejectedAlts: string[] = [];
  let transaction = client.transaction();
  let pending = 0;

  for (const link of links) {
    // Sama kuva voi olla sivustolla kahdella nimellä (RuokailuTampereC… ja
    // ruokailuCTampere…): Sanity antaa niille saman assetin, joka liitetään kerran.
    const seenAssets = new Set<string>();
    const entries = link.images
      .map((src) => ({ src, file: localImageName(src) }))
      .filter(({ file }) => {
        const asset = assetMap[file];
        if (!asset) return false;
        if (seenAssets.has(asset)) {
          duplicates += 1;
          return false;
        }
        seenAssets.add(asset);
        return true;
      });

    if (entries.length === 0) {
      skipped += 1;
      continue;
    }

    const images = entries.map(({ src, file }, index) => {
      const resolved = resolveAlt(
        byFile.get(file)?.altTexts ?? [],
        link.captions?.[src],
        link,
        index,
        entries.length,
      );
      altSources[resolved.source] = (altSources[resolved.source] ?? 0) + 1;
      for (const r of resolved.rejected) rejectedAlts.push(`${link.docId}: ${r} → "${resolved.alt}"`);
      return {
        _type: "imageWithAlt" as const,
        _key: `img-${file.replace(/[^a-zA-Z0-9]/g, "").slice(-24)}-${index}`,
        asset: { _type: "reference" as const, _ref: assetMap[file] },
        alt: resolved.alt,
      };
    });

    transaction = transaction.patch(link.docId, (p) => p.set({ images }));
    patched += 1;
    pending += 1;

    // Sanityn mutaatiorajat: committoidaan erissä.
    if (pending >= 50) {
      await transaction.commit();
      transaction = client.transaction();
      pending = 0;
      console.log(`  liitetty ${patched} / ${links.length}`);
    }
  }

  if (pending > 0) await transaction.commit();

  console.log(`
Ravintoloita päivitetty .... ${patched}
Ilman kuvia jääneitä ....... ${skipped}
Saman assetin toistoja ..... ${duplicates} (liitetty kerran)
Alt-tekstin lähde .......... ${Object.entries(altSources).map(([k, v]) => `${k} ${v}`).join(", ")}
Hylättyjä lähde-altteja .... ${rejectedAlts.length}
${rejectedAlts.map((r) => `  ${r}`).join("\n")}

Assettikartta: ${ASSET_MAP}`);

  if (unusable.length > 0) {
    console.log(`\nEi viety (${unusable.length}):`);
    for (const file of unusable.slice(0, 15)) {
      const record = byFile.get(file);
      const reason = !record
        ? "ei inventaarissa"
        : !record.ok
          ? `lataus epäonnistui (${record.status})`
          : `liian suuri (${(record.bytes / 1024 / 1024).toFixed(1)} MB)`;
      console.log(`  ${file} — ${reason}`);
    }
  }

  // ── 3. Kattavuus: liitetty (sha1) tai pudotettu ────────────────────────
  const referencedAssets = new Set(
    await client.fetch<string[]>(
      `*[_type == "sanity.imageAsset" && count(*[references(^._id)]) > 0]._id`,
    ),
  );
  // Asset-id on muotoa image-<sha1>-<leveys>x<korkeus>-<pääte>.
  const referencedSha1 = new Set([...referencedAssets].map((id) => id.split("-")[1]));
  const droppedFiles = new Set(dropped.map((d) => d.file));
  let attached = 0;
  const lost: string[] = [];
  for (const record of inventory) {
    if (!record.pages.some((p) => RESTAURANT_PAGE.test(p))) continue;
    if (droppedFiles.has(record.file)) continue;
    if (!record.ok) {
      lost.push(`${record.file} (lataus epäonnistui, ei pudotettujen listalla)`);
      continue;
    }
    const sha1 = createHash("sha1").update((await uploadBytes(record.file)).buffer).digest("hex");
    if (referencedSha1.has(sha1)) attached += 1;
    else lost.push(`${record.file} (${record.pages.join(", ")})`);
  }
  console.log(`
Kattavuus (ravintolasivujen kuvat, sha1):
  liitetty ................. ${attached}
  pudotettu perusteluineen . ${droppedFiles.size}
  hävinnyt ................. ${lost.length}`);
  if (lost.length > 0) {
    for (const l of lost) console.log(`    ${l}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
