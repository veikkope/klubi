"use client";

import { ViewTransition, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Sivunvaihdon ristihäivytys (View Transitions, docs/04 Animaatiot).
 *
 * Avain on sivun polku: kun polku vaihtuu, vanha sisältö häivyttyy ulos ja
 * uusi sisään (luokat `sivu-ulos`/`sivu-sisaan`, globals.css). Header ja
 * footer ovat tämän ulkopuolella, joten ne pysyvät paikallaan.
 *
 * Saman sivun päivitykset (ravintola- ja uutishaun suodattimet, sivutus)
 * eivät muuta polkua, joten ne eivät animoidu: hakusivuilla päivittyvän
 * tilan näyttää `HakuTulokset`. `default="none"` estää animaation muissa
 * transitioissa (esim. `router.refresh()`).
 *
 * Nimetyt elementit (kortin kuva → sivun iso kuva, `KuvaSiirtyma`) siirtyvät
 * omina ryhminään tämän häivytyksen päällä.
 *
 * `ViewTransition` ei lisää DOM-elementtiä, joten sivun juurielementit
 * pysyvät `<main>`-elementin suorina lapsina (esim. `data-flush-footer`).
 * Selaimissa ilman View Transitions -tukea sivu vaihtuu ilman animaatiota.
 */
export function Sivunvaihto({ children }: { children: ReactNode }) {
  const polku = usePathname();
  return (
    <ViewTransition key={polku} enter="sivu-sisaan" exit="sivu-ulos" default="none">
      {children}
    </ViewTransition>
  );
}

/**
 * Kuva, joka siirtyy kortista kohdesivun isoksi kuvaksi (shared element).
 * Sama `nimi` kortissa ja kohdesivulla, esim. `ravintola-${slug}`. Nimi saa
 * esiintyä näkyvissä vain kerran sivulla, muuten selain ohittaa animaation.
 *
 * Siirtymä näkyy, kun kohdesivu on jo esihaettu (Next esihakee näkyvissä
 * olevat linkit). Muuten kuva vain häivyttyy sivun mukana.
 *
 * Nimestä poistetaan muut kuin a–z, 0–9, `-` ja `_`: CSS:n
 * `view-transition-name` hyväksyy vain tunnisteen, ja luonnosnäkymän
 * stega-merkit (näkymättömiä merkkejä slugissa) rikkoisivat sen.
 */
export function KuvaSiirtyma({ nimi, children }: { nimi: string; children: ReactNode }) {
  return (
    <ViewTransition name={`kuva-${nimi.replace(/[^a-z0-9_-]/gi, "")}`} share="kuva-siirtyma" default="none">
      {children}
    </ViewTransition>
  );
}
