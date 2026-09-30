"use client";

import { useId, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import type { RavintolaOption } from "@/sanity/lib/queries/ravintolat";
import {
  REVIEW_FIELD_LABELS,
  normalizeSearch,
  reviewErrorId,
  reviewFieldId,
  type ReviewField,
  type ReviewValues,
} from "./form-state";
import { FieldMessages, fieldClass, labelClass, RequiredMark } from "./form-ui";

/**
 * Ravintolan valinta: haku hakemistosta tai uuden ravintolan ehdotus.
 *
 * Haku noudattaa WAI-ARIA 1.2 combobox-mallia (listbox-ponnahdus):
 * nuolinäppäimet liikkuvat osumissa, Enter valitsee, Esc sulkee. Osumien
 * määrä kerrotaan ruudunlukijalle. Nimi ja kaupunki haetaan ilman ääkkösiä ja
 * välimerkkejä ("hameenlinna" löytää "Hämeenlinnan"), ja jokaisen sanan pitää
 * löytyä nimestä tai kaupungista ("pizza lahti").
 *
 * Jos ravintolaa ei löydy, listan viimeinen vaihtoehto avaa uuden ravintolan
 * kentät. Sihteeri luo ravintolan hyväksyessään arvostelun (Studion toiminto
 * "Hyväksy ja luo ravintola").
 */

const MAX_RESULTS = 8;
const NEW_OPTION = "__uusi__";

type Mode = "search" | "selected" | "new";

type Indexed = { r: RavintolaOption; name: string; city: string };

/** Merkki kerrallaan taitettu teksti korostusta varten: pituus säilyy. */
function fold(value: string): string {
  return Array.from(value, (ch) =>
    ch.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("fi-FI").charAt(0) || ch,
  ).join("");
}

function search(index: Indexed[], query: string): RavintolaOption[] {
  const q = normalizeSearch(query);
  if (!q) return [];
  const words = q.split(" ");
  return index
    .filter(({ name, city }) => words.every((w) => name.includes(w) || city.includes(w)))
    .map((item) => {
      const rank = item.name.startsWith(q)
        ? 0
        : item.name.split(" ").some((part) => part.startsWith(words[0]))
          ? 1
          : 2;
      return { item, rank };
    })
    .sort((a, b) => a.rank - b.rank || a.item.r.name.localeCompare(b.item.r.name, "fi"))
    .slice(0, MAX_RESULTS)
    .map(({ item }) => item.r);
}

function Highlight({ text, query }: { text: string; query: string }) {
  // Jokaisen hakusanan ensimmäinen osuma lihavoidaan ("pizz lahti").
  const folded = fold(text);
  const marks = new Array<boolean>(text.length).fill(false);
  for (const word of fold(query).split(/[^\p{L}\p{N}]+/u).filter(Boolean)) {
    const at = folded.indexOf(word);
    if (at >= 0) marks.fill(true, at, at + word.length);
  }
  const parts: { text: string; mark: boolean }[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = parts.at(-1);
    if (last && last.mark === marks[i]) last.text += text[i];
    else parts.push({ text: text[i], mark: marks[i] });
  }
  return (
    <>
      {parts.map((p, i) =>
        p.mark ? (
          <mark key={i} className="bg-transparent font-semibold text-heading">
            {p.text}
          </mark>
        ) : (
          p.text
        ),
      )}
    </>
  );
}

export function RestaurantPicker({
  restaurants,
  defaultId,
  values,
  errors,
}: {
  restaurants: RavintolaOption[];
  defaultId?: string;
  values: ReviewValues;
  errors: Partial<Record<ReviewField, string>>;
}) {
  const initial = restaurants.find((r) => r._id === (values.ravintola || defaultId));
  const [mode, setMode] = useState<Mode>(values.uusi === "1" ? "new" : initial ? "selected" : "search");
  const [selected, setSelected] = useState<RavintolaOption | undefined>(initial);
  const [query, setQuery] = useState(values.uusiNimi);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const index = useMemo<Indexed[]>(
    () =>
      restaurants.map((r) => ({
        r,
        name: normalizeSearch(r.name),
        city: normalizeSearch(r.city ?? ""),
      })),
    [restaurants],
  );
  const results = useMemo(() => search(index, query), [index, query]);
  // Tunnetut kaupungit: "pizzeria roma lahti" → nimi "pizzeria roma", kaupunki "Lahti".
  const cities = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of restaurants) if (r.city) map.set(normalizeSearch(r.city), r.city);
    return map;
  }, [restaurants]);

  function splitQuery(q: string): { nimi: string; kaupunki: string } {
    const words = q.trim().split(/\s+/);
    for (let n = Math.min(3, words.length - 1); n >= 1; n--) {
      const city = cities.get(normalizeSearch(words.slice(-n).join(" ")));
      if (city) return { nimi: words.slice(0, -n).join(" "), kaupunki: city };
    }
    return { nimi: q.trim(), kaupunki: "" };
  }
  const canSuggest = query.trim().length >= 2;
  // Näkyvät vaihtoehdot: osumat + "Lisää uusi ravintola" viimeisenä.
  const options = canSuggest ? [...results.map((r) => r._id), NEW_OPTION] : results.map((r) => r._id);
  const showList = open && options.length > 0;
  const optionId = (i: number) => `${listId}-vaihtoehto-${i}`;

  function choose(i: number) {
    const value = options[i];
    if (value === undefined) return;
    setOpen(false);
    setActive(-1);
    if (value === NEW_OPTION) {
      setMode("new");
      return;
    }
    setSelected(restaurants.find((r) => r._id === value));
    setMode("selected");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setOpen(true);
        setActive((i) => (options.length ? (i + 1) % options.length : -1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setOpen(true);
        setActive((i) => (options.length ? (i <= 0 ? options.length - 1 : i - 1) : -1));
        break;
      case "Enter":
        // Enter valitsee osuman eikä lähetä lomaketta kesken haun.
        if (showList) {
          e.preventDefault();
          choose(active >= 0 ? active : 0);
        }
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
          setActive(-1);
        } else {
          setQuery("");
        }
        break;
    }
  }

  const error = errors.ravintola;
  const hintId = `${reviewFieldId("ravintola")}-ohje`;

  return (
    <div className="flex flex-col gap-4">
      {/* Palvelimelle menevät arvot. */}
      <input type="hidden" name="ravintola" value={mode === "selected" ? (selected?._id ?? "") : ""} />
      <input type="hidden" name="uusi" value={mode === "new" ? "1" : ""} />

      {mode === "selected" && selected && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border border-l-[3px] border-l-brass bg-background px-4 py-3.5">
          <div className="min-w-0">
            <p className="font-display text-xl text-heading">{selected.name}</p>
            {selected.city && <p className="text-sm text-muted">{selected.city}</p>}
          </div>
          <button
            type="button"
            onClick={() => {
              setMode("search");
              setQuery("");
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
            className="min-h-11 rounded-sm px-3 text-sm font-semibold text-accent underline underline-offset-4 hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Vaihda ravintola
          </button>
        </div>
      )}

      {mode === "search" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={reviewFieldId("ravintola")} className={labelClass}>
            Hae ravintolaa
            <RequiredMark />
          </label>
          <p id={hintId} className="text-sm text-muted">
            Kirjoita ravintolan nimi tai kaupunki, esim. &quot;pizzeria lahti&quot;.
          </p>
          <div className="relative">
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-soft"
            >
              <path
                fill="currentColor"
                d="M8.5 3a5.5 5.5 0 0 1 4.38 8.83l3.65 3.64a.75.75 0 1 1-1.06 1.06l-3.64-3.65A5.5 5.5 0 1 1 8.5 3Zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
              />
            </svg>
            <input
              ref={inputRef}
              id={reviewFieldId("ravintola")}
              type="text"
              role="combobox"
              autoComplete="off"
              spellCheck={false}
              aria-autocomplete="list"
              aria-expanded={showList}
              aria-controls={listId}
              aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
              aria-invalid={error ? true : undefined}
              aria-describedby={[hintId, error ? reviewErrorId("ravintola") : ""].filter(Boolean).join(" ")}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                setActive(-1);
              }}
              onFocus={() => query && setOpen(true)}
              onBlur={() => setOpen(false)}
              onKeyDown={onKeyDown}
              placeholder="Ravintolan nimi tai kaupunki"
              className={cn(fieldClass, "h-12 pl-11")}
            />
            <ul
              id={listId}
              role="listbox"
              aria-label="Hakutulokset"
              hidden={!showList}
              className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-[22rem] overflow-y-auto rounded-sm border border-border bg-background py-1.5 shadow-panel"
            >
              {options.map((value, i) => {
                const r = results[i];
                const isNew = value === NEW_OPTION;
                return (
                  <li
                    key={value}
                    id={optionId(i)}
                    role="option"
                    aria-selected={i === active}
                    // Estää kentän blurin ennen valintaa.
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(i)}
                    onMouseMove={() => setActive(i)}
                    className={cn(
                      "flex cursor-pointer flex-col px-4 py-2.5",
                      i === active && "bg-brass-tint",
                      isNew && "mt-1 border-t border-border pt-3",
                    )}
                  >
                    {isNew ? (
                      <>
                        <span className="font-semibold text-accent">+ Lisää uusi ravintola</span>
                        <span className="text-sm text-muted">
                          &quot;{query.trim()}&quot; ei ole listassa? Kerro sen tiedot itse.
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-foreground">
                          <Highlight text={r.name} query={query} />
                        </span>
                        {r.city && (
                          <span className="text-sm text-muted">
                            <Highlight text={r.city} query={query} />
                          </span>
                        )}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          {/* Osumien määrä ruudunlukijalle. */}
          <p aria-live="polite" className="sr-only">
            {open && query.trim()
              ? results.length > 0
                ? `${results.length} ravintolaa löytyi. Liiku nuolinäppäimillä.`
                : "Ei osumia. Voit lisätä uuden ravintolan."
              : ""}
          </p>
          <FieldMessages field="ravintola" error={error} />
          {!canSuggest && (
            <p className="text-sm text-muted">
              Eikö ravintolaa löydy?{" "}
              <button
                type="button"
                onClick={() => setMode("new")}
                className="font-semibold text-accent underline underline-offset-4 hover:text-accent-hover"
              >
                Lisää uusi ravintola
              </button>
            </p>
          )}
        </div>
      )}

      {mode === "new" && (
        <NewRestaurantFields
          values={
            values.uusiNimi
              ? values
              : {
                  ...values,
                  uusiNimi: splitQuery(query).nimi,
                  uusiKaupunki: values.uusiKaupunki || splitQuery(query).kaupunki,
                }
          }
          errors={errors}
          onCancel={() => {
            setMode("search");
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
        />
      )}
    </div>
  );
}

function NewRestaurantFields({
  values,
  errors,
  onCancel,
}: {
  values: ReviewValues;
  errors: Partial<Record<ReviewField, string>>;
  onCancel: () => void;
}) {
  const text = (field: keyof ReviewValues & ReviewField, props: React.InputHTMLAttributes<HTMLInputElement> = {}, required = true) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={reviewFieldId(field)} className={labelClass}>
        {REVIEW_FIELD_LABELS[field]}
        {required ? <RequiredMark /> : <span className="font-normal text-muted"> (valinnainen)</span>}
      </label>
      <input
        id={reviewFieldId(field)}
        name={field}
        type="text"
        required={required}
        defaultValue={values[field]}
        aria-invalid={errors[field] ? true : undefined}
        aria-describedby={errors[field] ? reviewErrorId(field) : undefined}
        className={fieldClass}
        {...props}
      />
      <FieldMessages field={field} error={errors[field]} />
    </div>
  );

  return (
    <div className="flex flex-col gap-5 rounded-sm border border-border border-l-[3px] border-l-brass bg-background p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl text-heading">Uusi ravintola</p>
          <p className="mt-1 text-sm text-muted">
            Lisäämme ravintolan hakemistoon, kun hyväksymme arvostelusi.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-sm px-3 text-sm font-semibold text-accent underline underline-offset-4 hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Takaisin hakuun
        </button>
      </div>
      {/* Fokus ensimmäiseen täytettävään kenttään (hakukenttä poistui näkyvistä). */}
      {text("uusiNimi", { maxLength: 100, autoFocus: !values.uusiNimi || Boolean(values.uusiKaupunki) })}
      <div className="grid gap-5 sm:grid-cols-2">
        {text("uusiKaupunki", { maxLength: 60, autoComplete: "address-level2", autoFocus: Boolean(values.uusiNimi) && !values.uusiKaupunki })}
        {text("uusiMaa", { maxLength: 60, autoComplete: "country-name" })}
      </div>
      {text("uusiLisatieto", { maxLength: 200, placeholder: "Esim. Aleksanterinkatu 10 tai www.ravintola.fi" }, false)}
    </div>
  );
}
