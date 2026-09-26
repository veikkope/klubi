import { Container } from "@/components/layout/container";
import { BlockHeading } from "@/components/blocks/block-heading";
import { AlbumTile } from "@/components/gallery/album-tile";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  etusivuGalleriaQuery,
  type GalleriaAlbumCard,
} from "@/sanity/lib/queries/galleria";

type Props = {
  heading?: string;
  count?: number;
};

/**
 * Galleria-nosto — uusimmat kuva-albumit.
 *
 * Tämä lohko on samalla gallerian pääasiallinen sisääntulo: `/galleria` ei ole
 * päänavigaatiossa (docs/02), joten ilman etusivun nostoa ja footerin linkkiä
 * albumit jäisivät löytymättä.
 *
 * Ilman albumeita lohkoa ei renderöidä.
 */
export async function GalleriaBlock({
  heading = "Kuvagalleria",
  count = 3,
}: Props) {
  const albums = await sanityFetch<GalleriaAlbumCard[]>({
    query: etusivuGalleriaQuery,
    params: { count },
    tags: ["galleriaAlbumi"],
    fallback: [],
  });

  if (albums.length === 0) return null;

  return (
    <section className="py-20 sm:py-24" aria-labelledby="etusivu-galleria">
      <Container size="wide">
        <BlockHeading
          id="etusivu-galleria"
          title={heading}
          action={{ href: "/galleria", label: "Kaikki albumit" }}
        />
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <li key={album._id} className="grid">
              <AlbumTile album={album} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
