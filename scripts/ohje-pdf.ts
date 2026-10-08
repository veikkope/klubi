/**
 * Ylläpito-ohjeen PDF:t (docs/25): public/studio-ohje/ohje.html ja pikaopas.html
 * → yllapito-ohje.pdf ja pikaopas.pdf (Playwright, Chromium page.pdf).
 *
 * Ajo: npm run ohje && npm run ohje:pdf
 *   PAKOTA=1 npm run ohje:pdf   kirjoittaa PDF:t, vaikka sisältö ei muuttunut
 *
 * PDF kirjoitetaan uudelleen vain, jos tulosteen sisältö muuttui (tiiviste
 * tiedostossa public/studio-ohje/pdf-versiot.json): PDF:ssä on luontiaika,
 * joten muuten jokainen ajo näkyisi gitissä muutoksena.
 * Pikaoppaan on mahduttava yhdelle A4-sivulle; muuten VAROITUS.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { chromium } from "playwright";
import sharp from "sharp";

import { KUVAKANSIO, PDF_TIEDOSTOT, tulosteenTiiviste } from "../lib/ohje/koosta";

const JUURI = process.cwd();
const VERSIOT = join(JUURI, KUVAKANSIO, "pdf-versiot.json");
const PAKOTA = Boolean(process.env.PAKOTA);
const PDF_KUVAN_LEVEYS = 1200;

type Versiot = Record<string, { tiiviste: string; sivuja: number }>;

function lueVersiot(): Versiot {
  try {
    return JSON.parse(readFileSync(VERSIOT, "utf8")) as Versiot;
  } catch {
    return {};
  }
}

/** Sivumäärä PDF:n sivupuusta (/Type /Pages … /Count n); riittää Chromiumin tuottamalle PDF:lle. */
function sivuja(pdf: Buffer): number {
  const teksti = pdf.toString("latin1");
  const maarat = [...teksti.matchAll(/\/Type\s*\/Pages\b[^>]*?\/Count\s+(\d+)/g)].map((m) => Number(m[1]));
  if (maarat.length) return Math.max(...maarat);
  return (teksti.match(/\/Type\s*\/Page\b(?!s)/g) ?? []).length;
}

async function main() {
  const versiot = lueVersiot();
  const tehtavat = Object.entries(PDF_TIEDOSTOT).filter(([nimi, { html, pdf }]) => {
    const polku = join(JUURI, html);
    if (!existsSync(polku)) {
      console.error(`${html} puuttuu: aja ensin npm run ohje`);
      process.exit(1);
    }
    const tiiviste = tulosteenTiiviste(readFileSync(polku, "utf8"));
    const ennallaan = !PAKOTA && versiot[nimi]?.tiiviste === tiiviste && existsSync(join(JUURI, pdf));
    if (ennallaan) console.log(`ennallaan   ${pdf} (${versiot[nimi].sivuja} sivua)`);
    return !ennallaan;
  });

  let varoituksia = 0;
  if (tehtavat.length) {
    const selain = await chromium.launch();
    try {
      const sivu = await selain.newPage();
      for (const [nimi, { html, pdf }] of tehtavat) {
        const polku = join(JUURI, html);
        await sivu.goto(pathToFileURL(polku).href, { waitUntil: "load" });
        // Kuvat ladattu (loading="lazy" ei lataa näkymän ulkopuolisia ilman tätä).
        await sivu.evaluate(async () => {
          const kuvat = Array.from(document.images);
          kuvat.forEach((img) => (img.loading = "eager"));
          await Promise.all(
            kuvat.map((img) =>
              img.complete
                ? null
                : new Promise<void>((valmis) => {
                    img.addEventListener("load", () => valmis(), { once: true });
                    img.addEventListener("error", () => valmis(), { once: true });
                  }),
            ),
          );
        });
        // Kuvat pienennetään tulosteeseen: Chromium upottaa webp:t täydellä 2× tarkkuudella
        // (48 Mt 8.10.2026). Palsta on n. 170 mm, joten 1200 px riittää tulosteelle.
        const lahteet = await sivu.evaluate(() => [...new Set(Array.from(document.images).map((i) => i.src))]);
        const pienet: Record<string, string> = {};
        for (const src of lahteet) {
          if (!src.startsWith("file:") || !existsSync(fileURLToPath(src))) continue;
          const jpeg = await sharp(fileURLToPath(src))
            .resize({ width: PDF_KUVAN_LEVEYS, withoutEnlargement: true })
            .flatten({ background: "#ffffff" })
            .jpeg({ quality: 78, mozjpeg: true })
            .toBuffer();
          pienet[src] = `data:image/jpeg;base64,${jpeg.toString("base64")}`;
        }
        await sivu.evaluate(async (korvaavat) => {
          const kuvat = Array.from(document.images).filter((img) => korvaavat[img.src]);
          await Promise.all(
            kuvat.map(
              (img) =>
                new Promise<void>((valmis) => {
                  img.addEventListener("load", () => valmis(), { once: true });
                  img.addEventListener("error", () => valmis(), { once: true });
                  img.src = korvaavat[img.src];
                }),
            ),
          );
        }, pienet);
        await sivu.emulateMedia({ media: "print" });
        const otsikko = await sivu.title();
        const sisalto = await sivu.pdf({
          format: "A4",
          printBackground: true,
          outline: true,
          tagged: true,
          // Pikaopas on yksi sivu ilman ylä- ja alatunnistetta, jotta se mahtuu A4:lle.
          displayHeaderFooter: nimi !== "pikaopas",
          headerTemplate: `<div style="font-size:8pt;width:100%;padding:0 16mm;color:#555;font-family:Arial,sans-serif;">${otsikko.replace(/</g, "&lt;")}</div>`,
          footerTemplate:
            '<div style="font-size:8pt;width:100%;padding:0 16mm;color:#555;font-family:Arial,sans-serif;text-align:right;">Sivu <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
          margin:
            nimi === "pikaopas"
              ? { top: "12mm", bottom: "12mm", left: "14mm", right: "14mm" }
              : { top: "16mm", bottom: "18mm", left: "16mm", right: "16mm" },
        });
        writeFileSync(join(JUURI, pdf), sisalto);
        const n = sivuja(sisalto);
        versiot[nimi] = { tiiviste: tulosteenTiiviste(readFileSync(polku, "utf8")), sivuja: n };
        console.log(`kirjoitettu ${pdf} (${n} sivua, ${Math.round(sisalto.length / 1024)} kt)`);
      }
    } finally {
      await selain.close();
    }
    writeFileSync(VERSIOT, `${JSON.stringify(versiot, null, 2)}\n`, "utf8");
  }
  const pika = versiot.pikaopas?.sivuja;
  if (pika !== undefined && pika !== 1) {
    varoituksia += 1;
    console.warn(
      `VAROITUS: pikaopas on ${pika} sivua, pitää mahtua yhdelle A4-sivulle. Lyhennä docs/ohje/pikaopas.md.`,
    );
  }
  if (!varoituksia) console.log("PDF:t ajan tasalla.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
