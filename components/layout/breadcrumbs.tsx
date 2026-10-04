import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export type Crumb = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: Crumb[];
  className?: string;
  /**
   * Pohjan sävy. `dark` yönsinisen heron päälle: vaalean pohjan värit
   * (linkin klubinsininen 1,8:1, nykyisen sivun tekstiväri 1,07:1) eivät
   * erotu tummasta, joten kaikki värit vaihtuvat on-chrome-tokeneihin.
   */
  tone?: "light" | "dark";
};

const toneClass = {
  light: {
    root: "text-muted",
    // Linkkiväri tulee base-tyylistä (a: klubinsininen), hover tummentaa.
    link: "hover:text-foreground",
    current: "text-foreground",
    separator: "text-border-strong",
  },
  dark: {
    root: "text-on-chrome-muted",
    link: "text-on-chrome-muted hover:text-on-chrome",
    current: "text-on-chrome",
    separator: "text-on-chrome-eyebrow",
  },
} as const;

export function Breadcrumbs({ items, className, tone = "light" }: BreadcrumbsProps) {
  if (items.length === 0) return null;
  const colors = toneClass[tone];
  return (
    <nav
      aria-label="Murupolku"
      className={cn("text-sm", colors.root, className)}
    >
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn("transition", colors.link)}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? colors.current : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight aria-hidden size={14} className={colors.separator} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
