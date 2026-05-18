"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox } from "./lightbox";
import { urlForImage } from "@/sanity/lib/image";
import type { AlbumImage } from "@/lib/types";

export function AlbumGrid({ images }: { images: AlbumImage[] }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {images.map((image, i) => {
          const builder = urlForImage(image);
          if (!builder) return null;
          const src = builder.width(800).height(800).fit("crop").url();
          return (
            <li key={image._key ?? i}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className="group block w-full overflow-hidden rounded-lg bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={image.alt ?? `Avaa kuva ${i + 1}`}
              >
                <span className="relative block aspect-square overflow-hidden">
                  <Image
                    src={src}
                    alt={image.alt ?? ""}
                    width={400}
                    height={400}
                    sizes="(min-width: 1024px) 240px, 50vw"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Lightbox
        images={images}
        index={active}
        onClose={() => setActive(null)}
        onChange={setActive}
      />
    </>
  );
}
