import type { Redirect } from "next/dist/lib/load-custom-routes";

/**
 * Vanhojen .htm-URL:ien 301-ohjaukset uusiin osoitteisiin.
 *
 * Pohjana vanhan sivuston päänavigaatio (10 + 1 linkkiä) joka tiivistettiin
 * 6 päälinkkiin + CTA:han. Katso `docs/02-information-architecture.md`.
 *
 * Säilytä redirectit kunnes Google-indeksi on uudistunut (vähintään 6 kk).
 */
export const legacyRedirects: Redirect[] = [
  // ── Päänavigaation 10+1 linkkiä → uudet polut ─────────────────────────────
  { source: "/etusivu.htm", destination: "/", permanent: true },
  { source: "/yleista.htm", destination: "/klubi", permanent: true },
  { source: "/klubi.htm", destination: "/klubi", permanent: true },           // oli 404
  { source: "/ottelut.htm", destination: "/tapahtumat", permanent: true },     // oli 404
  { source: "/arvostelu.htm", destination: "/jalkapalloarkisto/huuhkajat", permanent: true },
  { source: "/veikkaus.htm", destination: "/klubi/palloveikkaus", permanent: true },
  { source: "/kommentit.htm", destination: "/uutiset/arkisto", permanent: true },
  { source: "/blogi.htm", destination: "/uutiset", permanent: true },
  { source: "/historia.htm", destination: "/jalkapalloarkisto", permanent: true },
  { source: "/stadionit.htm", destination: "/jalkapalloarkisto/stadionit", permanent: true },
  { source: "/ruokailu.htm", destination: "/ravintolat", permanent: true },

  // ── Jalkapalloarkiston yksittäiset alasivut ───────────────────────────────
  { source: "/fifaranking.htm", destination: "/jalkapalloarkisto/fifa-ranking", permanent: true },
  { source: "/suomi.htm", destination: "/jalkapalloarkisto/mestarit", permanent: true },
  { source: "/suomenvalmentajat.htm", destination: "/jalkapalloarkisto/valmentajat", permanent: true },
  { source: "/suomenvalmentajientulot.htm", destination: "/jalkapalloarkisto/valmentajat", permanent: true },
  { source: "/vuodenpelaaja.htm", destination: "/jalkapalloarkisto/vuoden-pelaajat", permanent: true },
  { source: "/FIFAvuodenpelaaja.htm", destination: "/jalkapalloarkisto/vuoden-pelaajat", permanent: true },
  { source: "/euroopan_paras_pelaaja.htm", destination: "/jalkapalloarkisto/euroopan-paras", permanent: true },
  { source: "/top10jalkapallosaavutukset.htm", destination: "/jalkapalloarkisto/saavutukset", permanent: true },
  { source: "/ottelut2012ja2013.htm", destination: "/jalkapalloarkisto/karsinnat/mm-2014", permanent: true },
  { source: "/intercontinental.htm", destination: "/jalkapalloarkisto/eurocupit/intercontinental", permanent: true },
  { source: "/cupvoittajiencup.htm", destination: "/jalkapalloarkisto/eurocupit/conference-league", permanent: true },
  { source: "/uefacup.htm", destination: "/jalkapalloarkisto/eurocupit/europa-league", permanent: true },
  { source: "/supercup.htm", destination: "/jalkapalloarkisto/eurocupit/super-cup", permanent: true },
  { source: "/eurocuptilasto.htm", destination: "/jalkapalloarkisto/eurocupit/champions-league", permanent: true },
  { source: "/lupaavia.htm", destination: "/jalkapalloarkisto/lupaavat", permanent: true },
  { source: "/Kommentit2022.htm", destination: "/uutiset/arkisto", permanent: true },

  // ── Stadionit (alasivut) ──────────────────────────────────────────────────
  { source: "/stadionlahtiurheilukeskus.htm", destination: "/jalkapalloarkisto/stadionit/lahti", permanent: true },
  { source: "/stadionhelsinkiolympiastadion.htm", destination: "/jalkapalloarkisto/stadionit/helsinki-olympiastadion", permanent: true },

  // ── Ravintolat (kaupunkikohtaiset) ────────────────────────────────────────
  { source: "/ruokailulahti.htm", destination: "/ravintolat?kaupunki=lahti", permanent: true },
  { source: "/ruokailuhameenlinna.htm", destination: "/ravintolat?kaupunki=hameenlinna", permanent: true },
  { source: "/ruokailulappeenranta.htm", destination: "/ravintolat?kaupunki=lappeenranta", permanent: true },
  { source: "/ruokailupirkanmaa.htm", destination: "/ravintolat?kaupunki=pirkanmaa", permanent: true },
  { source: "/ruokailukokkola.htm", destination: "/ravintolat?kaupunki=kokkola", permanent: true },
  { source: "/ruokailuuusimaa.htm", destination: "/ravintolat?kaupunki=uusimaa", permanent: true },
  { source: "/ruokailukreikka.htm", destination: "/ravintolat?maa=kreikka", permanent: true },
];
