/**
 * Sanity Studion avaaminen selaimessa skripteistä (Playwright): yhteiset osat
 * savutestille (`scripts/savutesti-studio.ts`) ja ohjeen kuvakaappauksille
 * (`scripts/ohjekuvat.ts`).
 *
 * - Kirjautuminen: Sanity CLI:n token (`npx sanity login` →
 *   ~/.config/sanity/config.json) tai `SANITY_AUTH_TOKEN`. Token asetetaan
 *   Studion localStorageen (`__studio_auth_token_<projectId>` = {token, time},
 *   sanity 5.31.2 `getAuthTokenStorageKey`). Tokenia ei tulosteta.
 * - Kirjoitusten esto: kaikki kirjoituspyynnöt Sanityyn (data/mutate,
 *   data/actions, assets) estetään selaimessa ja kirjataan.
 * - Datasetti: luetaan Studion omista pyynnöistä (palvelin voi käyttää eri
 *   datasettiä kuin `.env.local`, esim. NEXT_PUBLIC_SANITY_DATASET=development).
 * - Virhetekstit: Studion virherajojen tekstit sivulla (@sanity/locale-fi-fi).
 */
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import type { Browser, BrowserContext, BrowserContextOptions, Page } from "playwright";

// ─────────────────────────────── Asetukset ───────────────────────────────

/** Lataa `.env.local`-tiedoston, jos se on olemassa (projektin tunnus ym.). */
export function lataaYmparisto(): void {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
}

export function kirjautumistoken(): string {
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN;
  const cli = join(homedir(), ".config", "sanity", "config.json");
  if (existsSync(cli)) {
    try {
      const token = (JSON.parse(readFileSync(cli, "utf-8")) as { authToken?: string }).authToken;
      if (token) return token;
    } catch {
      // käsitellään alla
    }
  }
  throw new Error("Kirjautumistoken puuttuu: aja `npx sanity login` tai aseta SANITY_AUTH_TOKEN.");
}

export function projektinTunnus(): string {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID puuttuu (.env.local).");
  return projectId;
}

/** Tarkistaa, että Studio vastaa; muuten selkeä virhe. */
export async function tarkistaPalvelin(baseUrl: string): Promise<void> {
  const vastaus = await fetch(`${baseUrl}/studio`).catch(() => null);
  if (!vastaus?.ok) throw new Error(`${baseUrl}/studio ei vastaa: käynnistä ensin \`npm run dev\`.`);
}

// ─────────────────────────────── Virhetekstit ───────────────────────────────

/**
 * Studion virhetekstit sivulla. Suomenkieliset @sanity/locale-fi-fi:stä
 * (avain suluissa), englanninkieliset varmuuden vuoksi (lokalisoimattomat
 * virherajat ja kirjaston omat viestit).
 */
export const VIRHETEKSTIT: readonly string[] = [
  "Käsittelemätön suoritusaikainen virhe", // form.error.unhandled-runtime-error.title
  "Dokumenttieditorin renderöinti epäonnistui", // document-pane.error.text
  "Dokumenttiluettelon renderöinti epäonnistui", // document-list-pane.error.text
  "Rakenteen lukemisessa havaittiin virhe", // structure-error.header.text
  "Luettelokohteita ei voitu noutaa", // panes.document-list-pane.error.title
  "Alkuarvoa ei voitu ratkaista", // document.initial-value.error.title
  "Alkuarvoa ei voi selvittää", // inputs.array.error.cannot-resolve-initial-value-title
  "Dokumenttia ei löytynyt", // panes.document-pane.document-not-found.title
  "Tämän kentän muutosten renderöinti aiheutti virheen", // changes.error-boundary.title
  "Odottamaton virhe", // inputs.array.error.unexpected-error, member-field-error
  "Skeemaa ei löytynyt", // form.input.target.error.schema-not-found
  "Rakenteen polku", // structure-error.structure-path.label
  "Unhandled runtime error",
  "Encountered an error while reading structure",
  "Failed to render",
  "template not found",
  "Template not found",
  "Cannot read properties of",
  "is not a function",
  "is not iterable",
  "Something went wrong",
  "An error occurred",
  "Minified React error",
];

/**
 * Sisältöongelmat, jotka estävät muokkauksen mutta johtuvat datasta eivätkä
 * koodista (esim. vanha migraatio). Raportoidaan varoituksena, ei virheenä.
 */
export const VAROITUSTEKSTIT: readonly string[] = [
  "Puuttuvat avaimet", // form.error.missing-keys-alert.title
  "Ei-uniikit avaimet", // form.error.duplicate-keys-alert.title
  "Virheelliset listan arvot", // form.error.mixed-array-alert.title
  "ei kelpaa tähän listaan", // inputs.array.error.type-is-incompatible-prompt
];

