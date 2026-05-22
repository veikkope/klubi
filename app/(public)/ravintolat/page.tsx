import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { RestaurantCard } from "@/components/restaurant-card";
import {
  RavintolaFilterBar,
  type RavintolaFilters,
} from "@/components/ravintola-filters";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  ravintolatFacetsQuery,
  ravintolatListQuery,
} from "@/sanity/lib/queries";
import {
  isValidCuisine,
  isValidPriceLevel,
} from "@/lib/ravintola-cuisines";
import type { RavintolaCard, RavintolatFacets } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ravintolat",
  description:
    "Lahden Suomalainen Klubi ry:n ravintola-arvostelut — suodata kaupungin, ruokatyypin, tähtien ja hintaluokan mukaan.",
};

type SearchParams = {
  kaupunki?: string;
  ruoka?: string;
  tahdet?: string;
  hinta?: string;
};

export default async function RavintolatPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const [items, facets] = await Promise.all([
    sanityFetch<RavintolaCard[]>({
      query: ravintolatListQuery,
      params: {
        citySlug: filters.kaupunki,
        cuisine: filters.ruoka,
        minStars: filters.tahdet,
        price: filters.hinta,
      },
      tags: ["ravintola"],
      fallback: [],
    }),
    sanityFetch<RavintolatFacets>({
      query: ravintolatFacetsQuery,
      tags: ["ravintola"],
      fallback: { cities: [], cuisines: [], priceLevels: [] },
    }),
  ]);

  return (
    <>
      <Container className="pt-12">
        <Breadcrumbs
          items={[{ label: "Etusivu", href: "/" }, { label: "Ravintolat" }]}
        />
        <h1 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">
          Ravintolat
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Klubin oma arvostelukokoelma — yli vuosikymmenen ravintolakäyntejä
          tähdillä ja kommenteilla. Suodata alapuolella.
        </p>
      </Container>

      <Container className="py-10">
        <RavintolaFilterBar active={filters} facets={facets} />
      </Container>

      <Container className="pb-16">
        <div className="mb-4 text-sm text-muted">
          {items.length === 0
            ? "Ei tuloksia annetuilla suodattimilla."
            : `${items.length} ${items.length === 1 ? "ravintola" : "ravintolaa"}`}
        </div>
        {items.length === 0 ? (
          <EmptyState hasFilters={Object.values(filters).some(Boolean)} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((r) => (
              <RestaurantCard key={r._id} restaurant={r} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}

function parseFilters(sp: SearchParams): RavintolaFilters {
  const tahdetNum = sp.tahdet ? Number.parseInt(sp.tahdet, 10) : NaN;
  return {
    kaupunki: sp.kaupunki && sp.kaupunki.length <= 60 ? sp.kaupunki : null,
    ruoka: isValidCuisine(sp.ruoka) ? sp.ruoka! : null,
    tahdet:
      Number.isInteger(tahdetNum) && tahdetNum >= 1 && tahdetNum <= 5
        ? tahdetNum
        : null,
    hinta: isValidPriceLevel(sp.hinta) ? sp.hinta! : null,
  };
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <p className="font-serif text-2xl">
        {hasFilters ? "Ei vastaavia ravintoloita" : "Ei vielä ravintoloita"}
      </p>
      <p className="mt-2 max-w-md text-muted mx-auto">
        {hasFilters
          ? "Kokeile löysempiä suodattimia tai tyhjennä ne kokonaan."
          : "Ravintola-arvostelut lisätään Sanity Studiossa."}
      </p>
    </div>
  );
}
