/**
 * Kääntää muiden dokumenttien linkit klubin Blogspot-blogiin sivuston omiksi
 * uutispoluiksi (docs/14 §5), esim. matkailusivun vuosimerkintöjen
 * "Matkakuvaus"-linkit → /uutiset/2019-03-10-milano-….
 *
 * Ajo:   npx tsx scripts/patch-blogspot-links.ts
 *        (osana `npm run migrate:blogspot` ja `npm run migrate:klubi`)
 * Lähde: data/normalized/blogspot-map.json   (npx tsx scripts/import-blogspot.ts)
 * Kohde: Sanity development: linkkikentät (`url`, `href`) kaikissa dokumenteissa
 *        paitsi blogista tuoduissa uutisissa (ne on käännetty jo importissa)
 *
 * Miksi patch: linkit ovat muiden putkien dokumenteissa (esim. `import-klubi.ts`),
 * ja niiden uudelleenajo palauttaa blogin osoitteet. Siksi skripti ajetaan
 * myös `migrate:klubi`n lopussa. Idempotentti: toinen ajo ei löydä mitään.
 *
 * Blogin osoite, jolle ei ole kirjoitusta (tunnistesivu, arkisto), jätetään
 * ennalleen ja listataan — se ohjautuu joka tapauksessa uutislistaan.
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createClient } from "@sanity/client";

import { sanityWriteToken } from "./lib/sanity-token";

const DATASET = "development";
const MAP_FILE = join(process.cwd(), "data", "normalized", "blogspot-map.json");
const BLOG = /^https?:\/\/lahdensuomalainenklubi\.blogspot\.[a-z.]+/i;

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** Blogin osoite → polku blogissa (https/.fi/?m=1-muunnelmat samaksi). */
function blogPath(url: string): string | null {
  const m = BLOG.exec(url.trim());
  if (!m) return null;
  return url.trim().slice(m[0].length).split(/[?#]/)[0] || "/";
}

/**
 * Käy dokumentin läpi ja palauttaa `set`-patchit Sanityn polkusyntaksilla.
 * Taulukon alkio osoitetaan `_key`:llä, kun sellainen on (vakaa polku).
 */
function findLinks(
  value: Json,
  path: string,
  map: Map<string, string>,
  out: { path: string; from: string; to: string | null }[],
) {
  if (Array.isArray(value)) {
    value.forEach((item, i) => {
      const k = item && typeof item === "object" && !Array.isArray(item) ? item._key : undefined;
      findLinks(item, `${path}[${typeof k === "string" ? `_key=="${k}"` : i}]`, map, out);
    });
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [k, child] of Object.entries(value)) {
    const childPath = path ? `${path}.${k}` : k;
    if ((k === "url" || k === "href") && typeof child === "string") {
      const p = blogPath(child);
      if (p) out.push({ path: childPath, from: child, to: map.get(p) ?? null });
      continue;
    }
    findLinks(child, childPath, map, out);
  }
}

async function main() {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = sanityWriteToken();
  if (!projectId || !token) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID tai kirjoitustoken puuttuu (.env.local tai npx sanity login)");
  if (!existsSync(MAP_FILE)) {
    // `migrate:all` ajaa klubin ennen blogia; `migrate:blogspot` ajaa tämän uudelleen.
    console.log(`Ohitetaan: ${MAP_FILE} puuttuu (blogia ei ole vielä tuotu).`);
    return;
  }

  const rows = JSON.parse(await readFile(MAP_FILE, "utf-8")) as { polku: string; uusi: string }[];
  const map = new Map(rows.map((r) => [r.polku, r.uusi]));

  const client = createClient({ projectId, dataset: DATASET, token, apiVersion: "2024-10-01", useCdn: false });
  // Blogista tuodut uutiset ohitetaan: niiden `blogspot.url` on alkuperätieto, ei linkki.
  const docs = await client.fetch<({ _id: string } & Record<string, Json>)[]>(
    `*[!(_type match "sanity.*") && !(_id in path("drafts.**")) && !defined(blogspot.id)]`,
  );

  const unresolved: string[] = [];
  let patched = 0;
  let links = 0;
  const transaction = client.transaction();
  for (const doc of docs) {
    const found: { path: string; from: string; to: string | null }[] = [];
    findLinks(doc as Json, "", map, found);
    const sets: Record<string, string> = {};
    for (const f of found) {
      if (f.to) sets[f.path] = f.to;
      else unresolved.push(`${doc._id}: ${f.from}`);
    }
    if (Object.keys(sets).length === 0) continue;
    transaction.patch(doc._id, (p) => p.set(sets));
    patched += 1;
    links += Object.keys(sets).length;
  }
  if (patched > 0) await transaction.commit();

  console.log(`
Dokumentteja tarkistettu  ${docs.length}
Linkkejä käännetty ...... ${links} (${patched} dokumentissa)
Ei vastinetta blogissa .. ${unresolved.length}${unresolved.length ? `\n${unresolved.map((u) => `  ${u}`).join("\n")}` : ""}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
