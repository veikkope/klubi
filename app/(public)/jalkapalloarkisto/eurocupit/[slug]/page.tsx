import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  arkistoTags,
  tilastotByCategoryQuery,
  type TilastoDoc,
} from "@/sanity/lib/queries/arkisto";

import { ArkistoPage } from "../../_tilastot/arkisto-page";
import { arkistoTrail, datasetSchemas } from "../../_tilastot/helpers";
import { StatSections } from "../../_tilastot/stat-sections";
import { eurocupCompetitions, findEurocup } from "../competitions";

export const revalidate = 3600;

const basePath = "/jalkapalloarkisto/eurocupit";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return eurocupCompetitions.map((competition) => ({
    slug: competition.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const competition = findEurocup(slug);

  if (!competition) {
    return buildMetadata({
      title: "Kilpailua ei löytynyt",
      description:
        "Pyydettyä eurocup-kilpailua ei löytynyt jalkapalloarkistosta. Katso kaikki kilpailut eurocupit-sivulta.",
      path: `${basePath}/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: competition.title,
    description: competition.description,
    path: `${basePath}/${competition.slug}`,
  });
}

export default async function EurocupPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const competition = findEurocup(slug);

  if (!competition) notFound();

  const path = `${basePath}/${competition.slug}`;
  const tilastot = await sanityFetch<TilastoDoc[]>({
    query: tilastotByCategoryQuery,
    params: { category: competition.category },
    tags: arkistoTags,
    fallback: [],
  });

  const trail = arkistoTrail(
    { label: "Eurocupit", href: basePath },
    { label: competition.shortTitle },
  );

  const siblings = eurocupCompetitions.filter(
    (item) => item.slug !== competition.slug,
  );

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          ...datasetSchemas({
            tilastot,
            path,
            title: competition.title,
            description: competition.description,
          }),
        ]}
      />

      <ArkistoPage
        title={competition.title}
        lead={competition.lead}
        eyebrow="Eurocupit"
        breadcrumbs={trail}
      >
        <StatSections
          tilastot={tilastot}
          emptyTitle={`Ei vielä tilastoja: ${competition.shortTitle}`}
        />

        <nav aria-labelledby="muut-kilpailut" className="mt-16">
          <h2
            id="muut-kilpailut"
            className="font-display text-2xl leading-tight text-foreground sm:text-3xl"
          >
            Muut eurocupit
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {siblings.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`${basePath}/${item.slug}`}
                  className="inline-flex min-h-11 items-center rounded-sm border border-border bg-surface px-4 text-sm text-muted transition hover:border-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {item.shortTitle}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </ArkistoPage>
    </>
  );
}
