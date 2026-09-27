import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { FixtureList } from "@/components/fixture-list";
import { JsonLd } from "@/components/seo/json-ld";
import { rootCrumb } from "@/lib/nav-sections";
import { getTulevatOttelut } from "@/lib/ottelut";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";

// Ulkoinen otteluohjelma päivitetään tunnin välein (lib/ottelut.ts).
export const revalidate = 3600;

const PATH = "/ottelut";

const LEAD =
  "Tulevat Veikkausliigan ottelut ja muut klubia kiinnostavat pelit. " +
  "Merkinnästä näet, missä otteluissa klubi on paikalla ja mihin järjestetään yhteinen vierasmatka.";

const trail = [rootCrumb, { label: "Ottelut" }];

export const metadata: Metadata = buildMetadata({
  title: "Ottelut",
  description: LEAD,
  path: PATH,
});

export default async function OttelutPage() {
  const ottelut = await getTulevatOttelut(60);

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({ title: "Ottelut", description: LEAD, path: PATH }),
        ]}
      />
      <Container size="default" className="pt-12">
        <PageHeader
          title="Ottelut"
          eyebrow="Otteluohjelma"
          lead={LEAD}
          breadcrumbs={trail}
        />
        {ottelut.length > 0 ? (
          <FixtureList ottelut={ottelut} className="mt-10" />
        ) : (
          <p className="mt-10 max-w-2xl text-muted">
            Tulevia otteluita ei ole juuri nyt tiedossa. Veikkausliigan uusi kausi
            alkaa keväällä, ja ohjelma päivittyy tälle sivulle automaattisesti.
          </p>
        )}
        <p className="mt-6 text-sm text-muted-soft">
          Veikkausliigan otteluohjelma päivittyy automaattisesti. Ajat ovat Suomen aikaa.
        </p>
      </Container>
    </>
  );
}
