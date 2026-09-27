import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "./_components/empty-state";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionNav } from "@/components/layout/section-nav";
import { PortableText } from "@/components/portable-text";
import { SanityImage } from "@/components/sanity-image";
import { JsonLd } from "@/components/seo/json-ld";
import {
  Card,
  CardArrow,
  CardBody,
  CardEyebrow,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { klubiNav, rootCrumb } from "@/lib/nav-sections";
import {
  breadcrumbSchema,
  webPageSchema,
  type Crumb,
} from "@/lib/schema-org";
import { buildMetadata, resolveDescription } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  klubiSivuQuery,
  klubiToimintaListQuery,
  type KlubiSivu,
  type KlubiToimintaCard,
} from "@/sanity/lib/queries/klubi";

export const revalidate = 3600;

const PATH = "/klubi";
const SIVU_SLUG = "klubi";
/** Otsikko kun Studiossa ei vielä ole `sivu`-dokumenttia slugilla "klubi". */
const FALLBACK_TITLE = "Klubi";

/** Alasivut, joihin hub linkittää. Esittely on tämä sivu itse. */
const subpages = klubiNav.filter((item) => item.href !== PATH);
/** Jäsenhakemus nostetaan listasta esiin — se on sivun ainoa toimintakehote. */
const CTA_HREF = "/klubi/liity";

function getSivu() {
  return sanityFetch<KlubiSivu | null>({
    query: klubiSivuQuery,
    params: { slug: SIVU_SLUG },
    tags: ["sivu", `sivu:${SIVU_SLUG}`],
    fallback: null,
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const sivu = await getSivu();
  return buildMetadata({
    title: sivu?.seoTitle || sivu?.title || FALLBACK_TITLE,
    description: resolveDescription(
      sivu?.seoDescription,
      sivu?.tiivistelma,
      sivu?.ingress,
    ),
    path: PATH,
    image: sivu?.hero,
  });
}

export default async function KlubiPage() {
  const [sivu, toiminnat] = await Promise.all([
    getSivu(),
    sanityFetch<KlubiToimintaCard[]>({
      query: klubiToimintaListQuery,
      tags: ["klubiToiminta"],
      fallback: [],
    }),
  ]);

  const title = sivu?.title || FALLBACK_TITLE;
  const lead = sivu?.tiivistelma || sivu?.ingress || null;
  const trail: Crumb[] = [rootCrumb, { label: title }];
  const hasBody = Boolean(sivu?.body && sivu.body.length > 0);

  return (
    <>
      <JsonLd
        schema={[
          webPageSchema({
            title,
            description: lead,
            path: PATH,
            modifiedAt: sivu?._updatedAt,
          }),
          breadcrumbSchema(trail),
        ]}
      />

      <Container className="py-12 sm:py-16">
        <PageHeader title={title} lead={lead} breadcrumbs={trail} />
        <SectionNav items={klubiNav} label="Klubin osiot" className="mt-8" />

        {sivu?.hero?.asset && (
          <figure className="mt-10 overflow-hidden rounded-2xl">
            <SanityImage
              image={sivu.hero}
              width={1600}
              height={900}
              sizes="(min-width: 1024px) 960px, 100vw"
              className="h-auto w-full object-cover"
              priority
            />
            {sivu.hero.caption && (
              <figcaption className="mt-2 text-sm text-muted">
                {sivu.hero.caption}
              </figcaption>
            )}
          </figure>
        )}

        {hasBody ? (
          <div className="mt-10 max-w-3xl">
            <PortableText value={sivu?.body} />
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState description="Yhdistyksen esittely lisätään Sanity Studiossa sivulle, jonka polku on “klubi”." />
          </div>
        )}

        <section aria-labelledby="toimintamuodot" className="mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2
              id="toimintamuodot"
              className="font-display text-3xl leading-tight"
            >
              Toimintamuodot
            </h2>
            <Link
              href="/klubi/toiminta"
              className="inline-flex min-h-11 items-center text-sm font-medium text-accent hover:underline"
            >
              Kaikki toiminta
            </Link>
          </div>

          {toiminnat.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="Toimintamuotoja ei ole vielä lisätty"
                description="Sisältöä ei ole vielä lisätty Studiossa."
              />
            </div>
          ) : (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {toiminnat.slice(0, 6).map((toiminta) => (
                <li key={toiminta._id}>
                  <Card href={`/klubi/toiminta/${toiminta.slug}`}>
                    {toiminta.uusinVuosi && (
                      <CardEyebrow>
                        Viimeksi {toiminta.uusinVuosi}
                      </CardEyebrow>
                    )}
                    <CardTitle className="mt-2">{toiminta.title}</CardTitle>
                    {toiminta.tiivistelma && (
                      <CardBody className="mt-2 text-sm">
                        {toiminta.tiivistelma}
                      </CardBody>
                    )}
                    <CardArrow />
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="klubin-sivut" className="mt-16">
          <h2 id="klubin-sivut" className="font-display text-3xl leading-tight">
            Lisää klubista
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {subpages.map((item) => {
              const isCta = item.href === CTA_HREF;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex min-h-11 items-center justify-between gap-3 rounded-xl border px-5 py-3 transition",
                      isCta
                        ? "border-accent bg-accent-soft font-medium text-accent hover:border-accent-hover"
                        : "border-border bg-surface text-foreground hover:border-accent",
                    )}
                  >
                    <span>{item.label}</span>
                    <span aria-hidden className="text-accent">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </Container>
    </>
  );
}
