import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink, MapPin, Calendar } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/stars";
import { SanityImage } from "@/components/sanity-image";
import { PortableText } from "@/components/portable-text";
import { AlbumGrid } from "@/components/gallery/album-grid";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  allRavintolaSlugsQuery,
  ravintolaBySlugQuery,
} from "@/sanity/lib/queries";
import { hasSanity } from "@/sanity/env";
import { formatDate } from "@/lib/format";
import { cuisineLabel } from "@/lib/ravintola-cuisines";
import { urlForImage } from "@/sanity/lib/image";
import type { RavintolaFull, UserReview, AlbumImage } from "@/lib/types";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  if (!hasSanity) return [];
  const slugs = await sanityFetch<string[]>({
    query: allRavintolaSlugsQuery,
    tags: ["ravintola"],
    fallback: [],
  });
  return slugs.map((slug) => ({ slug }));
}

async function getRestaurant(slug: string) {
  return sanityFetch<RavintolaFull | null>({
    query: ravintolaBySlugQuery,
    params: { slug },
    tags: ["ravintola", `ravintola:${slug}`],
    fallback: null,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  if (!r) return {};
  const cover = r.seo?.ogImage ?? r.images?.[0];
  const builder = cover ? urlForImage(cover) : null;
  return {
    title: r.seo?.metaTitle || r.name,
    description:
      r.seo?.metaDescription ||
      `Klubin arvostelu: ${r.name} (${r.city?.name ?? ""})`,
    openGraph: {
      title: r.name,
      images: builder
        ? [{ url: builder.width(1200).height(630).url() }]
        : undefined,
    },
  };
}

export default async function RavintolaPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  if (!r) notFound();

  const galleryImages: AlbumImage[] = (r.images ?? []).slice(1).map((img) => ({
    _key: undefined,
    asset: img?.asset,
    alt: img?.alt,
    caption: img?.caption,
  }));

  return (
    <article>
      <Container className="pt-12">
        <Breadcrumbs
          items={[
            { label: "Etusivu", href: "/" },
            { label: "Ravintolat", href: "/ravintolat" },
            { label: r.name },
          ]}
        />

        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Stars value={r.stars} />
              {r.priceLevel && <Badge tone="muted">{r.priceLevel}</Badge>}
            </div>
            <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
              {r.name}
            </h1>

            <dl className="mt-6 space-y-3 text-sm">
              {r.city && (
                <Row icon={<MapPin size={16} aria-hidden />} label="Sijainti">
                  {r.address && <>{r.address}, </>}
                  {r.city.name}
                </Row>
              )}
              {r.visitedAt && (
                <Row icon={<Calendar size={16} aria-hidden />} label="Käynti">
                  {formatDate(r.visitedAt)}
                </Row>
              )}
              {r.website && (
                <Row icon={<ExternalLink size={16} aria-hidden />} label="Verkkosivut">
                  <a
                    href={r.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    {r.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                </Row>
              )}
            </dl>

            {r.cuisine && r.cuisine.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-1.5">
                {r.cuisine.map((c) => (
                  <Badge key={c} tone="brand">
                    {cuisineLabel(c)}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {r.images?.[0]?.asset && (
            <div className="overflow-hidden rounded-2xl">
              <SanityImage
                image={r.images[0]}
                width={1200}
                height={900}
                sizes="(min-width: 1024px) 560px, 100vw"
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          )}
        </div>
      </Container>

      <Container size="narrow" className="py-16">
        <h2 className="font-serif text-2xl sm:text-3xl">Klubin arvostelu</h2>
        <div className="mt-6">
          <PortableText value={r.review} />
        </div>
      </Container>

      {galleryImages.length > 0 && (
        <Container className="py-12">
          <h2 className="font-serif text-2xl sm:text-3xl">Kuvia</h2>
          <div className="mt-6">
            <AlbumGrid images={galleryImages} />
          </div>
        </Container>
      )}

      {r.userReviews.length > 0 && (
        <section className="border-t border-border bg-surface py-16">
          <Container>
            <h2 className="font-serif text-2xl sm:text-3xl">
              Käyttäjäarvostelut
            </h2>
            <ul className="mt-8 space-y-6">
              {r.userReviews.map((review) => (
                <UserReviewCard key={review._id} review={review} />
              ))}
            </ul>
          </Container>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildRestaurantJsonLd(r)),
        }}
      />
    </article>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 shrink-0 text-accent">{icon}</span>
      <div>
        <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
          {label}
        </dt>
        <dd className="mt-0.5 text-base text-foreground">{children}</dd>
      </div>
    </div>
  );
}

function UserReviewCard({ review }: { review: UserReview }) {
  return (
    <li className="rounded-2xl border border-border bg-background p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{review.reviewerName}</p>
          <p className="text-xs text-muted">{formatDate(review.submittedAt)}</p>
        </div>
        <Stars value={review.stars} />
      </div>
      <p className="mt-3 text-base leading-relaxed text-foreground whitespace-pre-line">
        {review.comment}
      </p>
    </li>
  );
}

function buildRestaurantJsonLd(r: RavintolaFull) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: r.name,
    address: r.address
      ? {
          "@type": "PostalAddress",
          streetAddress: r.address,
          addressLocality: r.city?.name,
          addressCountry: r.city?.country,
        }
      : undefined,
    servesCuisine: r.cuisine ?? undefined,
    priceRange: r.priceLevel ?? undefined,
    url: r.website ?? undefined,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: r.stars,
      bestRating: 5,
      ratingCount: 1 + r.userReviews.length,
    },
  };
}
