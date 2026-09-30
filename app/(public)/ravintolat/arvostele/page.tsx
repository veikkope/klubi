import Link from "next/link";
import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata } from "@/lib/seo";
import { rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema-org";
import { getYhteysSahkoposti } from "@/lib/yhteystiedot";
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
  "Kerro oma kokemuksesi klubin arvioimasta ravintolasta tai lisää uusi ravintola " +
  "hakemistoon. Luemme jokaisen arvostelun ennen julkaisua, ja hyväksytty arvostelu " +
  "näkyy ravintolan omalla sivulla.";

const trail = [
  rootCrumb,
  { label: "Ravintola-arviot", href: "/ravintolat" },
  { label: TITLE },
];

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: TITLE,
    description:
      "Arvostele ravintola tai ehdota uutta Lahden Suomalainen Klubi ry:n " +
      "ravintolahakemistoon. Arvostelut tarkistetaan ennen julkaisua.",
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

  const [restaurants, email] = await Promise.all([
    sanityFetch<RavintolaOption[]>({
      query: ravintolaOptionsQuery,
      tags: ["ravintola"],
      fallback: [],
    }),
    getYhteysSahkoposti(),
  ]);

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
          topic="food"
          breadcrumbs={trail}
        />

        <div className="mt-10">
          {restaurants.length === 0 ? (
            <UnavailableNotice email={email} />
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
function UnavailableNotice({ email }: { email: string | null }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-8">
      <h2 className="font-display text-2xl text-foreground">
        Lomake ei ole juuri nyt käytettävissä
      </h2>
      <p className="mt-3 leading-relaxed text-muted">
        Ravintolahakemisto on tyhjä, joten arvostelua ei voi kohdistaa mihinkään
        ravintolaan. Kokeile hetken kuluttua uudelleen
        {email ? (
          <>
            {" "}tai lähetä arviosi sähköpostitse osoitteeseen{" "}
            <a href={`mailto:${email}`} className="text-accent underline underline-offset-4">
              {email}
            </a>
            .
          </>
        ) : (
          "."
        )}
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
