import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Calendar, ExternalLink, MapPin, Phone } from "lucide-react";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/stars";
import { SanityImage } from "@/components/sanity-image";
import { PortableText } from "@/components/portable-text";
import { AlbumGrid } from "@/components/gallery/album-grid";
import {
  RatingBadge,
  RestaurantCard,
  formatRating,
  overallRating,
  subRatings,
} from "@/components/restaurant-card";
import { cuisineLabel } from "@/lib/ravintola-cuisines";
import { formatDate } from "@/lib/format";
import { rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, restaurantSchema } from "@/lib/schema-org";
import { buildMetadata, resolveDescription } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import { urlForImage } from "@/sanity/lib/image";
import { hasSanity } from "@/sanity/env";
import {
  ravintolaBySlugQuery,
  ravintolaSlugsQuery,
  type RavintolaDetail,
} from "@/sanity/lib/queries/ravintolat";
import type { AlbumImage } from "@/lib/types";

export const revalidate = 3600;

type Params = { slug: string };
type PageProps = { params: Promise<Params> };

export async function generateStaticParams(): Promise<Params[]> {
  if (!hasSanity) return [];
  const slugs = await sanityFetch<string[]>({
    query: ravintolaSlugsQuery,
    tags: ["ravintola"],
    fallback: [],
  });
  return slugs.filter(Boolean).map((slug) => ({ slug }));
}

async function getRavintola(slug: string): Promise<RavintolaDetail | null> {
  return sanityFetch<RavintolaDetail | null>({
    query: ravintolaBySlugQuery,
    params: { slug },
    tags: ["ravintola", `ravintola:${slug}`],
    fallback: null,
  });
}

