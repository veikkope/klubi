import Link from "next/link";

import { cn } from "@/lib/cn";
import { formatRating } from "@/components/restaurant-card";
import { cuisineLabel, isValidCuisine } from "@/lib/ravintola-cuisines";
import { MAAKUNNAT, SUOMI_SLUG, isMaakunta, maakuntaTitle } from "@/lib/maakunnat";
import type { RavintolatFacetData } from "@/sanity/lib/queries/ravintolat";

/**
 * Ravintolahakemiston suodattimet.
 *
 * Tila on URL:ssa, ei Reactissa. Se on tietoinen valinta:
 *  - suodatettu näkymä on jaettavissa ja kirjanmerkittävissä
 *  - lomake on tavallinen `method="get"` -lomake, joten se toimii myös ilman
 *    JavaScriptiä; selain rakentaa kyselymerkkijonon puolestamme
 *  - palvelin renderöi tulokset, joten hakukoneet ja vastausmoottorit näkevät
 *    saman sisällön kuin käyttäjä
 *
 * Tämän vuoksi komponentti on Server Component eikä `"use client"`.
 */

export const RAVINTOLA_SORTS = [
  { value: "arvosana", label: "Arvosana (paras ensin)" },
  { value: "nimi", label: "Nimi (A–Ö)" },
] as const;

export type RavintolaSort = (typeof RAVINTOLA_SORTS)[number]["value"];

/** Vähimmäisarvosanan portaat. Puolikkaat, koska arvosanat ovat desimaalilukuja. */
export const MIN_RATING_OPTIONS = [4.5, 4, 3.5, 3, 2.5, 2] as const;

export type RavintolaFilterValues = {
  kaupunki: string | null;
  /** Maan slug (`lib/slugify.ts` maan nimestä), esim. "saksa". */
  maa: string | null;
  /**
   * Maakuntien arvot, esim. ["uusimaa"]. Tyhjä = ei rajausta. Useampi arvo
   * (`?maakunta=uusimaa,kanta-hame`) = mikä tahansa niistä; niitä käyttävät
   * vanhojen aluesivujen ohjaukset, joiden ravintolat ylittävät maakunnan rajan.
   */
  maakunta: string[];
  ruoka: string | null;
  arvosana: number | null;
  lopettaneet: boolean;
  jarjesta: RavintolaSort;
  sivu: number;
};

export const RAVINTOLA_DEFAULT_FILTERS: RavintolaFilterValues = {
  kaupunki: null,
  maa: null,
  maakunta: [],
  ruoka: null,
  arvosana: null,
  lopettaneet: false,
  jarjesta: "arvosana",
  sivu: 1,
};

export type RavintolaSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Lukee ja validoi suodattimet URL:sta. Kelvoton arvo putoaa oletukseen. */
export function parseRavintolaFilters(
  sp: RavintolaSearchParams,
): RavintolaFilterValues {
  const kaupunki = first(sp.kaupunki)?.trim();
  const maa = first(sp.maa)?.trim().toLowerCase();
  const validMaa = maa && /^[a-z0-9-]{1,60}$/.test(maa) ? maa : null;
  // Sekä "?maakunta=a,b" että "?maakunta=a&maakunta=b"; kanoninen järjestys.
  const requested = new Set<string>(
    [sp.maakunta ?? []]
      .flat()
      .flatMap((v) => v.split(","))
      .map((v) => v.trim().toLowerCase())
      .filter(isMaakunta),
  );
  // Maakunta on vain Suomessa: toinen maa ohittaa maakuntarajauksen.
  const maakunta =
    validMaa && validMaa !== SUOMI_SLUG
      ? []
      : MAAKUNNAT.map((m) => m.value as string).filter((v) => requested.has(v));
  const ruoka = first(sp.ruoka)?.trim();
  const arvosana = Number.parseFloat(first(sp.arvosana) ?? "");
  const jarjesta = first(sp.jarjesta);
  const sivu = Number.parseInt(first(sp.sivu) ?? "", 10);

  return {
    kaupunki: kaupunki && /^[a-z0-9_-]{1,60}$/i.test(kaupunki) ? kaupunki : null,
    maa: validMaa,
    maakunta,
    ruoka: isValidCuisine(ruoka) ? (ruoka as string) : null,
    arvosana:
      Number.isFinite(arvosana) && arvosana > 0 && arvosana <= 5
        ? arvosana
        : null,
    lopettaneet: first(sp.lopettaneet) === "1",
    jarjesta: jarjesta === "nimi" ? "nimi" : "arvosana",
    sivu: Number.isInteger(sivu) && sivu > 1 ? sivu : 1,
  };
}

