"use client";

import { useState, useSyncExternalStore } from "react";

/**
 * Vinkki arvostelun lisäämisestä puhelimen kotinäyttöön (PWA, app/manifest.ts).
 *
 * Kotinäytön kuvake avaa arvostelun ilman selaimen palkkeja kuin sovelluksen.
 * Android/Chrome: selain tarjoaa asennuksen `beforeinstallprompt`-tapahtumalla,
 * ja painike avaa selaimen oman asennusikkunan. iPhone/iPad: asennusta ei voi
 * käynnistää sivulta, joten näytetään ohje (Jaa → Lisää Koti-valikkoon).
 * Ei näytetä, kun arvostelu on jo avattu kotinäytöltä tai vinkki on suljettu.
 */

type AsennusTapahtuma = Event & { prompt: () => Promise<void> };

const OHITETTU_AVAIN = "klubi.kotinaytto-ohitettu";

// Tapahtuma tulee kerran sivun latauksen jälkeen, usein ennen kuin vinkki on
// näkyvissä, joten se otetaan talteen heti moduulin latautuessa.
let asennus: AsennusTapahtuma | null = null;
const kuuntelijat = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    // Oma painike selaimen oman ilmoituspalkin sijaan.
    e.preventDefault();
    asennus = e as AsennusTapahtuma;
    kuuntelijat.forEach((f) => f());
  });
  window.addEventListener("appinstalled", () => {
    asennus = null;
    kuuntelijat.forEach((f) => f());
  });
}

function tilaa(f: () => void) {
  kuuntelijat.add(f);
  return () => kuuntelijat.delete(f);
}

function kotinaytolta(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function onIos(): boolean {
  // iPadOS esittäytyy Macina, mutta sillä on kosketusnäyttö.
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function lueOhitettu(): boolean {
  try {
    return localStorage.getItem(OHITETTU_AVAIN) === "1";
  } catch {
    return false;
  }
}

/** Näytetään vain selaimessa (arvostelu piirretään vasta siellä). */
export function KotinayttoVinkki() {
  const tapahtuma = useSyncExternalStore(tilaa, () => asennus, () => null);
  const [ohitettu, setOhitettu] = useState(lueOhitettu);
  const [ios] = useState(onIos);
  const [asennettu] = useState(kotinaytolta);

  if (asennettu || ohitettu || (!tapahtuma && !ios)) return null;

  function ohita() {
    setOhitettu(true);
    try {
      localStorage.setItem(OHITETTU_AVAIN, "1");
    } catch {
      // Ei muistia: vinkki näkyy uudelleen seuraavalla kerralla.
    }
  }

  return (
    <aside
      aria-labelledby="kotinaytto-otsikko"
      className="rounded-sm border border-border border-l-[3px] border-l-primary bg-surface p-5"
    >
      <h2 id="kotinaytto-otsikko" className="text-[15px] font-semibold text-heading">
        Seuraavalla kerralla nopeammin
      </h2>
      {tapahtuma ? (
        <>
          <p className="mt-1 text-[15px] leading-relaxed text-muted">
            Lisää arvostelu puhelimen kotinäyttöön. Se aukeaa kuin sovellus, ilman selaimen palkkeja.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={async () => {
                await tapahtuma.prompt();
                // Tapahtumaa voi käyttää vain kerran.
                asennus = null;
                kuuntelijat.forEach((f) => f());
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-5 text-sm font-semibold text-on-primary transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Lisää kotinäyttöön
            </button>
            <OhitaPainike onClick={ohita} />
          </div>
        </>
      ) : (
        <>
          <p className="mt-1 text-[15px] leading-relaxed text-muted">
            Lisää arvostelu kotinäyttöön, niin se aukeaa kuin sovellus: napauta Safarin{" "}
            <strong className="font-semibold text-foreground">
              Jaa
              <JaaKuvake />
            </strong>{" "}
            -painiketta ja valitse <strong className="font-semibold text-foreground">Lisää Koti-valikkoon</strong>.
          </p>
          <div className="mt-3">
            <OhitaPainike onClick={ohita} />
          </div>
        </>
      )}
    </aside>
  );
}

function OhitaPainike({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 rounded-sm px-1 text-sm font-semibold text-accent underline underline-offset-4 hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      Ei kiitos
    </button>
  );
}

/** Safarin Jaa-kuvake (neliö ja nuoli ylös), jotta painike on helppo tunnistaa. */
function JaaKuvake() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="mx-0.5 inline size-4 -translate-y-px align-middle">
      <path
        fill="currentColor"
        d="M10 1.5a.75.75 0 0 1 .53.22l3 3a.75.75 0 1 1-1.06 1.06l-1.72-1.72v8.19a.75.75 0 0 1-1.5 0V4.06L7.53 5.78a.75.75 0 0 1-1.06-1.06l3-3A.75.75 0 0 1 10 1.5ZM5 8.25a.75.75 0 0 0-.75.75v7.5c0 .41.34.75.75.75h10a.75.75 0 0 0 .75-.75V9a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 1 0-1.5h1.5A2.25 2.25 0 0 1 17.25 9v7.5A2.25 2.25 0 0 1 15 18.75H5a2.25 2.25 0 0 1-2.25-2.25V9A2.25 2.25 0 0 1 5 6.75h1.5a.75.75 0 0 1 0 1.5H5Z"
      />
    </svg>
  );
}
