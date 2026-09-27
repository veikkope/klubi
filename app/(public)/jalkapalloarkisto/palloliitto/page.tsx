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

const path = "/jalkapalloarkisto/palloliitto";
const title = "Palloliiton puheenjohtajat";
const description =
  "Suomen Palloliiton puheenjohtajat kausittain taulukkona Lahden Suomalaisen Klubin jalkapalloarkistossa.";
const lead =
  "Suomen Palloliiton puheenjohtajat kausittain. Taulukko on osa klubin " +
  "jalkapalloarkistoa, ei klubin omaa hallintoa — klubin hallitus löytyy " +
  "Klubi-osiosta.";

export function generateMetadata(): Metadata {
  return buildMetadata({ title, description, path });
}

export default async function PalloliittoPage() {
  const tilastot = await sanityFetch<TilastoDoc[]>({
    query: tilastotByCategoryQuery,
    params: { category: "palloliitto" },
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
        <StatSections tilastot={tilastot} emptyTitle="Ei vielä puheenjohtajatietoja" />
      </ArkistoPage>
    </>
  );
}
