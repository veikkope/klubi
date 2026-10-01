import { defineLocations, type PresentationPluginOptions } from "sanity/presentation";

import { documentHref } from "../lib/path";

/**
 * Esikatselun "Näkyy sivuilla" -tiedot: Studio näyttää dokumentin yläpuolella
 * linkin sivulle, jolla sisältö näkyy, ja avaa sen esikatseluun. Reitti tulee
 * samasta `documentRoute`-funktiosta kuin sitemap ja ohjaukset (lib/path.ts),
 * joten linkki ei voi osoittaa väärään paikkaan.
 */
const TYYPIT = [
  "uutinen",
  "tapahtuma",
  "ravintola",
  "galleriaAlbumi",
  "arvokisa",
  "pelaaja",
  "stadion",
  "klubiToiminta",
  "sivu",
] as const;

export const locations: PresentationPluginOptions["resolve"] = {
  locations: {
    ...Object.fromEntries(
      TYYPIT.map((tyyppi) => [
        tyyppi,
        defineLocations({
          select: { title: "title", name: "name", nimi: "nimi", slug: "slug.current" },
          resolve: (doc) => {
            const href = doc?.slug ? documentHref({ _id: "", _type: tyyppi, slug: doc.slug }) : null;
            return href
              ? { locations: [{ title: doc?.title ?? doc?.name ?? doc?.nimi ?? "Sivu", href }] }
              : null;
          },
        }),
      ]),
    ),
    lehtileike: defineLocations({
      select: { id: "_id", otsikko: "otsikko", osio: "osio", pelaajaSlug: "pelaaja.slug.current" },
      resolve: (doc) => {
        const href = doc?.id
          ? documentHref({ _id: doc.id, _type: "lehtileike", osio: doc.osio, pelaajaSlug: doc.pelaajaSlug })
          : null;
        return href ? { locations: [{ title: doc?.otsikko ?? "Lehtileike", href }] } : null;
      },
    }),
    etusivu: defineLocations({ locations: [{ title: "Etusivu", href: "/" }] }),
  },
};
