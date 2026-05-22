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
};

export function SanityImage({
  image,
  alt,
  width = 1200,
  height = 800,
  sizes,
  className,
  priority,
}: Props) {
  if (!image) return null;
  const urlBuilder = urlForImage(image);
  if (!urlBuilder) return null;
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
