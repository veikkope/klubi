import { stegaClean } from "next-sanity";

import { Container } from "@/components/layout/container";
import { LinkButton } from "@/components/ui/button";
import type { EtusivuBlock } from "@/lib/types";

type Props = Extract<EtusivuBlock, { _type: "cta" }>;

/**
 * Etusivun päätösbanneri, esim. kehote tuleviin otteluihin.
 *
 * Yönsininen paneeli erottaa sen sisältölohkoista. Paneeli eikä täysleveä
 * pinta, jotta se ei sulaudu samanväriseen footeriin.
 */
export function CtaBlock(props: Props) {
  return (
    <section
      className="py-16 sm:py-20"
      aria-labelledby={`etusivu-cta-${props._key}`}
    >
      <Container size="wide">
        <div className="flex flex-col items-start gap-8 rounded-2xl bg-chrome p-8 text-on-chrome shadow-panel sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2
              id={`etusivu-cta-${props._key}`}
              className="font-display text-[1.75rem] leading-[1.2] text-on-chrome sm:text-[2rem]"
            >
              {props.heading}
            </h2>
            {props.body && (
              <p className="mt-3 text-pretty text-lg leading-relaxed text-on-chrome-muted">
                {props.body}
              </p>
            )}
          </div>
          <LinkButton
            // Stega pois hrefistä (luonnosnäkymä); teksti jää muokattavaksi.
            href={stegaClean(props.ctaHref)}
            size="lg"
            variant="onDarkPrimary"
          >
            {props.ctaLabel}
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
