/**
 * Liittää vanhojen ravintolakohtaisten sivujen (Kuu.htm, Loiste.htm, Salud.htm)
 * arviot ja kuvat ravintolamigraation dokumentteihin (docs/12 §3 M6 → integraatio).
 *
 * Ajo:   npx tsx scripts/patch-ravintola-arviot.ts
 *        (osana `npm run migrate:ravintolat` ja `npm run migrate:klubi`)
 * Lähde: data/normalized/klubi-ravintola-arviot.json  (npx tsx scripts/parse-klubi.ts)
 *        data/images/                                  (npm run images)
 * Kohde: Sanity development: `review` ja `muutLegacyUrlit` kohdedokumentissa
 *
 * Miksi patch eikä NDJSON-import: kohde on ravintolamigraation dokumentti.
 * `--replace` M6:n tiedostosta tuhoaisi ravintolan muut kentät, ja
 * `import-ravintolat.ts` puolestaan tuhoaa tämän patchin — siksi
 * `migrate:ravintolat` ajaa tämän skriptin viimeisenä.
 *
 * Idempotentti: `_key`:t lasketaan dokumentista ja polusta, kuvat ladataan
 * sisällön hashilla deduplikoiden (Sanity palauttaa saman assetin), ja `set`
 * korvaa kentän kokonaan. Ravintolan omia kuvia (`images`) ei kosketa.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { createClient } from "@sanity/client";

import type { KuvaRef, Lohko } from "./parse-klubi";

const ROOT = process.cwd();
const SOURCE = join(ROOT, "data", "normalized", "klubi-ravintola-arviot.json");
const IMAGES_DIR = join(ROOT, "data", "images");
const DATASET = "development";

interface Arvio {
  kohdeId: string;
  lahdesivu: string;
  otsikko: string;
  review: Lohko[];
  kuvat: KuvaRef[];
}

function key(docId: string, path: string): string {
  return createHash("sha1").update(`${docId}|${path}`).digest("hex").slice(0, 12);
}

async function main() {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !token) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID tai SANITY_API_WRITE_TOKEN puuttuu .env.localista");

  const client = createClient({ projectId, dataset: DATASET, token, apiVersion: "2024-10-01", useCdn: false });
  const arviot = JSON.parse(await readFile(SOURCE, "utf-8")) as Arvio[];

  const assetIds = new Map<string, string>();
  async function assetFor(file: string): Promise<string> {
    const cached = assetIds.get(file);
    if (cached) return cached;
    const buffer = await readFile(join(IMAGES_DIR, file));
    const asset = await client.assets.upload("image", buffer, { filename: basename(file) });
    assetIds.set(file, asset._id);
    return asset._id;
  }

  let transaction = client.transaction();
  for (const arvio of arviot) {
    const docId = arvio.kohdeId;
    const existing = await client.getDocument<{
      _id: string;
      muutLegacyUrlit?: string[];
      review?: { _key?: string }[];
    }>(docId);
    if (!existing) throw new Error(`${docId} puuttuu datasetista ${DATASET} — aja ensin ravintolamigraatio`);

    const review = [];
    for (const [i, lohko] of arvio.review.entries()) {
      const path = `review[${i}]`;
      if (lohko.tyyppi === "kuva") {
        review.push({
          _type: "imageWithAlt",
          _key: key(docId, path),
          asset: { _type: "reference", _ref: await assetFor(lohko.kuva.file) },
          alt: lohko.kuva.alt,
          ...(lohko.kuva.caption ? { caption: lohko.kuva.caption } : {}),
        });
        continue;
      }
      const markDefs: { _type: "link"; _key: string; href: string }[] = [];
      const children = lohko.runs.map((run, j) => {
        const marks: string[] = [...(run.marks ?? [])];
        if (run.href) {
          let def = markDefs.find((m) => m.href === run.href);
          if (!def) {
            def = { _type: "link", _key: key(docId, `${path}.link.${markDefs.length}`), href: run.href };
            markDefs.push(def);
          }
          marks.push(def._key);
        }
        return { _type: "span", _key: key(docId, `${path}.span.${j}`), text: run.text, marks };
      });
      review.push({
        _type: "block",
        _key: key(docId, path),
        style: lohko.tyyli ?? "normal",
        markDefs,
        children,
        ...(lohko.lista ? { listItem: lohko.lista, level: 1 } : {}),
      });
    }

    // Arvion kuvat ovat arviotekstin sisällä (review) — `kuvat` on sama lista
    // tarkistusta varten. Jos kuva puuttuu tekstistä, se on virhe lähteessä.
    const inline = new Set(arvio.review.flatMap((l) => (l.tyyppi === "kuva" ? [l.kuva.file] : [])));
    const missing = arvio.kuvat.filter((k) => !inline.has(k.file));
    if (missing.length > 0) throw new Error(`${docId}: ${missing.length} kuvaa puuttuu arviotekstistä`);

    // Ravintolaimport voi tuoda listaussivun omaa arviotekstiä samaan kenttään
    // (`_key` alkaa "rv-"). Ne säilytetään tämän arvion perässä; tämän skriptin
    // omat lohkot korvataan kokonaan, joten ajo on idempotentti.
    const fromListing = (existing.review ?? []).filter((b) => b._key?.startsWith("rv-"));
    const merged = [...review, ...fromListing];

    const legacy = `/${arvio.lahdesivu}`;
    const muut = [...new Set([...(existing.muutLegacyUrlit ?? []), legacy])].sort();
    transaction = transaction.patch(docId, (p) => p.set({ review: merged, muutLegacyUrlit: muut }));
    console.log(
      `  ${docId}: ${review.length} lohkoa (${inline.size} kuvaa) + ${fromListing.length} listaussivulta, muutLegacyUrlit ${muut.join(", ")}`,
    );
  }

  await transaction.commit();
  console.log(`\nPäivitetty ${arviot.length} ravintolaa datasetissa ${DATASET}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
