import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { formatDate } from "@/lib/format";
import { breadcrumbSchema, datasetSchema } from "@/lib/schema-org";
import { buildMetadata, resolveDescription } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  arkistoTags,
  karsintaBySlugQuery,
  tilastoSlugsByCategoryQuery,
  type KarsintaDoc,
} from "@/sanity/lib/queries/arkisto";

import { ArkistoPage } from "../../_tilastot/arkisto-page";
import {
  arkistoTrail,
  huuhkajatPath,
  karsintaPath,
} from "../../_tilastot/helpers";
import { StatSections, TilastoBody } from "../../_tilastot/stat-sections";

export const revalidate = 3600;

const category = "karsinta";
const fallbackDescription =
  "Suomen maajoukkueen karsintasarjan ottelut, tulokset ja sarjataulukko Lahden Suomalaisen Klubin jalkapalloarkistossa.";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await sanityFetch<string[]>({
    query: tilastoSlugsByCategoryQuery,
    params: { category },
    tags: arkistoTags,
    fallback: [],
  });

  return slugs.filter(Boolean).map((slug) => ({ slug }));
}

async function getTilasto(slug: string): Promise<KarsintaDoc | null> {
  return sanityFetch<KarsintaDoc | null>({
    query: karsintaBySlugQuery,
    params: { slug },
    tags: arkistoTags,
    fallback: null,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tilasto = await getTilasto(slug);

  if (!tilasto) {
    return buildMetadata({
      title: "Karsintaa ei löytynyt",
      description: fallbackDescription,
      path: karsintaPath(slug),
      noIndex: true,
    });
  }

  return buildMetadata({
    title: tilasto.title,
    description: resolveDescription(tilasto.tiivistelma, fallbackDescription),
    path: karsintaPath(slug),
    modifiedAt: tilasto._updatedAt,
  });
}

export default async function KarsintaPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const tilasto = await getTilasto(slug);

  if (!tilasto) notFound();

  const path = karsintaPath(slug);
  const trail = arkistoTrail(
    { label: "Huuhkajat", href: huuhkajatPath },
    { label: tilasto.title },
  );

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          datasetSchema({
            title: tilasto.title,
            description: tilasto.tiivistelma ?? fallbackDescription,
            path,
            modifiedAt: tilasto._updatedAt,
          }),
        ]}
      />

      <ArkistoPage
        title={tilasto.title}
        lead={tilasto.tiivistelma}
        eyebrow="Karsinnat"
        breadcrumbs={trail}
        meta={
          tilasto._updatedAt ? (
            <p className="text-sm text-muted">
              Päivitetty{" "}
              <time dateTime={tilasto._updatedAt}>
                {formatDate(tilasto._updatedAt)}
              </time>
            </p>
          ) : undefined
        }
      >
        <TilastoBody
          tilasto={tilasto}
          ylinOtsikko={2}
          taulukonJalkeen={
            // Saman kauden muut sarjataulukot (Kansojen liiga) otteluiden
            // yhteyteen: taulukko ja sen ottelut ovat samalla sivulla.
            tilasto.kaudenTaulukot.length > 0 && (
              <StatSections
                tilastot={tilasto.kaudenTaulukot}
                kaudenOttelulinkki={false}
                className="mt-12"
              />
            )
          }
        />

        <p className="mt-12 text-muted">
          Kaikki karsintasarjat löytyvät{" "}
          <Link
            href={huuhkajatPath}
            className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            Huuhkajat-sivulta
          </Link>
          .
        </p>
      </ArkistoPage>
    </>
  );
}
