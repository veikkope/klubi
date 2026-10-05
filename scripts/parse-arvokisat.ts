/**
 * Purkaa vanhan sivuston arvokisa- ja Litmanen-sivut rakenteiseksi JSON:iksi.
 *
 * Ajo:   `npx tsx scripts/parse-arvokisat.ts`
 * Lähde: data/raw-html/{MM20*,EM20*,mmtilasto,emtilasto,kansojenliiga,
 *        pikkuhuuhkajat,litmanen,litmanenjari,litmanenjaripatsas}.htm
 *        data/normalized/kuvat.json (kuvainventaario)
 * Tulos: data/normalized/arvokisat.json               (kisat, taulukot, pelaajat)
 *        data/normalized/arvokisat-report.json        (määrät, needsReview-syyt)
 *        data/normalized/arvokisat-kuvat-dropped.json (pudotetut kuvat perusteluineen)
 *
 * Tulos on CMS-riippumaton (docs/12 §1.4): sisältö on neutraaleina lohkoina
 * (otsikko / kappale / kuva), ja Sanity-muunnos tehdään erikseen
 * `scripts/import-arvokisat.ts`:ssä.
 *
 * Periaatteet:
 *  - Mitään ei keksitä. Rakenteiset kentät poimitaan lähteen teksteistä ja
 *    taulukoista; jos poiminta ei onnistu, kenttä jää tyhjäksi ja syy kirjataan.
 *  - Mitalistit (voittaja, hopea, pronssi) otetaan saman sivuston omista
 *    mitalitaulukoista (mmtilasto, emtilasto, kansojenliiga), koska ne ovat
 *    rakenteisia; kisasivujen loppuottelurivit ovat vapaata tekstiä.
 *  - Lähteen virheitä (esim. V+T+H ≠ O sarjataulukossa) ei korjata hiljaa:
 *    taulukko merkitään tarkistettavaksi ja rivi nimetään raportissa.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { load, type CheerioAPI } from "cheerio";
import type { AnyNode, Element } from "domhandler";

import { legacyRedirects } from "../lib/redirects";
import type { KuvaRecord } from "./download-images";
import { decodeHtml } from "./lib/decode-html";
import { countInvisible, normalizeKeyed, stripInvisibleDeep } from "./lib/normalize-cell";
import { localImageName } from "./lib/image-names";
import { deriveAltFromFilename } from "./lib/derive-alt";

const RAW_DIR = join(process.cwd(), "data", "raw-html");
const NORMALIZED = join(process.cwd(), "data", "normalized");
const OUT_FILE = join(NORMALIZED, "arvokisat.json");
const REPORT_FILE = join(NORMALIZED, "arvokisat-report.json");
const DROPPED_FILE = join(NORMALIZED, "arvokisat-kuvat-dropped.json");
const INVENTORY = join(NORMALIZED, "kuvat.json");

// ─── Neutraali sisältömalli ──────────────────────────────────────────────────

export interface Span {
  text: string;
  bold?: boolean;
  italic?: boolean;
  href?: string;
}

export interface ImageRef {
  /** Paikallinen tiedostonimi `data/images/`-kansiossa. */
  file: string;
  alt: string;
  /** Mistä alt-teksti on peräisin — tarkistusta varten. */
  altSource: "kasin-kuvattu" | "kuvateksti" | "lahteen-alt" | "tiedostonimi";
  caption?: string;
}

export type Block =
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "paragraph"; spans: Span[]; listItem?: "bullet" }
  | { kind: "image"; image: ImageRef };

export interface Column {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "year" | "link";
}

export interface Taulukko {
  slug: string;
  title: string;
  category: "arvokisa" | "pelaaja";
  tiivistelma?: string;
  jarjestys?: number;
  columns: Column[];
  /** Jokaisella rivillä on arvo jokaiselle sarakkeelle (tyhjä = ""). */
  rows: Record<string, string>[];
  kuvat: ImageRef[];
  sourcePage: string;
  needsReview: boolean;
  reviewReasons: string[];
}

export interface Kisa {
  slug: string;
  title: string;
  kisatyyppi: "mm" | "em" | "kansojen-liiga" | "u21-em";
  vuosi: number;
  isantamaat: string[];
  alkuPvm?: string;
  loppuPvm?: string;
  voittaja?: string;
  hopea?: string;
  pronssi?: string;
  suomenSijoitus?: string;
  tiivistelma?: string;
  kuvaus: Block[];
  /** Viitatut taulukot (slugit) järjestyksessä. */
  tilastot: string[];
  kuvat: ImageRef[];
  sourcePage: string;
  needsReview: boolean;
  reviewReasons: string[];
  /** Mistä rakenteiset kentät on poimittu — tarkistusta varten. */
  kenttienLahteet: Record<string, string>;
}

export interface Seura {
  seura: string;
  alkuvuosi?: number;
  loppuvuosi?: number;
}

export interface Pelaaja {
  slug: string;
  name: string;
  tiivistelma?: string;
  syntymaaika?: string;
  pelipaikka?: "maalivahti" | "puolustaja" | "keskikentta" | "hyokkaaja";
  maaottelut?: number;
  maalit?: number;
  seurat: Seura[];
  kuvaus: Block[];
  tilastot: string[];
  kuvat: ImageRef[];
  sourcePage: string;
  muutSourcePages: string[];
  needsReview: boolean;
  reviewReasons: string[];
  kenttienLahteet: Record<string, string>;
}

export interface ArvokisatData {
  kisat: Kisa[];
  taulukot: Taulukko[];
  pelaajat: Pelaaja[];
}

interface DroppedImage {
  src: string;
  page: string;
  reason: string;
}

// ─── Koodaus ─────────────────────────────────────────────────────────────────

/**
 * `<meta charset>` ei ole luotettava (docs/migraatio-lahdehavainnot.md §0.1): osa sivuista
 * ilmoittaa us-asciin mutta on UTF-8:aa, osa windows-1252:ta. Tiukka UTF-8
 * ensin, muuten windows-1252 — toimii kaikille 197 tiedostolle.
 *
 * Toteutus: `decodeHtml` tiedostossa scripts/lib/decode-html.ts (yhteinen,
 * oikea windows-1252-taulukko).
 */

async function loadPage(file: string): Promise<CheerioAPI> {
  const html = decodeHtml(await readFile(join(RAW_DIR, file)))
    .normalize("NFC")
    // Rikkinäinen lähde (MM2026.htm): "<br" ilman ">":ää ennen seuraavaa tagia
    // nielaisee tagin attribuutiksi ja sotkee lihavoinnit. Korjataan "<br>":ksi.
    .replace(/<br(\s*)(?=<)/gi, "<br>$1");
  const $ = load(html);
  $("script, style, noscript").remove();
  return $;
}

// ─── DOM → merkkivirta ───────────────────────────────────────────────────────

type Tok =
  | { t: "text"; text: string; bold: boolean; italic: boolean; href?: string }
  | { t: "br" }
  | { t: "break" }
  | { t: "img"; src: string; alt: string }
  | { t: "table"; el: Element }
  | { t: "li" };

const BLOCK_TAGS = new Set([
  "p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ul", "ol",
  "blockquote", "center", "hr", "tr", "dl", "dt", "dd", "pre",
]);
const BOLD_TAGS = new Set(["b", "strong", "h1", "h2", "h3", "h4", "h5", "h6", "th"]);
const ITALIC_TAGS = new Set(["i", "em"]);

/** Lihavointi periytyy kuten selaimessa: tagi tai inline-tyyli, tyyli voittaa. */
function boldFromStyle(style: string | undefined): boolean | undefined {
  if (!style) return undefined;
  const m = /font-weight\s*:\s*([a-z0-9]+)/i.exec(style);
  if (!m) return undefined;
  const v = m[1].toLowerCase();
  if (v === "bold" || v === "bolder" || /^[6-9]00$/.test(v)) return true;
  if (v === "normal" || v === "lighter" || /^[1-5]00$/.test(v)) return false;
  return undefined;
}

function tokenize($: CheerioAPI, root: AnyNode): Tok[] {
  const out: Tok[] = [];
  const walk = (node: AnyNode, bold: boolean, italic: boolean, href?: string) => {
    if (node.type === "text") {
      // Vain tavallinen tyhjä tiivistetään; &nbsp; säilyy kuvatekstien
      // erotinten tunnistusta varten ja muunnetaan välilyönniksi myöhemmin.
      const text = (node as unknown as { data: string }).data.replace(/[ \t\r\n]+/g, " ");
      if (text) out.push({ t: "text", text, bold, italic, href });
      return;
    }
    if (node.type !== "tag") return;
    const el = node as Element;
    const tag = el.name.toLowerCase();
    if (tag === "br") {
      out.push({ t: "br" });
      return;
    }
    if (tag === "img") {
      const src = $(el).attr("src")?.trim();
      if (src) out.push({ t: "img", src, alt: ($(el).attr("alt") ?? "").trim() });
      return;
    }
    if (tag === "table") {
      out.push({ t: "break" }, { t: "table", el }, { t: "break" });
      return;
    }
    // Otsikkoelementti lihavoi vain, jos se on otsikon mittainen. MM2026.htm:ssä
    // koko sivu on yhden sulkemattoman <h2>:n sisällä — muuten kaikki olisi "otsikkoa".
    const isHeadingTag = /^h[1-6]$/.test(tag);
    let b = BOLD_TAGS.has(tag) && !(isHeadingTag && $(el).text().length > 200) ? true : bold;
    const styled = boldFromStyle($(el).attr("style"));
    if (styled !== undefined) b = styled;
    const i = ITALIC_TAGS.has(tag) ? true : italic;
    const h = tag === "a" ? ($(el).attr("href")?.trim() ?? href) : href;
    const isBlock = BLOCK_TAGS.has(tag);
    if (isBlock) out.push({ t: "break" });
    if (tag === "li") out.push({ t: "li" });
    for (const child of el.children) walk(child, b, i, h);
    if (isBlock) out.push({ t: "break" });
  };
  const body = root as Element;
  for (const child of body.children ?? []) walk(child, false, false);
  return out;
}

