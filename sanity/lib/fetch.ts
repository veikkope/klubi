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
 * Kiintiö (docs/decisions/001-sanity-kiintio.md): haut kulkevat oletuksena
 * Sanityn CDN:n kautta, ja sivun data tarkistetaan varmuuden vuoksi viiden
 * minuutin välein. Julkaisun päivittää webhook heti (app/api/revalidate).
 * Suora rajapinta (`useCdn: false`) on varattu sisällölle, jonka lähettäjän
 * pitää nähdä oma muutoksensa heti (kommentit), ja kirjoituksille.
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
import { onKiintioTaynna } from "./kiintio";
import { hasSanity, readToken, studioUrl } from "../env";

type FetchOptions<T> = {
  query: string;
  params?: Record<string, unknown>;
  /** Cache tags revalidointia varten (esim. webhook). */
  tags?: string[];
  /** Palautetaan jos Sanity ei ole konfiguroitu tai tulos on null. Ei virheen sattuessa. */
  fallback: T;
  /**
   * Oletus true = Sanityn CDN, jonka kiintiö on nelinkertainen suoraan
   * rajapintaan verrattuna. Suoran rajapinnan kiintiö loppui 14.10.2026, kun
   * jokainen haku meni sinne minuutin välein (docs/decisions/001).
   *
   * Hinta: CDN voi harvoin palauttaa julkaisun jälkeen vielä vanhan tuloksen
   * (e2e-arvioijasaanto 4.10.2026: poistettu ravintola näkyi ~10 min). Viiden
   * minuutin tarkistusväli korjaa sen itsestään.
   *
   * false vain, kun lähettäjän pitää nähdä oma muutoksensa heti (kommentit,
   * updateTag). Buildissa käytetään aina CDN:ää: satoja sivuja rinnakkain
   * suoraan rajapintaan ylitti pyyntörajan (4.10.2026).
   */
  useCdn?: boolean;
  /**
   * Sekunteina, kuinka usein välimuistissa oleva tulos tarkistetaan Sanitystä
   * varmuuden vuoksi. Julkaisut päivittää webhook heti; tämä väli hoitaa
   * ajastetut sisällöt (uutisen julkaisuaika, etusivun nosto, ottelut) ja CDN:n
   * viiveen. Oletus 300 (5 min).
   */
  revalidate?: number;
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

/** Välimuistissa olevan tuloksen varmistusväli (s), ks. `revalidate`. */
export const TARKISTUSVALI_S = 300;

const PYYNTORAJAN_YRITYKSET = 5;

function onPyyntoraja(error: unknown): boolean {
  return (error as { statusCode?: number } | null)?.statusCode === 429;
}

export async function sanityFetch<T>({
  query,
  params,
  tags,
  fallback,
  useCdn: pyydettyCdn = true,
  revalidate = TARKISTUSVALI_S,
  vainJulkaistu = false,
}: FetchOptions<T>): Promise<T> {
  if (!hasSanity || !client) {
    return fallback;
  }

  const useCdn = pyydettyCdn || process.env.NEXT_PHASE === "phase-production-build";
  const isDraft = readToken && !vainJulkaistu ? await isDraftEnabled() : false;

  // Luonnosnäkymässä ohitetaan CDN ja välimuisti, ja stega-koodaus kytketään
  // päälle jotta Presentationin klikkaa-ja-muokkaa-peittokuva löytää kentät.
  let activeClient = isDraft
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
  // Pyyntörajan ylitystä (429) se ei yritä: build hakee yli tuhat sivua
  // rinnakkain, ja raja ylittyi 8.10.2026 kahdesti, kun samalta koneelta
  // ajettiin samaan aikaan muuta Sanity-liikennettä. Siksi odotetaan ja yritetään
  // uudelleen (1, 2, 4, 8 ja 16 s) ennen kuin virhe kaataa buildin. Kolme
  // yritystä ei riittänyt, kun välimuisti oli juuri tyhjentynyt datan muutosten jälkeen.
  // Suoran rajapinnan kuukausikiintiön loppuessa (402) haku tehdään CDN:n
  // kautta, jonka kiintiö on erillinen: sivu näkyy hieman vanhemmalla datalla
  // sen sijaan, että koko sivusto kaatuisi kuun loppuun asti (14.10.2026).
  try {
    for (let yritys = 0; ; yritys++) {
      try {
        const result = await activeClient.fetch<T | null>(query, params ?? {}, {
          next: isDraft ? { revalidate: 0 } : { tags, revalidate },
        });
        return result ?? fallback;
      } catch (error) {
        if (onKiintioTaynna(error) && !activeClient.config().useCdn) {
          console.warn(`[sanityFetch] rajapinnan kiintiö täynnä, haetaan CDN:stä (${tags?.join(", ") || "ei tageja"})`);
          activeClient = activeClient.withConfig({ useCdn: true });
          continue;
        }
        if (yritys >= PYYNTORAJAN_YRITYKSET || !onPyyntoraja(error)) throw error;
        await new Promise((valmis) => setTimeout(valmis, 1000 * 2 ** yritys));
      }
    }
  } catch (error) {
    const syy = error instanceof Error ? error.message : String(error);
    console.error(`[sanityFetch] kysely epäonnistui (${tags?.join(", ") || "ei tageja"}): ${syy}`);
    throw new Error(`Sanity-kysely epäonnistui (${tags?.join(", ") || "ei tageja"}): ${syy}`, { cause: error });
  }
}
