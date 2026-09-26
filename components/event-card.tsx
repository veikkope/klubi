import { CalendarDays, MapPin } from "lucide-react";

import {
  Card,
  CardArrow,
  CardEyebrow,
  CardTitle,
  CardBody,
} from "@/components/ui/card";
import { SanityImage } from "@/components/sanity-image";
import { formatEventRange } from "@/lib/format";
import type { TapahtumaCard } from "@/lib/types";

type Props = {
  event: TapahtumaCard;
  /** Menneillä tapahtumilla pienennetty kuvasuhde + harmaampi sävy. */
  past?: boolean;
  /** Ensimmäisen rivin kortit voivat olla LCP-elementti. */
  priority?: boolean;
};

export function EventCard({ event, past = false, priority = false }: Props) {
  return (
    <Card href={`/tapahtumat/${event.slug}`} className="w-full">
      {event.image?.asset && (
        <div className="-m-6 mb-4 overflow-hidden rounded-t-2xl">
          <SanityImage
            image={event.image}
            width={600}
            height={360}
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
            className={
              past
                ? "h-40 w-full object-cover opacity-80 saturate-75"
                : "h-44 w-full object-cover"
            }
            priority={priority}
          />
        </div>
      )}
      <CardEyebrow className="flex items-center gap-2">
        <CalendarDays aria-hidden size={14} className="shrink-0" />
        <time dateTime={event.startsAt}>
          {formatEventRange(event.startsAt, event.endsAt)}
        </time>
      </CardEyebrow>
      <CardTitle className="mt-2">{event.title}</CardTitle>
      {event.location && (
        <CardBody className="mt-2 flex items-start gap-2">
          <MapPin aria-hidden size={16} className="mt-1 shrink-0 text-accent" />
          <span>{event.location}</span>
        </CardBody>
      )}
      <CardArrow label={past ? "Lue raportti" : "Lue tapahtumasta"} />
    </Card>
  );
}
