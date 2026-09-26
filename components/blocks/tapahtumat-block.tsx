import { Container } from "@/components/layout/container";
import { BlockHeading } from "@/components/blocks/block-heading";
import { EventCard } from "@/components/event-card";
import { sanityFetch } from "@/sanity/lib/fetch";
import { upcomingTapahtumatQuery } from "@/sanity/lib/queries";
import type { TapahtumaCard } from "@/lib/types";

type Props = {
  heading?: string;
  count?: number;
};

/**
 * Tulevat tapahtumat — kolme seuraavaa.
 *
 * Kun tulevia tapahtumia ei ole, lohko jätetään pois kokonaan. Kävijä löytää
 * menneet tapahtumat navigaatiosta; etusivulle ei jätetä tyhjää laatikkoa
 * kertomaan ettei mitään ole.
 */
export async function TapahtumatBlock({
  heading = "Tulevat tapahtumat",
  count = 3,
}: Props) {
  const items = await sanityFetch<TapahtumaCard[]>({
    query: upcomingTapahtumatQuery,
    params: { count },
    tags: ["tapahtuma"],
    fallback: [],
  });

  if (items.length === 0) return null;

  return (
    <section
      className="border-y border-border bg-surface py-20 sm:py-24"
      aria-labelledby="etusivu-tapahtumat"
    >
      <Container size="wide">
        <BlockHeading
          id="etusivu-tapahtumat"
          title={heading}
          action={{ href: "/tapahtumat", label: "Kaikki tapahtumat" }}
        />
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((event) => (
            <li key={event._id} className="grid">
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
