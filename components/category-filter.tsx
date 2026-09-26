import Link from "next/link";

import { cn } from "@/lib/cn";
import { UUTINEN_CATEGORIES } from "@/lib/uutinen-categories";
import type { UutinenCategory } from "@/lib/types";

/**
 * Kategoriasuodatin uutislistaukselle.
 *
 * Toteutettu GET-lomakkeena: valinta päätyy URL-parametriksi ilman
 * JavaScriptiä, joten suodatettu näkymä on jaettavissa, palvelinrenderöity ja
 * toimii myös silloin kun selain estää skriptit. Sivunumeroa ei kuljeteta
 * mukana — suodattimen vaihto palauttaa aina listan alkuun.
 */

type Props = {
  /** Aktiivinen kategoria URL-parametrista, tai null kaikille. */
  active: UutinenCategory | null;
  /** Pohjapolku jolle suodatin lähettää (esim. "/uutiset"). */
  basePath: string;
  /** Vain ne kategoriat joista on sisältöä. Jos puuttuu, näytetään kaikki. */
  available?: Set<string>;
  /** Kyselyparametrin nimi. */
  paramName?: string;
  className?: string;
};

const chipBase =
  "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition";

const chipActive = "border-accent bg-accent text-white";

const chipIdle =
  "border-border bg-background text-foreground hover:border-accent hover:text-accent";

export function CategoryFilter({
  active,
  basePath,
  available,
  paramName = "kategoria",
  className,
}: Props) {
  const items = available
    ? UUTINEN_CATEGORIES.filter((c) => available.has(c.value))
    : UUTINEN_CATEGORIES;

  if (items.length === 0) return null;

  return (
    <form
      method="get"
      action={basePath}
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      <fieldset className="contents">
        <legend className="sr-only">Suodata uutisia kategorian mukaan</legend>

        {/* "Kaikki" on linkki eikä painike, jotta osoite pysyy siistinä. */}
        <Link
          href={basePath}
          aria-current={active === null ? "page" : undefined}
          className={cn(chipBase, active === null ? chipActive : chipIdle)}
        >
          Kaikki
        </Link>

        {items.map((category) => (
          <button
            key={category.value}
            type="submit"
            name={paramName}
            value={category.value}
            aria-current={active === category.value ? "page" : undefined}
            className={cn(
              chipBase,
              active === category.value ? chipActive : chipIdle,
            )}
          >
            {category.label}
          </button>
        ))}
      </fieldset>
    </form>
  );
}
