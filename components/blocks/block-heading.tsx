import Link from "next/link";

import { cn } from "@/lib/cn";

/**
 * Osion otsikkorivi: yläotsake, `<h2>` ja valinnainen "Kaikki …" -tekstilinkki.
 *
 * Tyyliopas (Sivut v3): yläotsake 14 px / 600 / versaalit, H2 Source Serif
 * 40 px (mobiilissa 28 px), linkki alleviivattuna oikealla. Yläotsakkeen väri
 * kertoo aihepiirin: sininen = jalkapallo, messinki = ruoka ja ravintolat.
 * Linkki on `min-h-11` (44 px), jotta kosketuskohde riittää mobiilissa.
 */

interface BlockHeadingProps {
  title: string;
  /** Sidotaan osioon `aria-labelledby`:llä. */
  id?: string;
  action?: { href: string; label: string };
  /** Pieni yläotsake otsikon päällä. */
  eyebrow?: string;
  /** Aihepiirin väri yläotsakkeessa. */
  topic?: "football" | "food";
  /** Vaaleampi sävy yönsinisellä pohjalla. */
  tone?: "light" | "dark";
  className?: string;
}

export function BlockHeading({
  title,
  id,
  action,
  eyebrow,
  topic = "football",
  tone = "light",
  className,
}: BlockHeadingProps) {
  const dark = tone === "dark";

  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-8 gap-y-3",
        className,
      )}
    >
      <div className="flex flex-col gap-2.5">
        {eyebrow && <Eyebrow topic={topic} tone={tone}>{eyebrow}</Eyebrow>}
        <h2
          id={id}
          className={cn(
            "font-display text-[1.75rem] leading-[1.15] sm:text-[2.5rem]",
            dark ? "text-on-chrome" : "text-heading",
          )}
        >
          {title}
        </h2>
      </div>

      {action && <ArrowLink href={action.href}>{action.label}</ArrowLink>}
    </div>
  );
}

/** Yläotsake: 14 px (mobiilissa 12 px) / 600 / versaalit / .12em. */
export function Eyebrow({
  children,
  topic = "football",
  tone = "light",
  className,
}: {
  children: React.ReactNode;
  topic?: "football" | "food";
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.12em] sm:text-sm",
        tone === "dark"
          ? "text-on-chrome-eyebrow"
          : topic === "food"
            ? "text-brass-text"
            : "text-accent",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Tekstilinkki nuolella: sininen, 600, alleviivattu. */
export function ArrowLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4 transition hover:text-accent-hover",
        className,
      )}
    >
      {children}&nbsp;<span aria-hidden>→</span>
    </Link>
  );
}
