/**
 * Todentaa Blogspot-migraation Sanityn development-datasetia vasten (docs/14 §7).
 *
 * Ajo:   npm run verify:blogspot
 * Lähde: data/blogspot/posts.json (lähdekopio), data/normalized/blogspot-report.json
 *
 * Tarkistaa KAIKKI kirjoitukset, ei otosta:
 *  1. Kattavuus: jokainen blogin kirjoitus on Sanityssa (`uutinen-blogspot-<id>`),
 *     eikä Sanityssa ole kirjoituksia, joita blogissa ei enää ole.
 *  2. Teksti: lähteen sanoista ≥ 98 % löytyy uutisesta (otsikko, leipäteksti,
 *     kuvatekstit). Vertailu sanoina, joten muotoilu ja rivitys eivät vaikuta.
 *  3. Kuvat: kuvia on lähteen määrä miinus pudotetut logot; jokaisella on
 *     asset ja kuvaava alt (ei tiedostonimeä).
 *  4. Blogiin ei jää riippuvuuksia: ei Bloggerin kuvaosoitteita eikä blogin
 *     linkkejä missään dokumentissa (paitsi alkuperäkenttä `blogspot.url`).
 *  5. Slugit ovat yksikäsitteisiä kaikkien uutisten kesken.
 *  6. Ei mojibakea.
 *
 * Päättyy koodiin 1, jos jokin kriittinen tarkistus epäonnistuu.
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { load } from "cheerio";

import type { BlogspotPost } from "./lib/blogspot";
import { looksLikeFilename } from "./lib/derive-alt";

const DATASET = process.env.SANITY_VERIFY_DATASET ?? "development";
const POSTS = join(process.cwd(), "data", "blogspot", "posts.json");
const REPORT = join(process.cwd(), "data", "normalized", "blogspot-report.json");
const TEXT_THRESHOLD = 0.98;

interface Block {
  _type: string;
  children?: { text?: string }[];
  alt?: string;
  caption?: string;
  asset?: { _ref?: string };
  markDefs?: { href?: string }[];
}

interface Doc {
  _id: string;
  title: string;
  slug: string;
  coverImage?: Block;
  body?: Block[];
  blogspot?: { id: string; url: string };
}

async function query<T>(groq: string): Promise<T> {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID puuttuu .env.localista");
  const token = process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_API_READ_TOKEN;
  const url =
    `https://${projectId}.api.sanity.io/v2024-10-01/data/query/${DATASET}` +
    `?query=${encodeURIComponent(groq)}&perspective=published`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`Sanity-kysely epäonnistui: HTTP ${res.status}`);
  return ((await res.json()) as { result: T }).result;
}

function words(text: string): string[] {
  return text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[​-‏⁠﻿­]/g, "")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 1);
}

/** Lähteen näkyvä teksti: tagit pois, Word-jäänteet (style, xml, o:p) pois. */
function sourceText(post: BlogspotPost): string {
  const $ = load(post.html, null, false);
  $("style, script, xml").remove();
  $("br, p, div, td, tr, h1, h2, h3").after(" ");
  return `${post.title} ${$.root().text()}`;
}

function docText(doc: Doc): string {
  const parts = [doc.title, doc.coverImage?.caption ?? ""];
  for (const b of doc.body ?? []) {
    if (b._type === "block") parts.push((b.children ?? []).map((c) => c.text ?? "").join(""));
    else if (b.caption) parts.push(b.caption);
  }
  return parts.join(" ");
}

/** Osuus lähteen sanoista (monikertoina), jotka löytyvät kohteesta. */
function coverage(source: string[], target: string[]): number {
  if (source.length === 0) return 1;
  const counts = new Map<string, number>();
  for (const w of target) counts.set(w, (counts.get(w) ?? 0) + 1);
  let hit = 0;
  for (const w of source) {
    const n = counts.get(w) ?? 0;
    if (n > 0) {
      hit += 1;
      counts.set(w, n - 1);
    }
  }
  return hit / source.length;
}

