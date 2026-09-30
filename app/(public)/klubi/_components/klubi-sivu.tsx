import { EmptyState } from "./empty-state";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionNav } from "@/components/layout/section-nav";
import { PortableText } from "@/components/portable-text";
import { FramedImage } from "@/components/framed-image";
import { JsonLd } from "@/components/seo/json-ld";
import { klubiNav, rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, webPageSchema, type Crumb } from "@/lib/schema-org";
import { sanityFetch } from "@/sanity/lib/fetch";
import { klubiSivuQuery, type KlubiSivu } from "@/sanity/lib/queries/klubi";
import { StatSections } from "@/app/(public)/jalkapalloarkisto/_tilastot/stat-sections";

/**
 * Klubi-osion `sivu`-pohjaiset sivut (säännöt, palloveikkaus) renderöityvät
 * samalla rungolla. Yksi toteutus kahdelle reitille: jos otsikkotasot tai
 * murupolku muuttuvat, ne muuttuvat molemmilla yhtä aikaa.
 *
 * Sivu ei kutsu `notFound()`:ia kun dokumenttia ei ole: reitti on osa klubin
 * navigaatiota ja on olemassa ennen kuin isä on kirjoittanut sisällön. 404
 * antaisi ymmärtää että osoite on väärä — tyhjätila kertoo totuuden.
 */

/** Hakee klubi-osion `sivu`-dokumentin. Käytetään myös metadatassa. */
export function fetchKlubiSivu(slug: string) {
  return sanityFetch<KlubiSivu | null>({
    query: klubiSivuQuery,
    params: { slug },
    tags: ["sivu", `sivu:${slug}`],
    fallback: null,
  });
}

export function KlubiSivuPage({
  sivu,
  path,
  fallbackTitle,
  emptyDescription,
  children,
}: {
  sivu: KlubiSivu | null;
  path: string;
  /** Otsikko kun dokumenttia ei vielä ole Studiossa. */
  fallbackTitle: string;
  emptyDescription: string;
  /** Sivukohtainen lisäsisältö sisällön alle. */
  children?: React.ReactNode;
}) {
  const title = sivu?.title || fallbackTitle;
  const lead = sivu?.tiivistelma || sivu?.ingress || null;
  const trail: Crumb[] = [
    rootCrumb,
    { label: "Klubi", href: "/klubi" },
    { label: title },
  ];
  const hasBody = Boolean(sivu?.body && sivu.body.length > 0);

  return (
    <>
      <JsonLd
        schema={[
          webPageSchema({
            title,
            description: lead,
            path,
            modifiedAt: sivu?._updatedAt,
          }),
          breadcrumbSchema(trail),
        ]}
      />

      <Container className="py-12 sm:py-16">
        <PageHeader title={title} lead={lead} breadcrumbs={trail} />
        <SectionNav items={klubiNav} label="Klubin osiot" className="mt-8" />

        {sivu?.hero?.asset && (
          <figure className="mt-10 overflow-hidden rounded-2xl">
            <FramedImage
              image={sivu.hero}
              kuvateksti={sivu.hero?.caption}
              width={1600}
              sizes="(min-width: 1024px) 960px, 100vw"
              className="aspect-[16/9] w-full"
              priority
            />
            {sivu.hero.caption && (
              <figcaption className="mt-2 text-sm text-muted">
                {sivu.hero.caption}
              </figcaption>
            )}
          </figure>
        )}

        <div className="mt-10 max-w-3xl">
          {hasBody ? (
            <PortableText value={sivu?.body} />
          ) : (
            <EmptyState description={emptyDescription} />
          )}
        </div>

        {(sivu?.tilastot ?? []).filter(Boolean).length > 0 && (
          <section aria-labelledby="sivun-taulukot" className="mt-16">
            <h2 id="sivun-taulukot" className="font-display text-3xl leading-tight">
              Taulukot
            </h2>
            <StatSections
              tilastot={(sivu?.tilastot ?? []).filter(Boolean)}
              headingLevel="h3"
              className="mt-6"
            />
          </section>
        )}

        {children}
      </Container>
    </>
  );
}
