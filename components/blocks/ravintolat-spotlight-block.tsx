import { Container } from "@/components/layout/container";
import { ArrowLink, BlockHeading } from "@/components/blocks/block-heading";
import { RestaurantCard } from "@/components/restaurant-card";
import { sanityFetch } from "@/sanity/lib/fetch";
import { etusivuRavintolatQuery } from "@/sanity/lib/queries/etusivu";
import type { RavintolaCardData } from "@/sanity/lib/queries/ravintolat";

type Props = {
  eyebrow?: string;
  heading?: string;
  cityId?: string | null;
  count?: number;
};

/**
 * Ravintola-arviot etusivulla (tyyliopas Sivut v3, osio 4) — parhaiten
 * arvioidut ensin. Messinkinen yläotsake kertoo aihepiirin (ruoka).
 */
export async function RavintolatSpotlightBlock({
  eyebrow = "Ravintola-arviot",
  heading = "Missä pelipäivänä syödään",
  cityId = null,
  count = 3,
}: Props) {
  const items = await sanityFetch<RavintolaCardData[]>({
    query: etusivuRavintolatQuery,
    params: { count, cityId },
    tags: ["ravintola"],
    fallback: [],
  });

  if (items.length === 0) return null;

  return (
    <section className="py-11 sm:py-24" aria-labelledby="etusivu-ravintolat">
      <Container size="wide" className="flex flex-col gap-4 sm:gap-9">
        <BlockHeading
          id="etusivu-ravintolat"
          eyebrow={eyebrow}
          topic="food"
          title={heading}
          action={{ href: "/ravintolat", label: "Kaikki arviot" }}
          className="max-sm:[&>a]:hidden"
        />
        <ul className="grid gap-3.5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {items.map((restaurant) => (
            <li key={restaurant._id} className="flex">
              <RestaurantCard restaurant={restaurant} />
            </li>
          ))}
        </ul>
        <ArrowLink href="/ravintolat" className="self-start sm:hidden">
          Kaikki arviot
        </ArrowLink>
      </Container>
    </section>
  );
}
