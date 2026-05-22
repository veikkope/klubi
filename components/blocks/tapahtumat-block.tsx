import Link from "next/link";
import { Container } from "@/components/layout/container";
import { EventCard } from "@/components/event-card";
import { sanityFetch } from "@/sanity/lib/fetch";
import { upcomingTapahtumatQuery } from "@/sanity/lib/queries";
import type { TapahtumaCard } from "@/lib/types";

type Props = {
  heading?: string;
  count?: number;
};

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

  return (
    <section className="bg-surface py-20">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <h2 className="font-serif text-3xl sm:text-4xl">{heading}</h2>
          <Link
            href="/tapahtumat"
            className="text-sm font-medium text-accent hover:text-accent-hover"
          >
            Kaikki tapahtumat →
          </Link>
        </div>
        {items.length === 0 ? (
          <p className="mt-10 text-muted">
            Ei tulevia tapahtumia juuri nyt. Tutustu menneisiin tapahtumiin{" "}
            <Link href="/tapahtumat" className="text-accent hover:underline">
              tapahtuma-arkistossa
            </Link>
            .
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
