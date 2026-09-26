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

const path = "/jalkapalloarkisto/vuoden-pelaajat";
const title = "Vuoden pelaajat";
const description =
  "Suomen vuoden jalkapalloilijat ja FIFA:n vuoden pelaajat omina taulukkoinaan — palkitut vuosittain seuroineen ja maineen.";
const lead =
  "Kaksi palkintoa, kaksi taulukkoa: Suomen Palloliiton vuoden " +
  "jalkapalloilija ja FIFA:n valitsema maailman vuoden pelaaja. " +
  "Molemmat listat kattavat palkitut vuosittain.";

export function generateMetadata(): Metadata {
  return buildMetadata({ title, description, path });
}

export default async function VuodenPelaajatPage() {
  const tilastot = await sanityFetch<TilastoDoc[]>({
    query: tilastotByCategoryQuery,
    params: { category: "vuoden-pelaaja" },
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
          emptyTitle="Ei vielä vuoden pelaaja -tilastoja"
        />

        <p className="mt-12 text-muted">
          Nuorten palkinnot löytyvät omalta sivultaan:{" "}
          <Link
            href="/jalkapalloarkisto/lupaavat"
            className="text-accent underline-offset-4 hover:underline"
          >
            lupaavat pelaajat 1980–1991
          </Link>
          .
        </p>
      </ArkistoPage>
    </>
  );
}
