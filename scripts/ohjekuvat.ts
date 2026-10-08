/**
 * Ylläpito-ohjeen kuvakaappaukset Studiosta (docs/25, docs/ohje/README.md).
 *
 * Ottaa jokaisen manifestin kuvan (scripts/ohjekuvat/manifesti.ts) Studiosta
 * development-datasetistä, piirtää numeroidut merkinnät, rajaa ja tallentaa
 * public/studio-ohje/<id>.webp. Koot: public/studio-ohje/kuvat.json.
 *
 * Ajo: kehityspalvelin development-datasetillä, esim.
 *   NEXT_PUBLIC_SANITY_DATASET=development npm run dev
 *   npm run ohjekuvat                          # kaikki kuvat, http://localhost:3000
 *   npm run ohjekuvat -- --vain=id,id          # vain nämä
 *   npm run ohjekuvat -- --tarkista            # ei kirjoita mitään: puuttuvat kohteet = kuva vanhentunut
 *   npm run ohjekuvat -- --pakota              # tallenna, vaikka kuva ei muuttunut
 *   npm run ohjekuvat -- --ei-siementa         # älä kirjoita esimerkkidataa
 *   BASE_URL=http://localhost:3020 NAYTA=1 npm run ohjekuvat
 * Lisäksi OHJE_KIELLETYT="Nimi,Nimi" (kielletyt nimet kuvissa), OHJE_SALLITUT
 * (väärät osumat pois), OHJE_ROOLI (oletus editor).
 *
 * Turvallisuus:
 * - Ajo keskeytyy, jos Studio ei käytä development-datasettiä (luetaan Studion
 *   omista pyynnöistä). Siemen (`ohjekuva-*`) kirjoitetaan vain developmentiin
 *   (tarkistus myös siemen.ts:ssä). Studion omat kirjoitukset estetään.
 * - Henkilötiedot: käyttäjähaut korvataan keksityllä käyttäjällä, ja rajauksen
 *   teksti tarkistetaan ennen tallennusta (henkilotiedot.ts). Osuma → ✗, ei tallennusta.
 *
 * Tulos: ✓ tallennettu tai ennallaan, ⚠ huomautus (kuva tallentuu), ✗ virhe
 * (kuva ei tallennu). Poistumiskoodi 1 virheistä. Raportti myös
 * data/ohjekuvat-raportti.txt (ei --tarkista-ajossa).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { createClient } from "@sanity/client";
import { chromium, type Browser, type BrowserContext, type Locator, type Page } from "playwright";
import sharp from "sharp";

import { jasennaStudioLinkki } from "../lib/ohje/linkit";
import {
  estaKirjoitukset,
  KIRJOITUSPYYNTO,
  kirjautumistoken,
  lataaYmparisto,
  luoStudioKonteksti,
  projektinTunnus,
  seuraaDatasetteja,
  sivunVirheet,
  tarkistaPalvelin,
} from "./lib/studio-selain";
import { anonymisoiKayttajat, henkilotiedotTekstissa, kielletytNimet, type KiellettyNimi } from "./ohjekuvat/henkilotiedot";
import { KUVAT } from "./ohjekuvat/manifesti";
import type { Kohde, KuvaMaarite, Merkinta, Toiminto } from "./ohjekuvat/tyypit";
import {
  laajenna,
  nakyvaTeksti,
  odotaLatausta,
  PIILOTUS_CSS,
  VAIN_SIEMEN_CSS,
  piirraMerkinnat,
  poistaMerkinnat,
  rajaaIkkunaan,
  sijoitaNumerot,
  sisalla,
  vahintaan,
  yhdiste,
  ympyranAlue,
  type Laatikko,
} from "./ohjekuvat/merkinnat";
import { kirjoitaSiemen, puuttuvaSiemen, SALLITTU_DATASETTI } from "./ohjekuvat/siemen";
import { lueTilaukset, type Tilaus } from "./ohjekuvat/tilaukset";

// ─────────────────────────────── Asetukset ───────────────────────────────

const JUURI = process.cwd();
const KUVAKANSIO = join(JUURI, "public", "studio-ohje");
const KOOT = join(KUVAKANSIO, "kuvat.json");
const RAPORTTI = join(JUURI, "data", "ohjekuvat-raportti.txt");

const argv = process.argv.slice(2);
const valinta = (nimi: string) => argv.find((a) => a.startsWith(`--${nimi}=`))?.split("=")[1];
const TARKISTA = argv.includes("--tarkista");
const PAKOTA = argv.includes("--pakota");
const EI_SIEMENTA = argv.includes("--ei-siementa") || TARKISTA;
const VAIN = valinta("vain")?.split(",").map((s) => s.trim()).filter(Boolean);
const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const NAYTA = Boolean(process.env.NAYTA);

/** Pikseliero, jonka alle kuva katsotaan ennallaan (0,3 %). */
const ERO_RAJA = 0.003;
/** Kanavan ero, joka lasketaan muuttuneeksi pikseliksi (webp-pakkauksen kohina pois). */
const KANAVA_TOLERANSSI = 40;
const ENSIMMAINEN_AIKARAJA_MS = 180_000;
/** Ikkunan enimmäiskorkeus, kun pitkä lomake ei mahdu (CSS px). */
const MAKSIMIKORKEUS = 3200;
const AIKARAJA_MS = 45_000;

