"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import { FramedImage } from "@/components/framed-image";
import { Lightbox } from "./lightbox";
import { urlForImage } from "@/sanity/lib/image";
import type { AlbumImage } from "@/lib/types";

/**
 * Albumin kuvaruudukko.
 *
 * Jokainen ruutu on `<button>`, ei linkki: se avaa dialogin samalla sivulla
 * eikä navigoi mihinkään. Fokus palautetaan avaajanappiin kun lightbox
 * suljetaan — muuten näppäimistökäyttäjä putoaisi sivun alkuun.
 */

type Props = {
  images: AlbumImage[];
  /** Ruudunlukijalle: mistä albumista kuva on. */
  albumTitle?: string;
  /** Lyhyt teksti kuvaruudun alle (esim. kuvauspäivä), sama järjestys kuin `images`. */
  merkinnat?: (string | null)[];
  /**
   * Ruutu näyttää kuvan kokonaisena pystykehyksessä (`FramedImage`) eikä rajaa
   * sitä neliöksi. Arkistokuville, joissa rajaus leikkaisi aiheen (patsaskuvat);
   * albumien valokuvat rajataan edelleen tasaiseksi ruudukoksi.
   */
  kokonaisena?: boolean;
  /**
   * Sarakkeita leveällä näytöllä. 3 tekstipalstan kuvasarjalle
   * (components/kuvasarja.tsx), jossa neljä ruutua olisi liian pieniä.
   */
  sarakkeet?: 3 | 4;
  /**
   * Ruudukko on tekstin seassa (kuvasarja), ei sivun yläosassa: kuvia ei ladata
   * heti, ettei sivun alaosan sarja kilpaile yläosan kuvan kanssa, ja ruudun nimi
   * on muotoa "Klubin vappu 2026, kuva 3/9" kuten suurennoksessa.
   */
  tekstinSeassa?: boolean;
};

/** Ensimmäiset ruudut ovat näkyvissä heti — ne ladataan ilman viivettä. */
const EAGER_COUNT = 4;

export function AlbumGrid({
  images,
  albumTitle,
  merkinnat,
  kokonaisena = false,
  sarakkeet = 4,
  tekstinSeassa = false,
}: Props) {
  const heti = tekstinSeassa ? 0 : EAGER_COUNT;
  const [active, setActive] = useState<number | null>(null);
  const triggersRef = useRef<(HTMLButtonElement | null)[]>([]);

  function close() {
    const trigger = active !== null ? triggersRef.current[active] : null;
    setActive(null);
    trigger?.focus();
  }

  if (images.length === 0) return null;

  const sizes =
    sarakkeet === 3
      ? "(min-width: 768px) 240px, 50vw"
      : "(min-width: 1024px) 264px, (min-width: 640px) 33vw, 50vw";

  return (
    <>
      <ul
        className={
          sarakkeet === 3
            ? "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4"
            : "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
        }
      >
        {images.map((image, index) => {
          const builder = urlForImage(image);
          if (!builder) return null;
          const src = builder.width(800).height(800).fit("crop").url();
          const position = `${index + 1}/${images.length}`;
          const describedBy = image.alt?.trim() || image.caption?.trim();
          const label = describedBy
            ? `Avaa kuva: ${describedBy} (${position})`
            : albumTitle
              ? tekstinSeassa
                ? `Avaa kuva: ${albumTitle}, kuva ${position}`
                : `Avaa kuva ${position} albumista ${albumTitle}`
              : `Avaa kuva ${position}`;

          return (
            <li key={image._key ?? index}>
              <button
                type="button"
                ref={(node) => {
                  triggersRef.current[index] = node;
                }}
                onClick={() => setActive(index)}
                aria-haspopup="dialog"
                aria-label={label}
                className={
                  kokonaisena
                    ? "group/kortti relative block w-full overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    : "group relative block aspect-square w-full overflow-hidden rounded-lg bg-surface-strong"
                }
                // Kuvan hallitseva väri latauksen ajaksi (sanity/lib/queries/kuvat.ts).
                style={!kokonaisena && image.vari ? { backgroundColor: image.vari } : undefined}
              >
                {kokonaisena ? (
                  <FramedImage
                    image={image}
                    alt={image.alt ?? ""}
                    width={600}
                    sizes={sizes}
                    eager={index < heti}
                    className="aspect-[4/5] w-full"
                  />
                ) : (
                  <Image
                    src={src}
                    alt={image.alt ?? ""}
                    width={400}
                    height={400}
                    sizes={sizes}
                    loading={index < heti ? "eager" : undefined}
                    className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                )}
              </button>
              {merkinnat?.[index] && (
                <p className="mt-2 text-sm tabular-nums text-muted">{merkinnat[index]}</p>
              )}
            </li>
          );
        })}
      </ul>

      <Lightbox
        images={images}
        index={active}
        albumTitle={albumTitle}
        onClose={close}
        onChange={setActive}
      />
    </>
  );
}
