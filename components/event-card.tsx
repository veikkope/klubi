import { Card, CardArrow, CardEyebrow, CardTitle, CardBody } from "@/components/ui/card";
import { SanityImage } from "@/components/sanity-image";
import { formatEventRange } from "@/lib/format";
import type { TapahtumaCard } from "@/lib/types";

type Props = {
  event: TapahtumaCard;
  /** Menneillä tapahtumilla pienennetty kuvasuhde + harmaampi sävy. */
  past?: boolean;
};

export function EventCard({ event, past = false }: Props) {
  return (
    <Card href={`/tapahtumat/${event.slug}`}>
      {event.image?.asset && (
        <div className="-m-6 mb-4 overflow-hidden rounded-t-2xl">
          <SanityImage
            image={event.image}
            width={600}
            height={360}
            sizes="(min-width: 1024px) 400px, 100vw"
            className={
              past
                ? "h-40 w-full object-cover opacity-80 saturate-75"
                : "h-44 w-full object-cover"
            }
          />
        </div>
      )}
      <CardEyebrow>{formatEventRange(event.startsAt, event.endsAt)}</CardEyebrow>
      <CardTitle className="mt-2">{event.title}</CardTitle>
      {event.location && <CardBody className="mt-2">{event.location}</CardBody>}
      <CardArrow label={past ? "Lue raportti" : "Lue tapahtumasta"} />
    </Card>
  );
}