/** Rakentaa hakemiston osoitteen. Tyhjät ja oletusarvot jätetään pois URL:sta. */
export function buildRavintolaHref(
  current: RavintolaFilterValues,
  override: Partial<RavintolaFilterValues> = {},
): string {
  const merged = { ...current, ...override };
  const params = new URLSearchParams();
  if (merged.kaupunki) params.set("kaupunki", merged.kaupunki);
  if (merged.maa) params.set("maa", merged.maa);
  if (merged.maakunta.length) params.set("maakunta", merged.maakunta.join(","));
  if (merged.ruoka) params.set("ruoka", merged.ruoka);
  if (merged.arvosana) params.set("arvosana", String(merged.arvosana));
  if (merged.lopettaneet) params.set("lopettaneet", "1");
  if (merged.jarjesta !== "arvosana") params.set("jarjesta", merged.jarjesta);
  if (merged.sivu > 1) params.set("sivu", String(merged.sivu));
  // Pilkku on sallittu kyselymerkkijonossa (RFC 3986); arvot ovat muuten slugeja.
  const qs = params.toString().replace(/%2C/g, ",");
  return qs ? `/ravintolat?${qs}` : "/ravintolat";
}

/** Onko jokin muu kuin oletusrajaus voimassa. */
export function hasActiveRavintolaFilters(f: RavintolaFilterValues): boolean {
  return Boolean(
    f.kaupunki || f.maa || f.maakunta.length || f.ruoka || f.arvosana || f.lopettaneet,
  );
}

const fieldClass =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground " +
  "transition focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const labelClass =
  "font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-soft";

type Props = {
  active: RavintolaFilterValues;
  facets: RavintolatFacetData;
  /** Osumien määrä nykyisillä rajauksilla — kerrotaan ruudunlukijalle. */
  resultCount: number;
};

