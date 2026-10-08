import { createContext, useContext } from "react";
import type { FormPatch, ObjectInputProps } from "sanity";

/**
 * Taulukkoeditori on `rows`-kentän syöte, mutta sen pitää muokata myös
 * `columns`-kenttää (sarakkeen lisäys, poisto, siirto) samassa muutoksessa.
 * Kentän oma `onChange` näkee vain oman polkunsa, joten taulukon sisältävän
 * objektin (dokumentti tai tekstin taulukkolohko) `onChange` välitetään
 * kontekstin kautta.
 */
type DokumenttiPatch = (patchit: FormPatch[]) => void;

const DokumenttiPatchKonteksti = createContext<DokumenttiPatch | null>(null);

export function useDokumenttiPatch(): DokumenttiPatch | null {
  return useContext(DokumenttiPatchKonteksti);
}

/**
 * Taulukon sisältävän objektin juurisyöte: `jalkapalloTilasto`-dokumentti tai
 * tekstin Taulukko-lohko (docs/24 askel 6). Renderöi oletuslomakkeen
 * kontekstin sisällä. Objektin `onChange` ottaa patchit objektin omasta
 * juuresta, joten samat patchit (`columns`, `rows`) toimivat molemmissa.
 */
export function TaulukkoKontekstiInput(props: ObjectInputProps) {
  return (
    <DokumenttiPatchKonteksti.Provider value={props.onChange}>
      {props.renderDefault(props)}
    </DokumenttiPatchKonteksti.Provider>
  );
}
