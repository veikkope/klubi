/**
 * Tarkistaa, kuuluvatko ravintoloille liitetyt kuvat todella niille.
 *
 * Parseri liittää kuvan siihen ravintolaan, joka oli "käsittelyssä" kun kuva
 * kohdattiin. Sivuilla joilla kuva on samalla rivillä ravintolan kanssa tämä
 * on oikein. Sivuilla joilla kuvat on koottu listan loppuun kaikki päätyvät
 * viimeiselle ravintolalle.
 *
 * Tiedostonimet ovat kuvaavia, joten oikea omistaja on useimmiten
 * pääteltävissä nimestä. Tämä skripti mittaa, kuinka usein liitos ja
 * tiedostonimi ovat eri mieltä.
 *
 * Ajo: `npx tsx scripts/check-image-links.ts`
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const MAPPING = join(process.cwd(), "data", "normalized", "ravintola-kuvat.json");

interface Link {
  docId: string;
  name: string;
  city: string;
  images: string[];
}

/** Pelkistää vertailua varten: pienet kirjaimet, ei ääkkösiä, ei välimerkkejä. */
function fold(input: string): string {
  return input
    .toLowerCase()
    .replace(/[äå]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]/g, "");
}

/** Osuuko ravintolan nimi tiedostonimeen? */
function nameInFile(name: string, file: string): boolean {
  const folded = fold(name);
  const haystack = fold(file);
  if (folded.length < 4) return false;
  if (haystack.includes(folded)) return true;

  // Pitkillä nimillä riittää, että merkittävä osa sanoista osuu.
  const words = name
    .split(/\s+/)
    .map(fold)
    .filter((w) => w.length >= 4);
  if (words.length === 0) return false;
  const hits = words.filter((w) => haystack.includes(w)).length;
  return hits / words.length >= 0.5;
}

async function main() {
  const links = JSON.parse(await readFile(MAPPING, "utf-8")) as Link[];

  let total = 0;
  let matching = 0;
  const suspicious: { name: string; city: string; images: string[] }[] = [];

  for (const link of links) {
    const good = link.images.filter((f) => nameInFile(link.name, f));
    total += link.images.length;
    matching += good.length;

    if (good.length < link.images.length) {
      suspicious.push({
        name: link.name,
        city: link.city,
        images: link.images.filter((f) => !nameInFile(link.name, f)),
      });
    }
  }

  const byCount = new Map<number, number>();
  for (const link of links) {
    byCount.set(link.images.length, (byCount.get(link.images.length) ?? 0) + 1);
  }

  console.log(`
Ravintoloita joilla kuvia ... ${links.length}
Kuvaliitoksia yhteensä ...... ${total}
  nimi osuu tiedostonimeen .. ${matching} (${Math.round((matching / total) * 100)} %)
  ei osu ..................... ${total - matching}
Ravintoloita joilla epäilyttäviä liitoksia: ${suspicious.length}

Kuvien määrä per ravintola:`);
  for (const [count, n] of [...byCount.entries()].sort((a, b) => a[0] - b[0])) {
    console.log(`  ${count} kuvaa: ${n} ravintolaa`);
  }

  console.log("\nPahimmat tapaukset:");
  for (const s of suspicious.sort((a, b) => b.images.length - a.images.length).slice(0, 10)) {
    console.log(`  ${s.name} (${s.city}) — ${s.images.length} vierasta:`);
    for (const f of s.images.slice(0, 4)) console.log(`      ${f}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
