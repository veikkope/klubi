import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionNav } from "@/components/layout/section-nav";
import { JsonLd } from "@/components/seo/json-ld";
import { rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import { hasSanity } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  uutisetArchiveYearsQuery,
  uutisetByYearQuery,
  type ArchiveYearRow,
  type Paged,
  type UutinenListItem,
} from "@/sanity/lib/queries/uutiset";

import { ArchiveList } from "../../_components/archive-list";
import { Pagination } from "../../_components/pagination";
import {
  adjacentYears,
  countLabel,
  parseArchiveYear,
  toArchiveYears,
  yearBounds,
  type ArchiveYear,
} from "../../_lib/archive";
import {
  buildPath,
  pageCount,
  pageRange,
  parsePage,
  type SearchParamValue,
} from "../../_lib/paging";

export const revalidate = 3600;

const PER_PAGE = 30;

type Params = { vuosi: string };
type SearchParams = Record<string, SearchParamValue>;

async function getYears(): Promise<ArchiveYear[]> {
  const rows = await sanityFetch<ArchiveYearRow[]>({
    query: uutisetArchiveYearsQuery,
    tags: ["uutinen"],
    fallback: [],
  });
  return toArchiveYears(rows);
}

export async function generateStaticParams(): Promise<Params[]> {
  if (!hasSanity) return [];
  const years = await getYears();
  return years.map((entry) => ({ vuosi: String(entry.year) }));
}

function pathFor(year: number, page: number) {
  return buildPath(`/uutiset/arkisto/${year}`, {
    sivu: page > 1 ? page : null,
  });
}

function describe(year: number) {
  return (
    `Lahden Suomalainen Klubi ry:n kirjoitukset vuodelta ${year}. ` +
    "Uutisarkisto kokoaa vanhan sivuston kommentti- ja blogisivut yhteen."
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { vuosi } = await params;
  const year = parseArchiveYear(vuosi);
  if (!year) {
    return buildMetadata({
      title: "Arkistovuotta ei löytynyt",
      path: `/uutiset/arkisto/${vuosi}`,
      noIndex: true,
    });
  }

  const page = parsePage((await searchParams).sivu);
  const years = await getYears();
  const hasContent = years.some((entry) => entry.year === year);

  return buildMetadata({
    title:
      page > 1 ? `Uutisarkisto ${year} — sivu ${page}` : `Uutisarkisto ${year}`,
    description: describe(year),
    path: pathFor(year, page),
    // Tyhjä vuosi on olemassa vain suoraa osoitetta varten — ei hakutuloksiin.
    // Sivutetut sivut sen sijaan indeksoidaan, jotta niiden linkkejä seurataan.
    noIndex: !hasContent,
  });
}

export default async function ArkistoVuosiPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { vuosi } = await params;
  const year = parseArchiveYear(vuosi);
  if (!year) notFound();

  const page = parsePage((await searchParams).sivu);
  const { start, end } = pageRange(page, PER_PAGE);
  const { from, to } = yearBounds(year);

  const [result, years] = await Promise.all([
    sanityFetch<Paged<UutinenListItem>>({
      query: uutisetByYearQuery,
      params: { from, to, start, end },
      tags: ["uutinen"],
      fallback: { items: [], total: 0 },
    }),
    getYears(),
  ]);

  const pages = pageCount(result.total, PER_PAGE);
  const { older, newer } = adjacentYears(years, year);

  const trail = [
    rootCrumb,
    { label: "Uutiset", href: "/uutiset" },
    { label: "Arkisto", href: "/uutiset/arkisto" },
    { label: String(year) },
  ];

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({
            title: `Uutisarkisto ${year}`,
            description: describe(year),
            path: pathFor(year, page),
            itemCount: result.total,
          }),
        ]}
      />

      <Container className="py-16">
        <PageHeader
          title={`Uutisarkisto ${year}`}
          lead={
            result.total > 0
              ? `${countLabel(result.total)} vuodelta ${year}.`
              : `Vuodelta ${year} ei ole vielä kirjoituksia arkistossa.`
          }
          eyebrow="Arkisto"
          breadcrumbs={trail}
        />

        {years.length > 0 && (
          <SectionNav
            className="mt-8"
            label="Arkiston vuodet"
            items={years.map((entry) => ({
              label: String(entry.year),
              href: `/uutiset/arkisto/${entry.year}`,
            }))}
          />
        )}

        {result.items.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
            <p className="font-display text-2xl">Ei kirjoituksia vuodelta {year}</p>
            <p className="mx-auto mt-2 max-w-md text-muted">
              Valitse toinen vuosi yltä tai palaa arkiston etusivulle.
            </p>
            <p className="mt-6">
              <Link
                href="/uutiset/arkisto"
                className="text-accent hover:underline"
              >
                Kaikki vuodet
              </Link>
            </p>
          </div>
        ) : (
          <>
            <ArchiveList items={result.items} />

            <Pagination
              page={page}
              pageCount={pages}
              hrefForPage={(target) => pathFor(year, target)}
              label={`Vuoden ${year} sivutus`}
            />
          </>
        )}

        <nav
          aria-label="Siirry toiseen arkistovuoteen"
          className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm"
        >
          {older ? (
            <Link
              href={`/uutiset/arkisto/${older.year}`}
              rel="prev"
              className="inline-flex min-h-11 items-center text-accent hover:underline"
            >
              <span aria-hidden className="mr-2">
                ←
              </span>
              Vanhempi vuosi {older.year}
            </Link>
          ) : (
            <span />
          )}
          {newer ? (
            <Link
              href={`/uutiset/arkisto/${newer.year}`}
              rel="next"
              className="inline-flex min-h-11 items-center text-accent hover:underline"
            >
              Uudempi vuosi {newer.year}
              <span aria-hidden className="ml-2">
                →
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </Container>
    </>
  );
}
