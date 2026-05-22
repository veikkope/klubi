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
import { ancestorSlugs, joinSlug, toHref } from "@/lib/path";
import type { SivuWithAncestors } from "@/lib/types";

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
  return {
    title: sivu.seo?.metaTitle || sivu.title,
    description: sivu.seo?.metaDescription || sivu.ingress || undefined,
  };
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

  return (
    <article>
      {hasHero ? (
        <section className="relative isolate overflow-hidden bg-brand-950 text-white">
          <div className="absolute inset-0 -z-10">
            <SanityImage
              image={sivu.hero!}
              width={2000}
              height={900}
              sizes="100vw"
              className="h-full w-full object-cover opacity-50"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-brand-950/60 to-brand-950" />
          </div>
          <Container className="py-20 sm:py-28">
            <Breadcrumbs className="text-brand-100" items={crumbs} />
            <h1 className="mt-6 font-serif text-4xl leading-tight sm:text-6xl">
              {sivu.title}
            </h1>
            {sivu.ingress && (
              <p className="mt-4 max-w-2xl text-lg text-brand-100">
                {sivu.ingress}
              </p>
            )}
          </Container>
        </section>
      ) : (
        <Container className="pt-12">
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">
            {sivu.title}
          </h1>
          {sivu.ingress && (
            <p className="mt-4 max-w-2xl text-lg text-muted">{sivu.ingress}</p>
          )}
        </Container>
      )}

      <Container size="narrow" className="py-16">
        <PortableText value={sivu.body} />
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
