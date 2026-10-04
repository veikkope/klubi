"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";
import { KAYNTIPAIVA_MIN, reviewErrorId, reviewFieldId, tanaan } from "./form-state";
import { FieldMessages } from "./form-ui";
import { yhteenvetoRivi } from "./kentat";

/**
 * Käyntipäivä: rivi tarkistusyhteenvedossa ja oma päivävalitsin alhaalta
 * nousevassa paneelissa.
 *
 * Selaimen oma päiväkenttä näyttää laitteesta riippuen pieneltä
 * ponnahdusikkunalta (tietokone-Chrome) tai vaihtelevalta, eikä sitä voi
 * muotoilla. Oma valitsin on sama kaikkialla ja tehty peukalolle:
 * - pikavalinnat Tänään ja Eilen (useimmat arvostelut),
 * - kuukausinäkymä isoilla ruuduilla, viikko alkaa maanantaista, tulevat
 *   päivät pois käytöstä,
 * - kuukausi ja vuosi valikoista (puhelimessa rulla), joten vuosien takainen
 *   käynti löytyy parilla napautuksella; lisäksi ‹ › edelliseen/seuraavaan,
 * - päivän napautus valitsee ja sulkee.
 *
 * Saavutettavuus: `<dialog>` (modaali, Esc sulkee, fokus palaa riviin),
 * päivät ovat painikkeita (`aria-pressed`, koko päivämäärä nimenä), ja
 * nuolinäppäimet liikkuvat päivissä (roving tabindex). Lomakkeelle lähtee
 * piilokenttä YYYY-MM-DD; palvelin tarkistaa saman välin (KAYNTIPAIVA_MIN–tänään).
 * Tämä päivä luetaan vasta selaimessa, koska välimuistissa oleva sivu voi olla
 * piirretty eilen.
 */

const KUUKAUDET = [
  "tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu",
  "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu",
];
const VIIKONPAIVAT = ["ma", "ti", "ke", "to", "pe", "la", "su"];

const viikonpaiva = new Intl.DateTimeFormat("fi-FI", { weekday: "long", timeZone: "UTC" });
const viikonpaivaLyhyt = new Intl.DateTimeFormat("fi-FI", { weekday: "short", timeZone: "UTC" });

const iso = (v: number, k: number, p: number) =>
  `${v}-${String(k).padStart(2, "0")}-${String(p).padStart(2, "0")}`;
const osat = (paiva: string) => paiva.split("-").map(Number) as [number, number, number];
const paiviaKuussa = (v: number, k: number) => new Date(Date.UTC(v, k, 0)).getUTCDate();
/** Kuukauden 1. päivän viikonpäivä, ma = 0 … su = 6. */
const ensimmainenViikonpaiva = (v: number, k: number) => (new Date(Date.UTC(v, k - 1, 1)).getUTCDay() + 6) % 7;

