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
    // React ei päivitä valikon `defaultValue`-arvoa uudelleenrenderöinnissä,
    // joten reset() palauttaisi valikon sivun ensimmäisen latauksen arvoon.
    // Valikko kertoo nykyisen arvonsa `data-arvo`-attribuutissa.
    juuriRef.current?.querySelectorAll<HTMLSelectElement>("select[data-arvo]").forEach((valikko) => {
      valikko.value = valikko.dataset.arvo ?? "";
    });
    // Vaakasuunnassa vieritettävä nappirivi (puhelimella): valittu nappi
    // näkyviin, jottei se jää ruudun ulkopuolelle. Vain rivi vierii, ei sivu.
    juuriRef.current?.querySelectorAll<HTMLElement>("[data-vaakarivi]").forEach((rivi) => {
      const valittu = rivi.querySelector<HTMLElement>("[aria-current]");
      if (!valittu || rivi.scrollWidth <= rivi.clientWidth) return;
      const vasen = valittu.getBoundingClientRect().left - rivi.getBoundingClientRect().left + rivi.scrollLeft;
      rivi.scrollLeft = Math.max(0, vasen - (rivi.clientWidth - valittu.offsetWidth) / 2);
    });
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
    // Valikon vaihtoehto voi kertoa oman parametrinimensä (`data-nimi`): esim.
    // ravintoloiden aluevalikossa maa → `maa=`, maakunta → `maakunta=`.
    const nimet = new Map<string, string>();
    for (const kentta of lomake.elements) {
      const nimi = kentta instanceof HTMLSelectElement ? kentta.selectedOptions[0]?.dataset.nimi : undefined;
      if (nimi) nimet.set((kentta as HTMLSelectElement).name, nimi);
    }
    // Tyhjät kentät ("Kaikki") pois, jotta osoite on lyhyt ja sama kuin linkeissä.
    url.search = new URLSearchParams(
      [...tiedot]
        .filter(([, arvo]) => arvo !== "")
        .map(([nimi, arvo]) => [nimet.get(nimi) ?? nimi, typeof arvo === "string" ? arvo : arvo.name]),
    ).toString();
    siirry(url, false);
  }

  // Rajaus päivittyy heti valittaessa, kun lomakkeella on `data-heti`: valikko,
  // valintanappi tai valintaruutu lähettää lomakkeen (ilman JS:ää on painike).
  // Tekstikenttä ei, sillä sen haku lähtee Enterillä tai Hae-painikkeella.
  function onChangeCapture(e: FormEvent<HTMLDivElement>) {
    const kentta = e.target;
    const valinta =
      kentta instanceof HTMLSelectElement ||
      (kentta instanceof HTMLInputElement && (kentta.type === "radio" || kentta.type === "checkbox"));
    if (!valinta || !kentta.form?.hasAttribute("data-heti")) return;
    // Riippuva valikko tyhjenee (`data-tyhjentaa`), esim. alueen vaihto
    // tyhjentää kaupungin, joka voisi olla toisella alueella.
    const riippuva = kentta.dataset.tyhjentaa && document.getElementById(kentta.dataset.tyhjentaa);
    if (riippuva instanceof HTMLSelectElement) riippuva.value = "";
    kentta.form.requestSubmit();
  }

  return (
    <HakuKonteksti.Provider value={{ paivittyy, tuloksetRef }}>
      <div
        ref={juuriRef}
        onClickCapture={onClickCapture}
        onSubmitCapture={onSubmitCapture}
        onChangeCapture={onChangeCapture}
      >
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
