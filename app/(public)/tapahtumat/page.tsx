import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { EventCard } from "@/components/event-card";
import { JsonLd } from "@/components/seo/json-ld";
import { rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import { haeTyhjatOsiot } from "@/sanity/lib/tyhjat-osiot";
import { haeOsioSivu } from "@/sanity/lib/osiosivu";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  menneetTapahtumatQuery,
  tulevatTapahtumatQuery,
  type TapahtumaListItem,
} from "@/sanity/lib/queries/uutiset";

import { PastEvents } from "./_components/past-events";

export const revalidate = 3600;

const PATH = "/tapahtumat";

/** Otsikko, johdanto ja hakukoneteksti: Studion Osioiden sivut (lib/osiosivut.ts). */
const OSIO = "tapahtumat" as const;

export async function generateMetadata(): Promise<Metadata> {
  // Tyhjä osio ei näy valikossa eikä sitemapissa, eikä sitä indeksoida (lib/osiot.ts).
  const [tyhjat, s] = await Promise.all([haeTyhjatOsiot(), haeOsioSivu(OSIO)]);
  const tyhja = tyhjat.has(PATH);
  return buildMetadata({
    title: s.seoTitle,
    description: s.description,
    path: PATH,
    noIndex: tyhja,
  });
}

export default async function TapahtumatPage() {
  const [upcoming, past, s] = await Promise.all([
    sanityFetch<TapahtumaListItem[]>({
      query: tulevatTapahtumatQuery,
      tags: ["tapahtuma"],
      fallback: [],
    }),
    sanityFetch<TapahtumaListItem[]>({
      query: menneetTapahtumatQuery,
      tags: ["tapahtuma"],
      fallback: [],
    }),
    haeOsioSivu(OSIO),
  ]);

  const trail = [rootCrumb, { label: s.title }];
  const hasAny = upcoming.length > 0 || past.length > 0;

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({
            title: s.title,
            description: s.description,
            path: PATH,
            itemCount: upcoming.length + past.length,
          }),
        ]}
      />

      <Container className="pt-12">
        <PageHeader title={s.title} lead={s.lead} breadcrumbs={trail} />
      </Container>

      <Container className="py-16">
        {!hasAny ? (
          <EmptyState />
        ) : (
          <>
            <section aria-labelledby="tulevat">
              <h2 id="tulevat" className="font-display text-2xl sm:text-3xl">
                Tulevat tapahtumat
              </h2>

              {upcoming.length === 0 ? (
                <p className="mt-4 max-w-2xl text-muted">
                  Ei tulevia tapahtumia juuri nyt. Seuraava tilaisuus
                  ilmoitetaan täällä ja{" "}
                  <Link href="/uutiset" className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2">
                    uutisissa
                  </Link>
                  .
                </p>
              ) : (
                <ul className="mt-8 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((event) => (
                    <li key={event._id} className="flex">
                      <EventCard event={event} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {past.length > 0 && (
              <section aria-labelledby="menneet" className="mt-20">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <h2 id="menneet" className="font-display text-2xl sm:text-3xl">
                    Menneet tapahtumat
                  </h2>
                  <span className="text-sm text-muted">
                    {past.length === 1
                      ? "1 tapahtuma"
                      : `${past.length} tapahtumaa`}
                  </span>
                </div>
                <PastEvents events={past} />
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
    <div
      data-empty-state=""
      className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center"
    >
      <p className="font-display text-2xl">Ei vielä tapahtumia</p>
      <p className="mx-auto mt-2 max-w-md text-muted">
        Tulevista tapahtumista kerrotaan tällä sivulla. Aiempien vuosien vaput,
        mölkkyturnaukset, jouluruokailut ja muut tilaisuudet löytyvät klubin
        toimintasivuilta.
      </p>
      <p className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
        <Link href="/klubi/toiminta" className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2">
          Klubin toiminta
        </Link>
        <Link href="/uutiset" className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2">
          Lue uutisia
        </Link>
      </p>
    </div>
  );
}