const LAITTEET = {
  tietokone: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, isMobile: false, hasTouch: false },
  puhelin: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
} as const;

// Ei tiedostovälimuistia: tallennettava kuva voi olla juuri luettu (Windows-lukitus).
sharp.cache(false);

const SANITY_VERSIO = (JSON.parse(readFileSync(join(JUURI, "node_modules", "sanity", "package.json"), "utf-8")) as { version: string })
  .version;

// ─────────────────────────────── Tulokset ───────────────────────────────

type Tila = "tallennettu" | "ennallaan" | "muuttuisi" | "ok" | "virhe";

interface Tulos {
  id: string;
  tila: Tila;
  virheet: string[];
  varoitukset: string[];
  koko?: { leveys: number; korkeus: number };
  ero?: number;
}

const rivit: string[] = [];
const loki = (rivi = "") => {
  console.log(rivi);
  rivit.push(rivi);
};

function tulosta(t: Tulos) {
  const merkki = t.virheet.length > 0 ? "✗" : t.varoitukset.length > 0 ? "⚠" : "✓";
  const ero = t.ero === undefined ? "" : `, ero ${(t.ero * 100).toFixed(2)} %`;
  const koko = t.koko ? ` ${t.koko.leveys}×${t.koko.korkeus}` : "";
  loki(`${merkki} ${t.id} — ${t.tila}${koko}${ero}`);
  for (const v of t.virheet) loki(`    ✗ ${v}`);
  for (const v of t.varoitukset) loki(`    ⚠ ${v}`);
}

// ─────────────────────────────── Kohteet ───────────────────────────────

