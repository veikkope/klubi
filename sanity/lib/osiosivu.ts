/**
 * Osioiden sivujen haku (docs/24 askel 3, lib/osiosivut.ts).
 *
 * Reitti hakee lukitun `sivu`-dokumentin polullaan ja laskee tekstit
 * `ratkaiseOsioSivu`-funktiolla: jos dokumenttia tai kenttää ei ole, käytetään
 * koodin oletusta, joten sivu toimii myös ennen kuin dokumentit on luotu.
 *
 * Välimuistitagi on vain `sivu:<polku>` (docs/24 §2.5): yleinen `sivu`-tagi
 * tyhjentäisi kaikki 30 sivua minkä tahansa sivun tai taulukon muutoksesta.
 */
import { cache } from "react";
import { defineQuery } from "next-sanity";

import {
  osioSivu,
  ratkaiseOsioSivu,
  type OsioSivuDoc,
  type OsioSivuSlug,
  type OsioSivunTekstit,
} from "@/lib/osiosivut";
import { sanityFetch } from "@/sanity/lib/fetch";

export const osioSivuQuery = defineQuery(`
  *[_type == "sivu" && slug.current == $slug][0]{
    _updatedAt,
    title,
    tiivistelma,
    ingress,
    korttiteksti,
    seoTitle,
    seoDescription
  }
`);

/** Arkiston etusivun korttien tekstit osioiden sivuilta. */
export const osioSivujenKortitQuery = defineQuery(`
  *[_type == "sivu" && slug.current in $slugit]{ "slug": slug.current, korttiteksti }
`);

export type OsioSivunKortti = { slug: string | null; korttiteksti: string | null };

/**
 * Sivun tekstit. `cache`: generateMetadata ja sivu kutsuvat tätä samassa
 * pyynnössä, ja haku tehdään vain kerran.
 */
export const haeOsioSivu = cache(async (slug: OsioSivuSlug): Promise<OsioSivunTekstit> => {
  const o = osioSivu(slug);
  if (!o) throw new Error(`Tuntematon osion sivu: ${slug}`);
  const doc = await sanityFetch<OsioSivuDoc | null>({
    query: osioSivuQuery,
    params: { slug },
    tags: [`sivu:${slug}`],
    fallback: null,
  });
  return ratkaiseOsioSivu(doc, o);
});

/**
 * Korttitekstit polun mukaan. Tagit ovat polkukohtaiset (`sivu:<polku>`),
 * jotta muiden sivujen muutokset eivät tyhjennä arkiston etusivua.
 */
export async function haeOsioSivujenKorttitekstit(slugit: readonly OsioSivuSlug[]): Promise<Map<string, string>> {
  const rivit = await sanityFetch<OsioSivunKortti[]>({
    query: osioSivujenKortitQuery,
    params: { slugit: [...slugit] },
    tags: slugit.map((slug) => `sivu:${slug}`),
    fallback: [],
  });
  const tekstit = new Map<string, string>();
  for (const rivi of rivit) {
    const teksti = rivi.korttiteksti?.trim();
    if (rivi.slug && teksti) tekstit.set(rivi.slug, teksti);
  }
  return tekstit;
}
