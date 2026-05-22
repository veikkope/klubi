import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SanityImage } from "@/components/sanity-image";
import { PortableText } from "@/components/portable-text";
import { NewsCard } from "@/components/news-card";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  allUutinenSlugsQuery,
  relatedUutisetQuery,
  uutinenBySlugQuery,
} from "@/sanity/lib/queries";
import { hasSanity } from "@/sanity/env";
import { formatDate } from "@/lib/format";
import { categoryLabel } from "@/lib/uutinen-categories";
import { urlForImage } from "@/sanity/lib/image";
import type { UutinenCard, UutinenFull } from "@/lib/types";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  if (!hasSanity) return [];
  const slugs = await sanityFetch<string[]>({
    query: allUutinenSlugsQuery,
    tags: ["uutinen"],
    fallback: [],
  });
  return slugs.map((slug) => ({ slug }));
}

async function getNews(slug: string) {
  return sanityFetch<UutinenFull | null>({
    query: uutinenBySlugQuery,
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
  const news = await getNews(slug);
  if (!news) return {};
  const ogImage = news.seo?.ogImage ?? news.coverImage;
  const ogBuilder = ogImage ? urlForImage(ogImage) : null;
  return {
    title: news.seo?.metaTitle || news.title,
    description: news.seo?.metaDescription || news.excerpt,
    openGraph: {
      title: news.title,
      description: news.excerpt,
      type: "article",
      publishedTime: news.publishedAt,
      images: ogBuilder
        ? [{ url: ogBuilder.width(1200).height(630).url() }]
        : undefined,
    },
  };
}

export default async function UutinenPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const news = await getNews(slug);
  if (!news) notFound();

  const related = await sanityFetch<UutinenCard[]>({
    query: relatedUutisetQuery,
    params: { slug: news.slug, categories: news.categories ?? [], count: 3 },
    tags: ["uutinen"],
    fallback: [],
  });

  return (
    <article>
      <Container size="narrow" className="pt-12">
        <Breadcrumbs
          items={[
            { label: "Etusivu", href: "/" },
            { label: "Uutiset", href: "/uutiset" },
            { label: news.title },
          ]}
        />
        <header className="mt-8">
          {news.categories && news.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {news.categories.map((c) => (
                <Link
                  key={c}
                  href={`/uutiset?kategoria=${c}`}
                  className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-800 hover:bg-brand-100"
                >
                  {categoryLabel(c)}
                </Link>
              ))}
            </div>
          )}
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            {news.title}
          </h1>
          <p className="mt-4 text-lg text-muted">{news.excerpt}</p>
          <div className="mt-6 flex items-center gap-3 text-sm text-muted">
            <time dateTime={news.publishedAt}>{formatDate(news.publishedAt)}</time>
            {news.author && (
              <>
                <span aria-hidden>·</span>
                <span>
                  {news.author.name}
                  {news.author.role && (
                    <span className="text-muted-soft"> · {news.author.role}</span>
                  )}
                </span>
              </>
            )}
          </div>
        </header>
      </Container>

      {news.coverImage?.asset && (
        <Container size="wide" className="mt-12">
          <div className="overflow-hidden rounded-2xl">
            <SanityImage
              image={news.coverImage}
              width={1600}
              height={900}
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        </Container>
      )}

      <Container size="narrow" className="py-16">
        <PortableText value={news.body} />
      </Container>

      {related.length > 0 && (
        <section className="border-t border-border bg-surface py-16">
          <Container>
            <h2 className="font-serif text-2xl sm:text-3xl">Lue lisää</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <NewsCard key={item._id} news={item} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildArticleJsonLd(news)),
        }}
      />
    </article>
  );
}

function buildArticleJsonLd(news: UutinenFull) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description: news.excerpt,
    datePublished: news.publishedAt,
    author: news.author
      ? { "@type": "Person", name: news.author.name }
      : { "@type": "Organization", name: "Lahden Suomalainen Klubi ry" },
    publisher: {
      "@type": "Organization",
      name: "Lahden Suomalainen Klubi ry",
    },
  };
}
