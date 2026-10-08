/**
 * Sisäänrakennetut oletusarvot Sanity-singletoneille. Käytetään kun
 * NEXT_PUBLIC_SANITY_PROJECT_ID puuttuu (kehitysvaihe ennen `sanity init`).
 *
 * Pidä synkronoituna `sanity/schemas/singletons/*.ts` -tiedostojen
 * `initialValue`-kenttien kanssa.
 */

import type { NavigationData, ContactData, EtusivuData } from "@/lib/types";

// Tyyliopas (Sivut v3): Jalkapallo · Ottelut · Ravintola-arviot · Uutiset ·
// Klubista. Tapahtumat on etusivulla ja alatunnisteessa, ei päävalikossa. Ei "Liity jäseneksi" -korostusta. Jalkapalloarkisto on
// Jalkapallo-valikon alla (docs/02).
// Alatunnisteen linkkisarakkeet johdetaan tästä samasta valikosta, kun Sanity
// puuttuu (lib/navigaatio.ts). Vanha muoto { label, href } on kelvollinen
// linkkiobjekti (Muu osoite), joten tätä ei tarvitse muuttaa (docs/24 askel 4).
export const defaultNavigation: NavigationData = {
  items: [
    {
      label: "Jalkapallo",
      href: "/jalkapalloarkisto",
      highlight: false,
      children: [
        { label: "Jalkapalloarkisto", href: "/jalkapalloarkisto" },
        { label: "Huuhkajat", href: "/jalkapalloarkisto/huuhkajat" },
        { label: "Arvokisat", href: "/jalkapalloarkisto/arvokisat" },
        { label: "Suomen mestarit", href: "/jalkapalloarkisto/mestarit" },
        { label: "Litmanen", href: "/jalkapalloarkisto/litmanen" },
        { label: "Stadionit", href: "/jalkapalloarkisto/stadionit" },
      ],
    },
    { label: "Ottelut", href: "/ottelut", highlight: false },
    { label: "Ravintola-arviot", href: "/ravintolat", highlight: false },
    { label: "Uutiset", href: "/uutiset", highlight: false },
    {
      label: "Klubi",
      href: "/klubi",
      highlight: false,
      children: [
        { label: "Esittely", href: "/klubi" },
        { label: "Toiminta", href: "/klubi/toiminta" },
        { label: "Hallitus", href: "/klubi/hallitus" },
        { label: "Palloveikkaus", href: "/klubi/palloveikkaus" },
        { label: "Yhteystiedot", href: "/klubi/yhteystiedot" },
      ],
    },
  ],
};

export const defaultContact: ContactData = {
  address: "",
  postalCode: "",
  city: "Lahti",
  // Ei kovakoodattua osoitetta: sähköposti tulee vain Studiosta (docs/16 §5).
  email: null,
  phone: null,
  yTunnus: null,
  iban: null,
  socials: [],
};

// Tyyliopas (Sivut v3): etusivu esittelee klubin ensin. Ei liittymiskehotetta.
export const defaultEtusivu: EtusivuData = {
  heroEyebrow: "Lahden Suomalainen Klubi ry",
  heroTitle: "Suomalaisen jalkapallon ystävien klubi",
  heroDescription:
    "Seuraamme kotimaista jalkapalloa kentän laidalta ja katsomosta, kirjoitamme otteluista ja kannattajakulttuurista – ja kerromme, missä pelimatkoilla kannattaa syödä.",
  heroImage: null,
  heroCtas: [
    { label: "Tulevat ottelut", href: "/ottelut", primary: true },
    { label: "Lue klubista", href: "/klubi", primary: false },
  ],
  blocks: [
    {
      _type: "esittely",
      _key: "default-esittely",
      eyebrow: "Klubista",
      heading: "Lahtelainen klubi, jonka yhdistää suomalainen jalkapallo",
      body: null,
      image: null,
      ctaLabel: "Lue lisää klubista",
      ctaHref: "/klubi",
    },
  ],
};
