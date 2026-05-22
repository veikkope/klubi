/**
 * Sisäänrakennetut oletusarvot Sanity-singletoneille. Käytetään kun
 * NEXT_PUBLIC_SANITY_PROJECT_ID puuttuu (kehitysvaihe ennen `sanity init`).
 *
 * Pidä synkronoituna `sanity/schemas/singletons/*.ts` -tiedostojen
 * `initialValue`-kenttien kanssa.
 */

import type { NavigationData, ContactData, EtusivuData } from "@/lib/types";

export const defaultNavigation: NavigationData = {
  items: [
    {
      label: "Klubi",
      href: "/klubi",
      highlight: false,
      children: [
        { label: "Esittely", href: "/klubi" },
        { label: "Hallitus", href: "/klubi/hallitus" },
        { label: "Säännöt", href: "/klubi/saannot" },
        { label: "Palloveikkaus", href: "/klubi/palloveikkaus" },
        { label: "Yhteystiedot", href: "/klubi/yhteystiedot" },
      ],
    },
    { label: "Tapahtumat", href: "/tapahtumat", highlight: false },
    { label: "Uutiset", href: "/uutiset", highlight: false },
    {
      label: "Jalkapalloarkisto",
      href: "/jalkapalloarkisto",
      highlight: false,
      children: [
        { label: "Huuhkajat", href: "/jalkapalloarkisto/huuhkajat" },
        { label: "Suomen mestarit", href: "/jalkapalloarkisto/mestarit" },
        { label: "Eurocupit", href: "/jalkapalloarkisto/eurocupit" },
        { label: "Vuoden pelaajat", href: "/jalkapalloarkisto/vuoden-pelaajat" },
        { label: "Stadionit", href: "/jalkapalloarkisto/stadionit" },
      ],
    },
    { label: "Ravintolat", href: "/ravintolat", highlight: false },
    { label: "Liity jäseneksi", href: "/klubi/liity", highlight: true },
  ],
};

export const defaultContact: ContactData = {
  address: "",
  postalCode: "",
  city: "Lahti",
  email: "info@lahdensuomalainenklubi.com",
  phone: null,
  yTunnus: null,
  iban: null,
  socials: [],
};

export const defaultEtusivu: EtusivuData = {
  heroEyebrow: "Perustettu 2007",
  heroTitle: "Lahden Suomalainen Klubi",
  heroDescription:
    "Yhdistys joka kokoaa lahtelaiset perinteen, jalkapallon ja hyvän seuran ääreen. Tapahtumat, uutiset ja laaja jalkapalloarkisto — samasta paikasta.",
  heroImage: null,
  heroCtas: [
    { label: "Liity jäseneksi", href: "/klubi/liity", primary: true },
    { label: "Tulevat tapahtumat", href: "/tapahtumat", primary: false },
  ],
  blocks: [
    {
      _type: "esittely",
      _key: "default-esittely",
      heading: "Sivusto on rakenteilla",
      body: null,
      image: null,
      ctaLabel: "Tutustu klubiin",
      ctaHref: "/klubi",
    },
  ],
};
