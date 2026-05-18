import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { AlbumGrid } from "@/components/gallery/album-grid";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  allGalleriaSlugsQuery,
  galleriaBySlugQuery,
} from "@/sanity/lib/queries";
import { hasSanity } from "@/sanity/env";
import { formatDate } from "@/lib/format";
import { urlForImage } from "@/sanity/lib/image";
import type { AlbumFull } from "@/lib/types";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  if (!hasSanity) return [];
  const slugs = await sanityFetch<string[]>({
    query: allGalleriaSlugsQuery,
    tags: ["galleriaAlbumi"],
    fallback: [],
  });
  return slugs.map((slug) => ({ slug }));
}

async function getAlbum(slug: string) {
  return sanityFetch<AlbumFull | null>({
    query: galleriaBySlugQuery,
    params: { slug },
    tags: ["galleriaAlbumi", `galleriaAlbumi:${slug}`],
    fallback: null,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) return {};
  const builder = urlForImage(album.coverImage);
  return {
    title: album.title,
    description: `${album.images.length} kuvan albumi — ${formatDate(album.date)}.`,
    openGraph: {
      images: builder
        ? [{ url: builder.width(1200).height(630).url() }]
        : undefined,
    },
  };
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) notFound();

  return (
    <>
      <Container className="pt-12">
        <Breadcrumbs
          items={[
            { label: "Etusivu", href: "/" },
            { label: "Galleria", href: "/galleria" },
            { label: album.title },
          ]}
        />
        <header className="mt-8">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">
            {formatDate(album.date)} · {album.images.length} kuvaa
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            {album.title}
          </h1>
          {album.event && (
            <p className="mt-3 text-muted">
              Liittyy tapahtumaan{" "}
              <Link
                href={`/tapahtumat/${album.event.slug}`}
                className="text-accent hover:underline"
              >
                {album.event.title}
              </Link>
              .
            </p>
          )}
        </header>
      </Container>

      <Container className="py-12">
        <AlbumGrid images={album.images} />
      </Container>
    </>
  );
}
