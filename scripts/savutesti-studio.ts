/**
 * Sanity Studion savutesti selaimessa (Playwright).
 *
 * Miksi: 8.10.2026 kaksi Studion ajonaikaista kaatumista pääsi tuotantoon,
 * vaikka type-check, `npm test`, `sanity schema validate`, build ja
 * katselmukset menivät läpi: kaikki rikasSisalto-tekstieditorit kaatuivat
 * ("Cannot read properties of undefined (reading 'map')") ja tilastoryhmän
 * avaus kaatoi rakennetyökalun ("template not found: tilasto-karsinta").
 * Ne näkyvät vasta, kun Studio avataan selaimessa. Tämä testi avaa sen.
 *
 * Ajo: kehityspalvelin käynnissä (`npm run dev`), sitten
 *   npm run savutesti:studio                     # http://localhost:3000
 *   BASE_URL=https://… npm run savutesti:studio  # muu osoite
 *   RINNAKKAIN=2 npm run savutesti:studio        # välilehtiä (oletus 4)
 *   NAYTA=1 npm run savutesti:studio             # selain näkyviin
 *   VAIN=jalkapalloarkisto,tilasto npm run savutesti:studio
 *       # vain näkymät, joiden nimessä tai osoitteessa on jokin sanoista
 *       # (rakenteesta juuri ja sanaa sisältävät polut). Nopea tarkistus
 *       # yhden osan muutokselle; ennen pushia aja koko testi.
 *
 * Kesto: kehityspalvelimella noin 3–5 min (230+ näkymää). Ensimmäinen
 * Studion lataus kääntää Studion; sen jälkeen näkymät avataan ladatun
 * Studion sisällä (ei uutta latausta), virheen jälkeen täydellä latauksella.
 * Epäonnistunut näkymä uusitaan kerran täydellä latauksella: oikea kaatuminen
 * toistuu, hitaudesta johtuva aikakatkaisu ei (uusinnat näkyvät ↻-merkillä).
 *
 * Kirjautuminen: Sanity CLI:n token (`npx sanity login` →
 * ~/.config/sanity/config.json) tai `SANITY_AUTH_TOKEN`. Token asetetaan
 * Studion localStorageen (`__studio_auth_token_<projectId>` = {token, time},
 * sanity 5.31.2 `getAuthTokenStorageKey`). Tokenia ei tulosteta.
 *
 * Datasetti: sama, jota käynnissä oleva Studio käyttää (luetaan Studion
 * omista pyynnöistä, koska `.env.local` voi osoittaa eri datasettiin kuin
 * palvelin, joka on käynnistetty esim. NEXT_PUBLIC_SANITY_DATASET=development).
 * `DATASET=…` pakottaa datasetin; jos se ei täsmää Studioon, testi keskeytyy.
 *
 * Mitä avataan (jokainen on oma rivinsä, ✓ tai ✗):
 *  1. Aloitus (/studio) ja rakennetyökalu (/studio/structure).
 *  2. Jokainen dokumenttityyppi: datasetistä "rikkain" dokumentti (eniten
 *     erilaisia lohkoja tekstikentissä) intent-osoitteella. Lomakkeen
 *     kenttäryhmät (välilehdet) klikataan läpi, jotta jokainen kenttä
 *     renderöityy.
 *  3. Jokainen rakenteen lista: rakenne kävellään selaimessa läpi alkaen
 *     juuresta (jokainen listan kohta, dokumenttilistasta ensimmäinen
 *     dokumentti). Listojen + -painikkeen pohjat kerätään ja avataan.
 *  4. Jokainen pohja (sanity/pohjat.ts `pohjat()`): intent-osoitteella,
 *     parametrilliset pohjat parametreineen (payload, kuten Studio itse).
 *  5. Listojen kohteet: jokaisen dokumenttityypin jokaisen listakentän
 *     jokaisesta kohdetyypistä (esim. taulukko, kuvasarja, huomio tekstissä)
 *     yksi datasetissä oleva kohde avataan muokkausikkunaan (`path=`).
 *
 * Virhe = sivun käsittelemätön poikkeus (pageerror), console.error (paitsi
 * tunnetut harmittomat, ks. HARMITTOMAT), Studion virheteksti sivulla
 * (VIRHETEKSTIT, @sanity/locale-fi-fi:n virherajat ja englanninkieliset
 * vastineet), Studion virhenäkymä, tai aikakatkaisu ennen kuin näkymä on
 * valmis (lomake renderöity, lista ladattu).
 *
 * Testi EI muuta dataa: se vain navigoi. Pohjan avaaminen ei luo dokumenttia
 * ennen muokkausta. Varmuuden vuoksi kaikki kirjoituspyynnöt Sanityyn
 * (data/mutate, data/actions, assets) estetään ja merkitään virheeksi.
 *
 * Ei kuulu `npm test`iin eikä CI:hin: tarvitsee tokenin ja käynnissä olevan
 * palvelimen. Aja Studio- ja skeemamuutosten jälkeen ennen pushia (CLAUDE.md).
 *
 * Tunnettu rajaus: kokoontaitetut kenttäryhmät (collapsed: true) jäävät
 * kiinni; niissä on vain lukukenttiä (uutisen Blogspot-tiedot, ravintolan
 * aiempi arvosana, toiminnan linkki).
 */
import { createClient, type SanityClient } from "@sanity/client";
import { chromium, type BrowserContext, type ConsoleMessage, type Page } from "playwright";
import { createSchema, type Template } from "sanity";

