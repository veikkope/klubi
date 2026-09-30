/**
 * Automaattisen otteluohjelman joukkueet Studiossa (app/api/joukkueet).
 * Haetaan kerran istunnossa. Virhe tai palvelinympäristö (esim. `sanity
 * schema validate`) → tyhjä lista, jolloin ehdotuksia ja varoituksia ei
 * näytetä eikä mikään esty.
 */
let haku: Promise<string[]> | null = null;

export function haeJoukkueet(): Promise<string[]> {
  if (typeof window === "undefined") return Promise.resolve([]);
  haku ??= fetch("/api/joukkueet")
    .then((res) => (res.ok ? (res.json() as Promise<{ joukkueet?: string[] }>) : { joukkueet: [] }))
    .then((data) => data.joukkueet ?? [])
    .catch(() => {
      haku = null; // yritetään uudelleen seuraavalla kerralla
      return [];
    });
  return haku;
}
