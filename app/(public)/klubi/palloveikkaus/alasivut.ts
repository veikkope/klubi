import type { SectionNavItem } from "@/components/layout/section-nav";
import { osioSivu } from "@/lib/osiosivut";
import { PALLOVEIKKAUS_SLUG, toHref } from "@/lib/path";
import { sanityFetch } from "@/sanity/lib/fetch";
import { klubiAlasivutQuery, type KlubiAlasivu } from "@/sanity/lib/queries/klubi";

/**
 * Palloveikkauksen hub ja veikkausten omat sivut. Jokainen veikkaus on oma
 * `sivu`-dokumenttinsa polulla `klubi/palloveikkaus/<osa>`; uuden veikkauksen
 * voi lisätä Studiossa luomalla sivun tälle polulle.
 */

export const PALLOVEIKKAUS_PATH = "/klubi/palloveikkaus";
export { PALLOVEIKKAUS_SLUG };
/** Murupolun ja välilehden nimi alasivuilla: koodin oletus (lib/osiosivut.ts). */
export const PALLOVEIKKAUS_TITLE = osioSivu(PALLOVEIKKAUS_SLUG)!.oletus.title;

export function fetchVeikkaukset() {
  return sanityFetch<KlubiAlasivu[]>({
    query: klubiAlasivutQuery,
    params: { prefix: `${PALLOVEIKKAUS_SLUG}/` },
    tags: ["sivu"],
    fallback: [],
  });
}

export function veikkausHref(veikkaus: Pick<KlubiAlasivu, "slug">): string {
  return toHref(veikkaus.slug);
}

/** Veikkausten valikko: yksi välilehti per veikkaus. */
export function veikkausNav(veikkaukset: KlubiAlasivu[]): SectionNavItem[] {
  return veikkaukset.map((veikkaus) => ({
    label: veikkaus.title,
    href: veikkausHref(veikkaus),
  }));
}
