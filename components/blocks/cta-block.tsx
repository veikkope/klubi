import { Container } from "@/components/layout/container";
import { LinkButton } from "@/components/ui/button";
import type { EtusivuBlock } from "@/lib/types";

type Props = Extract<EtusivuBlock, { _type: "cta" }>;

/**
 * Etusivun päätösbanneri — yleensä "Liity jäseneksi".
 *
 * Tumma pinta erottaa sen sisältölohkoista ja päättää sivun samaan syvään
 * siniseen josta hero alkaa.
 */
export function CtaBlock(props: Props) {
  return (
    <section
      className="relative isolate overflow-hidden bg-brand-950 py-20 text-white sm:py-24"
      aria-labelledby={`etusivu-cta-${props._key}`}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(100%_140%_at_85%_0%,rgba(59,130,246,0.35),transparent_60%)]"
      />
      <Container size="wide">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2
              id={`etusivu-cta-${props._key}`}
              className="text-balance font-serif text-3xl leading-tight sm:text-4xl"
            >
              {props.heading}
            </h2>
            {props.body && (
              <p className="mt-3 text-pretty text-lg leading-relaxed text-brand-100">
                {props.body}
              </p>
            )}
          </div>
          <LinkButton
            href={props.ctaHref}
            size="lg"
            variant="primary"
            className="!bg-white !text-brand-900 hover:!bg-brand-50"
          >
            {props.ctaLabel}
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