/** Sivun kuvaus: kirjoitettu SEO-teksti, muuten tiivistelmä, muuten koottu fakta. */
function describe(r: RavintolaDetail): string | undefined {
  const rating = overallRating(r);
  const generated = [
    `${r.name}${r.city?.name ? ` (${r.city.name})` : ""}`,
    rating !== null ? `arvosana ${formatRating(rating)}/5` : null,
    "Lahden Suomalainen Klubi ry:n ravintola-arvostelu.",
  ]
    .filter(Boolean)
    .join(" — ");
  return resolveDescription(r.seoDescription, r.tiivistelma, generated);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRavintola(slug);
  if (!r) {
    return buildMetadata({
      title: "Ravintolaa ei löytynyt",
      path: `/ravintolat/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: r.seoTitle || r.name,
    description: describe(r),
    path: `/ravintolat/${r.slug}`,
    image: r.images?.[0] ?? undefined,
    modifiedAt: r._updatedAt,
  });
}

export default async function RavintolaPage({ params }: PageProps) {
  const { slug } = await params;
  const r = await getRavintola(slug);
  if (!r) notFound();

  const trail = [
    rootCrumb,
    { label: "Ravintolat", href: "/ravintolat" },
    { label: r.name },
  ];

  const rating = overallRating(r);
  const parts = subRatings(r);
  const isClosed = r.closed === true;
  const hero = r.images?.[0];
  const heroUrl = hero ? urlForImage(hero)?.width(1200).height(630).url() : null;

  const galleryImages: AlbumImage[] = (r.images ?? [])
    .slice(1)
    .filter((image): image is NonNullable<typeof image> => Boolean(image?.asset))
    .map((image) => ({
      asset: image.asset,
      alt: image.alt,
      caption: image.caption,
    }));

  const visits = (r.visits ?? []).filter(Boolean);

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          restaurantSchema({
            name: r.name,
            description: r.tiivistelma,
            path: `/ravintolat/${r.slug}`,
            address: r.address,
            postalCode: r.postalCode,
            city: r.city?.name,
            phone: r.phone,
            website: r.website,
            image: heroUrl,
            rating,
            reviewCount: r.userReviews.length,
            closed: isClosed,
          }),
        ]}
      />

      <Container size="wide" className="py-12 sm:py-16">
        <PageHeader
          title={r.name}
          lead={r.tiivistelma}
          eyebrow={r.city?.name}
          breadcrumbs={trail}
          meta={
            <>
              {rating !== null && (
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 font-medium text-brand-800">
                  <span className="tabular-nums">{formatRating(rating)}</span>
                  <span className="text-sm font-normal">/ 5</span>
                </span>
              )}
              {typeof r.stars === "number" && <Stars value={r.stars} />}
              {r.priceLevel && <Badge tone="muted">{r.priceLevel}</Badge>}
              {isClosed && <Badge tone="neutral">Toiminta loppunut</Badge>}
            </>
          }
        />

        {isClosed && (
          <p
            role="note"
            className="mt-6 rounded-2xl border border-warning/40 bg-warning-soft p-5 text-sm leading-relaxed text-foreground"
          >
            <strong className="font-semibold">
              Tämä ravintola ei ole enää toiminnassa.
            </strong>{" "}
            {r.closedNote ??
              "Arvostelu on säilytetty klubin historian vuoksi, mutta tiedot eivät ole ajan tasalla."}
          </p>
        )}

        {hero?.asset && (
          <div className="mt-8 overflow-hidden rounded-2xl">
            <SanityImage
              image={hero}
              width={1600}
              height={900}
              sizes="(min-width: 1280px) 1152px, 100vw"
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        )}

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0 space-y-12">
            <RatingSection rating={rating} parts={parts} />

            {Boolean(r.pros?.length || r.cons?.length) && (
              <ProsConsSection pros={r.pros} cons={r.cons} />
            )}

            {r.review && r.review.length > 0 && (
              <section aria-labelledby="arvostelu-otsikko">
                <h2
                  id="arvostelu-otsikko"
                  className="font-serif text-2xl sm:text-3xl"
                >
                  Klubin arvostelu
                </h2>
                <div className="mt-4">
                  <PortableText value={r.review} />
                </div>
              </section>
            )}

            {galleryImages.length > 0 && (
              <section aria-labelledby="kuvat-otsikko">
                <h2 id="kuvat-otsikko" className="font-serif text-2xl sm:text-3xl">
                  Kuvia käynneiltä
                </h2>
                <div className="mt-6">
                  <AlbumGrid images={galleryImages} />
                </div>
              </section>
            )}

            {r.userReviews.length > 0 && (
              <section aria-labelledby="kavijat-otsikko">
                <h2
                  id="kavijat-otsikko"
                  className="font-serif text-2xl sm:text-3xl"
                >
                  Kävijöiden arvostelut
                </h2>
                <ul className="mt-6 space-y-5">
                  {r.userReviews.map((review) => (
                    <li
                      key={review._id}
                      className="rounded-2xl border border-border bg-surface p-6"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {review.reviewerName ?? "Nimetön"}
                          </p>
                          {review.submittedAt && (
                            <p className="text-xs text-muted">
                              {formatDate(review.submittedAt)}
                            </p>
                          )}
                        </div>
                        {typeof review.stars === "number" && (
                          <Stars value={review.stars} />
                        )}
                      </div>
                      {review.comment && (
                        <p className="mt-3 whitespace-pre-line leading-relaxed text-foreground">
                          {review.comment}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="space-y-8 lg:sticky lg:top-24">
            <ContactSection restaurant={r} />
            {visits.length > 0 || r.visitedAt || r.visitContext ? (
              <VisitSection
                visits={visits}
                visitedAt={r.visitedAt}
                visitContext={r.visitContext}
              />
            ) : null}
            {r.cuisine && r.cuisine.length > 0 && (
              <section aria-labelledby="ruokatyypit-otsikko">
                <h2
                  id="ruokatyypit-otsikko"
                  className="text-xs font-medium uppercase tracking-[0.18em] text-muted"
                >
                  Ruokatyypit
                </h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.cuisine.map((c) => (
                    <Badge key={c} tone="brand">
                      {cuisineLabel(c)}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="font-serif text-xl">Kävitkö täällä?</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Lähetä oma arviosi. Käymme jokaisen lähetyksen läpi ennen
                julkaisua.
              </p>
              <Link
                href={`/ravintolat/arvostele?ravintola=${r.slug}`}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-white transition hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Arvostele ravintola
              </Link>
            </div>
          </aside>
        </div>

        {r.related.length > 0 && (
          <section aria-labelledby="muut-otsikko" className="mt-16">
            <h2 id="muut-otsikko" className="font-serif text-2xl sm:text-3xl">
              Muita ravintoloita{r.city?.name ? ` — ${r.city.name}` : ""}
            </h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {r.related.map((item) => (
                <li key={item._id} className="flex">
                  <RestaurantCard restaurant={item} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-12">
          <Link
            href="/ravintolat"
            className="inline-flex min-h-11 items-center text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            ← Kaikki ravintola-arvostelut
          </Link>
        </p>
      </Container>
    </>
  );
}

function RatingSection({
  rating,
  parts,
}: {
  rating: number | null;
  parts: ReturnType<typeof subRatings>;
}) {
  return (
    <section aria-labelledby="arvosanat-otsikko">
      <h2 id="arvosanat-otsikko" className="font-serif text-2xl sm:text-3xl">
        Arvosanat
      </h2>

      {rating === null && parts.length === 0 ? (
        <p className="mt-4 text-muted">
          Tätä ravintolaa ei ole vielä arvioitu numeerisesti.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-8 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center">
          {rating !== null && (
            <div className="flex shrink-0 flex-col items-center gap-2">
              <RatingBadge value={rating} size="lg" />
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                Kokonaisarvosana
              </p>
            </div>
          )}

          {parts.length > 0 && (
            <dl className="w-full space-y-4">
              {parts.map((part) => (
                <div key={part.key}>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-sm font-medium text-foreground">
                      {part.label}
                    </dt>
                    <dd className="text-sm font-semibold tabular-nums text-foreground">
                      {formatRating(part.value)}
                      <span className="font-normal text-muted"> / 5</span>
                    </dd>
                  </div>
                  <div
                    aria-hidden
                    className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-strong"
                  >
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, (part.value / 5) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </section>
  );
}

function ProsConsSection({
  pros,
  cons,
}: {
  pros?: string[] | null;
  cons?: string[] | null;
}) {
  return (
    <section aria-labelledby="plussat-otsikko">
      <h2 id="plussat-otsikko" className="font-serif text-2xl sm:text-3xl">
        Plussat ja miinukset
      </h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {pros && pros.length > 0 && (
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Plussat
            </h3>
            <ul className="mt-3 space-y-2">
              {pros.map((item, i) => (
                <li key={`${item}-${i}`} className="flex gap-2 text-foreground">
                  <span aria-hidden className="text-brand-600">
                    +
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {cons && cons.length > 0 && (
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Miinukset
            </h3>
            <ul className="mt-3 space-y-2">
              {cons.map((item, i) => (
                <li key={`${item}-${i}`} className="flex gap-2 text-foreground">
                  <span aria-hidden className="text-muted">
                    −
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function ContactSection({ restaurant: r }: { restaurant: RavintolaDetail }) {
  const hasAddress = Boolean(r.address || r.postalCode || r.city?.name);
  if (!hasAddress && !r.phone && !r.website) {
    return (
      <section aria-labelledby="yhteystiedot-otsikko">
        <h2
          id="yhteystiedot-otsikko"
          className="text-xs font-medium uppercase tracking-[0.18em] text-muted"
        >
          Yhteystiedot
        </h2>
        <p className="mt-3 text-sm text-muted">Yhteystietoja ei ole kirjattu.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="yhteystiedot-otsikko">
      <h2
        id="yhteystiedot-otsikko"
        className="text-xs font-medium uppercase tracking-[0.18em] text-muted"
      >
        Yhteystiedot
      </h2>
      <dl className="mt-3 space-y-4 text-sm">
        {hasAddress && (
          <InfoRow icon={<MapPin size={16} aria-hidden />} label="Osoite">
            {[r.address, [r.postalCode, r.city?.name].filter(Boolean).join(" ")]
              .filter(Boolean)
              .join(", ")}
          </InfoRow>
        )}
        {r.phone && (
          <InfoRow icon={<Phone size={16} aria-hidden />} label="Puhelin">
            <a
              href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}
              className="text-accent hover:underline"
            >
              {r.phone}
            </a>
          </InfoRow>
        )}
        {r.website && (
          <InfoRow
            icon={<ExternalLink size={16} aria-hidden />}
            label="Verkkosivut"
          >
            <a
              href={r.website}
              target="_blank"
              rel="noopener noreferrer"
              className="break-words text-accent hover:underline"
            >
              {r.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </a>
          </InfoRow>
        )}
      </dl>
    </section>
  );
}

function VisitSection({
  visits,
  visitedAt,
  visitContext,
}: {
  visits: string[];
  visitedAt?: string | null;
  visitContext?: string | null;
}) {
  const dates = visits.length > 0 ? visits : visitedAt ? [visitedAt] : [];

  return (
    <section aria-labelledby="kaynnit-otsikko">
      <h2
        id="kaynnit-otsikko"
        className="text-xs font-medium uppercase tracking-[0.18em] text-muted"
      >
        Klubin käynnit
      </h2>
      {visitContext && (
        <p className="mt-3 text-sm text-foreground">{visitContext}</p>
      )}
      {dates.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm">
          {dates.map((date, i) => (
            <li key={`${date}-${i}`} className="flex items-center gap-2">
              <Calendar size={14} aria-hidden className="shrink-0 text-accent" />
              <time dateTime={date}>{formatDate(date)}</time>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">Käyntipäiviä ei ole kirjattu.</p>
      )}
    </section>
  );
}

function InfoRow({
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
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
          {label}
        </dt>
        <dd className="mt-0.5 text-base text-foreground">{children}</dd>
      </div>
    </div>
  );
}
