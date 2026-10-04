import Link from "next/link";

import { cn } from "@/lib/cn";
import type { UutinenKategoria } from "@/lib/types";

/**
 * Kategoriasuodatin uutislistaukselle.
 *
 * Toteutettu GET-lomakkeena: valinta päätyy URL-parametriksi ilman
 * JavaScriptiä, joten suodatettu näkymä on jaettavissa, palvelinrenderöity ja
 * toimii myös silloin kun selain estää skriptit. Sivunumeroa ei kuljeteta
 * mukana — suodattimen vaihto palauttaa aina listan alkuun.
 */

type Props = {
  /** Aktiivisen kategorian polku URL-parametrista, tai null kaikille. */
  active: string | null;
  /** Pohjapolku jolle suodatin lähettää (esim. "/uutiset"). */
  basePath: string;
  /** Näytettävät kategoriat järjestyksessä (Sanitysta, vain ne joissa on uutisia). */
  kategoriat: Pick<UutinenKategoria, "value" | "label">[];
  /** Kyselyparametrin nimi. */
  paramName?: string;
  /** Aktiivinen hakusana (uutishaku): säilyy, kun kategoriaa vaihdetaan. */
  haku?: string;
  className?: string;
};

const chipBase =
  "inline-flex min-h-11 items-center rounded-sm border px-4 text-sm font-medium transition";

const chipActive = "border-primary bg-primary text-on-primary";

const chipIdle =
  "border-border bg-background text-foreground hover:border-accent hover:text-accent";

export function CategoryFilter({
  active,
  basePath,
  kategoriat: items,
  paramName = "kategoria",
  haku,
  className,
}: Props) {
  if (items.length === 0) return null;

  return (
    <form
      method="get"
      action={basePath}
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      <fieldset className="contents">
        <legend className="sr-only">Suodata uutisia kategorian mukaan</legend>
        {haku && <input type="hidden" name="q" value={haku} />}

        {/* "Kaikki" on linkki eikä painike, jotta osoite pysyy siistinä. */}
        <Link
          href={haku ? `${basePath}?${new URLSearchParams({ q: haku })}` : basePath}
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
