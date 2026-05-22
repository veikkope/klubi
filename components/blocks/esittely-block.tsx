import { Container } from "@/components/layout/container";
import { LinkButton } from "@/components/ui/button";
import { SanityImage } from "@/components/sanity-image";
import { PortableText } from "@/components/portable-text";
import type { EtusivuBlock } from "@/lib/types";

type Props = Extract<EtusivuBlock, { _type: "esittely" }>;

export function EsittelyBlock(props: Props) {
  const hasImage = Boolean(props.image?.asset);
  return (
    <section className="py-20">
      <Container>
        <div className={hasImage ? "grid gap-12 lg:grid-cols-2 lg:items-center" : ""}>
          <div>
            {props.heading && (
              <h2 className="font-serif text-3xl sm:text-4xl">{props.heading}</h2>
            )}
            <div className="mt-4 max-w-2xl">
              {props.body ? (
                <PortableText value={props.body} />
              ) : (
                <p className="text-lg text-muted">
                  Lahden Suomalainen Klubi ry uudistaa verkkosivunsa. Sisältö
                  siirretään vanhalta sivustolta vaiheittain.
                </p>
              )}
            </div>
            {props.ctaLabel && props.ctaHref && (
              <div className="mt-8">
                <LinkButton href={props.ctaHref} variant="primary">
                  {props.ctaLabel}
                </LinkButton>
              </div>
            )}
          </div>
          {hasImage && (
            <div className="overflow-hidden rounded-2xl">
              <SanityImage
                image={props.image!}
                width={1000}
                height={750}
                sizes="(min-width: 1024px) 480px, 100vw"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
