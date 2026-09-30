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
  /** Sivun pääkuva (LCP): ladataan heti korkealla prioriteetilla (ks. SanityImage). */
  priority?: boolean;
  /** Näkyvissä heti, mutta ei pääkuva: ladataan heti (ei lazy). */
  eager?: boolean;
  /** Näkyvä kuvateksti: alt jätetään tyhjäksi, jos se on sama (ks. SanityImage). */
  kuvateksti?: string | null;
};

/**
 * Kuvan hidas 3 %:n lähennys, kun sen sisältävää korttia (`group/kortti`)
 * osoitetaan. Vain hiirellä (Tailwindin hover-variantti) ja kun käyttäjä ei
 * ole pyytänyt vähemmän liikettä.
 */
export const korttiZoom =
  "transition-transform duration-500 ease-out motion-safe:group-hover/kortti:scale-[1.03]";

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
export function FramedImage({ image, alt, width = 1200, sizes, className, priority, eager, kuvateksti }: Props) {
  // Tausta on kuvan sumea esikatselu (lqip, HTML:ssä valmiina), joten kehys
  // täyttyy heti eikä odota verkkopyyntöä. Se toimii samalla latauksen
  // paikanpitäjänä: terävä kuva piirtyy sen päälle. 20 px:n esikatselu
  // sumennetaan CSS:llä; ilman sitä (vanha kysely) haetaan sumennettu kuva CDN:stä.
  const lqip = image?.lqip;
  const backdrop = lqip ?? urlForImage(image)?.width(96).blur(40).url();

  return (
    <div className={cn("relative isolate overflow-hidden bg-surface-strong", className)}>
      {backdrop && (
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 -z-10 scale-110 bg-cover bg-center opacity-90 brightness-[0.8]",
            // Suurennus peittää sumennuksen läpikuultavat reunat.
            lqip && "scale-125 blur-xl",
          )}
          style={{ backgroundImage: `url("${backdrop}")` }}
        />
      )}
      <SanityImage
        image={image}
        alt={alt}
        width={width}
        crop={false}
        sizes={sizes}
        kuvateksti={kuvateksti}
        // Kortissa (group/kortti) kuva lähenee hoverissa hieman; muualla ei.
        className={cn("absolute inset-0 h-full w-full object-contain", korttiZoom)}
        priority={priority}
        eager={eager}
        esikatselu={false}
      />
    </div>
  );
}