/** Sivulla näkyvät virhe- ja varoitustekstit sekä Studion virhenäkymä. */
export async function sivunVirheet(page: Page): Promise<{ virheet: string[]; varoitukset: string[] }> {
  return page.evaluate(
    ([virhetekstit, varoitustekstit]) => {
      const teksti = document.body?.innerText ?? "";
      const virheet = virhetekstit.filter((v) => teksti.includes(v)).map((v) => `sivulla: "${v}"`);
      if (document.querySelector('[data-testid="studio-error-screen"]')) virheet.push("Studion virhenäkymä");
      const varoitukset = varoitustekstit.filter((v) => teksti.includes(v)).map((v) => `sivulla: "${v}"`);
      return { virheet, varoitukset };
    },
    [VIRHETEKSTIT, VAROITUSTEKSTIT] as const,
  );
}

/**
 * Odottaa ehtoa (JavaScript-lauseke selaimessa); palauttaa false aikarajalla
 * tai jos sivulle tuli virheteksti tai Studion virhenäkymä.
 */
export async function odota(page: Page, ehto: string, aikaraja = 30_000): Promise<boolean> {
  try {
    await page.waitForFunction(
      ([ehtoKoodi, virhetekstit]) => {
        const teksti = document.body?.innerText ?? "";
        if (virhetekstit.some((v) => teksti.includes(v))) return "virhe";
        if (document.querySelector('[data-testid="studio-error-screen"]')) return "virhe";
        return new Function(`return (${ehtoKoodi})`)() ? "ok" : false;
      },
      [ehto, VIRHETEKSTIT] as const,
      { timeout: aikaraja, polling: 150 },
    );
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────── Selain ───────────────────────────────

export interface StudioKontekstinAsetukset {
  projectId: string;
  token: string;
  /** Playwrightin kontekstin asetukset (ikkunan koko, kieli, teema …). */
  asetukset?: BrowserContextOptions;
  /** Muut localStorage-arvot, jotka asetetaan ennen Studion latautumista. */
  localStorage?: Record<string, string>;
}

/**
 * Selainkonteksti, jossa Studio on kirjautunut (token localStorageen ennen
 * sivun omia skriptejä).
 */
export async function luoStudioKonteksti(selain: Browser, a: StudioKontekstinAsetukset): Promise<BrowserContext> {
  const context = await selain.newContext({ locale: "fi-FI", ...a.asetukset });
  // tsx (esbuild) lisää selaimeen lähetettyihin funktioihin __name-kutsuja.
  await context.addInitScript("globalThis.__name = (f) => f;");
  const arvot: [string, string][] = [
    [`__studio_auth_token_${a.projectId}`, JSON.stringify({ token: a.token, time: new Date().toISOString() })],
    ...Object.entries(a.localStorage ?? {}),
  ];
  await context.addInitScript((pareja) => {
    // about:blankissa (näkymien välissä) localStorage ei ole käytössä.
    if (!location.protocol.startsWith("http")) return;
    for (const [avain, arvo] of pareja) localStorage.setItem(avain, arvo);
  }, arvot);
  return context;
}

/** Sanityn kirjoituspyynnöt (data/mutate, data/actions, assets). */
export const KIRJOITUSPYYNTO = /\.api\.sanity\.io\/v[^/]+\/(data\/(mutate|actions)|assets)\//;

/**
 * Estää selaimen kaikki kirjoitukset Sanityyn. `kirjaa` saa jokaisesta
 * estetystä pyynnöstä kuvauksen ("POST /v…/data/mutate/…").
 */
export async function estaKirjoitukset(context: BrowserContext, kirjaa: (kuvaus: string) => void): Promise<void> {
  await context.route(KIRJOITUSPYYNTO, (reitti) => {
    kirjaa(`${reitti.request().method()} ${new URL(reitti.request().url()).pathname} (${new URL(reitti.request().url()).searchParams.get("tag") ?? ""})`);
    return reitti.abort();
  });
}

/**
 * Seuraa sivun Sanity-pyyntöjä ja kerää datasetit, joita Studio käyttää.
 * Palauttaa joukon, joka täyttyy pyyntöjen myötä.
 */
export function seuraaDatasetteja(page: Page): Set<string> {
  const datasetit = new Set<string>();
  page.on("request", (r) => {
    const m = r.url().match(/\.sanity\.io\/v[^/]+\/data\/(?:query|listen|doc)\/([^/?]+)/);
    if (m) datasetit.add(m[1]);
  });
  return datasetit;
}
