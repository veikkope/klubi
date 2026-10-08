import type { Metadata } from "next";
import { UusiValilehti } from "@/components/ui/uusi-valilehti";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { NewsCard } from "@/components/news-card";
import { PortableText } from "@/components/portable-text";
import { FramedImage } from "@/components/framed-image";
import { UutisenTunnisteet } from "@/components/tunnistelista";
import { JsonLd } from "@/components/seo/json-ld";
import { JaaPainike } from "@/components/jaa-painike";
import { KuvaSiirtyma } from "@/components/sivunvaihto";
import { Nuoli } from "@/components/ui/nuoli";
import {
  ensimmainenKappaleIngressiksi,
  lukuaika,
  tiivistelmaToistaaTekstin,
} from "@/lib/artikkeli";
import { formatDate } from "@/lib/format";
import { rootCrumb } from "@/lib/nav-sections";
import { siteUrl } from "@/lib/site";
import { articleSchema, breadcrumbSchema } from "@/lib/schema-org";
import { buildMetadata, resolveDescription, resolveOgImage } from "@/lib/seo";
import { korttiOte } from "@/lib/sisaltolohkot";
import { KommentitOsio } from "../_kommentit/kommentit-osio";
import { hasSanity } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  relatedUutisetQuery,
  uutinenDetailQuery,
  uutinenSlugsQuery,
  type UutinenDetail,
  type UutinenListItem,
  type UutinenNaapuri,
} from "@/sanity/lib/queries/uutiset";

export const revalidate = 3600;

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  if (!hasSanity) return [];
  const slugs = await sanityFetch<string[]>({
    query: uutinenSlugsQuery,
    tags: ["uutinen"],
    fallback: [],
  });
  return slugs.map((slug) => ({ slug }));
}

