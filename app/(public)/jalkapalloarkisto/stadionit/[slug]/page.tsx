import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PortableText } from "@/components/portable-text";
import { SanityImage } from "@/components/sanity-image";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionNav } from "@/components/layout/section-nav";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { arkistoNav, rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, placeSchema } from "@/lib/schema-org";
import { buildMetadata, resolveDescription } from "@/lib/seo";
import { hasSanity } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/fetch";
import { urlForImage } from "@/sanity/lib/image";
import {
  stadionBySlugQuery,
  stadionSlugsQuery,
  stadionitRelatedQuery,
  withSlug,
  type StadionCard,
  type StadionFull,
} from "@/sanity/lib/queries/arkisto-laajennus";

export const revalidate = 3600;

type Params = { slug: string };

const LIST_PATH = "/jalkapalloarkisto/stadionit";

function pathFor(slug: string): string {
  return `${LIST_PATH}/${slug}`;
}

export async function generateStaticParams(): Promise<Params[]> {
  if (!hasSanity) return [];
  const slugs = await sanityFetch<string[]>({
    query: stadionSlugsQuery,
    tags: ["stadion"],
    fallback: [],
  });
  return slugs.filter(Boolean).map((slug) => ({ slug }));
}

async function getStadion(slug: string) {
  return sanityFetch<StadionFull | null>({
    query: stadionBySlugQuery,
    params: { slug },
    tags: ["stadion", `stadion:${slug}`],
    fallback: null,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const stadion = await getStadion(slug);

  if (!stadion) {
    return buildMetadata({
      title: "Sivua ei löytynyt",
      path: pathFor(slug),
      noIndex: true,
    });
  }

  return buildMetadata({
    title: stadion.seoTitle || stadion.name,
    description: resolveDescription(
      stadion.seoDescription,
      stadion.tiivistelma,
    ),
    path: pathFor(slug),
    image: stadion.images?.[0],
    modifiedAt: stadion._updatedAt,
  });
}

export default async function StadionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const stadion = await getStadion(slug);
  if (!stadion) notFound();

  const related = withSlug(
    await sanityFetch<StadionCard[]>({
      query: stadionitRelatedQuery,
      params: { slug, cityName: stadion.city?.name ?? null },
      tags: ["stadion"],
      fallback: [],
    }),
  );

  const path = pathFor(slug);
  const trail = [
    rootCrumb,
    { label: "Jalkapalloarkisto", href: "/jalkapalloarkisto" },
    { label: "Stadionit", href: LIST_PATH },
    { label: stadion.name },
  ];

  const kuvat = (stadion.images ?? []).filter(Boolean);
  const paakuva = kuvat[0];
  const lisakuvat = kuvat.slice(1);
  const sijainti = [stadion.city?.name, stadion.city?.country]
    .filter(Boolean)
    .join(", ");
  const description = resolveDescription(
    stadion.seoDescription,
    stadion.tiivistelma,
  );

  // Koordinaatit näytetään tekstinä. Karttapalvelun valinta on erillinen
  // päätös, eikä CLAUDE.md salli palveluun lukitsevaa upotusta.
  const koordinaatit =
    typeof stadion.location?.lat === "number" &&
    typeof stadion.location?.lng === "number"
      ? `${stadion.location.lat.toFixed(4)}, ${stadion.location.lng.toFixed(4)}`
      : null;

  const hasFacts = Boolean(
    sijainti ||
      stadion.capacity != null ||
      stadion.openedYear != null ||
      koordinaatit,
  );

  return (
    <Container className="py-12 sm:py-16">
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          placeSchema({
            name: stadion.name,
            description,
            path,
            placeType: "StadiumOrArena",
            city: stadion.city?.name,
            country: stadion.city?.country,
            capacity: stadion.capacity,
            openedYear: stadion.openedYear,
            latitude: stadion.location?.lat,
            longitude: stadion.location?.lng,
            image: paakuva
              ? (urlForImage(paakuva)?.width(1200).height(675).url() ?? null)
              : null,
          }),
        ]}
      />

      <PageHeader
        eyebrow="Stadion"
        title={stadion.name}
        lead={stadion.tiivistelma}
        breadcrumbs={trail}
        meta={
          stadion.city?.name ? (
            <Badge tone="brand">{stadion.city.name}</Badge>
          ) : undefined
        }
      />

      <SectionNav
        items={arkistoNav}
        label="Jalkapalloarkiston osiot"
        className="mt-8"
      />

      {paakuva?.asset && (
        <figure className="mt-10 overflow-hidden rounded-2xl">
          <SanityImage
            image={paakuva}
            width={1600}
            height={900}
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="h-auto w-full object-cover"
            priority
          />
          {paakuva.caption && (
            <figcaption className="mt-2 text-sm text-muted">
              {paakuva.caption}
            </figcaption>
          )}
        </figure>
      )}

      {hasFacts && (
        <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
          <Fact label="Sijainti" value={sijainti} />
          <Fact
            label="Kapasiteetti"
            value={
              stadion.capacity != null
                ? `${stadion.capacity.toLocaleString("fi-FI")} paikkaa`
                : null
            }
            numeric
          />
          <Fact
            label="Rakennusvuosi"
            value={stadion.openedYear?.toString()}
            numeric
          />
          {koordinaatit && (
            <Fact label="Koordinaatit" value={koordinaatit} numeric />
          )}
        </dl>
      )}

      {stadion.description && stadion.description.length > 0 && (
        <div className="mt-12 max-w-3xl">
          <PortableText value={stadion.description} />
        </div>
      )}

      {lisakuvat.length > 0 && (
        <section aria-labelledby="stadionin-kuvat" className="mt-16">
          <h2
            id="stadionin-kuvat"
            className="font-serif text-2xl text-foreground sm:text-3xl"
          >
            Kuvat
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lisakuvat.map((kuva, index) => (
              <li key={kuva?.asset?._ref ?? index}>
                <figure>
                  <SanityImage
                    image={kuva}
                    width={800}
                    height={600}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="h-auto w-full rounded-2xl object-cover"
                  />
                  {kuva?.caption && (
                    <figcaption className="mt-2 text-sm text-muted">
                      {kuva.caption}
                    </figcaption>
                  )}
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="muut-stadionit" className="mt-16">
          <h2
            id="muut-stadionit"
            className="font-serif text-2xl text-foreground sm:text-3xl"
          >
            Muita stadioneja arkistossa
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item._id}>
                <Card href={pathFor(item.slug)} className="h-full">
                  {item.city?.name && <CardEyebrow>{item.city.name}</CardEyebrow>}
                  <CardTitle className="mt-1">{item.name}</CardTitle>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}

function Fact({
  label,
  value,
  numeric = false,
}: {
  label: string;
  value?: string | null;
  numeric?: boolean;
}) {
  return (
    <div className="bg-surface px-5 py-4">
      <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
        {label}
      </dt>
      <dd
        className={
          numeric
            ? "mt-1 text-base tabular-nums text-foreground"
            : "mt-1 text-base text-foreground"
        }
      >
        {value?.trim() ? value : "—"}
      </dd>
    </div>
  );
}
