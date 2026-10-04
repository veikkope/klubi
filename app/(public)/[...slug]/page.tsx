import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Breadcrumbs, type Crumb } from "@/components/layout/breadcrumbs";
import { SanityImage } from "@/components/sanity-image";
import { PortableText } from "@/components/portable-text";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  allSivuSlugsQuery,
  sivuWithAncestorsQuery,
} from "@/sanity/lib/queries";
import { hasSanity } from "@/sanity/env";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema-org";
import { buildMetadata, resolveDescription } from "@/lib/seo";
import { ancestorSlugs, joinSlug, toHref } from "@/lib/path";
import type { SivuWithAncestors } from "@/lib/types";

export const revalidate = 3600;

type Params = { slug: string[] };

export async function generateStaticParams(): Promise<Params[]> {
  if (!hasSanity) return [];
  const slugs = await sanityFetch<string[]>({
    query: allSivuSlugsQuery,
    tags: ["sivu"],
    fallback: [],
  });
  return slugs.map((slug) => ({ slug: slug.split("/") }));
}

async function getSivu(segments: string[]) {
  const slug = joinSlug(segments);
  return sanityFetch<SivuWithAncestors>({
    query: sivuWithAncestorsQuery,
    params: { slug, ancestors: ancestorSlugs(segments) },
    tags: ["sivu", `sivu:${slug}`],
    fallback: { sivu: null, ancestors: [] },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { sivu } = await getSivu(slug);
  if (!sivu) return {};
  return buildMetadata({
    title: sivu.seoTitle || sivu.title,
    description: resolveDescription(
      sivu.seoDescription,
      sivu.tiivistelma,
      sivu.ingress,
    ),
    path: toHref(sivu.slug),
    image: sivu.hero,
    sisalto: sivu.body,
    modifiedAt: sivu.updatedAt,
  });
}

export default async function SivuPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const { sivu, ancestors } = await getSivu(slug);
  if (!sivu) notFound();

  const crumbs: Crumb[] = [
    { label: "Etusivu", href: "/" },
    ...ancestorCrumbs(slug, ancestors),
    { label: sivu.title },
  ];

  const hasHero = Boolean(sivu.hero?.asset);
  const lead = sivu.tiivistelma || sivu.ingress;
  // WCAG 3.1.2: vieraskielinen sisältö merkitään, sivupohja (murupolku) on suomea.
  const kieli = sivu.kieli && sivu.kieli !== "fi" ? sivu.kieli : undefined;

  return (
    <article>
      <JsonLd
        schema={[
          breadcrumbSchema(crumbs),
          webPageSchema({
            title: sivu.title,
            description: lead,
            path: toHref(sivu.slug),
            modifiedAt: sivu.updatedAt,
          }),
        ]}
      />
      {hasHero ? (
        <section className="relative isolate overflow-hidden bg-navy text-white">
          <div className="absolute inset-0 -z-10">
            <SanityImage
              image={sivu.hero!}
              width={2000}
              height={900}
              sizes="100vw"
              className="h-full w-full object-cover opacity-50"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-navy/60 to-navy" />
          </div>
          <Container className="py-20 sm:py-28">
            <Breadcrumbs tone="dark" items={crumbs} />
            <h1 lang={kieli} className="mt-6 font-display text-4xl leading-[1.1] text-on-chrome sm:text-5xl">
              {sivu.title}
            </h1>
            {lead && (
              <p lang={kieli} className="mt-4 max-w-2xl text-lg text-on-chrome-muted">
                {lead}
              </p>
            )}
          </Container>
        </section>
      ) : (
        <Container className="pt-12">
          <Breadcrumbs items={crumbs} />
          <h1 lang={kieli} className="mt-6 font-display text-4xl leading-tight sm:text-5xl">
            {sivu.title}
          </h1>
          {lead && (
            <p lang={kieli} className="mt-4 max-w-2xl text-lg text-muted">
              {lead}
            </p>
          )}
        </Container>
      )}

      <Container size="narrow" className="py-16">
        <div lang={kieli}>
          <PortableText value={sivu.body} ylinOtsikko={2} />
        </div>
      </Container>
    </article>
  );
}

/**
 * Rakentaa murupolun esi-isäsivuista. Jos ancestor-dokumenttia ei löydy
 * (esim. hub-sivua ei ole vielä luotu Sanityyn), näytetään segmentti
 * ihmislukuisempana tekstinä mutta ilman linkkiä — vältetään "kuolleita"
 * linkkejä 404-sivuille.
 */
function ancestorCrumbs(
  segments: string[],
  ancestors: { title: string; slug: string }[],
): Crumb[] {
  const titleBySlug = new Map(ancestors.map((a) => [a.slug, a.title]));
  const crumbs: Crumb[] = [];
  for (let i = 1; i < segments.length; i++) {
    const slug = segments.slice(0, i).join("/");
    const title = titleBySlug.get(slug);
    crumbs.push(
      title
        ? { label: title, href: toHref(slug) }
        : { label: humanize(segments[i - 1]) },
    );
  }
  return crumbs;
}

function humanize(segment: string): string {
  return segment
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}
