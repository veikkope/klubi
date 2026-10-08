import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { JsonLd } from "@/components/seo/json-ld";
import { Card, CardTitle } from "@/components/ui/card";
import { rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import { haeOsioSivu } from "@/sanity/lib/osiosivu";
import {
  uutisetArchiveYearsQuery,
  type ArchiveYearRow,
} from "@/sanity/lib/queries/uutiset";

import {
  countLabel,
  groupByDecade,
  toArchiveYears,
} from "../_lib/archive";

export const revalidate = 3600;

const PATH = "/uutiset/arkisto";

/** Otsikko, johdanto ja hakukoneteksti: Studion Osioiden sivut (lib/osiosivut.ts). */
const OSIO = "uutiset/arkisto" as const;

export async function generateMetadata(): Promise<Metadata> {
  const s = await haeOsioSivu(OSIO);
  return buildMetadata({
    title: s.seoTitle,
    description: s.description,
    path: PATH,
  });
}

const trail = [
  rootCrumb,
  { label: "Uutiset", href: "/uutiset" },
  { label: "Arkisto" },
];

export default async function UutisarkistoPage() {
  const [rows, s] = await Promise.all([
    sanityFetch<ArchiveYearRow[]>({
      query: uutisetArchiveYearsQuery,
      tags: ["uutinen"],
      fallback: [],
    }),
    haeOsioSivu(OSIO),
  ]);

  const years = toArchiveYears(rows);
  const decades = groupByDecade(years);
  const total = years.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({
            title: s.title,
            description: s.description,
            path: PATH,
            itemCount: total,
          }),
        ]}
      />

      <Container className="py-16">
        <PageHeader title={s.title} lead={s.lead} breadcrumbs={trail} />

        {decades.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
            <p className="font-display text-2xl">Arkisto on vielä tyhjä</p>
            <p className="mx-auto mt-2 max-w-md text-muted">
              Uutisia ei ole vielä julkaistu. Vuodet ilmestyvät tähän
              uutisten mukana.
            </p>
            <p className="mt-6">
              <Link href="/uutiset" className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2">
                Palaa uutisiin
              </Link>
            </p>
          </div>
        ) : (
          <>
            <p className="mt-10 text-sm text-muted">
              Yhteensä {countLabel(total)} {years.length} vuodelta.
            </p>

            {decades.map((decade) => (
              <section
                key={decade.decade}
                aria-labelledby={`vuosikymmen-${decade.decade}`}
                className="mt-12"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-3">
                  <h2
                    id={`vuosikymmen-${decade.decade}`}
                    className="font-display text-2xl sm:text-3xl"
                  >
                    {decade.label}
                  </h2>
                  <span className="text-sm text-muted">
                    {countLabel(decade.count)}
                  </span>
                </div>

                <ul className="mt-6 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-5">
                  {decade.years.map((entry) => (
                    <li key={entry.year} className="flex">
                      <Card
                        href={`/uutiset/arkisto/${entry.year}`}
                        className="w-full text-center"
                      >
                        <CardTitle className="text-2xl tabular-nums">
                          {entry.year}
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted">
                          {countLabel(entry.count)}
                        </p>
                      </Card>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}
      </Container>
    </>
  );
}
