import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { cuisineLabel } from "@/lib/ravintola-cuisines";
import type { RavintolatFacets } from "@/lib/types";

export type RavintolaFilters = {
  kaupunki: string | null;
  ruoka: string | null;
  tahdet: number | null;
  hinta: string | null;
};

type Props = {
  active: RavintolaFilters;
  facets: RavintolatFacets;
};

export function RavintolaFilterBar({ active, facets }: Props) {
  const hasAny = Object.values(active).some(Boolean);

  return (
    <div className="space-y-5">
      {/* Kaupungit */}
      {facets.cities.length > 0 && (
        <FilterRow label="Kaupunki">
          <FilterChip
            label="Kaikki"
            active={!active.kaupunki}
            href={buildHref(active, { kaupunki: null })}
          />
          {facets.cities.map((c) => (
            <FilterChip
              key={c.slug}
              label={c.name}
              active={active.kaupunki === c.slug}
              href={buildHref(active, { kaupunki: c.slug })}
            />
          ))}
        </FilterRow>
      )}

      {/* Ruokatyyppi */}
      {facets.cuisines.length > 0 && (
        <FilterRow label="Ruokatyyppi">
          <FilterChip
            label="Kaikki"
            active={!active.ruoka}
            href={buildHref(active, { ruoka: null })}
          />
          {facets.cuisines.map((value) => (
            <FilterChip
              key={value}
              label={cuisineLabel(value)}
              active={active.ruoka === value}
              href={buildHref(active, { ruoka: value })}
            />
          ))}
        </FilterRow>
      )}

      {/* Tähdet */}
      <FilterRow label="Vähintään tähdet">
        <FilterChip
          label="Kaikki"
          active={!active.tahdet}
          href={buildHref(active, { tahdet: null })}
        />
        {[5, 4, 3].map((stars) => (
          <FilterChip
            key={stars}
            active={active.tahdet === stars}
            href={buildHref(active, { tahdet: stars })}
            label={
              <span className="inline-flex items-center gap-1">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    aria-hidden
                    className="fill-current"
                  />
                ))}
              </span>
            }
          />
        ))}
      </FilterRow>

      {/* Hintaluokka */}
      {facets.priceLevels.length > 0 && (
        <FilterRow label="Hinta">
          <FilterChip
            label="Kaikki"
            active={!active.hinta}
            href={buildHref(active, { hinta: null })}
          />
          {facets.priceLevels.map((p) => (
            <FilterChip
              key={p}
              label={p}
              active={active.hinta === p}
              href={buildHref(active, { hinta: p })}
            />
          ))}
        </FilterRow>
      )}

      {hasAny && (
        <div>
          <Link
            href="/ravintolat"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-accent"
          >
            ← Tyhjennä suodattimet
          </Link>
        </div>
      )}
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4">
      <p className="min-w-32 text-xs font-medium uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  href,
}: {
  label: React.ReactNode;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition",
        active
          ? "border-accent bg-accent text-white"
          : "border-border bg-background text-foreground hover:border-accent hover:text-accent",
      )}
    >
      {label}
    </Link>
  );
}

function buildHref(
  current: RavintolaFilters,
  override: Partial<RavintolaFilters>,
): string {
  const merged: RavintolaFilters = { ...current, ...override };
  const params = new URLSearchParams();
  if (merged.kaupunki) params.set("kaupunki", merged.kaupunki);
  if (merged.ruoka) params.set("ruoka", merged.ruoka);
  if (merged.tahdet) params.set("tahdet", String(merged.tahdet));
  if (merged.hinta) params.set("hinta", merged.hinta);
  const qs = params.toString();
  return qs ? `/ravintolat?${qs}` : "/ravintolat";
}