/** "YYYY-MM-DD" ± päiviä. */
function siirra(paiva: string, paivia: number): string {
  const d = new Date(`${paiva}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + paivia);
  return d.toISOString().slice(0, 10);
}

/** "2026-10-04" → "sunnuntai 4.10.2026". */
function kirjoitettuna(paiva: string): string {
  const [v, k, p] = osat(paiva);
  return `${viikonpaiva.format(new Date(`${paiva}T00:00:00Z`))} ${p}.${k}.${v}`;
}

/** Rivin teksti (mahtuu puhelimen riville): "Tänään, 4.10.2026" · "Eilen, 3.10.2026" · "Ke 24.12.2025". */
function rivinTeksti(arvo: string, tama: string): string {
  const [v, k, p] = osat(arvo);
  const pvm = `${p}.${k}.${v}`;
  if (arvo === tama) return `Tänään, ${pvm}`;
  if (arvo === siirra(tama, -1)) return `Eilen, ${pvm}`;
  const pv = viikonpaivaLyhyt.format(new Date(`${arvo}T00:00:00Z`));
  return `${pv.charAt(0).toLocaleUpperCase("fi-FI")}${pv.slice(1)} ${pvm}`;
}

const eiTilausta = () => () => {};

export function KayntipaivaField({ error, defaultValue }: { error?: string; defaultValue: string }) {
  const tama = useSyncExternalStore(eiTilausta, tanaan, () => "");
  // Tyhjä = tämä päivä, kunnes arvostelija valitsee toisen.
  const [valittu, setValittu] = useState(defaultValue);
  const [auki, setAuki] = useState(false);
  const riviRef = useRef<HTMLButtonElement>(null);
  const kenttaRef = useRef<HTMLInputElement>(null);
  const arvo = valittu && (!tama || valittu <= tama) && valittu >= KAYNTIPAIVA_MIN ? valittu : tama;
  const id = reviewFieldId("kayntipaiva");
  const teksti = arvo && tama ? rivinTeksti(arvo, tama) : "";
  const luettava = arvo ? (arvo === tama ? `tänään, ${kirjoitettuna(arvo)}` : kirjoitettuna(arvo)) : "";

  return (
    <div>
      <input ref={kenttaRef} type="hidden" name="kayntipaiva" value={arvo} />
      <button
        ref={riviRef}
        // Virheyhteenvedon linkin kohde.
        id={id}
        type="button"
        aria-haspopup="dialog"
        onClick={() => setAuki(true)}
        aria-label={`Käyntipäivä${luettava ? `, nyt ${luettava}` : ""}. Muuta`}
        aria-describedby={error ? reviewErrorId("kayntipaiva") : undefined}
        className={cn(yhteenvetoRivi, error && "bg-danger-soft")}
      >
        <span className="w-24 shrink-0 text-sm text-muted">Käynti</span>
        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-foreground">{teksti}</span>
        <span className="shrink-0 text-sm font-semibold text-accent">Muuta</span>
      </button>
      {error && (
        <div className="px-4 pb-2">
          <FieldMessages field="kayntipaiva" error={error} />
        </div>
      )}
      {tama && (
        <PaivaPaneeli
          auki={auki}
          arvo={arvo}
          tama={tama}
          onValitse={(paiva) => {
            setValittu(paiva);
            setAuki(false);
            // Piilokenttä ei lähetä input-tapahtumaa itse: ilmoitetaan lomakkeelle,
            // jotta keskeneräisen arvostelun luonnos tallentuu heti (review-form.tsx).
            requestAnimationFrame(() => kenttaRef.current?.dispatchEvent(new Event("input", { bubbles: true })));
          }}
          onSulje={() => {
            setAuki(false);
            riviRef.current?.focus();
          }}
        />
      )}
    </div>
  );
}

function PaivaPaneeli({
  auki,
  arvo,
  tama,
  onValitse,
  onSulje,
}: {
  auki: boolean;
  arvo: string;
  tama: string;
  onValitse: (paiva: string) => void;
  onSulje: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const ruudukkoRef = useRef<HTMLDivElement>(null);
  const otsikkoId = useId();
  const [tv, tk] = osat(tama);
  const [nakyva, setNakyva] = useState<[number, number]>(() => osat(arvo).slice(0, 2) as [number, number]);
  // Näppäimistöfokus kuukausinäkymässä (roving tabindex).
  const [kohdistettu, setKohdistettu] = useState(arvo);
  const [v, k] = nakyva;
  const [minV] = osat(KAYNTIPAIVA_MIN);
  const eilen = siirra(tama, -1);

  // Avaus ja sulku; taustasivu ei vierity paneelin ollessa auki.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (auki && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!auki && dialog.open) {
      dialog.close();
    }
    if (!auki) document.documentElement.style.removeProperty("overflow");
  }, [auki]);
  useEffect(
    () => () => {
      document.documentElement.style.removeProperty("overflow");
    },
    [],
  );

  // Avattaessa valitun päivän kuukausi näkyviin ja fokus valittuun päivään.
  const [edellinenAuki, setEdellinenAuki] = useState(auki);
  if (auki !== edellinenAuki) {
    setEdellinenAuki(auki);
    if (auki) {
      setNakyva(osat(arvo).slice(0, 2) as [number, number]);
      setKohdistettu(arvo);
    }
  }
  useEffect(() => {
    if (!auki) return;
    requestAnimationFrame(() =>
      ruudukkoRef.current?.querySelector<HTMLButtonElement>('[tabindex="0"]')?.focus(),
    );
  }, [auki]);

  const sallittu = (paiva: string) => paiva <= tama && paiva >= KAYNTIPAIVA_MIN;
  const onEdellinen = v > minV || k > 1;
  const onSeuraava = v < tv || (v === tv && k < tk);

  function naytaKuukausi(uv: number, uk: number) {
    // Rajataan väliin vuoden KAYNTIPAIVA_MIN tammikuu – tämä kuukausi.
    const rajattu: [number, number] = uv > tv || (uv === tv && uk > tk) ? [tv, tk] : uv < minV ? [minV, 1] : [uv, uk];
    setNakyva(rajattu);
    // Fokus samaan päivään uudessa kuukaudessa (tai lähimpään sallittuun).
    const [, , kp] = osat(kohdistettu);
    let uusi = iso(rajattu[0], rajattu[1], Math.min(kp, paiviaKuussa(rajattu[0], rajattu[1])));
    if (uusi > tama) uusi = tama;
    setKohdistettu(uusi);
  }

  function siirraKuukausi(maara: number) {
    const kk = v * 12 + (k - 1) + maara;
    naytaKuukausi(Math.floor(kk / 12), (kk % 12) + 1);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const askeleet: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    let uusi: string | null = null;
    if (e.key in askeleet) uusi = siirra(kohdistettu, askeleet[e.key]);
    else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      siirraKuukausi(e.key === "PageUp" ? -1 : 1);
      return;
    }
    if (!uusi) return;
    e.preventDefault();
    if (!sallittu(uusi)) return;
    const [uv, uk] = osat(uusi);
    setNakyva([uv, uk]);
    setKohdistettu(uusi);
    requestAnimationFrame(() =>
      ruudukkoRef.current?.querySelector<HTMLButtonElement>(`[data-paiva="${uusi}"]`)?.focus(),
    );
  }

  const tyhjia = ensimmainenViikonpaiva(v, k);
  const paivat = Array.from({ length: paiviaKuussa(v, k) }, (_, i) => iso(v, k, i + 1));
  const vuodet = Array.from({ length: tv - minV + 1 }, (_, i) => tv - i);

  const pika = (paiva: string, nimi: string) => (
    <button
      type="button"
      onClick={() => onValitse(paiva)}
      aria-pressed={arvo === paiva}
      className={cn(
        "flex min-h-12 flex-1 items-center justify-center rounded-sm border text-[15px] font-semibold transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        arvo === paiva
          ? "border-primary bg-primary text-on-primary"
          : "border-border-strong bg-surface text-foreground hover:border-accent active:bg-surface-strong",
      )}
    >
      {nimi}
    </button>
  );

  const valikko =
    "h-11 cursor-pointer appearance-none rounded-sm bg-transparent pl-2 pr-7 text-[17px] font-semibold text-heading " +
    "hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const nuoli =
    "grid size-11 shrink-0 place-items-center rounded-full text-heading transition hover:bg-surface-strong " +
    "disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <dialog
      ref={ref}
      aria-labelledby={otsikkoId}
      onClose={onSulje}
      // Taustan napautus sulkee (napautus osuu itse dialogiin vain sen ulkopuolella).
      onClick={(e) => e.target === e.currentTarget && onSulje()}
      className={cn(
        "alapaneeli mx-0 mb-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-xl border-0 bg-surface p-0 text-foreground",
        "backdrop:bg-black/50 sm:m-auto sm:w-[min(26rem,calc(100%-2rem))] sm:rounded-sm sm:shadow-panel",
      )}
    >
      <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id={otsikkoId} className="font-display text-xl text-heading">
            Milloin kävit?
          </h2>
          <button
            type="button"
            onClick={onSulje}
            className="-mr-2 min-h-11 rounded-sm px-3 text-sm font-semibold text-accent underline underline-offset-4 hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Sulje
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          {pika(tama, "Tänään")}
          {pika(eilen, "Eilen")}
        </div>

        <div className="mt-4 flex items-center justify-between gap-1">
          <button
            type="button"
            onClick={() => siirraKuukausi(-1)}
            disabled={!onEdellinen}
            aria-label="Edellinen kuukausi"
            className={nuoli}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-6">
              <path fill="currentColor" d="M15.7 4.3a1 1 0 0 1 0 1.4L9.4 12l6.3 6.3a1 1 0 0 1-1.4 1.4l-7-7a1 1 0 0 1 0-1.4l7-7a1 1 0 0 1 1.4 0Z" />
            </svg>
          </button>
          <div className="flex items-center">
            <Valikko>
              <select
                aria-label="Kuukausi"
                value={k}
                onChange={(e) => naytaKuukausi(v, Number(e.target.value))}
                className={valikko}
              >
                {KUUKAUDET.map((nimi, i) => (
                  <option key={nimi} value={i + 1} disabled={v === tv && i + 1 > tk}>
                    {nimi}
                  </option>
                ))}
              </select>
            </Valikko>
            <Valikko>
              <select
                aria-label="Vuosi"
                value={v}
                onChange={(e) => naytaKuukausi(Number(e.target.value), k)}
                className={valikko}
              >
                {vuodet.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Valikko>
          </div>
          <button
            type="button"
            onClick={() => siirraKuukausi(1)}
            disabled={!onSeuraava}
            aria-label="Seuraava kuukausi"
            className={nuoli}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-6">
              <path fill="currentColor" d="M8.3 4.3a1 1 0 0 1 1.4 0l7 7a1 1 0 0 1 0 1.4l-7 7a1 1 0 0 1-1.4-1.4l6.3-6.3-6.3-6.3a1 1 0 0 1 0-1.4Z" />
            </svg>
          </button>
        </div>

        <div aria-hidden className="mt-2 grid grid-cols-7 text-center text-[13px] font-semibold uppercase text-muted">
          {VIIKONPAIVAT.map((p) => (
            <span key={p} className="py-1">
              {p}
            </span>
          ))}
        </div>
        <div
          ref={ruudukkoRef}
          role="group"
          aria-label={`${KUUKAUDET[k - 1]} ${v}`}
          onKeyDown={onKeyDown}
          className="grid grid-cols-7 gap-1"
        >
          {Array.from({ length: tyhjia }, (_, i) => (
            <span key={`tyhja-${i}`} aria-hidden />
          ))}
          {paivat.map((paiva) => {
            const valittuPaiva = paiva === arvo;
            const kayttokelpoinen = sallittu(paiva);
            return (
              <button
                key={paiva}
                type="button"
                data-paiva={paiva}
                tabIndex={paiva === kohdistettu ? 0 : -1}
                disabled={!kayttokelpoinen}
                aria-pressed={valittuPaiva}
                aria-label={`${kirjoitettuna(paiva)}${paiva === tama ? ", tänään" : ""}`}
                onClick={() => onValitse(paiva)}
                className={cn(
                  "flex aspect-square min-h-11 items-center justify-center rounded-full text-base tabular-nums transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  valittuPaiva
                    ? "bg-primary font-semibold text-on-primary"
                    : kayttokelpoinen
                      ? cn("text-foreground hover:bg-surface-strong active:bg-border", paiva === tama && "font-semibold ring-1 ring-inset ring-primary")
                      : "cursor-not-allowed text-muted-soft opacity-50",
                )}
              >
                {Number(paiva.slice(8))}
              </button>
            );
          })}
        </div>
      </div>
    </dialog>
  );
}

/** Kuukausi- ja vuosivalikko: alanuoli kertoo, että teksti on valikko (puhelimessa rulla). */
function Valikko({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative flex items-center">
      {children}
      <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute right-2 size-4 text-muted">
        <path
          fill="currentColor"
          d="M5.2 7.2a.75.75 0 0 1 1.06 0L10 10.94l3.74-3.74a.75.75 0 1 1 1.06 1.06l-4.27 4.27a.75.75 0 0 1-1.06 0L5.2 8.26a.75.75 0 0 1 0-1.06Z"
        />
      </svg>
    </span>
  );
}
