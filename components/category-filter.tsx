import Link from "next/link";
import { cn } from "@/lib/cn";
import { UUTINEN_CATEGORIES } from "@/lib/uutinen-categories";
import type { UutinenCategory } from "@/lib/types";

type Props = {
  /** Aktiivinen kategoria URL-parametrista, tai null kaikille. */
  active: UutinenCategory | null;
  /** Pohjapolku jolle suodatin linkittää (esim. "/uutiset"). */
  basePath: string;
  /** Vain ne kategoriat joista on uutisia näytetään (silloin kun annettu). */
  available?: Set<string>;
};

export function CategoryFilter({ active, basePath, available }: Props) {
  const items = available
    ? UUTINEN_CATEGORIES.filter((c) => available.has(c.value))
    : UUTINEN_CATEGORIES;

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Suodata kategorian mukaan"
      className="flex flex-wrap gap-2"
    >
      <FilterLink
        href={basePath}
        label="Kaikki"
        active={active === null}
      />
      {items.map((c) => (
        <FilterLink
          key={c.value}
          href={`${basePath}?kategoria=${c.value}`}
          label={c.label}
          active={active === c.value}
        />
      ))}
    </nav>
  );
}

function FilterLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition",
        active
          ? "border-accent bg-accent text-white"
          : "border-border bg-background text-foreground hover:border-accent hover:text-accent",
      )}
    >
      {label}
    </Link>
  );
}
