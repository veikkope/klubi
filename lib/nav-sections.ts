/**
 * Osionavigaatioiden sisällöt.
 *
 * Nämä ovat koodissa eivätkä Sanityssa tarkoituksella: ne vastaavat reittien
 * olemassaoloa, ei sisältöä. Jos linkki on täällä, reitin on oltava olemassa —
 * ja päinvastoin. Sanityn `navigaatio`-singleton hallitsee päävalikkoa.
 *
 * Yksi totuuden lähde: älä toista näitä listoja sivukomponenteissa.
 */

import type { SectionNavItem } from "@/components/layout/section-nav";

export const arkistoNav: SectionNavItem[] = [
  { label: "Yleiskatsaus", href: "/jalkapalloarkisto" },
  { label: "Huuhkajat", href: "/jalkapalloarkisto/huuhkajat" },
  { label: "Arvokisat", href: "/jalkapalloarkisto/arvokisat" },
  { label: "Suomen mestarit", href: "/jalkapalloarkisto/mestarit" },
  { label: "Eurocupit", href: "/jalkapalloarkisto/eurocupit" },
  { label: "Pelaajat", href: "/jalkapalloarkisto/pelaajat" },
  { label: "Vuoden pelaajat", href: "/jalkapalloarkisto/vuoden-pelaajat" },
  { label: "Euroopan paras", href: "/jalkapalloarkisto/euroopan-paras" },
  { label: "Valmentajat", href: "/jalkapalloarkisto/valmentajat" },
  { label: "FIFA-ranking", href: "/jalkapalloarkisto/fifa-ranking" },
  { label: "Lupaavat", href: "/jalkapalloarkisto/lupaavat" },
  { label: "Saavutukset", href: "/jalkapalloarkisto/saavutukset" },
  { label: "Stadionit", href: "/jalkapalloarkisto/stadionit" },
];

export const klubiNav: SectionNavItem[] = [
  { label: "Esittely", href: "/klubi" },
  { label: "Toiminta", href: "/klubi/toiminta" },
  { label: "Hallitus", href: "/klubi/hallitus" },
  { label: "Säännöt", href: "/klubi/saannot" },
  { label: "Palloveikkaus", href: "/klubi/palloveikkaus" },
  { label: "Yhteystiedot", href: "/klubi/yhteystiedot" },
  { label: "Liity jäseneksi", href: "/klubi/liity" },
];

/** Murupolun juuri — kaikilla sivuilla sama ensimmäinen askel. */
export const rootCrumb = { label: "Etusivu", href: "/" };
