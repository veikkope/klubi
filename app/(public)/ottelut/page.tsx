import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { FixtureList } from "@/components/fixture-list";
import { JsonLd } from "@/components/seo/json-ld";
import { rootCrumb } from "@/lib/nav-sections";
import { getTulevatOttelut } from "@/lib/ottelut";
import { sanityFetch } from "@/sanity/lib/fetch";
import { ottelujenSeuratQuery } from "@/sanity/lib/queries/ottelut";
import { haeOsioSivu } from "@/sanity/lib/osiosivu";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";

// Ulkoinen otteluohjelma päivitetään tunnin välein (lib/ottelut.ts).
export const revalidate = 3600;

const PATH = "/ottelut";

/** Otsikko, johdanto ja hakukoneteksti: Studion Osioiden sivut (lib/osiosivut.ts). */
const OSIO = "ottelut" as const;

export async function generateMetadata(): Promise<Metadata> {
  const s = await haeOsioSivu(OSIO);
  return buildMetadata({
    title: s.seoTitle,
    description: s.description,
    path: PATH,
  });
}

export default async function OttelutPage() {
  // Vain Huuhkajat ja Studiossa valitut seurat (etusivun otteluohjelmalohkon
  // seuralista). Ilman lohkoa sama oletus kuin Studion kentässä.
  const [seurat, s] = await Promise.all([
    sanityFetch<string[]>({
      query: ottelujenSeuratQuery,
      tags: ["etusivu"],
      fallback: ["FC Lahti"],
    }),
    haeOsioSivu(OSIO),
  ]);
  const trail = [rootCrumb, { label: s.title }];
  const ottelut = await getTulevatOttelut(60, { vainMaajoukkue: true, seurat });

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({ title: s.title, description: s.description, path: PATH }),
        ]}
      />
      <Container size="default" className="pt-12">
        <PageHeader
          title={s.title}
          eyebrow="Otteluohjelma"
          lead={s.lead}
          breadcrumbs={trail}
        />
        {ottelut.length > 0 ? (
          <FixtureList ottelut={ottelut} className="mt-10" />
        ) : (
          <p className="mt-10 max-w-2xl text-muted">
            Tulevia otteluita ei ole juuri nyt tiedossa. Ohjelma päivittyy tälle
            sivulle automaattisesti, kun uusia otteluita julkaistaan.
          </p>
        )}
        <p className="mt-6 text-sm text-muted-soft">
          Seurojen otteluohjelma päivittyy automaattisesti. Ajat ovat Suomen aikaa.
        </p>
      </Container>
    </>
  );
}
