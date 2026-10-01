import { cache } from "react";

import { litmanenNav, rootCrumb } from "@/lib/nav-sections";
import { LITMANEN_PATH, LITMANEN_SLUG } from "@/lib/path";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  pelaajaBySlugQuery,
  type PelaajaFull,
} from "@/sanity/lib/queries/arkisto-laajennus";
import {
  lehtileikeYhteenvetoQuery,
  lehtileikkeetQuery,
  uutisetTunnisteenMukaanQuery,
  type Lehtileike,
  type LehtileikeOsio,
  type LehtileikeYhteenveto,
  type TunnisteenUutiset,
} from "@/sanity/lib/queries/lehtileikkeet";

/** Litmanen-osion sivujen yhteinen alavalikko (docs/20). */
export const litmanenSubNav = { items: litmanenNav, label: "Litmanen-osion sivut" };

/** Murupolku Litmanen-osion alasivulle. */
export function litmanenTrail(nimi: string | undefined, sivu: string) {
  return [
    rootCrumb,
    { label: "Jalkapalloarkisto", href: "/jalkapalloarkisto" },
    { label: nimi ?? "Jari Litmanen", href: LITMANEN_PATH },
    { label: sivu },
  ];
}

/**
 * Jari Litmasen pelaajadokumentti; profiili, patsas ja taulukot samasta hausta.
 * `cache`: metadata ja sivu hakevat saman dokumentin yhdellä pyynnöllä.
 */
export const haeLitmanen = cache(() =>
  sanityFetch<PelaajaFull | null>({
    query: pelaajaBySlugQuery,
    params: { slug: LITMANEN_SLUG },
    tags: ["pelaaja", `pelaaja:${LITMANEN_SLUG}`, "jalkapalloTilasto"],
    fallback: null,
  }),
);

export const haeLehtileikkeet = cache((pelaajaId: string, osio: LehtileikeOsio) =>
  sanityFetch<Lehtileike[]>({
    query: lehtileikkeetQuery,
    params: { pelaaja: pelaajaId, osio },
    tags: ["lehtileike"],
    fallback: [],
  }),
);

export const haeLehtileikeYhteenveto = cache((pelaajaId: string) =>
  sanityFetch<LehtileikeYhteenveto | null>({
    query: lehtileikeYhteenvetoQuery,
    params: { pelaaja: pelaajaId },
    tags: ["lehtileike"],
    fallback: null,
  }),
);

/**
 * Uutiset tunnisteella (esim. "litmanen"); tyhjä tunniste → ei hakua.
 * `otsikossa`: nostoihin vain uutiset, joiden otsikko vastaa (esim. "litma*").
 */
export function haeTunnisteenUutiset(tunniste: string | null | undefined, maara: number, otsikossa: string | null = null) {
  const t = tunniste?.trim().toLowerCase();
  if (!t) return Promise.resolve<TunnisteenUutiset>({ items: [], total: 0 });
  return sanityFetch<TunnisteenUutiset>({
    query: uutisetTunnisteenMukaanQuery,
    params: { tunniste: t, maara, otsikossa },
    tags: ["uutinen"],
    fallback: { items: [], total: 0 },
  });
}
