"use client";

import { useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";
import {
  COMMENT_MAX,
  KAYNTIPAIVA_MIN,
  RATING_FIELDS,
  RATING_MAX,
  RATING_MIN,
  REVIEW_FIELD_LABELS,
  reviewErrorId,
  reviewFieldId,
  tanaan,
  type ReviewField,
  type ReviewValues,
} from "./form-state";
import { FieldMessages, fieldClass, labelClass } from "./form-ui";
import { parseScore } from "./vaiheet";

/** Arvostelun kentät: arvosanat, käyntipäivä ja vapaaehtoinen teksti. */

/** Tarkistusyhteenvedon rivi (review-form.tsx): selite, arvo ja "Muuta". */
export const yhteenvetoRivi =
  "flex min-h-[2.875rem] w-full items-center gap-3 px-4 py-1.5 text-left transition hover:bg-background active:bg-surface-strong " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring";

/** Välilyönnillä erotettu id-lista `aria-describedby`:lle; tyhjät pois. */
function ids(...values: (string | false | undefined)[]): string | undefined {
  const list = values.filter(Boolean);
  return list.length ? list.join(" ") : undefined;
}

/** 3.25 → "3,3". */
export function formatScore(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

/**
 * Arvosanat kolmesta osa-alueesta (ruoka, hinta, viihtyvyys) yhden desimaalin
 * tarkkuudella kuten klubin omissa arvioissa. Kokonaisarvosana on keskiarvo,
 * ja se näytetään heti. Arvot ovat lomakkeen tilassa (review-form.tsx), koska
 * vaiheesta pääsee eteenpäin vasta, kun kaikki kolme on annettu.
 */
export function RatingsField({
  values,
  errors,
  scores,
  onScore,
}: {
  values: ReviewValues;
  errors: Partial<Record<ReviewField, string>>;
  scores: Record<string, number | null>;
  onScore: (field: ReviewField, value: number | null) => void;
}) {
  const given = RATING_FIELDS.map(({ field }) => scores[field]).filter((v): v is number => v != null);
  const average = given.length === RATING_FIELDS.length ? given.reduce((a, b) => a + b, 0) / given.length : null;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-sm border border-border bg-surface">
        {RATING_FIELDS.map(({ field, hint }) => (
          <ScoreRow
            key={field}
            field={field}
            hint={hint}
            error={errors[field]}
            defaultText={values[field]}
            onChange={(v) => onScore(field, v)}
          />
        ))}
        <div className="flex items-center justify-between gap-4 bg-brass-tint/60 px-4 py-2 sm:px-5">
          <span className="text-[15px] font-semibold text-foreground">Kokonaisarvosana</span>
          <span aria-live="polite" className="font-display text-2xl font-semibold tabular-nums text-brass-text">
            {average === null ? (
              <span className="font-sans text-sm font-normal text-muted">Anna kaikki kolme</span>
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
 * Yksi osa-alue puhelinta varten: numeronapit 1–5 antavat tasaluvun yhdellä
 * napautuksella, −/+ hienosäätää 0,1 kerrallaan ja numerokenttään voi kirjoittaa
 * (pilkku tai piste). Ei liukusäädintä: sivua vierittävä sormi siirtäisi sitä
 * vahingossa. Ennen ensimmäistä valintaa arvoa ei ole eikä sitä lähetetä.
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

  /** −/+: 0,1 kerrallaan; tyhjästä aloitetaan keskeltä (3,0). */
  function nudge(delta: number) {
    const next = value === null ? 3 : Math.min(RATING_MAX, Math.max(RATING_MIN, Math.round((value + delta) * 10) / 10));
    set(formatScore(next));
  }

  const nudgeClass =
    "grid size-11 shrink-0 place-items-center rounded-sm border border-border bg-background text-xl font-semibold " +
    "text-foreground transition hover:border-accent disabled:opacity-40 focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <div className="px-4 py-3 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p id={nameId} className="text-[15px] font-semibold text-foreground">
            {label}
          </p>
          <p id={hintId} className="text-[13px] leading-snug text-muted">
            {hint}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => nudge(-0.1)}
            disabled={value !== null && value <= RATING_MIN}
            aria-label={`${label}: vähennä 0,1`}
            className={nudgeClass}
          >
            <span aria-hidden>−</span>
          </button>
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
              "h-11 w-16 px-1 text-center font-display text-xl font-semibold tabular-nums text-brass-text",
            )}
          />
          <button
            type="button"
            onClick={() => nudge(0.1)}
            disabled={value !== null && value >= RATING_MAX}
            aria-label={`${label}: lisää 0,1`}
            className={nudgeClass}
          >
            <span aria-hidden>+</span>
          </button>
        </div>
      </div>
      <div role="group" aria-label={`${label}: valitse tasaluku`} className="mt-2 grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => set(formatScore(n))}
            aria-pressed={value === n}
            className={cn(
              "h-11 rounded-sm border text-base font-semibold tabular-nums transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              value === n
                ? "border-primary bg-primary text-on-primary"
                : value !== null && n < value
                  ? "border-brass-tint bg-brass-tint text-brass-tint-text"
                  : "border-border bg-background text-foreground hover:border-accent active:bg-surface-strong",
            )}
          >
            {n}
          </button>
        ))}
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

