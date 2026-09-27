import { cn } from "@/lib/cn";
import type { Ottelu } from "@/lib/ottelut";

/**
 * Otteluohjelma listana (tyyliopas Sivut v3: "Tulevat ottelut").
 *
 * Tietokoneella rivi on ruudukko 110 px | 1fr | 170 px: päivä + kellonaika,
 * ottelu (serif 22 px) + kilpailu · stadion, merkki. Mobiilissa rivit
 * pinotaan ja merkki nousee päivämäärärivin oikealle puolelle.
 *
 * Huuhkajien (miesten maajoukkue) ottelut ovat klubille erityisiä: rivi on
 * vaalean sininen, vasemmassa reunassa on sininen palkki ja kilpailurivin
 * edessä "Huuhkajat"-tunniste. Klubi on paikalla jokaisessa (lib/ottelut.ts).
 */

const TZ = "Europe/Helsinki";
const weekday = new Intl.DateTimeFormat("fi-FI", { weekday: "short", timeZone: TZ });
const dayMonth = new Intl.DateTimeFormat("fi-FI", { day: "numeric", month: "numeric", timeZone: TZ });
const time = new Intl.DateTimeFormat("fi-FI", { hour: "2-digit", minute: "2-digit", timeZone: TZ });

function formatDay(iso: string): string {
  const d = new Date(iso);
  const wd = weekday.format(d);
  // "la" → "La", "4.10." säilyy
  return `${wd.charAt(0).toUpperCase()}${wd.slice(1)} ${dayMonth.format(d)}.`.replace("..", ".");
}

function formatTime(iso: string): string {
  return time.format(new Date(iso)).replace(":", ".");
}

function MatchBadge({ ottelu, size = "md" }: { ottelu: Ottelu; size?: "sm" | "md" }) {
  const base = cn(
    "inline-flex shrink-0 items-center rounded-xs font-semibold leading-none",
    size === "sm" ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-[13px]",
  );
  if (ottelu.klubiPaikalla) {
    return <span className={cn(base, "bg-blue text-white")}>Klubi paikalla</span>;
  }
  if (ottelu.vierasmatka) {
    return <span className={cn(base, "border border-blue text-blue")}>Vierasmatka</span>;
  }
  return null;
}

export function FixtureList({ ottelut, className }: { ottelut: Ottelu[]; className?: string }) {
  return (
    <ol className={cn("flex flex-col rounded-sm bg-surface", className)}>
      {ottelut.map((o) => {
        const meta = [o.kilpailu, o.stadion].filter(Boolean).join(" · ");
        return (
          <li
            key={o.id}
            className={cn(
              o.maajoukkue && "bg-blue-tint shadow-[inset_3px_0_0_var(--blue)]",
              "flex flex-col gap-1.5 border-b border-border px-[18px] py-4 last:border-b-0 sm:grid sm:grid-cols-[110px_minmax(0,1fr)_170px] sm:items-center sm:gap-6 sm:px-7 sm:py-[22px]",
            )}
          >
            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-start sm:justify-start sm:gap-0">
              <time dateTime={o.aika} className="text-sm font-semibold text-heading sm:text-base">
                {formatDay(o.aika)}
                <span className="sm:hidden"> · {formatTime(o.aika)}</span>
                <span
                  className={cn(
                    "hidden text-sm font-normal sm:block",
                    // muted-soft ei riitä AA-kontrastiin vaalean sinisellä pohjalla
                    o.maajoukkue ? "text-muted" : "text-muted-soft",
                  )}
                >
                  klo {formatTime(o.aika)}
                </span>
              </time>
              <span className="sm:hidden">
                <MatchBadge ottelu={o} size="sm" />
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-display text-xl font-semibold text-heading sm:text-[1.375rem]">
                {o.koti} – {o.vieras}
              </span>
              {(meta || o.maajoukkue) && (
                <span className={cn("text-[13px] sm:text-sm", o.maajoukkue ? "text-muted" : "text-muted-soft")}>
                  {o.maajoukkue && (
                    <span className="mr-2 font-semibold uppercase tracking-[0.1em] text-accent">
                      Huuhkajat
                    </span>
                  )}
                  {meta}
                </span>
              )}
            </div>
            <span className="hidden justify-self-end sm:inline-flex">
              <MatchBadge ottelu={o} />
            </span>
          </li>
        );
      })}
    </ol>
  );
}
