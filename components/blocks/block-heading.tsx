import Link from "next/link";

import { cn } from "@/lib/cn";

/**
 * Etusivun lohkon otsikkorivi: osion `<h2>` ja valinnainen "katso kaikki"
 * -linkki.
 *
 * Erillinen tiedosto, koska neljä lohkoa tarvitsee täsmälleen saman rivin.
 * Linkki on `min-h-11` (44 px), jotta kosketuskohde riittää mobiilissa.
 */

interface BlockHeadingProps {
  title: string;
  /** Sidotaan osioon `aria-labelledby`:llä. */
  id?: string;
  action?: { href: string; label: string };
  /** Pieni yläteksti otsikon päällä. */
  eyebrow?: string;
  /** Vaaleampi sävy tummalla taustalla. */
  tone?: "light" | "dark";
  className?: string;
}

export function BlockHeading({
  title,
  id,
  action,
  eyebrow,
  tone = "light",
  className,
}: BlockHeadingProps) {
  const dark = tone === "dark";

  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-8 gap-y-2",
        className,
      )}
    >
      <div>
        {eyebrow && (
          <p
            className={cn(
              "text-sm font-medium uppercase tracking-[0.18em]",
              dark ? "text-brand-200" : "text-accent",
            )}
          >
            {eyebrow}
          </p>
        )}
        <h2
          id={id}
          className={cn(
            "font-serif text-3xl leading-tight sm:text-4xl",
            eyebrow && "mt-2",
            dark ? "text-white" : "text-foreground",
          )}
        >
          {title}
        </h2>
      </div>

      {action && (
        <Link
          href={action.href}
          className={cn(
            "inline-flex min-h-11 items-center gap-1 text-sm font-medium transition",
            dark
              ? "text-brand-200 hover:text-white"
              : "text-accent hover:text-accent-hover",
          )}
        >
          {action.label}
          <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}
