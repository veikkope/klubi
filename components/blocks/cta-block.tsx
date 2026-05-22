import { Container } from "@/components/layout/container";
import { LinkButton } from "@/components/ui/button";
import type { EtusivuBlock } from "@/lib/types";

type Props = Extract<EtusivuBlock, { _type: "cta" }>;

export function CtaBlock(props: Props) {
  return (
    <section className="bg-brand-950 py-20 text-white">
      <Container>
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl leading-tight sm:text-4xl">
              {props.heading}
            </h2>
            {props.body && (
              <p className="mt-3 text-lg text-brand-100">{props.body}</p>
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
