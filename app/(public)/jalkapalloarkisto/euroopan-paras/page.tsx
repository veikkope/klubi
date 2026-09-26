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

const path = "/jalkapalloarkisto/euroopan-paras";
const title = "Euroopan paras pelaaja";
const description =
  "Ballon d'Or eli Euroopan parhaan jalkapalloilijan palkinto vuodesta 1956: voittajat, seurat ja maat vuosittain taulukkona.";
const lead =
  "Ranskalainen France Football on palkinnut Euroopan parhaan pelaajan " +
  "vuodesta 1956. Taulukko listaa voittajat vuosittain seuroineen ja maineen.";

export function generateMetadata(): Metadata {
  return buildMetadata({ title, description, path });
}

export default async function EuroopanParasPage() {
  const tilastot = await sanityFetch<TilastoDoc[]>({
    query: tilastotByCategoryQuery,
    params: { category: "ballon-dor" },
    tags: arkistoTags,
    fallback: [],
  });

  const trail = arkistoTrail({ label: "Euroopan paras" });

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
          emptyTitle="Ei vielä Ballon d'Or -tilastoja"
        />
      </ArkistoPage>
    </>
  );
}
