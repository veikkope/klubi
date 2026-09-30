import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { NewsCard } from "@/components/news-card";
import { JsonLd } from "@/components/seo/json-ld";
import { Tunnistelista } from "@/components/tunnistelista";
import { LinkButton } from "@/components/ui/button";
import { rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import {
  liittyvatTunnisteet,
  TUNNISTE_INDEKSOI_VAHINTAAN,
  TUNNISTEET_POLKU,
  type Tunniste,
} from "@/lib/tunnisteet";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  uutisetTunnisteellaQuery,
  type Paged,
  type UutinenListItem,
} from "@/sanity/lib/queries/uutiset";

import { Pagination } from "../../_components/pagination";
import { buildPath, pageCount, pageRange, parsePage, type SearchParamValue } from "../../_lib/paging";
import { haeTunniste, haeTunnisteet, kanoninenSlug } from "../../_lib/tunnisteet";

/**
 * Yhden tunnisteen uutiset (lib/tunnisteet.ts), blogin tunnistesivun
 * (/search/label/Huuhkajat) vastine. Blogin osoitteet ohjautuvat tänne
 * reitin app/blogspot/[[...polku]] kautta.
 */

export const revalidate = 3600;

const PER_PAGE = 12;

type Params = { tunniste: string };
type SearchParams = Record<string, SearchParamValue>;

function pathFor(slug: string, page: number) {
  return buildPath(`/uutiset/tunniste/${slug}`, { sivu: page > 1 ? page : null });
}

function maaraTeksti(maara: number) {
  return maara === 1 ? "1 kirjoitus" : `${maara} kirjoitusta`;
}

function kuvaus(tunniste: Tunniste) {
  return `Lahden Suomalainen Klubi ry:n kirjoitukset tunnisteella ${tunniste.nimi}: ${maaraTeksti(tunniste.maara)}, uusimmat ensin.`;
}

/** Tunniste parametrista. Ei-kanoninen muoto (isot kirjaimet, ääkköset) ohjataan pysyvästi. */
async function resolve(parametri: string, page: number): Promise<Tunniste> {
  const slug = kanoninenSlug(parametri);
  const tunniste = slug ? await haeTunniste(slug) : null;
  if (!tunniste) notFound();
  if (parametri !== slug) permanentRedirect(pathFor(slug, page));
  return tunniste;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { tunniste: parametri } = await params;
  const slug = kanoninenSlug(parametri);
  const tunniste = slug ? await haeTunniste(slug) : null;
  if (!tunniste) {
    return buildMetadata({ title: "Tunnistetta ei löytynyt", path: `/uutiset/tunniste/${parametri}`, noIndex: true });
  }
  const page = parsePage((await searchParams).sivu);
  const otsikko = `Tunniste: ${tunniste.nimi}`;
  return buildMetadata({
    title: page > 1 ? `${otsikko} — sivu ${page}` : otsikko,
    description: kuvaus(tunniste),
    path: pathFor(tunniste.slug, page),
    // Linkkejä seurataan silti (noFollow erikseen), jotta uutiset löytyvät.
    noIndex: tunniste.maara < TUNNISTE_INDEKSOI_VAHINTAAN,
  });
}

export default async function TunnistePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { tunniste: parametri } = await params;
  const page = parsePage((await searchParams).sivu);
  const tunniste = await resolve(parametri, page);
  const { start, end } = pageRange(page, PER_PAGE);

  const [result, { listat }] = await Promise.all([
    sanityFetch<Paged<UutinenListItem>>({
      query: uutisetTunnisteellaQuery,
      params: { nimet: tunniste.nimet, start, end },
      tags: ["uutinen"],
      fallback: { items: [], total: 0 },
    }),
    haeTunnisteet(),
  ]);
  const pages = pageCount(result.total, PER_PAGE);
  if (page > pages) notFound();

  const liittyvat = liittyvatTunnisteet(listat, tunniste.slug, 12);
  const path = pathFor(tunniste.slug, page);
  const trail = [
    rootCrumb,
    { label: "Uutiset", href: "/uutiset" },
    { label: "Tunnisteet", href: TUNNISTEET_POLKU },
    { label: tunniste.nimi },
  ];

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({
            title: `Tunniste: ${tunniste.nimi}`,
            description: kuvaus(tunniste),
            path,
            itemCount: result.total,
          }),
        ]}
      />

      <Container className="pt-12">
        <PageHeader
          eyebrow="Tunniste"
          title={tunniste.nimi}
          lead={`${maaraTeksti(result.total)} tunnisteella ${tunniste.nimi}. Uusimmat ensin.`}
          breadcrumbs={trail}
          actions={
            <LinkButton href={TUNNISTEET_POLKU} variant="secondary">
              Kaikki tunnisteet
            </LinkButton>
          }
        />
      </Container>

      <Container className="py-16">
        <h2 className="sr-only">Kirjoitukset</h2>
        <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((news, index) => (
            <li key={news._id} className="flex">
              <NewsCard news={news} priority={page === 1 && index < 3} />
            </li>
          ))}
        </ul>

        <Pagination
          page={page}
          pageCount={pages}
          hrefForPage={(target) => pathFor(tunniste.slug, target)}
          label={`Tunnisteen ${tunniste.nimi} sivutus`}
        />

        {liittyvat.length > 0 && (
          <nav aria-labelledby="liittyvat-tunnisteet" className="mt-16 border-t border-border pt-10">
            <h2 id="liittyvat-tunnisteet" className="font-display text-2xl">
              Liittyvät tunnisteet
            </h2>
            <p className="mt-2 text-sm text-muted">Aiheet, jotka esiintyvät usein samoissa kirjoituksissa.</p>
            <Tunnistelista
              className="mt-6"
              tunnisteet={liittyvat.map(({ nimi, maara }) => ({ nimi, maara }))}
            />
          </nav>
        )}
      </Container>
    </>
  );
}
