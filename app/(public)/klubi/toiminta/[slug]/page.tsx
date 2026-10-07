import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "../../_components/empty-state";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionNav } from "@/components/layout/section-nav";
import { PortableText } from "@/components/portable-text";
import { FramedImage } from "@/components/framed-image";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Nuoli } from "@/components/ui/nuoli";
import { formatDate } from "@/lib/format";
import { klubiNav, rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, webPageSchema, type Crumb } from "@/lib/schema-org";
import { buildMetadata, resolveDescription } from "@/lib/seo";
import { hasSanity } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/fetch";
import { StatSections } from "@/app/(public)/jalkapalloarkisto/_tilastot/stat-sections";
import {
  klubiToimintaBySlugQuery,
  klubiToimintaSiblingsQuery,
  klubiToimintaSlugsQuery,
  type KlubiToiminta,
  type KlubiToimintaCard,
} from "@/sanity/lib/queries/klubi";

export const revalidate = 3600;

type Params = { slug: string };

/** Sanity-projektia ei ole vielä luotu — silloin ei ole polkujakaan. */
export async function generateStaticParams(): Promise<Params[]> {
  if (!hasSanity) return [];
  const slugs = await sanityFetch<string[]>({
    query: klubiToimintaSlugsQuery,
    tags: ["klubiToiminta"],
    fallback: [],
  });
  return slugs.map((slug) => ({ slug }));
}

