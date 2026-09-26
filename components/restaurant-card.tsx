import { Card, CardArrow, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/stars";
import { SanityImage } from "@/components/sanity-image";
import { cn } from "@/lib/cn";
import { cuisineLabel } from "@/lib/ravintola-cuisines";
import type { RavintolaCardData } from "@/sanity/lib/queries/ravintolat";

/**
 * Ravintolakortti hakemistoon ja etusivun nostoon.
 *
 * Kortti näyttää sekä kokonaisarvosanan että kolme osa-arviota. Osa-arviot
 * (Ruoka / Hinta / Viihtyvyys) ovat vanhan sivuston arvokkainta dataa — 476
 * ravintolalla on ne — joten ne eivät jää pelkälle yksittäissivulle.
 */

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

/** Pyöreä arvosanamerkki. Sama visuaali kortilla ja yksittäissivulla. */
export function RatingBadge({
  value,
  size = "md",
  className,
}: {
  value: number;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-brand-50 font-serif text-brand-800 tabular-nums",
        size === "lg" ? "size-20 text-3xl" : "size-12 text-lg",
        className,
      )}
    >
      <span className="sr-only">Kokonaisarvosana </span>
      {formatRating(value)}
      <span className="sr-only"> / 5</span>
    </span>
  );
}

/** Osa-arviot tekstirivinä. Kompakti muoto korttiin. */
export function SubRatingList({
  restaurant,
  className,
}: {
  restaurant: Parameters<typeof subRatings>[0];
  className?: string;
}) {
  const items = subRatings(restaurant);
  if (items.length === 0) return null;
  return (
    <dl className={cn("flex flex-wrap gap-x-4 gap-y-1 text-sm", className)}>
      {items.map((item) => (
        <div key={item.key} className="flex items-baseline gap-1.5">
          <dt className="text-muted">{item.label}</dt>
          <dd className="font-medium text-foreground tabular-nums">
            {formatRating(item.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function RestaurantCard({
  restaurant: r,
}: {
  restaurant: RavintolaCardData;
}) {
  const rating = overallRating(r);
  const isClosed = r.closed === true;

  return (
    <Card
      href={`/ravintolat/${r.slug}`}
      className={cn("flex h-full flex-col", isClosed && "opacity-90")}
    >
      {r.image?.asset && (
        <div className="-m-6 mb-4 overflow-hidden rounded-t-2xl">
          <SanityImage
            image={r.image}
            width={600}
            height={360}
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 92vw"
            className="h-44 w-full object-cover"
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="leading-snug">{r.name}</CardTitle>
          <p className="mt-1 text-sm text-muted">
            {r.city?.name ?? "Sijainti ei tiedossa"}
          </p>
        </div>
        {rating !== null && <RatingBadge value={rating} />}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {typeof r.stars === "number" && <Stars value={r.stars} />}
        {r.priceLevel && <Badge tone="muted">{r.priceLevel}</Badge>}
        {isClosed && <Badge tone="neutral">Toiminta loppunut</Badge>}
      </div>

      {r.tiivistelma && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
          {r.tiivistelma}
        </p>
      )}

      <SubRatingList restaurant={r} className="mt-3" />

      {r.cuisine && r.cuisine.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {r.cuisine.slice(0, 3).map((c) => (
            <Badge key={c} tone="brand">
              {cuisineLabel(c)}
            </Badge>
          ))}
          {r.cuisine.length > 3 && (
            <Badge tone="muted">+{r.cuisine.length - 3}</Badge>
          )}
        </div>
      )}

      <div className="mt-auto">
        <CardArrow label="Lue arvostelu" />
      </div>
    </Card>
  );
}