import {
  estaKirjoitukset,
  kirjautumistoken,
  lataaYmparisto,
  luoStudioKonteksti,
  odota as odotaEhtoa,
  projektinTunnus,
  seuraaDatasetteja,
  sivunVirheet,
  tarkistaPalvelin,
} from "./lib/studio-selain";
import { OSIOSIVUT } from "../lib/osiosivut";
import { TILASTO_KATEGORIAT } from "../lib/tilasto-kategoriat";
import { pohjat } from "../sanity/pohjat";
import { schemaTypes } from "../sanity/schemas";

const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const RINNAKKAIN = Math.max(1, Number(process.env.RINNAKKAIN ?? 4));
const NAYTA = Boolean(process.env.NAYTA);
/** Rajaus (VAIN=sana,sana): vain näkymät, joiden nimessä tai osoitteessa on jokin sanoista. */
const VAIN = (process.env.VAIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const rajattu = (t: { nimi: string; polku: string; osat?: string[] }) =>
  VAIN.length > 0 && !(t.osat?.length === 0) && !VAIN.some((s) => `${t.nimi} ${t.polku}`.toLowerCase().includes(s.toLowerCase()));
/** Näkymän valmistumisen enimmäisaika. Ensimmäinen lataus kääntää Studion (dev), siksi pidempi. */
const AIKARAJA_MS = 30_000;
const ENSIMMAINEN_AIKARAJA_MS = 180_000;
/** Valmiin näkymän jälkeen: myöhässä tulevat virheet (esim. tekstieditorin kiinnitys). */
const ASETTUMINEN_MS = 1_200;
/** Rakenteen syvyysraja (turva silmukoita vastaan). */
const MAKSIMISYVYYS = 7;

// Studion virhe- ja varoitustekstit (VIRHETEKSTIT, VAROITUSTEKSTIT), kirjautuminen,
// kirjoitusten esto ja datasetin tunnistus: scripts/lib/studio-selain.ts.

/**
 * Tunnetut harmittomat console.error-viestit (säännöllinen lauseke → peruste).
 * Lisää tähän vain, kun syy on selvitetty; muut console.errorit ovat virheitä.
 */
const HARMITTOMAT: readonly { malli: RegExp; peruste: string }[] = [
  {
    // Esikatselu, kuvat ja Sanityn telemetria latautuvat kolmansilta palvelimilta;
    // keskeytetty lataus (sivu vaihtuu kesken) ei ole Studion virhe. Estetyt
    // kirjoitukset raportoidaan erikseen (kirjoitusyritykset).
    malli: /^Failed to load resource: net::ERR_(ABORTED|FAILED)/,
    peruste: "keskeytetty resurssin lataus sivua vaihdettaessa",
  },
  {
    // Studio tarkistaa uusimman Sanity-version Sanityn CDN:stä (sanity-cdn.com/v1/modules).
    // CDN:n tilapäinen 5xx-vastaus ei vaikuta Studioon, joka käyttää paketin omaa versiota.
    malli: /^Failed to load resource: the server responded with a status of 5\d\d .*\(https:\/\/sanity-cdn\.com\//,
    peruste: "Sanityn CDN:n versiotarkistuksen tilapäinen 5xx (ei projektin koodia)",
  },
  {
    // Verkkoyhteyden katkos Sanityn API:in (8.10.2026 kehityskoneella toistuvasti
    // ERR_HTTP2_PROTOCOL_ERROR ja ERR_QUIC_PROTOCOL_ERROR). Studio yrittää uudelleen;
    // jos näkymä ei silti valmistu, se näkyy aikakatkaisuna tai Studion virhetekstinä.
    malli: /^Failed to load resource: net::ERR_[A-Z0-9_]+ \(https:\/\/[a-z0-9]+\.api(cdn)?\.sanity\.io\//,
    peruste: "verkkokatkos Sanityn API:in (Studio yrittää uudelleen)",
  },
  {
    // Sanityn reaaliaikakuuntelun (EventSource) aikakatkaisu: yhteys avataan
    // automaattisesti uudelleen. Kuormitetulla koneella tai hitaalla verkolla.
    malli: /^Error: No activity within \d+ milliseconds\. No response received\. Reconnecting\./,
    peruste: "reaaliaikakuuntelun uudelleenyhdistys (ei projektin koodia)",
  },
  {
    // Selaimen oma ilmoitus, kun Sanityn WebSocket-yhteydelle (läsnäolo) lähetetään
    // viesti sen jo sulkeuduttua, esim. näkymää vaihdettaessa tai yhteyden katketessa.
    malli: /^WebSocket is already in CLOSING or CLOSED state\. \(\/_next\/static\/chunks\/node_modules_%40sanity_/,
    peruste: "Sanityn WebSocket-viesti suljetulle yhteydelle (näkymän vaihto, ei projektin koodia)",
  },
];

// ─────────────────────────────── Asetukset ───────────────────────────────

lataaYmparisto();
const projectId = projektinTunnus();
const token = kirjautumistoken();

// ─────────────────────────────── Skeema ───────────────────────────────

type Kentta = { name: string; type: SkeemaTyyppi };
type SkeemaTyyppi = {
  name: string;
  jsonType?: string;
  type?: SkeemaTyyppi;
  fields?: Kentta[];
  of?: SkeemaTyyppi[];
  hidden?: unknown;
  components?: { input?: unknown };
};

const skeema = createSchema({ name: "savutesti", types: schemaTypes });

/** Dokumenttityypit skeemasta (sanity.*-järjestelmätyypit pois). */
const DOKUMENTTITYYPIT: string[] = schemaTypes
  .filter((t) => (t as { type?: string }).type === "document" && !t.name.startsWith("sanity."))
  .map((t) => t.name);

function periytyy(tyyppi: SkeemaTyyppi | undefined, nimi: string): boolean {
  for (let t = tyyppi; t; t = t.type) if (t.name === nimi) return true;
  return false;
}

/** Dokumenttityypin ylimmän tason listakentät ja niiden kohdetyypit. */
function listakentat(tyyppi: string): { kentta: string; jasenet: string[]; teksti: boolean }[] {
  const t = skeema.get(tyyppi) as SkeemaTyyppi | undefined;
  return (t?.fields ?? [])
    .filter((k) => k.type.jsonType === "array" && (k.type.of ?? []).some((j) => j.jsonType === "object"))
    // Piilotettu kenttä ja oma syöte (taulukkoeditori) eivät avaa kohdetta Sanityn ikkunaan.
    .filter((k) => k.type.hidden !== true && !k.type.components?.input)
    .map((k) => ({
      kentta: k.name,
      teksti: (k.type.of ?? []).some((j) => periytyy(j, "block")),
      // Tekstikappaleet ja viittaukset muokataan paikallaan: ei muokkausikkunaa.
      jasenet: (k.type.of ?? [])
        .filter((j) => j.jsonType === "object" && !periytyy(j, "block") && !periytyy(j, "reference"))
        .map((j) => j.name),
    }));
}

// ─────────────────────────────── Tulokset ───────────────────────────────

type Laji = "aloitus" | "rakenne" | "dokumentti" | "kohde";
type Ryhma = "Aloitus" | "Tyypit" | "Rakenne" | "Pohjat" | "Kohteet";

interface Tehtava {
  ryhma: Ryhma;
  nimi: string;
  /** Studion polku (alkaa /studio). */
  polku: string;
  laji: Laji;
  /** Rakenteen polun osat (laji rakenne). */
  osat?: string[];
  /** Kohteen polku (laji kohde), esim. body[_key=="abc"]. */
  kohde?: string;
}

interface Tulos {
  tehtava: Tehtava;
  virheet: string[];
  varoitukset: string[];
  ms: number;
  /** Rakenteesta löytyneet uudet tehtävät. */
  uudet: Tehtava[];
  /** Ensimmäisen yrityksen virheet, jos näkymä onnistui vasta uusinnassa. */
  uusinta?: string[];
}

const ohitetut = new Map<string, number>();
const kirjoitusyritykset: string[] = [];

// ─────────────────────────────── Selain ───────────────────────────────

/** Sivun keräin: kuuntelijat kirjoittavat käynnissä olevan tehtävän listaan. */
type Keraaja = { virheet: string[]; kesken: Promise<void>[] };
const keraimet = new WeakMap<Page, Keraaja>();

/**
 * React ja Next kirjaavat virheet muotoilumerkkijonolla (`console.error("%o", virhe)`),
 * jolloin viestin teksti on pelkkä "%o". Virheen oma viesti haetaan argumenteista.
 */
async function konsolinTeksti(m: ConsoleMessage): Promise<string> {
  const teksti = m.text();
  if (!/^%[osdifcO]/.test(teksti)) return teksti;
  // Ensimmäinen argumentti on muotoilumerkkijono; virhe ja komponenttipino tulevat sen jälkeen.
  const osat = await Promise.all(
    m
      .args()
      .slice(1)
      .map((a) =>
        a.evaluate((v) => (v instanceof Error ? `${v.name}: ${v.message}` : typeof v === "string" ? v : "")).catch(() => ""),
      ),
  );
  return osat.map((o) => o.trim()).find(Boolean) ?? teksti;
}

function kuuntele(page: Page) {
  page.on("pageerror", (e) => keraimet.get(page)?.virheet.push(`pageerror: ${e.message.split("\n")[0]}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const keraaja = keraimet.get(page);
    const kasittely = konsolinTeksti(m).then((teksti) => {
      const { url, lineNumber } = m.location();
      const lahde = url ? ` (${url.replace(BASE_URL, "")}:${lineNumber})` : "";
      // Malli tarkistetaan viestistä lähteineen (esim. palvelin, jolta lataus epäonnistui).
      const harmiton = HARMITTOMAT.find((h) => h.malli.test(`${teksti}${lahde}`));
      if (harmiton) {
        ohitetut.set(harmiton.peruste, (ohitetut.get(harmiton.peruste) ?? 0) + 1);
        return;
      }
      keraaja?.virheet.push(`console.error: ${teksti.split("\n")[0].slice(0, 300)}${lahde}`);
    });
    keraaja?.kesken.push(kasittely);
  });
}

/** Odottaa ehtoa; palauttaa false aikarajalla tai jos sivulle tuli virheteksti. */
const odota = (page: Page, ehto: string, aikaraja = AIKARAJA_MS) => odotaEhtoa(page, ehto, aikaraja);

const LOMAKE_VALMIS = `document.querySelector('[data-testid="document-pane"] [data-testid="form-view"]')`;

/**
 * Dokumentin kenttäryhmät. Studio näyttää ne välilehtinä tai, kun paneeli on
 * kapea (monta paneelia auki), valintalistana (`field-group-select`).
 * Odottaa ryhmiä, jos tyypillä niitä on (lomake renderöityy vaiheittain).
 */
async function ryhmat(page: Page, odotaMs: number): Promise<string[]> {
  // Vain näkyvä ohjain: sisäkkäisillä objekteilla voi olla omat (piilotetut) ryhmänsä.
  const lomake = page.locator('[data-testid="document-pane"] [data-testid="form-view"]');
  const ohjain = lomake.locator('[data-testid="field-group-tabs"]:visible, [data-testid="field-group-select"]:visible').first();
  if (odotaMs > 0) await ohjain.waitFor({ timeout: odotaMs }).catch(() => undefined);
  if ((await ohjain.count()) === 0) return [];
  if ((await ohjain.getAttribute("data-testid")) === "field-group-select") {
    return ohjain.locator("option").evaluateAll((o) => o.map((e) => (e as HTMLOptionElement).value));
  }
  const tunnukset = await ohjain.locator('[data-testid^="group-tab-"]').evaluateAll((v) => v.map((e) => e.getAttribute("data-testid") ?? ""));
  return tunnukset.map((t) => t.replace(/^group-tab-/, ""));
}

async function valitseRyhma(page: Page, ryhma: string): Promise<void> {
  const lomake = page.locator('[data-testid="document-pane"] [data-testid="form-view"]');
  const valilehti = lomake.locator(`[data-testid="group-tab-${ryhma}"]:visible`).first();
  const valinta = lomake.locator('[data-testid="field-group-select"]:visible').first();
  if ((await valilehti.count()) > 0) await valilehti.click({ timeout: 5_000 }).catch(() => undefined);
  else if ((await valinta.count()) > 0) await valinta.selectOption(ryhma, { timeout: 5_000 }).catch(() => undefined);
  await page.waitForTimeout(400);
}

/** Valitsee jokaisen kenttäryhmän vuorollaan, jotta jokainen kenttä renderöityy. */
async function kayRyhmat(page: Page, odotaMs: number): Promise<void> {
  for (const ryhma of await ryhmat(page, odotaMs)) await valitseRyhma(page, ryhma);
}

/**
 * Kauanko kenttäryhmiä odotetaan: tyypillä, jolla skeeman mukaan on ryhmiä,
 * 10 s; tuntemattomalla tyypillä (rakenteen dokumentti) hetki.
 */
function ryhmienOdotus(tyyppi: string | undefined): number {
  if (!tyyppi) return 1_500;
  const t = skeema.get(tyyppi) as { groups?: unknown[] } | undefined;
  return (t?.groups?.length ?? 0) > 0 ? 10_000 : 0;
}

/** Tyyppi intent-polusta (type=…). */
const polunTyyppi = (polku: string) => polku.match(/[;/]type=([^;/]+)/)?.[1];

/** Rakenteen viimeisen paneelin tiedot. */
type Paneeli = { maara: number; laji: "lista" | "dokumenttilista" | "dokumentti"; linkit: string[]; tyhja: boolean };

async function viimeinenPaneeli(page: Page, etuliite: string): Promise<Paneeli> {
  return page.evaluate((etu) => {
    const paneelit = [...document.querySelectorAll<HTMLElement>("[data-pane-index]")];
    const viimeinen = paneelit.sort((a, b) => Number(a.dataset.paneIndex) - Number(b.dataset.paneIndex)).at(-1);
    const onDokumentti =
      viimeinen?.getAttribute("data-testid") === "document-pane" ||
      Boolean(viimeinen?.querySelector('[data-testid="document-pane"]'));
    const onDokumenttilista = Boolean(viimeinen?.querySelector('[data-testid="document-list-pane"]'));
    const linkit = [...(viimeinen?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? [])]
      .map((a) => decodeURI(new URL(a.href).pathname))
      .filter((h) => h.startsWith(etu) && !h.slice(etu.length).includes(";"));
    const teksti = viimeinen?.innerText ?? "";
    return {
      maara: paneelit.length,
      laji: onDokumentti ? "dokumentti" : onDokumenttilista ? "dokumenttilista" : "lista",
      linkit: [...new Set(linkit)],
      tyhja: teksti.includes("Tuloksia ei löytynyt") || teksti.includes("Tämän tyyppisiä dokumentteja ei ole"),
    } as const;
  }, etuliite);
}

/** Listan + -painikkeen pohjat (intent-linkit). Avaa valikon ja sulkee sen. */
async function listanPohjat(page: Page): Promise<{ nimi: string; href: string }[]> {
  const viimeinen = page.locator("[data-pane-index]").last();
  const yksi = viimeinen.locator('[data-testid="action-intent-button"]');
  if ((await yksi.count()) > 0) {
    const href = await yksi.first().getAttribute("href");
    return href ? [{ nimi: (await yksi.first().getAttribute("aria-label")) ?? "Luo", href }] : [];
  }
  const monta = viimeinen.locator('[data-testid="multi-action-intent-button"]');
  if ((await monta.count()) === 0) return [];
  await monta.first().click({ timeout: 5_000 });
  const valikko = page.locator('[role="menu"] a[href*="/intent/create/"]');
  await valikko.first().waitFor({ timeout: 5_000 }).catch(() => undefined);
  const pohjat: { nimi: string; href: string }[] = [];
  for (let i = 0; i < (await valikko.count()); i++) {
    const href = await valikko.nth(i).getAttribute("href");
    if (href) pohjat.push({ nimi: ((await valikko.nth(i).innerText()) ?? "").split("\n")[0].trim(), href });
  }
  await page.keyboard.press("Escape");
  return pohjat;
}

const nahdytPohjaLinkit = new Set<string>();

/** Sivut, joilla Studio on ladattu ja ehjä: seuraava näkymä avataan Studion sisällä. */
const ehjatStudiot = new WeakSet<Page>();

/** Studion sisäinen siirtyminen (sama kuin linkin klikkaus): ei uutta latausta. */
async function studionSisalla(page: Page, polku: string): Promise<void> {
  await page.evaluate((p) => {
    history.pushState(null, "", p);
    dispatchEvent(new PopStateEvent("popstate", { state: null }));
  }, polku);
}

/**
 * Avaa näkymän. Studion käynnistys kehityspalvelimelta vie selaimelta
 * sekunteja, joten ladattu Studio käytetään uudelleen: ensin tyhjä näkymä
 * (tuntematon työkalu, joka purkaa rakennetyökalun kokonaan, jotta edellisen
 * näkymän paneelit eivät sekoitu seuraavaan), sitten kohde. Virheen jälkeen
 * Studio ladataan kokonaan uudelleen.
 */
async function siirry(page: Page, polku: string, aikaraja: number): Promise<void> {
  if (ehjatStudiot.has(page)) {
    await studionSisalla(page, "/studio/savutesti-tyhja");
    const tyhja = await page
      .waitForFunction(() => !document.querySelector("[data-pane-index], [data-testid='form-view']"), undefined, {
        timeout: 10_000,
      })
      .then(() => true)
      .catch(() => false);
    if (tyhja) return studionSisalla(page, polku);
  }
  await page.goto(BASE_URL + polku, { waitUntil: "domcontentloaded", timeout: aikaraja });
}

async function suorita(page: Page, t: Tehtava, aikaraja: number): Promise<Tulos> {
  const keraaja: Keraaja = { virheet: [], kesken: [] };
  keraimet.set(page, keraaja);
  const alku = Date.now();
  const virheet: string[] = [];
  const varoitukset: string[] = [];
  const uudet: Tehtava[] = [];
  try {
    if (t.laji === "aloitus") ehjatStudiot.delete(page);
    await siirry(page, t.polku, aikaraja);

    if (t.laji === "aloitus") {
      if (!(await odota(page, `document.querySelector("h1")`, aikaraja))) virheet.push("näkymä ei valmistunut aikarajassa");
    }

    if (t.laji === "dokumentti" || t.laji === "kohde") {
      if (!(await odota(page, LOMAKE_VALMIS, aikaraja))) {
        // Osoite kertoo, mihin Studio ohjasi (esim. väärä rakenteen polku: tyhjä paneeli).
        virheet.push(`lomake ei renderöitynyt aikarajassa (${decodeURIComponent(page.url().replace(BASE_URL, ""))})`);
      } else if (t.laji === "dokumentti") {
        await kayRyhmat(page, ryhmienOdotus(polunTyyppi(t.polku)));
      } else if (t.kohde) {
        // Kohteen muokkausikkuna: sama kuin klikkaus listan kohteeseen (polku osoitteeseen).
        // Kenttä voi olla toisessa kenttäryhmässä: ensin Kaikki kentät.
        if ((await ryhmat(page, ryhmienOdotus(polunTyyppi(t.polku)))).includes("all-fields")) {
          await valitseRyhma(page, "all-fields");
        }
        const ikkuna = `document.querySelector('[role="dialog"], [data-ui="Popover"] [data-testid], #document-panel-portal [data-ui="Dialog"]')`;
        // Raskaan dokumentin lomake voi olla vielä täyttymässä, jolloin Studio ohittaa
        // polun: yritetään uudelleen (polku pois ja takaisin), kuten käyttäjä klikkaisi.
        let auki = false;
        for (let yritys = 0; yritys < 3 && !auki; yritys++) {
          await page.waitForTimeout(yritys === 0 ? 1_000 : 1_500);
          await page.evaluate((kohde) => {
            const url = new URL(location.href);
            const ilman = url.pathname.replace(/,path=[^;/]*$/, "");
            history.pushState(null, "", ilman);
            dispatchEvent(new PopStateEvent("popstate", { state: null }));
            url.pathname = `${ilman},path=${encodeURIComponent(kohde)}`;
            history.pushState(null, "", url);
            dispatchEvent(new PopStateEvent("popstate", { state: null }));
          }, t.kohde);
          auki = await odota(page, ikkuna, 12_000);
        }
        if (!auki) virheet.push("kohteen muokkausikkuna ei avautunut");
      }
    }

    if (t.laji === "rakenne") {
      const osat = t.osat ?? [];
      const etuliite = osat.length === 0 ? "/studio/structure/" : `/studio/structure/${osat.join(";")};`;
      const paneeleja = osat.length + 1;
      // Viimeinen paneeli on valmis, kun se on lista, dokumenttilista tai dokumentti
      // (ennen sitä Studio näyttää latauspaneelin).
      const valmisPaneeli = `(() => {
        const p = [...document.querySelectorAll("[data-pane-index]")];
        if (p.length < ${paneeleja}) return false;
        const v = p.sort((a, b) => Number(a.dataset.paneIndex) - Number(b.dataset.paneIndex)).at(-1);
        return ["structure-tool-list-pane", "document-pane"].includes(v.getAttribute("data-testid"))
          || Boolean(v.querySelector('[data-testid="document-list-pane"], [data-testid="document-pane"]'));
      })()`;
      if (!(await odota(page, valmisPaneeli, aikaraja))) {
        virheet.push(`rakenteen paneelit eivät avautuneet (odotettiin ${paneeleja})`);
      } else {
        let p = await viimeinenPaneeli(page, etuliite);
        if (p.laji === "dokumentti") {
          if (!(await odota(page, LOMAKE_VALMIS, aikaraja))) virheet.push("lomake ei renderöitynyt aikarajassa");
          // Kenttäryhmät käydään läpi tyyppikohtaisesti (Tyypit); rakenteessa riittää avaus.
        } else if (p.laji === "dokumenttilista") {
          const valmis = await odota(
            page,
            `(() => { const p = [...document.querySelectorAll("[data-pane-index]")].at(-1); const t = p?.innerText ?? "";
              return [...p.querySelectorAll("a[href]")].some((a) => decodeURI(new URL(a.href).pathname).startsWith(${JSON.stringify(etuliite)}))
                || t.includes("Tuloksia ei löytynyt") || t.includes("Tämän tyyppisiä dokumentteja ei ole"); })()`,
            aikaraja,
          );
          if (!valmis) virheet.push("dokumenttilista ei latautunut aikarajassa");
          p = await viimeinenPaneeli(page, etuliite);
          const eka = p.linkit[0];
          if (eka && osat.length < MAKSIMISYVYYS) {
            const id = eka.slice(etuliite.length).split(",")[0];
            uudet.push({ ryhma: "Rakenne", nimi: `${t.nimi} → ensimmäinen (${id})`, polku: eka.split(",")[0], laji: "rakenne", osat: [...osat, id] });
          }
        } else {
          for (const linkki of p.linkit) {
            const id = linkki.slice(etuliite.length).split(",")[0];
            if (!id || osat.length >= MAKSIMISYVYYS) continue;
            uudet.push({ ryhma: "Rakenne", nimi: `${t.nimi} → ${id}`, polku: `${etuliite}${id}`, laji: "rakenne", osat: [...osat, id] });
          }
        }
        if (p.laji !== "dokumentti" && virheet.length === 0) {
          for (const pohja of await listanPohjat(page).catch(() => [])) {
            const polku = decodeURI(new URL(pohja.href, BASE_URL).pathname + new URL(pohja.href, BASE_URL).search);
            if (nahdytPohjaLinkit.has(polku)) continue;
            nahdytPohjaLinkit.add(polku);
            uudet.push({ ryhma: "Pohjat", nimi: `${t.nimi} → + ${pohja.nimi}`, polku, laji: "dokumentti" });
          }
        }
      }
    }

    await page.waitForTimeout(ASETTUMINEN_MS);
    const sivulla = await sivunVirheet(page);
    virheet.push(...sivulla.virheet);
    varoitukset.push(...sivulla.varoitukset);
  } catch (e) {
    virheet.push(`poikkeus: ${(e as Error).message.split("\n")[0]}`);
  }
  await Promise.all(keraaja.kesken);
  virheet.push(...keraaja.virheet);
  if (virheet.length === 0) ehjatStudiot.add(page);
  else ehjatStudiot.delete(page);
  keraimet.delete(page);
  return { tehtava: t, virheet: [...new Set(virheet)], varoitukset: [...new Set(varoitukset)], ms: Date.now() - alku, uudet };
}

// ─────────────────────────────── Data ───────────────────────────────

/** Studion käyttämä datasetti sen omista pyynnöistä. */
async function studionDatasetti(context: BrowserContext): Promise<{ dataset: string | undefined; tulos: Tulos }> {
  const page = await context.newPage();
  kuuntele(page);
  const datasetit = seuraaDatasetteja(page);
  const tulos = await suorita(page, { ryhma: "Rakenne", nimi: "Sisältö (/studio/structure)", polku: "/studio/structure", laji: "rakenne", osat: [] }, ENSIMMAINEN_AIKARAJA_MS);
  await page.close();
  return { dataset: [...datasetit][0], tulos };
}

/** GROQ: tekstikenttien erilaisten lohkotyyppien määrä ja lohkojen määrä. */
function rikkaus(tyyppi: string): string {
  const tekstit = listakentat(tyyppi).filter((k) => k.teksti).map((k) => k.kentta);
  if (tekstit.length === 0) return "0";
  const tyypit = tekstit.map((k) => `coalesce(${k}[]._type, [])`).join(" + ");
  const maarat = tekstit.map((k) => `coalesce(count(${k}), 0)`).join(" + ");
  return `count(array::unique(${tyypit})) * 1000 + ${maarat}`;
}

const julkaistuId = (id: string) => id.replace(/^drafts\./, "");

async function rikkaimmat(client: SanityClient): Promise<Map<string, string>> {
  const rivit = await Promise.all(
    DOKUMENTTITYYPIT.map(async (tyyppi) => {
      const id = await client.fetch<string | null>(
        `*[_type == $tyyppi && !(_id in path("versions.**"))]{ _id, "r": ${rikkaus(tyyppi)} } | order(r desc, _updatedAt desc)[0]._id`,
        { tyyppi },
      );
      return [tyyppi, id ? julkaistuId(id) : null] as const;
    }),
  );
  return new Map(rivit.filter((r): r is readonly [string, string] => Boolean(r[1])));
}

/** Jokaisen tyypin jokaisen listakentän jokaisesta kohdetyypistä yksi kohde. */
async function kohteet(client: SanityClient): Promise<Tehtava[]> {
  const haut = DOKUMENTTITYYPIT.flatMap((tyyppi) =>
    listakentat(tyyppi).flatMap(({ kentta, jasenet }) =>
      jasenet.map(async (jasen) => {
        const rivi = await client.fetch<{ _id: string; avain: string } | null>(
          `*[_type == $tyyppi && !(_id in path("versions.**")) && defined(${kentta}[_type == $jasen][0]._key)]
            | order(_updatedAt desc)[0]{ _id, "avain": ${kentta}[_type == $jasen][0]._key }`,
          { tyyppi, jasen },
        );
        if (!rivi) return null;
        const id = julkaistuId(rivi._id);
        return {
          ryhma: "Kohteet",
          nimi: `${tyyppi}.${kentta}: ${jasen} (${id})`,
          polku: `/studio/intent/edit/id=${id};type=${tyyppi}/`,
          laji: "kohde",
          kohde: `${kentta}[_key=="${rivi.avain}"]`,
        } satisfies Tehtava;
      }),
    ),
  );
  return (await Promise.all(haut)).filter((t): t is NonNullable<typeof t> => t !== null);
}

/** Base64url kuten Sanityn reititin (encodeJsonParams). */
const payload = (arvot: object) => Buffer.from(JSON.stringify(arvot), "utf-8").toString("base64url");

async function pohjaTehtavat(client: SanityClient): Promise<Tehtava[]> {
  // Sanityn oletuspohjat: yksi jokaiselle dokumenttityypille (tunnus = tyyppi).
  const oletukset: Template[] = DOKUMENTTITYYPIT.map((tyyppi) => ({ id: tyyppi, title: tyyppi, schemaType: tyyppi, value: {} }));
  const ravintola = await client.fetch<string | null>(`*[_type == "ravintola" && !(_id in path("drafts.**"))][0]._id`);
  const parametrit: Record<string, string | undefined> = {
    slug: OSIOSIVUT[0]?.slug,
    ravintolaId: ravintola ?? undefined,
    category: TILASTO_KATEGORIAT[0]?.value,
  };
  return pohjat(oletukset).map((pohja) => {
    const nimet = (pohja.parameters ?? []).map((p) => p.name);
    const puuttuvat = nimet.filter((n) => !parametrit[n]);
    if (puuttuvat.length > 0) {
      throw new Error(`Pohjan ${pohja.id} parametrille ${puuttuvat.join(", ")} ei ole testiarvoa: lisää se savutestin parametreihin.`);
    }
    const arvot = Object.fromEntries(nimet.map((n) => [n, parametrit[n]]));
    const loppu = nimet.length > 0 ? `${payload(arvot)}` : "";
    return {
      ryhma: "Pohjat",
      nimi: `${pohja.id}${nimet.length > 0 ? ` ${JSON.stringify(arvot)}` : ""}`,
      polku: `/studio/intent/create/template=${pohja.id};type=${pohja.schemaType}/${loppu}`,
      laji: "dokumentti",
    } satisfies Tehtava;
  });
}

// ─────────────────────────────── Ajo ───────────────────────────────

function tulosta(t: Tulos) {
  const merkki = t.virheet.length > 0 ? "✗" : "✓";
  const varoitus = t.varoitukset.length > 0 ? " (varoitus)" : "";
  console.log(`${merkki} [${t.tehtava.ryhma}] ${t.tehtava.nimi} — ${(t.ms / 1000).toFixed(1)} s${varoitus}`);
  for (const v of t.virheet) console.log(`    ✗ ${v}`);
  for (const v of t.varoitukset) console.log(`    ⚠ ${v}`);
  if (t.uusinta && t.virheet.length === 0) console.log(`    ↻ onnistui uusinnassa (1. yritys: ${t.uusinta[0]})`);
}

async function main() {
  const alku = Date.now();
  console.log(`Studion savutesti: ${BASE_URL}/studio, ${RINNAKKAIN} välilehteä rinnakkain.`);
  if (VAIN.length > 0) console.log(`Rajaus: vain ${VAIN.join(", ")} (osittainen ajo, ei korvaa koko testiä).`);
  await tarkistaPalvelin(BASE_URL);

  // Ilman QUIC:ia (HTTP/3): Sanityn API:n QUIC-yhteydet katkeilivat (ERR_QUIC_PROTOCOL_ERROR),
  // mikä hidasti näkymiä kymmeniä sekunteja ja kaatoi satunnaisesti pohjien haut.
  const selain = await chromium.launch({ headless: !NAYTA, args: ["--disable-quic"] });
  /**
   * Jokaiselle välilehdelle oma konteksti: Studio pitää auki kymmeniä
   * reaaliaikakuunteluja, ja saman kontekstin välilehdet jakavat HTTP/2-yhteyden
   * Sanityn API:in. Yhteisellä yhteydellä rinnakkaiset välilehdet jumittivat
   * toisiaan (näkymät kymmeniä sekunteja, kuuntelut aikakatkaistiin).
   */
  const uusiKonteksti = async () => {
    const konteksti = await luoStudioKonteksti(selain, {
      projectId,
      token,
      asetukset: { viewport: { width: 1800, height: 1000 }, locale: "fi-FI" },
    });
    // Testi ei saa muuttaa dataa: kirjoituspyynnöt estetään ja kirjataan virheeksi.
    await estaKirjoitukset(konteksti, (kuvaus) => kirjoitusyritykset.push(kuvaus));
    return konteksti;
  };
  const context = await uusiKonteksti();

  const tulokset: Tulos[] = [];
  const kirjaa = (t: Tulos) => {
    tulokset.push(t);
    tulosta(t);
  };

  // Ensimmäinen lataus: Studio käännetään (dev) ja datasetti luetaan Studion pyynnöistä.
  const { dataset: studionDataset, tulos: rakenneTulos } = await studionDatasetti(context);
  kirjaa(rakenneTulos);
  await context.close();
  const dataset = process.env.DATASET ?? studionDataset ?? "development";
  if (studionDataset && dataset !== studionDataset) {
    throw new Error(`DATASET=${dataset}, mutta Studio käyttää datasettiä ${studionDataset}.`);
  }
  console.log(`Datasetti: ${dataset}${studionDataset ? " (Studion pyynnöistä)" : " (oletus)"}`);

  const client = createClient({ projectId, dataset, token, apiVersion: "2025-02-19", useCdn: false, perspective: "raw" });
  const [ids, kohdeTehtavat, pohjaLista] = await Promise.all([rikkaimmat(client), kohteet(client), pohjaTehtavat(client)]);
  // Listan + -valikon pohja, joka on sama kuin pohjat()-pohja ilman parametreja, avataan vain kerran.
  for (const p of pohjaLista) nahdytPohjaLinkit.add(p.polku);

  const jono: Tehtava[] = [
    { ryhma: "Aloitus", nimi: "Aloitus (/studio)", polku: "/studio", laji: "aloitus" },
    ...rakenneTulos.uudet,
    ...DOKUMENTTITYYPIT.map((tyyppi): Tehtava => {
      const id = ids.get(tyyppi);
      return id
        ? { ryhma: "Tyypit", nimi: `${tyyppi} (${id})`, polku: `/studio/intent/edit/id=${id};type=${tyyppi}/`, laji: "dokumentti" }
        : { ryhma: "Tyypit", nimi: `${tyyppi} (ei dokumentteja: avataan uutena)`, polku: `/studio/intent/create/type=${tyyppi}/`, laji: "dokumentti" };
    }),
    ...pohjaLista,
    ...kohdeTehtavat,
  ];
  const ilmanDataa = DOKUMENTTITYYPIT.filter((t) => !ids.has(t));

  // Työjono: rakenteen tehtävät lisäävät uusia (alilistat, ensimmäinen dokumentti, listan pohjat).
  let kesken = 0;
  await Promise.all(
    Array.from({ length: RINNAKKAIN }, async () => {
      let konteksti = await uusiKonteksti();
      let page = await konteksti.newPage();
      kuuntele(page);
      for (;;) {
        const t = jono.shift();
        if (!t) {
          if (kesken === 0) break;
          await new Promise((r) => setTimeout(r, 200));
          continue;
        }
        if (rajattu(t)) continue;
        kesken += 1;
        let tulos = await suorita(page, t, AIKARAJA_MS);
        if (tulos.virheet.length > 0) {
          // Uusinta täydellä latauksella: kuormitettu kone tai kehityspalvelimen
          // uudelleenkäännös (toinen muokkaa koodia) voi kaataa yksittäisen näkymän.
          // Oikea kaatuminen toistuu uusinnassa; vain uusinnan tulos ratkaisee.
          // Uusi konteksti: myös uudet verkkoyhteydet (jumittunut yhteys ei periydy).
          await konteksti.close();
          konteksti = await uusiKonteksti();
          page = await konteksti.newPage();
          kuuntele(page);
          const uusi = await suorita(page, t, AIKARAJA_MS);
          tulos = { ...uusi, uudet: [...tulos.uudet, ...uusi.uudet], uusinta: tulos.virheet };
        }
        jono.push(...tulos.uudet);
        kirjaa(tulos);
        kesken -= 1;
      }
      await konteksti.close();
    }),
  );
  await selain.close();

  // ── Yhteenveto ──
  const virheelliset = tulokset.filter((t) => t.virheet.length > 0);
  const maara = (r: Ryhma) => tulokset.filter((t) => t.tehtava.ryhma === r).length;
  console.log("");
  console.log("Yhteenveto");
  console.log(`  Dokumenttityypit: ${DOKUMENTTITYYPIT.length} (${maara("Tyypit")} avattu${ilmanDataa.length ? `; ilman dokumentteja, avattu uutena: ${ilmanDataa.join(", ")}` : ""})`);
  console.log(`  Rakenteen näkymät: ${maara("Rakenne")} (listat, alilistat ja listojen ensimmäiset dokumentit)`);
  const listoilta = tulokset.filter((t) => t.tehtava.ryhma === "Pohjat" && t.tehtava.nimi.includes(" → + ")).length;
  console.log(
    `  Pohjat: ${maara("Pohjat")} (${maara("Pohjat") - listoilta}/${pohjaLista.length} pohjat()-pohjaa intentillä, ${listoilta} listojen + -painikkeista)`,
  );
  console.log(`  Listojen kohteet muokkausikkunassa: ${maara("Kohteet")}`);
  console.log(`  Näkymiä yhteensä: ${tulokset.length}, kesto ${((Date.now() - alku) / 1000).toFixed(0)} s`);
  if (ohitetut.size > 0) {
    console.log("  Ohitetut tunnetut console.error-viestit:");
    for (const [peruste, n] of ohitetut) console.log(`    ${n} × ${peruste}`);
  }
  const uusitut = tulokset.filter((t) => t.uusinta && t.virheet.length === 0).length;
  if (uusitut > 0) console.log(`  ↻ ${uusitut} näkymää onnistui vasta uusinnassa (hitaus tai palvelimen uudelleenkäännös).`);
  const varoituksia = tulokset.filter((t) => t.varoitukset.length > 0).length;
  if (varoituksia > 0) console.log(`  ⚠ Sisältövaroituksia ${varoituksia} näkymässä (data, ei koodi: korjaa Studiossa).`);
  if (kirjoitusyritykset.length > 0) {
    console.log(`✗ Studio yritti kirjoittaa ${kirjoitusyritykset.length} kertaa (estetty):`);
    for (const k of new Set(kirjoitusyritykset)) console.log(`    ${k}`);
  }
  if (virheelliset.length > 0 || kirjoitusyritykset.length > 0) {
    console.log(`✗ ${virheelliset.length} / ${tulokset.length} näkymää epäonnistui:`);
    for (const t of virheelliset) console.log(`    ${t.tehtava.nimi}: ${t.virheet[0]}`);
    process.exit(1);
  }
  console.log(`✓ Kaikki ${tulokset.length} näkymää avautuivat ilman virheitä.`);
}

main().catch((e: unknown) => {
  console.error(`✗ Savutesti keskeytyi: ${(e as Error).message}`);
  process.exit(1);
});
