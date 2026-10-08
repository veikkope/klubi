import type { DocumentBadgeComponent } from "sanity";

import {
  ajastetunSelite,
  merkkienNimetTyypille,
  odottavanSelite,
  onJulkinenRavintola,
  onPiilotettu,
  onTarkistettava,
  tarkistettavanSelite,
  type MerkinNimi,
  type RavintolanArvosana,
} from "../lib/tilamerkit";
import { TARKISTETTAVAT_TYYPIT } from "./lib/tehtavat";

/**
 * Tilamerkit dokumentin alapalkissa Julkaise-painikkeen vieressä (`document.badges`,
 * Sanity 5.31.2 DocumentStatusBar; docs/24 askel 10).
 * Merkki kertoo tilan aina tekstinä, ei pelkällä värillä; selite näkyy, kun
 * osoitin viedään merkin päälle. Säännöt: lib/tilamerkit.ts.
 */

const Ajastettu: DocumentBadgeComponent = ({ draft, published }) => {
  const selite = ajastetunSelite(draft, published, new Date());
  return selite ? { label: "Ajastettu", title: selite, color: "primary" } : null;
};

const Tarkistettava: DocumentBadgeComponent = ({ draft, published }) => {
  const doc = draft ?? published;
  return onTarkistettava(doc)
    ? { label: "Tarkistettava", title: tarkistettavanSelite(doc), color: "warning" }
    : null;
};

const OdottaaToistaArvioijaa: DocumentBadgeComponent = ({ published }) => {
  // Arvosanan laskee webhook julkaistuun versioon (lib/ravintola-arvosana.ts).
  const ravintola = published as RavintolanArvosana;
  return published && !onJulkinenRavintola(ravintola)
    ? { label: "Odottaa toista arvioijaa", title: odottavanSelite(ravintola), color: "warning" }
    : null;
};

const Piilotettu: DocumentBadgeComponent = ({ draft, published }) =>
  onPiilotettu(draft, published)
    ? {
        label: "Piilotettu",
        title: "Ei näy sivulla. Palauta alareunan painikkeella Näytä sivulla.",
        color: "danger",
      }
    : null;

const MERKIT: Record<MerkinNimi, DocumentBadgeComponent> = {
  ajastettu: Ajastettu,
  tarkistettava: Tarkistettava,
  odottaaToistaArvioijaa: OdottaaToistaArvioijaa,
  piilotettu: Piilotettu,
};

const TARKISTETTAVAT = TARKISTETTAVAT_TYYPIT.map(({ tyyppi }) => tyyppi);

/** Tyypin merkit Sanityn omien perään (sanity.config.ts). */
export function merkitTyypille(tyyppi: string): DocumentBadgeComponent[] {
  return merkkienNimetTyypille(tyyppi, TARKISTETTAVAT).map((nimi) => MERKIT[nimi]);
}

