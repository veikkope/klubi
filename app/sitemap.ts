import type { MetadataRoute } from "next";

import { sanityFetch } from "@/sanity/lib/fetch";
import {
  sitemapArchiveYearsQuery,
  sitemapByTypeQuery,
  sitemapTilastotQuery,
  type SitemapRow,
  type SitemapTilastoRow,
} from "@/sanity/lib/queries/sitemap";
import { documentRoute } from "@/lib/path";
import { absoluteUrl } from "@/lib/site";

/**
 * Sitemap.
 *
 * Kaksi osaa: kiinteät reitit (olemassaolo tiedetään koodista) ja
 * dokumenttipohjaiset reitit (haetaan Sanitysta). `lastModified` tulee
 * dokumentin `_updatedAt`-kentästä — ei buildin ajankohdasta, joka valehtelisi
 * hakukoneelle jokaisen deployn yhteydessä.
 *
 * Kun Sanity-projektia ei ole, dynaamiset osat jäävät tyhjiksi ja sitemap
 * sisältää kiinteät reitit. Se on oikea käytös, ei virhe.
 */

export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

/** Kiinteät reitit ja niiden suhteellinen tärkeys. */
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: Entry["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },

  { path: "/klubi", priority: 0.9, changeFrequency: "monthly" },
  { path: "/klubi/liity", priority: 0.9, changeFrequency: "yearly" },
  { path: "/klubi/toiminta", priority: 0.8, changeFrequency: "monthly" },
  { path: "/klubi/hallitus", priority: 0.7, changeFrequency: "yearly" },
  { path: "/klubi/saannot", priority: 0.5, changeFrequency: "yearly" },
  { path: "/klubi/palloveikkaus", priority: 0.6, changeFrequency: "monthly" },
  { path: "/klubi/yhteystiedot", priority: 0.8, changeFrequency: "yearly" },

  { path: "/tapahtumat", priority: 0.9, changeFrequency: "daily" },
  { path: "/uutiset", priority: 0.9, changeFrequency: "daily" },
  { path: "/uutiset/arkisto", priority: 0.5, changeFrequency: "monthly" },

  { path: "/ravintolat", priority: 0.8, changeFrequency: "weekly" },
  { path: "/ravintolat/arvostele", priority: 0.4, changeFrequency: "yearly" },

  { path: "/galleria", priority: 0.6, changeFrequency: "monthly" },

  { path: "/jalkapalloarkisto", priority: 0.8, changeFrequency: "monthly" },
  { path: "/jalkapalloarkisto/huuhkajat", priority: 0.6, changeFrequency: "monthly" },
  { path: "/jalkapalloarkisto/arvokisat", priority: 0.6, changeFrequency: "monthly" },
  { path: "/jalkapalloarkisto/mestarit", priority: 0.5, changeFrequency: "yearly" },
  { path: "/jalkapalloarkisto/valmentajat", priority: 0.5, changeFrequency: "yearly" },
  { path: "/jalkapalloarkisto/vuoden-pelaajat", priority: 0.5, changeFrequency: "yearly" },
  { path: "/jalkapalloarkisto/euroopan-paras", priority: 0.5, changeFrequency: "yearly" },
  { path: "/jalkapalloarkisto/saavutukset", priority: 0.5, changeFrequency: "yearly" },
  { path: "/jalkapalloarkisto/fifa-ranking", priority: 0.5, changeFrequency: "monthly" },
  { path: "/jalkapalloarkisto/lupaavat", priority: 0.4, changeFrequency: "yearly" },
  { path: "/jalkapalloarkisto/eurocupit", priority: 0.5, changeFrequency: "yearly" },
  { path: "/jalkapalloarkisto/pelaajat", priority: 0.5, changeFrequency: "monthly" },
  { path: "/jalkapalloarkisto/stadionit", priority: 0.5, changeFrequency: "yearly" },
  { path: "/jalkapalloarkisto/ulkomaiset-mestarit", priority: 0.4, changeFrequency: "yearly" },
  { path: "/jalkapalloarkisto/palloliitto", priority: 0.3, changeFrequency: "yearly" },
  { path: "/jalkapalloarkisto/tilastot", priority: 0.3, changeFrequency: "yearly" },
];

/** Eurocup-kilpailut ovat koodissa, eivät Sanityssa. */
const EUROCUP_SLUGS = [
  "champions-league",
  "europa-league",
  "conference-league",
  "super-cup",
  "intercontinental",
];

async function rowsFor(type: string): Promise<SitemapRow[]> {
  return sanityFetch<SitemapRow[]>({
    query: sitemapByTypeQuery,
    params: { type },
    tags: [type],
    fallback: [],
  });
}

