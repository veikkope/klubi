/**
 * Ohjekortin markdown → HTML (docs/ohje/README.md on sopimus).
 *
 * Vain Node-skripteille (koostaja ja test:ohje): Studio saa valmiin HTML:n
 * generoidusta moduulista (sanity/ohje/sisalto.generated.ts), joten
 * markdown-it ei päädy Studion pakettiin.
 *
 * - Frontmatter `yaml`-paketilla.
 * - markdown-it `html: false` (lähteen HTML escapataan), taulukot,
 *   @mdit/plugin-alert GitHubin huomautuksille (> [!TIP] ym.) suomeksi.
 * - Otsikoille ankkurit `<kortti>--<otsikko>`.
 * - Linkit ja kuvat muunnetaan kohteen mukaan (lib/ohje/linkit.ts):
 *   Studio (`/studio/…`, `/studio/ohjeet/<kortti>`, `/studio-ohje/x.webp`) tai
 *   tuloste (sivuston osoite, `#kortti-<id>`, `x.webp` tulosteen vieressä).
 * - Keräys testille: lihavoinnit, linkit, kuvat ja otsikoiden osiot.
 */

import { alert } from "@mdit/plugin-alert";
import MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token.mjs";
import { parse as jasennaYaml } from "yaml";

import { siteUrl } from "../site";
import {
  jasennaKorttiLinkki,
  jasennaStudioLinkki,
  korttiPolku,
  kuvanOsoite,
  kuvanTiedosto,
  onStudioLinkki,
} from "./linkit";
import type { KortinMuoto, OhjeKortti, OhjeOtsikko } from "./tyypit";

export type Kohde = "studio" | "tuloste";

/** Kuvan koko pikseleinä tiedostonimen mukaan (public/studio-ohje/kuvat.json). */
export type KuvaKoot = Record<string, { width: number; height: number }>;

export type KuvaTilaus = {
  id: string;
  nakyma?: string;
  avaa?: string;
  merkinnat?: Record<string, string>;
  alt?: string;
  [avain: string]: unknown;
};

/** Otsikon alainen osa (otsikosta seuraavaan samantasoiseen tai ylempään). */
export type KortinOsa = {
  taso: number;
  teksti: string;
  numeroituja: number;
  /** Ylimmän tason listan kohdat (numeroitu tai luettelo). */
  listanKohdat: number;
  taulukonRivit: number;
  alaotsikot: number;
};

/**
 * Lihavoitu teksti. `otsake` = rakenteen merkintä eikä Studion nimi: lihavointi
 * rivin alussa kaksoispisteeseen päättyen ("**Uusi rivi:** paina …",
 * vianetsinnän "**Mitä näet:**") tai huomautuslaatikon omalla rivillään oleva
 * ensimmäinen lihavointi (laatikon otsikko). test:ohje ei vertaa otsakkeita sanastoon.
 */
export type Lihavointi = { teksti: string; otsake: boolean };

export type KasiteltyKortti = {
  /** Lähdetiedosto repon juuresta, kauttaviivoin (docs/ohje/uutiset/x.md). */
  tiedosto: string;
  lahde: string;
  muoto: KortinMuoto;
  kortti: OhjeKortti;
  /** Sama kortti tulostettavaan HTML:ään. */
  tulosteHtml: string;
  frontmatter: Record<string, unknown>;
  kuvatilaukset: KuvaTilaus[];
  lihavoinnit: Lihavointi[];
  linkit: { href: string; teksti: string }[];
  kuvat: { src: string; alt: string }[];
  osat: KortinOsa[];
  /** Frontmatterin ja muodon virheet (koostaja ohittaa kortin, jos otsikko puuttuu). */
  virheet: string[];
};

/** Vianetsintäkortin rakennelihavoinnit (eivät ole Studion nimiä). */
export const VIANETSINNAN_OTSAKKEET = ["Mitä näet:", "Miksi:", "Näin korjaat:", "Ei auttanut?"] as const;

/** Huomautuslaatikoiden otsikot suomeksi. */
export const HUOMAUTUKSET: Record<string, string> = {
  tip: "Vinkki",
  note: "Hyvä tietää",
  important: "Tärkeää",
  warning: "Varoitus",
  caution: "Varo",
};

const MUODOT: readonly KortinMuoto[] = ["pikaopas", "tehtava", "vianetsinta", "vapaa"];

type Env = {
  kohde: Kohde;
  korttiId: string;
  kuvaKoot: KuvaKoot;
  otsikot?: OhjeOtsikko[];
};

