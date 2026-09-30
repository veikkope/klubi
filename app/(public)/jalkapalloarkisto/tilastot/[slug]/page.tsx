import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, datasetSchema } from "@/lib/schema-org";
import { buildMetadata, resolveDescription } from "@/lib/seo";
import { hasSanity } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  arkistoTags,
  tilastoBySlugQuery,
  tilastoSlugsByCategoryQuery,
  type TilastoDoc,
} from "@/sanity/lib/queries/arkisto";

import { ArkistoPage } from "../../_tilastot/arkisto-page";
import {
  arkistoTrail,
  muuTilastoPath,
  muutTilastotPath,
} from "../../_tilastot/helpers";
import { TilastoBody } from "../../_tilastot/stat-sections";

export const revalidate = 3600;

/**
 * Yksittäinen "Muu tilasto" -kooste omalla sivullaan (vanhat
 * unohtumattomat.htm ja puutteellisetjarjestelyt.htm). Muut kategoriat
 * näkyvät listaussivuillaan osioina; tämä reitti palvelee vain kategoriaa `muu`.
 */
const category = "muu";
const fallbackDescription = "Kooste Lahden Suomalaisen Klubin jalkapalloarkistosta.";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  if (!hasSanity) return [];
  const slugs = await sanityFetch<string[]>({
    query: tilastoSlugsByCategoryQuery,
    params: { category },
    tags: arkistoTags,
    fallback: [],
  });
  return slugs.filter(Boolean).map((slug) => ({ slug }));
}

async function getTilasto(slug: string): Promise<TilastoDoc | null> {
  return sanityFetch<TilastoDoc | null>({
    query: tilastoBySlugQuery,
    params: { category, slug },
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
      title: "Koostetta ei löytynyt",
      description: fallbackDescription,
      path: muuTilastoPath(slug),
      noIndex: true,
    });
  }

  return buildMetadata({
    title: tilasto.title,
    description: resolveDescription(tilasto.tiivistelma, fallbackDescription),
    path: muuTilastoPath(slug),
    modifiedAt: tilasto._updatedAt,
  });
}

export default async function MuuTilastoPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const tilasto = await getTilasto(slug);
  if (!tilasto) notFound();

  const path = muuTilastoPath(slug);
  const trail = arkistoTrail(
    { label: "Muut tilastot", href: muutTilastotPath },
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
        breadcrumbs={trail}
      >
        <TilastoBody tilasto={tilasto} ylinOtsikko={2} />

        <p className="mt-12 text-muted">
          Muut koosteet löytyvät{" "}
          <Link
            href={muutTilastotPath}
            className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            Muut tilastot -sivulta
          </Link>
          .
        </p>
      </ArkistoPage>
    </>
  );
}
