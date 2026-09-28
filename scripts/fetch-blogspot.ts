/**
 * Hakee klubin Blogspot-blogin paikalliseksi lähdekopioksi.
 *
 * Ajo:    `npm run blogspot:fetch`
 * Lähde:  https://lahdensuomalainenklubi.blogspot.com/ (Bloggerin JSON-syöte)
 * Tulos:  data/blogspot/posts.json        kaikki kirjoitukset (raaka HTML)
 *         data/blogspot/comments.json     kaikki kommentit (arkisto, ei tuoda)
 *         data/blogspot/images/<tiedosto> kirjoitusten kuvat enintään 2048 px
 *         data/blogspot/images.json       kuvainventaario (URL → tiedosto)
 *
 * Miksi paikallinen kopio (docs/12 §0, docs/14): parseri ajetaan kopiota
 * vasten, ei verkkoa, joten sama kopio tuottaa aina saman tuloksen. Blogi on
 * yhä käytössä, joten tämä skripti ajetaan uudelleen aina kun halutaan
 * mukaan uudet kirjoitukset — muu putki on offline ja idempotentti.
 *
 * Syöte eikä HTML-sivut: `feeds/posts/default?alt=json` antaa jokaisen
 * kirjoituksen koko sisällön, tunnisteet, pysyvän id:n ja aikaleimat
 * rakenteisena. Sivujen raapiminen toisi mukaan teeman ja widgetit.
 *
 * Kuvat haetaan Bloggerin kokoparametrilla 2048 px (pidempi sivu). Alkuperäiset
 * ovat jopa 4608 px — Sanity skaalaa kuvat CDN:ssä joka tapauksessa, joten
 * suuremmat tiedostot vain kuluttaisivat tallennustilaa. Skripti on
 * jatkettavissa: jo ladattuja kuvia ei haeta uudelleen.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  BLOG_ORIGIN,
  canonicalImageUrl,
  originalImageName,
  type BlogspotComment,
  type BlogspotImage,
  type BlogspotPost,
} from "./lib/blogspot";

const BLOG = BLOG_ORIGIN;
const OUT_DIR = join(process.cwd(), "data", "blogspot");
const IMG_DIR = join(OUT_DIR, "images");
const PAGE_SIZE = 150;
const CONCURRENCY = 6;

// ─── Bloggerin syötteen muoto (vain käytetyt kentät) ─────────────────────────

interface FeedText {
  $t: string;
}
interface FeedEntry {
  id: FeedText;
  published: FeedText;
  updated: FeedText;
  title: FeedText;
  content?: FeedText;
  category?: { term: string }[];
  link: { rel: string; href: string }[];
  author: { name: FeedText }[];
  "thr$total"?: FeedText;
  "thr$in-reply-to"?: { href: string; ref: string };
}
interface Feed {
  feed: { entry?: FeedEntry[]; "openSearch$totalResults": FeedText };
}

// ─── Syöte ──────────────────────────────────────────────────────────────────

async function fetchJson<T>(url: string): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return (await res.json()) as T;
      throw new Error(`${res.status} ${url}`);
    } catch (err) {
      if (attempt >= 4) throw err;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

async function fetchAll(feedPath: string): Promise<FeedEntry[]> {
  const entries: FeedEntry[] = [];
  let total = Infinity;
  for (let start = 1; start <= total; start += PAGE_SIZE) {
    const url = `${BLOG}${feedPath}?alt=json&max-results=${PAGE_SIZE}&start-index=${start}`;
    const page = await fetchJson<Feed>(url);
    total = Number(page.feed["openSearch$totalResults"].$t);
    entries.push(...(page.feed.entry ?? []));
  }
  if (entries.length !== total) {
    throw new Error(`${feedPath}: syöte ilmoitti ${total}, saatiin ${entries.length}`);
  }
  return entries;
}

/** "tag:blogger.com,1999:blog-137….post-7509…" → "7509…" */
function entryId(e: FeedEntry): string {
  const m = /(?:post|comment)-(\d+)$/.exec(e.id.$t) ?? /(\d+)$/.exec(e.id.$t);
  if (!m) throw new Error(`Tuntematon id: ${e.id.$t}`);
  return m[1];
}

function toPost(e: FeedEntry): BlogspotPost {
  const url = e.link.find((l) => l.rel === "alternate")?.href;
  if (!url) throw new Error(`Kirjoitukselta puuttuu osoite: ${e.title.$t}`);
  return {
    id: entryId(e),
    url: url.replace(/^http:/, "https:"),
    published: e.published.$t,
    updated: e.updated.$t,
    title: e.title.$t,
    html: e.content?.$t ?? "",
    labels: (e.category ?? []).map((c) => c.term).sort((a, b) => a.localeCompare(b, "fi")),
    commentCount: Number(e["thr$total"]?.$t ?? 0),
  };
}

function toComment(e: FeedEntry): BlogspotComment {
  const ref = e["thr$in-reply-to"]?.ref ?? "";
  return {
    id: entryId(e),
    postId: /post-(\d+)$/.exec(ref)?.[1] ?? "",
    published: e.published.$t,
    author: e.author[0]?.name.$t ?? "",
    html: e.content?.$t ?? "",
  };
}

