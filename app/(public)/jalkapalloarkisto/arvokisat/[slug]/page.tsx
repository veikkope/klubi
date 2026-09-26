import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PortableText } from "@/components/portable-text";
import { SanityImage } from "@/components/sanity-image";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionNav } from "@/components/layout/section-nav";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { StatTable, type StatColumn } from "@/components/ui/stat-table";
import { arkistoNav, rootCrumb } from "@/lib/nav-sections";
import {
  breadcrumbSchema,
  datasetSchema,
  webPageSchema,
} from "@/lib/schema-org";
import { buildMetadata, resolveDescription } from "@/lib/seo";
import { hasSanity } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  arvokisaBySlugQuery,
  arvokisaSlugsQuery,
  arvokisatRelatedQuery,
  kisatyyppiLabel,
  withSlug,
  type ArvokisaCard,
  type ArvokisaFull,
  type TilastoTable,
} from "@/sanity/lib/queries/arkisto-laajennus";

export const revalidate = 3600;

type Params = { slug: string };

const LIST_PATH = "/jalkapalloarkisto/arvokisat";

function pathFor(slug: string): string {
  return `${LIST_PATH}/${slug}`;
}

export async function generateStaticParams(): Promise<Params[]> {
  if (!hasSanity) return [];
  const slugs = await sanityFetch<string[]>({
    query: arvokisaSlugsQuery,
    tags: ["arvokisa"],
    fallback: [],
  });
  return slugs.filter(Boolean).map((slug) => ({ slug }));
}

async function getArvokisa(slug: string) {
  return sanityFetch<ArvokisaFull | null>({
    query: arvokisaBySlugQuery,
    params: { slug },
    tags: ["arvokisa", `arvokisa:${slug}`],
    fallback: null,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kisa = await getArvokisa(slug);

  if (!kisa) {
    return buildMetadata({
      title: "Sivua ei löytynyt",
      path: pathFor(slug),
      noIndex: true,
    });
  }

  return buildMetadata({
    title: kisa.seoTitle || kisa.title,
    description: resolveDescription(kisa.seoDescription, kisa.tiivistelma),
    path: pathFor(slug),
    image: kisa.kuvat?.[0],
    modifiedAt: kisa._updatedAt,
  });
}

export default async function ArvokisaPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const kisa = await getArvokisa(slug);
  if (!kisa) notFound();

  const related = withSlug(
    await sanityFetch<ArvokisaCard[]>({
      query: arvokisatRelatedQuery,
      params: { slug, kisatyyppi: kisa.kisatyyppi ?? null },
      tags: ["arvokisa"],
      fallback: [],
    }),
  );

  const path = pathFor(slug);
  const trail = [
    rootCrumb,
    { label: "Jalkapalloarkisto", href: "/jalkapalloarkisto" },
    { label: "Arvokisat", href: LIST_PATH },
    { label: kisa.title },
  ];

  const isannat = kisa.isantamaat?.filter(Boolean) ?? [];
  const tilastot = (kisa.tilastot ?? []).filter(Boolean);
  const kuvat = (kisa.kuvat ?? []).filter(Boolean);
  const description = resolveDescription(kisa.seoDescription, kisa.tiivistelma);
  const hasFacts = Boolean(
    kisa.vuosi != null ||
      isannat.length > 0 ||
      kisa.voittaja ||
      kisa.suomenSijoitus,
  );

  return (
    <Container className="py-12 sm:py-16">
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          webPageSchema({
            title: kisa.title,
            description,
            path,
            modifiedAt: kisa._updatedAt,
          }),
          ...tilastot.map((tilasto) =>
            datasetSchema({
              title: tilasto.title,
              description: tilasto.tiivistelma,
              path,
              modifiedAt: kisa._updatedAt,
            }),
          ),
        ]}
      />

      <PageHeader
        eyebrow={kisatyyppiLabel(kisa.kisatyyppi)}
        title={kisa.title}
        lead={kisa.tiivistelma}
        breadcrumbs={trail}
        meta={
          kisa.vuosi != null ? <Badge tone="brand">{kisa.vuosi}</Badge> : undefined
        }
      />

      <SectionNav
        items={arkistoNav}
        label="Jalkapalloarkiston osiot"
        className="mt-8"
      />

      {hasFacts && (
        <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          <Fact label="Vuosi" value={kisa.vuosi?.toString()} />
          <Fact
            label={isannat.length > 1 ? "Isäntämaat" : "Isäntämaa"}
            value={isannat.join(", ")}
          />
          <Fact label="Voittaja" value={kisa.voittaja} />
          <Fact label="Suomen sijoitus" value={kisa.suomenSijoitus} />
        </dl>
      )}

      {kisa.kuvaus && kisa.kuvaus.length > 0 && (
        <div className="mt-12 max-w-3xl">
          <PortableText value={kisa.kuvaus} />
        </div>
      )}

      {tilastot.length > 0 && (
        <section aria-labelledby="tilastot" className="mt-16">
          <h2
            id="tilastot"
            className="font-serif text-2xl text-foreground sm:text-3xl"
          >
            Tilastot
          </h2>
          <div className="mt-6 space-y-10">
            {tilastot.map((tilasto) => (
              <TilastoSection key={tilasto._id} tilasto={tilasto} />
            ))}
          </div>
        </section>
      )}

      {kuvat.length > 0 && (
        <section aria-labelledby="kuvat" className="mt-16">
          <h2
            id="kuvat"
            className="font-serif text-2xl text-foreground sm:text-3xl"
          >
            Kuvat
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            {kuvat.map((kuva, index) => (
              <li key={kuva?.asset?._ref ?? index}>
                <figure>
                  <SanityImage
                    image={kuva}
                    width={900}
                    height={600}
                    sizes="(min-width: 640px) 45vw, 100vw"
                    className="h-auto w-full rounded-2xl object-cover"
                  />
                  {kuva?.caption && (
                    <figcaption className="mt-2 text-sm text-muted">
                      {kuva.caption}
                    </figcaption>
                  )}
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="muut-kisat" className="mt-16">
          <h2
            id="muut-kisat"
            className="font-serif text-2xl text-foreground sm:text-3xl"
          >
            Muita saman sarjan kisoja
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item._id}>
                <Card href={pathFor(item.slug)} className="h-full">
                  {item.vuosi != null && <CardEyebrow>{item.vuosi}</CardEyebrow>}
                  <CardTitle className="mt-1">{item.title}</CardTitle>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}

function TilastoSection({ tilasto }: { tilasto: TilastoTable }) {
  const columns: StatColumn[] = (tilasto.columns ?? []).map((column) => ({
    key: column.key,
    label: column.label,
    type: column.type ?? "text",
  }));
  const rows = (tilasto.rows ?? []).map((row) => ({ cells: row.cells ?? [] }));

  return (
    <div>
      <h3 className="font-serif text-xl text-foreground">{tilasto.title}</h3>
      {tilasto.tiivistelma && (
        <p className="mt-2 max-w-3xl text-muted">{tilasto.tiivistelma}</p>
      )}
      <StatTable
        caption={tilasto.title}
        columns={columns}
        rows={rows}
        className="mt-4"
        emptyLabel="Taulukkoon ei ole vielä lisätty rivejä."
      />
    </div>
  );
}

function Fact({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="bg-surface px-5 py-4">
      <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-base text-foreground">
        {value?.trim() ? value : "—"}
      </dd>
    </div>
  );
}
