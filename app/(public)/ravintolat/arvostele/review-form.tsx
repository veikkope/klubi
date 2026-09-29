"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

import { cn } from "@/lib/cn";
import type { RavintolaOption } from "@/sanity/lib/queries/ravintolat";
import { submitReview } from "./actions";
import {
  COMMENT_MAX,
  COMMENT_MIN,
  INITIAL_REVIEW_STATE,
  REVIEW_FIELDS,
  REVIEW_FIELD_LABELS,
  reviewErrorId,
  reviewFieldId,
  type ReviewFormState,
} from "./form-state";
import { FieldMessages, fieldClass, labelClass, RequiredMark } from "./form-ui";
import { RestaurantPicker } from "./restaurant-picker";

/**
 * Arvostelulomake kolmessa vaiheessa: ravintola, arvio, nimi.
 *
 * Client Component, jotta haku, tähdet ja virheet toimivat ilman sivunlatausta.
 * Lähetys menee Server Actionille, joka validoi ja tallentaa (actions.ts).
 *
 * Saavutettavuus (WCAG 2.2 AA):
 * - Jokainen vaihe on `fieldset` + `legend`.
 * - Epäonnistuneen lähetyksen jälkeen fokus siirtyy virheyhteenvetoon, jonka
 *   linkit vievät suoraan virheelliseen kenttään.
 * - Tähdet ovat radiopainikkeita: nuolinäppäimet vaihtavat arvosanaa.
 * - Merkkilaskuri kerrotaan ruudunlukijalle vasta, kun raja on lähellä.
 */

/** Välilyönnillä erotettu id-lista `aria-describedby`:lle; tyhjät pois. */
function ids(...values: (string | false | undefined)[]): string | undefined {
  const list = values.filter(Boolean);
  return list.length ? list.join(" ") : undefined;
}

