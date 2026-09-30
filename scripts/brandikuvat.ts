/**
 * Brändikuvien verkkoversiot: public/brand/*.png → public/brand/web/*.png.
 *
 * Ajo: npm run brandikuvat (vain kun alkuperäiset logot muuttuvat)
 *
 * Kuvat eivät kulje Vercelin kuvanoptimoinnin kautta (next/image käyttää
 * Sanityn CDN:ää, lib/sanity-image-loader.ts), joten ne pienennetään kerran
 * valmiiksi: korkeus 3 × suurin näyttökoko (merkki 56 px, tekstilogo 25 px),
 * jotta ne ovat teräviä myös tarkoilla näytöillä. Alkuperäiset säilyvät
 * lähdetiedostoina ja OG-kuvan pohjana (app/api/og).
 */
import { mkdir, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";

const LAHDE = "public/brand";
const KOHDE = "public/brand/web";
const KORKEUS: Record<string, number> = { mark: 168, wordmark: 75 };

async function main() {
  await mkdir(KOHDE, { recursive: true });
  const tiedostot = (await readdir(LAHDE)).filter((f) => f.endsWith(".png"));
  for (const tiedosto of tiedostot) {
    const tyyppi = tiedosto.split("-")[0];
    const korkeus = KORKEUS[tyyppi];
    if (!korkeus) continue;
    const kohde = join(KOHDE, tiedosto);
    const tieto = await sharp(join(LAHDE, tiedosto))
      .resize({ height: korkeus })
      .png({ compressionLevel: 9, palette: true, quality: 90 })
      .toFile(kohde);
    const ennen = (await stat(join(LAHDE, tiedosto))).size;
    console.log(`${tiedosto}: ${tieto.width}×${tieto.height}, ${Math.round(ennen / 1024)} kt → ${Math.round(tieto.size / 1024)} kt`);
  }
}

void main();
