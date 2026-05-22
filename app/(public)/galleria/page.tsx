import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SanityImage } from "@/components/sanity-image";
import { sanityFetch } from "@/sanity/lib/fetch";
import { galleriaListQuery } from "@/sanity/lib/queries";
import { formatDate } from "@/lib/format";
import type { AlbumCard } from "@/lib/types";

export const metadata: Metadata = {
  title: "Galleria",
  description:
    "Kuvagalleriat Lahden Suomalainen Klubi ry:n tapahtumista ja kohokohdista.",
};

export default async function GalleriaPage() {
  const albums = await sanityFetch<AlbumCard[]>({
    query: galleriaListQuery,
    tags: ["galleriaAlbumi"],
    fallback: [],
  });

  return (
    <>
      <Container className="pt-12">
        <Breadcrumbs items={[{ label: "Etusivu", href: "/" }, { label: "Galleria" }]} />
        <h1 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">
          Galleria
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Kuvia yhdistyksen tapahtumista ja kohokohdista vuosien varrelta.
        </p>
      </Container>

      <Container className="py-16">
        {albums.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <li key={album._id}>
                <Link
                  href={`/galleria/${album.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-brand-300 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <SanityImage
                      image={album.coverImage}
                      width={800}
                      height={600}
                      sizes="(min-width: 1024px) 400px, 100vw"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      {formatDate(album.date)} · {album.imageCount} kuvaa
                    </p>
                    <h2 className="mt-2 font-serif text-xl text-foreground">
                      {album.title}
                    </h2>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <p className="font-serif text-2xl">Ei vielä albumeita</p>
      <p className="mt-2 max-w-md text-muted mx-auto">
        Kuva-albumit lisätään Sanity Studiossa. Heti kun ensimmäinen albumi
        on julkaistu, se ilmestyy tänne.
      </p>
    </div>
  );
}