const STARS = [
  { value: 1, label: "Huono" },
  { value: 2, label: "Välttävä" },
  { value: 3, label: "Hyvä" },
  { value: 4, label: "Erittäin hyvä" },
  { value: 5, label: "Erinomainen" },
];

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
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Lähetyksen jälkeen fokus sinne, missä vastaus on (virheet tai kiitos).
  useEffect(() => {
    const el = state.status === "error" ? summaryRef.current : state.status === "success" ? successRef.current : null;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [state]);

  if (state.status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="scroll-mt-28 rounded-sm border-t-[3px] border-t-success bg-surface p-7 sm:p-9"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-10 text-success">
          <path
            fill="currentColor"
            d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm4.2 6.3a1 1 0 0 0-1.4 0l-4.1 4.1-1.5-1.5a1 1 0 1 0-1.4 1.4l2.2 2.2a1 1 0 0 0 1.4 0l4.8-4.8a1 1 0 0 0 0-1.4Z"
          />
        </svg>
        <h2 className="mt-4 font-display text-[1.75rem] text-heading">Kiitos arvostelusta!</h2>
        <p className="mt-3 max-w-prose leading-relaxed text-muted">
          {state.restaurantName && (
            <>
              Arviosi ravintolasta <strong className="text-foreground">{state.restaurantName}</strong>{" "}
              on vastaanotettu.{" "}
            </>
          )}
          {state.message}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3">
          {/* Tavallinen linkki: täysi lataus nollaa lomakkeen tilan (Link säilyttäisi sen). */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/ravintolat/arvostele"
            className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-6 text-sm font-semibold text-on-primary transition hover:bg-primary-hover hover:text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Arvostele toinen ravintola
          </a>
          <Link href="/ravintolat" className="text-[15px] font-semibold text-accent underline underline-offset-4">
            Takaisin hakemistoon
          </Link>
        </div>
      </div>
    );
  }

  const errorList = REVIEW_FIELDS.filter((field) => state.fieldErrors[field]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-8">
      {state.status === "error" && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="scroll-mt-28 rounded-sm border border-danger-border border-l-[3px] border-l-danger bg-danger-soft p-5"
        >
          <p className="font-semibold text-danger">{state.message}</p>
          {errorList.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {errorList.map((field) => (
                <li key={field}>
                  <a href={`#${reviewFieldId(field)}`} className="text-danger underline underline-offset-4">
                    {REVIEW_FIELD_LABELS[field]}: {state.fieldErrors[field]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Step number={1} title="Mitä ravintolaa arvostelet?">
        <RestaurantPicker
          restaurants={restaurants}
          defaultId={defaultRestaurantId}
          values={state.values}
          errors={state.fieldErrors}
        />
      </Step>

      <Step number={2} title="Millainen kokemus oli?">
        <div className="flex flex-col gap-6">
          <StarField error={state.fieldErrors.tahdet} defaultValue={state.values.tahdet} />
          <CommentField error={state.fieldErrors.kommentti} defaultValue={state.values.kommentti} />
        </div>
      </Step>

      <Step number={3} title="Kuka arvostelee?">
        <div className="flex flex-col gap-1.5 sm:max-w-md">
          <label htmlFor={reviewFieldId("nimi")} className={labelClass}>
            {REVIEW_FIELD_LABELS.nimi}
            <RequiredMark />
          </label>
          <p id={`${reviewFieldId("nimi")}-ohje`} className="text-sm text-muted">
            Näkyy arvostelun yhteydessä. Etunimi riittää.
          </p>
          <input
            id={reviewFieldId("nimi")}
            name="nimi"
            type="text"
            required
            maxLength={80}
            autoComplete="given-name"
            defaultValue={state.values.nimi}
            aria-invalid={state.fieldErrors.nimi ? true : undefined}
            aria-describedby={ids(
              `${reviewFieldId("nimi")}-ohje`,
              state.fieldErrors.nimi && reviewErrorId("nimi"),
            )}
            className={fieldClass}
          />
          <FieldMessages field="nimi" error={state.fieldErrors.nimi} />
        </div>
      </Step>

      {/* Hunajapurkki. Piilotettu ruudunlukijalta ja näppäimistöltä, joten
          ainoastaan lomakkeita automaattisesti täyttävä botti osuu siihen. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="arvostelu-verkkosivu">Verkkosivu</label>
        <input id="arvostelu-verkkosivu" name="verkkosivu" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-7">
        <p className="text-sm leading-relaxed text-muted">
          Luemme jokaisen arvostelun ennen julkaisua. Sähköpostiosoitetta tai muita
          yhteystietoja ei kysytä. Lue{" "}
          <Link href="/tietosuoja" className="text-accent underline underline-offset-4">
            tietosuojaseloste
          </Link>
          .
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-sm bg-surface p-5 sm:p-8">
      {/* float: legend asettuu fieldsetin sisälle eikä reunaviivalle. */}
      <legend className="float-left mb-5 w-full">
        <span className="flex items-center gap-3.5 font-display text-xl text-heading sm:text-2xl">
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-full bg-brass-tint font-sans text-[15px] font-semibold text-brass-tint-text"
          >
            {number}
          </span>
          <span>
            <span className="sr-only">Vaihe {number}: </span>
            {title}
          </span>
        </span>
      </legend>
      <div className="clear-left">{children}</div>
    </fieldset>
  );
}

function StarField({ error, defaultValue }: { error?: string; defaultValue: string }) {
  const [value, setValue] = useState(Number(defaultValue) || 0);
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <fieldset
      // Virheyhteenvedon linkin kohde.
      id={reviewFieldId("tahdet")}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? reviewErrorId("tahdet") : undefined}
    >
      <legend className={labelClass}>
        Kokonaisarvosana
        <RequiredMark />
      </legend>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex" onMouseLeave={() => setHover(0)}>
          {STARS.map((star) => {
            const id = `${reviewFieldId("tahdet")}-${star.value}`;
            return (
              <span key={star.value} className="inline-flex">
                <input
                  id={id}
                  type="radio"
                  name="tahdet"
                  value={star.value}
                  required
                  defaultChecked={value === star.value}
                  onChange={() => setValue(star.value)}
                  className="peer sr-only"
                />
                <label
                  htmlFor={id}
                  onMouseEnter={() => setHover(star.value)}
                  className="grid size-12 cursor-pointer place-items-center rounded-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
                >
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className={cn(
                      "size-9 transition-transform duration-100 motion-reduce:transition-none",
                      star.value <= shown ? "fill-brass stroke-brass" : "fill-transparent stroke-muted-soft",
                      hover === star.value && "scale-110",
                    )}
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinejoin="round"
                      d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8z"
                    />
                  </svg>
                  <span className="sr-only">
                    {star.value} / 5 – {star.label}
                  </span>
                </label>
              </span>
            );
          })}
        </div>
        <p aria-hidden className="min-w-32 text-[15px] font-semibold text-brass-text">
          {shown ? `${shown} / 5 · ${STARS[shown - 1].label}` : <span className="font-normal text-muted">Valitse tähdet</span>}
        </p>
      </div>
      <FieldMessages field="tahdet" error={error} />
    </fieldset>
  );
}

function CommentField({ error, defaultValue }: { error?: string; defaultValue: string }) {
  const [length, setLength] = useState(defaultValue.length);
  const id = reviewFieldId("kommentti");
  const near = length > COMMENT_MAX - 100;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClass}>
        {REVIEW_FIELD_LABELS.kommentti}
        <RequiredMark />
      </label>
      <p id={`${id}-ohje`} className="text-sm text-muted">
        Mitä söit, miten palvelu toimi ja suosittelisitko paikkaa? Vähintään {COMMENT_MIN} merkkiä.
      </p>
      <textarea
        id={id}
        name="kommentti"
        required
        rows={6}
        minLength={COMMENT_MIN}
        maxLength={COMMENT_MAX}
        defaultValue={defaultValue}
        onInput={(e) => setLength(e.currentTarget.value.length)}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids(`${id}-ohje`, `${id}-laskuri`, error && reviewErrorId("kommentti"))}
        className={cn(fieldClass, "resize-y leading-relaxed")}
      />
      <div className="flex items-start justify-between gap-4">
        <FieldMessages field="kommentti" error={error} />
        <p
          id={`${id}-laskuri`}
          aria-live={near ? "polite" : "off"}
          className={cn("ml-auto shrink-0 text-sm tabular-nums", near ? "font-semibold text-warning" : "text-muted-soft")}
        >
          {length} / {COMMENT_MAX}
        </p>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-sm bg-primary px-8 text-base font-semibold text-on-primary shadow-sm transition hover:bg-primary-hover hover:text-on-primary disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 max-sm:w-full"
    >
      {pending && (
        <svg aria-hidden viewBox="0 0 24 24" className="size-4 animate-spin motion-reduce:animate-none">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" />
          <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {pending ? "Lähetetään…" : "Lähetä arvostelu"}
    </button>
  );
}
