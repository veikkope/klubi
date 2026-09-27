import { Container } from "@/components/layout/container";
import { ArrowLink, Eyebrow } from "@/components/blocks/block-heading";
import { SanityImage } from "@/components/sanity-image";
import { PortableText } from "@/components/portable-text";
import type { EtusivuBlock } from "@/lib/types";

type Props = Extract<EtusivuBlock, { _type: "esittely" }>;

/**
 * "Klubista" (tyyliopas Sivut v3, osio 5): valkoinen osio, kuva vasemmalla
 * (4:3), oikealla yläotsake, serif 40 px otsikko, kappale ja tekstilinkki.
 *
 * Kaikki teksti tulee Sanitysta. Pelkkä otsikko ilman tekstiä tai kuvaa ei
 * ole sisältöä, joten lohko jätetään silloin renderöimättä.
 */
export function EsittelyBlock(props: Props) {
  const hasImage = Boolean(props.image?.asset);
  const hasBody = Boolean(props.body && props.body.length > 0);
  const hasCta = Boolean(props.ctaLabel && props.ctaHref);

  if (!hasBody && !hasImage) return null;

  return (
    <section
      className="bg-surface py-11 sm:py-24"
      aria-labelledby={props.heading ? "etusivu-esittely" : undefined}
    >
      <Container
        size="wide"
        className={
          hasImage
            ? "grid items-center gap-8 lg:grid-cols-2 lg:gap-20"
            : undefined
        }
      >
        {hasImage && (
          <SanityImage
            image={props.image!}
            width={1000}
            height={750}
            sizes="(min-width: 1024px) 640px, 100vw"
            className="aspect-[4/3] w-full rounded-sm object-cover"
          />
        )}

        <div className="flex max-w-2xl flex-col gap-4 sm:gap-[22px]">
          {props.eyebrow && <Eyebrow>{props.eyebrow}</Eyebrow>}
          {props.heading && (
            <h2
              id="etusivu-esittely"
              className="text-pretty font-display text-[1.75rem] leading-[1.15] text-heading sm:text-[2.5rem]"
            >
              {props.heading}
            </h2>
          )}

          {hasBody && (
            <div className="text-muted [&_p]:leading-[1.7] [&_p]:text-muted">
              <PortableText value={props.body!} />
            </div>
          )}

          {hasCta && (
            <ArrowLink href={props.ctaHref!} className="self-start">
              {props.ctaLabel}
            </ArrowLink>
          )}
        </div>
      </Container>
    </section>
  );
}
