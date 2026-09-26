import { CalendarPlus } from "lucide-react";

import { cn } from "@/lib/cn";

/**
 * Lataa tapahtuman kalenteritiedostona `/tapahtumat/[slug]/ics` -reitistä.
 *
 * Tavallinen `<a>` eikä `next/link`: kohde on tiedostovastaus, jota ei pidä
 * esiladata eikä käsitellä reittisiirtymänä.
 */
export function IcsLink({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  return (
    <a
      href={`/tapahtumat/${slug}/ics`}
      download={`${slug}.ics`}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent",
        className,
      )}
    >
      <CalendarPlus aria-hidden size={16} />
      Lisää kalenteriin
    </a>
  );
}
