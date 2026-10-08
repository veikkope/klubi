import { defineArrayMember, defineType } from "sanity";

import { RIKKAAT_LOHKOT } from "../../../lib/sisaltolohkot";
import { tekstiLohko } from "./portableText";

/**
 * Rikas tekstisisältö (docs/24 askel 2, docs/05): sama teksti kuin
 * `portableText`issa ja lisäksi kuvasarja. Käytössä uutisen, tapahtuman ja
 * klubin toiminnan tekstissä; sivu siirtyy tähän askeleessa 6.
 *
 * Portable Text -taulukko tallentuu ilman taulukon tyyppinimeä, joten
 * kenttätyypin vaihto `portableText` → `rikasSisalto` ei muuta dataa.
 * Lohkojen järjestys on sama kuin Studion + -valikossa (`RIKKAAT_LOHKOT`).
 */
export const rikasSisalto = defineType({
  name: "rikasSisalto",
  title: "Sisältö",
  type: "array",
  of: [tekstiLohko, ...RIKKAAT_LOHKOT.map((type) => defineArrayMember({ type }))],
});
