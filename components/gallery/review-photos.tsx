"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import { Lightbox } from "./lightbox";
import { urlForImage } from "@/sanity/lib/image";
import type { AlbumImage } from "@/lib/types";

/**
 * Kävijän arvostelun kuvat (enintään 3) pieninä esikatseluina, jotka avautuvat
 * kuvanäkymään (Lightbox). Sama saavutettavuusmalli kuin AlbumGridissä:
 * jokainen pikkukuva on painike, ja fokus palaa avaajaan suljettaessa.
 */
export function ReviewPhotos({ images, reviewerName }: { images: AlbumImage[]; reviewerName: string }) {
  const [active, setActive] = useState<number | null>(null);
  const triggersRef = useRef<(HTMLButtonElement | null)[]>([]);

  function close() {
    const trigger = active !== null ? triggersRef.current[active] : null;
    setActive(null);
    trigger?.focus();
  }

  if (images.length === 0) return null;
  const title = `Arvostelijan ${reviewerName} kuvat`;

  return (
    <>
      <ul aria-label={title} className="mt-4 flex flex-wrap gap-2.5">
        {images.map((image, index) => {
          const builder = urlForImage(image);
          if (!builder) return null;
          const position = `${index + 1}/${images.length}`;
          return (
            <li key={image._key ?? index}>
              <button
                type="button"
                ref={(node) => {
                  triggersRef.current[index] = node;
                }}
                onClick={() => setActive(index)}
                aria-haspopup="dialog"
                aria-label={`Avaa kuva: ${image.alt?.trim() || "kävijän kuva"} (${position})`}
                className="group relative block size-24 overflow-hidden rounded-sm bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:size-28"
              >
                <Image
                  src={builder.width(224).height(224).fit("crop").url()}
                  alt=""
                  width={112}
                  height={112}
                  sizes="112px"
                  className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105 motion-reduce:transition-none"
                />
              </button>
            </li>
          );
        })}
      </ul>
      <Lightbox
        images={images}
        index={active}
        albumTitle={title}
        onClose={close}
        onChange={setActive}
      />
    </>
  );
}
