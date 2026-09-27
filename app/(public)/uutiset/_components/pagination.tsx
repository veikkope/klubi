import Link from "next/link";

import { cn } from "@/lib/cn";

/**
 * Sivutusnavigaatio. Pelkkiä linkkejä: toimii ilman JavaScriptiä, jokainen sivu
 * on oma osoitteensa ja hakukone pääsee koko listauksen läpi.
 *
 * Näkyvissä on ensimmäinen ja viimeinen sivu sekä nykyisen ympäristö — pitkä
 * arkisto ei siis kasvata navigaatiota loputtomiin.
 */

interface PaginationProps {
  page: number;
  pageCount: number;
  /** Polku annetulle sivunumerolle. Säilyttää muut suodattimet. */
  hrefForPage: (page: number) => string;
  label?: string;
  className?: string;
}

const linkBase =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border px-4 text-sm font-medium transition";

function windowedPages(page: number, total: number): (number | "gap")[] {
  const pages = new Set<number>([1, total, page - 1, page, page + 1]);
  const visible = [...pages]
    .filter((candidate) => candidate >= 1 && candidate <= total)
    .sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  let previous = 0;
  for (const current of visible) {
    if (previous && current - previous > 1) result.push("gap");
    result.push(current);
    previous = current;
  }
  return result;
}

export function Pagination({
  page,
  pageCount,
  hrefForPage,
  label = "Sivutus",
  className,
}: PaginationProps) {
  if (pageCount <= 1) return null;

  const current = Math.min(Math.max(page, 1), pageCount);
  const items = windowedPages(current, pageCount);

  return (
    <nav aria-label={label} className={cn("mt-12", className)}>
      <ol className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {current > 1 ? (
            <Link
              href={hrefForPage(current - 1)}
              rel="prev"
              className={cn(
                linkBase,
                "border-border bg-background text-foreground hover:border-accent hover:text-accent",
              )}
            >
              <span aria-hidden>←</span>
              <span className="ml-2">Edellinen</span>
            </Link>
          ) : (
            <span
              className={cn(linkBase, "border-transparent text-muted-soft")}
              aria-hidden
            >
              <span>←</span>
              <span className="ml-2">Edellinen</span>
            </span>
          )}
        </li>

        {items.map((item, index) =>
          item === "gap" ? (
            <li
              key={`gap-${index}`}
              aria-hidden
              className="px-1 text-sm text-muted"
            >
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefForPage(item)}
                aria-label={`Sivu ${item}`}
                aria-current={item === current ? "page" : undefined}
                className={cn(
                  linkBase,
                  item === current
                    ? "border-primary bg-primary text-on-primary"
                    : "border-border bg-background text-foreground hover:border-accent hover:text-accent",
                )}
              >
                {item}
              </Link>
            </li>
          ),
        )}

        <li>
          {current < pageCount ? (
            <Link
              href={hrefForPage(current + 1)}
              rel="next"
              className={cn(
                linkBase,
                "border-border bg-background text-foreground hover:border-accent hover:text-accent",
              )}
            >
              <span className="mr-2">Seuraava</span>
              <span aria-hidden>→</span>
            </Link>
          ) : (
            <span
              className={cn(linkBase, "border-transparent text-muted-soft")}
              aria-hidden
            >
              <span className="mr-2">Seuraava</span>
              <span>→</span>
            </span>
          )}
        </li>
      </ol>
      <p className="mt-4 text-center text-sm text-muted">
        Sivu {current} / {pageCount}
      </p>
    </nav>
  );
}
