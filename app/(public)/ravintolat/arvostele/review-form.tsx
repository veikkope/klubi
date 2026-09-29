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
  RATING_FIELDS,
  RATING_MAX,
  RATING_MIN,
  REVIEW_FIELDS,
  REVIEW_FIELD_LABELS,
  reviewErrorId,
  reviewFieldId,
  type ReviewField,
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
 * - Osa-alueiden arvosanat (1,0–5,0) annetaan liukusäätimellä tai numerokentällä;
 *   säädin toimii nuolinäppäimillä ja kertoo arvon ruudunlukijalle.
 * - Merkkilaskuri kerrotaan ruudunlukijalle vasta, kun raja on lähellä.
 */

/** Välilyönnillä erotettu id-lista `aria-describedby`:lle; tyhjät pois. */
function ids(...values: (string | false | undefined)[]): string | undefined {
  const list = values.filter(Boolean);
  return list.length ? list.join(" ") : undefined;
}

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
          <RatingsField values={state.values} errors={state.fieldErrors} />
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

/** 3.25 → "3,3". */
function formatScore(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

/** "3,3" tai "3.3" → 3.3; muuten null. Sama sääntö kuin palvelimella (actions.ts). */
function parseScore(text: string): number | null {
  const value = Number(text.trim().replace(",", "."));
  if (!text.trim() || !Number.isFinite(value) || value < RATING_MIN || value > RATING_MAX) return null;
  return Math.round(value * 10) / 10;
}

/**
 * Arvosanat kolmesta osa-alueesta (ruoka, hinta, viihtyvyys) yhden desimaalin
 * tarkkuudella kuten klubin omissa arvioissa. Kokonaisarvosana on keskiarvo,
 * ja se näytetään heti.
 */
function RatingsField({
  values,
  errors,
}: {
  values: ReviewFormState["values"];
  errors: ReviewFormState["fieldErrors"];
}) {
  const [scores, setScores] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(RATING_FIELDS.map(({ field }) => [field, parseScore(values[field])])),
  );
  const given = RATING_FIELDS.map(({ field }) => scores[field]).filter((v): v is number => v !== null);
  const average = given.length === RATING_FIELDS.length ? given.reduce((a, b) => a + b, 0) / given.length : null;

  return (
    <div className="flex flex-col">
      <p className={labelClass}>
        Arvosanat
        <RequiredMark />
      </p>
      <p className="mt-1 text-sm text-muted">
        Arvioi kolme osa-aluetta asteikolla 1,0–5,0 kuten klubin arvioissa. Vedä säädintä tai
        kirjoita arvosana, esim. 3,3. Kokonaisarvosana on osa-alueiden keskiarvo.
      </p>
      <div className="mt-3 flex flex-col divide-y divide-border rounded-sm border border-border bg-background">
        {RATING_FIELDS.map(({ field, hint }) => (
          <ScoreRow
            key={field}
            field={field}
            hint={hint}
            error={errors[field]}
            defaultText={values[field]}
            onChange={(v) => setScores((prev) => ({ ...prev, [field]: v }))}
          />
        ))}
        <div className="flex items-center justify-between gap-4 bg-brass-tint/60 px-4 py-3.5 sm:px-5">
          <span className="text-[15px] font-semibold text-foreground">Kokonaisarvosana</span>
          <span aria-live="polite" className="font-display text-2xl font-semibold tabular-nums text-brass-text">
            {average === null ? (
              <span className="font-sans text-sm font-normal text-muted">Anna kaikki kolme arvosanaa</span>
            ) : (
              <>
                {formatScore(average)}
                <span className="font-sans text-sm font-normal text-muted"> / 5</span>
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Yksi osa-alue: liukusäädin (1,0–5,0, askel 0,1) ja numerokenttä rinnakkain.
 * Säädin toimii nuolinäppäimillä (0,1) ja Page Up/Down -näppäimillä (1,0).
 * Lomakkeelle lähtee numerokentän arvo, jonka voi kirjoittaa pilkulla tai
 * pisteellä. Ennen ensimmäistä valintaa säädin on haalea eikä arvoa lähetetä,
 * jotta keskikohtaa ei tallenneta vahingossa.
 */
function ScoreRow({
  field,
  hint,
  error,
  defaultText,
  onChange,
}: {
  field: ReviewField;
  hint: string;
  error?: string;
  defaultText: string;
  onChange: (value: number | null) => void;
}) {
  const [text, setText] = useState(() => {
    const v = parseScore(defaultText);
    return v === null ? defaultText : formatScore(v);
  });
  const value = parseScore(text);
  const label = REVIEW_FIELD_LABELS[field];
  const nameId = `${reviewFieldId(field)}-nimi`;
  const hintId = `${reviewFieldId(field)}-ohje`;
  const invalidText = text.trim() !== "" && value === null;

  function set(next: string) {
    setText(next);
    onChange(parseScore(next));
  }

  return (
    <div className="px-4 py-3.5 sm:px-5">
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 sm:grid-cols-[13rem_1fr_auto]">
        <div>
          <p id={nameId} className="text-[15px] font-semibold text-foreground">
            {label}
          </p>
          <p id={hintId} className="text-[13px] leading-snug text-muted">
            {hint}
          </p>
        </div>
        <div className="col-span-2 row-start-2 flex flex-col sm:col-span-1 sm:row-start-auto">
          <input
            type="range"
            min={RATING_MIN}
            max={RATING_MAX}
            step={0.1}
            value={value ?? 3}
            onChange={(e) => set(formatScore(Number(e.target.value)))}
            aria-labelledby={nameId}
            aria-describedby={hintId}
            aria-valuetext={value === null ? "Ei arvioitu" : `${formatScore(value)} / 5`}
            className={cn(
              "h-11 w-full cursor-pointer accent-brass",
              value === null && "opacity-40 grayscale",
            )}
          />
          <div aria-hidden className="-mt-1.5 flex justify-between px-0.5 text-xs tabular-nums text-muted-soft">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        </div>
        <div className="col-start-2 row-start-1 flex items-baseline gap-1.5 sm:col-start-3">
          <input
            // Virheyhteenvedon linkin kohde; lomakkeelle lähtevä arvo.
            id={reviewFieldId(field)}
            name={field}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            maxLength={4}
            placeholder="–"
            value={text}
            onChange={(e) => set(e.target.value)}
            onBlur={() => value !== null && set(formatScore(value))}
            aria-label={`${label}, arvosana 1,0–5,0`}
            aria-invalid={error || invalidText ? true : undefined}
            aria-describedby={ids(hintId, error && reviewErrorId(field), invalidText && `${reviewFieldId(field)}-muoto`)}
            className={cn(
              fieldClass,
              "w-[4.5rem] text-center font-display text-xl font-semibold tabular-nums text-brass-text",
            )}
          />
          <span aria-hidden className="text-sm text-muted">/ 5</span>
        </div>
      </div>
      {invalidText && !error && (
        <p id={`${reviewFieldId(field)}-muoto`} className="mt-1.5 text-sm text-warning">
          Kirjoita luku väliltä 1,0–5,0, esim. 3,3.
        </p>
      )}
      <FieldMessages field={field} error={error} />
    </div>
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
