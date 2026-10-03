import Link from "next/link";

import { FramedImage, korttiZoom } from "@/components/framed-image";
import { KuvaSiirtyma } from "@/components/sivunvaihto";
import { RatingDots } from "@/components/ui/rating-dots";
import { SanityImage } from "@/components/sanity-image";
import { cn } from "@/lib/cn";
import type { RavintolaCardData } from "@/sanity/lib/queries/ravintolat";

/** Suomalainen desimaalipilkku: 4.2 → "4,2". */
export function formatRating(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

/** Kokonaisarvosana: `ratingOverall` ensisijaisesti, tähdet varalla. */
export function overallRating(r: {
  ratingOverall?: number | null;
  stars?: number | null;
}): number | null {
  if (typeof r.ratingOverall === "number") return r.ratingOverall;
  if (typeof r.stars === "number") return r.stars;
  return null;
}

export const SUB_RATING_LABELS = {
  ratingFood: "Ruoka",
  ratingPrice: "Hinta",
  ratingAtmosphere: "Viihtyvyys",
} as const;

export type SubRatingKey = keyof typeof SUB_RATING_LABELS;

export function subRatings(r: {
  ratingFood?: number | null;
  ratingPrice?: number | null;
  ratingAtmosphere?: number | null;
}): { key: SubRatingKey; label: string; value: number }[] {
  const result: { key: SubRatingKey; label: string; value: number }[] = [];
  for (const key of Object.keys(SUB_RATING_LABELS) as SubRatingKey[]) {
    const value = r[key];
    if (typeof value === "number") {
      result.push({ key, label: SUB_RATING_LABELS[key], value });
    }
  }
  return result;
}

/** Tuorein arvio kortissa: "2026-08-29" → "arvioitu 8/2026". */
function arvioituKuukausi(iso: string | null | undefined): string | null {
  const osat = iso?.match(/^(\d{4})-(\d{2})/);
  return osat ? `arvioitu ${Number(osat[2])}/${osat[1]}` : null;
}

/**
 * Arviokortti (tyyliopas Sivut v3: "Ravintola-arviot").
 *
 * Tietokoneella pystykortti: 4:3 kuva, 3 px messinkinen yläreuna, arvosana-
 * pisteet ja arvosana numerona (esim. "4,2") + kaupunki · hintataso, nimi (serif 24 px), yhden rivin tuomio ja
 * valinnainen tagi. Mobiilissa vaakakortti 80 px pikkukuvalla. Messinki on
 * ruoan ja ravintoloiden kategoriaväri.
 */
export function RestaurantCard({
  restaurant: r,
  korostus,
}: {
  restaurant: RavintolaCardData;
  /**
   * Osa-arvosana, joka näytetään kokonaisarvosanan lisäksi, esim. "Ruoka 4,3"
   * Paras ruoka -listalla (`?lista=ruoka`). Puuttuva arvo jätetään näyttämättä.
   */
  korostus?: SubRatingKey;
}) {
  const rating = overallRating(r);
  const osa = korostus && typeof r[korostus] === "number" ? r[korostus] : null;
  const isClosed = r.closed === true;
  const kayty = arvioituKuukausi(r.tuoreinArvio);
  const meta = [r.city?.name, r.priceLevel, kayty].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/ravintolat/${r.slug}`}
      className={cn(
        "group group/kortti grid w-full grid-cols-[80px_1fr] items-center gap-3.5 overflow-hidden rounded-sm border-t-[3px] border-t-brass bg-surface p-[18px] no-underline transition hover:shadow-panel",
        "sm:flex sm:flex-col sm:items-stretch sm:gap-0 sm:border-t-0 sm:p-0",
        // Lopettanut paikka: vain kuva haalistetaan. Koko kortin läpinäkyvyys
        // pudotti pienet tekstit alle AA-kontrastin (docs/16, saavutettavuus-9).
        isClosed && "[&_img]:grayscale [&_img]:opacity-80",
      )}
    >
      {r.image?.asset ? (
        // Siirtymän nimi on yhteisellä kehyksellä, joka on aina näkyvissä:
        // mobiilissa se on pikkukuvan ruutu, isolla näytöllä ison kuvan.
        // Näin kuva liukuu arviosivun isoksi kuvaksi (ja takaisin) myös
        // puhelimella. Jos nimi olisi vain piilotetulla isolla kuvalla,
        // arviosivun kuva jäisi puhelimella yksinään kaiken päälle häipymään.
        <KuvaSiirtyma nimi={`ravintola-${r.slug}`}>
          <div className="sm:w-full">
            {/* Mobiilin 80 px pikkukuva rajataan neliöksi; isossa kortissa kuva näkyy kokonaan. */}
            <SanityImage
              image={r.image}
              width={160}
              height={160}
              sizes="80px"
              className={cn("aspect-square w-full rounded-sm object-cover sm:hidden", korttiZoom)}
            />
            <FramedImage
              image={r.image}
              width={840}
              sizes="(min-width: 1024px) 420px, 45vw"
              className="aspect-[4/3] w-full max-sm:hidden"
            />
          </div>
        </KuvaSiirtyma>
      ) : (
        <span aria-hidden className="aspect-square w-full rounded-sm bg-brass-tint sm:hidden" />
      )}

      <div className="flex min-w-0 flex-col gap-1.5 sm:flex-1 sm:gap-2.5 sm:border-t-[3px] sm:border-t-brass sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          {(rating !== null || osa !== null) && (
            <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 sm:gap-x-2.5">
              {rating !== null && (
                <>
                  <RatingDots value={rating} size="sm" className="sm:hidden" />
                  <RatingDots value={rating} size="lg" className="max-sm:hidden" />
                  {/* Pisteiden aria-label kertoo jo tarkan arvon ruudunlukijalle. */}
                  <span
                    aria-hidden
                    className="font-display text-[15px] font-semibold leading-none tabular-nums text-brass-text sm:text-lg"
                  >
                    {formatRating(rating)}
                  </span>
                </>
              )}
              {osa !== null && korostus && (
                <span className="rounded-xs bg-brass-tint px-2 py-1 text-xs font-semibold leading-none tabular-nums text-brass-tint-text sm:text-[13px]">
                  {SUB_RATING_LABELS[korostus]} {formatRating(osa)}
                </span>
              )}
            </span>
          )}
          {meta && <span className="hidden text-sm text-muted-soft sm:inline">{meta}</span>}
        </div>
        <h3 className="font-display text-[1.1875rem] leading-[1.25] text-heading group-hover:text-accent sm:text-2xl">
          {r.name}
        </h3>
        <p className="text-[13px] text-muted-soft sm:hidden">
          {[r.city?.name, isClosed ? "Toiminta loppunut" : (r.stadionHuomio ?? r.priceLevel), kayty]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {r.tuomio && (
          <p className="hidden text-base leading-[1.55] text-muted sm:block">{r.tuomio}</p>
        )}
        {(r.stadionHuomio || isClosed) && (
          <span
            className={cn(
              "hidden self-start rounded-xs px-2 py-1 text-xs font-semibold sm:inline-block",
              isClosed ? "bg-surface-strong text-muted" : "bg-blue-tint text-navy",
            )}
          >
            {isClosed ? "Toiminta loppunut" : r.stadionHuomio}
          </span>
        )}
      </div>
    </Link>
  );
}
