import { Container } from "@/components/layout/container";
import { LinkButton } from "@/components/ui/button";
import { SanityImage } from "@/components/sanity-image";
import { PortableText } from "@/components/portable-text";
import type { EtusivuBlock } from "@/lib/types";

type Props = Extract<EtusivuBlock, { _type: "esittely" }>;

/**
 * Klubin lyhyt esittely + polku `/klubi`-osioon.
 *
 * Kaikki teksti tulee Sanitysta. Pelkkä otsikko ilman tekstiä tai kuvaa ei
 * ole sisältöä, joten lohko jätetään silloin renderöimättä — etusivulle ei
 * keksitä täytetekstiä koodissa.
 */
export function EsittelyBlock(props: Props) {
  const hasImage = Boolean(props.image?.asset);
  const hasBody = Boolean(props.body && props.body.length > 0);
  const hasCta = Boolean(props.ctaLabel && props.ctaHref);

  if (!hasBody && !hasImage) return null;

  return (
    <section
      className="py-20 sm:py-24"
      aria-labelledby={props.heading ? "etusivu-esittely" : undefined}
    >
      <Container size="wide">
        <div
          className={
            hasImage
              ? "grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16"
              : "max-w-3xl"
          }
        >
          <div>
            {props.heading && (
              <h2
                id="etusivu-esittely"
                className="font-serif text-3xl leading-tight sm:text-4xl"
              >
                {props.heading}
              </h2>
            )}

            {hasBody && (
              <div className="mt-5 max-w-2xl text-lg">
                <PortableText value={props.body!} />
              </div>
            )}

            {hasCta && (
              <div className="mt-8">
                <LinkButton href={props.ctaHref!} size="lg" variant="primary">
                  {props.ctaLabel}
                </LinkButton>
              </div>
            )}
          </div>

          {hasImage && (
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <SanityImage
                image={props.image!}
                width={1000}
                height={750}
                sizes="(min-width: 1024px) 512px, 100vw"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
