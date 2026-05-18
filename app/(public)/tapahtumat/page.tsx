import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { EventCard } from "@/components/event-card";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  allUpcomingTapahtumatQuery,
  pastTapahtumatQuery,
} from "@/sanity/lib/queries";
import type { TapahtumaCard } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tapahtumat",
  description:
    "Lahden Suomalaisen Klubi ry:n tulevat ja menneet tapahtumat — vuosikokoukset, vapunviettelot, mölkkyturnaukset ja muut tilaisuudet.",
};

export default async function TapahtumatPage() {
  const [upcoming, past] = await Promise.all([
    sanityFetch<TapahtumaCard[]>({
      query: allUpcomingTapahtumatQuery,
      tags: ["tapahtuma"],
      fallback: [],
    }),
    sanityFetch<TapahtumaCard[]>({
      query: pastTapahtumatQuery,
      params: { count: 24 },
      tags: ["tapahtuma"],
      fallback: [],
    }),
  ]);

  const hasAny = upcoming.length > 0 || past.length > 0;

  return (
    <>
      <Container className="pt-12">
        <Breadcrumbs items={[{ label: "Etusivu", href: "/" }, { label: "Tapahtumat" }]} />
        <h1 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">
          Tapahtumat
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Yhdistys järjestää vuosittain vuosikokouksen, vapun, mölkkyturnauksen
          ja muita tilaisuuksia jäsenille ja heidän vierailleen.
        </p>
      </Container>

      <Container className="py-16">
        {!hasAny ? (
          <EmptyState />
        ) : (
          <>
            <section aria-labelledby="tulevat">
              <h2
                id="tulevat"
                className="font-serif text-2xl sm:text-3xl"
              >
                Tulevat
              </h2>
              {upcoming.length === 0 ? (
                <p className="mt-6 text-muted">
                  Ei tulevia tapahtumia juuri nyt. Tutustu alla menneisiin
                  tapahtumiin tai liity jäseneksi saadaksesi kutsuja.
                </p>
              ) : (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              )}
            </section>

            {past.length > 0 && (
              <section aria-labelledby="menneet" className="mt-20">
                <div className="flex items-end justify-between gap-6">
                  <h2
                    id="menneet"
                    className="font-serif text-2xl sm:text-3xl"
                  >
                    Menneet
                  </h2>
                  <span className="text-sm text-muted">{past.length} tapahtumaa</span>
                </div>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {past.map((event) => (
                    <EventCard key={event._id} event={event} past />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </Container>
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <p className="font-serif text-2xl">Ei vielä tapahtumia</p>
      <p className="mt-2 max-w-md text-muted mx-auto">
        Tapahtumat lisätään Sanity Studiossa. Heti kun ensimmäinen tapahtuma on
        julkaistu, se ilmestyy tänne.
      </p>
    </div>
  );
}
