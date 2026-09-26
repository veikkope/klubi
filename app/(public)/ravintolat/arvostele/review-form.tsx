"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

import { cn } from "@/lib/cn";
import type { RavintolaOption } from "@/sanity/lib/queries/ravintolat";
import { submitReview } from "./actions";
import {
  INITIAL_REVIEW_STATE,
  REVIEW_FIELDS,
  REVIEW_FIELD_LABELS,
  reviewErrorId,
  reviewFieldId,
  type ReviewField,
  type ReviewFormState,
} from "./form-state";

/**
 * Arvostelulomake.
 *
 * Client Component vain siksi, että virheet ja lähetystila päivittyvät ilman
 * sivunlatausta. Itse lähetys menee Server Actionille, joten lomake toimii myös
 * ennen hydraatiota — validointi ja tallennus tapahtuvat palvelimella.
 */

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground " +
  "transition placeholder:text-muted-soft focus-visible:border-accent focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const labelClass = "text-sm font-medium text-foreground";

/** Kenttäkohtaiset ohjetekstit. Yhdessä paikassa, koska sekä `<label>`-lohko
 *  että `aria-describedby` tarvitsevat tiedon siitä, onko ohjetta olemassa. */
const FIELD_HINTS: Partial<Record<ReviewField, string>> = {
  sahkoposti: "Ei julkaista. Käytämme sitä vain tarvittaessa yhteydenottoon.",
  kommentti: "10–1000 merkkiä. Kerro mitä söit ja millainen kokemus oli.",
};

