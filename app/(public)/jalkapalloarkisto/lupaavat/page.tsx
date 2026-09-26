import type { Metadata } from "next";
import Link from "next/link";

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

const path = "/jalkapalloarkisto/lupaavat";
const title = "Lupaavat pelaajat 1980–1991";
const description =
  "Vuosina 1980–1991 lupaavimmiksi valitut suomalaiset jalkapalloilijat: palkitut vuosittain seuroineen yhtenä taulukkona.";
const lead =
  "Lupaavimman pelaajan tunnustus jaettiin Suomessa vuosina 1980–1991. " +
  "Taulukko kokoaa palkitut vuosittain — monet heistä nousivat myöhemmin " +
  "maajoukkueeseen ja ulkomaisiin seuroihin.";

export function generateMetadata(): Metadata {
  return buildMetadata({ title, description, path });
}

export default async function LupaavatPage() {
  const tilastot = await sanityFetch<TilastoDoc[]>({
    query: tilastotByCategoryQuery,
    params: { category: "lupaavat" },
    tags: arkistoTags,
    fallback: [],
  });

  const trail = arkistoTrail({ label: "Lupaavat pelaajat" });

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
          emptyTitle="Ei vielä tietoja lupaavista pelaajista"
        />

        <p className="mt-12 text-muted">
          Vuosittaiset pääpalkinnot löytyvät sivulta{" "}
          <Link
            href="/jalkapalloarkisto/vuoden-pelaajat"
            className="text-accent underline-offset-4 hover:underline"
          >
            vuoden pelaajat
          </Link>
          .
        </p>
      </ArkistoPage>
    </>
  );
}
