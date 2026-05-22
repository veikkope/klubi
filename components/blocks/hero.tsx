import { Container } from "@/components/layout/container";
import { LinkButton } from "@/components/ui/button";
import { SanityImage } from "@/components/sanity-image";
import type { EtusivuData } from "@/lib/types";

export function Hero({ data }: { data: EtusivuData }) {
  const ctas = data.heroCtas ?? [];
  const hasImage = Boolean(data.heroImage?.asset);

  return (
    <section className="relative isolate overflow-hidden bg-brand-950 text-white">
      {hasImage ? (
        <div className="absolute inset-0 -z-10">
          <SanityImage
            image={data.heroImage!}
            width={2000}
            height={1100}
            sizes="100vw"
            className="h-full w-full object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-950/70 via-brand-950/60 to-brand-950" />
        </div>
      ) : (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.35),_transparent_60%)]" />
      )}

      <Container className="py-24 sm:py-32 lg:py-40">
        {data.heroEyebrow && (
          <p className="text-sm uppercase tracking-[0.2em] text-brand-200">
            {data.heroEyebrow}
          </p>
        )}
        <h1 className="mt-4 font-serif text-5xl font-medium leading-tight sm:text-7xl">
          {data.heroTitle}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-100">
          {data.heroDescription}
        </p>
        {ctas.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-4">
            {ctas.map((cta) => (
              <LinkButton
                key={cta.href + cta.label}
                href={cta.href}
                size="lg"
                variant={cta.primary ? "primary" : "onDark"}
                className={cta.primary ? "!bg-white !text-brand-900 hover:!bg-brand-50" : undefined}
              >
                {cta.label}
              </LinkButton>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
