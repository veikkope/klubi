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
import { LITMANEN_LOUKKAANTUMISET_PATH, LITMANEN_PATH } from "@/lib/path";

export const arkistoNav: SectionNavItem[] = [
  { label: "Yleiskatsaus", href: "/jalkapalloarkisto" },
  { label: "Huuhkajat", href: "/jalkapalloarkisto/huuhkajat" },
  { label: "Arvokisat", href: "/jalkapalloarkisto/arvokisat" },
  { label: "Suomen mestarit", href: "/jalkapalloarkisto/mestarit" },
  { label: "Eurocupit", href: "/jalkapalloarkisto/eurocupit" },
  { label: "Litmanen", href: LITMANEN_PATH },
  { label: "Vuoden pelaajat", href: "/jalkapalloarkisto/vuoden-pelaajat" },
  { label: "Euroopan paras", href: "/jalkapalloarkisto/euroopan-paras" },
  { label: "Maailman parhaat", href: "/jalkapalloarkisto/maailman-parhaat" },
  { label: "Valmentajat", href: "/jalkapalloarkisto/valmentajat" },
  { label: "FIFA-ranking", href: "/jalkapalloarkisto/fifa-ranking" },
  { label: "Lupaavat", href: "/jalkapalloarkisto/lupaavat" },
  { label: "TOP 10 saavutukset", href: "/jalkapalloarkisto/saavutukset" },
  { label: "TOP 10 järkytykset", href: "/jalkapalloarkisto/jarkytykset" },
  { label: "Ulkomaiset mestarit", href: "/jalkapalloarkisto/ulkomaiset-mestarit" },
  { label: "Palloliitto", href: "/jalkapalloarkisto/palloliitto" },
  { label: "Stadionit", href: "/jalkapalloarkisto/stadionit" },
  { label: "Muut tilastot", href: "/jalkapalloarkisto/tilastot" },
];

/** Litmanen-osion sivut (arkiston osionavigaation alla). */
export const litmanenNav: SectionNavItem[] = [
  { label: "Jari Litmanen", href: LITMANEN_PATH },
  { label: "Litmasen loukkaantumiset", href: LITMANEN_LOUKKAANTUMISET_PATH },
];

export const klubiNav: SectionNavItem[] = [
  { label: "Esittely", href: "/klubi" },
  { label: "Toiminta", href: "/klubi/toiminta" },
  { label: "Hallitus", href: "/klubi/hallitus" },
  { label: "Palloveikkaus", href: "/klubi/palloveikkaus" },
  { label: "Yhteystiedot", href: "/klubi/yhteystiedot" },
];

/** Murupolun juuri — kaikilla sivuilla sama ensimmäinen askel. */
export const rootCrumb = { label: "Etusivu", href: "/" };
