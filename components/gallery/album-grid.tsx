"use client";

import { useRef, useState } from "react";
import Image from "next/image";

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
};

/** Ensimmäiset ruudut ovat näkyvissä heti — ne ladataan ilman viivettä. */
const EAGER_COUNT = 4;

export function AlbumGrid({ images, albumTitle }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const triggersRef = useRef<(HTMLButtonElement | null)[]>([]);

  function close() {
    const trigger = active !== null ? triggersRef.current[active] : null;
    setActive(null);
    trigger?.focus();
  }

  if (images.length === 0) return null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {images.map((image, index) => {
          const builder = urlForImage(image);
          if (!builder) return null;
          const src = builder.width(800).height(800).fit("crop").url();
          const position = `${index + 1}/${images.length}`;
          const describedBy = image.alt?.trim() || image.caption?.trim();
          const label = describedBy
            ? `Avaa kuva: ${describedBy} (${position})`
            : albumTitle
              ? `Avaa kuva ${position} albumista ${albumTitle}`
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
                className="group relative block aspect-square w-full overflow-hidden rounded-lg bg-surface-strong"
                // Kuvan hallitseva väri latauksen ajaksi (sanity/lib/queries/kuvat.ts).
                style={image.vari ? { backgroundColor: image.vari } : undefined}
              >
                <Image
                  src={src}
                  alt={image.alt ?? ""}
                  width={400}
                  height={400}
                  sizes="(min-width: 1024px) 264px, (min-width: 640px) 33vw, 50vw"
                  loading={index < EAGER_COUNT ? "eager" : undefined}
                  className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </button>
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
