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
import { haeTyhjatOsiot } from "@/sanity/lib/tyhjat-osiot";
import { haeOsioSivu } from "@/sanity/lib/osiosivu";
import { rootCrumb } from "@/lib/nav-sections";

export const revalidate = 3600;

/** Otsikko, johdanto ja hakukoneteksti: Studion Osioiden sivut (lib/osiosivut.ts). */
const OSIO = "galleria" as const;

/** Ensimmäinen rivi on näkyvissä heti — sen kuvat eivät saa olla lazy. */
const EAGER_COUNT = 3;

export async function generateMetadata(): Promise<Metadata> {
  // Tyhjä osio ei näy valikossa eikä sitemapissa, eikä sitä indeksoida (lib/osiot.ts).
  const [tyhjat, s] = await Promise.all([haeTyhjatOsiot(), haeOsioSivu(OSIO)]);
  const tyhja = tyhjat.has("/galleria");
  return buildMetadata({
    title: s.seoTitle,
    description: s.description,
    path: "/galleria",
    noIndex: tyhja,
  });
}

export default async function GalleriaPage() {
  const [albums, s] = await Promise.all([
    sanityFetch<GalleriaAlbumCard[]>({
      query: galleriaAlbumitQuery,
      tags: ["galleriaAlbumi"],
      fallback: [],
    }),
    haeOsioSivu(OSIO),
  ]);
  const trail = [rootCrumb, { label: s.title }];

  return (
    <>
      <JsonLd
        schema={[
          breadcrumbSchema(trail),
          collectionPageSchema({
            title: s.title,
            description: s.description,
            path: "/galleria",
            itemCount: albums.length,
          }),
        ]}
      />

      <Container size="wide" className="pt-10 sm:pt-14">
        <PageHeader title={s.title} lead={s.lead} breadcrumbs={trail} />
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
                <AlbumTile album={album} eager={index < EAGER_COUNT} />
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
        Klubin tapahtumien ja matkojen kuvat julkaistaan täällä. Ensimmäinen
        albumi on tulossa.
      </p>
    </div>
  );
}
