import Link from "next/link";

import { cn } from "@/lib/cn";
import type { TapahtumaCard } from "@/lib/types";

type Props = {
  event: TapahtumaCard;
  /** Menneet tapahtumat: himmeämpi, ei messinkikorostusta. */
  past?: boolean;
};

const TZ = "Europe/Helsinki";
const dayFmt = new Intl.DateTimeFormat("fi-FI", { day: "numeric", timeZone: TZ });
const monthFmt = new Intl.DateTimeFormat("fi-FI", { month: "short", timeZone: TZ });
const yearFmt = new Intl.DateTimeFormat("fi-FI", { year: "numeric", timeZone: TZ });

/** "loka" tai "lokak." → "Loka" (tyyliopas: versaali lyhenne ilman pistettä). */
function shortMonth(d: Date): string {
  return monthFmt.format(d).replace(/k?\.$/, "").replace(/kuuta$/, "");
}

/**
 * Tapahtumakortti (tyyliopas Sivut v3: "Klubin tapahtumat").
 *
 * Valkoinen kortti, 3 px yläreuna: sininen, juhlatapahtumalla messinki.
 * Vasemmalla 60 px päivämääräsarake (päivä serif 34 px + kuukausi versaalina),
 * oikealla otsikko ja yhden rivin kuvaus (`tiivistelma`).
 */
export function EventCard({ event, past = false }: Props) {
  const festive = Boolean(event.juhla) && !past;
  const start = new Date(event.startsAt);
  const thisYear = yearFmt.format(new Date()) === yearFmt.format(start);

  return (
    <Link
      href={`/tapahtumat/${event.slug}`}
      className={cn(
        "group grid w-full grid-cols-[52px_1fr] gap-3.5 rounded-sm border-t-[3px] bg-surface p-[18px] no-underline transition hover:shadow-panel sm:grid-cols-[60px_1fr] sm:gap-5 sm:p-[26px]",
        festive ? "border-t-brass" : "border-t-blue",
        past && "opacity-85",
      )}
    >
      <time
        dateTime={event.startsAt}
        className={cn(
          "flex flex-col items-center",
          festive ? "text-brass-text" : "text-accent",
        )}
      >
        <span className="font-display text-[1.75rem] font-semibold leading-none sm:text-[2.125rem]">
          {dayFmt.format(start)}
        </span>
        <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] sm:text-xs">
          {shortMonth(start)}
        </span>
        {!thisYear && (
          <span className="text-[11px] font-semibold tabular-nums">{yearFmt.format(start)}</span>
        )}
      </time>
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-lg leading-[1.3] text-heading group-hover:text-accent sm:text-[1.3125rem]">
          {event.title}
        </h3>
        {(event.tiivistelma || event.location) && (
          <p className="hidden text-[15px] leading-[1.55] text-muted sm:block">
            {event.tiivistelma ?? event.location}
          </p>
        )}
      </div>
    </Link>
  );
}
