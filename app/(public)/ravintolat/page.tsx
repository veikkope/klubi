import Link from "next/link";
import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { JsonLd } from "@/components/seo/json-ld";
import { RestaurantCard } from "@/components/restaurant-card";
import {
  RavintolaFilterBar,
  buildRavintolaHref,
  hasActiveRavintolaFilters,
  parseRavintolaFilters,
  type RavintolaFilterValues,
  type RavintolaSearchParams,
} from "@/components/ravintola-filters";
import { buildMetadata } from "@/lib/seo";
import { rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema-org";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  RAVINTOLAT_PAGE_SIZE,
  buildRavintolatFacets,
  countryNamesForSlug,
  ravintolatCountQuery,
  ravintolatDirectoryQuery,
  ravintolatFacetsQuery,
  type RavintolaCardData,
  type RavintolatFacetData,
  type RavintolatFacetsRaw,
} from "@/sanity/lib/queries/ravintolat";

export const revalidate = 3600;

const TITLE = "Ravintola-arviot";

/**
 * Ingressi johdetaan datasta, ei kovakoodata.
 *
 * Aiemmin tässä luki "vuodesta 2007", mikä oli väärin: yhdistys perustettiin
 * 2007, mutta vanhin kirjattu ravintolakäynti on vuodelta 1997. Kovakoodattu
 * vuosiluku ajautuu erilleen datasta heti kun vanhempaa aineistoa lisätään.
 */
function buildLead(facets: RavintolatFacetData): string {
  const year = facets.firstVisitYear?.slice(0, 4);
  const since = year ? ` vuodesta ${year} alkaen` : "";
  const count = facets.total > 0 ? `${facets.total}` : "satoja";
  return (
    `Lahden Suomalainen Klubi ry on arvioinut ${count} ravintolaa${since}. ` +
    "Jokainen kohde saa kokonaisarvosanan sekä osa-arviot ruoasta, hinnasta " +
    "ja viihtyvyydestä. Rajaa hakemistoa maan, maakunnan, kaupungin " +
    "tai arvosanan mukaan."
  );
}

const trail = [rootCrumb, { label: TITLE }];

const emptyFacets: RavintolatFacetsRaw = {
  places: [],
  total: 0,
  closedCount: 0,
  firstVisitYear: null,
};

type PageProps = {
  searchParams: Promise<RavintolaSearchParams>;
};

/** GROQ-parametrit suodattimista. `null` tarkoittaa "ei rajausta". */
function queryParams(filters: RavintolaFilterValues, facets: RavintolatFacetData) {
  return {
    citySlug: filters.kaupunki,
    countryNames: countryNamesForSlug(facets, filters.maa),
    maakuntaSlugs: filters.maakunta.length ? filters.maakunta : null,
    minRating: filters.arvosana,
    includeClosed: filters.lopettaneet,
  };
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const filters = parseRavintolaFilters(await searchParams);
  const filtered = hasActiveRavintolaFilters(filters);
  const path = buildRavintolaHref(filters);

  return buildMetadata({
    title: filters.sivu > 1 ? `${TITLE} — sivu ${filters.sivu}` : TITLE,
    description:
      "Klubin ravintola-arvostelut: kokonaisarvosana sekä osa-arviot ruoasta, " +
      "hinnasta ja viihtyvyydestä. Suodata maan, maakunnan, kaupungin " +
      "ja arvosanan mukaan.",
    path,
    // Rajattu näkymä on sama sisältö toisin järjestettynä — ei indeksoitavaksi.
    noIndex: filtered,
  });
}

