/**
 * Ylläpito-ohjeen koostaja (docs/25): docs/ohje/ → Studion moduuli ja tulostettava HTML.
 *
 * Vain Node-skripteille: scripts/ohje-koosta.ts kirjoittaa tulokset,
 * scripts/test-ohje.ts tarkistaa, että generoitu moduuli on ajan tasalla.
 * Toimii myös tyhjällä tai vajaalla lähdekansiolla (osiot ilman kortteja jäävät pois).
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { kasitteleKortti, type KasiteltyKortti, type KuvaKoot } from "./markdown";
import { OHJE_OSIOT, PIKAOPAS_PDF, OHJE_PDF, type OhjeOsio, type OhjeSisalto } from "./tyypit";

export const LAHDEKANSIO = "docs/ohje";
export const KUVAKANSIO = "public/studio-ohje";
export const KUVAKOOT_TIEDOSTO = `${KUVAKANSIO}/kuvat.json`;
export const MODUULI = "sanity/ohje/sisalto.generated.ts";
export const TYYPPIMODUULI = "sanity/ohje/tyypit.generated.ts";
export const TULOSTE = `${KUVAKANSIO}/ohje.html`;
export const PIKAOPAS_TULOSTE = `${KUVAKANSIO}/pikaopas.html`;

export type Koonti = {
  sisalto: OhjeSisalto;
  /** Kaikki luetut kortit (myös virheelliset), osioiden järjestyksessä. */
  kasitellyt: KasiteltyKortti[];
  /** Tiedostot, jotka eivät kuulu mihinkään osioon (väärä kansio tai sisäkkäinen kansio). */
  tuntemattomat: string[];
  /** Kortit, jotka jätettiin pois (otsikko puuttuu). */
  ohitetut: string[];
};

/**
 * Kuvien koot CSS-pikseleinä tiedostonimen mukaan. Lähde on kuvaskriptin
 * (scripts/ohjekuvat.ts) public/studio-ohje/kuvat.json: `{ "<id>": { leveys, korkeus, skaala } }`.
 * Hyväksyy myös `width`/`height` ja avaimen tiedostopäätteen kanssa sekä listan
 * `[{ id | tiedosto, … }]`. Puuttuva tai rikkinäinen tiedosto = ei kokoja.
 */
export function lueKuvaKoot(juuri: string, tiedosto = KUVAKOOT_TIEDOSTO): KuvaKoot {
  const polku = join(juuri, tiedosto);
  if (!existsSync(polku)) return {};
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(polku, "utf8"));
  } catch {
    console.warn(`VAROITUS: ${tiedosto} ei ole kelvollista JSONia, kuvien kokoja ei käytetä.`);
    return {};
  }
  const tulos: KuvaKoot = {};
  const lisaa = (avain: unknown, arvo: unknown) => {
    if (typeof avain !== "string" || !arvo || typeof arvo !== "object") return;
    const a = arvo as Record<string, unknown>;
    // Kuvaskripti tallentaa pikselikoon ja laitteen pikselisuhteen (skaala): HTML:ään CSS-pikselit.
    const skaala = Number(a.skaala) > 0 ? Number(a.skaala) : 1;
    const width = Number(a.width ?? a.leveys) / skaala;
    const height = Number(a.height ?? a.korkeus) / skaala;
    if (!(width > 0 && height > 0)) return;
    const nimi = /\.[a-z0-9]+$/i.test(avain) ? avain : `${avain}.webp`;
    tulos[nimi] = { width: Math.round(width), height: Math.round(height) };
  };
  if (Array.isArray(data))
    for (const r of data) lisaa((r as Record<string, unknown>)?.tiedosto ?? (r as Record<string, unknown>)?.id, r);
  else if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const kuvat = obj.kuvat && typeof obj.kuvat === "object" ? (obj.kuvat as Record<string, unknown>) : obj;
    if (Array.isArray(kuvat))
      for (const r of kuvat) lisaa((r as Record<string, unknown>)?.tiedosto ?? (r as Record<string, unknown>)?.id, r);
    else for (const [k, v] of Object.entries(kuvat)) lisaa(k, v);
  }
  return tulos;
}

function mdTiedostot(kansio: string): string[] {
  if (!existsSync(kansio)) return [];
  return readdirSync(kansio)
    .filter((n) => n.endsWith(".md") && statSync(join(kansio, n)).isFile())
    .sort();
}

