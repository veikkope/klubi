import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { HUUHKAJAT_OSIOT, findHuuhkajatOsio } from "@/lib/huuhkajat-osiot";
import { huuhkajatOsioPath } from "@/lib/path";
import { breadcrumbSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  arkistoTags,
  huuhkajatHubQuery,
  huuhkajatOsioQuery,
  type HuuhkajatHub,
  type TilastoDoc,
} from "@/sanity/lib/queries/arkisto";
import { ohjaaTaiEiLoydy } from "@/sanity/lib/ohjaus";

import { ArkistoPage } from "../../_tilastot/arkisto-page";
import {
  arkistoTrail,
  datasetSchemas,
  huuhkajatPath,
  karsinnatAnchor,
} from "../../_tilastot/helpers";
import { StatSections } from "../../_tilastot/stat-sections";
import { groupByOsio, osioQueryParams } from "../osiot";

export const revalidate = 3600;

type Params = { osio: string };

const pillClass =
  "inline-flex min-h-11 items-center rounded-sm border border-border bg-surface px-4 text-sm text-muted transition hover:border-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function generateStaticParams(): Params[] {
  return HUUHKAJAT_OSIOT.map((osio) => ({ osio: osio.value }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { osio: value } = await params;
  const osio = findHuuhkajatOsio(value);

  if (!osio) {
    return buildMetadata({
      title: "Osiota ei löytynyt",
      description:
        "Pyydettyä Huuhkajat-osiota ei löytynyt jalkapalloarkistosta. Katso kaikki osiot Huuhkajat-sivulta.",
      path: huuhkajatOsioPath(value),
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${osio.title} – Huuhkajat`,
    description: osio.description,
    path: huuhkajatOsioPath(osio.value),
  });
}

export default async function HuuhkajatOsioPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { osio: value } = await params;
  const osio = findHuuhkajatOsio(value);
  if (!osio) return ohjaaTaiEiLoydy(huuhkajatOsioPath(value));

  const [tilastot, hub] = await Promise.all([
    sanityFetch<TilastoDoc[]>({
      query: huuhkajatOsioQuery,
      params: osioQueryParams(osio.value),
      tags: arkistoTags,
      fallback: [],
    }),
    // Sisarosioiden navigaatio näyttää vain osiot, joissa on sisältöä.
    sanityFetch<HuuhkajatHub>({
      query: huuhkajatHubQuery,
      tags: arkistoTags,
      fallback: { taulukot: [], karsinnat: [] },
    }),
  ]);

  // Tyhjää osiota ei julkaista: hub ei linkitä siihen eikä sitemap listaa sitä.
  if (tilastot.length === 0) return ohjaaTaiEiLoydy(huuhkajatOsioPath(value));

  const path = huuhkajatOsioPath(osio.value);
  const trail = arkistoTrail(
    { label: "Huuhkajat", href: huuhkajatPath },
    { label: osio.title },
  );
  const siblings = groupByOsio(hub.taulukot).filter((item) => item.value !== osio.value);
  const jumpLinks = tilastot.filter((tilasto) => Boolean(tilasto.slug));

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          ...datasetSchemas({
            tilastot,
            path,
            title: osio.title,
            description: osio.description,
          }),
        ]}
      />

      <ArkistoPage
        title={osio.title}
        lead={osio.lead}
        eyebrow={osio.hubKohta === "karsinnat" ? "Karsintasarjat" : "Huuhkajat"}
        breadcrumbs={trail}
      >
        {jumpLinks.length > 1 && (
          <nav
            aria-labelledby="sisalto-otsikko"
            className="mb-12 rounded-sm border border-border bg-surface p-6"
          >
            <h2
              id="sisalto-otsikko"
              className="font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-soft"
            >
              Tällä sivulla
            </h2>
            <ol className="mt-3 grid gap-x-6 sm:grid-cols-2">
              {jumpLinks.map((tilasto) => (
                <li key={tilasto._id}>
                  <a
                    href={`#${tilasto.slug}`}
                    className="inline-flex min-h-11 items-center text-accent underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {tilasto.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <StatSections tilastot={tilastot} />

        <nav aria-labelledby="muut-osiot" className="mt-16">
          <h2
            id="muut-osiot"
            className="font-display text-2xl leading-tight text-foreground sm:text-3xl"
          >
            Muut Huuhkajat-tilastot
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {siblings.map((item) => (
              <li key={item.value}>
                <Link href={item.href} className={pillClass}>
                  {item.title}
                </Link>
              </li>
            ))}
            {hub.karsinnat.length > 0 && (
              <li>
                <Link href={`${huuhkajatPath}#${karsinnatAnchor}`} className={pillClass}>
                  Karsintasarjat
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </ArkistoPage>
    </>
  );
}
