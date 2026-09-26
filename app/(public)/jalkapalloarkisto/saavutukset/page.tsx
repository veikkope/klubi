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

const path = "/jalkapalloarkisto/saavutukset";
const title = "Suomen jalkapallon saavutukset";
const description =
  "Suomalaisen jalkapallon merkittävimmät saavutukset aikajärjestyksessä: maajoukkueen, seurojen ja pelaajien käännekohdat.";
const lead =
  "Kooste siitä, mitä suomalainen jalkapallo on saavuttanut: maajoukkueen " +
  "läpimurrot, seurojen eurocup-menestys ja pelaajien kansainväliset " +
  "tunnustukset aikajärjestyksessä.";

export function generateMetadata(): Metadata {
  return buildMetadata({ title, description, path });
}

export default async function SaavutuksetPage() {
  const tilastot = await sanityFetch<TilastoDoc[]>({
    query: tilastotByCategoryQuery,
    params: { category: "saavutukset" },
    tags: arkistoTags,
    fallback: [],
  });

  const trail = arkistoTrail({ label: "Saavutukset" });

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
          emptyTitle="Ei vielä saavutustilastoja"
        />
      </ArkistoPage>
    </>
  );
}
