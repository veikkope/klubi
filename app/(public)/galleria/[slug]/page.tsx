import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { AlbumGrid } from "@/components/gallery/album-grid";
import { imageCountLabel } from "@/components/gallery/album-tile";
import { JsonLd } from "@/components/seo/json-ld";
import { sanityFetch } from "@/sanity/lib/fetch";
import { allGalleriaSlugsQuery } from "@/sanity/lib/queries";
import {
  galleriaAlbumiBySlugQuery,
  type GalleriaAlbumFull,
} from "@/sanity/lib/queries/galleria";
import { hasSanity } from "@/sanity/env";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema-org";
import { buildMetadata, resolveDescription } from "@/lib/seo";
import { rootCrumb } from "@/lib/nav-sections";
import { formatDate } from "@/lib/format";

export const revalidate = 3600;

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
  return sanityFetch<GalleriaAlbumFull | null>({
    query: galleriaAlbumiBySlugQuery,
    params: { slug },
    tags: ["galleriaAlbumi", `galleriaAlbumi:${slug}`],
    fallback: null,
  });
}

/**
 * Albumin kuvaus.
 *
 * Ensisijaisesti isän kirjoittama `tiivistelma` — se on se teksti, jonka
 * hakukone tai vastausmoottori lainaa. Vasta jos sitä ei ole, kootaan
 * itsenäinen lause albumin metatiedoista; katkaistua leipätekstiä ei käytetä.
 */
function fallbackDescription(album: GalleriaAlbumFull): string {
  const base = `${imageCountLabel(album.images.length)} albumissa ${album.title} — kuvattu ${formatDate(album.date)}.`;
  return album.event
    ? `${base} Albumi liittyy tapahtumaan ${album.event.title}.`
    : base;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) return { title: "Albumia ei löytynyt" };

  return buildMetadata({
    title: album.title,
    description: resolveDescription(
      album.tiivistelma,
      fallbackDescription(album),
    ),
    path: `/galleria/${album.slug}`,
    image: album.coverImage,
    modifiedAt: album._updatedAt,
  });
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) notFound();

  const path = `/galleria/${album.slug}`;
  const description = resolveDescription(
    album.tiivistelma,
    fallbackDescription(album),
  );
  const trail = [
    rootCrumb,
    { label: "Galleria", href: "/galleria" },
    { label: album.title },
  ];

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({
            title: album.title,
            description,
            path,
            itemCount: album.images.length,
          }),
        ]}
      />

      <Container size="wide" className="pt-10 sm:pt-14">
        <PageHeader
          title={album.title}
          lead={album.tiivistelma}
          breadcrumbs={trail}
          eyebrow="Galleria"
          meta={
            <>
              <span className="text-sm text-muted">
                {formatDate(album.date)}
              </span>
              <span aria-hidden className="text-border-strong">
                ·
              </span>
              <span className="text-sm text-muted">
                {imageCountLabel(album.images.length)}
              </span>
              {album.event && (
                <>
                  <span aria-hidden className="text-border-strong">
                    ·
                  </span>
                  <Link
                    href={`/tapahtumat/${album.event.slug}`}
                    className="inline-flex min-h-11 items-center text-sm font-medium text-accent underline decoration-1 underline-offset-4 hover:decoration-2 hover:text-accent-hover"
                  >
                    {album.event.title}
                  </Link>
                </>
              )}
            </>
          }
        />
      </Container>

      <Container size="wide" className="py-10 sm:py-14">
        <h2 className="sr-only">Albumin kuvat</h2>
        <AlbumGrid images={album.images} albumTitle={album.title} />
      </Container>

      <Container size="wide" className="pb-16">
        <Link
          href="/galleria"
          className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
        >
          <span aria-hidden>←</span> Kaikki albumit
        </Link>
      </Container>
    </>
  );
}