const css = (s: string) => s.replace(/["\\]/g, "\\$&");

function kuvaaKohde(k: Kohde | Kohde[]): string {
  if (Array.isArray(k)) return k.map(kuvaaKohde).join(" + ");
  const { sisalla: s, n, ...loput } = k;
  const [avain, arvo] = Object.entries(loput)[0] ?? ["?", ""];
  const nimi = "rooli" in k ? `rooli ${k.rooli} "${String(k.nimi)}"` : `${avain} ${String(arvo)}`;
  return `${nimi}${n !== undefined ? ` [${n}]` : ""}${s ? ` (${kuvaaKohde(s)} sisällä)` : ""}`;
}

/** Kohde → Playwrightin locator (manifesti.ts: vakain ensin). */
/** Monesko osuma; negatiivinen lasketaan lopusta (-1 = viimeinen). */
async function osuma(loc: Locator, n: number): Promise<Locator> {
  if (n >= 0) return loc.nth(n);
  // -1 pysyy laiskana: odotus toimii, vaikka elementtejä ei vielä ole.
  if (n === -1) return loc.last();
  const maara = await loc.count();
  return loc.nth(Math.max(0, maara + n));
}

/** Kohde → Playwrightin locator (tyypit.ts: vakain ensin). Vain näkyvät elementit. */
async function paikanna(page: Page, k: Kohde): Promise<Locator> {
  const pohja: Page | Locator = k.sisalla ? await paikanna(page, k.sisalla) : page;
  let loc: Locator;
  if ("tyokalu" in k) loc = pohja.locator(`[data-testid="studio-navbar"] a[href$="/${css(k.tyokalu)}"]`);
  else if ("rakenne" in k)
    loc = pohja.locator(`[data-pane-index] a[href$="/${css(k.rakenne)}"], [data-pane-index] a[href$=";${css(k.rakenne)}"]`);
  else if ("kentta" in k) {
    // Viittaus-, kuva- ja valintakentillä ei ole field-<polku>-tunnusta: kenttä on
    // kentän toimintovalikon (field-actions-menu-<polku>) lähin Stack-esivanhempi.
    loc = pohja
      .locator(`[data-testid="field-${css(k.kentta)}"]`)
      .or(pohja.locator(`[data-testid="field-actions-menu-${css(k.kentta)}"]`).locator("xpath=ancestor::*[@data-ui=\"Stack\"][1]"));
  }
  else if ("kenttaLoppu" in k) {
    const loppu = css(k.kenttaLoppu);
    loc = pohja
      .locator(`[data-testid^="field-"]:not([data-testid^="field-actions"])[data-testid$="${loppu}"]`)
      .or(pohja.locator(`[data-testid^="field-actions-menu-"][data-testid$="${loppu}"]`).locator('xpath=ancestor::*[@data-ui="Stack"][1]'));
  } else if ("testid" in k) loc = pohja.locator(`[data-testid="${css(k.testid)}"]`);
  else if ("rooli" in k) loc = pohja.getByRole(k.rooli, { name: k.nimi, exact: k.tarkka ?? typeof k.nimi === "string" });
  else if ("ohje" in k) loc = pohja.locator(`[data-ohje="${css(k.ohje)}"]`);
  else if ("paneeli" in k) {
    // Paneelit järjestyksessä data-pane-index; negatiivinen = lopusta.
    if (k.paneeli >= 0) return pohja.locator(`[data-pane-index="${k.paneeli}"]`).first();
    return osuma(pohja.locator("[data-pane-index]"), k.paneeli);
  } else if ("valinta" in k) return pohja.locator("#ohje-valinta");
  else if ("teksti" in k) loc = pohja.getByText(k.teksti, { exact: typeof k.teksti === "string" });
  else loc = pohja.locator(k.css);
  return osuma(loc.filter({ visible: true }), k.n ?? 0);
}

async function laatikko(page: Page, k: Kohde | Kohde[]): Promise<Laatikko | null> {
  if (Array.isArray(k)) {
    const osat = await Promise.all(k.map((x) => laatikko(page, x)));
    return osat.some((o) => !o) ? null : (yhdiste(osat as Laatikko[]) ?? null);
  }
  if ("valinta" in k) {
    return page.evaluate(() => {
      const s = getSelection();
      if (!s || s.rangeCount === 0 || s.isCollapsed) return null;
      const r = s.getRangeAt(0).getBoundingClientRect();
      return r.width > 0 ? { x: r.x, y: r.y, width: r.width, height: r.height } : null;
    });
  }
  const loc = await paikanna(page, k);
  if (!(await loc.isVisible().catch(() => false))) return null;
  return loc.boundingBox();
}

const merkinnanKohde = (m: Kohde | Merkinta): Merkinta => ("kohde" in m ? m : { kohde: m });

// ─────────────────────────────── Polut ───────────────────────────────

function studioPolku(avaa: string): string {
  if (avaa.startsWith("/")) return avaa;
  const linkki = jasennaStudioLinkki(avaa);
  if ("virhe" in linkki) throw new Error(linkki.virhe);
  return linkki.polku;
}

// ─────────────────────────────── Kuvaus ───────────────────────────────

interface Ajo {
  konteksti: (laite: keyof typeof LAITTEET, korkeus?: number, leveys?: number) => Promise<BrowserContext>;
  kirjoitukset: string[];
  kielletyt: KiellettyNimi[];
  sallitutSahkopostit: string[];
  tilaukset: Map<string, Tilaus>;
  ensimmainen: boolean;
}

/**
 * Vierittää kohteen näkyviin lähimmässä vieritettävässä säiliössä (lomake, lista).
 * Ei vieritä ikkunaa: Studion yläpalkki pysyy paikallaan (scrollIntoView vierittäisi myös ikkunaa).
 */
async function vieritaSailiossa(loc: Locator, kohdistus: "alku" | "keski" | "loppu"): Promise<void> {
  await loc.evaluate((e, k) => {
    let sailio = e.parentElement;
    while (sailio) {
      const tyyli = getComputedStyle(sailio);
      if (/(auto|scroll)/.test(tyyli.overflowY) && sailio.scrollHeight > sailio.clientHeight) break;
      sailio = sailio.parentElement;
    }
    if (sailio) {
      const s = sailio.getBoundingClientRect();
      const r = e.getBoundingClientRect();
      const reunus = 16;
      const siirto =
        k === "alku" ? r.top - s.top - reunus : k === "loppu" ? r.bottom - s.bottom + reunus : r.top + r.height / 2 - (s.top + s.height / 2);
      sailio.scrollTop += siirto;
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, kohdistus);
  await loc.page().waitForTimeout(400);
}

async function suoritaToiminto(page: Page, t: Toiminto): Promise<void> {
  if ("klikkaa" in t) await (await paikanna(page, t.klikkaa)).click({ timeout: 10_000 });
  else if ("tuplaklikkaa" in t) await (await paikanna(page, t.tuplaklikkaa)).dblclick({ timeout: 10_000 });
  else if ("hiiri" in t) await (await paikanna(page, t.hiiri)).hover({ timeout: 10_000 });
  else if ("vierita" in t) {
    await vieritaSailiossa(await paikanna(page, t.vierita), t.kohdistus ?? "keski");
  } else if ("kirjoita" in t) {
    if (t.kohde) await (await paikanna(page, t.kohde)).click({ timeout: 10_000 });
    await page.keyboard.type(t.kirjoita, { delay: 40 });
    await page.waitForTimeout(1_200);
  } else if ("maalaa" in t) {
    const ok = await (await paikanna(page, t.kohde)).evaluate((juuri, teksti) => {
      const kulkija = document.createTreeWalker(juuri, NodeFilter.SHOW_TEXT);
      for (let n = kulkija.nextNode(); n; n = kulkija.nextNode()) {
        const i = n.textContent?.indexOf(teksti) ?? -1;
        if (i < 0) continue;
        (n.parentElement?.closest("[contenteditable]") as HTMLElement | null)?.focus();
        const r = document.createRange();
        r.setStart(n, i);
        r.setEnd(n, i + teksti.length);
        const valinta = getSelection();
        valinta?.removeAllRanges();
        valinta?.addRange(r);
        document.dispatchEvent(new Event("selectionchange"));
        return true;
      }
      return false;
    }, t.maalaa);
    if (!ok) throw new Error(`tekstiä "${t.maalaa}" ei löytynyt`);
    await page.waitForTimeout(800);
  } else if ("avaaKohta" in t) {
    // Kuten käyttäjän klikkaus listan kohteeseen: polku osoitteeseen (sanity 5.31.2, path=).
    // Raskaan lomakkeen täyttyessä Studio voi ohittaa polun: uudelleen (kuten savutesti).
    for (let yritys = 0; yritys < 4; yritys++) {
      await page.waitForTimeout(yritys === 0 ? 800 : 1_500);
      await page.evaluate((kohta) => {
        const url = new URL(location.href);
        const ilman = url.pathname.replace(/,path=[^;/]*$/, "");
        history.pushState(null, "", ilman);
        dispatchEvent(new PopStateEvent("popstate", { state: null }));
        url.pathname = `${ilman},path=${encodeURIComponent(kohta)}`;
        history.pushState(null, "", url);
        dispatchEvent(new PopStateEvent("popstate", { state: null }));
      }, t.avaaKohta);
      const auki = await page
        .locator('[role="dialog"], [data-testid="popover-edit-dialog"]')
        .first()
        .waitFor({ state: "visible", timeout: 6_000 })
        .then(() => true)
        .catch(() => false);
      if (auki) break;
    }
    await page.waitForTimeout(800);
  }
  else if ("paina" in t) await page.keyboard.press(t.paina);
  else if ("ryhma" in t) await (await paikanna(page, { testid: `group-tab-${t.ryhma}` })).click({ timeout: 10_000 });
  else if (typeof t.odota === "number") await page.waitForTimeout(t.odota);
  else await (await paikanna(page, t.odota)).waitFor({ state: "visible", timeout: 20_000 });
  await page.waitForTimeout(300);
}

/** Pikseliero vanhaan kuvaan (0–1); 1, jos koko muuttui tai vanhaa ei ole. */
async function pikseliero(uusi: Buffer, vanhaPolku: string): Promise<number> {
  if (!existsSync(vanhaPolku)) return 1;
  const [a, b] = await Promise.all([
    sharp(uusi).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    // Puskurina: sharp pitäisi tiedostopolun auki (Windows ei salli korvata sitä).
    sharp(readFileSync(vanhaPolku)).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]);
  if (a.info.width !== b.info.width || a.info.height !== b.info.height) return 1;
  let eri = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    if (
      Math.abs(a.data[i] - b.data[i]) > KANAVA_TOLERANSSI ||
      Math.abs(a.data[i + 1] - b.data[i + 1]) > KANAVA_TOLERANSSI ||
      Math.abs(a.data[i + 2] - b.data[i + 2]) > KANAVA_TOLERANSSI
    ) {
      eri += 1;
    }
  }
  return eri / (a.info.width * a.info.height);
}

async function kuvaa(ajo: Ajo, m: KuvaMaarite): Promise<{ tulos: Tulos; koko?: KuvaKoko }> {
  const tulos: Tulos = { id: m.id, tila: "virhe", virheet: [], varoitukset: [] };
  const tilaus = ajo.tilaukset.get(m.id);
  const laite = m.laite ?? "tietokone";

  // Tilauksen ja manifestin numerot samat (numero = askel kortissa).
  if (tilaus) {
    const t = Object.keys(tilaus.merkinnat).map(Number).sort((a, b) => a - b).join(",");
    const k = Object.keys(m.merkinnat).map(Number).sort((a, b) => a - b).join(",");
    if (t !== k) tulos.varoitukset.push(`merkinnät eroavat tilauksesta (${tilaus.kortti}): tilaus ${t || "–"}, manifesti ${k || "–"}`);
  }
  const avaa = m.avaa ?? tilaus?.avaa;
  if (!avaa) {
    tulos.virheet.push("aloitusnäkymä puuttuu (manifestin avaa tai tilauksen avaa)");
    return { tulos };
  }

  const context = await ajo.konteksti(laite, m.korkeus, m.leveys);
  const page = await context.newPage();
  const sivunVirheetKeratty: string[] = [];
  page.on("pageerror", (e) => sivunVirheetKeratty.push(`pageerror: ${e.message.split("\n")[0]}`));
  const kirjoituksiaEnnen = ajo.kirjoitukset.length;
  const aikaraja = ajo.ensimmainen ? ENSIMMAINEN_AIKARAJA_MS : AIKARAJA_MS;
  ajo.ensimmainen = false;

  try {
    for (const v of m.vastaukset ?? []) {
      await page.route(v.osoite, async (reitti) => {
        const vastaus = await reitti.fetch();
        return reitti.fulfill({ response: vastaus, json: v.muokkaa(await vastaus.json()) });
      });
    }
    if (m.kirjoittaa || m.sallitutKirjoitukset) {
      // Sivukohtainen reitti menee kontekstin eston edelle. Kirjaus kuten estossa.
      await page.route(KIRJOITUSPYYNTO, (reitti) => {
        const url = reitti.request().url();
        if (m.sallitutKirjoitukset?.test(url) && url.includes(`/${SALLITTU_DATASETTI}?`)) return reitti.continue();
        ajo.kirjoitukset.push(`${reitti.request().method()} ${new URL(url).pathname} (${new URL(url).searchParams.get("tag") ?? ""})`);
        // Kirjoittava kuva: Studio luulee tallentaneensa (ei virhenäkymää), mitään ei kirjoiteta.
        if (m.kirjoittaa) return reitti.fulfill({ json: { transactionId: "ohjekuva-esto", results: [] } });
        return reitti.abort();
      });
    }
    // Esikatselun iframe on oma sivunsa: kehityspalvelimen Next-merkki piiloon sieltäkin.
    page.on("framenavigated", (kehys) => {
      if (kehys === page.mainFrame()) return;
      kehys
        .waitForLoadState("domcontentloaded")
        .then(() => kehys.addStyleTag({ content: "nextjs-portal { display: none !important; }" }))
        .catch(() => {});
    });
    await page.goto(BASE_URL + studioPolku(avaa), { waitUntil: "domcontentloaded", timeout: aikaraja });
    // Työkaluvihjeet (esim. englanninkielinen "Field actions" kohdistetun kentän päällä) pois,
    // paitsi kun kuva näyttää vihjeen hiiren alla (toiminto hiiri).
    const vihjeet = (m.toiminnot ?? []).some((t) => "hiiri" in t);
    await page.addStyleTag({
      content: PIILOTUS_CSS + (m.vainSiemen ? VAIN_SIEMEN_CSS : "") + (vihjeet ? "" : '[data-ui="Tooltip"], [role="tooltip"] { display: none !important; }'),
    });
    const merkinnat = Object.entries(m.merkinnat)
      .map(([numero, arvo]) => ({ numero: Number(numero), ...merkinnanKohde(arvo) }))
      .sort((a, b) => a.numero - b.numero);
    const ensimmainenKohde = merkinnat[0]?.kohde;
    const valmis = m.valmis ?? (Array.isArray(ensimmainenKohde) ? ensimmainenKohde[0] : ensimmainenKohde);
    if (valmis) {
      const auki = await (await paikanna(page, valmis))
        .waitFor({ state: "visible", timeout: aikaraja })
        .then(() => true)
        .catch(() => false);
      if (!auki) tulos.virheet.push(`näkymä ei valmistunut: ${kuvaaKohde(valmis)} ei näy (vanhentunut?)`);
    }
    if (tulos.virheet.length === 0) {
      for (const t of m.toiminnot ?? []) {
        try {
          await suoritaToiminto(page, t);
        } catch (e) {
          tulos.virheet.push(`toiminto ${JSON.stringify(t)} epäonnistui: ${(e as Error).message.split("\n")[0]}`);
          break;
        }
      }
    }
    if (tulos.virheet.length > 0) return { tulos };

    // Rauhoitus: latausosoittimet pois, hiiri nurkkaan, kohdistus pois, fontit ladattu.
    if (!(await odotaLatausta(page))) tulos.varoitukset.push("latausosoitin näkyy yhä 15 s jälkeen");
    // Avattu valikko tai ikkuna sulkeutuisi, jos kohdistus poistetaan: vain ilman toimintoja.
    const toiminnot = m.toiminnot ?? [];
    const viimeinen = toiminnot.at(-1);
    if (!viimeinen) await page.mouse.move(0, 0);
    else if (!("hiiri" in viimeinen)) await page.mouse.move(1, 1);
    await page.evaluate(async (blur) => {
      if (blur) (document.activeElement as HTMLElement | null)?.blur?.();
      await document.fonts.ready;
    }, toiminnot.length === 0);
    await page.waitForTimeout(600);

    // Kohteet: puuttuva kohde = Studio muuttunut, kuva vanhentunut.
    let ikkuna = page.viewportSize() ?? LAITTEET[laite].viewport;
    let ikkunaAlue: Laatikko = { x: 0, y: 0, width: ikkuna.width, height: ikkuna.height };
    const mittaa = () => Promise.all(merkinnat.map((x) => laatikko(page, x.kohde)));
    let laatikot = await mittaa();
    const mittaaOsat = () =>
      Promise.all(
        merkinnat.map(async (x) =>
          Array.isArray(x.kohde) && x.kehys ? ((await Promise.all(x.kohde.map((k) => laatikko(page, k)))) as Laatikko[]) : undefined,
        ),
      );
    const ulkona = laatikot.findIndex((l) => l && !sisalla(l, ikkunaAlue));
    if (ulkona >= 0) {
      // Ylimpänä oleva merkitty kohde lomakkeen ylälaitaan; muut jatkuvat sen alla.
      const ylin = laatikot.reduce((paras, l, i) => (l && (paras < 0 || l.y < (laatikot[paras]?.y ?? Infinity)) ? i : paras), -1);
      const k = merkinnat[Math.max(0, ylin)].kohde;
      await vieritaSailiossa(await paikanna(page, Array.isArray(k) ? k[0] : k), "alku").catch(() => undefined);
      await page.waitForTimeout(300);
      laatikot = await mittaa();
    }
    // Pitkä lomake: ikkunaa pidennetään tälle sivulle, kunnes alimmat kohteet mahtuvat
    // (leveys ja asettelu ennallaan; Studio vain näyttää enemmän lomaketta).
    const alin = Math.max(0, ...laatikot.filter((l): l is Laatikko => Boolean(l)).map((l) => l.y + l.height));
    if (alin > ikkuna.height - 90 && ikkuna.height < MAKSIMIKORKEUS) {
      ikkuna = { width: ikkuna.width, height: Math.min(MAKSIMIKORKEUS, Math.ceil(alin + 120)) };
      await page.setViewportSize(ikkuna);
      await page.waitForTimeout(1_000);
      ikkunaAlue = { x: 0, y: 0, width: ikkuna.width, height: ikkuna.height };
      laatikot = await mittaa();
    }
    merkinnat.forEach((x, i) => {
      if (!laatikot[i]) tulos.virheet.push(`kohde puuttuu: ${x.numero} = ${kuvaaKohde(x.kohde)} (Studio muuttunut? päivitä manifesti)`);
      else if (!sisalla(laatikot[i], ikkunaAlue)) tulos.varoitukset.push(`merkintä ${x.numero} osin ikkunan ulkopuolella`);
    });
    if (tulos.virheet.length > 0) return { tulos };

    // Numerot kohteiden viereen (ikkunan sisään), sitten rajaus: annetut
    // rajauksen kohteet + merkinnät numeroineen + reunus, tai koko ikkuna.
    const osat = await mittaaOsat();
    const sijoitetut = sijoitaNumerot(
      merkinnat.map((x, i) => ({
        numero: x.numero,
        laatikko: laatikot[i] as Laatikko,
        kehys: Boolean(x.kehys),
        paikka: x.paikka,
        osat: osat[i],
      })),
      ikkunaAlue,
    );
    const rajaus = m.rajaus ?? {};
    let alue = ikkunaAlue;
    if (rajaus !== "ikkuna") {
      const rajat = await Promise.all((rajaus.kohteet ?? []).map((k) => laatikko(page, k)));
      (rajaus.kohteet ?? []).forEach((k, i) => {
        if (!rajat[i]) tulos.virheet.push(`rajauksen kohde puuttuu: ${kuvaaKohde(k)}`);
      });
      if (tulos.virheet.length > 0) return { tulos };
      const kaikki = [...(rajat as Laatikko[]), ...sijoitetut.flatMap((s) => [s.kehys ?? s.laatikko, ...(s.lisakehykset ?? []), ympyranAlue(s)])];
      const reunus = laajenna(yhdiste(kaikki) as Laatikko, rajaus.reunus ?? 24);
      alue = rajaaIkkunaan(vahintaan(reunus, rajaus.minLeveys ?? 480, rajaus.minKorkeus ?? 0), ikkuna);
    }
    for (const s of sijoitetut) {
      if (s.ahdas) tulos.varoitukset.push(`numero ${s.numero} ei mahtunut kohteen viereen: piirretty kohteen sisään`);
      if (!sisalla(ympyranAlue(s), alue) || !sisalla(s.kehys ?? s.laatikko, alue)) {
        tulos.varoitukset.push(`merkintä ${s.numero} on rajauksen ulkopuolella`);
      }
    }

    // Henkilötiedot: rajauksen näkyvä teksti ennen merkintöjä.
    const osumat = henkilotiedotTekstissa(await nakyvaTeksti(page, alue), ajo.kielletyt, ajo.sallitutSahkopostit);
    for (const o of osumat) tulos.virheet.push(`henkilötieto kuvassa, ei tallenneta: ${o}`);

    const sivulla = await sivunVirheet(page);
    tulos.virheet.push(...sivulla.virheet, ...sivunVirheetKeratty);
    tulos.varoitukset.push(...sivulla.varoitukset);
    const kirjoitukset = ajo.kirjoitukset.slice(kirjoituksiaEnnen);
    if (kirjoitukset.length > 0) {
      const viesti = `Studio yritti kirjoittaa (estetty): ${[...new Set(kirjoitukset)].join(", ")}`;
      if (m.kirjoittaa) tulos.varoitukset.push(`${viesti} (odotettu: kuva kirjoittaa kenttään)`);
      else tulos.virheet.push(viesti);
    }
    if (tulos.virheet.length > 0) return { tulos };

    await piirraMerkinnat(page, sijoitetut);
    const png = await page.screenshot({ clip: alue, animations: "disabled", caret: "hide", scale: "device" });
    await poistaMerkinnat(page);

    const webp = await sharp(png).webp({ quality: 90, effort: 6 }).toBuffer();
    const meta = await sharp(webp).metadata();
    const koko: KuvaKoko = {
      leveys: meta.width ?? 0,
      korkeus: meta.height ?? 0,
      skaala: LAITTEET[laite].deviceScaleFactor,
      sanity: SANITY_VERSIO,
    };
    tulos.koko = { leveys: koko.leveys, korkeus: koko.korkeus };
    const polku = join(KUVAKANSIO, `${m.id}.webp`);
    tulos.ero = await pikseliero(png, polku);
    const muuttui = tulos.ero >= ERO_RAJA;
    if (TARKISTA) {
      tulos.tila = muuttui ? "muuttuisi" : "ok";
      if (muuttui && existsSync(polku)) tulos.varoitukset.push("kuva poikkeaa tallennetusta: aja ilman --tarkista ja katso kuva");
      if (!existsSync(polku)) tulos.varoitukset.push("kuvaa ei ole vielä tallennettu");
      return { tulos };
    }
    if (muuttui || PAKOTA) {
      mkdirSync(KUVAKANSIO, { recursive: true });
      writeFileSync(polku, webp);
      tulos.tila = "tallennettu";
      return { tulos, koko };
    }
    tulos.tila = "ennallaan";
    return { tulos, koko: undefined };
  } catch (e) {
    tulos.virheet.push(`poikkeus: ${(e as Error).message.split("\n")[0]}`);
    return { tulos };
  } finally {
    // Vianetsintä: OHJE_VIRHEKUVAT=<kansio> tallentaa epäonnistuneen näkymän sellaisenaan.
    if (tulos.virheet.length > 0 && process.env.OHJE_VIRHEKUVAT) {
      mkdirSync(process.env.OHJE_VIRHEKUVAT, { recursive: true });
      await page.screenshot({ path: join(process.env.OHJE_VIRHEKUVAT, `${m.id}.png`), scale: "css" }).catch(() => undefined);
    }
    await page.close().catch(() => undefined);
    // Esikatselu asettaa luonnostilan evästeen; seuraaviin kuviin ei sivuston esikatselupalkkia.
    // Kirjautuminen on localStoragessa, ei evästeissä.
    await context.clearCookies().catch(() => undefined);
  }
}

// ─────────────────────────────── kuvat.json ───────────────────────────────

interface KuvaKoko {
  leveys: number;
  korkeus: number;
  /** Laitteen pikselisuhde: CSS-leveys = leveys / skaala. */
  skaala: number;
  /** Sanity-versio, jolla kuva otettiin. */
  sanity: string;
}

function lueKoot(): Record<string, KuvaKoko> {
  if (!existsSync(KOOT)) return {};
  try {
    return JSON.parse(readFileSync(KOOT, "utf-8")) as Record<string, KuvaKoko>;
  } catch {
    return {};
  }
}

async function kirjoitaKoot(paivitetyt: Map<string, KuvaKoko>): Promise<void> {
  const koot = lueKoot();
  for (const [id, k] of paivitetyt) koot[id] = k;
  // Koko ajossa manifestista poistetut kuvat pois myös koista (kuvatiedosto poistetaan käsin).
  if (!VAIN) for (const id of Object.keys(koot)) if (!KUVAT.some((m) => m.id === id)) delete koot[id];
  // Tallennettu kuva ilman merkintää (esim. kuvat.json poistettu): koko tiedostosta.
  for (const m of KUVAT) {
    const polku = join(KUVAKANSIO, `${m.id}.webp`);
    if (!koot[m.id] && existsSync(polku)) {
      const meta = await sharp(readFileSync(polku)).metadata();
      koot[m.id] = {
        leveys: meta.width ?? 0,
        korkeus: meta.height ?? 0,
        skaala: LAITTEET[m.laite ?? "tietokone"].deviceScaleFactor,
        sanity: SANITY_VERSIO,
      };
    }
  }
  const jarjestetty = Object.fromEntries(Object.entries(koot).sort(([a], [b]) => a.localeCompare(b)));
  const uusi = `${JSON.stringify(jarjestetty, null, 2)}\n`;
  if (!existsSync(KOOT) || readFileSync(KOOT, "utf-8") !== uusi) {
    mkdirSync(KUVAKANSIO, { recursive: true });
    writeFileSync(KOOT, uusi);
  }
}

// ─────────────────────────────── Ajo ───────────────────────────────

async function main() {
  const alku = Date.now();
  lataaYmparisto();
  const projectId = projektinTunnus();
  const token = kirjautumistoken();

  const valitut = VAIN ? KUVAT.filter((k) => VAIN.includes(k.id)) : KUVAT;
  const tuntemattomat = (VAIN ?? []).filter((id) => !KUVAT.some((k) => k.id === id));
  if (tuntemattomat.length > 0) throw new Error(`--vain: tuntemattomat kuvat ${tuntemattomat.join(", ")}`);
  const kaksoset = KUVAT.map((k) => k.id).filter((id, i, a) => a.indexOf(id) !== i);
  if (kaksoset.length > 0) throw new Error(`Manifestissa sama id kahdesti: ${kaksoset.join(", ")}`);

  loki(`Ohjeen kuvat: ${BASE_URL}/studio, ${valitut.length} kuvaa${TARKISTA ? " (tarkistus, ei kirjoiteta mitään)" : ""}.`);
  await tarkistaPalvelin(BASE_URL);

  const { tilaukset, virheet: tilausvirheet } = lueTilaukset(JUURI);

  const selain: Browser = await chromium.launch({ headless: !NAYTA });
  const kirjoitukset: string[] = [];
  const kontekstit = new Map<string, BrowserContext>();
  const konteksti = async (laite: keyof typeof LAITTEET, korkeus?: number, leveys?: number) => {
    const avain = `${laite}-${korkeus ?? ""}-${leveys ?? ""}`;
    const olemassa = kontekstit.get(avain);
    if (olemassa) return olemassa;
    const c = await luoStudioKonteksti(selain, {
      projectId,
      token,
      asetukset: {
        ...LAITTEET[laite],
        viewport: { width: leveys ?? LAITTEET[laite].viewport.width, height: korkeus ?? LAITTEET[laite].viewport.height },
        locale: "fi-FI",
        timezoneId: "Europe/Helsinki",
        colorScheme: "light",
        reducedMotion: "reduce",
      },
      localStorage: { "sanityStudio:ui:colorScheme": "light" },
    });
    await estaKirjoitukset(c, (k) => kirjoitukset.push(k));
    await anonymisoiKayttajat(c);
    kontekstit.set(avain, c);
    return c;
  };

  try {
    // 1. Datasetti Studion omista pyynnöistä. Ensimmäinen lataus kääntää Studion (dev).
    const tunnistus = await (await konteksti("tietokone")).newPage();
    const datasetit = seuraaDatasetteja(tunnistus);
    await tunnistus.goto(`${BASE_URL}/studio/structure`, { waitUntil: "domcontentloaded", timeout: ENSIMMAINEN_AIKARAJA_MS });
    const loppu = Date.now() + ENSIMMAINEN_AIKARAJA_MS;
    while (datasetit.size === 0 && Date.now() < loppu) await tunnistus.waitForTimeout(250);
    await tunnistus.close();
    const studionDatasetit = [...datasetit];
    if (studionDatasetit.length !== 1 || studionDatasetit[0] !== SALLITTU_DATASETTI) {
      throw new Error(
        `Studio käyttää datasettiä ${studionDatasetit.join(", ") || "(ei tunnistettu)"}; ohjeen kuvat otetaan vain ` +
          `${SALLITTU_DATASETTI}-datasetistä. Käynnistä palvelin: NEXT_PUBLIC_SANITY_DATASET=${SALLITTU_DATASETTI} npm run dev`,
      );
    }
    const dataset = studionDatasetit[0];
    loki(`Datasetti: ${dataset} (Studion pyynnöistä)`);
    const client = createClient({ projectId, dataset, token, apiVersion: "2025-02-19", useCdn: false, perspective: "raw" });

    // 2. Siemen (keksitty esimerkkidata) developmentiin.
    if (valitut.some((k) => k.siemen)) {
      if (EI_SIEMENTA) {
        const puuttuvat = await puuttuvaSiemen(client);
        if (puuttuvat.length > 0) loki(`⚠ Siemen puuttuu (${puuttuvat.join(", ")}); siementä tarvitsevat kuvat voivat epäonnistua.`);
      } else {
        const { kirjoitetut, ennallaan } = await kirjoitaSiemen(client, dataset);
        loki(`Siemen: ${kirjoitetut.length} kirjoitettu${kirjoitetut.length ? ` (${kirjoitetut.join(", ")})` : ""}, ${ennallaan.length} ennallaan.`);
      }
    }

    // 3. Henkilötiedot, joita kuvissa ei saa näkyä.
    const { nimet: kielletyt, sallitutSahkopostit, varoitukset } = await kielletytNimet(client, projectId);
    loki(`Henkilötietojen tarkistus: ${kielletyt.length} kiellettyä nimeä, sähköpostit muualta kuin esimerkki.fi.`);
    for (const v of varoitukset) loki(`⚠ ${v}`);
    loki("");

    // 4. Kuvat yksi kerrallaan (sama ikkuna ja data joka ajolla).
    const ajo: Ajo = { konteksti, kirjoitukset, kielletyt, sallitutSahkopostit, tilaukset, ensimmainen: false };
    const tulokset: Tulos[] = [];
    const paivitetyt = new Map<string, KuvaKoko>();
    for (const m of valitut) {
      const { tulos, koko } = await kuvaa(ajo, m);
      tulos.varoitukset = [...new Set(tulos.varoitukset)];
      tulos.virheet = [...new Set(tulos.virheet)];
      tulokset.push(tulos);
      if (koko) paivitetyt.set(m.id, koko);
      tulosta(tulos);
    }
    if (!TARKISTA) await kirjoitaKoot(paivitetyt);

    // 5. Yhteenveto ja tilausten kattavuus.
    const tilaamattomat = [...tilaukset.values()].filter((t) => !KUVAT.some((k) => k.id === t.id));
    const virheelliset = tulokset.filter((t) => t.virheet.length > 0);
    loki("");
    loki("Yhteenveto");
    loki(`  Tallennettu ${tulokset.filter((t) => t.tila === "tallennettu").length}, ennallaan ${tulokset.filter((t) => t.tila === "ennallaan").length}, virheitä ${virheelliset.length}, kesto ${((Date.now() - alku) / 1000).toFixed(0)} s`);
    if (TARKISTA) loki(`  Muuttuisi ${tulokset.filter((t) => t.tila === "muuttuisi").length} (tarkistus: mitään ei kirjoitettu)`);
    for (const v of tilausvirheet) loki(`⚠ ${v}`);
    if (tilaamattomat.length > 0) {
      loki(`⚠ Tilattu korteissa, puuttuu manifestista (${tilaamattomat.length}):`);
      for (const t of tilaamattomat) loki(`    ${t.id} (${t.kortti}${t.nakyma ? `: ${t.nakyma}` : ""})`);
    }
    if (!VAIN) {
      const orvot = Object.keys(lueKoot()).filter((id) => !KUVAT.some((k) => k.id === id));
      if (orvot.length > 0) loki(`⚠ kuvat.json:ssa kuvia, joita manifesti ei tunne: ${orvot.join(", ")}`);
    }
    if (!TARKISTA) {
      mkdirSync(join(JUURI, "data"), { recursive: true });
      writeFileSync(RAPORTTI, `${rivit.join("\n")}\n`);
      console.log(`Raportti: data/ohjekuvat-raportti.txt`);
    }
    if (virheelliset.length > 0) {
      console.log(`✗ ${virheelliset.length} / ${tulokset.length} kuvaa epäonnistui.`);
      process.exitCode = 1;
    } else {
      console.log(`✓ ${tulokset.length} kuvaa kunnossa.`);
    }
  } finally {
    await selain.close();
  }
}

main().catch((e: unknown) => {
  console.error(`✗ Ohjeen kuvat keskeytyivät: ${(e as Error).message}`);
  process.exit(1);
});
