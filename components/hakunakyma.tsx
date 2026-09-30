"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useTransition,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";

/**
 * Hakusivun (ravintolat, uutiset) päivittyminen ilman sivun uudelleenlatausta.
 *
 * Suodattimet ovat tavallisia GET-lomakkeita ja linkkejä (palvelinkomponentteja),
 * jotka toimivat myös ilman JavaScriptiä. Tämä komponentti ottaa ne haltuun
 * tapahtumadelegoinnilla, kun JS on käytössä: linkki tai lomake, joka vie
 * samalle listaussivulle (`polku`), navigoi Reactin transitiona. Silloin
 * nykyiset tulokset pysyvät näkyvissä, kunnes uudet ovat valmiit, ja
 * `HakuTulokset` näyttää sillä välin päivittyvän tilan. Muut linkit (esim.
 * kortti uutiseen) toimivat tavalliseen tapaan.
 *
 * Sivun vieritys säilyy, jottei suodattimen vaihto hyppää sivun alkuun.
 * Sivutuslinkit (`data-sivutus`-elementin sisällä) vierittävät tulosten alkuun.
 */

type HakuTila = {
  paivittyy: boolean;
  tuloksetRef: React.RefObject<HTMLDivElement | null>;
};

const HakuKonteksti = createContext<HakuTila | null>(null);

export function HakuNakyma({
  polku,
  tila,
  children,
}: {
  /** Listaussivun polku, esim. "/ravintolat". Vain sinne vievät navigoinnit otetaan haltuun. */
  polku: string;
  /**
   * Nykyisen haun tunniste (esim. sivun kanoninen URL hakuparametreineen).
   * Kun se muuttuu (haku, linkki, selaimen takaisin-painike), lomakkeiden
   * kentät palautetaan vastaamaan uutta hakua.
   */
  tila: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [paivittyy, startTransition] = useTransition();
  const juuriRef = useRef<HTMLDivElement>(null);
  const tuloksetRef = useRef<HTMLDivElement>(null);
  const vieritaTuloksiin = useRef(false);

  const siirry = useCallback(
    (url: URL, sivutus: boolean) => {
      vieritaTuloksiin.current = sivutus;
      startTransition(() => {
        router.push(url.pathname + url.search, { scroll: false });
      });
    },
    [router],
  );

  // Kentät vastaamaan uutta hakua: React päivittää kenttien oletusarvot
  // (defaultValue) palvelimen uusista propseista, ja reset() palauttaa
  // kentät niihin. Esim. "Haku: x ×" -sirun poisto tyhjentää hakukentän.
  // Fokus säilyy.
  useEffect(() => {
    juuriRef.current?.querySelectorAll("form").forEach((lomake) => lomake.reset());
  }, [tila]);

  // Sivutus: uusi sivu näkyviin tulosten alusta, kun se on valmis.
  useEffect(() => {
    if (paivittyy || !vieritaTuloksiin.current) return;
    vieritaTuloksiin.current = false;
    tuloksetRef.current?.scrollIntoView({ block: "start" });
  }, [paivittyy]);

  function onClickCapture(e: MouseEvent<HTMLDivElement>) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    const linkki = (e.target as Element).closest("a[href]");
    if (!(linkki instanceof HTMLAnchorElement)) return;
    if ((linkki.target && linkki.target !== "_self") || linkki.hasAttribute("download")) return;
    const url = new URL(linkki.href);
    if (url.origin !== window.location.origin || url.pathname !== polku) return;
    // Next:n Link ohittaa klikkauksen, jonka defaultPrevented on asetettu.
    e.preventDefault();
    siirry(url, linkki.closest("[data-sivutus]") !== null);
  }

  function onSubmitCapture(e: FormEvent<HTMLDivElement>) {
    const lomake = e.target;
    if (!(lomake instanceof HTMLFormElement) || lomake.method !== "get") return;
    const url = new URL(lomake.action);
    if (url.origin !== window.location.origin || url.pathname !== polku) return;
    e.preventDefault();
    // Kuten selain: mukaan myös painettu painike (name/value) ja lomakkeeseen
    // `form`-attribuutilla liitetyt kentät.
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    const tiedot = new FormData(lomake, submitter);
    url.search = new URLSearchParams(
      [...tiedot].map(([nimi, arvo]) => [nimi, typeof arvo === "string" ? arvo : arvo.name]),
    ).toString();
    siirry(url, false);
  }

  return (
    <HakuKonteksti.Provider value={{ paivittyy, tuloksetRef }}>
      <div ref={juuriRef} onClickCapture={onClickCapture} onSubmitCapture={onSubmitCapture}>
        {children}
      </div>
    </HakuKonteksti.Provider>
  );
}

/**
 * Hakutulokset. Päivityksen ajan vanhat tulokset himmenevät ja yläreunaan
 * tulee ohut edistymispalkki. Molemmat näkyvät vasta 150 ms:n jälkeen, jotta
 * nopea haku ei välähdä. Ruudunlukijalle `aria-busy`, ja tulosmäärän
 * `aria-live` kertoo uuden tuloksen.
 */
export function HakuTulokset({ children, className }: { children: ReactNode; className?: string }) {
  const tila = useContext(HakuKonteksti);
  const paivittyy = tila?.paivittyy ?? false;
  return (
    <div
      ref={tila?.tuloksetRef}
      aria-busy={paivittyy || undefined}
      className={cn("relative", className)}
    >
      <div
        aria-hidden
        className={cn(
          "hakupalkki pointer-events-none absolute inset-x-0 -top-3 h-0.5 overflow-hidden rounded-full transition-opacity",
          paivittyy ? "opacity-100 delay-150 duration-200" : "opacity-0 duration-100",
        )}
      />
      <div
        className={cn(
          "transition-opacity",
          paivittyy ? "opacity-55 delay-150 duration-200" : "opacity-100 duration-150",
        )}
      >
        {children}
      </div>
    </div>
  );
}
