import Link from "next/link";
import { stegaClean } from "next-sanity";

import { Container } from "@/components/layout/container";
import { SanityImage } from "@/components/sanity-image";
import { cn } from "@/lib/cn";
import type { EtusivuData } from "@/lib/types";

/**
 * Etusivun hero (tyyliopas Sivut v3, osio 1).
 *
 * Yönsininen pohja: yläotsake, H1 (Source Serif 66 px / 1.04), ingressi 20 px
 * ja kaksi alleviivattua tekstilinkkiä vasemmassa reunassa.
 *
 * Kuva on koko osion taustana. Sen päällä on yönsininen liukuväri, joka on
 * tekstin kohdalla lähes peittävä (tekstin kontrasti AA vaaleallakin kuvalla)
 * ja haalenee oikealle, jotta kuva näkyy. Mobiilissa teksti on koko leveydellä,
 * joten peitto on tasainen. Kuva rajataan toimittajan polttopisteen mukaan.
 *
 * Tämä on sivun LCP-elementti: kuva ladataan priority-lipulla. Se on
 * absoluuttisesti sijoitettu, joten latautuminen ei siirrä taittoa.
 */
export function Hero({ data }: { data: EtusivuData }) {
  const ctas = data.heroCtas ?? [];
  const hasImage = Boolean(data.heroImage?.asset);

  return (
    <section className="relative isolate overflow-hidden bg-chrome text-on-chrome">
      {hasImage && (
        <>
          <SanityImage
            image={data.heroImage!}
            // Taustakuva: sisältö on tekstissä, ruudunlukija ohittaa kuvan.
            alt=""
            width={2400}
            crop={false}
            sizes="100vw"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
            priority
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-chrome/85 lg:bg-transparent lg:bg-linear-to-r lg:from-chrome/95 lg:from-35% lg:via-chrome/75 lg:via-60% lg:to-chrome/35"
          />
          {/* Alareunan häivytys: osio päättyy tasaisesti yönsiniseen. */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-linear-to-t from-chrome/70 to-transparent"
          />
        </>
      )}
      <Container
        size="wide"
        className={cn(
          "flex items-center pb-10 pt-12 sm:pb-24 sm:pt-28",
          hasImage && "min-h-[480px] sm:min-h-[560px] lg:min-h-[640px]",
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
                  // Stega pois hrefistä (luonnosnäkymä); nimi jää muokattavaksi.
                  href={stegaClean(cta.href)}
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

      </Container>
    </section>
  );
}
