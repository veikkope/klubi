import type { Redirect } from "next/dist/lib/load-custom-routes";

/**
 * Vanhojen .htm-URL:ien 301-ohjaukset uusiin osoitteisiin.
 *
 * Tämä lista pidetään ajan tasalla migraation aikana.
 * Skripti `scripts/generate-redirects.ts` voi generoida tämän
 * Sanity-datan ja `data/manual-redirects.csv`-tiedoston perusteella.
 *
 * Säilytä redirectit kunnes Google-indeksi on uudistunut (vähintään 6 kk).
 */
export const legacyRedirects: Redirect[] = [
  // Jalkapalloarkisto
  { source: "/fifaranking.htm", destination: "/jalkapallo/fifa-ranking", permanent: true },
  { source: "/suomi.htm", destination: "/jalkapallo/mestarit", permanent: true },
  { source: "/suomenvalmentajat.htm", destination: "/jalkapallo/valmentajat", permanent: true },
  { source: "/suomenvalmentajientulot.htm", destination: "/jalkapallo/valmentajat", permanent: true },
  { source: "/vuodenpelaaja.htm", destination: "/jalkapallo/vuoden-pelaaja", permanent: true },
  { source: "/FIFAvuodenpelaaja.htm", destination: "/jalkapallo/vuoden-pelaaja", permanent: true },
  { source: "/euroopan_paras_pelaaja.htm", destination: "/jalkapallo/euroopan-paras", permanent: true },
  { source: "/top10jalkapallosaavutukset.htm", destination: "/jalkapallo/saavutukset", permanent: true },
  { source: "/ottelut2012ja2013.htm", destination: "/jalkapallo/karsinnat/mm-2014", permanent: true },
  { source: "/intercontinental.htm", destination: "/jalkapallo/intercontinental", permanent: true },
  { source: "/cupvoittajiencup.htm", destination: "/jalkapallo/conference-league", permanent: true },
  { source: "/uefacup.htm", destination: "/jalkapallo/uefa-cup", permanent: true },
  { source: "/supercup.htm", destination: "/jalkapallo/super-cup", permanent: true },
  { source: "/eurocuptilasto.htm", destination: "/jalkapallo/eurocup", permanent: true },
  { source: "/lupaavia.htm", destination: "/jalkapallo/historia/lupaavat-1980-1991", permanent: true },
  { source: "/Kommentit2022.htm", destination: "/uutiset", permanent: true },

  // Stadionit
  { source: "/stadionit.htm", destination: "/stadionit", permanent: true },
  { source: "/stadionlahtiurheilukeskus.htm", destination: "/stadionit/lahti", permanent: true },
  { source: "/stadionhelsinkiolympiastadion.htm", destination: "/stadionit/helsinki-olympiastadion", permanent: true },

  // Ravintolat
  { source: "/ruokailu.htm", destination: "/ravintolat", permanent: true },
  { source: "/ruokailulahti.htm", destination: "/ravintolat?kaupunki=lahti", permanent: true },
  { source: "/ruokailuhameenlinna.htm", destination: "/ravintolat?kaupunki=hameenlinna", permanent: true },
  { source: "/ruokailulappeenranta.htm", destination: "/ravintolat?kaupunki=lappeenranta", permanent: true },
  { source: "/ruokailupirkanmaa.htm", destination: "/ravintolat?kaupunki=pirkanmaa", permanent: true },
  { source: "/ruokailukokkola.htm", destination: "/ravintolat?kaupunki=kokkola", permanent: true },
  { source: "/ruokailuuusimaa.htm", destination: "/ravintolat?kaupunki=uusimaa", permanent: true },
  { source: "/ruokailukreikka.htm", destination: "/ravintolat?maa=kreikka", permanent: true },
];
