/**
 * Sanity-fetch -wrapperi.
 *
 * Kolme vastuuta:
 *  1. Palauttaa oletusdataa jos Sanity-projektia ei ole konfiguroitu
 *     (NEXT_PUBLIC_SANITY_PROJECT_ID puuttuu) — sivusto toimii ennen `sanity init`.
 *     `fallback` palautetaan myös, kun kysely ei löydä mitään (null).
 *     **Virhettä ei korvata fallbackilla** (ks. alla).
 *  2. Tuottaa cache-tagit webhook-revalidointia varten
 *  3. Tarjoilee luonnokset kun Next.js:n draft mode on päällä, jolloin
 *     Sanityn Presentation-näkymä näyttää muokkaukset heti
 *
 * Draft mode ei riko staattista generointia: tuotannossa sivut renderöidään
 * etukäteen, ja vain pyynnöt joissa on draft-eväste ohittavat välimuistin.
 *
 * Käyttö palvelinkomponenteissa:
 *   const nav = await sanityFetch<NavigationData>({
 *     query: navigationQuery,
 *     tags: ["navigaatio"],
 *     fallback: defaultNavigation,
 *   });
 */

import { draftMode } from "next/headers";

import { client } from "./client";
import { hasSanity, readToken, studioUrl } from "../env";

type FetchOptions<T> = {
  query: string;
  params?: Record<string, unknown>;
  /** Cache tags revalidointia varten (esim. webhook). */
  tags?: string[];
  /** Palautetaan jos Sanity ei ole konfiguroitu tai tulos on null. Ei virheen sattuessa. */
  fallback: T;
  /**
   * Oletus false = ohita Sanityn CDN. Webhook (app/api/revalidate) tyhjentää
   * Next.js:n välimuistin heti julkaisun jälkeen, ja uudelleenrenderöinti
   * alkaa sekunneissa. CDN palauttaisi silloin vielä vanhan tuloksen, joka
   * jäisi sivun välimuistiin minuuteiksi (e2e-arvioijasaanto 4.10.2026: poistettu
   * ravintola näkyi ~10 min). Sanityyn mennään vain uudelleenrenderöinnissä,
   * joten kutsuja on vähän. true vain sisällölle, jota webhook ei päivitä.
   * Buildissa oletus on CDN: satoja sivuja rinnakkain ilman CDN:ää voi
   * törmätä Sanityn API-rajoihin, eikä buildissa ole webhook-kilpailua.
   */
  useCdn?: boolean;
  /**
   * true = vain julkaistu sisältö myös luonnosnäkymässä (draft mode). Kävijöiden
   * lähettämälle moderoitavalle sisällölle (ravintola-arvostelut): luonnos on
   * hyväksymätön arvostelu, eikä sitä saa näyttää sivulla missään tilassa.
   */
  vainJulkaistu?: boolean;
};

/** Onko draft mode päällä. Palauttaa false jos konteksti ei salli lukemista. */
async function isDraftEnabled(): Promise<boolean> {
  try {
    const { isEnabled } = await draftMode();
    return isEnabled;
  } catch {
    // draftMode() ei ole käytettävissä esim. sitemapin generoinnissa.
    return false;
  }
}

export async function sanityFetch<T>({
  query,
  params,
  tags,
  fallback,
  useCdn = process.env.NEXT_PHASE === "phase-production-build",
  vainJulkaistu = false,
}: FetchOptions<T>): Promise<T> {
  if (!hasSanity || !client) {
    return fallback;
  }

  const isDraft = readToken && !vainJulkaistu ? await isDraftEnabled() : false;

  // Luonnosnäkymässä ohitetaan CDN ja välimuisti, ja stega-koodaus kytketään
  // päälle jotta Presentationin klikkaa-ja-muokkaa-peittokuva löytää kentät.
  const activeClient = isDraft
    ? client.withConfig({
        token: readToken,
        perspective: "drafts",
        useCdn: false,
        stega: { enabled: true, studioUrl },
      })
    : useCdn
      ? client
      : client.withConfig({ useCdn: false });

  // Virhe heitetään eteenpäin eikä korvata fallbackilla (docs/16, suorituskyky-6):
  //  - ISR: jos revalidointi kaatuu, Next jatkaa viimeisimmän onnistuneen sivun
  //    tarjoamista ja yrittää seuraavalla pyynnöllä uudelleen. Fallback olisi
  //    tallentanut välimuistiin tyhjän sivun tai 404:n (null → notFound()).
  //  - Build: Sanityn katkos kaatuu buildin, jolloin Vercel pitää edellisen
  //    toimivan version, sen sijaan että julkaistaisiin tyhjä sivusto.
  //  - Ensimmäinen pyyntö sivulle, jota ei ole välimuistissa: virhesivu
  //    (app/(public)/error.tsx, "Yritä uudelleen"), ei väärää "ei löytynyt".
  // Ohimenevät verkkovirheet client yrittää itse uudelleen (5 kertaa).
  try {
    const result = await activeClient.fetch<T | null>(query, params ?? {}, {
      next: isDraft ? { revalidate: 0 } : { tags, revalidate: 60 },
    });
    return result ?? fallback;
  } catch (error) {
    const syy = error instanceof Error ? error.message : String(error);
    console.error(`[sanityFetch] kysely epäonnistui (${tags?.join(", ") || "ei tageja"}): ${syy}`);
    throw new Error(`Sanity-kysely epäonnistui (${tags?.join(", ") || "ei tageja"}): ${syy}`, { cause: error });
  }
}
