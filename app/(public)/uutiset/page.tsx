import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";

import { CategoryFilter } from "@/components/category-filter";
import { HakuNakyma, HakuTulokset } from "@/components/hakunakyma";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { NewsCard } from "@/components/news-card";
import { Uutishaku } from "@/components/uutishaku";
import { JsonLd } from "@/components/seo/json-ld";
import { LinkButton } from "@/components/ui/button";
import { rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema-org";
import { hakusanat, siistiHaku } from "@/lib/haku";
import { buildMetadata } from "@/lib/seo";
import { tunnisteHref, tunnisteSlug, TUNNISTEET_POLKU } from "@/lib/tunnisteet";
import { haeKategoria, haeKaytetytKategoriat, type KategoriaSivulle } from "@/lib/uutinen-categories";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  uutisetHakuQuery,
  uutisetPageQuery,
  type Paged,
  type UutinenListItem,
} from "@/sanity/lib/queries/uutiset";

import { Pagination } from "./_components/pagination";
import { haeTunniste } from "./_lib/tunnisteet";
import {
  buildPath,
  firstParam,
  pageCount,
  pageRange,
  parsePage,
  type SearchParamValue,
} from "./_lib/paging";

export const revalidate = 3600;

const PER_PAGE = 12;

const LEAD =
  "Klubin tiedotteet, tapahtumat ja ottelutapahtumat sekä jalkapallo- ja " +
  "ravintola-aiheiset kirjoitukset. Uusimmat ensin.";

type SearchParams = Record<string, SearchParamValue>;

/**
 * Yhteinen luku kyselystä ja metadatasta, jotta ne eivät voi erkaantua.
 * Kategoria haetaan Sanitysta (`uutisKategoria`); tuntematon arvo = kaikki.
 */
async function readParams(searchParams: SearchParams) {
  const category: KategoriaSivulle | null = await haeKategoria(firstParam(searchParams.kategoria));
  const page = parsePage(searchParams.sivu);
  // Haku (lib/haku.ts): `haku` näytetään, `terms` menee kyselyyn. Liian lyhyt
  // syöte (esim. "a") antaa tyhjät termit, jolloin näytetään tavallinen lista.
  const haku = siistiHaku(firstParam(searchParams.q));
  const terms = hakusanat(haku);
  return { category, page, haku, terms };
}

function pathFor(category: { value: string } | null, page: number, haku = "") {
  return buildPath("/uutiset", {
    q: haku || null,
    kategoria: category?.value ?? null,
    sivu: page > 1 ? page : null,
  });
}

function titleFor(category: KategoriaSivulle | null, page: number, haku = "") {
  const aihe = category ? `Uutiset: ${category.label}` : "Uutiset";
  const base = haku ? `Haku “${haku}”${category ? ` (${category.label})` : ""}` : aihe;
  return page > 1 ? `${base} — sivu ${page}` : base;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { category, page, haku, terms } = await readParams(await searchParams);

  // Hakutulokset eivät ole omaa sisältöä: ei hakukoneisiin, mutta linkit seurataan.
  if (terms.length > 0) {
    return buildMetadata({
      title: titleFor(category, page, haku),
      description: `Hakutulokset uutisista haulla “${haku}”.`,
      path: pathFor(category, page, haku),
      noIndex: true,
    });
  }

  return buildMetadata({
    title: titleFor(category, page),
    description: category
      ? category.kuvaus?.trim() ||
        `Lahden Suomalainen Klubi ry:n uutiset aiheesta ${category.label.toLowerCase()}. Uusimmat kirjoitukset ensin.`
      : LEAD,
    // Sivutetut näkymät ovat aitoja osajoukkoja, joten kanoninen osoite
    // osoittaa sivuun itseensä. Niitä ei merkitä noindexiksi, koska
    // `buildMetadata` kytkee noindexin ja nofollow'n yhteen — silloin
    // syvempien sivujen uutiset jäisivät crawlerilta löytymättä.
    path: pathFor(category, page),
  });
}

