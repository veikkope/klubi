import type { Metadata } from "next";

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
import { sanityFetch } from "@/sanity/lib/fetch";
import { haeOsioSivu } from "@/sanity/lib/osiosivu";
import {
  arkistoTags,
  tilastotByCategoryQuery,
  type TilastoDoc,
} from "@/sanity/lib/queries/arkisto";

import { ArkistoPage } from "../_tilastot/arkisto-page";
import { arkistoTrail, muuTilastoPath, muutTilastotPath } from "../_tilastot/helpers";
import { ArkistoEmpty } from "../_tilastot/stat-sections";

export const revalidate = 3600;

const path = muutTilastotPath;
/** Otsikko, johdanto ja hakukoneteksti: Studion Osioiden sivut (lib/osiosivut.ts). */
const OSIO = "jalkapalloarkisto/tilastot" as const;

export async function generateMetadata(): Promise<Metadata> {
  const s = await haeOsioSivu(OSIO);
  return buildMetadata({ title: s.seoTitle, description: s.description, path });
}

function rowsLabel(tilasto: TilastoDoc): string {
  const rows = tilasto.rows?.length ?? 0;
  return rows === 1 ? "1 rivi" : `${rows} riviä`;
}

export default async function MuutTilastotPage() {
  const { title, lead, description } = await haeOsioSivu(OSIO);
  const tilastot = await sanityFetch<TilastoDoc[]>({
    query: tilastotByCategoryQuery,
    params: { category: "muu" },
    tags: arkistoTags,
    fallback: [],
  });
  const items = tilastot.filter(
    (tilasto): tilasto is TilastoDoc & { slug: string } => Boolean(tilasto.slug),
  );

  const trail = arkistoTrail({ label: title });

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({ title, description, path, itemCount: items.length }),
        ]}
      />

      <ArkistoPage title={title} lead={lead} breadcrumbs={trail}>
        {items.length === 0 ? (
          <ArkistoEmpty title="Ei vielä koosteita" />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((tilasto) => (
              <li key={tilasto._id} className="flex">
                <Card href={muuTilastoPath(tilasto.slug)} className="flex w-full flex-col">
                  <CardEyebrow>{rowsLabel(tilasto)}</CardEyebrow>
                  <CardTitle as="h2" className="mt-1">{tilasto.title}</CardTitle>
                  {tilasto.tiivistelma && (
                    <CardBody className="mt-3 text-sm">{tilasto.tiivistelma}</CardBody>
                  )}
                  <CardArrow label="Avaa kooste" />
                </Card>
              </li>
            ))}
          </ul>
        )}
      </ArkistoPage>
    </>
  );
}