/** Lukee ja käsittelee kaikki kortit. `lahde` on suhteessa juureen (testi käyttää fixtures-kansiota). */
export function koostaOhje(juuri: string, lahde = LAHDEKANSIO, kuvaKoot = lueKuvaKoot(juuri)): Koonti {
  const lahdePolku = join(juuri, lahde);
  const kasitellyt: KasiteltyKortti[] = [];
  const tuntemattomat: string[] = [];
  const ohitetut: string[] = [];
  const osiot: OhjeOsio[] = [];
  const osioKansiot = new Set(OHJE_OSIOT.map((o) => o.id));

  for (const osio of OHJE_OSIOT) {
    const tiedostot =
      osio.id === "pikaopas"
        ? existsSync(join(lahdePolku, "pikaopas.md"))
          ? ["pikaopas.md"]
          : []
        : mdTiedostot(join(lahdePolku, osio.id)).map((n) => `${osio.id}/${n}`);
    const osionKortit: KasiteltyKortti[] = [];
    for (const suhteellinen of tiedostot) {
      const tiedosto = `${lahde}/${suhteellinen}`;
      const k = kasitteleKortti(readFileSync(join(juuri, tiedosto), "utf8"), tiedosto, osio, kuvaKoot);
      kasitellyt.push(k);
      if (!k.kortti.otsikko) ohitetut.push(tiedosto);
      else osionKortit.push(k);
    }
    const jarjestys = (k: KasiteltyKortti) =>
      typeof k.frontmatter.jarjestys === "number" ? k.frontmatter.jarjestys : 9999;
    osionKortit.sort((a, b) => jarjestys(a) - jarjestys(b) || a.kortti.otsikko.localeCompare(b.kortti.otsikko, "fi"));
    if (osionKortit.length)
      osiot.push({ id: osio.id, otsikko: osio.otsikko, kortit: osionKortit.map((k) => k.kortti) });
  }

  // Tiedostot väärissä paikoissa: juuren muut .md:t (paitsi README) ja tuntemattomat kansiot.
  if (existsSync(lahdePolku)) {
    for (const nimi of readdirSync(lahdePolku)) {
      const polku = join(lahdePolku, nimi);
      if (statSync(polku).isDirectory()) {
        if (!osioKansiot.has(nimi) || nimi === "pikaopas") {
          for (const n of mdTiedostot(polku)) tuntemattomat.push(`${lahde}/${nimi}/${n}`);
        } else {
          for (const ali of readdirSync(polku)) {
            if (statSync(join(polku, ali)).isDirectory()) tuntemattomat.push(`${lahde}/${nimi}/${ali}/`);
          }
        }
      } else if (nimi.endsWith(".md") && nimi !== "README.md" && nimi !== "pikaopas.md") {
        tuntemattomat.push(`${lahde}/${nimi}`);
      }
    }
  }

  // Järjestys osioittain kuten sisällysluettelossa.
  const jarjestys = new Map(osiot.flatMap((o) => o.kortit.map((k, i) => [k.id, i] as const)));
  const osionIndeksi = new Map(OHJE_OSIOT.map((o, i) => [o.id, i]));
  kasitellyt.sort(
    (a, b) =>
      (osionIndeksi.get(a.kortti.osio) ?? 99) - (osionIndeksi.get(b.kortti.osio) ?? 99) ||
      (jarjestys.get(a.kortti.id) ?? 9999) - (jarjestys.get(b.kortti.id) ?? 9999),
  );

  const versio = createHash("sha256").update(JSON.stringify(osiot)).digest("hex").slice(0, 12);
  return { sisalto: { versio, osiot }, kasitellyt, tuntemattomat, ohitetut };
}

const OTSAKE = `// GENEROITU: npm run ohje (scripts/ohje-koosta.ts). Älä muokkaa käsin.
// Lähde: docs/ohje/ (kirjoitusohje docs/ohje/README.md). test:ohje tarkistaa, että tämä on ajan tasalla.
`;

export function generoiModuuli(sisalto: OhjeSisalto): string {
  return `${OTSAKE}import type { OhjeSisalto } from "../../lib/ohje/tyypit";

export const OHJE: OhjeSisalto = ${JSON.stringify(sisalto, null, 2)};
`;
}

