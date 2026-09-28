"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { cn } from "@/lib/cn";
import { lahetaKommentti } from "./actions";
import {
  INITIAL_KOMMENTTI_STATE,
  KOMMENTTI_FIELD_LABELS,
  NIMI_MAX,
  TEKSTI_MAX,
  VEIKKAUS_MAX,
  kommenttiErrorId,
  kommenttiFieldId,
  sijojenMaara,
  type KommenttiField,
  type KommenttiFormState,
  type Kommentointi,
} from "./form-state";

/**
 * Kommentti- ja veikkauslomake uutisen alla (docs/15 §2).
 *
 * Client Component, jotta virheet, lähetystila ja sarjajärjestyksen siirrot
 * päivittyvät ilman sivunlatausta. Lähetys menee Server Actionille, ja kentät
 * ovat tavallisia lomakekenttiä, joten lomake toimii myös ennen hydraatiota.
 */

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground " +
  "transition placeholder:text-muted-soft focus-visible:border-accent focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const labelClass = "text-sm font-medium text-foreground";

/** Selaimeen muistettavat kentät (vain tämän kävijän mukavuus, ei tallennusta palvelimelle). */
const MUISTI_NIMI = "klubi-kommentti-nimi";
const MUISTI_KOODI = "klubi-kommentti-koodi";

function lueMuisti(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function kirjoitaMuisti(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Yksityinen selaus tai estetty tallennus: lomake toimii silti.
  }
}

