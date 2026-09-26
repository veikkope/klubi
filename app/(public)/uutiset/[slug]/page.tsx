import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { NewsCard } from "@/components/news-card";
import { PortableText } from "@/components/portable-text";
import { SanityImage } from "@/components/sanity-image";
import { JsonLd } from "@/components/seo/json-ld";
import { formatDate } from "@/lib/format";
import { rootCrumb } from "@/lib/nav-sections";
import { articleSchema, breadcrumbSchema } from "@/lib/schema-org";
import { buildMetadata, resolveDescription } from "@/lib/seo";
import { categoryLabel } from "@/lib/uutinen-categories";
import { hasSanity } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/fetch";
import { urlForImage } from "@/sanity/lib/image";
import {
  relatedUutisetQuery,
  uutinenDetailQuery,
  uutinenSlugsQuery,
  type UutinenDetail,
  type UutinenListItem,
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

function ogImageUrl(news: UutinenDetail): string | null {
  return (
    urlForImage(news.coverImage)?.width(1200).height(630).fit("crop").url() ??
    null
  );
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
    ),
    path: `/uutiset/${news.slug}`,
    image: news.coverImage,
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
    params: { slug: news.slug, categories: news.categories ?? [], count: 3 },
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

  return (
    <article>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          articleSchema({
            title: news.title,
            description: news.tiivistelma ?? news.excerpt,
            path,
            image: ogImageUrl(news),
            publishedAt: news.publishedAt,
            modifiedAt: news._updatedAt,
          }),
        ]}
      />

      <Container size="narrow" className="pt-12">
        <PageHeader
          title={news.title}
          lead={news.tiivistelma ?? news.excerpt}
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
            </div>
          }
        />

        {news.categories && news.categories.length > 0 && (
          <nav aria-label="Uutisen kategoriat" className="mt-6">
            <ul className="flex list-none flex-wrap gap-2 p-0">
              {news.categories.map((category) => (
                <li key={category}>
                  <Link
                    href={`/uutiset?kategoria=${category}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent"
                  >
                    {categoryLabel(category)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </Container>

      {news.coverImage?.asset && (
        <Container size="wide" className="mt-12">
          <div className="overflow-hidden rounded-2xl">
            <SanityImage
              image={news.coverImage}
              width={1600}
              height={900}
              sizes="(min-width: 1280px) 1152px, 100vw"
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        </Container>
      )}

      <Container size="narrow" className="py-16">
        <PortableText value={news.body} />

        <p className="mt-12 text-sm text-muted">
          <Link href="/uutiset" className="text-accent hover:underline">
            Kaikki uutiset
          </Link>
          {publishedYear && (
            <>
              <span aria-hidden> · </span>
              <Link
                href={`/uutiset/arkisto/${publishedYear}`}
                className="text-accent hover:underline"
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
          className="border-t border-border bg-surface py-16"
        >
          <Container>
            <h2 id="lue-lisaa" className="font-serif text-2xl sm:text-3xl">
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
