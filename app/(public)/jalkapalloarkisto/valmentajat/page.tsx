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

const path = "/jalkapalloarkisto/valmentajat";
const title = "Huuhkajien valmentajat";
const description =
  "Suomen miesten maajoukkueen päävalmentajat kausittain sekä tiedot valmentajien palkoista yhtenä koottuna taulukkona.";
const lead =
  "Suomen maajoukkuetta on johtanut sekä kotimaisia että ulkomaisia " +
  "päävalmentajia. Sivu kokoaa valmentajat kausittain ja erikseen tiedot " +
  "valmentajien palkoista.";

export function generateMetadata(): Metadata {
  return buildMetadata({ title, description, path });
}

export default async function ValmentajatPage() {
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
            className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-4 text-sm text-muted transition hover:border-brand-300 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            Siirry palkkatietoihin
          </a>
        }
      >
        <section aria-labelledby="valmentajat-otsikko">
          <h2
            id="valmentajat-otsikko"
            className="font-serif text-2xl leading-tight text-foreground sm:text-3xl"
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
          className="mt-16 scroll-mt-24"
        >
          <h2
            id="palkat-otsikko"
            className="font-serif text-2xl leading-tight text-foreground sm:text-3xl"
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