async function getUutinen(slug: string) {
  return sanityFetch<UutinenDetail | null>({
    query: uutinenDetailQuery,
    params: { slug },
    tags: ["uutinen", `uutinen:${slug}`],
    fallback: null,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const news = await getUutinen(slug);

  if (!news) {
    return buildMetadata({
      title: "Uutista ei löytynyt",
      path: `/uutiset/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: news.seoTitle || news.title,
    description: resolveDescription(
      news.seoDescription,
      news.tiivistelma,
      news.excerpt,
      korttiOte(news.ote),
    ),
    path: `/uutiset/${news.slug}`,
    image: news.coverImage,
    sisalto: news.body,
    publishedAt: news.publishedAt,
    modifiedAt: news._updatedAt,
    type: "article",
  });
}

export default async function UutinenPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const news = await getUutinen(slug);
  if (!news) notFound();

  const related = await sanityFetch<UutinenListItem[]>({
    query: relatedUutisetQuery,
    params: { slug: news.slug, categories: (news.categories ?? []).map((k) => k._id), count: 3 },
    tags: ["uutinen"],
    fallback: [],
  });

  const path = `/uutiset/${news.slug}`;
  const trail = [
    rootCrumb,
    { label: "Uutiset", href: "/uutiset" },
    { label: news.title },
  ];
  const publishedYear = news.publishedAt?.slice(0, 4);
  const summary = news.tiivistelma ?? news.excerpt;
  // Migroiduissa uutisissa tiivistelmä on leipätekstin sanatarkka alku
  // (docs/12 §2.1.6). Ingressinä se toistaisi saman tekstin kahdesti.
  const lead = tiivistelmaToistaaTekstin(summary, news.body) ? null : summary;
  // Ilman erillistä ingressiä sopivan mittainen ensimmäinen kappale toimii sinä.
  const ingressi = !lead && ensimmainenKappaleIngressiksi(news.body);
  const minuutit = lukuaika(news.body);
  const lahde = news.lahde?.nimi?.trim() ? news.lahde : null;

  return (
    <article>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          articleSchema({
            title: news.title,
            description: news.tiivistelma ?? news.excerpt,
            path,
            image: resolveOgImage(news.coverImage, news.body).url,
            publishedAt: news.publishedAt,
            modifiedAt: news._updatedAt,
          }),
        ]}
      />

      <Container size="narrow" className="pt-12">
        <PageHeader
          title={news.title}
          lead={lead}
          breadcrumbs={trail}
          meta={
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
              <time dateTime={news.publishedAt}>
                {formatDate(news.publishedAt)}
              </time>
              {news.author?.name && (
                <>
                  <span aria-hidden>·</span>
                  <span>
                    {news.author.name}
                    {news.author.role && (
                      <span className="text-muted-soft">
                        {" "}
                        · {news.author.role}
                      </span>
                    )}
                  </span>
                </>
              )}
              {minuutit && (
                <>
                  <span aria-hidden>·</span>
                  <span>{minuutit} min lukuaika</span>
                </>
              )}
              <span aria-hidden className="print:hidden">·</span>
              <JaaPainike url={new URL(path, siteUrl).toString()} otsikko={news.title} />
            </div>
          }
        />

        {news.categories && news.categories.length > 0 && (
          <nav aria-label="Uutisen kategoriat" className="mt-6">
            <ul className="flex list-none flex-wrap gap-2 p-0">
              {news.categories.map((category) => (
                <li key={category._id}>
                  <Link
                    href={`/uutiset?kategoria=${encodeURIComponent(stegaClean(category.value))}`}
                    className="inline-flex min-h-11 items-center rounded-sm border border-border bg-surface px-4 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </Container>

      {news.coverImage?.asset && (
        <Container size="wide" className="mt-12">
          {/* Kuvateksti (esim. "Sami Hyypiä 20.08.2008") on lähteen tietoa:
              figure + figcaption sitoo sen kuvaan myös ruudunlukijalle. */}
          <figure>
            <div className="overflow-hidden rounded-2xl">
              <KuvaSiirtyma nimi={`uutinen-${news.slug}`}>
                <FramedImage
                  image={news.coverImage}
                  kuvateksti={news.coverImage.caption}
                  width={1600}
                  sizes="(min-width: 1280px) 1152px, 100vw"
                  className="aspect-[16/9] w-full"
                  priority
                />
              </KuvaSiirtyma>
            </div>
            {news.coverImage.caption?.trim() && (
              <figcaption className="mt-3 text-sm text-muted">
                {news.coverImage.caption}
              </figcaption>
            )}
          </figure>
        </Container>
      )}

      <Container size="narrow" className="py-16">
        <PortableText value={news.body} ingressi={ingressi} />

        <UutisenTunnisteet tunnisteet={news.tunnisteet} className="mt-10" />

        {(lahde || news.ulkoinenLinkki) && (
          <dl className="mt-10 space-y-1 border-t border-border pt-6 text-sm text-muted">
            {lahde && (
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-foreground">Lähde:</dt>
                <dd>
                  {lahde.url ? (
                    <a
                      href={lahde.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
                    >
                      {lahde.nimi}
                      <UusiValilehti />
                    </a>
                  ) : (
                    lahde.nimi
                  )}
                  {lahde.pvm && (
                    <>
                      {" "}
                      <time dateTime={lahde.pvm}>{formatDate(lahde.pvm)}</time>
                    </>
                  )}
                </dd>
              </div>
            )}
            {news.ulkoinenLinkki && (
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-foreground">Alkuperäinen kirjoitus:</dt>
                <dd>
                  <a
                    href={news.ulkoinenLinkki}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
                  >
                    {news.ulkoinenLinkki}
                    <UusiValilehti />
                  </a>
                </dd>
              </div>
            )}
          </dl>
        )}

        <KommentitOsio uutinenId={news._id} kommentointi={news.kommentointi} />

        <UutisSelaus vanhempi={news.vanhempi} uudempi={news.uudempi} />

        <p className="mt-10 text-sm text-muted">
          <Link href="/uutiset" className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2">
            Kaikki uutiset
          </Link>
          {publishedYear && (
            <>
              <span aria-hidden> · </span>
              <Link
                href={`/uutiset/arkisto/${publishedYear}`}
                className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
              >
                Arkisto {publishedYear}
              </Link>
            </>
          )}
        </p>
      </Container>

      {related.length > 0 && (
        <section
          aria-labelledby="lue-lisaa"
          className="border-t border-border bg-surface py-16 print:hidden"
        >
          <Container>
            <h2 id="lue-lisaa" className="font-display text-2xl sm:text-3xl">
              Lue lisää
            </h2>
            <ul className="mt-8 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item._id} className="flex">
                  <NewsCard news={item} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </article>
  );
}

/**
 * Vanhempi ja uudempi uutinen julkaisujärjestyksessä (vasen = vanhempi, kuten
 * arkiston vuosiselauksessa). Otsikko kertoo, mihin linkki vie.
 */
function UutisSelaus({
  vanhempi,
  uudempi,
}: {
  vanhempi?: UutinenNaapuri | null;
  uudempi?: UutinenNaapuri | null;
}) {
  if (!vanhempi && !uudempi) return null;
  return (
    <nav
      aria-label="Selaa uutisia"
      className="mt-12 grid gap-6 border-t border-border pt-8 sm:grid-cols-2"
    >
      {vanhempi && <SelausLinkki uutinen={vanhempi} suunta="vanhempi" />}
      {uudempi && <SelausLinkki uutinen={uudempi} suunta="uudempi" />}
    </nav>
  );
}

function SelausLinkki({
  uutinen,
  suunta,
}: {
  uutinen: UutinenNaapuri;
  suunta: "vanhempi" | "uudempi";
}) {
  const uudempi = suunta === "uudempi";
  return (
    <Link
      href={`/uutiset/${uutinen.slug}`}
      rel={uudempi ? "next" : "prev"}
      className={
        "group/linkki flex flex-col gap-1.5 no-underline" +
        // Yksinään oleva uudempi-linkki pysyy oikealla puolella.
        (uudempi ? " sm:col-start-2 sm:items-end sm:text-right" : "")
      }
    >
      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-soft">
        {!uudempi && <Nuoli suunta="vasen" />}
        {uudempi ? "Uudempi uutinen" : "Vanhempi uutinen"}
        {uudempi && <Nuoli />}
      </span>
      <span className="font-display text-lg leading-[1.35] text-heading transition group-hover/linkki:text-accent">
        {uutinen.title}
      </span>
      <time dateTime={uutinen.publishedAt} className="text-sm text-muted-soft">
        {formatDate(uutinen.publishedAt)}
      </time>
    </Link>
  );
}
