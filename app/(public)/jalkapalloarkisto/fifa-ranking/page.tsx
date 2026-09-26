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

const path = "/jalkapalloarkisto/fifa-ranking";
const title = "FIFA-ranking";
const description =
  "Suomen sijoitus FIFA:n maailmanlistalla vuosittain sekä listan kärkimaat. Ranking päivittyy FIFA:n julkaisujen mukaan.";
const lead =
  "FIFA on julkaissut maailmanlistaa vuodesta 1992. Taulukot seuraavat " +
  "Suomen sijoitusta ja listan kärkimaita julkaisukierroksittain.";

export function generateMetadata(): Metadata {
  return buildMetadata({ title, description, path });
}

export default async function FifaRankingPage() {
  const tilastot = await sanityFetch<TilastoDoc[]>({
    query: tilastotByCategoryQuery,
    params: { category: "fifa-ranking" },
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
          emptyTitle="Ei vielä ranking-tilastoja"
        />
      </ArkistoPage>
    </>
  );
}
