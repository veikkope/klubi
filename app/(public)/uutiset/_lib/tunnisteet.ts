import { stegaClean } from "next-sanity";
import { cache } from "react";

import { kokoaTunnisteet, tunnisteSlug, type Tunniste } from "@/lib/tunnisteet";
import { sanityFetch } from "@/sanity/lib/fetch";
import { uutisetTunnisteetQuery, type TunnisteRivi } from "@/sanity/lib/queries/uutiset";

/**
 * Kaikkien uutisten tunnistelistat ja niistä koottu hakemisto. Yksi kysely per
 * pyyntö (`cache`): tunnistesivu, sen metadata ja uutislistan hakuvinkki
 * käyttävät samaa tulosta. Välimuisti tyhjenee `uutinen`-tagilla kuten muutkin
 * uutiskyselyt.
 */
export const haeTunnisteet = cache(async (): Promise<{ listat: string[][]; tunnisteet: Tunniste[] }> => {
  const rivit = await sanityFetch<TunnisteRivi[]>({
    query: uutisetTunnisteetQuery,
    tags: ["uutinen"],
    fallback: [],
  });
  // Luonnosnäkymässä merkkijonoissa on näkymättömiä stega-merkkejä: ne
  // rikkoisivat `$nimet`-vertailun, otsikon ja linkit.
  const listat = rivit.map((rivi) => stegaClean(rivi.tunnisteet));
  return { listat, tunnisteet: kokoaTunnisteet(listat) };
});

/** Tunniste osoitteen slugista, tai null jos sellaista ei ole. */
export async function haeTunniste(slug: string): Promise<Tunniste | null> {
  const { tunnisteet } = await haeTunnisteet();
  return tunnisteet.find((tunniste) => tunniste.slug === slug) ?? null;
}

/**
 * Kävijän kirjoittama tai vanha osoite ("Valko-Venäjä", "HUUHKAJAT") → kanoninen
 * slug. Next.js antaa parametrin %-koodattuna tai purettuna ympäristöstä
 * riippuen, joten puretaan varoen.
 */
export function kanoninenSlug(parametri: string): string {
  let purettu = parametri;
  try {
    purettu = decodeURIComponent(parametri);
  } catch {
    // jo purettu tai rikkinäinen koodaus: käytetään sellaisenaan
  }
  return tunnisteSlug(purettu);
}