// ─── Kuvat ──────────────────────────────────────────────────────────────────

/** Kuvat kirjoituksen HTML:stä: `<img src>` ja kuvaa ympäröivän `<a href>`. */
function imageUrls(html: string): string[] {
  const urls: string[] = [];
  for (const m of html.matchAll(/<(?:img|a)\b[^>]*?\s(?:src|href)\s*=\s*"([^"]+)"/gi)) {
    const url = canonicalImageUrl(m[1].replace(/&amp;/g, "&"));
    if (url) urls.push(url);
  }
  return urls;
}

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/bmp": ".bmp",
};

/** Deterministinen, lyhyt ja luettava nimi: `<hash>-<alkuperäinen nimi>`. */
function localName(url: string, contentType: string | null): string {
  const hash = createHash("sha1").update(url).digest("hex").slice(0, 12);
  const orig = originalImageName(url);
  const base = (orig ?? "kuva")
    .replace(/\.[a-z0-9]+$/i, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const ext =
    (orig && /\.(jpe?g|png|gif|webp|bmp)$/i.exec(orig)?.[0].toLowerCase().replace(".jpeg", ".jpg")) ??
    EXT_BY_TYPE[contentType ?? ""] ??
    ".jpg";
  return `${hash}-${base || "kuva"}${ext}`;
}

async function downloadImages(urls: string[], previous: Map<string, BlogspotImage>): Promise<BlogspotImage[]> {
  await mkdir(IMG_DIR, { recursive: true });
  const queue = [...urls];
  const results: BlogspotImage[] = [];
  let done = 0;

  async function worker() {
    for (let url = queue.shift(); url; url = queue.shift()) {
      const prev = previous.get(url);
      if (prev?.ok && existsSync(join(IMG_DIR, prev.file))) {
        results.push(prev);
      } else {
        results.push(await downloadOne(url));
      }
      done += 1;
      if (done % 100 === 0) console.log(`  kuvia ${done}/${urls.length}`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return results.sort((a, b) => a.url.localeCompare(b.url));
}

async function downloadOne(url: string): Promise<BlogspotImage> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url);
      const contentType = res.headers.get("content-type")?.split(";")[0].trim() ?? null;
      const file = localName(url, contentType);
      if (!res.ok || !contentType?.startsWith("image/")) {
        if (attempt < 3 && res.status >= 500) throw new Error(String(res.status));
        return { url, file, originalName: originalImageName(url), bytes: 0, contentType, status: res.status, ok: false };
      }
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(join(IMG_DIR, file), buf);
      return { url, file, originalName: originalImageName(url), bytes: buf.length, contentType, status: res.status, ok: true };
    } catch (err) {
      if (attempt >= 3) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

// ─── Pääohjelma ─────────────────────────────────────────────────────────────

async function readPrevious(): Promise<Map<string, BlogspotImage>> {
  const file = join(OUT_DIR, "images.json");
  if (!existsSync(file)) return new Map();
  const { readFile } = await import("node:fs/promises");
  const list = JSON.parse(await readFile(file, "utf-8")) as BlogspotImage[];
  return new Map(list.map((i) => [i.url, i]));
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  console.log("Haetaan kirjoitukset …");
  const posts = (await fetchAll("/feeds/posts/default")).map(toPost);
  // Vanhin ensin ja id:n mukaan: sama blogin tila → tavulleen sama tiedosto.
  posts.sort((a, b) => a.published.localeCompare(b.published) || a.id.localeCompare(b.id));

  console.log("Haetaan kommentit …");
  const comments = (await fetchAll("/feeds/comments/default")).map(toComment);
  comments.sort((a, b) => a.published.localeCompare(b.published) || a.id.localeCompare(b.id));

  const urls = [...new Set(posts.flatMap((p) => imageUrls(p.html)))].sort();
  console.log(`Ladataan ${urls.length} kuvaa …`);
  const images = await downloadImages(urls, await readPrevious());

  await writeFile(join(OUT_DIR, "posts.json"), `${JSON.stringify(posts, null, 2)}\n`, "utf-8");
  await writeFile(join(OUT_DIR, "comments.json"), `${JSON.stringify(comments, null, 2)}\n`, "utf-8");
  await writeFile(join(OUT_DIR, "images.json"), `${JSON.stringify(images, null, 2)}\n`, "utf-8");

  const failed = images.filter((i) => !i.ok);
  const bytes = images.reduce((s, i) => s + i.bytes, 0);
  console.log(`
Kirjoituksia ....... ${posts.length}  (${posts[0]?.published.slice(0, 10)} – ${posts.at(-1)?.published.slice(0, 10)})
Kommentteja ........ ${comments.length}
Kuvia .............. ${images.length}  (${(bytes / 1024 / 1024).toFixed(1)} Mt, epäonnistui ${failed.length})
${failed.map((f) => `  ${f.status} ${f.url}`).join("\n")}
Tallennettu: ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
