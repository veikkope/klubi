import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Calendar } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Eyebrow } from "@/components/blocks/block-heading";
import { LinkButton } from "@/components/ui/button";
import { Nuoli } from "@/components/ui/nuoli";
import { RatingDots } from "@/components/ui/rating-dots";
import { JsonLd } from "@/components/seo/json-ld";
import { FramedImage } from "@/components/framed-image";
import { PortableText } from "@/components/portable-text";
import { KuvaSiirtyma } from "@/components/sivunvaihto";
import { AlbumGrid } from "@/components/gallery/album-grid";
import { ReviewPhotos } from "@/components/gallery/review-photos";
import {
  formatRating,
  overallRating,
  subRatings,
} from "@/components/restaurant-card";
import { ensimmainenKappaleIngressiksi } from "@/lib/artikkeli";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, restaurantSchema } from "@/lib/schema-org";
import { buildMetadata, resolveDescription } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import { urlForImage } from "@/sanity/lib/image";
import { hasSanity } from "@/sanity/env";
import {
  ravintolaArvostelutQuery,
  ravintolaBySlugQuery,
  ravintolaKlubiArviotQuery,
  ravintolaSlugsQuery,
  type RavintolaDetail,
  type RavintolaUserReview,
} from "@/sanity/lib/queries/ravintolat";
import { paivaksi, voimassaOlevat, type KlubilaisenArvio, type VoimassaOlevaArvio } from "@/lib/ravintola-arvosana";
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
  const r = await sanityFetch<Omit<RavintolaDetail, "userReviews" | "klubiArviot"> | null>({
    query: ravintolaBySlugQuery,
    params: { slug },
    tags: ["ravintola", `ravintola:${slug}`],
    fallback: null,
  });
  if (!r) return null;
  // Kävijäarvostelut aina julkaistuina, myös esikatselussa: luonnos on
  // hyväksymätön arvostelu (moderointi, ravintolaKayttajaArvostelu.ts).
  const id = r._id.replace(/^drafts\./, "");
  const [userReviews, klubiArviot] = await Promise.all([
    sanityFetch<RavintolaUserReview[]>({
      query: ravintolaArvostelutQuery,
      params: { id },
      tags: ["ravintola", `ravintola:${slug}`],
      fallback: [],
      vainJulkaistu: true,
    }),
    sanityFetch<KlubilaisenArvio[] | null>({
      query: ravintolaKlubiArviotQuery,
      params: { id },
      tags: ["ravintola", `ravintola:${slug}`],
      fallback: [],
      vainJulkaistu: true,
    }),
  ]);
  return { ...r, userReviews, klubiArviot: klubiArviot ?? [] };
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
    sisalto: r.review,
    modifiedAt: r._updatedAt,
  });
}