// ─── Merkkivirta → rivit ─────────────────────────────────────────────────────

interface Run {
  text: string;
  bold: boolean;
  italic: boolean;
  href?: string;
}

type Entry =
  | { e: "line"; runs: Run[]; paraStart: boolean; listItem?: boolean }
  | { e: "img"; src: string; alt: string }
  | { e: "table"; el: Element };

const NBSP = / /g;

function lineText(runs: Run[]): string {
  return runs.map((r) => r.text).join("").replace(NBSP, " ").replace(/ +/g, " ").trim();
}

/** Yhdistää vierekkäiset samanmerkintäiset palat ja siistii reunat. */
function tidyRuns(runs: Run[]): Run[] {
  const merged: Run[] = [];
  for (const r of runs) {
    const last = merged[merged.length - 1];
    if (last && last.bold === r.bold && last.italic === r.italic && last.href === r.href) {
      last.text += r.text;
    } else {
      merged.push({ ...r });
    }
  }
  // Tyhjä teksti ei voi olla lihavoitu tai linkki: pelkkä väli ei kanna merkintää.
  for (const r of merged) {
    if (!r.text.replace(NBSP, " ").trim()) {
      r.bold = false;
      r.italic = false;
      r.href = undefined;
    }
  }
  if (merged.length) {
    merged[0].text = merged[0].text.replace(/^[\s ]+/, "");
    const last = merged[merged.length - 1];
    last.text = last.text.replace(/[\s ]+$/, "");
  }
  return merged.filter((r) => r.text.length > 0);
}

function toEntries(toks: Tok[]): Entry[] {
  const out: Entry[] = [];
  let runs: Run[] = [];
  let paraStart = true;
  let pendingLi = false;
  const endLine = (paraBreakAfter: boolean) => {
    const tidy = tidyRuns(runs);
    runs = [];
    if (lineText(tidy)) {
      out.push({ e: "line", runs: tidy, paraStart, ...(pendingLi ? { listItem: true } : {}) });
      pendingLi = false;
      paraStart = paraBreakAfter;
    } else {
      // Tyhjä rivi (esim. <br><br>) päättää kappaleen.
      paraStart = true;
    }
  };
  for (const tok of toks) {
    if (tok.t === "text") {
      runs.push({ text: tok.text, bold: tok.bold, italic: tok.italic, href: tok.href });
    } else if (tok.t === "li") {
      endLine(true);
      pendingLi = true;
    } else if (tok.t === "br") {
      endLine(false);
    } else if (tok.t === "break") {
      endLine(true);
      paraStart = true;
    } else if (tok.t === "img") {
      endLine(true);
      out.push({ e: "img", src: tok.src, alt: tok.alt });
      paraStart = true;
    } else {
      endLine(true);
      out.push({ e: "table", el: tok.el });
      paraStart = true;
    }
  }
  endLine(true);
  return mergeSplitHeadings(out);
}

/**
 * FrontPage katkaisee otsikoita <br>:llä: "Lohko<br>B", "Toinen<br>kierros".
 * Yhdistetään nimetyt tapaukset — ei yleistä sääntöä, koska se liimaisi
 * vääriäkin rivejä yhteen.
 */
function mergeSplitHeadings(entries: Entry[]): Entry[] {
  const out: Entry[] = [];
  for (let i = 0; i < entries.length; i++) {
    const cur = entries[i];
    const next = entries[i + 1];
    if (cur.e === "line" && next?.e === "line") {
      const a = lineText(cur.runs);
      const b = lineText(next.runs);
      if ((/^Lohko$/i.test(a) && /^[A-L]$/.test(b)) || (/^Toinen$/i.test(a) && /^kierros$/i.test(b))) {
        out.push({
          e: "line",
          runs: [{ text: `${a} ${b}`, bold: cur.runs.every((r) => r.bold), italic: false }],
          paraStart: cur.paraStart,
        });
        i += 1;
        continue;
      }
    }
    out.push(cur);
  }
  return out;
}

// ─── Linkit ──────────────────────────────────────────────────────────────────

const REDIRECTS = new Map(
  legacyRedirects.map((r) => [r.source.toLowerCase(), r.destination]),
);

const linkNotes: string[] = [];

/** Vanhat sisäiset .htm-linkit uusiksi poluiksi `lib/redirects.ts`:n kautta. */
function resolveHref(href: string | undefined, page: string): string | undefined {
  if (!href) return undefined;
  const h = href.trim();
  if (/^mailto:|^tel:/i.test(h)) return h;
  const own = /^https?:\/\/(?:www\.)?lahdensuomalainenklubi\.com\/?(.*)$/i.exec(h);
  const path = own ? own[1] : /^https?:\/\//i.test(h) ? null : h.replace(/^\.?\//, "");
  if (path === null) return h; // ulkoinen linkki
  if (path === "") return "/";
  const target = REDIRECTS.get(`/${path.split("#")[0]}`.toLowerCase());
  if (target) return target;
  linkNotes.push(`${page}: sisäiselle linkille "${h}" ei löytynyt ohjausta — linkki poistettu`);
  return undefined;
}

// ─── Kuvat ───────────────────────────────────────────────────────────────────

/**
 * Käsin kirjoitetut alt-tekstit kuville, joilla lähteessä ei ole kuvatekstiä
 * eikä kuvaavaa alt-attribuuttia. Kirjoitettu kuva katsottuna; päivämäärä ja
 * paikka tiedostonimestä tai lähteen "Kuva pp.kk.vvvv …" -merkinnästä.
 * Henkilöt nimetty vain, kun tiedostonimi tai lähdeteksti nimeää heidät.
 */
const ALT_KASIN: Record<string, string> = {
  "KerberosLittiSale.jpg":
    "Kerberos-pilapiirros: laastareihin kääritty numeron 10 pelaaja, Jari Litmanen, juoksee kohti Suomen lippua kantavaa miestä",
  "litmanen071110.jpg":
    "Kerberos-pilapiirros: laastareihin kääritty numeron 10 pelaaja, Jari Litmanen, juoksee kohti Suomen lippua kantavaa miestä",
  "KerberosLitti.jpg":
    "Kerberos-pilapiirros: Jari Litmanen juoksee patsaansa ohi kohti FC Lahti -kylttiä, puhekuplassa ”Eipä ole aikaa patsastella”",
  "LitmanenPatsasPoissa120516.jpg":
    "Litmasen patsaan paikka Lahden Kisapuistossa ilman patsasta 16.05.2012, kun patsas oli irrotettu jalustan vaihtoa varten",
  "LitmanenSeura120927.jpg":
    "Seura-lehden kansi 27.09.2012: hymyilevä Jari Litmanen ja otsikko ”Osaan nauraa itselleni”",
  "litmanen071117.jpg":
    "Jari Litmanen Suomen maajoukkueen sinisessä verryttelyasussa numerolla 10 pallon kanssa, 17.11.2007",
  "litmanen080602B.jpg":
    "Jari Litmanen Suomen valkoisessa maajoukkuepaidassa numerolla 10 pallon kanssa, Veritas Stadion Turku 02.06.2008",
  "litmanen080602D.jpg":
    "Jari Litmanen pomputtelee palloa Suomen valkoisessa maajoukkuepaidassa numerolla 10, 02.06.2008",
  "litmanen090419finnairstadium.JPG":
    "Jari Litmanen FC Lahden viininpunaisessa pelipaidassa Finnair Stadiumilla 19.04.2009",
  "hodgson070520.jpg": "Roy Hodgson tummassa pikkutakissa, 20.05.2007",
  "120908JariLitmanenRonalddeBoer.jpg":
    "Jari Litmanen ja Ronald de Boer Respect-ottelussa Olympiastadionilla 8.9.2012",
  "LitmanenPatsas110423pikisetkasvot.jpg":
    "Jari Litmasen patsas, jonka kasvot on tahrittu tahmealla aineella, 23.04.2011",
  "LitmanenPatsas110423halkeama.jpg":
    "Jari Litmasen patsaan haljennut ja palon mustaama jalusta, 23.04.2011",
};

let inventory = new Map<string, KuvaRecord>();
const dropped: DroppedImage[] = [];

function letters(s: string): number {
  return s.replace(/[^a-zA-ZåäöÅÄÖéü]/g, "").length;
}

/** Alt-attribuutti on "ihmisen kirjoittama", jos siinä on välilyönti eikä se ole tiedostonimi. */
function isHumanAlt(alt: string, file: string): boolean {
  const a = alt.trim();
  if (a.length < 8 || !/\s/.test(a)) return false;
  const fold = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return fold(a) !== fold(file.replace(/\.[a-z]+$/i, ""));
}

function imageRef(src: string, alt: string, page: string, caption?: string): ImageRef | null {
  const file = localImageName(src);
  if (/^https?:\/\/upload\.wikimedia\.org\//i.test(src)) {
    dropped.push({
      src,
      page,
      reason:
        "Wikimedian lippukuva taulukon solussa: koristegrafiikkaa, ei inventaariossa; maan nimi säilyy solun tekstinä",
    });
    return null;
  }
  const record = inventory.get(file);
  if (!record || !record.ok) {
    dropped.push({
      src,
      page,
      reason: record ? `lataus epäonnistui (HTTP ${record.status})` : "ei kuvainventaariossa",
    });
    return null;
  }
  const cap = caption?.replace(NBSP, " ").replace(/\s+/g, " ").trim() || undefined;
  let resolved: string;
  let altSource: ImageRef["altSource"];
  if (ALT_KASIN[file]) {
    resolved = ALT_KASIN[file];
    altSource = "kasin-kuvattu";
  } else if (cap && letters(cap) >= 8) {
    resolved = cap;
    altSource = "kuvateksti";
  } else if (isHumanAlt(alt, file)) {
    resolved = alt;
    altSource = "lahteen-alt";
  } else {
    resolved = deriveAltFromFilename(file) ?? "";
    altSource = "tiedostonimi";
  }
  return {
    file,
    alt: resolved.slice(0, 200),
    altSource,
    ...(cap ? { caption: cap } : {}),
  };
}

