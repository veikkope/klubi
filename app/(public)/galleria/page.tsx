import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { AlbumTile } from "@/components/gallery/album-tile";
import { JsonLd } from "@/components/seo/json-ld";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  galleriaAlbumitQuery,
  type GalleriaAlbumCard,
} from "@/sanity/lib/queries/galleria";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import { rootCrumb } from "@/lib/nav-sections";

export const revalidate = 3600;

const title = "Galleria";
const lead =
  "Kuvia Lahden Suomalainen Klubi ry:n tapahtumista, retkistä ja kohokohdista vuosien varrelta. Albumit on järjestetty uusimmasta vanhimpaan.";

const trail = [rootCrumb, { label: title }];

/** Ensimmäinen rivi on näkyvissä heti — sen kuvat eivät saa olla lazy. */
const EAGER_COUNT = 3;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title,
    description: lead,
    path: "/galleria",
  });
}

export default async function GalleriaPage() {
  const albums = await sanityFetch<GalleriaAlbumCard[]>({
    query: galleriaAlbumitQuery,
    tags: ["galleriaAlbumi"],
    fallback: [],
  });

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({
            title,
            description: lead,
            path: "/galleria",
            itemCount: albums.length,
          }),
        ]}
      />

      <Container size="wide" className="pt-10 sm:pt-14">
        <PageHeader title={title} lead={lead} breadcrumbs={trail} />
      </Container>

      <Container size="wide" className="py-12 sm:py-16">
        {/* Väliotsikko pitää otsikkotasot järjestyksessä: h1 → h2 → korttien h3. */}
        <h2 className="sr-only">Albumit</h2>

        {albums.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album, index) => (
              <li key={album._id} className="grid">
                <AlbumTile album={album} priority={index < EAGER_COUNT} />
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
      <p className="font-display text-2xl">Ei vielä albumeita</p>
      <p className="mx-auto mt-2 max-w-md text-muted">
        Kuva-albumit lisätään Sanity Studiossa. Heti kun ensimmäinen albumi on
        julkaistu, se ilmestyy tänne.
      </p>
    </div>
  );
}
