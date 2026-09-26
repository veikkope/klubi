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

const path = "/jalkapalloarkisto/mestarit";
const title = "Suomen mestarit";
const description =
  "Suomen jalkapallon mestaruuden voittaneet seurat vuosi vuodelta — mestaruussarjan ja Veikkausliigan voittajat yhdessä taulukossa.";
const lead =
  "Suomen mestaruudesta on pelattu vuodesta 1908. Taulukot kokoavat " +
  "mestaruuden voittaneet seurat vuosittain sekä seurojen kokonaismäärät.";

export function generateMetadata(): Metadata {
  return buildMetadata({ title, description, path });
}

export default async function MestaritPage() {
  const tilastot = await sanityFetch<TilastoDoc[]>({
    query: tilastotByCategoryQuery,
    params: { category: "champions" },
    tags: arkistoTags,
    fallback: [],
  });

  const trail = arkistoTrail({ label: title });

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
          emptyTitle="Ei vielä mestaruustilastoja"
        />
      </ArkistoPage>
    </>
  );
}
