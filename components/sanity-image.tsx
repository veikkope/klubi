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
   * `true` (oletus) = CDN rajaa kuvan `width`×`height`-mittasuhteeseen
   * toimittajan polttopisteen (hotspot) ja rajauksen mukaan.
   * `false` = näytä koko kuva rajaamatta (kaaviot, taulukkokuvat, otteluohjelmat).
   * Mittasuhde luetaan assetin viittauksesta (`image-<hash>-<L>x<K>-<pääte>`),
   * ja `width` on silloin enimmäisleveys.
   */
  crop?: boolean;
  /**
   * Kuvateksti, jonka kutsuja näyttää kuvan yhteydessä (`figcaption`). Jos
   * alt-teksti on sama, alt jätetään tyhjäksi, jottei ruudunlukija lue samaa
   * tekstiä kahdesti (migroidussa sisällössä alt = kuvateksti usein).
   */
  kuvateksti?: string | null;
  /**
   * `true` (oletus) = kuvan paikalla näkyy sen sumea esikatselu, kunnes kuva on
   * latautunut (vaatii kyselyssä `lqip`-kentän, ks. sanity/lib/queries/kuvat.ts).
   * `false`, kun kutsuja näyttää esikatselun itse (`FramedImage`).
   */
  esikatselu?: boolean;
};

/**
 * next/image-propsit sumealle esikatselulle. Next piirtää data-URL:n SVG-sumennuksen
 * läpi taustakuvaksi ja poistaa sen, kun varsinainen kuva on ladattu.
 */
function esikatseluProps(image: SanityImageData, kaytossa: boolean) {
  const lqip = kaytossa ? image?.lqip : null;
  return lqip ? { placeholder: "blur" as const, blurDataURL: lqip } : {};
}

const vertailtava = (s: string) => s.trim().replace(/\s+/g, " ").toLocaleLowerCase("fi");

/** Alt-teksti: tyhjä, jos se toistaa näkyvän kuvatekstin. */
export function kuvanAlt(alt: string | null | undefined, kuvateksti?: string | null): string {
  if (!alt) return "";
  return kuvateksti && vertailtava(alt) === vertailtava(kuvateksti) ? "" : alt;
}

/** Sanityn asset-viittaus sisältää alkuperäiset mitat: image-abc-1200x800-jpg. */
function assetDimensions(image: SanityImageData): { width: number; height: number } | null {
  const ref = image?.asset?._ref ?? image?.asset?._id ?? "";
  const match = /-(\d+)x(\d+)-[a-z0-9]+$/i.exec(ref);
  if (!match) return null;
  return { width: Number(match[1]), height: Number(match[2]) };
}

type Rajaus = { top: number; bottom: number; left: number; right: number };

/**
 * Polttopisteen sijainti CDN:n rajaamassa kuvassa CSS:n `object-position`-arvoksi.
 * Laskee saman `rect`-alueen kuin @sanity/image-url, jotta kun CSS-mittasuhde
 * vaihtuu breakpointissa (esim. `aspect-[4/3] lg:aspect-[4/5]`), selain rajaa
 * silti polttopisteen ympäriltä eikä kuvan keskeltä.
 */
function focalPosition(
  image: SanityImageData,
  width: number,
  height: number,
): string | undefined {
  const hotspot = image?.hotspot;
  const original = image ? assetDimensions(image) : null;
  if (!hotspot || !original) return undefined;
  const c = (image as { crop?: Rajaus | null }).crop ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const cropLeft = c.left * original.width;
  const cropTop = c.top * original.height;
  const cropWidth = original.width - c.right * original.width - cropLeft;
  const cropHeight = original.height - c.bottom * original.height - cropTop;
  const hx = hotspot.x * original.width;
  const hy = hotspot.y * original.height;
  const ratio = width / height;
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

  let rect: { left: number; top: number; width: number; height: number };
  if (cropWidth / cropHeight > ratio) {
    const w = cropHeight * ratio;
    rect = { left: clamp(hx - w / 2, cropLeft, cropLeft + cropWidth - w), top: cropTop, width: w, height: cropHeight };
  } else {
    const h = cropWidth / ratio;
    rect = { left: cropLeft, top: clamp(hy - h / 2, cropTop, cropTop + cropHeight - h), width: cropWidth, height: h };
  }
  const x = clamp((hx - rect.left) / rect.width, 0, 1) * 100;
  const y = clamp((hy - rect.top) / rect.height, 0, 1) * 100;
  return `${x.toFixed(1)}% ${y.toFixed(1)}%`;
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
  kuvateksti,
  esikatselu = true,
}: Props) {
  if (!image) return null;
  const urlBuilder = urlForImage(image);
  if (!urlBuilder) return null;

  if (!crop) {
    const original = assetDimensions(image);
    if (original) {
      const renderWidth = Math.min(width, original.width);
      const renderHeight = Math.round((original.height / original.width) * renderWidth);
      // Jos CSS rajaa kuvan (object-cover), polttopiste pysyy näkyvissä.
      const hotspot = image.hotspot;
      return (
        <Image
          src={urlBuilder.width(renderWidth).fit("max").url()}
          alt={kuvanAlt(alt ?? image.alt, kuvateksti)}
          width={renderWidth}
          height={renderHeight}
          sizes={sizes}
          className={className}
          style={hotspot ? { objectPosition: `${hotspot.x * 100}% ${hotspot.y * 100}%` } : undefined}
          priority={priority}
          {...esikatseluProps(image, esikatselu)}
        />
      );
    }
  }

  // Rajaus tehdään Sanityn CDN:ssä: kun sekä leveys että korkeus annetaan,
  // @sanity/image-url laskee `rect`-alueen kuvan `crop`- ja `hotspot`-tiedoista,
  // joten toimittajan valitsema polttopiste säilyy. `width`/`height` pitää siksi
  // vastata kutsujan CSS-mittasuhdetta (esim. `aspect-[4/5]` → 900×1125).
  const src = urlBuilder.width(width).height(height).fit("crop").url();
  const objectPosition = focalPosition(image, width, height);
  return (
    <Image
      src={src}
      alt={kuvanAlt(alt ?? image.alt, kuvateksti)}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      style={objectPosition ? { objectPosition } : undefined}
      priority={priority}
      {...esikatseluProps(image, esikatselu)}
    />
  );
}