function getToiminta(slug: string) {
  return sanityFetch<KlubiToiminta | null>({
    query: klubiToimintaBySlugQuery,
    params: { slug },
    tags: ["klubiToiminta", `klubiToiminta:${slug}`],
    fallback: null,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const toiminta = await getToiminta(slug);
  if (!toiminta) return { robots: { index: false, follow: false } };

  return buildMetadata({
    title: toiminta.seoTitle || toiminta.title,
    description: resolveDescription(
      toiminta.seoDescription,
      toiminta.tiivistelma,
    ),
    path: `/klubi/toiminta/${toiminta.slug}`,
    image: toiminta.kuvat?.[0],
    sisalto: toiminta.kuvaus,
  });
}

export default async function ToimintaDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const toiminta = await getToiminta(slug);
  if (!toiminta) notFound();

  const siblings = await sanityFetch<Pick<KlubiToimintaCard, "_id" | "title" | "slug" | "tiivistelma">[]>({
    query: klubiToimintaSiblingsQuery,
    params: { slug },
    tags: ["klubiToiminta"],
    fallback: [],
  });

  const path = `/klubi/toiminta/${toiminta.slug}`;
  const trail: Crumb[] = [
    rootCrumb,
    { label: "Klubi", href: "/klubi" },
    { label: "Toiminta", href: "/klubi/toiminta" },
    { label: toiminta.title },
  ];

  const vuodet = toiminta.vuodet ?? [];
  const kuvat = (toiminta.kuvat ?? []).filter((kuva) => kuva?.asset);
  const hasKuvaus = Boolean(toiminta.kuvaus && toiminta.kuvaus.length > 0);
  const tilastot = (toiminta.tilastot ?? []).filter(Boolean);
  // Tyhjätila näytetään vain osiolle, jonka puuttuminen jättäisi sivun
  // tyhjäksi. Vanhoilla toimintasivuilla sisältö on usein pelkkinä
  // vuosimerkintöinä — silloin puuttuva yleiskuvaus ei ole virhe.
  const hasOtherContent = vuodet.length > 0 || kuvat.length > 0 || tilastot.length > 0;

  return (
    <>
      <JsonLd
        schema={[
          webPageSchema({
            title: toiminta.title,
            description: toiminta.tiivistelma,
            path,
            modifiedAt: toiminta._updatedAt,
          }),
          breadcrumbSchema(trail),
        ]}
      />

      <Container className="py-12 sm:py-16">
        <PageHeader
          title={toiminta.title}
          lead={toiminta.tiivistelma}
          eyebrow="Klubin toiminta"
          breadcrumbs={trail}
          meta={
            vuodet.length > 0 ? (
              <Badge tone="muted">
                {vuodet.length} {vuodet.length === 1 ? "vuosi" : "vuotta"}{" "}
                kirjattu
              </Badge>
            ) : undefined
          }
        />
        <SectionNav items={klubiNav} label="Klubin osiot" className="mt-8" />

        {(hasKuvaus || !hasOtherContent) && (
          <div className="mt-10 max-w-3xl">
            {hasKuvaus ? (
              <PortableText value={toiminta.kuvaus} />
            ) : (
              <EmptyState
                title="Kuvausta ei ole vielä lisätty"
                description="Tämän toimintamuodon esittely julkaistaan pian."
              />
            )}
          </div>
        )}

        {kuvat.length > 0 && (
          <section aria-labelledby="kuvat" className="mt-16">
            <h2 id="kuvat" className="font-display text-3xl leading-tight">
              Kuvat
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {kuvat.map((kuva, index) => (
                <li key={`${kuva?.asset?._ref ?? "kuva"}-${index}`}>
                  <figure>
                    <FramedImage
                      image={kuva}
                      kuvateksti={kuva?.caption}
                      width={900}
                      sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
                      className="h-56 w-full rounded-xl"
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

        {(vuodet.length > 0 || !(hasKuvaus || kuvat.length > 0 || tilastot.length > 0)) && (
          <section aria-labelledby="vuosittain" className="mt-16">
            <h2 id="vuosittain" className="font-display text-3xl leading-tight">
              Vuosittain
            </h2>

            {vuodet.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title="Vuosimerkintöjä ei ole vielä lisätty"
                  description="Vuosittaiset merkinnät julkaistaan tällä sivulla pian."
                />
              </div>
            ) : (
              <ol className="mt-6 space-y-8 border-l border-border pl-6">
                {vuodet.map((vuosi, index) => {
                  const vuosiKuvat = (vuosi.kuvat ?? []).filter(
                    (kuva) => kuva?.asset,
                  );
                  return (
                    <li
                      key={vuosi._key ?? `vuosi-${index}`}
                      className="relative"
                    >
                      <span
                        aria-hidden
                        className="absolute -left-[30px] top-2 size-3 rounded-full border-2 border-background bg-accent"
                      />
                      <h3 className="font-display text-2xl leading-tight">
                        {vuosi.vuosi ?? "Ajankohta ei tiedossa"}
                        {vuosi.otsikko && <> — {vuosi.otsikko}</>}
                        {vuosi.jarjestysnumero != null && (
                          <span className="ml-2 text-base text-muted">
                            ({vuosi.jarjestysnumero}.)
                          </span>
                        )}
                      </h3>
                      {(vuosi.paivamaara || vuosi.paikka) && (
                        <p className="mt-1 text-sm text-muted">
                          {[formatDate(vuosi.paivamaara), vuosi.paikka]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                      {vuosi.kuvaus && (
                        <p className="mt-3 max-w-3xl whitespace-pre-line leading-relaxed text-foreground">
                          {vuosi.kuvaus}
                        </p>
                      )}
                      {vuosi.linkki?.url && (
                        <p className="mt-2 text-sm">
                          <a
                            href={vuosi.linkki.url}
                            className="font-medium text-accent underline underline-offset-4 hover:no-underline"
                          >
                            {vuosi.linkki.teksti || vuosi.linkki.url}
                          </a>
                        </p>
                      )}
                      {vuosi.osallistujat && vuosi.osallistujat.length > 0 && (
                        <p className="mt-2 max-w-3xl text-sm text-muted">
                          <span className="font-medium text-foreground">
                            Osallistujat ({vuosi.osallistujat.length}):
                          </span>{" "}
                          {vuosi.osallistujat.join(", ")}
                        </p>
                      )}
                      {vuosiKuvat.length > 0 && (
                        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {vuosiKuvat.map((kuva, kuvaIndex) => (
                            <li key={`${kuva?.asset?._ref ?? "kuva"}-${kuvaIndex}`}>
                              <figure>
                                <FramedImage
                                  image={kuva}
                                  kuvateksti={kuva?.caption}
                                  width={800}
                                  sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
                                  className="h-44 w-full rounded-xl"
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
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        )}

        {tilastot.length > 0 && (
          <section aria-labelledby="toiminnan-tilastot" className="mt-16">
            <h2 id="toiminnan-tilastot" className="font-display text-3xl leading-tight">
              Tilastot
            </h2>
            <StatSections
              tilastot={tilastot}
              headingLevel="h3"
              className="mt-6"
            />
          </section>
        )}

        {siblings.length > 0 && (
          <section aria-labelledby="muu-toiminta" className="mt-16">
            <h2 id="muu-toiminta" className="font-display text-3xl leading-tight">
              Muuta klubin toimintaa
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {siblings.map((sibling) => (
                <li key={sibling._id}>
                  <Link
                    href={`/klubi/toiminta/${sibling.slug}`}
                    className="group/linkki flex min-h-11 items-center justify-between gap-3 rounded-xl border border-border bg-surface px-5 py-3 text-foreground transition hover:border-accent"
                  >
                    <span>{sibling.title}</span>
                    <Nuoli className="text-accent" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </>
  );
}
