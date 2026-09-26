import type { Metadata } from "next";

import { SanityImage } from "@/components/sanity-image";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionNav } from "@/components/layout/section-nav";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardArrow,
  CardBody,
  CardEyebrow,
  CardTitle,
} from "@/components/ui/card";
import { arkistoNav, rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  pelaajatListQuery,
  pelipaikkaLabel,
  withSlug,
  type PelaajaCard,
} from "@/sanity/lib/queries/arkisto-laajennus";

export const revalidate = 3600;

const PATH = "/jalkapalloarkisto/pelaajat";
const TITLE = "Pelaajat";
const LEAD =
  "Pelaajaprofiilit Suomen jalkapallon historiasta: pelipaikka, maaotteluiden " +
  "ja maalien määrä sekä seurahistoria. Nimet aakkosjärjestyksessä.";

const trail = [
  rootCrumb,
  { label: "Jalkapalloarkisto", href: "/jalkapalloarkisto" },
  { label: TITLE },
];

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: TITLE,
    description: LEAD,
    path: PATH,
  });
}

export default async function PelaajatPage() {
  const pelaajat = withSlug(
    await sanityFetch<PelaajaCard[]>({
      query: pelaajatListQuery,
      tags: ["pelaaja"],
      fallback: [],
    }),
  );

  return (
    <Container className="py-12 sm:py-16">
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({
            title: TITLE,
            description: LEAD,
            path: PATH,
            itemCount: pelaajat.length,
          }),
        ]}
      />

      <PageHeader
        eyebrow="Jalkapalloarkisto"
        title={TITLE}
        lead={LEAD}
        breadcrumbs={trail}
        meta={
          pelaajat.length > 0 ? (
            <Badge tone="brand">
              {pelaajat.length} {pelaajat.length === 1 ? "pelaaja" : "pelaajaa"}
            </Badge>
          ) : undefined
        }
      />

      <SectionNav
        items={arkistoNav}
        label="Jalkapalloarkiston osiot"
        className="mt-8"
      />

      {pelaajat.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted">
          Pelaajaprofiileja ei ole vielä lisätty. Ne ilmestyvät tänne heti kun
          ne on kirjattu Studioon.
        </p>
      ) : (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pelaajat.map((pelaaja) => (
            <li key={pelaaja._id}>
              <PelaajaListCard pelaaja={pelaaja} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

function PelaajaListCard({
  pelaaja,
}: {
  pelaaja: PelaajaCard & { slug: string };
}) {
  const paikka = pelipaikkaLabel(pelaaja.pelipaikka);

  return (
    <Card
      href={`/jalkapalloarkisto/pelaajat/${pelaaja.slug}`}
      className="flex h-full flex-col overflow-hidden p-0"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-surface-strong">
        {pelaaja.kuva?.asset ? (
          <SanityImage
            image={pelaaja.kuva}
            width={800}
            height={600}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-full w-full items-center justify-center font-serif text-4xl text-border-strong"
          >
            {pelaaja.name.charAt(0)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        {paikka && <CardEyebrow>{paikka}</CardEyebrow>}
        <CardTitle className="mt-1">{pelaaja.name}</CardTitle>

        {pelaaja.tiivistelma && (
          <CardBody className="mt-3 text-sm">{pelaaja.tiivistelma}</CardBody>
        )}

        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {pelaaja.maaottelut != null && (
            <div className="flex gap-2">
              <dt className="text-muted-soft">Maaottelut</dt>
              <dd className="font-medium tabular-nums text-foreground">
                {pelaaja.maaottelut}
              </dd>
            </div>
          )}
          {pelaaja.maalit != null && (
            <div className="flex gap-2">
              <dt className="text-muted-soft">Maalit</dt>
              <dd className="font-medium tabular-nums text-foreground">
                {pelaaja.maalit}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-auto">
          <CardArrow label="Pelaajaprofiili" />
        </div>
      </div>
    </Card>
  );
}