/** Kevyt hakemisto Ohje-paneelin valikkoon: tyyppi → korttien tunnukset (koko sisältö ladataan vasta avattaessa). */
export function generoiTyyppiModuuli(sisalto: OhjeSisalto): string {
  const tyypeille: Record<string, string[]> = {};
  for (const osio of sisalto.osiot)
    for (const k of osio.kortit) for (const t of k.tyypit) (tyypeille[t] ??= []).push(k.id);
  const jarjestetty = Object.fromEntries(
    Object.keys(tyypeille)
      .sort()
      .map((t) => [t, tyypeille[t]]),
  );
  return `${OTSAKE}
/** Dokumenttityyppi → ohjekorttien tunnukset (frontmatter \`tyypit\`). */
export const OHJE_TYYPEILLE: Readonly<Record<string, readonly string[]>> = ${JSON.stringify(jarjestetty, null, 2)};
`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Tulosteen tyylit: A4, 13 pt, riviväli 1,4, kortti uudelle sivulle, kuvat ehjinä. */
const TULOSTE_CSS = `
@page { size: A4; margin: 16mm 16mm 18mm; }
:root { color-scheme: light; }
* { box-sizing: border-box; }
html { font-size: 13pt; }
body { margin: 0 auto; max-width: 180mm; font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.4; color: #111; background: #fff; }
h1, h2, h3, h4 { line-height: 1.2; break-after: avoid; page-break-after: avoid; }
h1 { font-size: 1.7rem; margin: 0 0 .4rem; }
h2 { font-size: 1.25rem; margin: 1.1rem 0 .4rem; }
h3 { font-size: 1.08rem; margin: 1rem 0 .3rem; }
p, li { orphans: 3; widows: 3; }
ol, ul { padding-left: 1.6rem; }
li + li { margin-top: .25rem; }
a { color: #0b4fa8; }
strong { font-weight: 700; }
code { font-family: Consolas, monospace; font-size: .92em; background: #f1f3f5; padding: 0 .2em; border-radius: 3px; }
table { border-collapse: collapse; width: 100%; margin: .6rem 0; font-size: .95rem; break-inside: auto; }
tr { break-inside: avoid; page-break-inside: avoid; }
th, td { border: 1px solid #9aa3ad; padding: .3rem .45rem; text-align: left; vertical-align: top; }
th { background: #eef1f4; }
img.ohje-kuva { display: block; max-width: 100%; height: auto; margin: .5rem 0; border: 1px solid #c8ced5; break-inside: avoid; page-break-inside: avoid; }
p:has(> img.ohje-kuva) { break-inside: avoid; page-break-inside: avoid; }
.markdown-alert { border-left: 5px solid #5b6b7b; background: #f3f5f7; padding: .45rem .8rem; margin: .7rem 0; break-inside: avoid; page-break-inside: avoid; }
.markdown-alert > :last-child { margin-bottom: 0; }
.markdown-alert-title { font-weight: 700; margin: 0 0 .2rem; }
.markdown-alert-tip { border-color: #1f7a45; background: #eef8f1; }
.markdown-alert-note { border-color: #1d5fbf; background: #eef4fc; }
.markdown-alert-important { border-color: #6a3fb5; background: #f4f0fb; }
.markdown-alert-warning, .markdown-alert-caution { border-color: #b45309; background: #fdf5e9; }
.kansi { break-after: page; page-break-after: always; }
.kansi .alaotsikko { font-size: 1.1rem; color: #333; }
.sisallys ol { list-style: none; padding-left: 0; }
.sisallys > ol > li { margin-top: .6rem; font-weight: 700; }
.sisallys li li { font-weight: 400; margin-top: .1rem; padding-left: 1rem; }
.kortti { break-before: page; page-break-before: always; }
.kortti-osio { font-size: .85rem; text-transform: uppercase; letter-spacing: .05em; color: #555; margin: 0 0 .2rem; }
.kortti-tiedot { color: #444; margin: 0 0 .6rem; }
.versio { color: #555; font-size: .85rem; }
/* Pikaopas yhdelle A4-sivulle: 12 pt (vähintään 12 pt, docs/25), tiiviimmät välit. */
html:has(body.vain-pikaopas) { font-size: 12pt; }
.vain-pikaopas { line-height: 1.32; }
.vain-pikaopas .kortti { break-before: auto; page-break-before: auto; }
.vain-pikaopas .kortti-osio { display: none; }
.vain-pikaopas h1 { font-size: 1.45rem; margin-bottom: .2rem; }
.vain-pikaopas h2 { font-size: 1.1rem; margin: .55rem 0 .25rem; }
.vain-pikaopas p { margin: .3rem 0; }
.vain-pikaopas ol, .vain-pikaopas ul { margin: .25rem 0; }
.vain-pikaopas li + li { margin-top: .1rem; }
.vain-pikaopas table { margin: .35rem 0; }
.vain-pikaopas th, .vain-pikaopas td { padding: .2rem .4rem; }
@media screen { body { padding: 1.5rem; } }
`;

/** Yksittäisen kortin tulostus Studiosta: ?kortti=<id> näyttää vain sen kortin ja avaa tulostuksen. */
const TULOSTE_SKRIPTI = `
(function () {
  var id = new URLSearchParams(location.search).get("kortti");
  if (!id) return;
  var kortti = document.getElementById("kortti-" + id);
  if (!kortti) return;
  document.querySelectorAll(".kansi, .sisallys, .kortti").forEach(function (el) { if (el !== kortti) el.remove(); });
  kortti.style.breakBefore = "auto";
  document.title = kortti.querySelector("h1") ? kortti.querySelector("h1").textContent : document.title;
  window.addEventListener("load", function () { setTimeout(function () { window.print(); }, 150); });
})();
`;

function korttiTulosteeseen(k: KasiteltyKortti, osionOtsikko: string): string {
  const tiedot = [k.kortti.kesto ? `Kesto: ${k.kortti.kesto}` : null].filter(Boolean).join(" · ");
  return `<section class="kortti" id="kortti-${k.kortti.id}">
<p class="kortti-osio">${escapeHtml(osionOtsikko)}</p>
<h1>${escapeHtml(k.kortti.otsikko)}</h1>
${tiedot ? `<p class="kortti-tiedot">${escapeHtml(tiedot)}</p>\n` : ""}${k.tulosteHtml}</section>`;
}

/**
 * Tulostettava HTML (public/studio-ohje/ohje.html tai pikaopas.html). Kuvat ovat
 * samassa kansiossa, joten tiedosto toimii sekä sivustolla että file://-osoitteesta (PDF).
 */
export function generoiTuloste(koonti: Koonti, vainPikaopas = false): string {
  const { sisalto } = koonti;
  const kortit = new Map(koonti.kasitellyt.map((k) => [k.kortti.id, k]));
  const osiot = vainPikaopas ? sisalto.osiot.filter((o) => o.id === "pikaopas") : sisalto.osiot;
  const otsikko = vainPikaopas ? "Pikaopas: sivuston päivittäminen" : "Ylläpito-ohje: Lahden Suomalainen Klubi ry";
  const runko = osiot.flatMap((o) => o.kortit.map((k) => korttiTulosteeseen(kortit.get(k.id)!, o.otsikko))).join("\n");
  const sisallys = osiot
    .map(
      (o) =>
        `<li>${escapeHtml(o.otsikko)}<ol>${o.kortit
          .map((k) => `<li><a href="#kortti-${k.id}">${escapeHtml(k.otsikko)}</a></li>`)
          .join("")}</ol></li>`,
    )
    .join("\n");
  const kansi = vainPikaopas
    ? ""
    : `<header class="kansi">
<h1>Ylläpito-ohje</h1>
<p class="alaotsikko">Lahden Suomalainen Klubi ry · sivuston päivittäminen Studiossa</p>
<p>Sama ohje on Studiossa kohdassa <strong>Ohjeet</strong> (yläpalkki), jossa voit myös hakea. Pikaopas on erillinen yhden sivun tuloste.</p>
<p class="versio">Versio ${sisalto.versio}</p>
<nav class="sisallys" aria-label="Sisällysluettelo"><h2>Sisällys</h2><ol>
${sisallys}
</ol></nav>
</header>`;
  return `<!doctype html>
<html lang="fi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="ohje-versio" content="${sisalto.versio}">
<title>${escapeHtml(otsikko)}</title>
<style>${TULOSTE_CSS}</style>
</head>
<body class="${vainPikaopas ? "vain-pikaopas" : "koko-ohje"}">
${kansi}
${runko || "<p>Ohjeessa ei ole vielä kortteja.</p>"}
<script>${TULOSTE_SKRIPTI}</script>
</body>
</html>
`;
}

/** Tiivisteet PDF:n uudelleenkirjoitusta varten (scripts/ohje-pdf.ts). */
export function tulosteenTiiviste(html: string): string {
  return createHash("sha256").update(html).digest("hex").slice(0, 16);
}

export const PDF_TIEDOSTOT = {
  ohje: { html: TULOSTE, pdf: `public${OHJE_PDF}` },
  pikaopas: { html: PIKAOPAS_TULOSTE, pdf: `public${PIKAOPAS_PDF}` },
} as const;
