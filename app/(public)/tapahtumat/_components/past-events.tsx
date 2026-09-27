import Link from "next/link";

import { formatEventRange } from "@/lib/format";
import type { TapahtumaListItem } from "@/sanity/lib/queries/uutiset";

/**
 * Menneet tapahtumat vuosittain ryhmiteltynä.
 *
 * Menneistä tapahtumista etsitään yleensä tiettyä vuotta ("vappu 2019"), ei
 * selata kuvia — siksi tiivis lista vuosiotsikoilla eikä korttiruudukko.
 */

type Group = {
  year: number;
  items: TapahtumaListItem[];
};

function groupByYear(events: TapahtumaListItem[]): Group[] {
  const groups = new Map<number, TapahtumaListItem[]>();

  for (const event of events) {
    const year = Number.parseInt(event.startsAt?.slice(0, 4) ?? "", 10);
    if (!Number.isFinite(year)) continue;
    const bucket = groups.get(year);
    if (bucket) bucket.push(event);
    else groups.set(year, [event]);
  }

  return [...groups.entries()]
    .map(([year, items]) => ({ year, items }))
    .sort((a, b) => b.year - a.year);
}

export function PastEvents({ events }: { events: TapahtumaListItem[] }) {
  const groups = groupByYear(events);
  if (groups.length === 0) return null;

  return (
    <div className="mt-8 space-y-10">
      {groups.map((group) => (
        <section
          key={group.year}
          aria-labelledby={`tapahtumavuosi-${group.year}`}
        >
          <h3
            id={`tapahtumavuosi-${group.year}`}
            className="border-b border-border pb-2 font-display text-xl tabular-nums"
          >
            {group.year}
          </h3>
          <ul className="list-none divide-y divide-border p-0">
            {group.items.map((event) => (
              <li key={event._id}>
                <Link
                  href={`/tapahtumat/${event.slug}`}
                  className="group flex min-h-11 flex-col gap-1 py-4 transition sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <time
                    dateTime={event.startsAt}
                    className="shrink-0 text-sm text-muted sm:w-64"
                  >
                    {formatEventRange(event.startsAt, event.endsAt)}
                  </time>
                  <span className="min-w-0">
                    <span className="block font-medium text-foreground transition group-hover:text-accent">
                      {event.title}
                    </span>
                    {event.location && (
                      <span className="mt-0.5 block text-sm text-muted">
                        {event.location}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
