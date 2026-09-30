import Link from "next/link";
import { stegaClean } from "next-sanity";

import { Container } from "@/components/layout/container";
import { SanityImage } from "@/components/sanity-image";
import { Nuoli } from "@/components/ui/nuoli";
import { cn } from "@/lib/cn";
import type { EtusivuData } from "@/lib/types";

/**
 * Etusivun hero (tyyliopas Sivut v3, osio 1).
 *
 * Yläotsake, H1 (Source Serif 66 px / 1.04), ingressi 20 px ja kaksi
 * alleviivattua tekstilinkkiä vasemmassa reunassa.
 *
 * Kuva täyttää koko osion omissa väreissään. Tekstin luettavuus hoidetaan
 * neutraalilla (musta, ei sininen) tummennuksella, joka on vahvin tekstin
 * takana ja häviää oikealle, sekä tekstin varjolla. Mobiilissa teksti on koko
 * leveydellä, joten tummennus on tasainen. Kuva rajataan toimittajan
 * polttopisteen mukaan. Ilman kuvaa pohja on yönsininen.
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
            // Tulosteessa ei taustakuvaa: musta teksti jäisi kuvan päälle.
            className="absolute inset-0 -z-20 h-full w-full object-cover print:hidden"
            priority
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-black/55 print:hidden lg:bg-transparent lg:bg-linear-to-r lg:from-black/75 lg:from-10% lg:via-black/55 lg:via-55% lg:to-transparent lg:to-90%"
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
        <div
          className={cn(
            "flex max-w-3xl flex-col gap-[18px] sm:gap-[26px]",
            hasImage && "[text-shadow:0_1px_2px_rgb(0_0_0/0.6),0_2px_24px_rgb(0_0_0/0.45)]",
          )}
        >
          {data.heroEyebrow && (
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-[0.12em] sm:text-sm",
                // Laventeli katoaa kirjavaan kuvaan; kuvan päällä valkoinen.
                hasImage ? "text-on-chrome" : "text-on-chrome-eyebrow",
              )}
            >
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
                    "group/linkki text-[17px] font-semibold underline decoration-1 underline-offset-[5px] transition hover:decoration-2",
                    cta.primary
                      ? "text-on-chrome hover:text-on-chrome"
                      : "text-on-chrome-muted hover:text-on-chrome",
                  )}
                >
                  {cta.label}&nbsp;<Nuoli />
                </Link>
              ))}
            </div>
          )}
        </div>

      </Container>
    </section>
  );
}
