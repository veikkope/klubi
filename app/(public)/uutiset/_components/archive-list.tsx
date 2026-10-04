import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { UutinenListItem } from "@/sanity/lib/queries/uutiset";

/**
 * Tiivis arkistolistaus.
 *
 * Arkistossa on satoja kirjoituksia, joten kortit olisivat väärä muoto:
 * silmäiltävyys ratkaisee, ei kuvakoko. Yksi rivi = päivämäärä, otsikko ja
 * lyhenne, koko rivi klikattavana kohteena.
 */

export function ArchiveList({ items }: { items: UutinenListItem[] }) {
  return (
    <ul className="mt-8 list-none divide-y divide-border border-y border-border p-0">
      {items.map((item) => (
        <li key={item._id}>
          <Link
            href={`/uutiset/${item.slug}`}
            className="group flex min-h-11 flex-col gap-1 py-5 transition sm:flex-row sm:items-baseline sm:gap-6"
          >
            <time
              dateTime={item.publishedAt}
              className="shrink-0 text-sm tabular-nums text-muted sm:w-40"
            >
              {formatDate(item.publishedAt)}
            </time>
            <span className="min-w-0">
              <span className="block font-display text-xl leading-snug text-foreground transition group-hover:text-accent">
                {item.title}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-muted">
                {item.excerpt}
              </span>
              {item.categories && item.categories.length > 0 && (
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {item.categories.map((category) => (
                    <Badge key={category._id} tone="muted">
                      {category.label}
                    </Badge>
                  ))}
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
