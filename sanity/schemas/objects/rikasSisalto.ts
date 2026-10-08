import { defineArrayMember, defineType } from "sanity";

import { RIKKAAT_LOHKOT } from "../../../lib/sisaltolohkot";
import { tekstiLohko } from "./portableText";

/**
 * Rikas tekstisisältö (docs/24 askeleet 2 ja 6, docs/05): sama teksti kuin
 * `portableText`issa ja lisäksi kuvasarja, upotus (kartta, lomake, Vimeo),
 * huomiolaatikko, painike, liite ja taulukko. Käytössä sivun, uutisen,
 * tapahtuman ja klubin toiminnan tekstissä.
 *
 * Portable Text -taulukko tallentuu ilman taulukon tyyppinimeä, joten
 * kenttätyypin vaihto `portableText` → `rikasSisalto` ei muuta dataa.
 *
 * Lohkojen järjestys on sama kuin Studion työkalupalkissa (`RIKKAAT_LOHKOT`).
 * `options.insertMenu` jätetään pois tarkoituksella: tekstieditorin
 * työkalupalkki rakentaa valikon skeematyypeistä eikä lue sitä (sanity 5.31.2,
 * `getInsertMenuItems`). Kapealla näytöllä painikkeet siirtyvät ⋯-valikkoon.
 */
export const rikasSisalto = defineType({
  name: "rikasSisalto",
  title: "Sisältö",
  type: "array",
  of: [tekstiLohko, ...RIKKAAT_LOHKOT.map((type) => defineArrayMember({ type }))],
});