// ─── Rivit → neutraalit lohkot ───────────────────────────────────────────────

const DATE_ANY = /\b\d{1,2}\.\d{1,2}\.\d{4}\b/;

function isAllBold(runs: Run[]): boolean {
  const withText = runs.filter((r) => r.text.replace(NBSP, " ").trim());
  return withText.length > 0 && withText.every((r) => r.bold);
}

function runsToSpans(runs: Run[], page: string): Span[] {
  return runs.map((r) => {
    const href = r.href ? resolveHref(r.href, page) : undefined;
    return {
      text: r.text.replace(NBSP, " "),
      ...(r.bold ? { bold: true } : {}),
      ...(r.italic ? { italic: true } : {}),
      ...(href ? { href } : {}),
    };
  });
}

interface BlockOptions {
  page: string;
  /** Palauttaa otsikkotason tai null, jos rivi ei ole otsikko. */
  headingLevel: (text: string, runs: Run[]) => 2 | 3 | null;
  /** Rivit, jotka pudotetaan (navigaatio, jo rakenteiseksi poimitut). */
  skipLine?: (text: string, runs: Run[]) => boolean;
  /** Kuvat, jotka ohitetaan (esim. siirretty `kuvat`-kenttään). */
  skipImage?: (file: string) => boolean;
  /** Lohkot liitetään osaksi isompaa kokonaisuutta, jonka h2:t tulevat muualta. */
  nested?: boolean;
}

/**
 * Muuntaa rivit lohkoiksi. Kappale = <p> tai <br><br>; yksittäinen <br> on
 * pehmeä rivinvaihto ("\n" samassa lohkossa), kuten vanhalla sivulla.
 * Kuvan jälkeinen lyhyt päivätty rivi tulkitaan kuvatekstiksi.
 */
function toBlocks(entries: Entry[], opts: BlockOptions): Block[] {
  const blocks: Block[] = [];
  let para: Span[] | null = null;
  const flush = () => {
    if (para && para.some((s) => s.text.trim())) {
      // Siistitään rivinvaihtojen ympäriltä ylimääräiset välit.
      for (const s of para) s.text = s.text.replace(/ *\n */g, "\n");
      blocks.push({ kind: "paragraph", spans: mergeSpans(para) });
    }
    para = null;
  };

  for (let i = 0; i < entries.length; i++) {
    const en = entries[i];
    if (en.e === "table") continue;

    if (en.e === "img") {
      flush();
      // Kerätään peräkkäiset kuvat ryhmäksi ja katsotaan, seuraako kuvateksti.
      const group: { src: string; alt: string }[] = [{ src: en.src, alt: en.alt }];
      while (entries[i + 1]?.e === "img") {
        const n = entries[i + 1] as { e: "img"; src: string; alt: string };
        group.push({ src: n.src, alt: n.alt });
        i += 1;
      }
      let captions: (string | undefined)[] = group.map(() => undefined);
      const next = entries[i + 1];
      if (next?.e === "line") {
        const raw = next.runs.map((r) => r.text).join("");
        const text = lineText(next.runs);
        const heading = opts.headingLevel(text, next.runs);
        if (!heading && text.length <= 200 && (DATE_ANY.test(text) || /^kuva\b/i.test(text))) {
          const parts = raw
            .split(/[  ]{3,}/)
            .map((p) => p.replace(NBSP, " ").trim())
            .filter(Boolean);
          captions = assignCaptions(group, parts, text);
          i += 1;
        }
      }
      group.forEach((g, idx) => {
        const file = localImageName(g.src);
        if (opts.skipImage?.(file)) return;
        const ref = imageRef(g.src, g.alt, opts.page, captions[idx]);
        if (ref) blocks.push({ kind: "image", image: ref });
      });
      continue;
    }

    const text = lineText(en.runs);
    if (opts.skipLine?.(text, en.runs)) continue;

    const level = opts.headingLevel(text, en.runs);
    if (level) {
      flush();
      blocks.push({ kind: "heading", level, text });
      continue;
    }

    // "<b>Otsikko</b>Leipäteksti…" samalla rivillä → otsikko + kappale.
    const first = en.runs[0];
    const firstText = first ? first.text.replace(NBSP, " ").trim() : "";
    const rest = en.runs.slice(1);
    if (
      first?.bold &&
      firstText.length >= 8 &&
      firstText.length <= 200 &&
      !/[.,:;]$/.test(firstText) &&
      lineText(rest).length >= 40 &&
      !rest.some((r) => r.bold && r.text.trim().length > 20)
    ) {
      flush();
      blocks.push({ kind: "heading", level: opts.headingLevel(firstText, [first]) ?? 3, text: firstText });
      para = runsToSpans(tidyRuns(rest), opts.page);
      continue;
    }

    const spans = runsToSpans(en.runs, opts.page);
    if (en.listItem) {
      flush();
      blocks.push({ kind: "paragraph", spans: mergeSpans(spans), listItem: "bullet" });
      continue;
    }
    // Pitkät proosarivit ovat kappaleita, vaikka ne on erotettu yhdellä <br>:llä.
    const prevLen = para ? para.map((s) => s.text).join("").split("\n").pop()!.length : 0;
    if (en.paraStart || !para || text.length > 150 || prevLen > 150) {
      flush();
      para = spans;
    } else {
      para.push({ text: "\n" }, ...spans);
    }
  }
  flush();
  // Lyhyt yksittäinen rivi juuri ennen luetteloa on luettelon otsikko ("USA" → stadionit).
  blocks.forEach((b, i) => {
    const next = blocks[i + 1];
    if (b.kind !== "paragraph" || b.listItem || next?.kind !== "paragraph" || !next.listItem) return;
    const text = b.spans.map((s) => s.text).join("").trim();
    if (text.length <= 40 && !text.includes("\n")) blocks[i] = { kind: "heading", level: 3, text };
  });
  const out = dropEmptyHeadings(blocks);
  // Otsikkohierarkia ei saa hypätä sivun h1:stä suoraan h3:een: ensimmäistä
  // h2:ta edeltävät h3:t nostetaan h2:ksi.
  for (const b of opts.nested ? [] : out) {
    if (b.kind !== "heading") continue;
    if (b.level === 2) break;
    b.level = 2;
  }
  return out;
}

/**
 * Kuvateksti kuvaryhmälle. Jos rivi jakautuu leveillä väleillä useaan osaan
 * ("Patsas 10.10.2010 [väli] 50 vuotta 20.02.2021"), osat kuuluvat ryhmän
 * viimeisille kuville. Yksi yhteinen teksti kuuluu ryhmän lopun kuville, joilla
 * ei ole omaa alt-tekstiä — muuten esim. "Kerberos"-piirros saisi viereisen
 * patsaskuvan tekstin.
 */
function assignCaptions(
  group: { src: string; alt: string }[],
  parts: string[],
  whole: string,
): (string | undefined)[] {
  const out: (string | undefined)[] = group.map(() => undefined);
  if (parts.length > 1 && parts.length <= group.length) {
    const offset = group.length - parts.length;
    parts.forEach((p, i) => (out[offset + i] = p));
    return out;
  }
  let i = group.length - 1;
  out[i] = whole;
  while (i > 0 && !group[i].alt && !group[i - 1].alt) {
    i -= 1;
    out[i] = whole;
  }
  return out;
}

/**
 * Otsikko, jonka alla ei ole sisältöä, poistetaan (esim. "Lohko A", jonka
 * ainoa sisältö oli taulukko — taulukko on oma dokumenttinsa). Muut kuin
 * lohko-otsikot säilytetään tekstinä, jotta lähteen sanat eivät katoa.
 */
function dropEmptyHeadings(blocks: Block[]): Block[] {
  const out: Block[] = [];
  blocks.forEach((b, i) => {
    if (b.kind !== "heading") {
      out.push(b);
      return;
    }
    const next = blocks[i + 1];
    const empty = !next || (next.kind === "heading" && next.level <= b.level);
    if (!empty) out.push(b);
    else if (!/^Lohko\s*[A-L]$/i.test(b.text)) out.push({ kind: "paragraph", spans: [{ text: b.text }] });
  });
  return out;
}

function mergeSpans(spans: Span[]): Span[] {
  const out: Span[] = [];
  for (const s of spans) {
    const last = out[out.length - 1];
    if (last && !!last.bold === !!s.bold && !!last.italic === !!s.italic && last.href === s.href) {
      last.text += s.text;
    } else {
      out.push({ ...s });
    }
  }
  // Pelkkä rivinvaihto ei ole lihavoitu: yhdistetään naapuriin.
  return out.filter((s) => s.text.length > 0);
}

// ─── Taulukot ────────────────────────────────────────────────────────────────

/**
 * Lukee taulukon solut ruudukoksi. colspan/rowspan puretaan eksplisiittisesti
 * (docs/12 §2.1.4). Solun sisällä lippukuvat erottavat maannimiä, joten
 * kuvan kohdalla teksti katkaistaan ja osat liitetään " / ":lla
 * ("Japani [lippu] Etelä-Korea" → "Japani / Etelä-Korea").
 */
function readTable($: CheerioAPI, table: Element, page: string): string[][] {
  const grid: string[][] = [];
  const trs = $(table)
    .find("tr")
    .filter((_, tr) => $(tr).closest("table")[0] === table)
    .toArray();
  trs.forEach((tr, r) => {
    grid[r] ??= [];
    let c = 0;
    for (const td of $(tr).children("td, th").toArray()) {
      while (grid[r][c] !== undefined) c += 1;
      const segments: string[] = [""];
      const walk = (node: AnyNode) => {
        if (node.type === "text") {
          segments[segments.length - 1] += (node as unknown as { data: string }).data;
        } else if (node.type === "tag") {
          const el = node as Element;
          if (el.name === "img") {
            const src = $(el).attr("src")?.trim();
            if (src) imageRef(src, $(el).attr("alt") ?? "", page); // kirjaa pudotuksen
            segments.push("");
          } else if (el.name === "br") {
            segments[segments.length - 1] += " ";
          } else {
            for (const ch of el.children) walk(ch);
          }
        }
      };
      for (const ch of (td as Element).children) walk(ch);
      const text = segments
        .map((s) => s.replace(NBSP, " ").replace(/\s+/g, " ").trim())
        .map((s) => s.replace(/^\/\s*|\s*\/$/g, "").trim())
        .filter(Boolean)
        .join(" / ");
      const colspan = Math.max(1, Number($(td).attr("colspan") ?? 1) || 1);
      const rowspan = Math.max(1, Number($(td).attr("rowspan") ?? 1) || 1);
      for (let dr = 0; dr < rowspan; dr++) {
        grid[r + dr] ??= [];
        for (let dc = 0; dc < colspan; dc++) grid[r + dr][c + dc] = text;
      }
      c += colspan;
    }
  });
  return grid.map((row) => Array.from(row, (v) => v ?? ""));
}