export default async function UutisetPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { category, page, haku, terms } = await readParams(params);
  // Kategorian aiempi polku (esim. yhdistetty ?kategoria=jasentieto) → nykyinen.
  if (category && category.value !== firstParam(params.kategoria)) {
    permanentRedirect(pathFor(category, 1, siistiHaku(firstParam(params.q))));
  }
  const { start, end } = pageRange(page, PER_PAGE);
  const hakee = terms.length > 0;

  const [result, kategoriat, hakuTunniste] = await Promise.all([
    sanityFetch<Paged<UutinenListItem>>({
      query: hakee ? uutisetHakuQuery : uutisetPageQuery,
      params: hakee
        ? { category: category?._id ?? null, terms, start, end }
        : { category: category?._id ?? null, start, end },
      tags: ["uutinen", "uutisKategoria"],
      fallback: { items: [], total: 0 },
    }),
    haeKaytetytKategoriat(),
    // Haku on täsmälleen jokin tunniste ("huuhkajat") → vinkki sen sivulle.
    hakee && tunnisteSlug(haku) ? haeTunniste(tunnisteSlug(haku)) : null,
  ]);

  const total = result.total;
  const pages = pageCount(total, PER_PAGE);
  const path = pathFor(category, page, hakee ? haku : "");

  const trail = category
    ? [
        rootCrumb,
        { label: "Uutiset", href: "/uutiset" },
        { label: category.label },
      ]
    : [rootCrumb, { label: "Uutiset" }];

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({
            title: titleFor(category, page),
            description: LEAD,
            path,
            itemCount: total,
          }),
        ]}
      />

      <Container className="pt-12">
        <PageHeader
          title="Uutiset"
          lead={LEAD}
          breadcrumbs={trail}
          actions={
            <>
              <LinkButton href="/uutiset/arkisto" variant="secondary">
                Selaa vuosiarkistoa
              </LinkButton>
              <LinkButton href={TUNNISTEET_POLKU} variant="secondary">
                Selaa tunnisteita
              </LinkButton>
            </>
          }
        />
      </Container>

      <HakuNakyma polku="/uutiset" tila={pathFor(category, page, haku)}>
        <Container>
          <div className="mt-8">
            <Uutishaku haku={haku} kategoria={category?.value ?? null} />
          </div>

          <div className="mt-6">
            <CategoryFilter
              active={category?.value ?? null}
              basePath="/uutiset"
              kategoriat={kategoriat}
              haku={hakee ? haku : undefined}
            />
          </div>
        </Container>

        <Container className="py-16">
          <HakuTulokset>
            <h2 className="font-display text-2xl sm:text-3xl">
              {hakee
                ? `Hakutulokset: “${haku}”`
                : category
                  ? category.label
                  : "Kaikki uutiset"}
            </h2>
            <p aria-live="polite" className="mt-2 text-sm text-muted">
              {haku && !hakee && "Kirjoita hakuun vähintään kaksi merkkiä. "}
              {total === 0
                ? "Ei kirjoituksia."
                : total === 1
                  ? "1 kirjoitus."
                  : `${total} kirjoitusta.`}
              {hakee && total > 0 && ` Osuvimmat ensin${category ? `, kategoriassa ${category.label.toLowerCase()}` : ""}.`}
            </p>

            {hakuTunniste && (
              <p className="mt-4 text-sm">
                <Link
                  href={tunnisteHref(hakuTunniste.nimi) ?? TUNNISTEET_POLKU}
                  className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
                >
                  Kaikki kirjoitukset tunnisteella {hakuTunniste.nimi} ({hakuTunniste.maara})
                </Link>
              </p>
            )}

            {result.items.length === 0 ? (
              hakee ? (
                <HakuEiTuloksia haku={haku} category={category} />
              ) : (
                <EmptyState category={category} />
              )
            ) : (
              <>
                <ul className="mt-8 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
                  {result.items.map((news, index) => (
                    <li key={news._id} className="flex">
                      <NewsCard news={news} eager={page === 1 && index < 3} />
                    </li>
                  ))}
                </ul>

                <Pagination
                  page={page}
                  pageCount={pages}
                  hrefForPage={(target) => pathFor(category, target, hakee ? haku : "")}
                  label="Uutisten sivutus"
                />
              </>
            )}
          </HakuTulokset>
        </Container>
      </HakuNakyma>
    </>
  );
}

function HakuEiTuloksia({ haku, category }: { haku: string; category: KategoriaSivulle | null }) {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <p className="font-display text-2xl">Haulla “{haku}” ei löytynyt uutisia</p>
      <p className="mx-auto mt-2 max-w-md text-muted">
        Kokeile lyhyempää tai toista sanaa. Useamman sanan haussa kaikkien sanojen pitää
        löytyä samasta uutisesta.
        {category && " Haku on rajattu valittuun kategoriaan."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {category && (
          <LinkButton href={pathFor(null, 1, haku)} variant="secondary">
            Hae kaikista kategorioista
          </LinkButton>
        )}
        <LinkButton href="/uutiset" variant="secondary">
          Kaikki uutiset
        </LinkButton>
      </div>
    </div>
  );
}

function EmptyState({ category }: { category: KategoriaSivulle | null }) {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <p className="font-display text-2xl">
        {category ? "Ei uutisia tästä kategoriasta" : "Ei vielä uutisia"}
      </p>
      <p className="mx-auto mt-2 max-w-md text-muted">
        {category
          ? "Kokeile toista kategoriaa tai palaa kaikkiin uutisiin."
          : "Uutiset lisätään Sanity Studiossa. Heti kun ensimmäinen uutinen on julkaistu, se ilmestyy tähän."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {category && (
          <LinkButton href="/uutiset" variant="secondary">
            Kaikki uutiset
          </LinkButton>
        )}
        <LinkButton href="/uutiset/arkisto" variant="secondary">
          Vuosiarkisto
        </LinkButton>
      </div>
    </div>
  );
}