export function KommenttiLomake({
  uutinenId,
  kommentointi,
}: {
  uutinenId: string;
  kommentointi: Kommentointi;
}) {
  const [state, formAction] = useActionState<KommenttiFormState, FormData>(lahetaKommentti, INITIAL_KOMMENTTI_STATE);
  const tyyppi = kommentointi.tyyppi ?? "kommentti";
  const onVeikkaus = tyyppi !== "kommentti";
  const nimiRef = useRef<HTMLInputElement>(null);
  const koodiRef = useRef<HTMLInputElement>(null);

  // Nimi ja koodisana valmiiksi edellisestä kerrasta.
  useEffect(() => {
    if (nimiRef.current && !nimiRef.current.value) nimiRef.current.value = lueMuisti(MUISTI_NIMI);
    if (koodiRef.current && !koodiRef.current.value) koodiRef.current.value = lueMuisti(MUISTI_KOODI);
  }, [state.lahetyksia]);

  const muista = () => {
    if (nimiRef.current?.value) kirjoitaMuisti(MUISTI_NIMI, nimiRef.current.value.trim());
    if (koodiRef.current?.value) kirjoitaMuisti(MUISTI_KOODI, koodiRef.current.value.trim());
  };

  const kentat: KommenttiField[] = ["nimi", ...(onVeikkaus ? (["veikkaus"] as const) : []), "teksti", "koodi"];
  if (tyyppi === "voittajaveikkaus" && kommentointi.maalikuningas) kentat.splice(2, 0, "maalikuningas");
  const virheet = kentat.filter((f) => state.fieldErrors[f]);

  return (
    <div>
      <div aria-live="polite" role="status">
        {state.status === "success" && (
          <p className="mb-6 rounded-2xl border border-border bg-surface p-5 font-medium text-foreground">
            {state.message}
          </p>
        )}
        {state.status === "error" && (
          <div className="mb-6 rounded-2xl border border-danger-border bg-danger-soft p-5">
            <p className="font-medium text-danger">{state.message}</p>
            {virheet.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                {virheet.map((field) => (
                  <li key={field}>
                    <a href={`#${kommenttiFieldId(field)}`} className="text-danger underline underline-offset-4">
                      {KOMMENTTI_FIELD_LABELS[field]}: {state.fieldErrors[field]}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* key: onnistunut lähetys tyhjentää lomakkeen (nimi ja koodi palautetaan muistista). */}
      <form key={state.lahetyksia} action={formAction} onSubmit={muista} noValidate className="space-y-6">
        <input type="hidden" name="uutinen" value={uutinenId} />

        {kommentointi.ohje && <p className="leading-relaxed text-muted">{kommentointi.ohje}</p>}

        <Field field="nimi" state={state} required hint="Näkyy sivulla veikkauksesi yhteydessä.">
          <input
            ref={nimiRef}
            id={kommenttiFieldId("nimi")}
            name="nimi"
            type="text"
            required
            maxLength={NIMI_MAX}
            autoComplete="given-name"
            defaultValue={state.values.nimi}
            aria-invalid={state.fieldErrors.nimi ? true : undefined}
            aria-describedby={describedBy("nimi", state, true)}
            className={cn(fieldClass, "sm:max-w-xs")}
          />
        </Field>

        {tyyppi === "sarjajarjestys" && (
          <Sarjajarjestys
            vaihtoehdot={kommentointi.vaihtoehdot ?? []}
            alku={state.values.jarjestys}
            error={state.fieldErrors.veikkaus}
          />
        )}

        {tyyppi === "voittajaveikkaus" && (
          <Voittajaveikkaus kommentointi={kommentointi} state={state} />
        )}

        <Field
          field="teksti"
          state={state}
          required={!onVeikkaus}
          label={onVeikkaus ? "Kommentti (vapaaehtoinen)" : undefined}
        >
          <textarea
            id={kommenttiFieldId("teksti")}
            name="teksti"
            required={!onVeikkaus}
            rows={onVeikkaus ? 2 : 4}
            maxLength={TEKSTI_MAX}
            defaultValue={state.values.teksti}
            aria-invalid={state.fieldErrors.teksti ? true : undefined}
            aria-describedby={describedBy("teksti", state)}
            className={cn(fieldClass, "resize-y")}
          />
        </Field>

        <Field field="koodi" state={state} required hint="Jäsenille kerrottu sana. Kysy sitä sihteeriltä, jos et muista.">
          <input
            ref={koodiRef}
            id={kommenttiFieldId("koodi")}
            name="koodi"
            type="text"
            required
            maxLength={40}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-invalid={state.fieldErrors.koodi ? true : undefined}
            aria-describedby={describedBy("koodi", state, true)}
            className={cn(fieldClass, "sm:max-w-xs")}
          />
        </Field>

        {/* Hunajapurkki: piilossa ihmisiltä ja näppäimistöltä, vain botti täyttää sen. */}
        <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="kommentti-verkkosivu">Verkkosivu</label>
          <input id="kommentti-verkkosivu" name="verkkosivu" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        <p className="text-sm text-muted">
          Nimesi ja {onVeikkaus ? "veikkauksesi" : "kommenttisi"} näkyvät sivulla julkisesti heti lähettämisen jälkeen.
          Lue{" "}
          <Link href="/tietosuoja" className="text-accent underline underline-offset-4">
            tietosuojaseloste
          </Link>
          .
        </p>

        <SubmitButton label={onVeikkaus ? "Lähetä veikkaus" : "Lähetä kommentti"} />
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sarjajärjestys                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Joukkueet järjestykseen. Jokaisella rivillä on sijavalinta (toimii ilman
 * JavaScriptiä) ja ↑/↓-napit. Kenttien nimet ovat joukkueen alkuperäisen
 * indeksin mukaan (`sija-<i>`), joten lähetysmuoto on sama rivien järjestyksestä
 * riippumatta.
 */
function Sarjajarjestys({
  vaihtoehdot,
  alku,
  error,
}: {
  vaihtoehdot: string[];
  alku: string[];
  error?: string;
}) {
  const [jarjestys, setJarjestys] = useState<string[]>(() =>
    alku.length === vaihtoehdot.length && alku.every((j) => vaihtoehdot.includes(j)) ? alku : vaihtoehdot,
  );
  const [ilmoitus, setIlmoitus] = useState("");
  const n = jarjestys.length;

  const siirra = (joukkue: string, uusiSija: number) => {
    const kohde = Math.min(n, Math.max(1, uusiSija)) - 1;
    setJarjestys((nyt) => {
      const ilman = nyt.filter((j) => j !== joukkue);
      ilman.splice(kohde, 0, joukkue);
      return ilman;
    });
    setIlmoitus(`${joukkue} sijalle ${kohde + 1}.`);
  };

  const buttonClass =
    "inline-flex size-11 items-center justify-center rounded-sm border border-border bg-background text-lg " +
    "text-foreground transition hover:border-accent hover:text-accent disabled:opacity-30 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <fieldset
      id={kommenttiFieldId("veikkaus")}
      tabIndex={-1}
      aria-invalid={error ? true : undefined}
      aria-describedby={[`${kommenttiFieldId("veikkaus")}-ohje`, error ? kommenttiErrorId("veikkaus") : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <legend className={labelClass}>
        Veikkauksesi
        <span className="text-danger">
          {" *"}
          <span className="sr-only">pakollinen</span>
        </span>
      </legend>
      <p id={`${kommenttiFieldId("veikkaus")}-ohje`} className="mt-1 text-xs text-muted">
        Siirrä joukkueet nuolilla tai valitse sija numerosta. Ylimpänä on voittaja.
      </p>
      <ol className="mt-3 list-none space-y-2 p-0">
        {jarjestys.map((joukkue, index) => {
          const alkuperainen = vaihtoehdot.indexOf(joukkue);
          const selectId = `sija-${alkuperainen}`;
          return (
            <li key={joukkue} className="flex items-center gap-2 rounded-lg border border-border bg-surface p-2">
              <label htmlFor={selectId} className="sr-only">
                Joukkueen {joukkue} sija
              </label>
              <select
                id={selectId}
                name={`sija-${alkuperainen}`}
                value={index + 1}
                onChange={(e) => siirra(joukkue, Number(e.target.value))}
                className={cn(fieldClass, "h-11 w-20 shrink-0 py-0 font-semibold tabular-nums")}
              >
                {jarjestys.map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}.
                  </option>
                ))}
              </select>
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">{joukkue}</span>
              <button
                type="button"
                onClick={() => siirra(joukkue, index)}
                disabled={index === 0}
                aria-label={`Siirrä ${joukkue} ylöspäin`}
                className={buttonClass}
              >
                <span aria-hidden>↑</span>
              </button>
              <button
                type="button"
                onClick={() => siirra(joukkue, index + 2)}
                disabled={index === n - 1}
                aria-label={`Siirrä ${joukkue} alaspäin`}
                className={buttonClass}
              >
                <span aria-hidden>↓</span>
              </button>
            </li>
          );
        })}
      </ol>
      <p aria-live="polite" className="sr-only">
        {ilmoitus}
      </p>
      {error && (
        <p id={kommenttiErrorId("veikkaus")} className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/* -------------------------------------------------------------------------- */
/* Voittajaveikkaus                                                            */
/* -------------------------------------------------------------------------- */

const SIJAN_NIMI = ["Voittaja", "2. sija", "3. sija", "4. sija", "5. sija", "6. sija", "7. sija", "8. sija", "9. sija", "10. sija"];

function Voittajaveikkaus({ kommentointi, state }: { kommentointi: Kommentointi; state: KommenttiFormState }) {
  const maara = sijojenMaara(kommentointi);
  const vaihtoehdot = kommentointi.vaihtoehdot ?? [];
  const error = state.fieldErrors.veikkaus;

  return (
    <>
      <fieldset
        id={kommenttiFieldId("veikkaus")}
        tabIndex={-1}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? kommenttiErrorId("veikkaus") : undefined}
      >
        <legend className={labelClass}>
          Veikkauksesi
          <span className="text-danger">
            {" *"}
            <span className="sr-only">pakollinen</span>
          </span>
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: maara }, (_, p) => {
            const id = `paikka-${p + 1}`;
            const alku = state.values.jarjestys[p] ?? "";
            return (
              <div key={id} className="flex flex-col gap-1.5">
                <label htmlFor={id} className="text-sm text-muted">
                  {SIJAN_NIMI[p]}
                </label>
                {vaihtoehdot.length > 0 ? (
                  <select id={id} name={id} required defaultValue={alku} className={cn(fieldClass, "h-11 py-0")}>
                    <option value="">Valitse</option>
                    {vaihtoehdot.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input id={id} name={id} type="text" required maxLength={VEIKKAUS_MAX} defaultValue={alku} className={fieldClass} />
                )}
              </div>
            );
          })}
        </div>
        {error && (
          <p id={kommenttiErrorId("veikkaus")} className="mt-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}
      </fieldset>

      {kommentointi.maalikuningas && (
        <Field field="maalikuningas" state={state} required>
          <input
            id={kommenttiFieldId("maalikuningas")}
            name="maalikuningas"
            type="text"
            required
            maxLength={VEIKKAUS_MAX}
            defaultValue={state.values.maalikuningas}
            aria-invalid={state.fieldErrors.maalikuningas ? true : undefined}
            aria-describedby={describedBy("maalikuningas", state)}
            className={cn(fieldClass, "sm:max-w-sm")}
          />
        </Field>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Apukomponentit                                                              */
/* -------------------------------------------------------------------------- */

function describedBy(field: KommenttiField, state: KommenttiFormState, hasHint = false): string | undefined {
  const ids: string[] = [];
  if (state.fieldErrors[field]) ids.push(kommenttiErrorId(field));
  if (hasHint) ids.push(`${kommenttiFieldId(field)}-ohje`);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

function Field({
  field,
  state,
  required,
  label,
  hint,
  children,
}: {
  field: KommenttiField;
  state: KommenttiFormState;
  required?: boolean;
  label?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const error = state.fieldErrors[field];
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={kommenttiFieldId(field)} className={labelClass}>
        {label ?? KOMMENTTI_FIELD_LABELS[field]}
        {required && (
          <span className="text-danger">
            {" *"}
            <span className="sr-only">pakollinen</span>
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p id={`${kommenttiFieldId(field)}-ohje`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={kommenttiErrorId(field)} className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-8 text-sm font-medium text-on-primary shadow-sm transition hover:bg-primary-hover hover:text-on-primary disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {pending ? "Lähetetään…" : label}
    </button>
  );
}