const LOHKO_COLUMNS: Column[] = [
  { key: "sija", label: "Sija", type: "number" },
  { key: "joukkue", label: "Joukkue", type: "text" },
  { key: "ottelut", label: "O", type: "number" },
  { key: "voitot", label: "V", type: "number" },
  { key: "tasapelit", label: "T", type: "number" },
  { key: "haviot", label: "H", type: "number" },
  { key: "maalit", label: "Maalit", type: "text" },
  { key: "pisteet", label: "P", type: "number" },
];

/**
 * Sarjataulukon rivi: "1. Uruguay | 3 | 2 | 1 | 0 | 4 | - | 0 | 7".
 * Sarake "-" on tehty- ja päästettyjen maalien erotin → yhdistetään
 * "Maalit"-sarakkeeksi "4-0" (migraatio-lahdehavainnot M2/M4). Sija luetaan joukkueen
 * edestä; jos se puuttuu (EM2008), sija on rivin järjestysnumero.
 */
function lohkoRow(cells: string[], index: number): Record<string, string> | null {
  const c = cells.map((s) => s.trim());
  if (c.length < 9 || !c[0]) return null;
  const m = /^(\d+)\.\s*(.+)$/.exec(c[0]);
  return {
    sija: m ? m[1] : String(index + 1),
    joukkue: m ? m[2].trim() : c[0],
    ottelut: c[1],
    voitot: c[2],
    tasapelit: c[3],
    haviot: c[4],
    maalit: `${c[5]}-${c[7]}`,
    pisteet: c[8],
  };
}

/** Lähteen omat laskuvirheet näkyviin, ei korjata. */
function checkLohko(rows: Record<string, string>[]): string[] {
  const reasons: string[] = [];
  for (const r of rows) {
    const [o, v, t, h, p] = [r.ottelut, r.voitot, r.tasapelit, r.haviot, r.pisteet].map(Number);
    if ([o, v, t, h, p].some((n) => !Number.isFinite(n))) {
      reasons.push(`${r.joukkue}: ei-numeerinen arvo`);
      continue;
    }
    if (v + t + h !== o) reasons.push(`lähteen virhe? ${r.joukkue}: V+T+H = ${v + t + h} ≠ O = ${o}`);
    if (3 * v + t !== p) reasons.push(`lähteen virhe? ${r.joukkue}: 3V+T = ${3 * v + t} ≠ P = ${p}`);
  }
  return reasons;
}

// ─── Mitalitaulukot (mmtilasto, emtilasto, kansojenliiga) ────────────────────

interface Mitalirivi {
  vuosi: string;
  isantamaa: string;
  mestari: string;
  hopea: string;
  pronssi: string;
}

async function parseMitalitaulukko(
  file: string,
  slug: string,
  title: string,
  kisaNimi: string,
): Promise<{ taulukko: Taulukko; rivit: Mitalirivi[]; $: CheerioAPI }> {
  const $ = await loadPage(file);
  const table = $("table").first()[0] as Element;
  const grid = readTable($, table, file);
  const reasons: string[] = [];

  // Otsikkorivi(t): yksi koko levyinen solu (esim. "Jalkapallon Euroopan Mestarit 1960-2024").
  let start = 0;
  while (start < grid.length && new Set(grid[start].filter(Boolean)).size <= 1 && !/^\d{4}$/.test(grid[start][0])) {
    start += 1;
  }
  const header = grid[start - 1] && /vuosi/i.test(grid[start - 1][0]) ? grid[start - 1] : grid[start];
  if (!/vuosi/i.test(header[0] ?? "")) reasons.push("sarakeotsikkoriviä ei tunnistettu");
  const dataStart = /vuosi/i.test(grid[start]?.[0] ?? "") ? start + 1 : start;

  const keys = ["vuosi", "isantamaa", "mestari", "hopea", "pronssi"];
  const columns: Column[] = header.slice(0, keys.length).map((label, i) => ({
    key: keys[i],
    label: label || keys[i],
    type: i === 0 ? "year" : "text",
  }));

  const rows: Record<string, string>[] = [];
  const rivit: Mitalirivi[] = [];
  for (const cells of grid.slice(dataStart)) {
    if (!cells.some(Boolean)) continue;
    if (!/^\d{4}$/.test(cells[0])) {
      reasons.push(`rivi ohitettu (ei vuotta): ${cells.join(" | ")}`);
      continue;
    }
    const row: Record<string, string> = {};
    columns.forEach((col, i) => (row[col.key] = cells[i] ?? ""));
    rows.push(row);
    rivit.push({
      vuosi: row.vuosi,
      isantamaa: row.isantamaa ?? "",
      mestari: row.mestari ?? "",
      hopea: row.hopea ?? "",
      pronssi: row.pronssi ?? "",
    });
  }
  if (new Set(grid.slice(dataStart).filter((r) => r.some(Boolean)).map((r) => r.length)).size > 1) {
    reasons.push("lähdetaulukon rivien solumäärä vaihtelee");
  }

  const pelatut = rivit.filter((r) => r.mestari);
  const tiivistelma = pelatut.length
    ? `${kisaNimi}: isäntämaat ja mitalistit vuosilta ${pelatut[0].vuosi}–${pelatut[pelatut.length - 1].vuosi} (${pelatut.length} ratkaistua kisaa).`
    : undefined;

  return {
    taulukko: {
      slug,
      title,
      category: "arvokisa",
      tiivistelma,
      columns,
      rows,
      kuvat: [],
      sourcePage: file,
      needsReview: reasons.length > 0,
      reviewReasons: reasons,
    },
    rivit,
    $,
  };
}

// ─── Kisasivut (MM20*, EM20*) ────────────────────────────────────────────────

/** "11.06.-11.07.2010", "07.06-29.06.2008", "15.6.-29.6.2009" */
const DATE_RANGE =
  /(\d{1,2})\.(\d{1,2})\.?(\d{4})?\s*[-–]\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/;

