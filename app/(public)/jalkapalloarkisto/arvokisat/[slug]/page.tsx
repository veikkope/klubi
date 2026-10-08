import type { Metadata } from "next";

import { PortableText } from "@/components/portable-text";
import { FramedImage } from "@/components/framed-image";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionNav } from "@/components/layout/section-nav";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
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
} from "@/sanity/lib/queries/arkisto-laajennus";
import { ohjaaTaiEiLoydy } from "@/sanity/lib/ohjaus";

import { StatSections } from "../../_tilastot/stat-sections";

/** 11.06.2010 — sama näyttömuoto kuin vanhalla sivustolla ja arkiston taulukoissa. */
function formatPvm(iso?: string | null): string | null {
  const match = iso ? /^(\d{4})-(\d{2})-(\d{2})/.exec(iso) : null;
  return match ? `${match[3]}.${match[2]}.${match[1]}` : null;
}

function ajankohta(kisa: ArvokisaFull): string | null {
  const alku = formatPvm(kisa.alkuPvm);
  const loppu = formatPvm(kisa.loppuPvm);
  if (alku && loppu) return `${alku}–${loppu}`;
  return alku ?? loppu;
}

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
    sisalto: kisa.kuvaus,
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
  if (!kisa) return ohjaaTaiEiLoydy(`/jalkapalloarkisto/arvokisat/${slug}`);

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
  const aika = ajankohta(kisa);
  const facts: { label: string; value: string | null | undefined }[] = [
    { label: "Vuosi", value: kisa.vuosi?.toString() },
    { label: "Ajankohta", value: aika },
    { label: isannat.length > 1 ? "Isäntämaat" : "Isäntämaa", value: isannat.join(", ") },
    { label: "Voittaja", value: kisa.voittaja },
    { label: "Hopea", value: kisa.hopea },
    { label: "Pronssi", value: kisa.pronssi },
    { label: "Suomen sijoitus", value: kisa.suomenSijoitus },
  ].filter((fact) => fact.value?.trim());
  const hasFacts = facts.length > 0;

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
          {facts.map((fact) => (
            <Fact key={fact.label} label={fact.label} value={fact.value} />
          ))}
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
            className="font-display text-2xl text-foreground sm:text-3xl"
          >
            Tilastot
          </h2>
          <StatSections tilastot={tilastot} headingLevel="h3" className="mt-6" />
        </section>
      )}

      {kuvat.length > 0 && (
        <section aria-labelledby="kuvat" className="mt-16">
          <h2
            id="kuvat"
            className="font-display text-2xl text-foreground sm:text-3xl"
          >
            Kuvat
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            {kuvat.map((kuva, index) => (
              <li key={kuva?._key ?? index}>
                <figure>
                  <FramedImage
                    image={kuva}
                    kuvateksti={kuva?.caption}
                    width={900}
                    sizes="(min-width: 640px) 45vw, 100vw"
                    className="aspect-[3/2] w-full rounded-2xl"
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
            className="font-display text-2xl text-foreground sm:text-3xl"
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

function Fact({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="bg-surface px-5 py-4">
      <dt className="font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-soft">
        {label}
      </dt>
      <dd className="mt-1 text-base text-foreground">
        {value?.trim() ? value : "—"}
      </dd>
    </div>
  );
}
