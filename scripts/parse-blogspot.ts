/**
 * Jäsentää klubin Blogspot-blogin kirjoitukset CMS-riippumattomaan muotoon.
 *
 * Ajo:    `npx tsx scripts/parse-blogspot.ts`   (osa `npm run migrate:blogspot`)
 * Lähde:  data/blogspot/posts.json, images.json, images/   (`npm run blogspot:fetch`)
 * Tulos:  data/normalized/blogspot.json          kirjoitukset lohkoina
 *         data/normalized/blogspot-kommentit.json veikkauskirjoitusten kommentit (docs/15 §5)
 *         data/normalized/blogspot-report.json   määrät, tarkistussyyt, pudotetut kuvat
 *
 * Ajetaan paikallista kopiota vasten, ei verkkoa (docs/12 §0) → sama kopio
 * tuottaa tavulleen saman tuloksen. Sanity-muotoilu on erillisessä
 * adapterissa `scripts/import-blogspot.ts`, kuten muissa putkissa.
 *
 * Bloggerin HTML (docs/14 §2):
 *   - teksti on `<br>`-riveinä; kaksi peräkkäistä `<br>`:ää = kappaleraja,
 *     yksi = rivinvaihto kappaleen sisällä (palloveikkauksen sarjataulukot)
 *   - kuva kuvatekstineen on `<table class="tr-caption-container">`
 *   - Wordista liitetyt `<span style="font-family…">`-kääreet ohitetaan
 *   - klubin logo toistuu ~70 kirjoituksessa koristeena → pudotetaan
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { load } from "cheerio";
import type { AnyNode, Element } from "domhandler";

import { canonicalImageUrl, type BlogspotComment, type BlogspotImage, type BlogspotPost } from "./lib/blogspot";
import { decodeEntities } from "./lib/decode-html";
import { stripInvisible } from "./lib/normalize-cell";
import { leadSentences, summaryFromText } from "./lib/summary";

const SRC_DIR = join(process.cwd(), "data", "blogspot");
const OUT_FILE = join(process.cwd(), "data", "normalized", "blogspot.json");
const REPORT_FILE = join(process.cwd(), "data", "normalized", "blogspot-report.json");
const COMMENTS_FILE = join(process.cwd(), "data", "normalized", "blogspot-kommentit.json");

// ─── Tyypit ────────────────────────────────────────────────────────────────

export interface Span {
  text: string;
  strong?: true;
  em?: true;
  underline?: true;
  /** Lähteen linkki sellaisenaan; adapteri muuntaa sisäisiksi poluiksi. */
  href?: string;
}

export interface TextNode {
  kind: "text";
  style: "normal" | "h2" | "h3" | "blockquote";
  spans: Span[];
}

export interface ImageNode {
  kind: "image";
  /** Tiedosto `data/blogspot/images/`-kansiossa. */
  file: string;
  url: string;
  /** Kuvateksti lähteestä (Bloggerin `tr-caption`). */
  caption: string | null;
  /** Lähteen `alt`/`title`-attribuutti, jos ei tyhjä. */
  originalAlt: string | null;
  /** Alkuperäinen tiedostonimi, esim. "LahtiMIFK240223.jpg". */
  originalName: string | null;
}

export type BodyNode = TextNode | ImageNode;

export interface BlogspotEntry {
  /** Bloggerin kirjoitus-id: dokumentin pysyvä avain (docs/14 §3). */
  id: string;
  url: string;
  /** Polku blogissa, esim. "/2019/03/milano.html" — ohjauksen avain. */
  path: string;
  title: string;
  /** Julkaisuaika UTC, sekunnin tarkkuudella. */
  publishedAt: string;
  /** Julkaisupäivä blogin aikavyöhykkeellä (Suomi), YYYY-MM-DD. */
  date: string;
  updatedAt: string;
  labels: string[];
  categories: string[];
  commentCount: number;
  cover: ImageNode | null;
  body: BodyNode[];
  tiivistelma: string | null;
  excerpt: string;
  reviewReasons: string[];
}

export interface DroppedImage {
  postId: string;
  title: string;
  url: string;
  reason: string;
}

// ─── Kategoriat ────────────────────────────────────────────────────────────