function toEntries(
  rows: SitemapRow[],
  toPath: (slug: string) => string,
  priority: number,
  changeFrequency: Entry["changeFrequency"],
): Entry[] {
  return rows
    .filter((row): row is SitemapRow & { slug: string } => Boolean(row.slug))
    .map((row) => ({
      url: absoluteUrl(toPath(row.slug)),
      lastModified: row.updatedAt ? new Date(row.updatedAt) : undefined,
      priority,
      changeFrequency,
    }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    uutiset,
    tapahtumat,
    ravintolat,
    stadionit,
    tilastot,
    arvokisat,
    pelaajat,
    toiminta,
    albumit,
    sivut,
    arkistoRows,
  ] = await Promise.all([
    rowsFor("uutinen"),
    rowsFor("tapahtuma"),
    rowsFor("ravintola"),
    rowsFor("stadion"),
    sanityFetch<SitemapTilastoRow[]>({
      query: sitemapTilastotQuery,
      tags: ["jalkapalloTilasto"],
      fallback: [],
    }),
    rowsFor("arvokisa"),
    rowsFor("pelaaja"),
    rowsFor("klubiToiminta"),
    rowsFor("galleriaAlbumi"),
    rowsFor("sivu"),
    sanityFetch<SitemapRow[]>({
      query: sitemapArchiveYearsQuery,
      tags: ["uutinen"],
      fallback: [],
    }),
  ]);

  const staticEntries: Entry[] = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: new Date(),
    priority: route.priority,
    changeFrequency: route.changeFrequency,
  }));

  const eurocupEntries: Entry[] = EUROCUP_SLUGS.map((slug) => ({
    url: absoluteUrl(`/jalkapalloarkisto/eurocupit/${slug}`),
    lastModified: new Date(),
    priority: 0.4,
    changeFrequency: "yearly",
  }));

  // Arkistovuodet: uusin muokkausaika per vuosi, ei riviä per uutinen.
  const yearMap = new Map<string, string>();
  for (const row of arkistoRows) {
    if (!row.slug) continue;
    const current = yearMap.get(row.slug);
    if (!current || (row.updatedAt && row.updatedAt > current)) {
      yearMap.set(row.slug, row.updatedAt ?? current ?? "");
    }
  }
  const arkistoEntries: Entry[] = [...yearMap.entries()].map(([year, updatedAt]) => ({
    url: absoluteUrl(`/uutiset/arkisto/${year}`),
    lastModified: updatedAt ? new Date(updatedAt) : undefined,
    priority: 0.3,
    changeFrequency: "yearly",
  }));

  // Vain tilastot, joilla on oma sivu (karsinnat, muut koosteet). Listaussivun
  // osiot ja viittaajan sivulla näkyvät taulukot eivät ole omia URL:ejaan.
  const tilastoEntries: Entry[] = tilastot.flatMap((row) => {
    const route = documentRoute(row);
    if (!route || route.anchor) return [];
    return [
      {
        url: absoluteUrl(route.path),
        lastModified: row.updatedAt ? new Date(row.updatedAt) : undefined,
        priority: 0.3,
        changeFrequency: "yearly" as const,
      },
    ];
  });

  // Klubi-osion sivu-dokumenteilla (klubi, klubi/palloveikkaus) on oma
  // kiinteä reittinsä; sama URL ei saa esiintyä sitemapissa kahdesti.
  const staticPaths = new Set(STATIC_ROUTES.map((route) => route.path));
  const sivuRows = sivut.filter((row) => row.slug && !staticPaths.has(`/${row.slug}`));

  return [
    ...staticEntries,
    ...eurocupEntries,
    ...arkistoEntries,
    ...toEntries(uutiset, (s) => `/uutiset/${s}`, 0.7, "monthly"),
    ...toEntries(tapahtumat, (s) => `/tapahtumat/${s}`, 0.7, "weekly"),
    ...toEntries(ravintolat, (s) => `/ravintolat/${s}`, 0.6, "yearly"),
    ...toEntries(stadionit, (s) => `/jalkapalloarkisto/stadionit/${s}`, 0.4, "yearly"),
    ...toEntries(arvokisat, (s) => `/jalkapalloarkisto/arvokisat/${s}`, 0.5, "yearly"),
    ...toEntries(pelaajat, (s) => `/jalkapalloarkisto/pelaajat/${s}`, 0.5, "yearly"),
    ...toEntries(toiminta, (s) => `/klubi/toiminta/${s}`, 0.6, "yearly"),
    ...toEntries(albumit, (s) => `/galleria/${s}`, 0.4, "yearly"),
    ...tilastoEntries,
    ...toEntries(sivuRows, (s) => `/${s}`, 0.5, "monthly"),
  ];
}
