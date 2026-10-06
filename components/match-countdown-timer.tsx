"use client";

import { useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";

/**
 * Laskurin juokseva osa (ks. components/match-countdown.tsx).
 *
 * Aika lasketaan vasta selaimessa: palvelimen ja selaimen kellot eroavat,
 * joten palvelimen tilannekuva on `null` ja se piirtää paikanvaraajat ("–"),
 * eikä hydraatio varoita sisältöerosta. Kello on ulkoinen tila
 * (`useSyncExternalStore`), joka tikittää sekunnin välein.
 *
 * Numerot ovat ruudunlukijalta piilossa, koska sekunnin välein muuttuva teksti
 * olisi häiritsevä; alkamisaika luetaan kortin `<time>`-elementistä.
 */

const UNITS = [
  { label: "päivää", ms: 24 * 60 * 60 * 1000 },
  { label: "tuntia", ms: 60 * 60 * 1000 },
  { label: "min", ms: 60 * 1000 },
  { label: "sek", ms: 1000 },
] as const;

function subscribe(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}

/** Pyöristys sekunteihin: tilannekuva pysyy samana saman sekunnin sisällä. */
const getNow = () => Math.floor(Date.now() / 1000) * 1000;
const getServerNow = () => null;

function split(diff: number): number[] {
  let rest = diff;
  return UNITS.map(({ ms }) => {
    const value = Math.floor(rest / ms);
    rest -= value * ms;
    return value;
  });
}

/**
 * `pieni`: etusivun yläosan kapea palsta, jossa laskuri on yksi monesta
 * asiasta eikä osion pääosa.
 */
export function MatchCountdownTimer({ aika, pieni = false }: { aika: string; pieni?: boolean }) {
  const target = new Date(aika).getTime();
  const now = useSyncExternalStore(subscribe, getNow, getServerNow);

  if (now !== null && now >= target) {
    // Etusivu päivittyy tunnin välein; silloin laskuri siirtyy seuraavaan otteluun.
    return <p className="text-lg font-semibold text-on-chrome">Ottelu on alkanut – Huuhkajat!</p>;
  }

  const values = now === null ? null : split(target - now);

  return (
    <div aria-hidden="true" className={cn("grid grid-cols-4", pieni ? "gap-2" : "gap-2 sm:gap-3")}>
      {UNITS.map(({ label }, i) => (
        <div
          key={label}
          className={cn(
            "flex flex-col items-center rounded-xs bg-white/10 px-1",
            pieni ? "py-2.5" : "py-2.5 sm:py-3.5",
          )}
        >
          <span
            className={cn(
              "font-display leading-none font-semibold tabular-nums text-on-chrome",
              pieni ? "text-2xl" : "text-[1.75rem] sm:text-[2.5rem]",
            )}
          >
            {values ? String(values[i]).padStart(i === 0 ? 1 : 2, "0") : "–"}
          </span>
          <span
            className={cn(
              "mt-1.5 uppercase tracking-[0.1em] text-on-chrome-muted",
              pieni ? "text-[11px]" : "text-xs sm:text-[13px]",
            )}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