function iso(d: string | number, m: string | number, y: string | number): string | undefined {
  const dd = String(d).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const date = new Date(`${y}-${mm}-${dd}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.getUTCDate() !== Number(d)) return undefined;
  return `${y}-${mm}-${dd}`;
}

function splitHosts(text: string): string[] {
  return text
    .split(/\s*,\s*|\s+ja\s+|\s*\/\s*/)
    .map((s) => s.replace(/[.:]+$/, "").trim())
    .filter((s) => s.length > 1);
}

/** Kisasivun väliotsikot: lohkot ja jatkopelivaiheet h2, päivämäärärivit h3. */
const KISA_H2 =
  /^(Lohko\s*[A-L]:?$|Toinen kierros|Neljännesvälierät|Puolivälierät|Välierät|Pronssiottelu|Loppuottelu|Finaali|Pudotuspelit|LOHKOVAIHE|PUDOTUSPELIT|Maalintekijät|Stadionit|EM-lopputurnau)/i;

function kisaHeading(text: string, runs: Run[]): 2 | 3 | null {
  if (!isAllBold(runs) || text.length > 200 || !/[A-Za-zÅÄÖåäö0-9]/.test(text)) return null;
  return KISA_H2.test(text) ? 2 : 3;
}

interface KisaSpec {
  file: string;
  kisatyyppi: "mm" | "em";
  vuosi: number;
}

async function parseKisa(
  spec: KisaSpec,
  mitalit: Map<string, Mitalirivi>,
  taulukot: Taulukko[],
): Promise<Kisa> {
  const { file, kisatyyppi, vuosi } = spec;
  const $ = await loadPage(file);
  const entries = toEntries(tokenize($, $("body")[0]));
  const lyhenne = kisatyyppi === "mm" ? "MM" : "EM";
  const slug = `${kisatyyppi}-${vuosi}`;
  const title = `${lyhenne}-kisat ${vuosi}`;
  const reasons: string[] = [];
  const lahteet: Record<string, string> = {};

  // Otsikko-osa: sivun alun rivit ennen ensimmäistä lohkoa / taulukkoa / päiväriviä.
  const STOP = /^(Lohko|Stadionit|EM-lopputurnauksen|\d{1,2}\.\d{1,2}\.\d{4}$)/i;
  const headerIdx: number[] = [];
  for (let i = 0; i < entries.length && headerIdx.length < 3; i++) {
    const en = entries[i];
    if (en.e !== "line") break;
    const text = lineText(en.runs);
    if (STOP.test(text)) break;
    headerIdx.push(i);
  }
  const headerText = headerIdx
    .map((i) => lineText((entries[i] as { runs: Run[] }).runs))
    .join(" ");

  // Päivät
  let alkuPvm: string | undefined;
  let loppuPvm: string | undefined;
  const range = DATE_RANGE.exec(headerText);
  if (range) {
    const [, d1, m1, y1, d2, m2, y2] = range;
    alkuPvm = iso(d1, m1, y1 ?? y2);
    loppuPvm = iso(d2, m2, y2);
    lahteet.alkuPvm = lahteet.loppuPvm = `otsikkorivi "${range[0]}"`;
  } else {
    // MM2026: ei aikaväliä otsikossa → ensimmäinen ja viimeinen ottelupäivä.
    const dates = entries
      .filter((e): e is Extract<Entry, { e: "line" }> => e.e === "line")
      .map((e) => /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(lineText(e.runs)))
      .filter((m): m is RegExpExecArray => m !== null)
      .map((m) => iso(m[1], m[2], m[3]))
      .filter((d): d is string => Boolean(d))
      .sort();
    if (dates.length) {
      alkuPvm = dates[0];
      loppuPvm = dates[dates.length - 1];
      lahteet.alkuPvm = lahteet.loppuPvm = "ensimmäinen ja viimeinen ottelupäivärivi (otsikossa ei aikaväliä)";
    } else {
      reasons.push("kisan päivämääriä ei löytynyt");
    }
  }

  // Isäntämaat: otsikosta "MM-kilpailut Etelä-Afrikka", muuten mitalitaulukosta.
  // EM 2020 pelattiin 2021, ja emtilasto merkitsee sen vuodelle 2021.
  const mitali = mitalit.get(String(vuosi)) ?? (kisatyyppi === "em" && vuosi === 2020 ? mitalit.get("2021") : undefined);
  const hostMatch = /(?:MM|EM)-kilpailut:?\s*(.+)$/.exec(headerText);
  let isantamaat = hostMatch ? splitHosts(hostMatch[1]) : [];
  if (isantamaat.length) {
    lahteet.isantamaat = "kisasivun otsikkorivi";
  } else if (mitali?.isantamaa) {
    isantamaat = splitHosts(mitali.isantamaa);
    lahteet.isantamaat = `${kisatyyppi}tilasto.htm, vuosi ${mitali.vuosi}`;
  } else {
    reasons.push("isäntämaata ei löytynyt");
  }
  if (mitali?.isantamaa && hostMatch) {
    const a = [...splitHosts(mitali.isantamaa)].sort().join(",");
    const b = [...isantamaat].sort().join(",");
    if (a !== b) lahteet.isantamaatHuom = `mitalitaulukossa "${mitali.isantamaa}", kisasivulla "${isantamaat.join(", ")}" — kisasivu käytetty`;
  }

  // Mitalistit
  const voittaja = mitali?.mestari || undefined;
  const hopea = mitali?.hopea || undefined;
  const pronssi = mitali?.pronssi || undefined;
  if (mitali) {
    lahteet.mitalit = `${kisatyyppi}tilasto.htm, vuosi ${mitali.vuosi}`;
  } else {
    reasons.push("kisaa ei löytynyt mitalitaulukosta");
  }

  // Lohkotaulukot
  const tilastot: string[] = [];
  const kaikkiJoukkueet: { joukkue: string; lohko: string; sija: string }[] = [];
  let lastLohko: string | null = null;
  let tableNo = 0;
  for (const en of entries) {
    if (en.e === "line") {
      const m = /^Lohko\s*([A-L])\b/i.exec(lineText(en.runs));
      if (m) lastLohko = m[1].toUpperCase();
      continue;
    }
    if (en.e !== "table") continue;
    const grid = readTable($, en.el, file);
    // EM2008: kaikki lohkot yhdessä taulukossa "Lohko A" -väliriveillä.
    const groups: { lohko: string | null; rows: string[][] }[] = [];
    let cur: { lohko: string | null; rows: string[][] } = { lohko: lastLohko, rows: [] };
    for (const row of grid) {
      const m = /^Lohko\s*([A-L])$/i.exec(row[0]?.trim() ?? "");
      if (m && row.slice(1).every((c) => !c.trim())) {
        if (cur.rows.length) groups.push(cur);
        cur = { lohko: m[1].toUpperCase(), rows: [] };
        continue;
      }
      if (row.some((c) => c.trim())) cur.rows.push(row);
    }
    if (cur.rows.length) groups.push(cur);

    for (const g of groups) {
      const lohko = g.lohko ?? String.fromCharCode(65 + tableNo);
      const tReasons: string[] = [];
      if (!g.lohko) tReasons.push(`lohkon kirjainta ei löytynyt — oletettu järjestyksestä: ${lohko}`);
      const rows = g.rows
        .map((cells, i) => lohkoRow(cells, i))
        .filter((r): r is Record<string, string> => r !== null);
      if (rows.length !== g.rows.length) tReasons.push(`${g.rows.length - rows.length} riviä ei jäsentynyt`);
      tReasons.push(...checkLohko(rows));
      for (const r of rows) kaikkiJoukkueet.push({ joukkue: r.joukkue, lohko, sija: r.sija });
      const tslug = `${slug}-lohko-${lohko.toLowerCase()}`;
      const voittajaRivi = rows.find((r) => r.sija === "1");
      taulukot.push({
        slug: tslug,
        title: `${title} – lohko ${lohko}`,
        category: "arvokisa",
        tiivistelma: voittajaRivi
          ? `${title}, lohko ${lohko}: ${rows.length} joukkuetta. Lohkon voitti ${voittajaRivi.joukkue} ${voittajaRivi.pisteet} pisteellä.`
          : undefined,
        jarjestys: tableNo,
        columns: LOHKO_COLUMNS,
        rows,
        kuvat: [],
        sourcePage: file,
        needsReview: tReasons.length > 0,
        reviewReasons: tReasons,
      });
      tilastot.push(tslug);
      tableNo += 1;
    }
    lastLohko = null;
  }

  // Suomen sijoitus: vain kun se on pääteltävissä lähteestä yksiselitteisesti.
  const pageText = entries
    .filter((e): e is Extract<Entry, { e: "line" }> => e.e === "line")
    .map((e) => lineText(e.runs))
    .join("\n");
  const suomi = kaikkiJoukkueet.find((j) => j.joukkue === "Suomi");
  let suomenSijoitus: string | undefined;
  if (suomi) {
    // Lohkovaiheessa jokainen joukkue pelaa 3 ottelua. Jos Suomi esiintyy
    // ottelurivien tekstissä enintään kolmesti, se ei pelannut jatkopeleissä.
    const suomiOttelut = (pageText.match(/\bSuomi\b/g) ?? []).length;
    if (suomiOttelut <= 3) {
      suomenSijoitus = `Lohkovaihe (lohko ${suomi.lohko}, ${suomi.sija}. sija)`;
      lahteet.suomenSijoitus = `lohkotaulukko; Suomi esiintyy vain ${suomiOttelut} lohko-ottelussa`;
    } else {
      reasons.push("Suomi mukana, mutta jatkopelisijoitusta ei voitu päätellä");
    }
  } else if (!/\bSuomi\b/.test(pageText)) {
    suomenSijoitus = "Ei selvinnyt lopputurnaukseen";
    lahteet.suomenSijoitus = kaikkiJoukkueet.length
      ? `Suomi ei ole yhdessäkään lohkotaulukossa (${kaikkiJoukkueet.length} joukkuetta)`
      : "Suomi ei esiinny yhdessäkään kisasivun ottelussa";
  }

  // Kaksi taittoa: (a) "Lohko A" → taulukko → lohkon ottelut, tai (b) kaikki
  // lohkotaulukot peräkkäin ja ottelut vasta niiden jälkeen (MM2018, EM2016 …).
  // Taitossa (b) viimeinen "Lohko H" -otsikko jäisi koko otteluohjelman
  // otsikoksi, joten lohko-otsikot jätetään pois — lohkon nimi on taulukossa.
  const PURE_LOHKO = /^Lohko\s*[A-L]$/i;
  const tableIdx = entries.flatMap((e, i) => (e.e === "table" ? [i] : []));
  const tablesFirst = tableIdx.slice(1).every((ti, k) =>
    entries
      .slice(tableIdx[k] + 1, ti)
      .every((e) => e.e === "line" && PURE_LOHKO.test(lineText(e.runs))),
  );

  // Kuvaus: kaikki muu teksti lähdejärjestyksessä, otsikko-osa ja taulukot pois.
  const body = entries.filter(
    (e, i) =>
      !headerIdx.includes(i) &&
      !(tablesFirst && e.e === "line" && PURE_LOHKO.test(lineText(e.runs))),
  );
  const kuvaus = toBlocks(body, { page: file, headingLevel: kisaHeading });

  // Tiivistelmä mitatuista faktoista — ei taivutusta, jotta maan nimi ei vääristy.
  const fmt = (d?: string) => (d ? `${Number(d.slice(8))}.${Number(d.slice(5, 7))}.${d.slice(0, 4)}` : "");
  const parts: string[] = [];
  const kisaNimi = `Jalkapallon ${lyhenne}-kilpailut ${vuosi}`;
  parts.push(alkuPvm && loppuPvm ? `${kisaNimi} pelattiin ${fmt(alkuPvm)}–${fmt(loppuPvm)}.` : `${kisaNimi}.`);
  if (isantamaat.length === 1) parts.push(`Isäntämaa: ${isantamaat[0]}.`);
  else if (isantamaat.length > 1 && isantamaat.length <= 3) parts.push(`Isäntämaat: ${isantamaat.join(", ")}.`);
  else if (isantamaat.length > 3) parts.push(`Isäntämaita oli ${isantamaat.length}.`);
  if (voittaja) {
    const medals = [`Mestari: ${voittaja}`, hopea && `hopea: ${hopea}`, pronssi && `pronssi: ${pronssi}`].filter(Boolean);
    parts.push(`${medals.join(", ")}.`);
  }
  if (suomenSijoitus) parts.push(`Suomi: ${suomenSijoitus.charAt(0).toLowerCase()}${suomenSijoitus.slice(1)}.`);

  return {
    slug,
    title,
    kisatyyppi,
    vuosi,
    isantamaat,
    alkuPvm,
    loppuPvm,
    voittaja,
    hopea,
    pronssi,
    suomenSijoitus,
    tiivistelma: parts.join(" ").slice(0, 300),
    kuvaus,
    tilastot,
    kuvat: [],
    sourcePage: file,
    needsReview: reasons.length > 0,
    reviewReasons: reasons,
    kenttienLahteet: lahteet,
  };
}

// ─── Kansojen liiga ──────────────────────────────────────────────────────────

/**
 * Yksi sivu kattaa kaikki kaudet: mitalitaulukko + lainatut finaaliuutiset.
 * Päätös (kirjattu raporttiin): yksi `arvokisa` per kausi, koska `vuosi` on
 * pakollinen ja jokaiselle kaudelle on taulukossa oma rivi. Uutinen liitetään
 * kauteen lähdemerkinnän vuoden perusteella ("(iltalehti.fi / 09.06.2025)").
 */
async function parseKansojenLiiga(taulukot: Taulukko[]): Promise<Kisa[]> {
  const file = "kansojenliiga.htm";
  const { taulukko, rivit, $ } = await parseMitalitaulukko(
    file,
    "kansojen-liigan-mitalistit",
    "Kansojen liigan isäntämaat ja mitalistit",
    "Kansojen liiga",
  );
  taulukot.push(taulukko);

  const entries = toEntries(tokenize($, $("body")[0]));
  const blocks = toBlocks(entries, {
    page: file,
    headingLevel: (text, runs) => (isAllBold(runs) && text.length <= 200 && !/^KANSOJEN LIIGA$/.test(text) ? 2 : null),
    skipLine: (text) => /^KANSOJEN LIIGA$/.test(text),
  });

  // Pilkotaan uutisiksi otsikoiden kohdalta.
  const articles: { blocks: Block[]; year?: string }[] = [];
  for (const b of blocks) {
    if (b.kind === "heading" || articles.length === 0) articles.push({ blocks: [] });
    articles[articles.length - 1].blocks.push(b);
  }
  for (const a of articles) {
    const text = a.blocks
      .map((b) => (b.kind === "paragraph" ? b.spans.map((s) => s.text).join("") : ""))
      .join(" ");
    const src = [...text.matchAll(/\(([^()]*?)(\d{1,2})\.(\d{1,2})\.(\d{4})\)/g)].pop();
    a.year = src?.[4];
  }

  const unassigned = articles.filter((a) => !a.year || !rivit.some((r) => r.vuosi === a.year));
  const kisat: Kisa[] = rivit.map((r) => {
    const vuosi = Number(r.vuosi);
    const own = articles.filter((a) => a.year === r.vuosi);
    const reasons: string[] = [];
    if (own.length === 0) reasons.push("kaudelle ei löytynyt uutista sivulta");
    const isantamaat = splitHosts(r.isantamaa);
    const medals = [r.mestari && `Mestari: ${r.mestari}`, r.hopea && `hopea: ${r.hopea}`, r.pronssi && `pronssi: ${r.pronssi}`].filter(Boolean);
    const tiivistelma = [
      `Jalkapallon Kansojen liiga ${vuosi}.`,
      isantamaat.length ? `Finaaliturnauksen isäntämaa: ${isantamaat.join(", ")}.` : "",
      medals.length ? `${medals.join(", ")}.` : "",
    ]
      .filter(Boolean)
      .join(" ");
    return {
      slug: `kansojen-liiga-${vuosi}`,
      title: `Kansojen liiga ${vuosi}`,
      kisatyyppi: "kansojen-liiga" as const,
      vuosi,
      isantamaat,
      voittaja: r.mestari || undefined,
      hopea: r.hopea || undefined,
      pronssi: r.pronssi || undefined,
      tiivistelma: tiivistelma.slice(0, 300),
      kuvaus: own.flatMap((a) => a.blocks),
      tilastot: [taulukko.slug],
      kuvat: [],
      sourcePage: file,
      needsReview: reasons.length > 0,
      reviewReasons: reasons,
      kenttienLahteet: {
        vuosi: "kansojenliiga.htm mitalitaulukon rivi",
        isantamaat: "kansojenliiga.htm mitalitaulukko",
        mitalit: "kansojenliiga.htm mitalitaulukko",
        kuvaus: own.length ? `lainattu finaaliuutinen (lähdemerkinnän vuosi ${vuosi})` : "–",
      },
    };
  });
  if (unassigned.length) {
    kisat[0].reviewReasons.push(`${unassigned.length} uutista ei voitu liittää kauteen`);
    kisat[0].needsReview = true;
  }
  return kisat;
}

// ─── Alle 21-vuotiaiden EM 2009 (pikkuhuuhkajat.htm) ─────────────────────────

async function parsePikkuhuuhkajat(): Promise<Kisa> {
  const file = "pikkuhuuhkajat.htm";
  const $ = await loadPage(file);
  const entries = toEntries(tokenize($, $("body")[0]));
  const lines = entries
    .filter((e): e is Extract<Entry, { e: "line" }> => e.e === "line")
    .map((e) => lineText(e.runs));
  const text = lines.join("\n");
  const reasons: string[] = [];
  const lahteet: Record<string, string> = {};

  const range = DATE_RANGE.exec(text);
  const alkuPvm = range ? iso(range[1], range[2], range[3] ?? range[6]) : undefined;
  const loppuPvm = range ? iso(range[4], range[5], range[6]) : undefined;
  if (range) lahteet.alkuPvm = lahteet.loppuPvm = `otsikkorivi "${range[0]}"`;
  else reasons.push("päivämääriä ei löytynyt");

  // "Isäntämaa Ruotsi sekä korkeimmaksi rankattu joukkue Espanja…" (yle.fi 03.12.2008)
  const host = /Isäntämaa\s+([A-ZÅÄÖ][a-zåäö-]+)/.exec(text);
  const isantamaat = host ? [host[1]] : [];
  if (host) lahteet.isantamaat = `lainattu uutinen: "${host[0]}"`;
  else reasons.push("isäntämaata ei löytynyt");

  // "Loppuottelu 29.6." + "Saksa-Englanti 4-0 (1-0)"
  const finalIdx = lines.findIndex((l) => /^Loppuottelu\b/i.test(l));
  const fm = finalIdx >= 0 ? /^(.+?)\s*[-–]\s*(.+?)\s+(\d+)-(\d+)/.exec(lines[finalIdx + 1] ?? "") : null;
  let voittaja: string | undefined;
  let hopea: string | undefined;
  if (fm && fm[3] !== fm[4]) {
    const [a, b] = [fm[1].trim(), fm[2].trim()];
    [voittaja, hopea] = Number(fm[3]) > Number(fm[4]) ? [a, b] : [b, a];
    lahteet.mitalit = `loppuotteluriivi "${lines[finalIdx + 1]}"`;
  } else {
    reasons.push("loppuottelun tulosta ei voitu jäsentää");
  }

  // Suomen kolme lohko-ottelua lohkossa B, kaikki tappioita; loppuottelussa ei Suomea.
  const suomiLines = lines.filter((l) => /^\d{1,2}\.\d{1,2}:.*Suomi/.test(l));
  let suomenSijoitus: string | undefined;
  const lohko = /Suomen ottelut lohko\s+([A-D])/i.exec(text)?.[1];
  if (lohko && suomiLines.length === 3 && !/Suomi/.test(lines[finalIdx + 1] ?? "")) {
    suomenSijoitus = `Lohkovaihe (lohko ${lohko})`;
    lahteet.suomenSijoitus = `"Suomen ottelut lohko ${lohko}": ${suomiLines.length} ottelua, ei loppuottelussa`;
  }

  const HEADER = /^(PIKKUHUUHKAJAT|Alle 21-vuotiaiden EM\b.*)$/;
  const kuvaus = toBlocks(entries, {
    page: file,
    headingLevel: (t, runs) => (isAllBold(runs) && t.length <= 200 && !HEADER.test(t) ? 2 : null),
    skipLine: (t) => HEADER.test(t),
  });
  // Pelaajaesittelyn ensimmäinen rivi ("#1 Anssi Jaakkola, AC Siena (ITA)") lihavoidaan,
  // jotta 22 esittelyä erottuvat toisistaan. Ei otsikoksi: ne eivät ole osioita.
  for (const b of kuvaus) {
    if (b.kind !== "paragraph") continue;
    const first = b.spans[0];
    if (!first || !/^#\d+\s/.test(first.text)) continue;
    const nl = first.text.indexOf("\n");
    if (nl > 0) {
      b.spans.splice(0, 1, { ...first, text: first.text.slice(0, nl), bold: true }, { ...first, text: first.text.slice(nl) });
    } else {
      first.bold = true;
    }
  }

  const tiivistelma = [
    `Alle 21-vuotiaiden jalkapallon EM-lopputurnaus 2009${alkuPvm && loppuPvm ? ` pelattiin ${Number(alkuPvm.slice(8))}.${Number(alkuPvm.slice(5, 7))}.–${Number(loppuPvm.slice(8))}.${Number(loppuPvm.slice(5, 7))}.2009` : ""}.`,
    isantamaat.length ? `Isäntämaa: ${isantamaat[0]}.` : "",
    voittaja ? `Mestari: ${voittaja}, hopea: ${hopea}.` : "",
    suomenSijoitus ? `Suomi: ${suomenSijoitus.charAt(0).toLowerCase()}${suomenSijoitus.slice(1)}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    slug: "u21-em-2009",
    title: "Alle 21-vuotiaiden EM-kisat 2009",
    kisatyyppi: "u21-em",
    vuosi: 2009,
    isantamaat,
    alkuPvm,
    loppuPvm,
    voittaja,
    hopea,
    suomenSijoitus,
    tiivistelma: tiivistelma.slice(0, 300),
    kuvaus,
    tilastot: [],
    kuvat: [],
    sourcePage: file,
    needsReview: reasons.length > 0,
    reviewReasons: reasons,
    kenttienLahteet: lahteet,
  };
}

