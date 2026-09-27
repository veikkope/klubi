import Link from "next/link";
import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata } from "@/lib/seo";
import { rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema-org";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  ravintolaOptionsQuery,
  type RavintolaOption,
} from "@/sanity/lib/queries/ravintolat";
import { ReviewForm } from "./review-form";

export const revalidate = 3600;

const TITLE = "Arvostele ravintola";
const PATH = "/ravintolat/arvostele";
const LEAD =
  "Kävitkö ravintolassa, jonka klubi on arvioinut? Kerro oma kokemuksesi. " +
  "Luemme jokaisen lähetyksen ennen julkaisua, ja hyväksytty arvostelu näkyy " +
  "ravintolan omalla sivulla.";

const trail = [
  rootCrumb,
  { label: "Ravintola-arviot", href: "/ravintolat" },
  { label: TITLE },
];

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: TITLE,
    description:
      "Lähetä oma arvostelusi Lahden Suomalainen Klubi ry:n ravintolahakemistoon. " +
      "Arvostelut tarkistetaan ennen julkaisua.",
    path: PATH,
  });
}

export default async function ArvostelePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const wanted = Array.isArray(sp.ravintola) ? sp.ravintola[0] : sp.ravintola;

  const restaurants = await sanityFetch<RavintolaOption[]>({
    query: ravintolaOptionsQuery,
    tags: ["ravintola"],
    fallback: [],
  });

  const preselected = wanted
    ? restaurants.find((r) => r.slug === wanted)?._id
    : undefined;

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          webPageSchema({ title: TITLE, description: LEAD, path: PATH }),
        ]}
      />

      <Container size="narrow" className="py-12 sm:py-16">
        <PageHeader
          title={TITLE}
          lead={LEAD}
          eyebrow="Ravintolat"
          breadcrumbs={trail}
        />

        <div className="mt-10">
          {restaurants.length === 0 ? (
            <UnavailableNotice />
          ) : (
            <ReviewForm
              restaurants={restaurants}
              defaultRestaurantId={preselected}
            />
          )}
        </div>
      </Container>
    </>
  );
}

/**
 * Ravintolalistaa ei saatu — lomaketta ei voi näyttää, koska arvostelu on
 * sidottava olemassa olevaan ravintolaan. Kerrotaan se suoraan sen sijaan että
 * näytettäisiin lomake, joka ei voi onnistua.
 */
function UnavailableNotice() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-8">
      <h2 className="font-display text-2xl text-foreground">
        Lomake ei ole juuri nyt käytettävissä
      </h2>
      <p className="mt-3 leading-relaxed text-muted">
        Ravintolahakemisto on tyhjä, joten arvostelua ei voi kohdistaa mihinkään
        ravintolaan. Kokeile hetken kuluttua uudelleen tai lähetä arviosi
        sähköpostitse osoitteeseen{" "}
        <a
          href="mailto:info@lahdensuomalainenklubi.com"
          className="text-accent underline underline-offset-4"
        >
          info@lahdensuomalainenklubi.com
        </a>
        .
      </p>
      <Link
        href="/ravintolat"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-sm border border-border px-6 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Selaa ravintolahakemistoa
      </Link>
    </div>
  );
}