/**
 * Bloggerin tunniste → uutisen kategoria (sanity/schemas/documents/uutinen.ts).
 * Vain yksiselitteiset tunnisteet (docs/12 §3 M1). Henkilöiden, paikkojen ja
 * ravintoloiden nimet eivät kategorisoi — ne säilyvät `tunnisteet`-kentässä.
 */
const LABEL_CATEGORIES: Record<string, string> = {
  palloveikkaus: "palloveikkaus",
  veikkaus: "palloveikkaus",
  voittajaveikkaus: "palloveikkaus",
  matkakuvaus: "matkakuvaus",
  ruokailu: "ravintola",
  ravintola: "ravintola",
  "parhaat ravintolat": "ravintola",
  jouluruokailu: "ravintola",
  ottelutapahtuma: "otteluraportti",
  harjoitusottelu: "otteluraportti",
  vuosikokous: "jasentieto",
  vappu: "tapahtumaraportti",
  "mölkky": "tapahtumaraportti",
  "pääsiäinen": "tapahtumaraportti",
  ilotulitus: "tapahtumaraportti",
  "syntymäpäivä": "tapahtumaraportti",
  sauna: "tapahtumaraportti",
  kalastus: "tapahtumaraportti",
  "suomalaiset historiapäivät": "tapahtumaraportti",
  huuhkajat: "jalkapallo",
  jalkapallo: "jalkapallo",
  maajoukkue: "jalkapallo",
  veikkausliiga: "jalkapallo",
  "fc lahti": "jalkapallo",
  hjk: "jalkapallo",
  kuusysi: "jalkapallo",
  liigacup: "jalkapallo",
  "lahti cup": "jalkapallo",
  "mm-karsinta": "jalkapallo",
  "em-karsinta": "jalkapallo",
  "em-kilpailut": "jalkapallo",
  "kansojen liiga": "jalkapallo",
  "paras avaus": "jalkapallo",
  litmanen: "jalkapallo",
  euro2008: "jalkapallo",
  euro2020: "jalkapallo",
  euro2024: "jalkapallo",
  mm2010: "jalkapallo",
  mm2026: "jalkapallo",
  "uefa cup": "jalkapallo",
};

/** Otsikon avainsanat tunnisteettomille ja tunnisteiltaan niukoille kirjoituksille. */
const TITLE_CATEGORIES: [RegExp, string][] = [
  [/\bveikkaus/i, "palloveikkaus"],
  [/\bvuosikokous/i, "jasentieto"],
  // Klubin vuosipäivät, logokilpailu ja paidat: jäsenille suunnattua klubin asiaa.
  [/\bklubi\b.*\b(\d+|kolme) vuotta|\bklubin (logo|paidat)|\bklubin paidat|\brekisteröity/i, "jasentieto"],
  [/jalkapallo|paras avaus|\b(MM|EM)-karsint|\bHuuhkaj/i, "jalkapallo"],
  [/\bravintolat?\b/i, "ravintola"],
  [/juhla\b|\bvenetsialaiset|\b(pitkäperjantai|pallopäivä|mölkky)/i, "tapahtumaraportti"],
];

/** Kategorioiden järjestys = skeeman listan järjestys (deterministinen tulos). */
const CATEGORY_ORDER = [
  "otteluraportti",
  "kannattajakulttuuri",
  "tiedote",
  "tapahtumaraportti",
  "jasentieto",
  "jalkapallo",
  "ravintola",
  "palloveikkaus",
  "matkakuvaus",
  "blogi",
];

function categoriesFor(title: string, labels: string[]): string[] {
  const found = new Set<string>();
  for (const label of labels) {
    const cat = LABEL_CATEGORIES[label.toLowerCase().normalize("NFC")];
    if (cat) found.add(cat);
    // "Ravintola Roux", "Ravintola El Toro" …
    if (/^ravintola\s/i.test(label)) found.add("ravintola");
  }
  for (const [re, cat] of TITLE_CATEGORIES) if (re.test(title)) found.add(cat);
  return CATEGORY_ORDER.filter((c) => found.has(c));
}

// ─── Kuvat ─────────────────────────────────────────────────────────────────

/**
 * Koristekuvat sisällön sha1:n mukaan (sama kuva on blogissa useana URL:na).
 * Tunnistettu katsomalla kuvat: molemmat ovat klubin logo (hyppyrimäkitunnus +
 * "Lahden SUOMALAINEN KLUBI ry"), jota käytettiin kirjoitusten allekirjoituksena.
 * Uudella sivustolla logo on sivupohjassa, joten se pudotetaan leipätekstistä.
 */
