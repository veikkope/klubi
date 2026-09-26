/**
 * Vie vanhan sivuston kuvat Sanityyn ja liittää ne ravintoladokumentteihin.
 *
 * Ajo:    `npm run import:kuvat`
 * Lähde:  data/images/                        (`npm run images`)
 *         data/normalized/kuvat.json          (inventaari: alt-tekstit, sivut)
 *         data/normalized/ravintola-kuvat.json (docId → kuvat, `npm run import:ravintolat`)
 * Tulos:  Sanityn assetit + `images`-kenttä ravintoloissa
 *         data/normalized/asset-map.json  (välimuisti, ks. alla)
 *
 * Rajaus: viedään vain ne kuvat, joille on jo olemassa dokumentti johon ne
 * liitetään — eli ravintolakuvat. Arkistosivujen kuvat odottavat omia
 * dokumenttejaan; niiden vienti nyt tuottaisi orpoja assetteja.
 *
 * Ajettavissa uudelleen: `asset-map.json` muistaa jo viedyt kuvat, joten
 * keskeytynyt ajo jatkuu siitä mihin jäi eikä lataa mitään kahdesti.
 *
 * Alt-tekstit: katso `resolveAlt()`. Alkuperäinen alt voittaa; muuten
 * johdetaan ravintolan nimestä ja kaupungista. Kumpikaan ei ole keksitty.
 */
import { createClient } from "@sanity/client";
import { readFile, writeFile, stat } from "node:fs/promises";
import { basename, join } from "node:path";

import { localImageName } from "./lib/image-names";
import type { KuvaRecord } from "./download-images";

const IMAGES_DIR = join(process.cwd(), "data", "images");
const INVENTORY = join(process.cwd(), "data", "normalized", "kuvat.json");
const MAPPING = join(process.cwd(), "data", "normalized", "ravintola-kuvat.json");
const ASSET_MAP = join(process.cwd(), "data", "normalized", "asset-map.json");

/** Sanity ei ota vastaan mielivaltaisen suuria assetteja kerralla. */
const MAX_BYTES = 20 * 1024 * 1024;

interface RestaurantImageLink {
  docId: string;
  name: string;
  city: string;
  images: string[];
}

type AssetMap = Record<string, string>;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} puuttuu. Lisää se .env.local-tiedostoon ennen ajoa.`,
    );
  }
  return value;
}

/**
 * Alt-teksti järjestyksessä: alkuperäinen → ravintolan nimi ja kaupunki.
 *
 * Tiedostonimestä johtamista EI käytetä tässä: ravintolan nimi on tarkempi ja
 * luettavampi kuin `ruokailumammamaria020607.jpg`. Tiedostonimijohdin on
 * arkistokuvia varten, joilla ei ole vastaavaa kontekstia.
 */
function resolveAlt(
  original: string[],
  restaurant: RestaurantImageLink,
  index: number,
  total: number,
): string {
  const fromSource = original.find((a) => a.trim().length >= 3)?.trim();
  if (fromSource) return fromSource.slice(0, 200);

  const place = [restaurant.name, restaurant.city].filter(Boolean).join(", ");
  const suffix = total > 1 ? ` (kuva ${index + 1}/${total})` : "";
  return `Ravintola ${place}${suffix}`.slice(0, 200);
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

async function loadAssetMap(): Promise<AssetMap> {
  try {
    return JSON.parse(await readFile(ASSET_MAP, "utf-8")) as AssetMap;
  } catch {
    return {};
  }
}

async function main() {
  const projectId = requireEnv("NEXT_PUBLIC_SANITY_PROJECT_ID");
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "development";
  const token =
    process.env.SANITY_API_WRITE_TOKEN || requireEnv("SANITY_API_READ_TOKEN");

  const client = createClient({
    projectId,
    dataset,
    token,
    apiVersion: "2024-10-01",
    useCdn: false,
  });

  const [inventory, links, assetMap] = await Promise.all([
    readFile(INVENTORY, "utf-8").then((t) => JSON.parse(t) as KuvaRecord[]),
    readFile(MAPPING, "utf-8").then((t) => JSON.parse(t) as RestaurantImageLink[]),
    loadAssetMap(),
  ]);

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

  console.log(`Ravintoloita joilla kuvia .. ${links.length}`);
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
      const buffer = await readFile(path);
      // Tavuista tunnistettu tyyppi voittaa vanhan palvelimen otsakkeen:
      // osa tiedostoista on väärällä päätteellä.
      const contentType =
        sniffContentType(buffer) ?? byFile.get(file)?.contentType ?? undefined;
      const asset = await client.assets.upload("image", buffer, {
        filename: basename(file),
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
      console.error(
        `  virhe ${file}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  await writeFile(ASSET_MAP, JSON.stringify(assetMap, null, 2), "utf-8");
  console.log(`\nAssetteja viety ${uploaded}, virheitä ${failed}.\n`);

  // ── 2. Liitos dokumentteihin ────────────────────────────────────────────
  let patched = 0;
  let skipped = 0;
  let transaction = client.transaction();
  let pending = 0;

  for (const link of links) {
    const files = link.images
      .map(localImageName)
      .filter((file) => assetMap[file]);

    if (files.length === 0) {
      skipped += 1;
      continue;
    }

    const images = files.map((file, index) => ({
      _type: "imageWithAlt" as const,
      _key: `img-${file.replace(/[^a-zA-Z0-9]/g, "").slice(-24)}-${index}`,
      asset: { _type: "reference" as const, _ref: assetMap[file] },
      alt: resolveAlt(byFile.get(file)?.altTexts ?? [], link, index, files.length),
    }));

    transaction = transaction.patch(link.docId, (p) => p.set({ images }));
    patched += 1;
    pending += 1;

    // Sanityn mutaatiorajat: committoidaan erissä.
    if (pending >= 50) {
      await transaction.commit({ visibility: "async" });
      transaction = client.transaction();
      pending = 0;
      console.log(`  liitetty ${patched} / ${links.length}`);
    }
  }

  if (pending > 0) await transaction.commit({ visibility: "async" });

  const derived = links.reduce((sum, link) => {
    const files = link.images.map(localImageName).filter((f) => assetMap[f]);
    return (
      sum +
      files.filter((f) => (byFile.get(f)?.altTexts.length ?? 0) === 0).length
    );
  }, 0);

  console.log(`
Ravintoloita päivitetty .... ${patched}
Ilman kuvia jääneitä ....... ${skipped}
Johdettuja alt-tekstejä .... ${derived}

Arkistokuvia odottamassa ... ${inventory.filter((k) => k.ok).length - usable.length}
  (viedään kun niiden dokumentit on migroitu)

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
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
