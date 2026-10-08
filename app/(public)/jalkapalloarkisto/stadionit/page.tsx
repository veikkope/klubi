import type { Metadata } from "next";
import Link from "next/link";
import { stegaClean } from "next-sanity";

import { FramedImage } from "@/components/framed-image";
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
import { haeOsioSivu } from "@/sanity/lib/osiosivu";
import {
  stadionitListQuery,
  withSlug,
  type StadionCard,
} from "@/sanity/lib/queries/arkisto-laajennus";

export const revalidate = 3600;

const PATH = "/jalkapalloarkisto/stadionit";
/** Otsikko, johdanto ja hakukoneteksti: Studion Osioiden sivut (lib/osiosivut.ts). */
const OSIO = "jalkapalloarkisto/stadionit" as const;

/** Kotimaa nostetaan aina listan kärkeen. */
const HOME_COUNTRY = "Suomi";
const UNKNOWN_COUNTRY = "Maa ei tiedossa";

export async function generateMetadata(): Promise<Metadata> {
  const s = await haeOsioSivu(OSIO);
  return buildMetadata({
    title: s.seoTitle,
    description: s.description,
    path: PATH,
  });
}

/** Ryhmittelee maan mukaan: Suomi ensin, muut aakkosissa, tuntemattomat viimeisenä. */
function groupByCountry(items: (StadionCard & { slug: string })[]) {
  const groups = new Map<string, (StadionCard & { slug: string })[]>();

  for (const item of items) {
    // Maa on ryhmittelyavain ja ankkuri-id: stega-merkit pois (luonnosnäkymä).
    const country = stegaClean(item.city?.country)?.trim() || UNKNOWN_COUNTRY;
    const bucket = groups.get(country);
    if (bucket) bucket.push(item);
    else groups.set(country, [item]);
  }

  return [...groups.entries()]
    .map(([country, stadionit]) => ({ country, stadionit }))
    .sort((a, b) => {
      if (a.country === b.country) return 0;
      if (a.country === HOME_COUNTRY) return -1;
      if (b.country === HOME_COUNTRY) return 1;
      if (a.country === UNKNOWN_COUNTRY) return 1;
      if (b.country === UNKNOWN_COUNTRY) return -1;
      return a.country.localeCompare(b.country, "fi-FI");
    });
}

/**
 * Ankkuri-id maan nimestä. HTML5 sallii id:ssä ääkköset, joten vain
 * välilyönnit korvataan — nimeä ei tarvitse translitteroida.
 */
function countryId(country: string): string {
  return `maa-${country.toLowerCase().split(/\s+/).join("-")}`;
}

export default async function StadionitPage() {
  const [rivit, s] = await Promise.all([
    sanityFetch<StadionCard[]>({
      query: stadionitListQuery,
      tags: ["stadion"],
      fallback: [],
    }),
    haeOsioSivu(OSIO),
  ]);
  const stadionit = withSlug(rivit);
  const trail = [
    rootCrumb,
    { label: "Jalkapalloarkisto", href: "/jalkapalloarkisto" },
    { label: s.title },
  ];

  const groups = groupByCountry(stadionit);

  return (
    <Container className="py-12 sm:py-16">
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({
            title: s.title,
            description: s.description,
            path: PATH,
            itemCount: stadionit.length,
          }),
        ]}
      />

      <PageHeader
        eyebrow="Jalkapalloarkisto"
        title={s.title}
        lead={s.lead}
        breadcrumbs={trail}
        meta={
          stadionit.length > 0 ? (
            <Badge tone="brand">
              {stadionit.length}{" "}
              {stadionit.length === 1 ? "stadion" : "stadionia"}
            </Badge>
          ) : undefined
        }
      />

      <SectionNav
        items={arkistoNav}
        label="Jalkapalloarkiston osiot"
        className="mt-8"
      />

      {groups.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted">
          Stadioneja ei ole vielä lisätty. Ne julkaistaan tälle sivulle
          myöhemmin.
        </p>
      ) : (
        <div className="mt-12 space-y-14">
          {groups.map((group) => (
            <section
              key={group.country}
              aria-labelledby={countryId(group.country)}
            >
              <h2
                id={countryId(group.country)}
                className="font-display text-2xl text-foreground sm:text-3xl"
              >
                {group.country}
              </h2>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.stadionit.map((stadion) => (
                  <li key={stadion._id}>
                    <StadionListCard stadion={stadion} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {/* Vanha stadionit-hubi linkitti puutteellisiin järjestelyihin; kooste
          on nyt oma sivunsa Muut tilastot -osiossa. */}
      <p className="mt-16 max-w-3xl text-muted">
        Klubin havainnot otteluiden järjestelyistä on koottu sivulle{" "}
        <Link
          href="/jalkapalloarkisto/tilastot/puutteelliset-jarjestelyt"
          className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          Puutteelliset järjestelyt
        </Link>
        .
      </p>
    </Container>
  );
}

function StadionListCard({
  stadion,
}: {
  stadion: StadionCard & { slug: string };
}) {
  return (
    <Card
      href={`/jalkapalloarkisto/stadionit/${stadion.slug}`}
      className="flex h-full flex-col overflow-hidden p-0"
    >
      {stadion.kuva?.asset && (
        <div className="aspect-[3/2] w-full overflow-hidden bg-surface-strong">
          <FramedImage
            image={stadion.kuva}
            width={800}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="h-full w-full"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        {stadion.city?.name && <CardEyebrow>{stadion.city.name}</CardEyebrow>}
        <CardTitle className="mt-1">{stadion.name}</CardTitle>

        {stadion.tiivistelma && (
          <CardBody className="mt-3 text-sm">{stadion.tiivistelma}</CardBody>
        )}

        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {stadion.capacity != null && (
            <div className="flex gap-2">
              <dt className="text-muted-soft">Kapasiteetti</dt>
              <dd className="font-medium tabular-nums text-foreground">
                {stadion.capacity.toLocaleString("fi-FI")}
              </dd>
            </div>
          )}
          {stadion.openedYear != null && (
            <div className="flex gap-2">
              <dt className="text-muted-soft">Avattu</dt>
              <dd className="font-medium tabular-nums text-foreground">
                {stadion.openedYear}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-auto">
          <CardArrow label="Stadionin tiedot" />
        </div>
      </div>
    </Card>
  );
}
