import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import {
  Card,
  CardArrow,
  CardBody,
  CardEyebrow,
  CardTitle,
} from "@/components/ui/card";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import { haeOsioSivu } from "@/sanity/lib/osiosivu";
import {
  arkistoSummaryQuery,
  arkistoTags,
  type TilastoSummary,
} from "@/sanity/lib/queries/arkisto";

import { ArkistoPage } from "../_tilastot/arkisto-page";
import {
  arkistoTrail,
  countByCategory,
  tableCountLabel,
} from "../_tilastot/helpers";
import { ArkistoEmpty } from "../_tilastot/stat-sections";
import { eurocupCompetitions } from "./competitions";

export const revalidate = 3600;

const path = "/jalkapalloarkisto/eurocupit";
/** Otsikko, johdanto ja hakukoneteksti: Studion Osioiden sivut (lib/osiosivut.ts). */
const OSIO = "jalkapalloarkisto/eurocupit" as const;

export async function generateMetadata(): Promise<Metadata> {
  const s = await haeOsioSivu(OSIO);
  return buildMetadata({ title: s.seoTitle, description: s.description, path });
}

export default async function EurocupitPage() {
  const { title, lead, description } = await haeOsioSivu(OSIO);
  const summary = await sanityFetch<TilastoSummary[]>({
    query: arkistoSummaryQuery,
    tags: arkistoTags,
    fallback: [],
  });

  const counts = countByCategory(summary);
  const total = eurocupCompetitions.reduce(
    (sum, competition) => sum + (counts[competition.category] ?? 0),
    0,
  );
  const trail = arkistoTrail({ label: title });

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({
            title,
            description,
            path,
            itemCount: eurocupCompetitions.length,
          }),
        ]}
      />

      <ArkistoPage title={title} lead={lead} breadcrumbs={trail}>
        <h2 className="sr-only">Kilpailut</h2>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {eurocupCompetitions.map((competition) => {
            const count = counts[competition.category] ?? 0;
            return (
              <li key={competition.slug} className="flex">
                <Card
                  href={`${path}/${competition.slug}`}
                  className="flex w-full flex-col"
                >
                  <CardEyebrow>Seurajoukkueet</CardEyebrow>
                  <CardTitle className="mt-2">{competition.title}</CardTitle>
                  <CardBody className="mt-2">{competition.lead}</CardBody>
                  {count > 0 && (
                    <p className="mt-3 text-sm text-muted">
                      {tableCountLabel(count)}
                    </p>
                  )}
                  <CardArrow label="Avaa kilpailu" />
                </Card>
              </li>
            );
          })}
        </ul>

        {total === 0 && (
          <div className="mt-12">
            <ArkistoEmpty
              title="Ei vielä eurocup-tilastoja"
              message="Tilastoja ei ole vielä lisätty. Kilpailujen taulukot julkaistaan tällä sivulla myöhemmin."
            />
          </div>
        )}
      </ArkistoPage>
    </>
  );
}
