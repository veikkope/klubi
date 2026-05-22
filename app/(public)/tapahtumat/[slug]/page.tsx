import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin, Mail, ExternalLink, CalendarPlus } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SanityImage } from "@/components/sanity-image";
import { PortableText } from "@/components/portable-text";
import { LinkButton } from "@/components/ui/button";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  allTapahtumaSlugsQuery,
  tapahtumaBySlugQuery,
} from "@/sanity/lib/queries";
import { hasSanity } from "@/sanity/env";
import { formatEventRange } from "@/lib/format";
import type { TapahtumaFull } from "@/lib/types";
import { urlForImage } from "@/sanity/lib/image";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  if (!hasSanity) return [];
  const slugs = await sanityFetch<string[]>({
    query: allTapahtumaSlugsQuery,
    tags: ["tapahtuma"],
    fallback: [],
  });
  return slugs.map((slug) => ({ slug }));
}

async function getEvent(slug: string) {
  return sanityFetch<TapahtumaFull | null>({
    query: tapahtumaBySlugQuery,
    params: { slug },
    tags: ["tapahtuma", `tapahtuma:${slug}`],
    fallback: null,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return {};
  const ogBuilder = event.seo?.ogImage
    ? urlForImage(event.seo.ogImage)
    : event.image
      ? urlForImage(event.image)
      : null;
  return {
    title: event.seo?.metaTitle || event.title,
    description: event.seo?.metaDescription || undefined,
    openGraph: {
      title: event.title,
      images: ogBuilder
        ? [{ url: ogBuilder.width(1200).height(630).url() }]
        : undefined,
    },
  };
}

export default async function TapahtumaPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const hasImage = Boolean(event.image?.asset);
  const isPast = new Date(event.startsAt) < new Date();

  return (
    <article>
      {hasImage ? (
        <section className="relative isolate overflow-hidden bg-brand-950 text-white">
          <div className="absolute inset-0 -z-10">
            <SanityImage
              image={event.image!}
              width={2000}
              height={1000}
              sizes="100vw"
              className="h-full w-full object-cover opacity-45"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-brand-950/60 to-brand-950" />
          </div>
          <Container className="py-20 sm:py-28">
            <Breadcrumbs
              className="text-brand-100"
              items={[
                { label: "Etusivu", href: "/" },
                { label: "Tapahtumat", href: "/tapahtumat" },
                { label: event.title },
              ]}
            />
            <h1 className="mt-6 font-serif text-4xl leading-tight sm:text-6xl">
              {event.title}
            </h1>
            <p className="mt-4 inline-flex items-center gap-2 text-lg text-brand-100">
              <Calendar aria-hidden size={20} />
              {formatEventRange(event.startsAt, event.endsAt)}
            </p>
          </Container>
        </section>
      ) : (
        <Container className="pt-12">
          <Breadcrumbs
            items={[
              { label: "Etusivu", href: "/" },
              { label: "Tapahtumat", href: "/tapahtumat" },
              { label: event.title },
            ]}
          />
          <h1 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">
            {event.title}
          </h1>
        </Container>
      )}

      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PortableText value={event.description} />
            {isPast && !event.description && (
              <p className="text-muted">
                Tämä tapahtuma on jo pidetty. Raportti tai kuvia voi olla
                saatavilla{" "}
                <Link href="/uutiset" className="text-accent hover:underline">
                  uutisarkistossa
                </Link>
                .
              </p>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="font-serif text-xl">Tapahtumatiedot</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex gap-3">
                  <Calendar aria-hidden className="mt-0.5 shrink-0 text-accent" size={18} />
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                      Aika
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {formatEventRange(event.startsAt, event.endsAt)}
                    </dd>
                  </div>
                </div>
                {event.location && (
                  <div className="flex gap-3">
                    <MapPin aria-hidden className="mt-0.5 shrink-0 text-accent" size={18} />
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                        Paikka
                      </dt>
                      <dd className="mt-1 text-foreground">{event.location}</dd>
                    </div>
                  </div>
                )}
              </dl>

              {!isPast && (
                <div className="mt-6 space-y-3">
                  {event.signupUrl && (
                    <LinkButton
                      href={event.signupUrl}
                      variant="primary"
                      className="w-full"
                    >
                      Ilmoittaudu
                      <ExternalLink aria-hidden size={16} />
                    </LinkButton>
                  )}
                  {event.signupEmail && !event.signupUrl && (
                    <LinkButton
                      href={`mailto:${event.signupEmail}?subject=${encodeURIComponent("Ilmoittautuminen: " + event.title)}`}
                      variant="primary"
                      className="w-full"
                    >
                      <Mail aria-hidden size={16} />
                      Ilmoittaudu sähköpostilla
                    </LinkButton>
                  )}
                  <a
                    href={`/tapahtumat/${event.slug}/ics`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent"
                  >
                    <CalendarPlus aria-hidden size={16} />
                    Lisää kalenteriin
                  </a>
                </div>
              )}
            </div>
          </aside>
        </div>
      </Container>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildEventJsonLd(event)),
        }}
      />
    </article>
  );
}

function buildEventJsonLd(event: TapahtumaFull) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.startsAt,
    endDate: event.endsAt ?? undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: event.location
      ? { "@type": "Place", name: event.location }
      : undefined,
    organizer: {
      "@type": "Organization",
      name: "Lahden Suomalainen Klubi ry",
      url: "https://www.lahdensuomalainenklubi.com",
    },
  };
}