// ─── Jari Litmanen (litmanenjari + litmanen + litmanenjaripatsas) ────────────

/** Sisarsivujen navigaatiorivit ("Etusivu", "Litmasen loukkaantumiset" …). */
function isNavLine(text: string, runs: Run[]): boolean {
  const linked = runs.filter((r) => r.text.replace(NBSP, " ").trim());
  const allNav =
    linked.length > 0 &&
    linked.every(
      (r) =>
        r.href &&
        (/lahdensuomalainenklubi\.com\/?$/i.test(r.href) || /^litmanen[a-z]*\.htm$/i.test(r.href)),
    );
  return allNav || /^Etusivu$/i.test(text);
}

const LITMANEN_HEADING = (text: string, runs: Run[]): 2 | 3 | null =>
  isAllBold(runs) && text.length <= 200 && /[A-Za-zÅÄÖåäö]/.test(text) ? 3 : null;

async function parseLitmanen(taulukot: Taulukko[]): Promise<Pelaaja> {
  const reasons: string[] = [];
  const lahteet: Record<string, string> = {};

  // 1) Pääsivu: uutisotteet + tietolaatikko
  const jariFile = "litmanenjari.htm";
  const $j = await loadPage(jariFile);
  const jEntries = toEntries(tokenize($j, $j("body")[0]));
  const jText = jEntries
    .filter((e): e is Extract<Entry, { e: "line" }> => e.e === "line")
    .map((e) => lineText(e.runs))
    .join("\n");

  // Tietolaatikko sivun lopussa: "Syntymäaika: 20.02.1971", "Pelipaikka: Hyökkäävä keskikenttä"…
  const birth = /^Syntymäaika:\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/m.exec(jText);
  const syntymaaika = birth ? iso(birth[1], birth[2], birth[3]) : undefined;
  if (birth) lahteet.syntymaaika = `tietolaatikko "${birth[0]}"`;
  const pos = /^Pelipaikka:\s*(.+)$/m.exec(jText);
  let pelipaikka: Pelaaja["pelipaikka"];
  if (pos) {
    const p = pos[1].toLowerCase();
    pelipaikka = /keskikent/.test(p) ? "keskikentta" : /hyökkä/.test(p) ? "hyokkaaja" : /puolust/.test(p) ? "puolustaja" : /maalivahti/.test(p) ? "maalivahti" : undefined;
    lahteet.pelipaikka = `tietolaatikko "${pos[0]}"`;
  }
  const national = /^Maajoukkue:\s*(\d{4})\s*-\s*(\d{4})\s+Suomi\s+(\d+)\s+ottelua\s+ja\s+(\d+)\s+maalia/m.exec(jText);
  const maaottelut = national ? Number(national[3]) : undefined;
  const maalit = national ? Number(national[4]) : undefined;
  if (national) lahteet.maaottelut = lahteet.maalit = `tietolaatikko "${national[0]}"`;
  else reasons.push("maaottelumäärää ei löytynyt tietolaatikosta");

  // "Ammattilaisseurat: Lahden Reipas (1987-1990), HJK (1991), …, FC Lahti (2008-)"
  const clubsLine = /^Ammattilaisseurat:\s*(.+)$/m.exec(jText)?.[1] ?? "";
  const seurat: Seura[] = [];
  for (const m of clubsLine.matchAll(/([^,(]+?)\s*\((\d{4})(?:\s*-\s*(\d{4})?)?\)?(?=,|$)/g)) {
    seurat.push({
      seura: m[1].trim(),
      alkuvuosi: Number(m[2]),
      ...(m[3] ? { loppuvuosi: Number(m[3]) } : m[0].includes("-") ? {} : { loppuvuosi: Number(m[2]) }),
    });
  }
  if (seurat.length) {
    lahteet.seurat = "tietolaatikko \"Ammattilaisseurat\" (junioriseura Lahden Reipas 1977–1987 jätetty listasta, koska rivi on erillinen)";
    const last = seurat[seurat.length - 1];
    if (!last.loppuvuosi) {
      reasons.push(
        `seuralista päättyy lähteessä "${last.seura} (${last.alkuvuosi}-)": tietolaatikko on vanhentunut (HJK 2011 mainitaan sivun teksteissä, ei listassa) — tarkista seurat`,
      );
    }
  } else {
    reasons.push("seuralistaa ei voitu jäsentää");
  }

  const PROFILE_IMAGE = "litmanen080602B.jpg";
  const jBlocks = toBlocks(jEntries, {
    page: jariFile,
    headingLevel: (text, runs) => (/^JARI OLAVI LITMANEN$/.test(text) ? null : LITMANEN_HEADING(text, runs)),
    skipLine: (text, runs) => isNavLine(text, runs) || /^JARI OLAVI LITMANEN$/.test(text),
    skipImage: (file) => file === PROFILE_IMAGE,
    nested: true,
  });

  // 2) Loukkaantumissivu: taulukko + terveysuutiset
  const injFile = "litmanen.htm";
  const $l = await loadPage(injFile);
  const lEntries = toEntries(tokenize($l, $l("body")[0]));
  const injTable = lEntries.find((e): e is Extract<Entry, { e: "table" }> => e.e === "table");
  const injReasons: string[] = [];
  const injRows: Record<string, string>[] = [];
  if (injTable) {
    const grid = readTable($l, injTable.el, injFile);
    for (const cells of grid) {
      // Rivi 0 = otsikko- ja navigaatiosolu (colspan 4), rivi 1 tyhjä, lopussa tyhjiä rivejä.
      if (!/^\d{4}$/.test(cells[0]?.trim() ?? "")) {
        if (cells.some((c) => c.trim()) && !/LOUKKAANTUMISET/.test(cells[0])) {
          injReasons.push(`rivi ohitettu (ei vuotta): ${cells.join(" | ")}`);
        }
        continue;
      }
      injRows.push({
        vuosi: cells[0].trim(),
        kuukausi: cells[1]?.trim() ?? "",
        vamma: cells[2]?.trim() ?? "",
        huomio: cells[3]?.trim() ?? "",
      });
    }
  } else {
    injReasons.push("loukkaantumistaulukkoa ei löytynyt");
  }
  const injSlug = "jari-litmanen-loukkaantumiset";
  taulukot.push({
    slug: injSlug,
    title: "Jari Litmasen ammattilaisuran merkittävimmät loukkaantumiset",
    category: "pelaaja",
    tiivistelma: injRows.length
      ? `Jari Litmasen ammattilaisuran merkittävimmät loukkaantumiset vuosilta ${injRows[0].vuosi}–${injRows[injRows.length - 1].vuosi}: ${injRows.length} merkintää.`
      : undefined,
    // Lähteessä ei ole sarakeotsikoita — otsikot lisätty (kirjattu raporttiin).
    columns: [
      { key: "vuosi", label: "Vuosi", type: "year" },
      { key: "kuukausi", label: "Ajankohta", type: "text" },
      { key: "vamma", label: "Vamma", type: "text" },
      { key: "huomio", label: "Lisätieto", type: "text" },
    ],
    rows: injRows,
    kuvat: [],
    sourcePage: injFile,
    needsReview: injReasons.length > 0,
    reviewReasons: injReasons,
  });
  const lBlocks = toBlocks(lEntries, {
    page: injFile,
    headingLevel: LITMANEN_HEADING,
    skipLine: isNavLine,
    nested: true,
  });

  // 3) Patsassivu: kuvagalleria kuvateksteineen → `kuvat`
  const patsasFile = "litmanenjaripatsas.htm";
  const $p = await loadPage(patsasFile);
  const pEntries = toEntries(tokenize($p, $p("body")[0]));
  const pBlocks = toBlocks(pEntries, {
    page: patsasFile,
    headingLevel: () => null,
    skipLine: isNavLine,
  });
  const gallery = pBlocks.filter((b): b is Extract<Block, { kind: "image" }> => b.kind === "image").map((b) => b.image);
  const patsasTekstit = pBlocks
    .filter((b): b is Extract<Block, { kind: "paragraph" }> => b.kind === "paragraph")
    .map((b) => b.spans.map((s) => s.text).join(""));

  // Profiilikuva (tietolaatikon kuva) galleriaan ensimmäiseksi: sivupohja käyttää
  // `kuvat[0]`:aa pääkuvana.
  const profile = imageRef(PROFILE_IMAGE, "", jariFile, undefined);
  const kuvat = [...(profile ? [profile] : []), ...gallery];

  const kuvaus: Block[] = [
    { kind: "heading", level: 2, text: "Jari Olavi Litmanen" },
    ...jBlocks,
    { kind: "heading", level: 2, text: "Litmasen loukkaantumiset" },
    ...lBlocks,
  ];
  // Patsassivun ainoa leipäteksti on johdanto "Kuvia Jari Litmasen patsaasta.";
  // kuvat kuvateksteineen ovat `kuvat`-galleriassa, joten johdantoa ei toisteta
  // kuvauksessa (kirjattu raporttiin).
  if (patsasTekstit.some((t) => !/^Kuvia Jari Litmasen patsaasta\.?$/.test(t.trim()))) {
    reasons.push(`patsassivulla odottamatonta tekstiä: ${patsasTekstit.join(" / ")}`);
  }

  const fmt = (d: string) => `${Number(d.slice(8))}.${Number(d.slice(5, 7))}.${d.slice(0, 4)}`;
  const tiivistelma = [
    `Jari Olavi Litmanen${syntymaaika ? ` (s. ${fmt(syntymaaika)}, Lahti)` : ""} pelasi Suomen maajoukkueessa ${national ? `${national[1]}–${national[2]} ${maaottelut} ottelua ja teki ${maalit} maalia` : ""}.`,
    pos ? `Pelipaikka: ${pos[1].replace(/\s*"[^"]*"\s*$/, "").toLowerCase()}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    slug: "jari-litmanen",
    name: "Jari Litmanen",
    tiivistelma: tiivistelma.slice(0, 300),
    syntymaaika,
    pelipaikka,
    maaottelut,
    maalit,
    seurat,
    kuvaus,
    tilastot: [injSlug],
    kuvat,
    sourcePage: jariFile,
    muutSourcePages: [injFile, patsasFile],
    needsReview: reasons.length > 0,
    reviewReasons: reasons,
    kenttienLahteet: lahteet,
  };
}

// ─── Pääohjelma ──────────────────────────────────────────────────────────────

const KISASIVUT: KisaSpec[] = [
  { file: "MM2010.htm", kisatyyppi: "mm", vuosi: 2010 },
  { file: "MM2014.htm", kisatyyppi: "mm", vuosi: 2014 },
  { file: "MM2018.htm", kisatyyppi: "mm", vuosi: 2018 },
  { file: "MM2022.htm", kisatyyppi: "mm", vuosi: 2022 },
  { file: "MM2026.htm", kisatyyppi: "mm", vuosi: 2026 },
  { file: "EM2008.htm", kisatyyppi: "em", vuosi: 2008 },
  { file: "EM2012.htm", kisatyyppi: "em", vuosi: 2012 },
  { file: "EM2016.htm", kisatyyppi: "em", vuosi: 2016 },
  { file: "EM2020.htm", kisatyyppi: "em", vuosi: 2020 },
  { file: "EM2024.htm", kisatyyppi: "em", vuosi: 2024 },
];

function countImages(blocks: Block[]): number {
  return blocks.filter((b) => b.kind === "image").length;
}

async function main() {
  inventory = new Map(
    (JSON.parse(await readFile(INVENTORY, "utf-8")) as KuvaRecord[]).map((k) => [k.file, k]),
  );

  const taulukot: Taulukko[] = [];

  const mm = await parseMitalitaulukko(
    "mmtilasto.htm",
    "mm-kisojen-mitalistit",
    "Jalkapallon MM-kisojen isäntämaat ja mitalistit",
    "Jalkapallon MM-kisat",
  );
  // Sivun ainoa sisältökuva: kaavio maailmanmestarien keski-iästä.
  mm.$("img").each((_, el) => {
    const src = mm.$(el).attr("src") ?? "";
    if (/wikimedia/i.test(src)) return;
    const ref = imageRef(src, mm.$(el).attr("alt") ?? "", "mmtilasto.htm");
    if (ref) mm.taulukko.kuvat.push(ref);
  });
  const em = await parseMitalitaulukko(
    "emtilasto.htm",
    "em-kisojen-mitalistit",
    "Jalkapallon EM-kisojen isäntämaat ja mitalistit",
    "Jalkapallon EM-kisat",
  );
  taulukot.push(mm.taulukko, em.taulukko);

  const mmMap = new Map(mm.rivit.map((r) => [r.vuosi, r]));
  const emMap = new Map(em.rivit.map((r) => [r.vuosi, r]));

  const kisat: Kisa[] = [];
  for (const spec of KISASIVUT) {
    kisat.push(await parseKisa(spec, spec.kisatyyppi === "mm" ? mmMap : emMap, taulukot));
  }
  kisat.push(await parsePikkuhuuhkajat());
  kisat.push(...(await parseKansojenLiiga(taulukot)));

  const pelaajat = [await parseLitmanen(taulukot)];

  // Solujen normalisointi (docs/12 §1.2): date → ISO, number → kokonaisluku,
  // epäselvä sarake → text. Näkymättömät merkit pois kaikista teksteistä.
  const soluNormalisointi: { slug: string; huomiot: string[] }[] = [];
  for (const t of taulukot) {
    const res = normalizeKeyed(t.columns, t.rows);
    t.columns = t.columns.map((c, i) => ({ ...c, type: res.types[i] }));
    t.rows = res.rows as Record<string, string>[];
    if (res.notes.length) soluNormalisointi.push({ slug: t.slug, huomiot: res.notes });
  }
  const rawData: ArvokisatData = { kisat, taulukot, pelaajat };
  const invisibleRemoved = countInvisible(rawData);
  const data: ArvokisatData = stripInvisibleDeep(rawData);
  await writeFile(OUT_FILE, `${JSON.stringify(data, null, 2)}\n`, "utf-8");

  // Pudotetut kuvat: uniikit (sama lippu toistuu), järjestettynä.
  const droppedUnique = [...new Map(dropped.map((d) => [`${d.page}|${d.src}`, d])).values()].sort(
    (a, b) => a.page.localeCompare(b.page) || a.src.localeCompare(b.src),
  );
  const droppedOccurrences = dropped.length;
  await writeFile(DROPPED_FILE, `${JSON.stringify(droppedUnique, null, 2)}\n`, "utf-8");

  const allImages = [
    ...kisat.flatMap((k) => k.kuvaus.filter((b) => b.kind === "image").map((b) => (b as { image: ImageRef }).image)),
    ...taulukot.flatMap((t) => t.kuvat),
    ...pelaajat.flatMap((p) => [...p.kuvat, ...p.kuvaus.filter((b) => b.kind === "image").map((b) => (b as { image: ImageRef }).image)]),
  ];
  const altSources: Record<string, number> = {};
  for (const img of allImages) altSources[img.altSource] = (altSources[img.altSource] ?? 0) + 1;

  const review = (items: { slug: string; needsReview: boolean; reviewReasons: string[] }[]) =>
    items.filter((i) => i.needsReview).map((i) => ({ slug: i.slug, syyt: i.reviewReasons }));

  const report = {
    maarat: {
      arvokisa: kisat.length,
      jalkapalloTilasto: taulukot.length,
      pelaaja: pelaajat.length,
      lohkotaulukoita: taulukot.filter((t) => t.slug.includes("-lohko-")).length,
      taulukkoriveja: taulukot.reduce((n, t) => n + t.rows.length, 0),
      kuviaLiitetty: allImages.length,
      uniikkejaKuvatiedostoja: new Set(allImages.map((i) => i.file)).size,
      altLahteet: altSources,
      kuviaPudotettu: { uniikit: droppedUnique.length, esiintymat: droppedOccurrences },
      nakymattomiaMerkkejaPoistettu: invisibleRemoved,
    },
    soluNormalisointi,
    kisat: kisat.map((k) => ({
      slug: k.slug,
      vuosi: k.vuosi,
      isantamaat: k.isantamaat,
      alkuPvm: k.alkuPvm ?? null,
      loppuPvm: k.loppuPvm ?? null,
      voittaja: k.voittaja ?? null,
      hopea: k.hopea ?? null,
      pronssi: k.pronssi ?? null,
      suomenSijoitus: k.suomenSijoitus ?? null,
      lohkotaulukot: k.tilastot.length,
      kuvauslohkoja: k.kuvaus.length,
      kuvia: countImages(k.kuvaus),
      kenttienLahteet: k.kenttienLahteet,
    })),
    taulukot: taulukot.map((t) => ({
      slug: t.slug,
      sourcePage: t.sourcePage,
      riveja: t.rows.length,
      sarakkeita: t.columns.length,
    })),
    pelaajat: pelaajat.map((p) => ({
      slug: p.slug,
      syntymaaika: p.syntymaaika ?? null,
      pelipaikka: p.pelipaikka ?? null,
      maaottelut: p.maaottelut ?? null,
      maalit: p.maalit ?? null,
      seurat: p.seurat.length,
      kuvauslohkoja: p.kuvaus.length,
      galleriakuvia: p.kuvat.length,
      tekstikuvia: countImages(p.kuvaus),
      kenttienLahteet: p.kenttienLahteet,
    })),
    needsReview: {
      arvokisa: review(kisat),
      jalkapalloTilasto: review(taulukot),
      pelaaja: review(pelaajat),
    },
    paatokset: [
      "Kansojen liiga: yksi arvokisa per kausi (2019, 2021, 2023, 2025), koska vuosi on pakollinen; lisäksi koko sivun mitalitaulukko omana jalkapalloTilasto-dokumenttinaan. Kaikilla sama legacyUrl /kansojenliiga.htm.",
      "Mitalistit mmtilasto/emtilasto/kansojenliiga-taulukoista (rakenteinen lähde). EM 2020 = emtilaston rivi 2021 (kisa pelattiin 2021).",
      "EM-kisoissa ei ole pronssiottelua eikä emtilastossa pronssisaraketta → pronssi jätetty tyhjäksi.",
      "Lohkotaulukot: yksi jalkapalloTilasto per lohko (kategoria arvokisa), viitattu arvokisa.tilastot-kentästä. Sarakkeet lisätty (lähteessä ei otsikkoriviä); '-'-erotinsarake yhdistetty Maalit-sarakkeeksi.",
      "Litmanen: kolme sivua yhdeksi pelaajaksi. legacyUrl /litmanenjari.htm, muutLegacyUrlit /litmanen.htm ja /litmanenjaripatsas.htm. Loukkaantumistaulukko omana tilastonaan (sarakeotsikot lisätty, lähteessä ei otsikkoriviä).",
      "Pikkuhuuhkajat: arvokisa u21-em-2009; 22 pelaajaesittelyä jätetty kuvaukseen (2009 kisaennakko, ei pelaajaprofiileja) — ei omia pelaaja-dokumentteja.",
      "MM 2026: otsikossa ei aikaväliä eikä isäntämaita → päivät ensimmäisestä ja viimeisestä ottelupäivästä, isäntämaat mmtilastosta.",
    ],
    slugHuomiot: [
      "u21-em-2009: nykyinen ohjaus /pikkuhuuhkajat.htm → /jalkapalloarkisto/pelaajat on väärä; oikea kohde /jalkapalloarkisto/arvokisat/u21-em-2009 (integraatio päivittää).",
      "mmtilasto, emtilasto, kansojenliiga: ohjaus /jalkapalloarkisto/arvokisat säilyy (listaussivu); mitalitaulukot eivät ole omalla reitillään.",
    ],
    linkit: linkNotes,
  };
  await writeFile(REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`, "utf-8");

  console.log(`
Arvokisoja ............... ${kisat.length}
Taulukoita ............... ${taulukot.length} (lohkoja ${report.maarat.lohkotaulukoita})
Pelaajia ................. ${pelaajat.length}
Kuvia liitetty ........... ${allImages.length} (${report.maarat.uniikkejaKuvatiedostoja} tiedostoa)
  alt-lähteet ............ ${JSON.stringify(altSources)}
Kuvia pudotettu .......... ${droppedUnique.length} uniikkia (${droppedOccurrences} esiintymää)
Tarkistettavia ........... arvokisa ${report.needsReview.arvokisa.length}, tilasto ${report.needsReview.jalkapalloTilasto.length}, pelaaja ${report.needsReview.pelaaja.length}

Tallennettu: ${OUT_FILE}
             ${REPORT_FILE}
             ${DROPPED_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
