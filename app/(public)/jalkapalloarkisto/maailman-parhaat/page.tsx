import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  arkistoTags,
  tilastotByCategoryQuery,
  type TilastoDoc,
} from "@/sanity/lib/queries/arkisto";

import { ArkistoPage } from "../_tilastot/arkisto-page";
import { arkistoTrail, datasetSchemas } from "../_tilastot/helpers";
import { StatSections } from "../_tilastot/stat-sections";

export const revalidate = 3600;

const path = "/jalkapalloarkisto/maailman-parhaat";
const title = "Maailman paras avaus";
const description =
  "Maailman paras avauskokoonpano vuosittain: jokaisen vuoden yksitoista pelaajaa pelipaikkoineen ja maineen sekä kenttäkaaviot.";
const lead =
  "Klubin valitsema maailman paras avauskokoonpano vuosi vuodelta: " +
  "pelaajat pelipaikoittain taulukossa ja jokaisen vuoden kenttäkaavio.";

export function generateMetadata(): Metadata {
  return buildMetadata({ title, description, path });
}

export default async function MaailmanParhaatPage() {
  const tilastot = await sanityFetch<TilastoDoc[]>({
    query: tilastotByCategoryQuery,
    params: { category: "maailman-parhaat" },
    tags: arkistoTags,
    fallback: [],
  });

  const trail = arkistoTrail({ label: "Maailman parhaat" });

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          ...datasetSchemas({ tilastot, path, title, description }),
        ]}
      />

      <ArkistoPage title={title} lead={lead} breadcrumbs={trail}>
        <StatSections
          tilastot={tilastot}
          emptyTitle="Ei vielä maailman parhaita avauksia"
        />
      </ArkistoPage>
    </>
  );
}