const KUUKAUDET = [
  "tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu",
  "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu",
];

const viikonpaiva = new Intl.DateTimeFormat("fi-FI", { weekday: "long", timeZone: "UTC" });

/** "2026-10-04" → "sunnuntai 4.10.2026". */
function kirjoitettuna(paiva: string): string {
  const [v, k, p] = paiva.split("-").map(Number);
  return `${viikonpaiva.format(new Date(`${paiva}T00:00:00Z`))} ${p}.${k}.${v}`;
}

const iso = (v: number, k: number, p: number) =>
  `${v}-${String(k).padStart(2, "0")}-${String(p).padStart(2, "0")}`;

/** Kuukauden päivien määrä (k = 1–12). */
const paiviaKuussa = (v: number, k: number) => new Date(Date.UTC(v, k, 0)).getUTCDate();

/** "YYYY-MM-DD" ± päiviä. */
function siirra(paiva: string, paivia: number): string {
  const d = new Date(`${paiva}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + paivia);
  return d.toISOString().slice(0, 10);
}

const eiTilausta = () => () => {};

/**
 * Käyntipäivä suomalaisittain: päivä, kuukausi ja vuosi omina valintoinaan
 * (selaimen päivämääräkenttä näyttäisi selaimen kielen muodon, esim. kk/pp/vvvv).
 * Pikavalinnat Tänään ja Eilen kattavat useimmat arvostelut, ja valittu päivä
 * näytetään kirjoitettuna ("lauantai 3.10.2026").
 *
 * Useimmiten arvostellaan samana päivänä, joten kenttä on aluksi yksi rivi
 * ("Käynti tänään · Vaihda"); valinnat avautuvat Vaihda-painikkeesta tai
 * palvelimen virheestä.
 *
 * Oletus on tämä päivä. Se luetaan vasta selaimessa (`useSyncExternalStore`),
 * koska välimuistissa oleva sivu voi olla piirretty eilen. Tulevaisuuteen
 * osuva valinta rajataan tähän päivään; palvelin tarkistaa saman.
 */
export function KayntipaivaField({ error, defaultValue }: { error?: string; defaultValue: string }) {
  const tama = useSyncExternalStore(eiTilausta, tanaan, () => "");
  // Tyhjä = tämä päivä, kunnes arvostelija valitsee toisen.
  const [valittu, setValittu] = useState(defaultValue);
  const [auki, setAuki] = useState(false);
  const arvo = valittu || tama;
  const id = reviewFieldId("kayntipaiva");
  const eilen = tama ? siirra(tama, -1) : "";

  const [v, k, p] = arvo ? arvo.split("-").map(Number) : [0, 0, 0];
  const tamaVuosi = tama ? Number(tama.slice(0, 4)) : 0;
  const vuodet = tamaVuosi
    ? Array.from({ length: tamaVuosi - Number(KAYNTIPAIVA_MIN.slice(0, 4)) + 1 }, (_, i) => tamaVuosi - i)
    : [];

  function aseta(uv: number, uk: number, up: number) {
    const seuraava = iso(uv, uk, Math.min(up, paiviaKuussa(uv, uk)));
    setValittu(tama && seuraava > tama ? tama : seuraava);
  }

  const pika = (paiva: string, nimi: string) => (
    <button
      type="button"
      onClick={() => setValittu(paiva)}
      aria-pressed={arvo === paiva}
      disabled={!paiva}
      className={cn(
        "inline-flex min-h-11 items-center rounded-sm border px-4 text-sm font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        arvo === paiva
          ? "border-primary bg-primary text-on-primary"
          : "border-border bg-background text-foreground hover:border-accent hover:text-accent",
      )}
    >
      {nimi}
    </button>
  );

  const valinta = "h-12 appearance-auto pr-2";

  // Tiivis rivi tarkistusyhteenvedossa (review-form.tsx): koko rivi avaa valinnat.
  if (!auki && !error) {
    const nimi = arvo === tama ? "Tänään" : arvo === eilen ? "Eilen" : null;
    return (
      <>
        <input type="hidden" name="kayntipaiva" value={arvo} />
        <button
          id={id}
          type="button"
          onClick={() => {
            setAuki(true);
            requestAnimationFrame(() => document.getElementById(id)?.focus());
          }}
          className={yhteenvetoRivi}
        >
          <span className="w-24 shrink-0 text-sm text-muted">Käynti</span>
          <span aria-live="polite" className="min-w-0 flex-1 truncate text-[15px] font-semibold text-foreground">
            {arvo && (nimi ? `${nimi}, ${kirjoitettuna(arvo).split(" ")[1]}` : kirjoitettuna(arvo))}
          </span>
          <span className="shrink-0 text-sm font-semibold text-accent">
            Muuta<span className="sr-only"> käyntipäivää</span>
          </span>
        </button>
      </>
    );
  }

  return (
    <fieldset
      className="flex flex-col gap-1.5 px-4 py-3"
      aria-describedby={ids(`${id}-ohje`, error && reviewErrorId("kayntipaiva"))}
    >
      <legend className={labelClass}>{REVIEW_FIELD_LABELS.kayntipaiva}</legend>
      <p id={`${id}-ohje`} className="text-sm text-muted">
        Milloin kävit ravintolassa? Valitse päivä, kuukausi ja vuosi, jos kävit aiemmin.
      </p>
      <input type="hidden" name="kayntipaiva" value={arvo} />

      <div className="mt-1 flex flex-wrap gap-2">
        {pika(tama, "Tänään")}
        {pika(eilen, "Eilen")}
      </div>

      <div className="mt-2 grid grid-cols-[4.5rem_1fr_6rem] gap-2">
        <label className="flex flex-col gap-1 text-[13px] text-muted">
          Päivä
          <select
            // Virheyhteenvedon linkin kohde.
            id={id}
            value={p || ""}
            onChange={(e) => aseta(v, k, Number(e.target.value))}
            aria-invalid={error ? true : undefined}
            className={cn(fieldClass, valinta)}
          >
            {!arvo && <option value="">–</option>}
            {arvo &&
              Array.from({ length: paiviaKuussa(v, k) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n} disabled={iso(v, k, n) > tama}>
                  {n}.
                </option>
              ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] text-muted">
          Kuukausi
          <select
            value={k || ""}
            onChange={(e) => aseta(v, Number(e.target.value), p)}
            aria-invalid={error ? true : undefined}
            className={cn(fieldClass, valinta)}
          >
            {!arvo && <option value="">–</option>}
            {arvo &&
              KUUKAUDET.map((nimi, i) => (
                <option key={nimi} value={i + 1} disabled={iso(v, i + 1, 1) > tama}>
                  {nimi}
                </option>
              ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] text-muted">
          Vuosi
          <select
            value={v || ""}
            onChange={(e) => aseta(Number(e.target.value), k, p)}
            aria-invalid={error ? true : undefined}
            className={cn(fieldClass, valinta)}
          >
            {!arvo && <option value="">–</option>}
            {vuodet.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p aria-live="polite" className="mt-1 text-sm text-foreground">
        {arvo && (
          <>
            Käynti: <strong className="font-semibold">{kirjoitettuna(arvo)}</strong>
          </>
        )}
      </p>
      <FieldMessages field="kayntipaiva" error={error} />
    </fieldset>
  );
}

export function CommentField({ error, defaultValue }: { error?: string; defaultValue: string }) {
  const [length, setLength] = useState(defaultValue.length);
  const id = reviewFieldId("kommentti");
  const near = length > COMMENT_MAX - 100;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClass}>
        {REVIEW_FIELD_LABELS.kommentti} <span className="font-normal text-muted">(valinnainen)</span>
      </label>
      <textarea
        id={id}
        name="kommentti"
        // Kasvaa tekstin mukana (field-sizing), muuten kaksi riviä.
        rows={2}
        maxLength={COMMENT_MAX}
        defaultValue={defaultValue}
        onInput={(e) => setLength(e.currentTarget.value.length)}
        aria-invalid={error ? true : undefined}
        placeholder="Mitä söit, miten palvelu toimi, suosittelisitko?"
        aria-describedby={ids(`${id}-laskuri`, error && reviewErrorId("kommentti"))}
        className={cn(fieldClass, "max-h-60 min-h-16 resize-y bg-surface leading-relaxed field-sizing-content")}
      />
      <div className="flex items-start justify-between gap-4 empty:hidden">
        <FieldMessages field="kommentti" error={error} />
        {/* Laskuri vasta rajan lähellä: tilaa puhelimen ruudulla. */}
        <p
          id={`${id}-laskuri`}
          aria-live={near ? "polite" : "off"}
          className={cn("ml-auto shrink-0 text-sm font-semibold tabular-nums text-warning", !near && "sr-only")}
        >
          {length} / {COMMENT_MAX}
        </p>
      </div>
    </div>
  );
}
