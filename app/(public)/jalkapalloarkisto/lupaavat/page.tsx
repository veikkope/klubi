import type { Metadata } from "next";
import Link from "next/link";

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

const path = "/jalkapalloarkisto/lupaavat";
/** Otsikko, johdanto ja hakukoneteksti: Studion Osioiden sivut (lib/osiosivut.ts). */
const OSIO = "jalkapalloarkisto/lupaavat" as const;

export async function generateMetadata(): Promise<Metadata> {
  const s = await haeOsioSivu(OSIO);
  return buildMetadata({ title: s.seoTitle, description: s.description, path });
}

export default async function LupaavatPage() {
  const { title, lead, description } = await haeOsioSivu(OSIO);
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
            className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            vuoden pelaajat
          </Link>
          .
        </p>
      </ArkistoPage>
    </>
  );
}
