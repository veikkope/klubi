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

const path = "/jalkapalloarkisto/valmentajat";
/** Otsikko, johdanto ja hakukoneteksti: Studion Osioiden sivut (lib/osiosivut.ts). */
const OSIO = "jalkapalloarkisto/valmentajat" as const;

export async function generateMetadata(): Promise<Metadata> {
  const s = await haeOsioSivu(OSIO);
  return buildMetadata({ title: s.seoTitle, description: s.description, path });
}

export default async function ValmentajatPage() {
  const { title, lead, description } = await haeOsioSivu(OSIO);
  // Palkkatiedot ovat oma kategoriansa ja oma osionsa (#palkat).
  const [valmentajat, palkat] = await Promise.all([
    sanityFetch<TilastoDoc[]>({
      query: tilastotByCategoryQuery,
      params: { category: "valmentajat" },
      tags: arkistoTags,
      fallback: [],
    }),
    sanityFetch<TilastoDoc[]>({
      query: tilastotByCategoryQuery,
      params: { category: "valmentajien-palkat" },
      tags: arkistoTags,
      fallback: [],
    }),
  ]);

  const trail = arkistoTrail({ label: "Valmentajat" });

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          ...datasetSchemas({
            tilastot: [...valmentajat, ...palkat],
            path,
            title,
            description,
          }),
        ]}
      />

      <ArkistoPage
        title={title}
        lead={lead}
        breadcrumbs={trail}
        meta={
          <a
            href="#palkat"
            className="inline-flex min-h-11 items-center rounded-sm border border-border bg-surface px-4 text-sm text-muted transition hover:border-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Siirry palkkatietoihin
          </a>
        }
      >
        <section aria-labelledby="valmentajat-otsikko">
          <h2
            id="valmentajat-otsikko"
            className="font-display text-2xl leading-tight text-foreground sm:text-3xl"
          >
            Päävalmentajat
          </h2>
          <div className="mt-6">
            <StatSections
              tilastot={valmentajat}
              headingLevel="h3"
              emptyTitle="Ei vielä valmentajatilastoja"
            />
          </div>
        </section>

        <section
          id="palkat"
          aria-labelledby="palkat-otsikko"
          className="mt-16"
        >
          <h2
            id="palkat-otsikko"
            className="font-display text-2xl leading-tight text-foreground sm:text-3xl"
          >
            Valmentajien palkat
          </h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted">
            Päävalmentajien palkkatiedot ovat julkisia arvioita, jotka on koottu
            lehtilähteistä. Taulukon lähteet on merkitty näkyviin.
          </p>
          <div className="mt-6">
            <StatSections
              tilastot={palkat}
              headingLevel="h3"
              emptyTitle="Ei vielä palkkatietoja"
            />
          </div>
        </section>
      </ArkistoPage>
    </>
  );
}
