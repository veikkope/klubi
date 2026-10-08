import type { MetadataRoute } from "next";

import { sanityFetch } from "@/sanity/lib/fetch";
import {
  sitemapArchiveYearsQuery,
  sitemapByTypeQuery,
  sitemapTilastotQuery,
  type SitemapRow,
  type SitemapTilastoRow,
} from "@/sanity/lib/queries/sitemap";
import { OSIOSIVU_SLUGIT } from "@/lib/osiosivut";
import { LITMANEN_PATH, LITMANEN_SLUG, documentRoute } from "@/lib/path";
import { TUNNISTE_INDEKSOI_VAHINTAAN, tunnisteSlug } from "@/lib/tunnisteet";
import { uutisetTunnisteetQuery, type TunnisteRivi } from "@/sanity/lib/queries/uutiset";
import { absoluteUrl } from "@/lib/site";
import { onTyhjassaOsiossa } from "@/lib/osiot";
import { haeTyhjatOsiot } from "@/sanity/lib/tyhjat-osiot";

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
  { path: "/klubi/toiminta", priority: 0.8, changeFrequency: "monthly" },
  { path: "/klubi/hallitus", priority: 0.7, changeFrequency: "yearly" },
  { path: "/klubi/palloveikkaus", priority: 0.6, changeFrequency: "monthly" },
  { path: "/klubi/yhteystiedot", priority: 0.8, changeFrequency: "yearly" },

  { path: "/tapahtumat", priority: 0.9, changeFrequency: "daily" },
  { path: "/ottelut", priority: 0.8, changeFrequency: "daily" },
  { path: "/uutiset", priority: 0.9, changeFrequency: "daily" },
  { path: "/uutiset/arkisto", priority: 0.5, changeFrequency: "monthly" },
  { path: "/uutiset/tunnisteet", priority: 0.4, changeFrequency: "weekly" },

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
  { path: "/jalkapalloarkisto/maailman-parhaat", priority: 0.5, changeFrequency: "yearly" },
  { path: "/jalkapalloarkisto/saavutukset", priority: 0.5, changeFrequency: "yearly" },
  { path: "/jalkapalloarkisto/jarkytykset", priority: 0.5, changeFrequency: "yearly" },
  { path: "/jalkapalloarkisto/fifa-ranking", priority: 0.5, changeFrequency: "monthly" },
  { path: "/jalkapalloarkisto/lupaavat", priority: 0.4, changeFrequency: "yearly" },
  { path: "/jalkapalloarkisto/eurocupit", priority: 0.5, changeFrequency: "yearly" },
  { path: "/jalkapalloarkisto/litmanen/lehtileikkeet", priority: 0.5, changeFrequency: "monthly" },
  { path: "/jalkapalloarkisto/litmanen/patsas", priority: 0.4, changeFrequency: "yearly" },
  { path: "/jalkapalloarkisto/litmanen/loukkaantumiset", priority: 0.4, changeFrequency: "yearly" },
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
    tunnisteRivit,
    tyhjat,
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
    sanityFetch<TunnisteRivi[]>({
      query: uutisetTunnisteetQuery,
      tags: ["uutinen"],
      fallback: [],
    }),
    haeTyhjatOsiot(),
  ]);

  // Tyhjä osio (esim. Galleria ilman albumeita) on noindex, joten ei sitemapiin (lib/osiot.ts).
  const staticEntries: Entry[] = STATIC_ROUTES.filter((route) => !onTyhjassaOsiossa(route.path, tyhjat)).map((route) => ({
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

  // Tunnistesivut: harvinaiset tunnisteet ovat noindex (lib/tunnisteet.ts). Muokkausaika on
  // tunnisteen tuoreimman uutisen muokkausaika.
  const tunnisteet = new Map<string, { maara: number; paivitetty: string }>();
  for (const rivi of tunnisteRivit) {
    for (const slug of new Set(rivi.tunnisteet.map(tunnisteSlug).filter(Boolean))) {
      const nyt = tunnisteet.get(slug) ?? { maara: 0, paivitetty: "" };
      nyt.maara += 1;
      if (rivi.paivitetty > nyt.paivitetty) nyt.paivitetty = rivi.paivitetty;
      tunnisteet.set(slug, nyt);
    }
  }
  const tunnisteEntries: Entry[] = [...tunnisteet.entries()]
    .filter(([, { maara }]) => maara >= TUNNISTE_INDEKSOI_VAHINTAAN)
    .map(([slug, { paivitetty }]) => ({
      url: absoluteUrl(`/uutiset/tunniste/${slug}`),
      lastModified: paivitetty ? new Date(paivitetty) : undefined,
      priority: 0.3,
      changeFrequency: "monthly",
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

  // Huuhkajat-osioiden ja ulkomaisten mestareiden maiden sivut: vain sivut,
  // joilla on taulukoita. Muokkausaika on sivun tuoreimman taulukon.
  const osioUpdated = new Map<string, string>();
  for (const row of tilastot) {
    if (row.category !== "huuhkajat" && row.category !== "ulkomaiset-mestarit") continue;
    const route = documentRoute(row);
    if (!route) continue;
    const current = osioUpdated.get(route.path) ?? "";
    osioUpdated.set(route.path, row.updatedAt && row.updatedAt > current ? row.updatedAt : current);
  }
  const osioEntries: Entry[] = [...osioUpdated.entries()].map(([path, updatedAt]) => ({
    url: absoluteUrl(path),
    lastModified: updatedAt ? new Date(updatedAt) : undefined,
    priority: 0.5,
    changeFrequency: "monthly",
  }));
  // Osioiden sivuilla (lib/osiosivut.ts) on oma koodireittinsä, joka on jo
  // staattisissa reiteissä tai tarkoituksella poissa (odottavat: noindex).
  // Sama URL ei saa esiintyä sitemapissa kahdesti.
  const sivuRows = sivut.filter((row) => row.slug && !OSIOSIVU_SLUGIT.has(row.slug));

  return [
    ...staticEntries,
    ...eurocupEntries,
    ...arkistoEntries,
    ...tunnisteEntries,
    ...toEntries(uutiset, (s) => `/uutiset/${s}`, 0.7, "monthly"),
    ...toEntries(tapahtumat, (s) => `/tapahtumat/${s}`, 0.7, "weekly"),
    ...toEntries(ravintolat, (s) => `/ravintolat/${s}`, 0.6, "yearly"),
    ...toEntries(stadionit, (s) => `/jalkapalloarkisto/stadionit/${s}`, 0.4, "yearly"),
    ...toEntries(arvokisat, (s) => `/jalkapalloarkisto/arvokisat/${s}`, 0.5, "yearly"),
    ...toEntries(pelaajat, (s) => (s === LITMANEN_SLUG ? LITMANEN_PATH : `/jalkapalloarkisto/pelaajat/${s}`), 0.5, "yearly"),
    ...toEntries(toiminta, (s) => `/klubi/toiminta/${s}`, 0.6, "yearly"),
    ...toEntries(albumit, (s) => `/galleria/${s}`, 0.4, "yearly"),
    ...osioEntries,
    ...tilastoEntries,
    ...toEntries(sivuRows, (s) => `/${s}`, 0.5, "monthly"),
  ];
}