export function ReviewForm({
  restaurants,
  defaultRestaurantId,
}: {
  restaurants: RavintolaOption[];
  defaultRestaurantId?: string;
}) {
  const [state, formAction] = useActionState<ReviewFormState, FormData>(
    submitReview,
    INITIAL_REVIEW_STATE,
  );

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-border bg-surface p-8"
      >
        <h2 className="font-serif text-2xl text-foreground">
          Kiitos arvostelusta
        </h2>
        <p className="mt-3 leading-relaxed text-muted">{state.message}</p>
        <Link
          href="/ravintolat"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-white transition hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Takaisin hakemistoon
        </Link>
      </div>
    );
  }

  const errorList = REVIEW_FIELDS.filter((field) => state.fieldErrors[field]);

  return (
    <form action={formAction} noValidate className="space-y-6">
      {/* Virheyhteenveto. aria-live kertoo ruudunlukijalle mikä meni pieleen
          ilman että fokus siirtyy käyttäjän alta pois. */}
      <div aria-live="polite" role="status">
        {state.status === "error" && (
          <div className="rounded-2xl border border-danger-border bg-danger-soft p-5">
            <p className="font-medium text-danger">{state.message}</p>
            {errorList.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                {errorList.map((field) => (
                  <li key={field}>
                    <a
                      href={`#${reviewFieldId(field)}`}
                      className="text-danger underline underline-offset-4"
                    >
                      {REVIEW_FIELD_LABELS[field]}: {state.fieldErrors[field]}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <Field field="ravintola" error={state.fieldErrors.ravintola} required>
        <select
          id={reviewFieldId("ravintola")}
          name="ravintola"
          required
          defaultValue={state.values.ravintola || defaultRestaurantId || ""}
          aria-invalid={state.fieldErrors.ravintola ? true : undefined}
          aria-describedby={describedBy("ravintola", state)}
          className={cn(fieldClass, "h-11 py-0")}
        >
          <option value="">Valitse ravintola</option>
          {restaurants.map((r) => (
            <option key={r._id} value={r._id}>
              {r.city ? `${r.name} — ${r.city}` : r.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field field="nimi" error={state.fieldErrors.nimi} required>
          <input
            id={reviewFieldId("nimi")}
            name="nimi"
            type="text"
            required
            maxLength={80}
            autoComplete="name"
            defaultValue={state.values.nimi}
            aria-invalid={state.fieldErrors.nimi ? true : undefined}
            aria-describedby={describedBy("nimi", state)}
            className={fieldClass}
          />
        </Field>

        <Field
          field="sahkoposti"
          error={state.fieldErrors.sahkoposti}
          required
        >
          <input
            id={reviewFieldId("sahkoposti")}
            name="sahkoposti"
            type="email"
            required
            maxLength={160}
            autoComplete="email"
            defaultValue={state.values.sahkoposti}
            aria-invalid={state.fieldErrors.sahkoposti ? true : undefined}
            aria-describedby={describedBy("sahkoposti", state)}
            className={fieldClass}
          />
        </Field>
      </div>

      <StarField
        error={state.fieldErrors.tahdet}
        defaultValue={state.values.tahdet}
      />

      <Field
        field="kommentti"
        error={state.fieldErrors.kommentti}
        required
      >
        <textarea
          id={reviewFieldId("kommentti")}
          name="kommentti"
          required
          rows={6}
          minLength={10}
          maxLength={1000}
          defaultValue={state.values.kommentti}
          aria-invalid={state.fieldErrors.kommentti ? true : undefined}
          aria-describedby={describedBy("kommentti", state)}
          className={cn(fieldClass, "resize-y")}
        />
      </Field>

      {/* Hunajapurkki. Piilotettu ruudunlukijalta ja näppäimistöltä, joten
          ainoastaan lomakkeita automaattisesti täyttävä botti osuu siihen. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="arvostelu-verkkosivu">Verkkosivu</label>
        <input
          id="arvostelu-verkkosivu"
          name="verkkosivu"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <p className="text-sm text-muted">
        Lähetetyt arvostelut tarkistetaan ennen julkaisua. Emme julkaise
        sähköpostiosoitettasi.
      </p>

      <SubmitButton />
    </form>
  );
}

function describedBy(
  field: ReviewField,
  state: ReviewFormState,
): string | undefined {
  const ids: string[] = [];
  if (state.fieldErrors[field]) ids.push(reviewErrorId(field));
  if (FIELD_HINTS[field]) ids.push(`${reviewFieldId(field)}-ohje`);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

function Field({
  field,
  error,
  required,
  children,
}: {
  field: ReviewField;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const hint = FIELD_HINTS[field];
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={reviewFieldId(field)} className={labelClass}>
        {REVIEW_FIELD_LABELS[field]}
        {required && (
          <span className="text-danger">
            {" *"}
            <span className="sr-only">pakollinen</span>
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p id={`${reviewFieldId(field)}-ohje`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={reviewErrorId(field)}
          className="text-sm font-medium text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}

const STAR_LABELS = [
  "1 tähti — huono",
  "2 tähteä — välttävä",
  "3 tähteä — hyvä",
  "4 tähteä — erittäin hyvä",
  "5 tähteä — erinomainen",
];

function StarField({
  error,
  defaultValue,
}: {
  error?: string;
  defaultValue: string;
}) {
  return (
    <fieldset
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? reviewErrorId("tahdet") : undefined}
    >
      <legend className={labelClass}>
        Arvosana
        <span className="text-danger">
          {" *"}
          <span className="sr-only">pakollinen</span>
        </span>
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {STAR_LABELS.map((label, index) => {
          const value = String(index + 1);
          const id = `${reviewFieldId("tahdet")}-${value}`;
          return (
            <span key={value} className="inline-flex">
              <input
                id={id}
                type="radio"
                name="tahdet"
                value={value}
                required
                defaultChecked={defaultValue === value}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className={cn(
                  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-border",
                  "bg-background px-5 text-sm font-medium text-foreground transition",
                  "hover:border-accent hover:text-accent",
                  "peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                )}
              >
                <span aria-hidden>{value} ★</span>
                <span className="sr-only">{label}</span>
              </label>
            </span>
          );
        })}
      </div>
      {error && (
        <p
          id={reviewErrorId("tahdet")}
          className="mt-2 text-sm font-medium text-danger"
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-8 text-sm font-medium text-white shadow-sm transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {pending ? "Lähetetään…" : "Lähetä arvostelu"}
    </button>
  );
}
