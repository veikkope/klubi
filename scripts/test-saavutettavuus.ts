/**
 * Automaattinen saavutettavuustesti (axe-core, WCAG 2.1 A ja AA).
 *
 * Ajo: käynnistä sivusto (`npm run dev` tai `npm run build && npm start`) ja
 *   npm run test:saavutettavuus                    # http://localhost:3000
 *   BASE_URL=https://… npm run test:saavutettavuus # muu osoite
 *
 * Sivut valitaan sitemapista: kaikki yksitasoiset sivut ja kolme edustajaa
 * kustakin syvemmästä sivutyypistä (ensimmäinen, keskimmäinen ja viimeinen,
 * esim. /uutiset/[slug], /ravintolat/[slug]) sekä 404-sivu.
 *
 * Tunnettu poikkeus: Next.js 16.3 palauttaa `notFound()`-sivut tyhjänä
 * virhekuorena (`<html id="__next_error__">` ilman lang-attribuuttia ja
 * sisältöä; sisältö renderöityy selaimessa). Bugi on Nextissä, ei tässä
 * projektissa: https://github.com/vercel/next.js/issues/99287. Tällaiset
 * 404-vastaukset raportoidaan varoituksena, ei virheenä.
 *
 * Axe ajetaan jsdomissa palvelimen renderöimää HTML:ää vastaan. jsdomissa ei
 * ole asettelua, joten värikontrastia ei voi tarkistaa täällä: kontrastit on
 * laskettu tokeneista (app/globals.css). Kaikki muu (nimet, otsikot, id:t,
 * ARIA, kuvien alt, lomakkeiden nimikkeet, kieli) tarkistetaan.
 */
import axe from "axe-core";
import { JSDOM } from "jsdom";

const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const KIINTEAT = ["/", "/english", "/tama-sivu-ei-ole-olemassa"];

type Rikkomus = { id: string; impact: string | null; help: string; helpUrl: string; kohteet: string[] };

async function haeSivut(): Promise<string[]> {
  const xml = await fetch(`${BASE_URL}/sitemap.xml`).then((r) => r.text());
  const polut = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  // Sivutyyppi = polun muoto, jossa viimeinen osa korvataan, jos tasoja on yli yksi.
  const tyypit = new Map<string, string[]>();
  for (const polku of polut) {
    const osat = polku.split("/").filter(Boolean);
    const tyyppi = osat.length > 1 ? [...osat.slice(0, -1), "*"].join("/") : polku;
    tyypit.set(tyyppi, [...(tyypit.get(tyyppi) ?? []), polku]);
  }
  const otos = [...tyypit.values()].flatMap((ryhma) =>
    ryhma.length <= 3 ? ryhma : [ryhma[0], ryhma[Math.floor(ryhma.length / 2)], ryhma[ryhma.length - 1]],
  );
  return [...new Set([...KIINTEAT, ...otos])];
}

const NEXT_404_BUGI = "https://github.com/vercel/next.js/issues/99287";

async function tarkista(polku: string): Promise<Rikkomus[] | "next-404-bugi"> {
  const res = await fetch(`${BASE_URL}${polku}`);
  const html = await res.text();
  if (res.status === 404 && html.includes('<html id="__next_error__">')) return "next-404-bugi";
  const dom = new JSDOM(html, { url: `${BASE_URL}${polku}`, runScripts: "outside-only", pretendToBeVisual: true });
  dom.window.eval(axe.source);
  const tulos = await (dom.window as unknown as { axe: typeof axe }).axe.run(dom.window.document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    rules: { "color-contrast": { enabled: false } },
    resultTypes: ["violations"],
  });
  dom.window.close();
  return tulos.violations.map((v) => ({
    id: v.id,
    impact: v.impact ?? null,
    help: v.help,
    helpUrl: v.helpUrl,
    kohteet: v.nodes.map((n) => n.target.join(" ")),
  }));
}

async function main() {
  try {
    await fetch(BASE_URL);
  } catch {
    console.error(`Sivusto ei vastaa osoitteessa ${BASE_URL}. Käynnistä se ensin (npm run dev).`);
    process.exit(2);
  }

  const sivut = await haeSivut();
  console.log(`Tarkistetaan ${sivut.length} sivua osoitteessa ${BASE_URL}\n`);
  let virheita = 0;
  for (const polku of sivut) {
    const rikkomukset = await tarkista(polku);
    if (rikkomukset === "next-404-bugi") {
      console.log(`! ${polku}: 404 Nextin virhekuorena (tunnettu Next-bugi, ${NEXT_404_BUGI})`);
      continue;
    }
    if (rikkomukset.length === 0) {
      console.log(`✓ ${polku}`);
      continue;
    }
    virheita += rikkomukset.length;
    console.log(`✗ ${polku}`);
    for (const r of rikkomukset) {
      console.log(`    [${r.impact}] ${r.id}: ${r.help}`);
      for (const k of r.kohteet.slice(0, 5)) console.log(`        ${k}`);
      if (r.kohteet.length > 5) console.log(`        … ja ${r.kohteet.length - 5} muuta`);
    }
  }
  console.log(virheita === 0 ? `\n${sivut.length} sivua ok` : `\n${virheita} rikkomusta`);
  process.exit(virheita === 0 ? 0 : 1);
}

void main();
