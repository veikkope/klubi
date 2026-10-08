import type { Metadata } from "next";

import { SectionNav } from "@/components/layout/section-nav";
import { JsonLd } from "@/components/seo/json-ld";
import {
  Card,
  CardArrow,
  CardBody,
  CardEyebrow,
  CardTitle,
} from "@/components/ui/card";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import { ULKOMAISET_MESTARIT_PATH } from "@/lib/ulkomaiset-mestarit";
import { sanityFetch } from "@/sanity/lib/fetch";
import { haeOsioSivu } from "@/sanity/lib/osiosivu";
import {
  arkistoTags,
  tilastotByCategoryQuery,
  type TilastoDoc,
} from "@/sanity/lib/queries/arkisto";

import { ArkistoPage } from "../_tilastot/arkisto-page";
import { arkistoTrail, tableCountLabel } from "../_tilastot/helpers";
import { ArkistoEmpty } from "../_tilastot/stat-sections";
import { VanhaAnkkuriOhjaus } from "../_tilastot/vanha-ankkuri";
import { groupByMaa, maaNav } from "./maat";

export const revalidate = 3600;

const path = ULKOMAISET_MESTARIT_PATH;
/** Otsikko, johdanto ja hakukoneteksti: Studion Osioiden sivut (lib/osiosivut.ts). */
const OSIO = "jalkapalloarkisto/ulkomaiset-mestarit" as const;

export async function generateMetadata(): Promise<Metadata> {
  const s = await haeOsioSivu(OSIO);
  return buildMetadata({ title: s.seoTitle, description: s.description, path });
}

export default async function UlkomaisetMestaritPage() {
  const { title, lead, description } = await haeOsioSivu(OSIO);
  const tilastot = await sanityFetch<TilastoDoc[]>({
    query: tilastotByCategoryQuery,
    params: { category: "ulkomaiset-mestarit" },
    tags: arkistoTags,
    fallback: [],
  });

  const maat = groupByMaa(tilastot);
  const trail = arkistoTrail({ label: title });

  // Ennen maasivuja kaikki taulukot olivat tällä sivulla: #slug → maan sivu.
  const kohteet = Object.fromEntries(
    maat.flatMap((maa) =>
      maa.tilastot.flatMap((tilasto) => (tilasto.slug ? [[tilasto.slug, maa.href]] : [])),
    ),
  );

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({ title, description, path, itemCount: tilastot.length }),
        ]}
      />
      <VanhaAnkkuriOhjaus kohteet={kohteet} />

      <ArkistoPage title={title} lead={lead} breadcrumbs={trail}>
        {maat.length === 0 ? (
          <ArkistoEmpty title="Ei vielä mestaruustilastoja" />
        ) : (
          <>
            <SectionNav items={maaNav(maat)} label="Maat" />
            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              {maat.map((maa) => (
                <li key={maa.value} className="flex">
                  <Card href={maa.href} className="flex w-full flex-col">
                    <CardEyebrow>{tableCountLabel(maa.tilastot.length)}</CardEyebrow>
                    <CardTitle className="mt-2">{maa.pageTitle}</CardTitle>
                    <CardBody className="mt-2">{maa.lead}</CardBody>
                    <CardArrow label="Avaa maa" />
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}
      </ArkistoPage>
    </>
  );
}
