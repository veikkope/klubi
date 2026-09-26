/**
 * Sanity-fetch -wrapperi.
 *
 * Kolme vastuuta:
 *  1. Palauttaa oletusdataa jos Sanity-projektia ei ole konfiguroitu
 *     (NEXT_PUBLIC_SANITY_PROJECT_ID puuttuu) — sivusto toimii ennen `sanity init`
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
  /** Palautetaan jos Sanity ei ole konfiguroitu tai tulos on null. */
  fallback: T;
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
}: FetchOptions<T>): Promise<T> {
  if (!hasSanity || !client) {
    return fallback;
  }

  const isDraft = readToken ? await isDraftEnabled() : false;

  // Luonnosnäkymässä ohitetaan CDN ja välimuisti, ja stega-koodaus kytketään
  // päälle jotta Presentationin klikkaa-ja-muokkaa-peittokuva löytää kentät.
  const activeClient = isDraft
    ? client.withConfig({
        token: readToken,
        perspective: "drafts",
        useCdn: false,
        stega: { enabled: true, studioUrl },
      })
    : client;

  try {
    const result = await activeClient.fetch<T | null>(query, params ?? {}, {
      next: isDraft ? { revalidate: 0 } : { tags, revalidate: 60 },
    });
    return result ?? fallback;
  } catch (error) {
    console.error("[sanityFetch] virhe:", error);
    return fallback;
  }
}