export default async function RavintolatPage({ searchParams }: PageProps) {
  const filters = parseRavintolaFilters(await searchParams);

  // Facetit ensin: `?maa=`-slug muunnetaan niiden avulla maan nimiksi.
  const facets = buildRavintolatFacets(
    await sanityFetch<RavintolatFacetsRaw>({
      query: ravintolatFacetsQuery,
      tags: ["ravintola", "kaupunki"],
      fallback: emptyFacets,
    }),
  );
  const params = queryParams(filters, facets);

  const [items, total] = await Promise.all([
    sanityFetch<RavintolaCardData[]>({
      query: ravintolatDirectoryQuery(filters.jarjesta, filters.sivu),
      params,
      tags: ["ravintola", "kaupunki"],
      fallback: [],
    }),
    sanityFetch<number>({
      query: ravintolatCountQuery,
      params,
      tags: ["ravintola", "kaupunki"],
      fallback: 0,
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / RAVINTOLAT_PAGE_SIZE));
  const isFiltered = hasActiveRavintolaFilters(filters);
  const lead = buildLead(facets);

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({
            title: TITLE,
            description: lead,
            path: "/ravintolat",
            itemCount: total,
          }),
        ]}
      />

      <Container size="wide" className="py-12 sm:py-16">
        <PageHeader
          title={TITLE}
          lead={lead}
          eyebrow="Klubin arvostelut"
          topic="food"
          breadcrumbs={trail}
          actions={
            <Link
              href="/ravintolat/arvostele"
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-6 text-sm font-medium text-on-primary shadow-sm transition hover:bg-primary-hover hover:text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Lähetä oma arvostelu
            </Link>
          }
        />

        <div className="mt-10">
          <RavintolaFilterBar
            active={filters}
            facets={facets}
            resultCount={total}
          />
        </div>

        <section aria-label="Hakutulokset" className="mt-10">
          {items.length === 0 ? (
            <EmptyState isFiltered={isFiltered} hasAnyContent={facets.total > 0} />
          ) : (
            <>
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((restaurant) => (
                  <li key={restaurant._id} className="flex">
                    <RestaurantCard restaurant={restaurant} />
                  </li>
                ))}
              </ul>
              <Pagination filters={filters} pageCount={pageCount} />
            </>
          )}
        </section>
      </Container>
    </>
  );
}

function EmptyState({
  isFiltered,
  hasAnyContent,
}: {
  isFiltered: boolean;
  hasAnyContent: boolean;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <h3 className="font-display text-2xl text-foreground">
        {isFiltered ? "Ei osumia näillä rajauksilla" : "Hakemisto on vielä tyhjä"}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-muted">
        {isFiltered
          ? "Kokeile väljempiä rajauksia — esimerkiksi matalampaa vähimmäisarvosanaa tai laajempaa aluetta (maa, maakunta tai kaupunki)."
          : hasAnyContent
            ? "Arvostelut ovat juuri nyt piilossa. Tarkista rajaukset tai palaa hetken kuluttua."
            : "Ravintola-arvostelut lisätään Sanity Studiossa. Kun ensimmäinen arvostelu on tallennettu, se ilmestyy tähän."}
      </p>
      {isFiltered && (
        <Link
          href="/ravintolat"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-sm border border-border px-6 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Tyhjennä rajaukset
        </Link>
      )}
    </div>
  );
}

function Pagination({
  filters,
  pageCount,
}: {
  filters: RavintolaFilterValues;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;
  const hasPrev = filters.sivu > 1;
  const hasNext = filters.sivu < pageCount;

  const linkClass =
    "inline-flex min-h-11 items-center justify-center rounded-sm border border-border px-5 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <nav
      aria-label="Sivutus"
      className="mt-10 flex flex-wrap items-center justify-between gap-4"
    >
      {hasPrev ? (
        <Link
          href={buildRavintolaHref(filters, { sivu: filters.sivu - 1 })}
          rel="prev"
          className={linkClass}
        >
          ← Edellinen sivu
        </Link>
      ) : (
        <span aria-hidden />
      )}

      <p className="text-sm text-muted">
        Sivu {filters.sivu} / {pageCount}
      </p>

      {hasNext ? (
        <Link
          href={buildRavintolaHref(filters, { sivu: filters.sivu + 1 })}
          rel="next"
          className={linkClass}
        >
          Seuraava sivu →
        </Link>
      ) : (
        <span aria-hidden />
      )}
    </nav>
  );
}