export default async function RavintolaPage({ params }: PageProps) {
  const { slug } = await params;
  const r = await getRavintola(slug);
  if (!r) notFound();

  const trail = [
    rootCrumb,
    { label: "Ravintola-arviot", href: "/ravintolat" },
    { label: r.name },
  ];

  const rating = overallRating(r);
  const parts = subRatings(r);
  const isClosed = r.closed === true;
  const [hero, ...moreImages] = (r.images ?? []).filter(
    (image): image is NonNullable<typeof image> => Boolean(image?.asset),
  );
  const heroUrl = hero ? urlForImage(hero)?.width(1200).height(630).url() : null;

  // Tyyliopas: kaksi kuvaa rinnakkain tekstin lomassa, loput galleriana.
  const pairImages = moreImages.slice(0, 2);
  const galleryImages: AlbumImage[] = moreImages.slice(2).map((image) => ({
    asset: image.asset,
    alt: image.alt,
    caption: image.caption,
  }));

  // Klubin käynnit: Studioon kirjatut ja klubilaisten arvostelujen
  // käyntipäivät, kukin päivä kerran, uusin ensin. Järjestys lasketaan itse,
  // jotta ensimmäinen ja viimeisin käynti eivät riipu kirjausjärjestyksestä.
  const visits = [
    ...new Set(
      [...(r.visits ?? []), ...(r.arvostelujenKaynnit ?? []).map((p) => paivaksi(p))].filter(
        (p): p is string => Boolean(p),
      ),
    ),
  ]
    .sort()
    .reverse();
  const firstVisit = visits.at(-1) ?? r.visitedAt ?? null;
  const lastVisit = visits[0] ?? r.visitedAt ?? null;
  const hasReview = Boolean(r.review && r.review.length > 0);

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
            // Arvosanan takana olevat klubilaiset, muuten julkaistut arvostelut.
            reviewCount: r.automaattinenArvosana?.arvioijia ?? r.userReviews.length,
            closed: isClosed,
          }),
        ]}
      />

      {/* Otsikkoalue (tyyliopas Sivut v3, 2a/2b) */}
      <Container size="wide" className="pt-5 sm:pt-12">
        <Link
          href="/ravintolat"
          className="group/linkki text-sm font-medium text-accent no-underline sm:hidden"
        >
          <Nuoli suunta="vasen" /> Ravintola-arviot
        </Link>
        <Breadcrumbs items={trail.slice(1)} className="hidden sm:block" />

        <header className="flex max-w-[1000px] flex-col gap-3.5 pb-6 pt-3.5 sm:gap-[18px] sm:pb-12 sm:pt-7">
          <Eyebrow topic="food">
            Ravintola-arvio{r.city?.name ? ` · ${r.city.name}` : ""}
          </Eyebrow>
          <h1 className="text-pretty text-[2rem] leading-[1.12] sm:text-5xl lg:text-[3.75rem] lg:leading-[1.05]">
            {r.name}
          </h1>
          {(r.tuomio || lastVisit) && (
            <p className="text-sm text-muted sm:text-[15px]">
              {r.tuomio && <span className="text-foreground">{r.tuomio}</span>}
              {r.tuomio && lastVisit && " · "}
              {lastVisit && (
                <>
                  {firstVisit && firstVisit !== lastVisit ? (
                    <>
                      Klubi vieraili ensimmäisen kerran{" "}
                      <time dateTime={firstVisit}>{formatDate(firstVisit)}</time>, viimeksi{" "}
                      <time dateTime={lastVisit}>{formatDate(lastVisit)}</time>
                    </>
                  ) : (
                    <>
                      Klubi vieraili <time dateTime={lastVisit}>{formatDate(lastVisit)}</time>
                    </>
                  )}
                  {visits.length > 1 && ` (${visits.length} käyntiä)`}
                </>
              )}
            </p>
          )}
        </header>

        {isClosed && (
          <p
            role="note"
            className="mb-8 max-w-[1000px] rounded-sm border-t-[3px] border-t-warning bg-warning-soft p-5 text-[15px] leading-relaxed text-foreground"
          >
            <strong className="font-semibold">Tämä ravintola ei ole enää toiminnassa.</strong>{" "}
            {r.closedNote ??
              "Arvostelu on säilytetty klubin historian vuoksi, mutta tiedot eivät ole ajan tasalla."}
          </p>
        )}
      </Container>

      {hero && (
        <Container size="wide" className="max-sm:px-0">
          {/* Kuva kokonaan: 21:9-rajaus leikkasi ihmisiä pois vanhoista kuvista. */}
          <KuvaSiirtyma nimi={`ravintola-${r.slug}`}>
            <FramedImage
              image={hero}
              width={1920}
              sizes="(min-width: 1440px) 1280px, 100vw"
              className="aspect-[4/3] w-full sm:aspect-[2/1] sm:rounded-sm"
              priority
            />
          </KuvaSiirtyma>
        </Container>
      )}

      <Container
        size="wide"
        className="grid items-start gap-5 pt-5 sm:gap-12 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-[88px]"
      >
        {/* Mobiilissa arvosanakortti ennen tekstiä, tietokoneella oikealla. */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:order-2">
          <ScoreCard restaurant={r} rating={rating} parts={parts} />
          <VisitsAndInvite restaurant={r} visits={visits} sijainti="sivupalkki" className="max-lg:hidden" />
        </aside>

        <article className="flex min-w-0 max-w-[700px] flex-col gap-6 text-[17px] leading-[1.7] sm:gap-[26px] sm:text-[19px] sm:leading-[1.75] lg:order-1">
          {hasReview ? (
            // Ensimmäinen kappale ingressinä samalla säännöllä kuin uutisissa
            // (lib/artikkeli.ts): metatietorivi kuten "Perustettu 2017" ei ole
            // ingressi. Lainaukset nostoina messinkiviivalla (tyyliopas).
            <div className="[&>*:first-child]:!mt-0 [&_blockquote]:!my-8 [&_blockquote]:!border-l-[3px] [&_blockquote]:!border-brass [&_blockquote]:!bg-transparent [&_blockquote]:!py-0 [&_blockquote]:!pl-[18px] [&_blockquote]:font-display [&_blockquote]:!text-[22px] [&_blockquote]:!leading-[1.4] [&_blockquote]:text-heading sm:[&_blockquote]:!pl-7 sm:[&_blockquote]:!text-[28px] [&_p:not([data-ingressi])]:!text-[17px] [&_p:not([data-ingressi])]:!leading-[1.7] sm:[&_p:not([data-ingressi])]:!text-[19px] sm:[&_p:not([data-ingressi])]:!leading-[1.75]">
              <PortableText value={r.review!} ingressi={ensimmainenKappaleIngressiksi(r.review)} />
            </div>
          ) : (
            r.tiivistelma && (
              <p className="font-display text-xl leading-[1.5] text-heading sm:text-2xl sm:leading-[1.55]">
                {r.tiivistelma}
              </p>
            )
          )}

          {pairImages.length > 0 && (
            <div className="my-3 grid grid-cols-2 gap-4">
              {pairImages.map((image, i) => (
                <FramedImage
                  key={image?._key ?? i}
                  image={image}
                  width={680}
                  sizes="(min-width: 1024px) 340px, 50vw"
                  className="aspect-square w-full rounded-sm"
                />
              ))}
            </div>
          )}

          {Boolean(r.pros?.length || r.cons?.length) && (
            <ProsConsSection pros={r.pros} cons={r.cons} />
          )}

          {r.ottelupaivana && (
            <aside className="flex flex-col gap-2 rounded-sm border-t-[3px] border-t-blue bg-surface p-[18px] sm:gap-2.5 sm:p-7">
              <Eyebrow className="!text-xs sm:!text-[13px]">Ottelupäivänä</Eyebrow>
              <p className="whitespace-pre-line text-[15px] leading-[1.6] text-foreground sm:text-[17px]">
                {r.ottelupaivana}
              </p>
            </aside>
          )}

          {galleryImages.length > 0 && (
            <section aria-labelledby="kuvat-otsikko" className="mt-4">
              <h2 id="kuvat-otsikko" className="text-2xl">
                Kuvia käynneiltä
              </h2>
              <div className="mt-5">
                <AlbumGrid images={galleryImages} />
              </div>
            </section>
          )}

          <KlubilaistenArvosanat arviot={voimassaOlevat(r.klubiArviot)} />

          {r.userReviews.length > 0 && (
            <section aria-labelledby="kavijat-otsikko" className="mt-4">
              <h2 id="kavijat-otsikko" className="text-2xl">
                Kävijöiden arviot
              </h2>
              <ul className="mt-5 flex flex-col gap-4">
                {r.userReviews.map((review) => (
                  <li key={review._id} className="rounded-sm bg-surface p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-semibold text-foreground">
                          {review.reviewerName ?? "Nimetön"}
                          {review.klubilainen && (
                            <span className="rounded-xs bg-blue-tint px-2 py-0.5 text-xs font-semibold text-navy">
                              Klubilainen
                            </span>
                          )}
                        </p>
                        {review.submittedAt && (
                          <p className="text-sm text-muted-soft">{formatDate(review.submittedAt)}</p>
                        )}
                      </div>
                      {typeof review.rating === "number" && (
                        <span className="inline-flex items-center gap-2.5">
                          <RatingDots value={review.rating} />
                          <span aria-hidden className="font-display text-lg font-semibold tabular-nums text-brass-text">
                            {formatRating(review.rating)}
                          </span>
                        </span>
                      )}
                    </div>
                    {subRatings(review).length > 0 && (
                      <p className="mt-2 text-sm text-muted">
                        {subRatings(review)
                          .map((part) => `${part.label} ${formatRating(part.value)}`)
                          .join(" · ")}
                      </p>
                    )}
                    {review.comment && (
                      <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-foreground">
                        {review.comment}
                      </p>
                    )}
                    {review.kuvat && review.kuvat.length > 0 && (
                      <ReviewPhotos images={review.kuvat} reviewerName={review.reviewerName ?? "Nimetön"} />
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Mobiilissa käynnit tekstin jälkeen, tietokoneella sivupalkissa. */}
          <VisitsAndInvite restaurant={r} visits={visits} sijainti="teksti" className="mt-4 lg:hidden" />
        </article>
      </Container>

      {r.related.length > 0 && (
        <section aria-labelledby="muut-otsikko" className="mt-16 bg-surface py-11 sm:mt-24 sm:py-20">
          <Container size="wide" className="flex flex-col gap-6 sm:gap-8">
            <h2 id="muut-otsikko" className="text-[1.75rem] sm:text-[2rem]">
              Lisää arvioita{r.city?.name ? ` — ${r.city.name}` : ""}
            </h2>
            <ul className="grid gap-7 sm:grid-cols-3">
              {r.related.map((item) => {
                const itemRating = overallRating(item);
                return (
                  <li key={item._id}>
                    <Link href={`/ravintolat/${item.slug}`} className="group flex flex-col gap-3 no-underline">
                      {item.image?.asset ? (
                        <FramedImage
                          image={item.image}
                          width={600}
                          sizes="(min-width: 640px) 30vw, 100vw"
                          className="aspect-[3/2] w-full rounded-sm"
                        />
                      ) : (
                        <span aria-hidden className="aspect-[3/2] w-full rounded-sm bg-brass-tint" />
                      )}
                      {itemRating !== null && <RatingDots value={itemRating} size="sm" />}
                      <span className="font-display text-[1.375rem] font-semibold text-heading group-hover:text-accent">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Container>
        </section>
      )}
      {/* "Lisää arvioita" liittyy suoraan footeriin (tyyliopas). */}
      {r.related.length > 0 && <span data-flush-footer hidden />}
    </>
  );
}

const arvosana = (x: number | null | undefined) => (typeof x === "number" ? formatRating(x) : "–");

/**
 * Klubilaisten arvosanat taulukkona (kunkin klubilaisen voimassa oleva eli
 * uusin arvosana). Ravintolan arvosana on näiden keskiarvo.
 */
function KlubilaistenArvosanat({ arviot }: { arviot: VoimassaOlevaArvio[] }) {
  if (arviot.length === 0) return null;
  return (
    <section aria-labelledby="klubilaiset-otsikko" className="mt-4">
      <h2 id="klubilaiset-otsikko" className="text-2xl">
        Klubilaisten arvosanat
      </h2>
      <div className="mt-5 overflow-x-auto rounded-sm bg-surface">
        <table className="w-full min-w-[420px] border-collapse text-[15px]">
          <caption className="sr-only">
            Klubilaisten arvosanat: ruoka, hinta, viihtyvyys ja niiden keskiarvo asteikolla 1–5
          </caption>
          <thead>
            <tr className="border-b border-border text-left text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-soft">
              <th scope="col" className="px-4 py-3 sm:px-6">Klubilainen</th>
              <th scope="col" className="px-2 py-3 text-right">Ruoka</th>
              <th scope="col" className="px-2 py-3 text-right">Hinta</th>
              <th scope="col" className="px-2 py-3 text-right">Viihtyvyys</th>
              <th scope="col" className="px-4 py-3 text-right sm:px-6">Keskiarvo</th>
            </tr>
          </thead>
          <tbody>
            {arviot.map((a) => (
              <tr key={a.arvioija} className="border-b border-border last:border-b-0">
                <th scope="row" className="px-4 py-3 text-left font-semibold text-foreground sm:px-6">
                  {a.nimi ?? "Klubilainen"}
                  {a.pvm && (
                    <span className="block text-[13px] font-normal text-muted-soft">{formatDate(a.pvm)}</span>
                  )}
                </th>
                <td className="px-2 py-3 text-right tabular-nums">{arvosana(a.ratingFood)}</td>
                <td className="px-2 py-3 text-right tabular-nums">{arvosana(a.ratingPrice)}</td>
                <td className="px-2 py-3 text-right tabular-nums">{arvosana(a.ratingAtmosphere)}</td>
                <td className="px-4 py-3 text-right font-display text-lg font-semibold tabular-nums text-brass-text sm:px-6">
                  {arvosana(a.kokonais)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/**
 * Arvosanakortti (tyyliopas): 4 px messinkinen yläreuna, varjo. Kokonaisarvosana
 * isona, ala-arvosanat pisteinä (Ruoka / Hinta / Viihtyvyys), yhteystiedot,
 * stadionhuomio ja ravintolan verkkosivut.
 */
function ScoreCard({
  restaurant: r,
  rating,
  parts,
}: {
  restaurant: RavintolaDetail;
  rating: number | null;
  parts: ReturnType<typeof subRatings>;
}) {
  const address = [r.address, [r.postalCode, r.city?.name].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  const tags = r.stadionHuomio ? [{ label: r.stadionHuomio, food: false }] : [];

  return (
    <div className="flex flex-col gap-5 rounded-sm border-t-[3px] border-t-brass bg-surface p-5 sm:gap-6 sm:rounded-2xl sm:border-t-4 sm:p-8 sm:shadow-panel">
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-muted-soft">Arvosana</span>
        {rating !== null ? (
          <p className="flex items-baseline gap-2.5">
            <span className="font-display text-[2.75rem] font-semibold leading-none text-heading tabular-nums sm:text-[3.5rem]">
              {formatRating(rating)}
            </span>
            <span className="text-lg text-muted-soft">/ 5</span>
          </p>
        ) : (
          <p className="text-[15px] text-muted">Ei numeerista arviota.</p>
        )}
        {r.automaattinenArvosana && rating !== null && (
          <p className="text-sm text-muted-soft">
            Keskiarvo {r.automaattinenArvosana.arvioijia} klubilaisen arvosanasta
          </p>
        )}
      </div>

      {parts.length > 0 && (
        <dl className="flex flex-col gap-3 text-[15px]">
          {parts.map((part) => (
            <div key={part.key} className="grid grid-cols-[1fr_auto] items-center gap-3">
              <dt>{part.label}</dt>
              <dd>
                <RatingDots value={part.value} label={`${part.label} ${formatRating(part.value)} / 5`} />
              </dd>
            </div>
          ))}
        </dl>
      )}

      {(address || r.priceLevel || r.phone || tags.length > 0) && (
        <dl className="flex flex-col gap-3.5 border-t border-border pt-5 text-[15px] sm:pt-[22px]">
          {address && <Fact label="Osoite">{address}</Fact>}
          {r.priceLevel && <Fact label="Hintataso">{r.priceLevel}</Fact>}
          {r.phone && (
            <Fact label="Puhelin">
              <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2">
                {r.phone}
              </a>
            </Fact>
          )}
          {tags.length > 0 && (
            <Fact label="Sopii">
              <span className="mt-1 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t.label}
                    className={
                      t.food
                        ? "rounded-xs bg-brass-tint px-[9px] py-1 text-[13px] font-semibold text-brass-tint-text"
                        : "rounded-xs bg-blue-tint px-[9px] py-1 text-[13px] font-semibold text-navy"
                    }
                  >
                    {t.label}
                  </span>
                ))}
              </span>
            </Fact>
          )}
        </dl>
      )}

      {r.website && (
        <LinkButton href={r.website} external variant="outline" size="lg">
          Ravintolan verkkosivut <span aria-hidden>↗</span>
        </LinkButton>
      )}
    </div>
  );
}

/**
 * Käynnit ja arviokutsu. Renderöidään kahdesti (sivupalkki tietokoneella,
 * tekstin jälkeen mobiilissa; toinen piilotetaan CSS:llä), joten `sijainti`
 * tekee otsikon id:stä yksilöllisen.
 */
function VisitsAndInvite({
  restaurant: r,
  visits,
  sijainti,
  className,
}: {
  restaurant: RavintolaDetail;
  visits: string[];
  sijainti: "sivupalkki" | "teksti";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {(visits.length > 0 || r.visitedAt || r.visitContext) && (
        <VisitSection
          otsikkoId={`kaynnit-otsikko-${sijainti}`}
          visits={visits}
          visitedAt={r.visitedAt}
          visitContext={r.visitContext}
        />
      )}
      <p className="text-[15px] text-muted">
        Kävitkö täällä?{" "}
        <Link
          href={`/ravintolat/arvostele?ravintola=${r.slug}`}
          className="font-semibold text-accent underline underline-offset-4 hover:text-accent-hover"
        >
          Lähetä oma arviosi
        </Link>
      </p>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[13px] font-semibold uppercase tracking-[0.1em] text-muted-soft">{label}</dt>
      <dd>{children}</dd>
    </div>
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
      <h2 id="plussat-otsikko" className="font-display text-2xl sm:text-3xl">
        Plussat ja miinukset
      </h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {pros && pros.length > 0 && (
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-soft">
              Plussat
            </h3>
            <ul className="mt-3 space-y-2">
              {pros.map((item, i) => (
                <li key={`${item}-${i}`} className="flex gap-2 text-foreground">
                  <span aria-hidden className="text-navy">
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
            <h3 className="font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-soft">
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

function VisitSection({
  otsikkoId,
  visits,
  visitedAt,
  visitContext,
}: {
  otsikkoId: string;
  visits: string[];
  visitedAt?: string | null;
  visitContext?: string | null;
}) {
  const dates = visits.length > 0 ? visits : visitedAt ? [visitedAt] : [];

  return (
    <section aria-labelledby={otsikkoId}>
      <h2
        id={otsikkoId}
        className="font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-soft"
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