export function erotaFrontmatter(lahde: string): { yaml: string | null; runko: string } {
  const osuma = /^﻿?---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(lahde);
  if (!osuma) return { yaml: null, runko: lahde };
  return { yaml: osuma[1], runko: lahde.slice(osuma[0].length) };
}

export function ankkuri(teksti: string): string {
  return (
    teksti
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "kohta"
  );
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function tekstiTokeneista(lapset: Token[] | null): string {
  if (!lapset) return "";
  return lapset
    .map((t) => (t.type === "text" || t.type === "code_inline" ? t.content : t.type === "softbreak" ? " " : ""))
    .join("");
}

function luoMarkdown(): MarkdownIt {
  const md = new MarkdownIt("default", { html: false, linkify: true, typographer: false });
  // Vain kirjoitetut https://-osoitteet linkeiksi; "sanity.io" tekstissä ei muutu http-linkiksi.
  md.linkify.set({ fuzzyLink: false, fuzzyEmail: false });

  md.use(alert, {
    alertNames: Object.keys(HUOMAUTUKSET),
    titleRender: (tokens, idx) =>
      `<p class="markdown-alert-title">${HUOMAUTUKSET[tokens[idx].markup] ?? escapeHtml(tokens[idx].markup)}</p>\n`,
  });

  // Ankkurit otsikoille: <kortti>--<otsikko>, toistuvat numeroidaan.
  md.core.ruler.push("ohje_ankkurit", (state) => {
    const env = state.env as Env;
    const kaytetyt = new Set<string>();
    const otsikot: OhjeOtsikko[] = [];
    state.tokens.forEach((t, i) => {
      if (t.type !== "heading_open") return;
      const teksti = tekstiTokeneista(state.tokens[i + 1]?.children ?? null).trim();
      const perus = `${env.korttiId}--${ankkuri(teksti)}`;
      let id = perus;
      for (let n = 2; kaytetyt.has(id); n += 1) id = `${perus}-${n}`;
      kaytetyt.add(id);
      t.attrSet("id", id);
      otsikot.push({ id, teksti, taso: Number(t.tag.slice(1)) });
    });
    env.otsikot = otsikot;
  });

  md.renderer.rules.link_open = (tokens, idx, _options, envAny) => {
    const env = envAny as Env;
    const href = tokens[idx].attrGet("href") ?? "";
    const attr: [string, string][] = [];
    if (onStudioLinkki(href)) {
      const linkki = jasennaStudioLinkki(href);
      const polku = "virhe" in linkki ? "/studio" : linkki.polku;
      attr.push(["href", env.kohde === "studio" ? polku : `${siteUrl}${polku}`], ["data-ohje-studio", "1"]);
    } else if (jasennaKorttiLinkki(href)) {
      const kortti = jasennaKorttiLinkki(href)!;
      const kohta = kortti.ankkuri ? `${kortti.id}--${ankkuri(kortti.ankkuri)}` : null;
      attr.push(
        ["href", env.kohde === "studio" ? korttiPolku(kortti.id) : `#${kohta ?? `kortti-${kortti.id}`}`],
        ["data-ohje-kortti", kortti.id],
      );
      if (kohta) attr.push(["data-ohje-ankkuri", kohta]);
    } else if (/^https?:\/\//.test(href)) {
      attr.push(["href", href], ["target", "_blank"], ["rel", "noopener noreferrer"]);
    } else {
      attr.push(["href", href]);
    }
    const title = tokens[idx].attrGet("title");
    if (title) attr.push(["title", title]);
    return `<a${attr.map(([k, v]) => ` ${k}="${escapeHtml(v)}"`).join("")}>`;
  };

  md.renderer.rules.image = (tokens, idx, _options, envAny) => {
    const env = envAny as Env;
    const t = tokens[idx];
    const src = t.attrGet("src") ?? "";
    const alt = tekstiTokeneista(t.children);
    const tiedosto = kuvanTiedosto(src);
    const osoite = tiedosto ? (env.kohde === "studio" ? kuvanOsoite(tiedosto) : tiedosto) : src;
    const koko = tiedosto ? env.kuvaKoot[tiedosto] : undefined;
    const mitat = koko ? ` width="${koko.width}" height="${koko.height}"` : "";
    const img = `<img class="ohje-kuva" src="${escapeHtml(osoite)}" alt="${escapeHtml(alt)}"${mitat} loading="lazy" decoding="async">`;
    if (env.kohde !== "studio") return img;
    return `<button type="button" class="ohje-kuvanappi" data-ohje-kuva="${escapeHtml(osoite)}" aria-label="${escapeHtml(`Suurenna kuva: ${alt}`)}">${img}</button>`;
  };

  return md;
}

let jaettu: MarkdownIt | null = null;
function markdown(): MarkdownIt {
  jaettu ??= luoMarkdown();
  return jaettu;
}

function htmlTekstiksi(html: string): string {
  return html
    .replace(/<p class="markdown-alert-title">[^<]*<\/p>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function keraa(tokens: Token[]) {
  const lihavoinnit: Lihavointi[] = [];
  const linkit: { href: string; teksti: string }[] = [];
  const kuvat: { src: string; alt: string }[] = [];
  let edellinenAlert = false;
  for (const [i, t] of tokens.entries()) {
    if (t.type === "alert_open") edellinenAlert = true;
    if (t.type !== "inline" || !t.children) continue;
    // Huomautuslaatikon ensimmäinen kappale: alkaako se lihavoidulla rivillä (laatikon oma otsikko)?
    const alertinAlku = edellinenAlert && tokens[i - 1]?.type === "paragraph_open";
    edellinenAlert = false;
    let lihava: string[] | null = null;
    let lihavanAlku = -1;
    let linkki: { href: string; osat: string[] } | null = null;
    for (const [j, c] of t.children.entries()) {
      if (c.type === "strong_open") {
        lihava = [];
        lihavanAlku = j;
      } else if (c.type === "strong_close" && lihava) {
        const teksti = lihava.join("").replace(/\s+/g, " ").trim();
        // markdown-it jättää korostuksen ympärille tyhjiä tekstitokeneita.
        const tyhja = (c: Token) => c.type === "text" && c.content === "";
        const seuraava = t.children.slice(j + 1).find((c) => !tyhja(c));
        const alussa = t.children.slice(0, lihavanAlku).every(tyhja);
        // Otsake = rakenteen merkintä, ei Studion nimi: "**Uusi rivi:** …" rivin alussa,
        // tai huomautuslaatikon ensimmäinen, omalla rivillään oleva lihavointi.
        const otsake =
          (alussa && /:$/.test(teksti)) ||
          (alussa && alertinAlku && (!seuraava || seuraava.type === "softbreak" || seuraava.type === "hardbreak"));
        lihavoinnit.push({ teksti, otsake });
        lihava = null;
      } else if (c.type === "link_open") linkki = { href: c.attrGet("href") ?? "", osat: [] };
      else if (c.type === "link_close" && linkki) {
        linkit.push({ href: linkki.href, teksti: linkki.osat.join("").trim() });
        linkki = null;
      } else if (c.type === "image") kuvat.push({ src: c.attrGet("src") ?? "", alt: tekstiTokeneista(c.children) });
      else if (c.type === "text" || c.type === "code_inline" || c.type === "softbreak") {
        const s = c.type === "softbreak" ? " " : c.content;
        lihava?.push(s);
        linkki?.osat.push(s);
      }
    }
  }
  return { lihavoinnit, linkit, kuvat };
}

function osat(tokens: Token[]): KortinOsa[] {
  const otsikot = tokens.flatMap((t, i) => (t.type === "heading_open" ? [i] : []));
  return otsikot.map((alku, n) => {
    const taso = Number(tokens[alku].tag.slice(1));
    const loppuIndeksi = otsikot.slice(n + 1).find((j) => Number(tokens[j].tag.slice(1)) <= taso) ?? tokens.length;
    const alue = tokens.slice(alku + 3, loppuIndeksi);
    const listat = alue.filter((t) => t.type === "bullet_list_open" || t.type === "ordered_list_open");
    const ylin = listat.length ? Math.min(...listat.map((t) => t.level)) : -1;
    let tbody = false;
    let rivit = 0;
    for (const t of alue) {
      if (t.type === "tbody_open") tbody = true;
      else if (t.type === "tbody_close") tbody = false;
      else if (t.type === "tr_open" && tbody) rivit += 1;
    }
    return {
      taso,
      teksti: tekstiTokeneista(tokens[alku + 1]?.children ?? null).trim(),
      numeroituja: alue.filter((t) => t.type === "ordered_list_open").length,
      listanKohdat: alue.filter((t) => t.type === "list_item_open" && t.level === ylin + 1).length,
      taulukonRivit: rivit,
      alaotsikot: alue.filter((t) => t.type === "heading_open").length,
    };
  });
}

function merkkijonot(arvo: unknown, kentta: string, virheet: string[]): string[] {
  if (arvo === undefined || arvo === null) return [];
  if (!Array.isArray(arvo) || arvo.some((a) => typeof a !== "string" || !a.trim())) {
    virheet.push(`frontmatter: ${kentta} on lista tekstejä, esim. [${kentta === "tyypit" ? "uutinen" : "sana"}]`);
    return [];
  }
  return arvo.map((a: string) => a.trim());
}

/**
 * Käsittelee yhden kortin.
 * @param tiedosto polku repon juuresta (kauttaviivoin), esim. docs/ohje/uutiset/kirjoita-uutinen.md
 * @param osio osion tunnus (OHJE_OSIOT) ja sen oletusmuoto
 */
export function kasitteleKortti(
  lahde: string,
  tiedosto: string,
  osio: { id: string; muoto: KortinMuoto },
  kuvaKoot: KuvaKoot = {},
): KasiteltyKortti {
  const virheet: string[] = [];
  const id = tiedosto.replace(/^.*\//, "").replace(/\.md$/, "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    virheet.push(`tiedostonimi "${id}.md": pienet kirjaimet a–z, numerot ja väliviivat (ä→a, ö→o)`);
  }

  const { yaml, runko } = erotaFrontmatter(lahde);
  let fm: Record<string, unknown> = {};
  if (yaml === null) virheet.push("frontmatter puuttuu (--- … --- tiedoston alussa)");
  else {
    try {
      const arvo: unknown = jasennaYaml(yaml);
      if (arvo && typeof arvo === "object" && !Array.isArray(arvo)) fm = arvo as Record<string, unknown>;
      else virheet.push("frontmatter ei ole avain: arvo -muotoinen");
    } catch (e) {
      virheet.push(`frontmatterin YAML ei jäsenny: ${(e as Error).message.split("\n")[0]}`);
    }
  }

  const otsikko = typeof fm.otsikko === "string" ? fm.otsikko.trim() : "";
  if (!otsikko) virheet.push("frontmatter: otsikko puuttuu");
  if (typeof fm.jarjestys !== "number" || !Number.isFinite(fm.jarjestys)) {
    virheet.push("frontmatter: jarjestys puuttuu tai ei ole numero (10, 20, 30 …)");
  }
  const paivitetty =
    fm.paivitetty instanceof Date
      ? fm.paivitetty.toISOString().slice(0, 10)
      : typeof fm.paivitetty === "string"
        ? fm.paivitetty
        : null;
  if (!paivitetty || !/^\d{4}-\d{2}-\d{2}$/.test(paivitetty))
    virheet.push("frontmatter: paivitetty puuttuu (muoto 2026-10-08)");
  if (fm.kesto !== undefined && (typeof fm.kesto !== "string" || !fm.kesto.trim()))
    virheet.push("frontmatter: kesto on teksti, esim. noin 5 minuuttia");
  const avainsanat = merkkijonot(fm.avainsanat, "avainsanat", virheet);
  const tyypit = merkkijonot(fm.tyypit, "tyypit", virheet);

  let muoto = osio.muoto;
  if (fm.muoto !== undefined) {
    if (typeof fm.muoto === "string" && (MUODOT as readonly string[]).includes(fm.muoto))
      muoto = fm.muoto as KortinMuoto;
    else virheet.push(`frontmatter: muoto on yksi näistä: ${MUODOT.join(", ")}`);
  }

  const kuvatilaukset: KuvaTilaus[] = [];
  if (fm.kuvat !== undefined && fm.kuvat !== null) {
    if (!Array.isArray(fm.kuvat)) virheet.push("frontmatter: kuvat on lista");
    else
      for (const k of fm.kuvat) {
        if (k && typeof k === "object" && typeof (k as KuvaTilaus).id === "string" && (k as KuvaTilaus).id) {
          kuvatilaukset.push(k as KuvaTilaus);
        } else virheet.push("frontmatter: jokaisella kuvalla on id");
      }
  }

  const md = markdown();
  const env: Env = { kohde: "studio", korttiId: id, kuvaKoot };
  const tokens = md.parse(runko, env);
  const html = md.renderer.render(tokens, md.options, env);
  const tulosteHtml = md.renderer.render(tokens, md.options, { ...env, kohde: "tuloste" });
  const { lihavoinnit, linkit, kuvat } = keraa(tokens);

  return {
    tiedosto,
    lahde,
    muoto,
    kortti: {
      id,
      otsikko,
      osio: osio.id,
      avainsanat,
      tyypit,
      kesto: typeof fm.kesto === "string" ? fm.kesto.trim() : null,
      paivitetty,
      html,
      teksti: htmlTekstiksi(html),
      otsikot: env.otsikot ?? [],
    },
    tulosteHtml,
    frontmatter: fm,
    kuvatilaukset,
    lihavoinnit,
    linkit,
    kuvat,
    osat: osat(tokens),
    virheet,
  };
}
