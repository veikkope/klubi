/**
 * Todentaa, että jokainen migroitu dokumentti renderöityy omalla reitillään
 * (docs/12 §1.5 ja §3 Vaihe 2, kohta 7).
 *
 * Ajo paikallista palvelinta vasten:
 *   npm run dev                (tai npm run build && npm start)
 *   npm run verify:content
 *
 * Ajo preview-deployta vasten:
 *   BASE_URL=https://klubi.vercel.app npm run verify:content
 *
 * Mitä tarkistetaan, dokumentti kerrallaan:
 *  1. Dokumentille muodostuu reitti (`lib/path.ts` → `documentRoute`).
 *  2. Reitti palauttaa HTTP 200 (ei ohjausta, ei 404:ää).
 *  3. Dokumentin otsikko näkyy sivun HTML:ssä.
 *  4. Jos dokumentti on listaussivun osio (ankkuri), sivulla on `id="<slug>"`,
 *     jotta vanhojen osoitteiden ohjaukset (`…#slug`) osuvat oikeaan kohtaan.
 *
 * "Migroitu dokumentti" = dokumentti, jolla on `legacyUrl`, `blogspot.id` tai
 * `muutLegacyUrlit` development-datasetissa. Viitedokumentit ilman omaa
 * näkymää (`kaupunki`) raportoidaan erikseen, eivätkä ne kaada ajoa.
 */
import { existsSync } from "node:fs";

import { documentRoute, routableProjection, type RoutableDoc } from "../lib/path";
import { sanityWriteToken } from "./lib/sanity-token";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 6);
const DATASET = process.env.SANITY_VERIFY_DATASET ?? "development";

/** Tyypit, joilla ei ole omaa sivua: niiden sisältö näkyy viittaajan sivulla. */
const REFERENCE_ONLY_TYPES = new Set(["kaupunki"]);

interface MigratedDoc extends RoutableDoc {
  title: string | null;
}

interface PageResult {
  status: number;
  location: string | null;
  text: string;
  ids: Set<string>;
}

interface Failure {
  id: string;
  path: string;
  reason: string;
}

async function fetchDocs(): Promise<MigratedDoc[]> {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID puuttuu .env.localista");
  // Token aina: yksityinen datasetti palauttaa ilman sitä tyhjän tuloksen virheettä.
  const token = sanityWriteToken() ?? process.env.SANITY_API_READ_TOKEN;
  const query = /* groq */ `*[
    !(_id in path("drafts.**"))
    && (defined(legacyUrl) || defined(muutLegacyUrlit) || defined(blogspot.id))
  ] | order(_type asc, _id asc){
    ${routableProjection},
    "title": coalesce(title, name, heroTitle)
  }`;
  const url =
    `https://${projectId}.api.sanity.io/v2024-10-01/data/query/${DATASET}` +
    `?query=${encodeURIComponent(query)}&perspective=published`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`Sanity-kysely epäonnistui: HTTP ${res.status}`);
  return ((await res.json()) as { result: MigratedDoc[] }).result;
}

/** HTML → vertailtava teksti: tagit pois, entiteetit auki, välilyönnit yhdeksi. */
function htmlToText(html: string): string {
  const named: Record<string, string> = {
    amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—",
  };
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
      if (code[0] === "#") {
        const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return Number.isFinite(n) ? String.fromCodePoint(n) : entity;
      }
      return named[code.toLowerCase()] ?? entity;
    })
    .replace(/\s+/g, " ")
    .normalize("NFC");
}

function normalizeTitle(title: string): string {
  return title.replace(/\s+/g, " ").trim().normalize("NFC");
}

async function fetchPage(path: string): Promise<PageResult> {
  const res = await fetch(`${BASE_URL}${encodeURI(path)}`, {
    redirect: "manual",
    headers: { "User-Agent": "KlubiContentVerifier/1.0" },
    signal: AbortSignal.timeout(120_000),
  });
  const html = res.status === 200 ? await res.text() : "";
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  return { status: res.status, location: res.headers.get("location"), text: htmlToText(html), ids };
}

async function main() {
  const docs = await fetchDocs();
  console.log(`Sanity (${DATASET}): ${docs.length} migroitua dokumenttia`);
  console.log(`Palvelin: ${BASE_URL}\n`);

  const byPath = new Map<string, { doc: MigratedDoc; anchor?: string }[]>();
  const referenceOnly: MigratedDoc[] = [];
  const failures: Failure[] = [];

  for (const doc of docs) {
    const route = documentRoute(doc);
    if (!route) {
      if (REFERENCE_ONLY_TYPES.has(doc._type)) referenceOnly.push(doc);
      else failures.push({ id: doc._id, path: "—", reason: `ei reittiä (tyyppi ${doc._type}, kategoria ${doc.category ?? "—"})` });
      continue;
    }
    const list = byPath.get(route.path) ?? [];
    list.push({ doc, anchor: route.anchor });
    byPath.set(route.path, list);
  }

  const queue = [...byPath.keys()];
  let done = 0;
  let checkedDocs = 0;

  async function worker() {
    while (queue.length > 0) {
      const path = queue.shift();
      if (!path) break;
      const entries = byPath.get(path) ?? [];
      let page: PageResult;
      try {
        page = await fetchPage(path);
      } catch (error) {
        for (const { doc } of entries) {
          failures.push({ id: doc._id, path, reason: error instanceof Error ? error.message : String(error) });
        }
        continue;
      }

      for (const { doc, anchor } of entries) {
        checkedDocs += 1;
        if (page.status !== 200) {
          const where = page.location ? ` → ${page.location}` : "";
          failures.push({ id: doc._id, path, reason: `HTTP ${page.status}${where}` });
          continue;
        }
        const title = doc.title ? normalizeTitle(doc.title) : "";
        if (!title) {
          failures.push({ id: doc._id, path, reason: "dokumentilla ei ole otsikkoa" });
        } else if (!page.text.includes(title)) {
          failures.push({ id: doc._id, path, reason: `otsikko "${title}" ei näy sivulla` });
        }
        if (anchor && !page.ids.has(anchor)) {
          failures.push({ id: doc._id, path, reason: `ankkuria #${anchor} ei löydy sivulta` });
        }
      }

      done += 1;
      if (done % 50 === 0) process.stdout.write(`  ${done} / ${byPath.size} sivua\n`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const byType: Record<string, number> = {};
  for (const doc of docs) byType[doc._type] = (byType[doc._type] ?? 0) + 1;

  console.log(`
Dokumentteja ............. ${docs.length}
  ${Object.entries(byType).map(([t, n]) => `${t} ${n}`).join(", ")}
Tarkistettu reitillä ..... ${checkedDocs}
Uniikkeja sivuja ......... ${byPath.size}
Viitedokumentteja ........ ${referenceOnly.length} (${[...new Set(referenceOnly.map((d) => d._type))].join(", ") || "—"}; ei omaa sivua)
Virheitä ................. ${failures.length}`);

  if (failures.length > 0) {
    console.error(`\n${failures.length} dokumenttia ei renderöidy oikein:\n`);
    for (const failure of failures.sort((a, b) => a.id.localeCompare(b.id))) {
      console.error(`  ${failure.id}  ${failure.path}\n    ${failure.reason}`);
    }
    process.exit(1);
  }
  console.log("\nJokainen migroitu dokumentti renderöityy reitillään otsikkoineen (HTTP 200).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