export function RavintolaFilterBar({ active, facets, resultCount }: Props) {
  const country = facets.countries.find((c) => c.slug === active.maa);
  // Kaupunkivalikko rajautuu valittuun maahan ja maakuntaan; valittu kaupunki
  // pysyy listassa, jotta lomake ei hiljaa pudota sitä.
  const cities = facets.cities.filter(
    (c) =>
      c.slug === active.kaupunki ||
      ((!country || (c.country !== null && country.names.includes(c.country))) &&
        (active.maakunta.length === 0 || (c.maakunta !== null && active.maakunta.includes(c.maakunta)))),
  );
  // Maakunta vain Suomelle: näkyy, kun maata ei ole valittu tai se on Suomi.
  const showMaakunta =
    facets.maakunnat.length > 0 && (!active.maa || active.maa === SUOMI_SLUG);
  const maakuntaValue = active.maakunta.join(",");
  // GROQ:n `array::unique` palauttaa arvot löytymisjärjestyksessä — järjestetään
  // suomalaisittain aakkosiin vasta täällä, jotta kysely pysyy yksinkertaisena.
  const cuisines = facets.cuisines
    .filter((c): c is string => typeof c === "string" && c.length > 0)
    .sort((a, b) => cuisineLabel(a).localeCompare(cuisineLabel(b), "fi"));
  const isFiltered = hasActiveRavintolaFilters(active);

  return (
    <section aria-labelledby="suodattimet-otsikko" className="space-y-4">
      <h2 id="suodattimet-otsikko" className={labelClass}>
        Rajaa hakemistoa
      </h2>

      <form
        method="get"
        action="/ravintolat"
        className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="suodatin-maa" className={labelClass}>
              Maa
            </label>
            <select
              id="suodatin-maa"
              name="maa"
              defaultValue={active.maa ?? ""}
              className={fieldClass}
            >
              <option value="">Kaikki maat</option>
              {active.maa && !country && (
                <option value={active.maa}>{active.maa} (ei ravintoloita)</option>
              )}
              {facets.countries.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                  {c.count > 0 ? ` (${c.count})` : ""}
                </option>
              ))}
            </select>
          </div>

          {showMaakunta && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="suodatin-maakunta" className={labelClass}>
                Maakunta
              </label>
              <select
                id="suodatin-maakunta"
                name="maakunta"
                defaultValue={maakuntaValue}
                aria-describedby="suodatin-maakunta-ohje"
                className={fieldClass}
              >
                <option value="">Kaikki maakunnat</option>
                {active.maakunta.length > 1 && (
                  <option value={maakuntaValue}>
                    {active.maakunta.map((m) => maakuntaTitle(m) ?? m).join(" + ")}
                  </option>
                )}
                {facets.maakunnat.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.title}
                    {m.count > 0 ? ` (${m.count})` : ""}
                  </option>
                ))}
              </select>
              <p id="suodatin-maakunta-ohje" className="sr-only">
                Maakunta rajaa suomalaisia ravintoloita.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="suodatin-kaupunki" className={labelClass}>
              Kaupunki
            </label>
            <select
              id="suodatin-kaupunki"
              name="kaupunki"
              defaultValue={active.kaupunki ?? ""}
              className={fieldClass}
            >
              <option value="">Kaikki kaupungit</option>
              {cities.map((city) => (
                <option key={city.slug} value={city.slug ?? ""}>
                  {city.name}
                  {city.count > 0 ? ` (${city.count})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="suodatin-ruoka" className={labelClass}>
              Ruokatyyppi
            </label>
            <select
              id="suodatin-ruoka"
              name="ruoka"
              defaultValue={active.ruoka ?? ""}
              className={fieldClass}
            >
              <option value="">Kaikki ruokatyypit</option>
              {cuisines.map((value) => (
                <option key={value} value={value}>
                  {cuisineLabel(value)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="suodatin-arvosana" className={labelClass}>
              Vähintään arvosana
            </label>
            <select
              id="suodatin-arvosana"
              name="arvosana"
              defaultValue={active.arvosana ? String(active.arvosana) : ""}
              className={fieldClass}
            >
              <option value="">Kaikki arvosanat</option>
              {MIN_RATING_OPTIONS.map((value) => (
                <option key={value} value={String(value)}>
                  {formatRating(value)} tai parempi
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="suodatin-jarjesta" className={labelClass}>
              Järjestys
            </label>
            <select
              id="suodatin-jarjesta"
              name="jarjesta"
              defaultValue={active.jarjesta}
              className={fieldClass}
            >
              {RAVINTOLA_SORTS.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  {sort.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-h-11 items-center">
            <label
              htmlFor="suodatin-lopettaneet"
              className="flex cursor-pointer items-center gap-3 text-sm text-foreground"
            >
              <input
                id="suodatin-lopettaneet"
                name="lopettaneet"
                type="checkbox"
                value="1"
                defaultChecked={active.lopettaneet}
                className="size-5 shrink-0 rounded border-border-strong text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <span>
                Näytä myös toimintansa lopettaneet
                {facets.closedCount > 0 ? ` (${facets.closedCount})` : ""}
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isFiltered && (
              <Link
                href="/ravintolat"
                className="inline-flex min-h-11 items-center rounded-sm px-4 text-sm font-medium text-muted transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Tyhjennä rajaukset
              </Link>
            )}
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-6 text-sm font-medium text-on-primary shadow-sm transition hover:bg-primary-hover hover:text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Näytä tulokset
            </button>
          </div>
        </div>
      </form>

      {isFiltered && (
        <ActiveFilterChips active={active} facets={facets} />
      )}

      <p aria-live="polite" className="text-sm text-muted">
        {resultCount === 0
          ? "Ei osumia nykyisillä rajauksilla."
          : `${resultCount} ${resultCount === 1 ? "ravintola" : "ravintolaa"} hakemistossa.`}
      </p>
    </section>
  );
}

function ActiveFilterChips({
  active,
  facets,
}: {
  active: RavintolaFilterValues;
  facets: RavintolatFacetData;
}) {
  const cityName =
    facets.cities.find((c) => c.slug === active.kaupunki)?.name ??
    active.kaupunki;
  const countryName =
    facets.countries.find((c) => c.slug === active.maa)?.name ?? active.maa;

  const chips: { key: string; label: string; href: string }[] = [];
  if (active.kaupunki) {
    chips.push({
      key: "kaupunki",
      label: `Kaupunki: ${cityName}`,
      href: buildRavintolaHref(active, { kaupunki: null, sivu: 1 }),
    });
  }
  if (active.maa) {
    chips.push({
      key: "maa",
      label: `Maa: ${countryName}`,
      href: buildRavintolaHref(active, { maa: null, sivu: 1 }),
    });
  }
  for (const value of active.maakunta) {
    chips.push({
      key: `maakunta-${value}`,
      label: `Maakunta: ${maakuntaTitle(value) ?? value}`,
      href: buildRavintolaHref(active, {
        maakunta: active.maakunta.filter((m) => m !== value),
        sivu: 1,
      }),
    });
  }
  if (active.ruoka) {
    chips.push({
      key: "ruoka",
      label: `Ruokatyyppi: ${cuisineLabel(active.ruoka)}`,
      href: buildRavintolaHref(active, { ruoka: null, sivu: 1 }),
    });
  }
  if (active.arvosana) {
    chips.push({
      key: "arvosana",
      label: `Vähintään ${formatRating(active.arvosana)}`,
      href: buildRavintolaHref(active, { arvosana: null, sivu: 1 }),
    });
  }
  if (active.lopettaneet) {
    chips.push({
      key: "lopettaneet",
      label: "Lopettaneet mukana",
      href: buildRavintolaHref(active, { lopettaneet: false, sivu: 1 }),
    });
  }

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Voimassa olevat rajaukset">
      {chips.map((chip) => (
        <li key={chip.key}>
          <Link
            href={chip.href}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-sm border border-border",
              "bg-background px-4 text-sm text-foreground transition hover:border-accent hover:text-accent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            {chip.label}
            <span aria-hidden>×</span>
            <span className="sr-only">— poista rajaus</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
