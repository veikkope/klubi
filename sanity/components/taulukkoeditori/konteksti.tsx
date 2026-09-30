import { createContext, useContext } from "react";
import type { FormPatch, ObjectInputProps } from "sanity";

/**
 * Taulukkoeditori on `rows`-kentän syöte, mutta sen pitää muokata myös
 * `columns`-kenttää (sarakkeen lisäys, poisto, siirto) samassa muutoksessa.
 * Kentän oma `onChange` näkee vain oman polkunsa, joten dokumentin juuren
 * `onChange` välitetään kontekstin kautta.
 */
type DokumenttiPatch = (patchit: FormPatch[]) => void;

const DokumenttiPatchKonteksti = createContext<DokumenttiPatch | null>(null);

export function useDokumenttiPatch(): DokumenttiPatch | null {
  return useContext(DokumenttiPatchKonteksti);
}

/** `jalkapalloTilasto`-dokumentin juurisyöte: renderöi oletuslomakkeen kontekstin sisällä. */
export function TilastoDokumenttiInput(props: ObjectInputProps) {
  return (
    <DokumenttiPatchKonteksti.Provider value={props.onChange}>
      {props.renderDefault(props)}
    </DokumenttiPatchKonteksti.Provider>
  );
}
