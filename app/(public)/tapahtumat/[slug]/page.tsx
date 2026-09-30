import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ExternalLink, Mail, MapPin } from "lucide-react";
import { stegaClean } from "next-sanity";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { PortableText } from "@/components/portable-text";
import { SanityImage } from "@/components/sanity-image";
import { JsonLd } from "@/components/seo/json-ld";
import { LinkButton } from "@/components/ui/button";
import { formatEventRange } from "@/lib/format";
import { rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, eventSchema } from "@/lib/schema-org";
import { buildMetadata, resolveDescription } from "@/lib/seo";
import { hasSanity } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/fetch";
import { urlForImage } from "@/sanity/lib/image";
import {
  tapahtumaDetailQuery,
  tapahtumaSlugsQuery,
  type TapahtumaDetail,
} from "@/sanity/lib/queries/uutiset";

import { IcsLink } from "../_components/ics-link";

export const revalidate = 3600;

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  if (!hasSanity) return [];
  const slugs = await sanityFetch<string[]>({
    query: tapahtumaSlugsQuery,
    tags: ["tapahtuma"],
    fallback: [],
  });
  return slugs.map((slug) => ({ slug }));
}

async function getTapahtuma(slug: string) {
  return sanityFetch<TapahtumaDetail | null>({
    query: tapahtumaDetailQuery,
    params: { slug },
    tags: ["tapahtuma", `tapahtuma:${slug}`],
    fallback: null,
  });
}

/** Kuvaus kun kirjoitettua tiivistelmää ei ole: aika ja paikka riittävät. */
function fallbackDescription(event: TapahtumaDetail): string {
  const when = formatEventRange(event.startsAt, event.endsAt);
  const where = event.location ? `, ${event.location}` : "";
  return `${event.title} — ${when}${where}.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getTapahtuma(slug);

  if (!event) {
    return buildMetadata({
      title: "Tapahtumaa ei löytynyt",
      path: `/tapahtumat/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: event.seoTitle || event.title,
    description: resolveDescription(
      event.seoDescription,
      event.tiivistelma,
      fallbackDescription(event),
    ),
    path: `/tapahtumat/${event.slug}`,
    image: event.image,
    publishedAt: event.startsAt,
    modifiedAt: event._updatedAt,
  });
}

export default async function TapahtumaPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const event = await getTapahtuma(slug);
  if (!event) notFound();

  const path = `/tapahtumat/${event.slug}`;
  const isPast = new Date(event.endsAt ?? event.startsAt) < new Date();
  const trail = [
    rootCrumb,
    { label: "Tapahtumat", href: "/tapahtumat" },
    { label: event.title },
  ];
  const imageUrl =
    urlForImage(event.image)?.width(1200).height(630).fit("crop").url() ?? null;
  // mailto-osoitteeseen ei saa päätyä luonnosnäkymän stega-merkkejä.
  const signupEmail = stegaClean(event.signupEmail);
  const mailtoSubject = encodeURIComponent(`Ilmoittautuminen: ${stegaClean(event.title)}`);

  return (
    <article>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          eventSchema({
            title: event.title,
            description: event.tiivistelma,
            path,
            startDate: event.startsAt,
            endDate: event.endsAt,
            locationName: event.location,
            image: imageUrl,
          }),
        ]}
      />

      <Container className="pt-12">
        <PageHeader
          title={event.title}
          lead={event.tiivistelma}
          eyebrow={isPast ? "Mennyt tapahtuma" : "Tuleva tapahtuma"}
          breadcrumbs={trail}
          meta={
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-2">
                <Calendar aria-hidden size={16} className="text-accent" />
                <time dateTime={event.startsAt}>
                  {formatEventRange(event.startsAt, event.endsAt)}
                </time>
              </span>
              {event.location && (
                <span className="inline-flex items-center gap-2">
                  <MapPin aria-hidden size={16} className="text-accent" />
                  {event.location}
                </span>
              )}
            </div>
          }
          actions={
            <>
              {!isPast && event.signupUrl && (
                <LinkButton href={event.signupUrl} variant="primary">
                  Ilmoittaudu
                  <ExternalLink aria-hidden size={16} />
                </LinkButton>
              )}
              {!isPast && !event.signupUrl && event.signupEmail && (
                <LinkButton
                  href={`mailto:${signupEmail}?subject=${mailtoSubject}`}
                  variant="primary"
                >
                  <Mail aria-hidden size={16} />
                  Ilmoittaudu sähköpostilla
                </LinkButton>
              )}
              <IcsLink slug={event.slug} />
            </>
          }
        />
      </Container>

      {event.image?.asset && (
        <Container size="wide" className="mt-12">
          <div className="overflow-hidden rounded-2xl">
            <SanityImage
              image={event.image}
              width={1600}
              height={900}
              sizes="(min-width: 1280px) 1152px, 100vw"
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        </Container>
      )}

      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {event.description ? (
              <PortableText value={event.description} />
            ) : (
              <p className="text-muted">
                Tapahtuman kuvausta ei ole vielä kirjoitettu.
              </p>
            )}

            {isPast && (
              <p className="mt-10 text-sm text-muted">
                Tämä tapahtuma on jo pidetty. Raportti tai kuvia voi löytyä{" "}
                <Link href="/uutiset" className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2">
                  uutisista
                </Link>{" "}
                tai{" "}
                <Link href="/galleria" className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2">
                  galleriasta
                </Link>
                .
              </p>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="font-display text-xl">Tapahtumatiedot</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex gap-3">
                  <Calendar
                    aria-hidden
                    className="mt-0.5 shrink-0 text-accent"
                    size={18}
                  />
                  <div>
                    <dt className="font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-soft">
                      Aika
                    </dt>
                    <dd className="mt-1 text-foreground">
                      <time dateTime={event.startsAt}>
                        {formatEventRange(event.startsAt, event.endsAt)}
                      </time>
                    </dd>
                  </div>
                </div>

                {event.location && (
                  <div className="flex gap-3">
                    <MapPin
                      aria-hidden
                      className="mt-0.5 shrink-0 text-accent"
                      size={18}
                    />
                    <div>
                      <dt className="font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-soft">
                        Paikka
                      </dt>
                      <dd className="mt-1 text-foreground">{event.location}</dd>
                    </div>
                  </div>
                )}

                {!isPast && event.signupEmail && (
                  <div className="flex gap-3">
                    <Mail
                      aria-hidden
                      className="mt-0.5 shrink-0 text-accent"
                      size={18}
                    />
                    <div>
                      <dt className="font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-soft">
                        Ilmoittautumiset
                      </dt>
                      <dd className="mt-1">
                        <a
                          href={`mailto:${signupEmail}`}
                          className="text-foreground hover:text-accent"
                        >
                          {event.signupEmail}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
              </dl>

              <div className="mt-6 flex flex-col gap-3">
                <IcsLink slug={event.slug} />
                <Link
                  href="/tapahtumat"
                  className="inline-flex min-h-11 items-center justify-center text-sm text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
                >
                  Kaikki tapahtumat
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </article>
  );
}
