/**
 * Tyhjät osiot piiloon (docs/23 Y24, päätös 7.10.2026).
 *
 * Osio, jossa ei ole yhtään julkaistua dokumenttia, ei näy valikossa,
 * alatunnisteessa eikä sitemapissa, ja sen sivu on noindex. Kun sihteeri
 * julkaisee ensimmäisen tapahtuman tai albumin, osio palaa itsestään.
 *
 * Puhdas moduuli: testataan komennolla `npm run test:osiot`. Haku:
 * sanity/lib/tyhjat-osiot.ts.
 */

export const PIILOTETTAVAT_OSIOT = [
  { polku: "/tapahtumat", tyyppi: "tapahtuma" },
  { polku: "/galleria", tyyppi: "galleriaAlbumi" },
] as const;

/** Osion polut, joissa ei ole sisältöä. `maarat` = polku → julkaistujen määrä. */
export function tyhjatOsiot(maarat: Partial<Record<string, number | null>>): Set<string> {
  const tyhjat = new Set<string>();
  for (const { polku } of PIILOTETTAVAT_OSIOT) {
    // Puuttuva määrä (haku epäonnistui) ei piilota: varmuuden vuoksi näytetään.
    if (maarat[polku] === 0) tyhjat.add(polku);
  }
  return tyhjat;
}

/** Osoittaako linkki tyhjään osioon (myös sen alasivut, kyselyt ja ankkurit). */
export function onTyhjassaOsiossa(href: string | null | undefined, tyhjat: ReadonlySet<string>): boolean {
  if (!href || tyhjat.size === 0) return false;
  const polku = href.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  for (const osio of tyhjat) {
    if (polku === osio || polku.startsWith(`${osio}/`)) return true;
  }
  return false;
}

type Linkki = { href?: string | null; children?: Linkki[] | null };

/** Poistaa tyhjiin osioihin osoittavat linkit, myös alavalikoista. */
export function piilotaTyhjat<T extends Linkki>(linkit: T[], tyhjat: ReadonlySet<string>): T[] {
  if (tyhjat.size === 0) return linkit;
  return linkit
    .filter((linkki) => !onTyhjassaOsiossa(linkki.href, tyhjat))
    .map((linkki) =>
      linkki.children ? { ...linkki, children: piilotaTyhjat(linkki.children, tyhjat) } : linkki,
    );
}
