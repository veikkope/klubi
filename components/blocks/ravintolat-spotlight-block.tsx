import Link from "next/link";
import { Container } from "@/components/layout/container";
import { RestaurantCard } from "@/components/restaurant-card";
import { sanityFetch } from "@/sanity/lib/fetch";
import { topRavintolatQuery } from "@/sanity/lib/queries";
import type { RavintolaCard } from "@/lib/types";

type Props = {
  heading?: string;
  cityId?: string | null;
  count?: number;
};

export async function RavintolatSpotlightBlock({
  heading = "Parhaat ravintolat",
  cityId = null,
  count = 5,
}: Props) {
  const items = await sanityFetch<RavintolaCard[]>({
    query: topRavintolatQuery,
    params: { count, cityId },
    tags: ["ravintola"],
    fallback: [],
  });

  if (items.length === 0) return null;

  return (
    <section className="py-20">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <h2 className="font-serif text-3xl sm:text-4xl">{heading}</h2>
          <Link
            href="/ravintolat"
            className="text-sm font-medium text-accent hover:text-accent-hover"
          >
            Koko hakemisto →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <RestaurantCard key={r._id} restaurant={r} />
          ))}
        </div>
      </Container>
    </section>
  );
}
