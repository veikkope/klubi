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
 *
 * Lisäksi kotinäytön sovelluskuvakkeet (app/manifest.ts) → public/sovellus/:
 * yönsininen merkki valkoisella pohjalla (kuten iPhonen app/apple-icon.png), 192 ja 512 px sekä "maskable"-versio,
 * jonka merkki mahtuu Androidin pyöreään tai pyöristettyyn rajaukseen
 * (turva-alue 80 % keskeltä).
 */
import { mkdir, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";

const LAHDE = "public/brand";
const KOHDE = "public/brand/web";
const KORKEUS: Record<string, number> = { mark: 168, wordmark: 75 };

const SOVELLUS = "public/sovellus";
const POHJA = "#ffffff";

/** Neliön muotoinen kuvake: merkki keskellä, korkeus `osuus` × koko. */
async function kuvake(koko: number, osuus: number, kohde: string) {
  const merkki = await sharp(join(LAHDE, "mark-navy.png"))
    .resize({ height: Math.round(koko * osuus) })
    .toBuffer();
  await sharp({ create: { width: koko, height: koko, channels: 4, background: POHJA } })
    .composite([{ input: merkki, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(join(SOVELLUS, kohde));
  console.log(`${kohde}: ${koko}×${koko}`);
}

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

  await mkdir(SOVELLUS, { recursive: true });
  await kuvake(192, 0.62, "kuvake-192.png");
  await kuvake(512, 0.62, "kuvake-512.png");
  await kuvake(512, 0.5, "kuvake-maskable-512.png");
}

void main();
