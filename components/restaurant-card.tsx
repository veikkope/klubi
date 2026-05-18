import { Card, CardArrow, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/stars";
import { SanityImage } from "@/components/sanity-image";
import { cuisineLabel } from "@/lib/ravintola-cuisines";
import type { RavintolaCard } from "@/lib/types";

export function RestaurantCard({ restaurant: r }: { restaurant: RavintolaCard }) {
  return (
    <Card href={`/ravintolat/${r.slug}`}>
      {r.image?.asset && (
        <div className="-m-6 mb-4 overflow-hidden rounded-t-2xl">
          <SanityImage
            image={r.image}
            width={600}
            height={360}
            sizes="(min-width: 1024px) 400px, 100vw"
            className="h-44 w-full object-cover"
          />
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <Stars value={r.stars} />
        {r.priceLevel && <Badge tone="muted">{r.priceLevel}</Badge>}
      </div>
      <CardTitle className="mt-2">{r.name}</CardTitle>
      {r.city?.name && <CardBody className="mt-1">{r.city.name}</CardBody>}
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
      <CardArrow label="Lue arvostelu" />
    </Card>
  );
}
