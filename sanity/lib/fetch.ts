/**
 * Sanity-fetch -wrapperi. Palauttaa oletusdataa jos Sanity-projektia ei ole
 * konfiguroitu (NEXT_PUBLIC_SANITY_PROJECT_ID puuttuu).
 *
 * Käyttö palvelinkomponenteissa:
 *   const nav = await sanityFetch<NavigationData>({
 *     query: navigationQuery,
 *     tags: ["navigaatio"],
 *     fallback: defaultNavigation,
 *   });
 */

import { client } from "./client";
import { hasSanity } from "../env";

type FetchOptions<T> = {
  query: string;
  params?: Record<string, unknown>;
  /** Cache tags revalidointia varten (esim. webhook). */
  tags?: string[];
  /** Palautetaan jos Sanity ei ole konfiguroitu tai tulos on null. */
  fallback: T;
};

export async function sanityFetch<T>({
  query,
  params,
  tags,
  fallback,
}: FetchOptions<T>): Promise<T> {
  if (!hasSanity || !client) {
    return fallback;
  }
  try {
    const result = await client.fetch<T | null>(query, params ?? {}, {
      next: { tags, revalidate: 60 },
    });
    return result ?? fallback;
  } catch (error) {
    console.error("[sanityFetch] virhe:", error);
    return fallback;
  }
}
