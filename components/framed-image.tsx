import { SanityImage } from "@/components/sanity-image";
import { cn } from "@/lib/cn";
import type { SanityImage as SanityImageData } from "@/lib/types";
import { urlForImage } from "@/sanity/lib/image";

type Props = {
  image: SanityImageData;
  alt?: string;
  /** Kuvan enimmäisleveys CDN:ltä. */
  width?: number;
  sizes?: string;
  /** Kehyksen luokat: mittasuhde (esim. `aspect-[4/3]`), pyöristys, leveys. */
  className?: string;
  priority?: boolean;
  /** Näkyvä kuvateksti: alt jätetään tyhjäksi, jos se on sama (ks. SanityImage). */
  kuvateksti?: string | null;
};

/**
 * Kuva kokonaisena kiinteässä kehyksessä: ketään ei rajata pois.
 *
 * Käytössä kaikissa sisältökuvissa, joilla on kiinteä kehys (kortit, kansikuvat,
 * kuvaruudukot). Poikkeukset: pienet esikatselut, jotka avaavat koko kuvan
 * (albumin ja arvostelujen ruudut, ravintolakortin 80 px mobiilikuva),
 * hallituksen pyöreät muotokuvat ja koristeelliset taustakuvat.
 *
 * Kuvat ovat vanhalta sivustolta, ja niiden muodot vaihtelevat
 * (3:2, 4:3, pysty- ja leveät kuvat), eikä niihin ole asetettu polttopisteitä.
 * Kehyksen muotoon rajaaminen (`object-cover`) leikkasi siksi ihmisiä pois.
 * Tässä kuva näytetään kokonaan (`object-contain`), ja kehykseen jäävä tila
 * täytetään saman kuvan sumennetulla, hieman tummennetulla versiolla.
 * Kehykset pysyvät yhtä suurina, joten ruudukko ei rikkoudu.
 */
export function FramedImage({ image, alt, width = 1200, sizes, className, priority, kuvateksti }: Props) {
  const backdrop = urlForImage(image)?.width(96).blur(40).url();

  return (
    <div className={cn("relative isolate overflow-hidden bg-surface-strong", className)}>
      {backdrop && (
        <div
          aria-hidden
          className="absolute inset-0 -z-10 scale-110 bg-cover bg-center opacity-90 brightness-[0.8]"
          style={{ backgroundImage: `url(${backdrop})` }}
        />
      )}
      <SanityImage
        image={image}
        alt={alt}
        width={width}
        crop={false}
        sizes={sizes}
        kuvateksti={kuvateksti}
        className="absolute inset-0 h-full w-full object-contain"
        priority={priority}
      />
    </div>
  );
}
