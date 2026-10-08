import type { Metadata } from "next";

import { SectionNav } from "@/components/layout/section-nav";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import {
  MESTARUUSMAAT,
  ULKOMAISET_MESTARIT_PATH,
  findMestaruusmaa,
  mestaruusmaaPath,
} from "@/lib/ulkomaiset-mestarit";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  arkistoTags,
  tilastotByCategoryQuery,
  type TilastoDoc,
} from "@/sanity/lib/queries/arkisto";
import { ohjaaTaiEiLoydy } from "@/sanity/lib/ohjaus";

import { ArkistoPage } from "../../_tilastot/arkisto-page";
import { arkistoTrail, datasetSchemas } from "../../_tilastot/helpers";
import { StatSections } from "../../_tilastot/stat-sections";
import { groupByMaa, maaNav } from "../maat";

export const revalidate = 3600;

type Params = { maa: string };

export function generateStaticParams(): Params[] {
  return MESTARUUSMAAT.map((maa) => ({ maa: maa.value }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { maa: value } = await params;
  const maa = findMestaruusmaa(value);

  if (!maa) {
    return buildMetadata({
      title: "Maata ei löytynyt",
      description:
        "Pyydettyä maata ei löytynyt jalkapalloarkiston ulkomaisista mestareista. Katso kaikki maat Ulkomaiset mestarit -sivulta.",
      path: mestaruusmaaPath(value),
      noIndex: true,
    });
  }

  return buildMetadata({
    title: maa.pageTitle,
    description: maa.description,
    path: mestaruusmaaPath(maa.value),
  });
}

export default async function MestaruusmaaPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { maa: value } = await params;
  const maa = findMestaruusmaa(value);
  if (!maa) return ohjaaTaiEiLoydy(`/jalkapalloarkisto/ulkomaiset-mestarit/${value}`);

  // Kaikki maat haetaan: maavalikko näyttää vain maat, joilla on taulukoita.
  const kaikki = await sanityFetch<TilastoDoc[]>({
    query: tilastotByCategoryQuery,
    params: { category: "ulkomaiset-mestarit" },
    tags: arkistoTags,
    fallback: [],
  });

  const maat = groupByMaa(kaikki);
  const tilastot = maat.find((group) => group.value === maa.value)?.tilastot ?? [];

  // Tyhjää maata ei julkaista: hub ei linkitä siihen.
  if (tilastot.length === 0) return ohjaaTaiEiLoydy(`/jalkapalloarkisto/ulkomaiset-mestarit/${value}`);

  const path = mestaruusmaaPath(maa.value);
  const trail = arkistoTrail(
    { label: "Ulkomaiset mestarit", href: ULKOMAISET_MESTARIT_PATH },
    { label: maa.title },
  );

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          ...datasetSchemas({
            tilastot,
            path,
            title: maa.pageTitle,
            description: maa.description,
          }),
        ]}
      />

      <ArkistoPage
        title={maa.pageTitle}
        lead={maa.lead}
        eyebrow="Ulkomaiset mestarit"
        breadcrumbs={trail}
      >
        <SectionNav items={maaNav(maat)} label="Maat" className="mb-12" />
        <StatSections tilastot={tilastot} />
      </ArkistoPage>
    </>
  );
}