async function main() {
  const posts = JSON.parse(await readFile(POSTS, "utf-8")) as BlogspotPost[];
  const report = JSON.parse(await readFile(REPORT, "utf-8")) as { pudotetutKuvat: { postId: string }[] };
  const droppedByPost = new Map<string, number>();
  for (const d of report.pudotetutKuvat) droppedByPost.set(d.postId, (droppedByPost.get(d.postId) ?? 0) + 1);

  const docs = await query<Doc[]>(`*[_type == "uutinen" && defined(blogspot.id) && !(_id in path("drafts.**"))]{
    _id, title, "slug": slug.current, coverImage, body, blogspot
  }`);
  const allSlugs = await query<{ _id: string; slug: string }[]>(
    `*[_type == "uutinen" && !(_id in path("drafts.**"))]{ _id, "slug": slug.current }`,
  );
  // Blogiriippuvuudet koko datasetissa (kuvat Bloggerissa, linkit blogiin).
  const everything = await query<Record<string, unknown>[]>(`*[!(_type match "sanity.*") && !(_id in path("drafts.**"))]`);

  const critical: string[] = [];
  const byId = new Map(docs.map((d) => [d.blogspot!.id, d]));

  // 1. Kattavuus
  const missing = posts.filter((p) => !byId.has(p.id));
  const sourceIds = new Set(posts.map((p) => p.id));
  const extra = docs.filter((d) => !sourceIds.has(d.blogspot!.id));
  if (missing.length) critical.push(`${missing.length} kirjoitusta puuttuu Sanitysta: ${missing.slice(0, 3).map((p) => p.title).join(", ")}…`);

  // 2–3. Teksti ja kuvat
  const lowText: string[] = [];
  const imageIssues: string[] = [];
  let minCoverage = 1;
  let imageCount = 0;
  for (const post of posts) {
    const doc = byId.get(post.id);
    if (!doc) continue;
    const c = coverage(words(sourceText(post)), words(docText(doc)));
    minCoverage = Math.min(minCoverage, c);
    if (c < TEXT_THRESHOLD) lowText.push(`${doc._id} (${(c * 100).toFixed(1)} %) ${doc.title}`);

    const images = [doc.coverImage, ...(doc.body ?? []).filter((b) => b._type === "imageWithAlt")].filter(
      (b): b is Block => Boolean(b?.asset),
    );
    imageCount += images.length;
    const expected = (post.html.match(/<img\b/gi) ?? []).length - (droppedByPost.get(post.id) ?? 0);
    if (images.length !== expected) imageIssues.push(`${doc._id}: kuvia ${images.length}, odotettu ${expected}`);
    for (const img of images) {
      if (!img.alt || img.alt.trim().length < 3 || looksLikeFilename(img.alt)) {
        imageIssues.push(`${doc._id}: kelvoton alt ${JSON.stringify(img.alt)}`);
      }
    }
  }
  if (lowText.length) critical.push(`${lowText.length} kirjoituksen teksti ei vastaa lähdettä (< ${TEXT_THRESHOLD * 100} %)`);
  if (imageIssues.length) critical.push(`${imageIssues.length} kuvaongelmaa`);

  // 4. Blogiriippuvuudet
  const bloggerImages: string[] = [];
  const blogLinks: string[] = [];
  for (const doc of everything) {
    const json = JSON.stringify({ ...doc, blogspot: undefined });
    if (/(blogger\.googleusercontent\.com|\d\.bp\.blogspot\.com)/.test(json)) bloggerImages.push(String(doc._id));
    if (/lahdensuomalainenklubi\.blogspot\./.test(json)) blogLinks.push(String(doc._id));
  }
  if (bloggerImages.length) critical.push(`${bloggerImages.length} dokumenttia viittaa Bloggerin kuvapalvelimeen`);

  // 5. Slugit
  const slugCount = new Map<string, string[]>();
  for (const s of allSlugs) slugCount.set(s.slug, [...(slugCount.get(s.slug) ?? []), s._id]);
  const dupSlugs = [...slugCount.entries()].filter(([, ids]) => ids.length > 1);
  if (dupSlugs.length) critical.push(`${dupSlugs.length} slugia on usealla uutisella`);

  // 6. Mojibake
  const mojibake = docs.filter((d) => /Ã[¤¶¥„–…©¼]|â€|�/.test(JSON.stringify(d))).map((d) => d._id);
  if (mojibake.length) critical.push(`${mojibake.length} dokumentissa mojibakea`);

  console.log(`
Blogin kirjoituksia ......... ${posts.length}
Sanityssa (blogspot) ........ ${docs.length}
  puuttuu ................... ${missing.length}
  ei enää blogissa .......... ${extra.length}${extra.length ? `  (${extra.map((d) => d._id).join(", ")})` : ""}
Tekstin kattavuus, pienin ... ${(minCoverage * 100).toFixed(1)} %  (raja ${TEXT_THRESHOLD * 100} %, alle: ${lowText.length})
Kuvia ....................... ${imageCount}  (ongelmia ${imageIssues.length})
Bloggerin kuvaosoitteita .... ${bloggerImages.length}
Blogilinkkejä muualla ....... ${blogLinks.length}${blogLinks.length ? `  (${blogLinks.join(", ")})` : ""}
Päällekkäisiä slugeja ....... ${dupSlugs.length}
Mojibake .................... ${mojibake.length}
`);
  for (const line of [...lowText, ...imageIssues, ...dupSlugs.map(([s, ids]) => `${s}: ${ids.join(", ")}`)].slice(0, 40)) {
    console.log(`  ${line}`);
  }

  if (critical.length) {
    console.error(`\nKRIITTISET (${critical.length}):\n${critical.map((c) => `  - ${c}`).join("\n")}`);
    process.exit(1);
  }
  console.log("Ei kriittisiä löydöksiä.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
