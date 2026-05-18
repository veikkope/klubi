import Link from "next/link";
import { Container } from "@/components/layout/container";
import { NewsCard } from "@/components/news-card";
import { sanityFetch } from "@/sanity/lib/fetch";
import { recentUutisetQuery } from "@/sanity/lib/queries";
import type { UutinenCard } from "@/lib/types";

type Props = {
  heading?: string;
  count?: number;
};

export async function UutisetBlock({ heading = "Ajankohtaista", count = 3 }: Props) {
  const items = await sanityFetch<UutinenCard[]>({
    query: recentUutisetQuery,
    params: { count },
    tags: ["uutinen"],
    fallback: [],
  });

  if (items.length === 0) return null;

  return (
    <section className="py-20">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <h2 className="font-serif text-3xl sm:text-4xl">{heading}</h2>
          <Link
            href="/uutiset"
            className="text-sm font-medium text-accent hover:text-accent-hover"
          >
            Kaikki uutiset →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((news) => (
            <NewsCard key={news._id} news={news} />
          ))}
        </div>
      </Container>
    </section>
  );
}
