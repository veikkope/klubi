import { Card, CardBody, CardEyebrow, CardTitle } from "@/components/ui/card";
import { FramedImage } from "@/components/framed-image";
import { formatDate } from "@/lib/format";
import type { GalleriaAlbumCard } from "@/sanity/lib/queries/galleria";

/**
 * Albumikortti. Sama komponentti sekä `/galleria`-listauksella että etusivun
 * galleria-nostossa — kaksi eri ulkoasua samalle asialle olisi vain kaksi
 * paikkaa jotka ehtivät ajautua erilleen.
 */

type Props = {
  album: GalleriaAlbumCard;
  sizes?: string;
  /** Ensimmäinen rivi on näkyvissä heti: kuva ladataan ilman lazy-viivettä. */
  eager?: boolean;
};

/** Yksikkömuoto on suomeksi eri kuin monikko — ei "1 kuvaa". */
export function imageCountLabel(count: number): string {
  return count === 1 ? "1 kuva" : `${count} kuvaa`;
}

export function AlbumTile({
  album,
  sizes = "(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw",
  eager = false,
}: Props) {
  return (
    <Card href={`/galleria/${album.slug}`}>
      {/* Kiinteä kuvasuhde varaa tilan ennen latausta — ei CLS:ää. */}
      <FramedImage
        image={album.coverImage}
        width={800}
        sizes={sizes}
        eager={eager}
        className="-m-6 mb-4 aspect-[4/3] rounded-t-2xl"
      />
      <CardEyebrow>
        {formatDate(album.date)} · {imageCountLabel(album.imageCount)}
      </CardEyebrow>
      <CardTitle className="mt-2">{album.title}</CardTitle>
      {album.tiivistelma && (
        <CardBody className="mt-2 line-clamp-3">{album.tiivistelma}</CardBody>
      )}
    </Card>
  );
}
