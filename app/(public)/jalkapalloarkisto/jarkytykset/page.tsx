import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import { haeOsioSivu } from "@/sanity/lib/osiosivu";
import {
  arkistoTags,
  tilastotByCategoryQuery,
  type TilastoDoc,
} from "@/sanity/lib/queries/arkisto";

import { ArkistoPage } from "../_tilastot/arkisto-page";
import { arkistoTrail, datasetSchemas } from "../_tilastot/helpers";
import { StatSections } from "../_tilastot/stat-sections";

export const revalidate = 3600;

const path = "/jalkapalloarkisto/jarkytykset";
/** Otsikko, johdanto ja hakukoneteksti: Studion Osioiden sivut (lib/osiosivut.ts). */
const OSIO = "jalkapalloarkisto/jarkytykset" as const;

export async function generateMetadata(): Promise<Metadata> {
  const s = await haeOsioSivu(OSIO);
  return buildMetadata({ title: s.seoTitle, description: s.description, path });
}

export default async function JarkytyksetPage() {
  const { title, lead, description } = await haeOsioSivu(OSIO);
  const tilastot = await sanityFetch<TilastoDoc[]>({
    query: tilastotByCategoryQuery,
    params: { category: "jarkytykset" },
    tags: arkistoTags,
    fallback: [],
  });

  const trail = arkistoTrail({ label: "TOP 10 järkytykset" });

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
          emptyTitle="Ei vielä järkytyksiä"
        />
      </ArkistoPage>
    </>
  );
}
