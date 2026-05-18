import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { NewsCard } from "@/components/news-card";
import { CategoryFilter } from "@/components/category-filter";
import { sanityFetch } from "@/sanity/lib/fetch";
import { uutisetListQuery } from "@/sanity/lib/queries";
import { isValidCategory, categoryLabel } from "@/lib/uutinen-categories";
import type { UutinenCard, UutinenCategory } from "@/lib/types";

type SearchParams = { kategoria?: string };

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { kategoria } = await searchParams;
  const category = isValidCategory(kategoria) ? kategoria : null;
  const title = category ? `Uutiset — ${categoryLabel(category)}` : "Uutiset";
  return {
    title,
    description:
      "Lahden Suomalainen Klubi ry — tiedotteet, raportit ja jäsentiedot.",
  };
}

export default async function UutisetPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { kategoria } = await searchParams;
  const active: UutinenCategory | null = isValidCategory(kategoria)
    ? kategoria
    : null;

  const items = await sanityFetch<UutinenCard[]>({
    query: uutisetListQuery,
    params: { category: active },
    tags: ["uutinen"],
    fallback: [],
  });

  // Kerää saatavilla olevat kategoriat suotimen kapenemista varten — mutta
  // vain jos ei olla jo suodatettu (muuten available olisi vain valittu).
  const available = active
    ? undefined
    : new Set(items.flatMap((u) => u.categories ?? []));

  return (
    <>
      <Container className="pt-12">
        <Breadcrumbs items={[{ label: "Etusivu", href: "/" }, { label: "Uutiset" }]} />
        <h1 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">
          Uutiset
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Klubin tiedotteet, tapahtumaraportit, jäsentiedot sekä jalkapallo- ja
          ravintola-aiheiset kirjoitukset.
        </p>
        <div className="mt-8">
          <CategoryFilter
            active={active}
            basePath="/uutiset"
            available={available}
          />
        </div>
      </Container>

      <Container className="py-16">
        {items.length === 0 ? (
          <EmptyState active={active} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((news) => (
              <NewsCard key={news._id} news={news} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}

function EmptyState({ active }: { active: UutinenCategory | null }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <p className="font-serif text-2xl">
        {active ? "Ei uutisia tästä kategoriasta" : "Ei vielä uutisia"}
      </p>
      <p className="mt-2 max-w-md text-muted mx-auto">
        {active
          ? "Kokeile toista kategoriaa tai palaa kaikkiin uutisiin."
          : "Uutiset lisätään Sanity Studiossa. Heti kun ensimmäinen uutinen on julkaistu, se ilmestyy tänne."}
      </p>
    </div>
  );
}
