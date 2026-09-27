import Image from "next/image";
import { urlForImage } from "@/sanity/lib/image";
import type { SanityImage as SanityImageData } from "@/lib/types";

type Props = {
  image: SanityImageData;
  alt?: string;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
  /**
   * `false` = näytä koko kuva rajaamatta (kaaviot, taulukkokuvat, otteluohjelmat).
   * Mittasuhde luetaan assetin viittauksesta (`image-<hash>-<L>x<K>-<pääte>`),
   * ja `width` on silloin enimmäisleveys.
   */
  crop?: boolean;
};

/** Sanityn asset-viittaus sisältää alkuperäiset mitat: image-abc-1200x800-jpg. */
function assetDimensions(image: SanityImageData): { width: number; height: number } | null {
  const ref = image?.asset?._ref ?? image?.asset?._id ?? "";
  const match = /-(\d+)x(\d+)-[a-z0-9]+$/i.exec(ref);
  if (!match) return null;
  return { width: Number(match[1]), height: Number(match[2]) };
}

export function SanityImage({
  image,
  alt,
  width = 1200,
  height = 800,
  sizes,
  className,
  priority,
  crop = true,
}: Props) {
  if (!image) return null;
  const urlBuilder = urlForImage(image);
  if (!urlBuilder) return null;

  if (!crop) {
    const original = assetDimensions(image);
    if (original) {
      const renderWidth = Math.min(width, original.width);
      const renderHeight = Math.round((original.height / original.width) * renderWidth);
      return (
        <Image
          src={urlBuilder.width(renderWidth).fit("max").url()}
          alt={alt ?? image.alt ?? ""}
          width={renderWidth}
          height={renderHeight}
          sizes={sizes}
          className={className}
          priority={priority}
        />
      );
    }
  }

  const src = urlBuilder.width(width).height(height).url();
  return (
    <Image
      src={src}
      alt={alt ?? image.alt ?? ""}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}
