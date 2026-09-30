import type { Metadata } from "next";

import { EmptyState } from "../_components/empty-state";
import { fetchKlubiSivu } from "../_components/klubi-sivu";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionNav } from "@/components/layout/section-nav";
import { PortableText } from "@/components/portable-text";
import { SanityImage } from "@/components/sanity-image";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Card, CardArrow, CardBody, CardTitle } from "@/components/ui/card";
import { klubiNav, rootCrumb } from "@/lib/nav-sections";
import {
  breadcrumbSchema,
  collectionPageSchema,
  type Crumb,
} from "@/lib/schema-org";
import { buildMetadata, resolveDescription } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  klubiToimintaListQuery,
  type KlubiToimintaCard,
} from "@/sanity/lib/queries/klubi";

export const revalidate = 3600;

const PATH = "/klubi/toiminta";
/**
 * Hubin johdanto on valinnainen `sivu`-dokumentti. Näin isä voi kirjoittaa
 * listaukselle saatteen Studiossa ilman että kukaan koskee koodiin — ja
 * ilman sitä sivu on silti ehjä, koska kortit ovat sivun varsinainen sisältö.
 */
const SIVU_SLUG = "klubi/toiminta";
const FALLBACK_TITLE = "Toiminta";

function getToiminnat() {
  return sanityFetch<KlubiToimintaCard[]>({
    query: klubiToimintaListQuery,
    tags: ["klubiToiminta"],
    fallback: [],
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const sivu = await fetchKlubiSivu(SIVU_SLUG);
  return buildMetadata({
    title: sivu?.seoTitle || sivu?.title || FALLBACK_TITLE,
    description: resolveDescription(
      sivu?.seoDescription,
      sivu?.tiivistelma,
      sivu?.ingress,
    ),
    path: PATH,
  });
}

export default async function ToimintaPage() {
  const [sivu, toiminnat] = await Promise.all([
    fetchKlubiSivu(SIVU_SLUG),
    getToiminnat(),
  ]);

  const title = sivu?.title || FALLBACK_TITLE;
  const lead = sivu?.tiivistelma || sivu?.ingress || null;
  const trail: Crumb[] = [
    rootCrumb,
    { label: "Klubi", href: "/klubi" },
    { label: title },
  ];

  return (
    <>
      <JsonLd
        schema={[
          collectionPageSchema({
            title,
            description: lead,
            path: PATH,
            itemCount: toiminnat.length,
          }),
          breadcrumbSchema(trail),
        ]}
      />

      <Container className="py-12 sm:py-16">
        <PageHeader title={title} lead={lead} breadcrumbs={trail} />
        <SectionNav items={klubiNav} label="Klubin osiot" className="mt-8" />

        {sivu?.body && sivu.body.length > 0 && (
          <div className="mt-10 max-w-3xl">
            <PortableText value={sivu.body} />
          </div>
        )}

        {toiminnat.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="Toimintamuotoja ei ole vielä lisätty"
              description="Sisältöä ei ole vielä lisätty Studiossa. Toimintamuodot lisätään Sanity Studiossa kohtaan “Klubin toiminta”."
            />
          </div>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {toiminnat.map((toiminta) => (
              <li key={toiminta._id}>
                <Card href={`/klubi/toiminta/${toiminta.slug}`} className="h-full">
                  {toiminta.kuva?.asset && (
                    <SanityImage
                      image={toiminta.kuva}
                      width={800}
                      height={500}
                      sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
                      className="mb-4 h-44 w-full rounded-xl object-cover"
                    />
                  )}
                  <CardTitle as="h2">{toiminta.title}</CardTitle>
                  {toiminta.tiivistelma && (
                    <CardBody className="mt-2 text-sm">
                      {toiminta.tiivistelma}
                    </CardBody>
                  )}
                  {(toiminta.uusinVuosi || toiminta.vuosiMaara) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {toiminta.uusinVuosi ? (
                        <Badge tone="brand">
                          Viimeksi {toiminta.uusinVuosi}
                        </Badge>
                      ) : null}
                      {toiminta.vuosiMaara ? (
                        <Badge tone="muted">
                          {toiminta.vuosiMaara}{" "}
                          {toiminta.vuosiMaara === 1 ? "vuosi" : "vuotta"}{" "}
                          kirjattu
                        </Badge>
                      ) : null}
                    </div>
                  )}
                  <CardArrow />
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
