import Link from "next/link";
import type { Metadata } from "next";

import { HakuNakyma, HakuTulokset } from "@/components/hakunakyma";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { JsonLd } from "@/components/seo/json-ld";
import { RestaurantCard } from "@/components/restaurant-card";
import { Nuoli } from "@/components/ui/nuoli";
import {
  RavintolaFilterBar,
  buildRavintolaHref,
  hasActiveRavintolaFilters,
  parseRavintolaFilters,
  ravintolaLista,
  type RavintolaFilterValues,
  type RavintolaSearchParams,
} from "@/components/ravintola-filters";
import { hakusanat } from "@/lib/haku";
import { buildMetadata } from "@/lib/seo";
import { rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema-org";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  RAVINTOLAT_PAGE_SIZE,
  RAVINTOLAT_TOP_SIZE,
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
    "ja viihtyvyydestä. Hae nimellä tai kaupungilla, tai katso parhaat " +
    "suoraan top-listoista."
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
    terms: filters.q ? hakusanat(filters.q) : null,
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
  const lista = ravintolaLista(filters.lista);

  const [items, total] = await Promise.all([
    sanityFetch<RavintolaCardData[]>({
      query: ravintolatDirectoryQuery(
        lista
          ? { ordering: lista.ordering, page: 1, pageSize: RAVINTOLAT_TOP_SIZE }
          : { ordering: filters.jarjesta, page: filters.sivu, search: params.terms !== null },
      ),
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

  // Top-listaa ei sivuteta.
  const pageCount = lista ? 1 : Math.max(1, Math.ceil(total / RAVINTOLAT_PAGE_SIZE));
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

        <HakuNakyma polku="/ravintolat" tila={buildRavintolaHref(filters)}>
          <div className="mt-10">
            <RavintolaFilterBar
              active={filters}
              facets={facets}
              resultCount={total}
            />
          </div>

          <section aria-label="Hakutulokset" className="mt-10">
            <HakuTulokset>
              {items.length === 0 ? (
                <EmptyState isFiltered={isFiltered} isSearch={Boolean(filters.q)} hasAnyContent={facets.total > 0} />
              ) : lista ? (
                <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((restaurant, index) => (
                    <li key={restaurant._id} className="flex flex-col gap-2">
                      <span aria-hidden className="font-display text-3xl leading-none text-accent">
                        {index + 1}.
                      </span>
                      <RestaurantCard restaurant={restaurant} korostus={lista.osa ?? undefined} />
                    </li>
                  ))}
                </ol>
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
            </HakuTulokset>
          </section>
        </HakuNakyma>
      </Container>
    </>
  );
}

function EmptyState({
  isFiltered,
  isSearch,
  hasAnyContent,
}: {
  isFiltered: boolean;
  isSearch: boolean;
  hasAnyContent: boolean;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <h3 className="font-display text-2xl text-foreground">
        {isSearch
          ? "Haulla ei löytynyt ravintoloita"
          : isFiltered
            ? "Ei osumia näillä rajauksilla"
            : "Hakemisto on vielä tyhjä"}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-muted">
        {isSearch
          ? "Tarkista kirjoitusasu tai kokeile pelkkää nimen alkua tai kaupunkia."
          : isFiltered
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
    "group/linkki inline-flex min-h-11 items-center justify-center gap-1.5 rounded-sm border border-border px-5 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <nav
      aria-label="Sivutus"
      data-sivutus
      className="mt-10 flex flex-wrap items-center justify-between gap-4"
    >
      {hasPrev ? (
        <Link
          href={buildRavintolaHref(filters, { sivu: filters.sivu - 1 })}
          rel="prev"
          className={linkClass}
        >
          <Nuoli suunta="vasen" /> Edellinen sivu
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
          Seuraava sivu <Nuoli />
        </Link>
      ) : (
        <span aria-hidden />
      )}
    </nav>
  );
}
