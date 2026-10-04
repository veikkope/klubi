"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/cn";
import type { KlubilainenOption } from "@/sanity/lib/queries/ravintolat";
import { REVIEW_FIELD_LABELS, reviewErrorId, reviewFieldId, type Arvostelija } from "./form-state";
import { FieldMessages, fieldClass, labelClass } from "./form-ui";

/**
 * Kuka arvostelee: klubilainen napauttaa nimeään, muu kirjoittaa nimensä.
 *
 * Nimen napautus vie suoraan seuraavaan vaiheeseen (`onValittu`), joten
 * palaavalta klubilaiselta ei kysytä mitään ylimääräistä. Valinta muistetaan
 * laitteelle lähetyksen yhteydessä (review-form.tsx), eikä tätä vaihetta
 * näytetä seuraavalla kerralla. Lomakkeelle lähtevät piilokentät `nimi` ja
 * `klubilainen` ovat review-form.tsx:ssä, koska nimi voidaan vaihtaa myös
 * viimeisestä vaiheesta.
 *
 * Nimet ovat painikkeita (`aria-pressed`), eivät radiopainikkeita: valinta
 * etenee heti, ja radioryhmässä nuolinäppäin valitsisi (ja etenisi) vahingossa.
 */
export function ArvostelijaValinta({
  klubilaiset,
  arvostelija,
  onChange,
  onValittu,
  error,
}: {
  klubilaiset: KlubilainenOption[];
  /** null = ei valittu. `klubilainen` tyhjä = muu kuin klubilainen. */
  arvostelija: Arvostelija | null;
  onChange: (value: Arvostelija | null) => void;
  /** Klubilainen valittu: seuraavaan vaiheeseen (valinta mukana, tila ei ole vielä päivittynyt). */
  onValittu: (valinta: Arvostelija) => void;
  error?: string;
}) {
  const nimiRef = useRef<HTMLInputElement>(null);
  const id = reviewFieldId("nimi");
  // Ilman klubilaisia (tai kyselyn epäonnistuessa) pelkkä nimikenttä.
  const [muu, setMuu] = useState(klubilaiset.length === 0 || (arvostelija !== null && !arvostelija.klubilainen));

  const nimiKentta = (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClass}>
        {REVIEW_FIELD_LABELS.nimi}
      </label>
      <p id={`${id}-ohje`} className="text-sm text-muted">
        Näkyy arvostelun yhteydessä. Etunimi riittää.
      </p>
      <input
        ref={nimiRef}
        // Virheyhteenvedon linkin kohde. Lomakkeelle lähtee piilokenttä (review-form.tsx).
        id={id}
        type="text"
        maxLength={80}
        autoComplete="given-name"
        enterKeyHint="next"
        value={arvostelija && !arvostelija.klubilainen ? arvostelija.nimi : ""}
        onChange={(e) => onChange({ klubilainen: "", nimi: e.target.value })}
        aria-invalid={error ? true : undefined}
        aria-describedby={[`${id}-ohje`, error ? reviewErrorId("nimi") : ""].filter(Boolean).join(" ")}
        className={cn(fieldClass, "h-12")}
      />
      <FieldMessages field="nimi" error={error} />
    </div>
  );

  if (klubilaiset.length === 0) return nimiKentta;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] text-muted">
        Napauta nimeäsi. Puhelin muistaa sen seuraavaa kertaa varten.
      </p>
      <div role="group" aria-label="Klubilaiset" className="grid grid-cols-2 gap-2 min-[360px]:grid-cols-3">
        {klubilaiset.map((k, i) => {
          const valittu = arvostelija?.klubilainen === k._id;
          return (
            <button
              key={k._id}
              // Virheyhteenvedon linkin kohde, kun nimikenttä ei ole näkyvissä.
              id={i === 0 && !muu ? id : undefined}
              type="button"
              aria-pressed={valittu}
              aria-describedby={i === 0 && error ? reviewErrorId("nimi") : undefined}
              onClick={() => {
                const valinta = { klubilainen: k._id, nimi: k.nimi };
                setMuu(false);
                onChange(valinta);
                onValittu(valinta);
              }}
              className={cn(
                "flex min-h-14 items-center justify-center rounded-sm border px-3 text-center text-base font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                valittu
                  ? "border-primary bg-primary text-on-primary"
                  : "border-border bg-surface text-foreground hover:border-accent active:bg-surface-strong",
              )}
            >
              {k.nimi}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        aria-expanded={muu}
        onClick={() => {
          setMuu(true);
          if (arvostelija?.klubilainen) onChange(null);
          requestAnimationFrame(() => nimiRef.current?.focus());
        }}
        className={cn(
          "flex min-h-12 items-center justify-center rounded-sm border px-3 text-[15px] font-medium transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          muu
            ? "border-accent bg-accent-soft text-foreground"
            : "border-dashed border-border-strong bg-transparent text-foreground hover:border-accent",
        )}
      >
        En ole klubilainen
      </button>
      {muu ? nimiKentta : <FieldMessages field="nimi" error={error} />}
    </div>
  );
}
