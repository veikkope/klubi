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

const path = "/jalkapalloarkisto/ulkomaiset-mestarit";
const title = "Ulkomaiset mestarit";
const description =
  "Englannin ja Venäjän jalkapallomestarit vuosi vuodelta sekä Englannin seurojen mestaruudet ja cupvoitot taulukoina.";
const lead =
  "Suomen mestareiden rinnalle arkisto on koonnut kahden jalkapallomaan " +
  "mestaruushistorian: Englannin ja Venäjän mestarit sekä Englannin seurojen " +
  "kokonaismäärät.";

export function generateMetadata(): Metadata {
  return buildMetadata({ title, description, path });
}

export default async function UlkomaisetMestaritPage() {
  const tilastot = await sanityFetch<TilastoDoc[]>({
    query: tilastotByCategoryQuery,
    params: { category: "ulkomaiset-mestarit" },
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
        <StatSections tilastot={tilastot} emptyTitle="Ei vielä mestaruustilastoja" />
      </ArkistoPage>
    </>
  );
}
