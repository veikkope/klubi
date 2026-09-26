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
import { formatDate } from "@/lib/format";
import { arkistoNav, rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, personSchema } from "@/lib/schema-org";
import { buildMetadata, resolveDescription } from "@/lib/seo";
import { hasSanity } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/fetch";
import { urlForImage } from "@/sanity/lib/image";
import {
  pelaajaBySlugQuery,
  pelaajaSlugsQuery,
  pelaajatRelatedQuery,
  pelipaikkaLabel,
  withSlug,
  type PelaajaCard,
  type PelaajaFull,
  type PelaajaSeura,
} from "@/sanity/lib/queries/arkisto-laajennus";

export const revalidate = 3600;

type Params = { slug: string };

const LIST_PATH = "/jalkapalloarkisto/pelaajat";

function pathFor(slug: string): string {
  return `${LIST_PATH}/${slug}`;
}

export async function generateStaticParams(): Promise<Params[]> {
  if (!hasSanity) return [];
  const slugs = await sanityFetch<string[]>({
    query: pelaajaSlugsQuery,
    tags: ["pelaaja"],
    fallback: [],
  });
  return slugs.filter(Boolean).map((slug) => ({ slug }));
}

async function getPelaaja(slug: string) {
  return sanityFetch<PelaajaFull | null>({
    query: pelaajaBySlugQuery,
    params: { slug },
    tags: ["pelaaja", `pelaaja:${slug}`],
    fallback: null,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pelaaja = await getPelaaja(slug);

  if (!pelaaja) {
    return buildMetadata({
      title: "Sivua ei löytynyt",
      path: pathFor(slug),
      noIndex: true,
    });
  }

  return buildMetadata({
    title: pelaaja.seoTitle || pelaaja.name,
    description: resolveDescription(
      pelaaja.seoDescription,
      pelaaja.tiivistelma,
    ),
    path: pathFor(slug),
    image: pelaaja.kuvat?.[0],
    modifiedAt: pelaaja._updatedAt,
  });
}

/** Seurahistoria aikajanalle: tuorein ensin, vuodettomat loppuun. */
function sortSeurat(seurat: PelaajaSeura[]): PelaajaSeura[] {
  return [...seurat].sort((a, b) => {
    const aStart = a.alkuvuosi ?? Number.NEGATIVE_INFINITY;
    const bStart = b.alkuvuosi ?? Number.NEGATIVE_INFINITY;
    return bStart - aStart;
  });
}

/** "1992–1999", "2015–" tai "2015" riippuen siitä mitä vuosia on tiedossa. */
function seuraVuodet(seura: PelaajaSeura): string | null {
  const { alkuvuosi, loppuvuosi } = seura;
  if (alkuvuosi != null && loppuvuosi != null) {
    return alkuvuosi === loppuvuosi
      ? `${alkuvuosi}`
      : `${alkuvuosi}–${loppuvuosi}`;
  }
  if (alkuvuosi != null) return `${alkuvuosi}–`;
  if (loppuvuosi != null) return `–${loppuvuosi}`;
  return null;
}

export default async function PelaajaPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const pelaaja = await getPelaaja(slug);
  if (!pelaaja) notFound();

  const related = withSlug(
    await sanityFetch<PelaajaCard[]>({
      query: pelaajatRelatedQuery,
      params: { slug },
      tags: ["pelaaja"],
      fallback: [],
    }),
  );

  const path = pathFor(slug);
  const trail = [
    rootCrumb,
    { label: "Jalkapalloarkisto", href: "/jalkapalloarkisto" },
    { label: "Pelaajat", href: LIST_PATH },
    { label: pelaaja.name },
  ];

  const paikka = pelipaikkaLabel(pelaaja.pelipaikka);
  const kuvat = (pelaaja.kuvat ?? []).filter(Boolean);
  const paakuva = kuvat[0];
  const lisakuvat = kuvat.slice(1);
  const seurat = sortSeurat((pelaaja.seurat ?? []).filter(Boolean));
  const description = resolveDescription(
    pelaaja.seoDescription,
    pelaaja.tiivistelma,
  );

  const hasFacts = Boolean(
    pelaaja.syntymaaika ||
      paikka ||
      pelaaja.maaottelut != null ||
      pelaaja.maalit != null,
  );

  return (
    <Container className="py-12 sm:py-16">
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          personSchema({
            name: pelaaja.name,
            description,
            path,
            birthDate: pelaaja.syntymaaika,
            image: paakuva
              ? (urlForImage(paakuva)?.width(1200).height(900).url() ?? null)
              : null,
          }),
        ]}
      />

      <PageHeader
        eyebrow="Pelaaja"
        title={pelaaja.name}
        lead={pelaaja.tiivistelma}
        breadcrumbs={trail}
        meta={paikka ? <Badge tone="brand">{paikka}</Badge> : undefined}
      />

      <SectionNav
        items={arkistoNav}
        label="Jalkapalloarkiston osiot"
        className="mt-8"
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
        {paakuva?.asset && (
          <figure className="overflow-hidden rounded-2xl">
            <SanityImage
              image={paakuva}
              width={900}
              height={1100}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="h-auto w-full object-cover"
              priority
            />
            {paakuva.caption && (
              <figcaption className="mt-2 text-sm text-muted">
                {paakuva.caption}
              </figcaption>
            )}
          </figure>
        )}

        <div>
          {hasFacts && (
            <dl className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
              <Fact label="Syntymäaika" value={formatDate(pelaaja.syntymaaika)} />
              <Fact label="Pelipaikka" value={paikka} />
              <Fact
                label="Maaottelut"
                value={pelaaja.maaottelut?.toString()}
                numeric
              />
              <Fact
                label="Maalit maajoukkueessa"
                value={pelaaja.maalit?.toString()}
                numeric
              />
            </dl>
          )}

          {pelaaja.kuvaus && pelaaja.kuvaus.length > 0 && (
            <div className="mt-8">
              <PortableText value={pelaaja.kuvaus} />
            </div>
          )}
        </div>
      </div>

      {seurat.length > 0 && (
        <section aria-labelledby="seurahistoria" className="mt-16">
          <h2
            id="seurahistoria"
            className="font-serif text-2xl text-foreground sm:text-3xl"
          >
            Seurahistoria
          </h2>
          <ol className="mt-6 border-l border-border">
            {seurat.map((seura, index) => {
              const vuodet = seuraVuodet(seura);
              return (
                <li
                  key={seura._key ?? `${seura.seura}-${index}`}
                  className="relative py-3 pl-6"
                >
                  <span
                    aria-hidden
                    className="absolute left-0 top-5 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-accent"
                  />
                  <p className="font-medium text-foreground">{seura.seura}</p>
                  {vuodet && (
                    <p className="text-sm tabular-nums text-muted">{vuodet}</p>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {lisakuvat.length > 0 && (
        <section aria-labelledby="pelaajan-kuvat" className="mt-16">
          <h2
            id="pelaajan-kuvat"
            className="font-serif text-2xl text-foreground sm:text-3xl"
          >
            Kuvat
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lisakuvat.map((kuva, index) => (
              <li key={kuva?.asset?._ref ?? index}>
                <figure>
                  <SanityImage
                    image={kuva}
                    width={800}
                    height={600}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
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
        <section aria-labelledby="muut-pelaajat" className="mt-16">
          <h2
            id="muut-pelaajat"
            className="font-serif text-2xl text-foreground sm:text-3xl"
          >
            Muita pelaajia arkistossa
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item._id}>
                <Card href={pathFor(item.slug)} className="h-full">
                  {pelipaikkaLabel(item.pelipaikka) && (
                    <CardEyebrow>{pelipaikkaLabel(item.pelipaikka)}</CardEyebrow>
                  )}
                  <CardTitle className="mt-1">{item.name}</CardTitle>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}

function Fact({
  label,
  value,
  numeric = false,
}: {
  label: string;
  value?: string | null;
  numeric?: boolean;
}) {
  return (
    <div className="bg-surface px-5 py-4">
      <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
        {label}
      </dt>
      <dd
        className={
          numeric
            ? "mt-1 text-base tabular-nums text-foreground"
            : "mt-1 text-base text-foreground"
        }
      >
        {value?.trim() ? value : "—"}
      </dd>
    </div>
  );
}