const DECORATIVE_SHA1: Record<string, string> = {};
const DECORATIVE_FILES = ["eb5503a9433d-kuva.png", "89768ed0312a-logolsk.jpg"];

function sha1File(path: string): string {
  return createHash("sha1").update(readFileSync(path)).digest("hex");
}

// ─── Teksti ────────────────────────────────────────────────────────────────

/**
 * Tekstisolmun siivous. Bloggerin editori on osin koodannut entiteetit kahdesti
 * ("fish &amp;amp; chips"): kerran purettuun tekstiin jäänyt entiteetti puretaan.
 */
function cleanText(s: string): string {
  const decoded = /&(?:[a-z]+|#\d+|#x[0-9a-f]+);/i.test(s) ? decodeEntities(s) : s;
  return stripInvisible(decoded.normalize("NFC")).replace(/[\s ]+/g, " ");
}

interface Marks {
  strong?: true;
  em?: true;
  underline?: true;
  href?: string;
}

const BLOCK_TAGS = new Set([
  "p", "div", "blockquote", "pre", "ul", "ol", "li", "center", "dl", "dt", "dd",
  "section", "article", "header", "footer", "figure", "figcaption", "h1", "h2", "h3", "h4", "h5", "h6",
]);
const SKIP_TAGS = new Set(["style", "script", "xml", "meta", "link", "head", "title", "noscript", "iframe", "object", "embed"]);

/**
 * Kokoaa lohkot DOM-läpikäynnin tapahtumista. Kappale katkeaa lohkoelementin
 * rajalla, kuvassa ja kahdessa peräkkäisessä `<br>`:ssä.
 */
class BlockBuilder {
  nodes: BodyNode[] = [];
  private spans: Span[] = [];
  private style: TextNode["style"] = "normal";
  private pendingBreak = false;

  setStyle(style: TextNode["style"]) {
    this.flush();
    this.style = style;
  }

  text(raw: string, marks: Marks) {
    const t = cleanText(raw);
    if (!t) return;
    if (!t.trim()) {
      if (this.spans.length && !this.pendingBreak) this.push(" ", {});
      return;
    }
    if (this.pendingBreak) {
      this.push("\n", {});
      this.pendingBreak = false;
    }
    this.push(t, marks);
  }

  br() {
    if (!this.spans.length) return;
    if (this.pendingBreak) this.flush();
    else this.pendingBreak = true;
  }

  image(node: ImageNode) {
    this.flush();
    this.nodes.push(node);
  }

  /** Taulukon rivit omina riveinään (vain yksi datataulukko koko blogissa). */
  lines(lines: string[]) {
    this.flush();
    const text = lines.map((l) => l.trim()).filter(Boolean).join("\n");
    if (text) this.nodes.push({ kind: "text", style: "normal", spans: [{ text }] });
  }

  flush() {
    const spans = normalizeSpans(this.spans);
    if (spans.length) this.nodes.push({ kind: "text", style: blockStyle(this.style, spans), spans });
    this.spans = [];
    this.style = "normal";
    this.pendingBreak = false;
  }

  private push(text: string, marks: Marks) {
    const span: Span = { text };
    if (marks.strong) span.strong = true;
    if (marks.em) span.em = true;
    if (marks.underline) span.underline = true;
    if (marks.href) span.href = marks.href;
    this.spans.push(span);
  }
}

/**
 * Lohkon lopullinen tyyli sisällön perusteella:
 *  - Wordista liitetty `<h1>` luettelorivin ympärillä ("4. Amulet … \n http://…")
 *    ei ole otsikko: monirivinen, pitkä tai linkin sisältävä → leipäteksti.
 *  - Kokonaan lihavoitu lyhyt rivi ilman loppuvälimerkkiä on väliotsikko
 *    (matkakuvausten "Liikkuminen", "Ruokailu"). h2, koska sivun otsikko on h1.
 */
function blockStyle(style: TextNode["style"], spans: Span[]): TextNode["style"] {
  const text = spans.map((s) => s.text).join("");
  const headingLike = text.length <= 80 && !text.includes("\n") && !/https?:\/\//.test(text);
  if (style === "h2" || style === "h3") return headingLike && !/[.!?]$/.test(text) ? style : "normal";
  if (style === "normal" && headingLike && spans.every((s) => s.strong && !s.href) && !/[.,:;!?…]$/.test(text)) {
    return "h2";
  }
  return style;
}

function sameMarks(a: Span, b: Span): boolean {
  return a.strong === b.strong && a.em === b.em && a.underline === b.underline && a.href === b.href;
}

/**
 * Yhdistää vierekkäiset saman muotoilun palat, poistaa tuplavälit ja
 * rivinvaihtoja ympäröivät välit sekä trimmaa lohkon reunat. Pelkkää
 * tyhjää sisältävä muotoilu (lihavoitu välilyönti) pudotetaan.
 */
function normalizeSpans(input: Span[]): Span[] {
  const merged: Span[] = [];
  for (const s of input) {
    // Muotoilu ei tarkoita mitään pelkässä välilyönnissä tai rivinvaihdossa.
    const span: Span = /^[\s]*$/.test(s.text) ? { text: s.text } : { ...s };
    const prev = merged[merged.length - 1];
    if (prev && sameMarks(prev, span)) prev.text += span.text;
    else merged.push(span);
  }
  const out: Span[] = [];
  let prevEndsSpace = true; // lohkon alku käyttäytyy kuin väli: johtavat välit pois
  for (const s of merged) {
    let text = s.text.replace(/ *\n */g, "\n").replace(/ {2,}/g, " ").replace(/\n{2,}/g, "\n");
    if (prevEndsSpace) text = text.replace(/^[ \n]+/, "");
    if (!text) continue;
    prevEndsSpace = /[ \n]$/.test(text);
    out.push({ ...s, text });
  }
  // Lopun välit ja rivinvaihdot pois
  while (out.length) {
    const last = out[out.length - 1];
    last.text = last.text.replace(/[ \n]+$/, "");
    if (last.text) break;
    out.pop();
  }
  // Tyhjiksi jääneet (esim. muotoiltu "\n" toisen rivinvaihdon perässä)
  return out.filter((s) => s.text.length > 0);
}

// ─── HTML → lohkot ─────────────────────────────────────────────────────────

interface ParseContext {
  imagesByUrl: Map<string, BlogspotImage>;
  missingImages: string[];
  hadDataTable: boolean;
}

function styleMarks(style: string | undefined, marks: Marks): Marks {
  if (!style) return marks;
  const next = { ...marks };
  if (/font-weight\s*:\s*(bold|[6-9]00)/i.test(style)) next.strong = true;
  if (/font-style\s*:\s*italic/i.test(style)) next.em = true;
  return next;
}

function imageNode($el: ReturnType<ReturnType<typeof load>>, caption: string | null, ctx: ParseContext): ImageNode | null {
  const src = $el.attr("src") ?? "";
  const url = canonicalImageUrl(src.replace(/&amp;/g, "&"));
  if (!url) return null;
  const inv = ctx.imagesByUrl.get(url);
  if (!inv?.ok) {
    ctx.missingImages.push(url);
    return null;
  }
  const alt = cleanText($el.attr("alt") ?? $el.attr("title") ?? "").trim();
  return {
    kind: "image",
    file: inv.file,
    url,
    caption: caption || null,
    originalAlt: alt || null,
    originalName: inv.originalName,
  };
}

function htmlToNodes(html: string, ctx: ParseContext): BodyNode[] {
  const $ = load(html, null, false);
  const out = new BlockBuilder();

  const walk = (node: AnyNode, marks: Marks) => {
    if (node.type === "text") {
      out.text((node as unknown as { data: string }).data, marks);
      return;
    }
    if (node.type !== "tag" && node.type !== "script" && node.type !== "style") return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (SKIP_TAGS.has(tag) || tag.includes(":")) return; // <o:p>, <st1:…> ym. Word-jäänteet

    if (tag === "br") return out.br();

    if (tag === "img") {
      const img = imageNode($(el), null, ctx);
      if (img) out.image(img);
      return;
    }

    if (tag === "table") {
      if (($(el).attr("class") ?? "").includes("tr-caption-container")) {
        // Kuvateksti = solun ensimmäinen rivi. Osa kirjoituksista on kirjoitettu
        // kokonaan kuvatekstisoluun ("C 05.09.2019<br><br><div>1. La Palme…"):
        // loput solusta on leipätekstiä kuvan jälkeen, ei kuvatekstiä.
        const cell = $(el).find(".tr-caption").first().contents().toArray();
        const firstBreak = cell.findIndex(
          (n) => n.type === "tag" && ((n as Element).tagName === "br" || BLOCK_TAGS.has((n as Element).tagName)),
        );
        const captionNodes = firstBreak === -1 ? cell : cell.slice(0, firstBreak);
        const rest = firstBreak === -1 ? [] : cell.slice(firstBreak);
        const caption = cleanText(captionNodes.map((n) => $(n).text()).join("")).trim();
        $(el)
          .find("img")
          .each((_, img) => {
            const node = imageNode($(img), caption, ctx);
            if (node) out.image(node);
          });
        for (const n of rest) walk(n, {});
        out.flush();
        return;
      }
      // Datataulukko: rivi per rivi, solut " · "-erottimella.
      ctx.hadDataTable = true;
      const rows: string[] = [];
      $(el)
        .find("tr")
        .each((_, tr) => {
          const cells = $(tr)
            .children("td,th")
            .map((__, td) => cleanText($(td).text()).trim())
            .get()
            .filter(Boolean);
          if (cells.length) rows.push(cells.join(" · "));
        });
      out.lines(rows);
      $(el).find("img").each((_, img) => {
        const n = imageNode($(img), null, ctx);
        if (n) out.image(n);
      });
      return;
    }

    let next = styleMarks(el.attribs.style, marks);
    if (tag === "b" || tag === "strong") next = { ...next, strong: true };
    if (tag === "i" || tag === "em") next = { ...next, em: true };
    if (tag === "u") next = { ...next, underline: true };
    if (tag === "a") {
      const href = (el.attribs.href ?? "").trim();
      // Kuvan ympärillä oleva linkki isompaan kuvaan ei ole sisältölinkki.
      if (href && !canonicalImageUrl(href) && !/^javascript:/i.test(href)) next = { ...next, href };
    }

    const isBlock = BLOCK_TAGS.has(tag);
    if (isBlock) {
      if (/^h[1-3]$/.test(tag)) out.setStyle("h2");
      else if (/^h[4-6]$/.test(tag)) out.setStyle("h3");
      else if (tag === "blockquote") out.setStyle("blockquote");
      else out.flush();
    }
    for (const child of el.children) walk(child, next);
    if (isBlock) out.flush();
  };

  for (const child of $.root().contents().toArray()) walk(child, {});
  out.flush();
  return out.nodes;
}

// ─── Kirjoitus ─────────────────────────────────────────────────────────────

const MOJIBAKE = /Ã[¤¶¥„–…©¼]|â€|Â[  ]|�/;

function plainText(nodes: BodyNode[]): string {
  return nodes
    .filter((n): n is TextNode => n.kind === "text" && n.style === "normal")
    .map((n) => n.spans.map((s) => s.text).join(""))
    .join("\n");
}

/**
 * Tiivistelmän lähde: vain proosarivit. Numeroidut rivit ("01. Ilpo -24 (1)")
 * ovat sarjataulukkoa tai luetteloa — virkejakaja pitäisi niitä virkkeinä.
 */
function proseText(text: string): string {
  return text
    .split("\n")
    .filter((line) => !/^\s*\(?\d{1,3}[.)]?\s/.test(line))
    .join("\n");
}

/**
 * Onko tekstissä kirjoitettua proosaa (≥ 200 merkkiä vähintään 60 merkin
 * riveinä)? Aikataulut ("klo 13.00 Vapaudenkatu / Juppe, Toni") ja nimilistat
 * ovat lyhyitä rivejä: niistä ei synny tiivistelmää, eikä sen puuttuminen ole
 * virhe, joka pitäisi tarkistaa.
 */
function hasProse(prose: string): boolean {
  return prose.split("\n").filter((l) => l.trim().length >= 60).join(" ").length >= 200;
}

/** "2026-09-27T17:10:49.349+03:00" → "2026-09-27T14:10:49Z" */
function toUtcSeconds(iso: string): string {
  return new Date(iso).toISOString().replace(/\.\d{3}Z$/, "Z");
}

function parsePost(post: BlogspotPost, ctx: ParseContext, dropped: DroppedImage[]): BlogspotEntry {
  const reasons: string[] = [];
  ctx.missingImages = [];
  ctx.hadDataTable = false;

  let nodes = htmlToNodes(post.html, ctx);
  if (ctx.missingImages.length) throw new Error(`${post.url}: kuva puuttuu inventaariosta: ${ctx.missingImages.join(", ")}`);
  if (ctx.hadDataTable) reasons.push("lähteen taulukko on muunnettu riveiksi (solut · -erottimella) — tarkista luettavuus");

  // Koristekuvat (logo) pois.
  nodes = nodes.filter((n) => {
    if (n.kind !== "image") return true;
    const deco = DECORATIVE_SHA1[sha1File(join(SRC_DIR, "images", n.file))];
    if (deco) dropped.push({ postId: post.id, title: post.title, url: n.url, reason: deco });
    return !deco;
  });

  const title = cleanText(post.title).trim();
  const hasText = nodes.some((n) => n.kind === "text");
  // Kansikuva = kirjoituksen ensimmäinen elementti, jos se on kuva ja tekstiä on.
  // Pelkän kuvan kirjoituksissa (tervehdykset) kuva jää leipätekstiin, koska
  // skeema vaatii sisällön.
  let cover: ImageNode | null = null;
  if (hasText && nodes[0]?.kind === "image") cover = nodes.shift() as ImageNode;

  const text = plainText(nodes);
  const prose = proseText(text);
  const tiivistelma = summaryFromText(prose);
  // Lyhyt tai pelkkä sarjataulukko ei tarvitse tiivistelmää; pitkä proosa tarvitsee.
  if (!tiivistelma && hasProse(prose)) {
    reasons.push("tiivistelmä puuttuu — alusta ei löytynyt kokonaista asiavirkettä (≤ 300 merkkiä)");
  }
  const firstCaption = [cover, ...nodes].find((n): n is ImageNode => n?.kind === "image" && Boolean(n.caption))?.caption;
  const excerpt = text ? leadSentences(text, 200) : firstCaption ?? title;

  const allText = [title, text, ...nodes.map((n) => (n.kind === "image" ? n.caption ?? "" : ""))].join("\n");
  if (MOJIBAKE.test(allText)) reasons.push("tekstissä on rikkinäisiä merkkejä (mojibake)");
  if (!text && !nodes.some((n) => n.kind === "image")) reasons.push("kirjoitus on tyhjä");

  return {
    id: post.id,
    url: post.url,
    path: new URL(post.url).pathname,
    title,
    publishedAt: toUtcSeconds(post.published),
    date: post.published.slice(0, 10),
    updatedAt: toUtcSeconds(post.updated),
    labels: post.labels,
    categories: categoriesFor(title, post.labels),
    commentCount: post.commentCount,
    cover,
    body: nodes,
    tiivistelma,
    excerpt,
    reviewReasons: reasons,
  };
}

// ─── Kommentit ─────────────────────────────────────────────────────────────

export interface BlogspotKommentti {
  id: string;
  postId: string;
  /** Julkaisuaika UTC, sekunnin tarkkuudella. */
  publishedAt: string;
  nimi: string;
  teksti: string;
}

/**
 * Veikkauskirjoitus: palloveikkaus (kategoria) tai "paras avaus". Vain näiden
 * kommentit tuodaan: ne ovat klubin veikkaushistoriaa (docs/15 §5). Muut
 * (tapahtumat, avoin palsta) jäävät paikalliseen arkistoon.
 */
function isVeikkausPost(e: BlogspotEntry): boolean {
  return e.categories.includes("palloveikkaus") || /paras avaus/i.test(e.title);
}

/** Kommentin HTML tekstiksi: `<br>` rivinvaihdoiksi, tagit pois, entiteetit auki. */
function commentText(html: string): string {
  const withBreaks = html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>\s*<p[^>]*>/gi, "\n\n");
  const $ = load(withBreaks, null, false);
  return stripInvisible(decodeEntities($.root().text()).normalize("NFC"))
    .replace(/[^\S\n]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** "Anonymous" → "Nimetön". Muut nimet sellaisinaan (allekirjoitus jää tekstiin). */
function commentAuthor(author: string): string {
  const name = cleanText(author).trim();
  if (!name || /^(anonymous|anonyymi|nimetön)$/i.test(name)) return "Nimetön";
  return name.slice(0, 40);
}

function parseComments(comments: BlogspotComment[], entries: BlogspotEntry[]): BlogspotKommentti[] {
  const veikkaus = new Set(entries.filter(isVeikkausPost).map((e) => e.id));
  return comments
    .filter((c) => veikkaus.has(c.postId))
    .map((c) => ({
      id: c.id,
      postId: c.postId,
      publishedAt: toUtcSeconds(c.published),
      nimi: commentAuthor(c.author),
      teksti: commentText(c.html),
    }))
    .filter((c) => c.teksti.length > 0);
}

// ─── Pääohjelma ────────────────────────────────────────────────────────────

async function main() {
  const posts = JSON.parse(await readFile(join(SRC_DIR, "posts.json"), "utf-8")) as BlogspotPost[];
  const images = JSON.parse(await readFile(join(SRC_DIR, "images.json"), "utf-8")) as BlogspotImage[];

  for (const file of DECORATIVE_FILES) {
    DECORATIVE_SHA1[sha1File(join(SRC_DIR, "images", file))] = "klubin logo (allekirjoitus) — sivupohjassa uudella sivustolla";
  }

  const ctx: ParseContext = {
    imagesByUrl: new Map(images.map((i) => [i.url, i])),
    missingImages: [],
    hadDataTable: false,
  };
  const dropped: DroppedImage[] = [];
  const entries = posts.map((p) => parsePost(p, ctx, dropped));
  const rawComments = JSON.parse(await readFile(join(SRC_DIR, "comments.json"), "utf-8")) as BlogspotComment[];
  const kommentit = parseComments(rawComments, entries);

  const reasonCounts: Record<string, number> = {};
  for (const e of entries) for (const r of e.reviewReasons) reasonCounts[r] = (reasonCounts[r] ?? 0) + 1;
  const categoryCounts: Record<string, number> = {};
  for (const e of entries) for (const c of e.categories) categoryCounts[c] = (categoryCounts[c] ?? 0) + 1;
  const imageCount = entries.reduce(
    (s, e) => s + (e.cover ? 1 : 0) + e.body.filter((n) => n.kind === "image").length,
    0,
  );

  const report = {
    kirjoituksia: entries.length,
    kansikuvia: entries.filter((e) => e.cover).length,
    kuviaLiitetty: imageCount,
    kuviaPudotettu: dropped.length,
    tiivistelmia: entries.filter((e) => e.tiivistelma).length,
    ilmanKategoriaa: entries.filter((e) => e.categories.length === 0).length,
    kategoriat: categoryCounts,
    tarkistettavia: entries.filter((e) => e.reviewReasons.length).length,
    tarkistussyyt: reasonCounts,
    tarkistettavat: entries
      .filter((e) => e.reviewReasons.length)
      .map((e) => ({ id: e.id, otsikko: e.title, url: e.url, syyt: e.reviewReasons })),
    pudotetutKuvat: dropped,
    kommentit: {
      blogissa: rawComments.length,
      veikkauskirjoituksia: entries.filter(isVeikkausPost).length,
      tuodaan: kommentit.length,
    },
  };

  await writeFile(OUT_FILE, `${JSON.stringify(entries, null, 2)}\n`, "utf-8");
  await writeFile(REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`, "utf-8");
  await writeFile(COMMENTS_FILE, `${JSON.stringify(kommentit, null, 2)}\n`, "utf-8");

  console.log(`
Kirjoituksia ............ ${entries.length}
Kuvia liitetty .......... ${imageCount}  (kansikuvia ${report.kansikuvia}, pudotettu ${dropped.length})
Tiivistelmiä ............ ${report.tiivistelmia}
Ilman kategoriaa ........ ${report.ilmanKategoriaa}
Kategoriat .............. ${Object.entries(categoryCounts).map(([k, v]) => `${k} ${v}`).join(", ")}
Kommentteja tuodaan ..... ${kommentit.length} / ${rawComments.length}  (${report.kommentit.veikkauskirjoituksia} veikkauskirjoitusta)
Tarkistettavia .......... ${report.tarkistettavia} (${((report.tarkistettavia / entries.length) * 100).toFixed(1)} %)
${Object.entries(reasonCounts).map(([k, v]) => `  ${v} × ${k}`).join("\n")}

Tallennettu: ${OUT_FILE}
             ${REPORT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
