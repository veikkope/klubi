import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { rootCrumb } from "@/lib/nav-sections";
import { LITMANEN_PATH, LITMANEN_SLUG } from "@/lib/path";
import { buildMetadata, resolveDescription } from "@/lib/seo";
import { hasSanity } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  pelaajaBySlugQuery,
  pelaajaSlugsQuery,
  pelaajatRelatedQuery,
  withSlug,
  type PelaajaCard,
  type PelaajaFull,
} from "@/sanity/lib/queries/arkisto-laajennus";

import { PelaajaProfiili } from "../../_pelaaja/pelaaja-profiili";

export const revalidate = 3600;

type Params = { slug: string };

/**
 * Yleinen pelaajasivu. Jari Litmasella on oma osionsa (`/jalkapalloarkisto/litmanen`),
 * joten hänen vanha osoitteensa ohjautuu sinne.
 */
function pathFor(slug: string): string {
  return slug === LITMANEN_SLUG ? LITMANEN_PATH : `/jalkapalloarkisto/pelaajat/${slug}`;
}

export async function generateStaticParams(): Promise<Params[]> {
  if (!hasSanity) return [];
  const slugs = await sanityFetch<string[]>({
    query: pelaajaSlugsQuery,
    tags: ["pelaaja"],
    fallback: [],
  });
  return slugs
    .filter((slug) => slug && slug !== LITMANEN_SLUG)
    .map((slug) => ({ slug }));
}

async function getPelaaja(slug: string) {
  return sanityFetch<PelaajaFull | null>({
    query: pelaajaBySlugQuery,
    params: { slug },
    tags: ["pelaaja", `pelaaja:${slug}`],
    fallback: null,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pelaaja = slug === LITMANEN_SLUG ? null : await getPelaaja(slug);

  if (!pelaaja) {
    return buildMetadata({
      title: "Sivua ei löytynyt",
      path: pathFor(slug),
      noIndex: true,
    });
  }

  return buildMetadata({
    title: pelaaja.seoTitle || pelaaja.name,
    description: resolveDescription(
      pelaaja.seoDescription,
      pelaaja.tiivistelma,
    ),
    path: pathFor(slug),
    image: pelaaja.kuvat?.[0],
    modifiedAt: pelaaja._updatedAt,
  });
}

export default async function PelaajaPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (slug === LITMANEN_SLUG) permanentRedirect(LITMANEN_PATH);

  const pelaaja = await getPelaaja(slug);
  if (!pelaaja) notFound();

  const related = withSlug(
    await sanityFetch<PelaajaCard[]>({
      query: pelaajatRelatedQuery,
      params: { slug },
      tags: ["pelaaja"],
      fallback: [],
    }),
  );

  return (
    <PelaajaProfiili
      pelaaja={pelaaja}
      path={pathFor(slug)}
      trail={[
        rootCrumb,
        { label: "Jalkapalloarkisto", href: "/jalkapalloarkisto" },
        { label: pelaaja.name },
      ]}
      related={related}
      relatedHref={pathFor}
    />
  );
}
