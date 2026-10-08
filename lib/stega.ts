/**
 * Luonnosnäkymän (draft mode, Presentation) näkymättömät stega-merkit pois
 * merkkijonosta. Sanity lisää ne merkkijonoihin, joita se ei tunnista
 * osoitteiksi tai tunnisteiksi, esim. linkin valinta "sivu" tai tiedoston
 * pääte "pdf". Vertailu `tyyppi === "sivu"` epäonnistuisi silloin hiljaa.
 *
 * Sama merkistö kuin `stegaClean`issa (@vercel/stega), mutta ilman riippuvuutta,
 * jotta puhtaat säännöt (lib/linkki.ts, lib/liite.ts) toimivat myös Studiossa
 * ja tsx-skripteissä.
 */
const STEGA = /[\u{200b}\u{200c}\u{200d}\u{2060}-\u{2064}\u{feff}\u{1d173}-\u{1d17a}]{4,}/gu;

export function ilmanStegaa(arvo: string): string;
export function ilmanStegaa(arvo: string | null | undefined): string | null | undefined;
export function ilmanStegaa(arvo: string | null | undefined): string | null | undefined {
  return typeof arvo === "string" ? arvo.replace(STEGA, "") : arvo;
}
