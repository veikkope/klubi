import Link from "next/link";

import { Container } from "@/components/layout/container";
import { SanityImage } from "@/components/sanity-image";
import { cn } from "@/lib/cn";
import type { EtusivuData } from "@/lib/types";

/**
 * Etusivun hero (tyyliopas Sivut v3, osio 1).
 *
 * Yönsininen pohja, kaksi saraketta (1,15fr / 1fr, väli 80 px): yläotsake,
 * H1 (Source Serif 66 px / 1.04), ingressi 20 px ja kaksi alleviivattua
 * tekstilinkkiä. Oikealla 4:5 pystykuva (max 560 px), mobiilissa kuva tekstin
 * alla 4:3-muodossa. Ilman kuvaa teksti on yksin.
 *
 * Tämä on sivun LCP-elementti: kuva ladataan priority-lipulla ja sen kuvasuhde
 * on kiinteä, joten latautuminen ei siirrä taittoa.
 */
export function Hero({ data }: { data: EtusivuData }) {
  const ctas = data.heroCtas ?? [];
  const hasImage = Boolean(data.heroImage?.asset);

  return (
    <section className="bg-chrome text-on-chrome">
      <Container
        size="wide"
        className={cn(
          "grid items-center gap-8 pb-10 pt-12 sm:pb-24 sm:pt-28 lg:gap-20",
          hasImage && "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]",
        )}
      >
        <div className="flex max-w-3xl flex-col gap-[18px] sm:gap-[26px]">
          {data.heroEyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-chrome-eyebrow sm:text-sm">
              {data.heroEyebrow}
            </p>
          )}

          <h1 className="text-pretty text-[2.375rem] leading-[1.08] text-on-chrome sm:text-6xl sm:leading-[1.04] xl:text-[4.125rem]">
            {data.heroTitle}
          </h1>

          <p className="max-w-[560px] text-pretty text-[17px] leading-[1.6] text-on-chrome-muted sm:text-xl sm:leading-[1.65]">
            {data.heroDescription}
          </p>

          {ctas.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-x-8 gap-y-3">
              {ctas.map((cta) => (
                <Link
                  key={`${cta.href}-${cta.label}`}
                  href={cta.href}
                  className={cn(
                    "text-[17px] font-semibold underline underline-offset-[5px] transition hover:decoration-2",
                    cta.primary
                      ? "text-on-chrome hover:text-on-chrome"
                      : "text-on-chrome-muted hover:text-on-chrome",
                  )}
                >
                  {cta.label}&nbsp;<span aria-hidden>→</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {hasImage && (
          <SanityImage
            image={data.heroImage!}
            width={900}
            height={1125}
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="aspect-[4/3] w-full rounded-sm object-cover lg:aspect-[4/5] lg:max-h-[560px]"
            priority
          />
        )}
      </Container>
    </section>
  );
}
