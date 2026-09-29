import Link from "next/link";

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
}: {
  restaurant: RavintolaCardData;
}) {
  const rating = overallRating(r);
  const isClosed = r.closed === true;
  const meta = [r.city?.name, r.priceLevel].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/ravintolat/${r.slug}`}
      className={cn(
        "group grid w-full grid-cols-[80px_1fr] items-center gap-3.5 overflow-hidden rounded-sm border-t-[3px] border-t-brass bg-surface p-[18px] no-underline transition hover:shadow-panel",
        "sm:flex sm:flex-col sm:items-stretch sm:gap-0 sm:border-t-0 sm:p-0",
        isClosed && "opacity-85",
      )}
    >
      {r.image?.asset ? (
        <SanityImage
          image={r.image}
          width={640}
          height={480}
          sizes="(min-width: 1024px) 420px, (min-width: 640px) 45vw, 80px"
          className="aspect-square w-full rounded-sm object-cover sm:aspect-[4/3] sm:rounded-none"
        />
      ) : (
        <span aria-hidden className="aspect-square w-full rounded-sm bg-brass-tint sm:hidden" />
      )}

      <div className="flex min-w-0 flex-col gap-1.5 sm:flex-1 sm:gap-2.5 sm:border-t-[3px] sm:border-t-brass sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          {rating !== null && (
            <span className="inline-flex items-center gap-2 sm:gap-2.5">
              <RatingDots value={rating} size="sm" className="sm:hidden" />
              <RatingDots value={rating} size="lg" className="max-sm:hidden" />
              {/* Pisteiden aria-label kertoo jo tarkan arvon ruudunlukijalle. */}
              <span
                aria-hidden
                className="font-display text-[15px] font-semibold leading-none tabular-nums text-brass-text sm:text-lg"
              >
                {formatRating(rating)}
              </span>
            </span>
          )}
          {meta && <span className="hidden text-sm text-muted-soft sm:inline">{meta}</span>}
        </div>
        <h3 className="font-display text-[1.1875rem] leading-[1.25] text-heading group-hover:text-accent sm:text-2xl">
          {r.name}
        </h3>
        <p className="text-[13px] text-muted-soft sm:hidden">
          {[r.city?.name, r.stadionHuomio ?? r.priceLevel].filter(Boolean).join(" · ")}
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
