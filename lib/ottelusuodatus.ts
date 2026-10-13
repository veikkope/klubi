/**
 * Mitkä ottelut näytetään otteluohjelmassa (lib/ottelut.ts). Erillään
 * tiedostosta lib/ottelut.ts, jotta sääntö voidaan testata ilman Sanityä ja
 * Nextiä (scripts/test-ottelusuodatus.ts).
 *
 * - Studiossa lisätty ottelu näkyy aina: sihteeri lisää vain klubia
 *   kiinnostavia otteluita (esim. "Suomi U21"), joten rajaus koskee vain
 *   automaattista syötettä. 13.10.2026 U21-ottelu katosi etusivulta, koska
 *   rajaus tunsi vain Huuhkajat ja seuralistan.
 * - Laskuri (`vainHuuhkajat`) näyttää aina vain miesten maajoukkueen ottelun.
 */

import { normalizeTeam } from "./joukkueet";

export type SuodatettavaOttelu = {
  koti: string;
  vieras: string;
  /** Miesten maajoukkueen ottelu (Huuhkajat). */
  maajoukkue: boolean;
  /** Ottelu on Studiossa (oma tai automaattiseen yhdistetty). */
  studiossa: boolean;
};

export type Rajaus = {
  /** Vain Huuhkajat, Studion ottelut ja `seurat`-listan joukkueet. */
  vainMaajoukkue?: boolean;
  /** Vain Huuhkajat (laskuri). Ohittaa muut rajaukset. */
  vainHuuhkajat?: boolean;
  /** Rajauksen lisäksi näytettävät seurat, esim. ["FC Lahti"]. GROQ antaa tyhjälle `null`. */
  seurat?: string[] | null;
};

export function ottelunSuodatin({ vainMaajoukkue = false, vainHuuhkajat = false, seurat }: Rajaus) {
  const valitutSeurat = new Set((seurat ?? []).map(normalizeTeam).filter(Boolean));
  return (o: SuodatettavaOttelu): boolean => {
    if (vainHuuhkajat) return o.maajoukkue;
    if (!vainMaajoukkue) return true;
    return (
      o.maajoukkue ||
      o.studiossa ||
      valitutSeurat.has(normalizeTeam(o.koti)) ||
      valitutSeurat.has(normalizeTeam(o.vieras))
    );
  };
}

/** Tarvitaanko automaattista syötettä: se kattaa vain seurajoukkueet. */
export function tarvitaanSyote({ vainMaajoukkue = false, vainHuuhkajat = false, seurat }: Rajaus): boolean {
  if (vainHuuhkajat) return false;
  return !vainMaajoukkue || (seurat ?? []).some((s) => normalizeTeam(s));
}
