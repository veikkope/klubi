import type { Metadata } from "next";

import { CategoryFilter } from "@/components/category-filter";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { NewsCard } from "@/components/news-card";
import { JsonLd } from "@/components/seo/json-ld";
import { LinkButton } from "@/components/ui/button";
import { rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import { categoryLabel, isValidCategory } from "@/lib/uutinen-categories";
import type { UutinenCategory } from "@/lib/types";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  uutisetCategoriesQuery,
  uutisetPageQuery,
  type Paged,
  type UutinenListItem,
} from "@/sanity/lib/queries/uutiset";

import { Pagination } from "./_components/pagination";
import {
  buildPath,
  firstParam,
  pageCount,
  pageRange,
  parsePage,
  type SearchParamValue,
} from "./_lib/paging";

export const revalidate = 3600;

const PER_PAGE = 12;

const LEAD =
  "Klubin tiedotteet, tapahtumaraportit ja jäsentiedot sekä jalkapallo- ja " +
  "ravintola-aiheiset kirjoitukset. Uusimmat ensin.";

type SearchParams = Record<string, SearchParamValue>;

/** Yhteinen luku kyselystä ja metadatasta, jotta ne eivät voi erkaantua. */
function readParams(searchParams: SearchParams) {
  const raw = firstParam(searchParams.kategoria);
  const category: UutinenCategory | null = isValidCategory(raw) ? raw : null;
  const page = parsePage(searchParams.sivu);
  return { category, page };
}

function pathFor(category: UutinenCategory | null, page: number) {
  return buildPath("/uutiset", {
    kategoria: category,
    sivu: page > 1 ? page : null,
  });
}

function titleFor(category: UutinenCategory | null, page: number) {
  const base = category ? `Uutiset: ${categoryLabel(category)}` : "Uutiset";
  return page > 1 ? `${base} — sivu ${page}` : base;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { category, page } = readParams(await searchParams);

  return buildMetadata({
    title: titleFor(category, page),
    description: category
      ? `Lahden Suomalainen Klubi ry:n uutiset aiheesta ${categoryLabel(category).toLowerCase()}. Uusimmat kirjoitukset ensin.`
      : LEAD,
    // Sivutetut näkymät ovat aitoja osajoukkoja, joten kanoninen osoite
    // osoittaa sivuun itseensä. Niitä ei merkitä noindexiksi, koska
    // `buildMetadata` kytkee noindexin ja nofollow'n yhteen — silloin
    // syvempien sivujen uutiset jäisivät crawlerilta löytymättä.
    path: pathFor(category, page),
  });
}

export default async function UutisetPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, page } = readParams(await searchParams);
  const { start, end } = pageRange(page, PER_PAGE);

  const [result, categoryValues] = await Promise.all([
    sanityFetch<Paged<UutinenListItem>>({
      query: uutisetPageQuery,
      params: { category, start, end },
      tags: ["uutinen"],
      fallback: { items: [], total: 0 },
    }),
    sanityFetch<string[]>({
      query: uutisetCategoriesQuery,
      tags: ["uutinen"],
      fallback: [],
    }),
  ]);

  const total = result.total;
  const pages = pageCount(total, PER_PAGE);
  const path = pathFor(category, page);

  const trail = category
    ? [
        rootCrumb,
        { label: "Uutiset", href: "/uutiset" },
        { label: categoryLabel(category) },
      ]
    : [rootCrumb, { label: "Uutiset" }];

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({
            title: titleFor(category, page),
            description: LEAD,
            path,
            itemCount: total,
          }),
        ]}
      />

      <Container className="pt-12">
        <PageHeader
          title="Uutiset"
          lead={LEAD}
          breadcrumbs={trail}
          actions={
            <LinkButton href="/uutiset/arkisto" variant="secondary">
              Selaa vuosiarkistoa
            </LinkButton>
          }
        />

        <div className="mt-8">
          <CategoryFilter
            active={category}
            basePath="/uutiset"
            available={new Set(categoryValues)}
          />
        </div>
      </Container>

      <Container className="py-16">
        <h2 className="font-serif text-2xl sm:text-3xl">
          {category ? categoryLabel(category) : "Kaikki uutiset"}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {total === 0
            ? "Ei kirjoituksia."
            : total === 1
              ? "1 kirjoitus."
              : `${total} kirjoitusta.`}
        </p>

        {result.items.length === 0 ? (
          <EmptyState category={category} />
        ) : (
          <>
            <ul className="mt-8 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((news, index) => (
                <li key={news._id} className="flex">
                  <NewsCard news={news} priority={page === 1 && index < 3} />
                </li>
              ))}
            </ul>

            <Pagination
              page={page}
              pageCount={pages}
              hrefForPage={(target) => pathFor(category, target)}
              label="Uutisten sivutus"
            />
          </>
        )}
      </Container>
    </>
  );
}

function EmptyState({ category }: { category: UutinenCategory | null }) {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <p className="font-serif text-2xl">
        {category ? "Ei uutisia tästä kategoriasta" : "Ei vielä uutisia"}
      </p>
      <p className="mx-auto mt-2 max-w-md text-muted">
        {category
          ? "Kokeile toista kategoriaa tai palaa kaikkiin uutisiin."
          : "Uutiset lisätään Sanity Studiossa. Heti kun ensimmäinen uutinen on julkaistu, se ilmestyy tähän."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {category && (
          <LinkButton href="/uutiset" variant="secondary">
            Kaikki uutiset
          </LinkButton>
        )}
        <LinkButton href="/uutiset/arkisto" variant="secondary">
          Vuosiarkisto
        </LinkButton>
      </div>
    </div>
  );
}
