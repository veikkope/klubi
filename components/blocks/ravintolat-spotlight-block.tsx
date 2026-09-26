import { Container } from "@/components/layout/container";
import { BlockHeading } from "@/components/blocks/block-heading";
import { RestaurantCard } from "@/components/restaurant-card";
import { sanityFetch } from "@/sanity/lib/fetch";
import { etusivuRavintolatQuery } from "@/sanity/lib/queries/etusivu";
import type { RavintolaCard } from "@/lib/types";

type Props = {
  heading?: string;
  cityId?: string | null;
  count?: number;
};

/**
 * Ravintolat-spotlight — parhaiten arvioidut ensin (`ratingOverall` laskevasti).
 *
 * Lista on `<ol>`, koska järjestyksellä on merkitys: se on klubin oma
 * paremmuusjärjestys. Sijaluku näytetään merkkinä kortin kulmassa ja
 * kerrotaan ruudunlukijalle erikseen, koska selaimet eivät ilmoita
 * listanumeroa luotettavasti kun `list-style` on pois päältä.
 */
export async function RavintolatSpotlightBlock({
  heading = "Parhaat ravintolat",
  cityId = null,
  count = 5,
}: Props) {
  const items = await sanityFetch<RavintolaCard[]>({
    query: etusivuRavintolatQuery,
    params: { count, cityId },
    tags: ["ravintola"],
    fallback: [],
  });

  if (items.length === 0) return null;

  return (
    <section className="py-20 sm:py-24" aria-labelledby="etusivu-ravintolat">
      <Container size="wide">
        <BlockHeading
          id="etusivu-ravintolat"
          eyebrow="Klubin arviot"
          title={heading}
          action={{ href: "/ravintolat", label: "Koko hakemisto" }}
        />
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((restaurant, index) => (
            <li key={restaurant._id} className="relative grid">
              <span
                aria-hidden
                className="absolute -left-2 -top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white shadow-md"
              >
                {index + 1}
              </span>
              <span className="sr-only">Sijalla {index + 1}:</span>
              <RestaurantCard restaurant={restaurant} />
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
