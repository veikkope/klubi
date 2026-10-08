import { ThListIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { TaulukkoKontekstiInput } from "../../components/taulukkoeditori/konteksti";
import { rivitKentta, sarakkeetKentta } from "./taulukkoKentat";

/**
 * Pieni taulukko tekstin seassa (docs/24 askel 6), esim. turnauksen tulokset.
 *
 * Taulukko on tekstiin upotettu eikä viittaus Jalkapallotilastoon (poikkeus
 * docs/23 Y15:n kohdasta 3): oma sisältö upotetaan, uudelleenkäytettävä
 * tilasto viitataan Sivu → Taulukot -kentällä. Sama editori ja tallennusmuoto
 * kuin tilastoissa (taulukkoKentat.ts, docs/19).
 */
export const taulukko = defineType({
  name: "taulukko",
  title: "Taulukko",
  type: "object",
  icon: ThListIcon,
  // Editori muokkaa sekä sarakkeita että rivejä tämän objektin juuresta.
  components: { input: TaulukkoKontekstiInput },
  // Leveä dialogi: taulukkoeditori tarvitsee tilaa. Jos liian kapea, width: 3.
  options: { modal: { type: "dialog", width: "auto" } },
  fields: [
    defineField({
      name: "otsikko",
      title: "Taulukon otsikko",
      type: "string",
      description:
        'Näkyy taulukon yläpuolella ja kertoo ruudunlukijalle, mistä taulukossa on kyse, esim. "Mölkkyturnauksen tulokset 2026".',
      validation: (rule) => rule.required().min(3).max(120).error("Kirjoita taulukolle otsikko."),
    }),
    sarakkeetKentta(),
    rivitKentta({
      riviTyyppi: "taulukonRivi",
      description:
        "Kirjoita kuten Excelissä, tai kopioi alue Excelistä ja liitä soluun (Ctrl+V). Sarakkeen nimi ja tyyppi muutetaan otsikon ⋮-valikosta.",
      validation: (rule) => rule.min(1).error("Lisää taulukkoon vähintään yksi rivi."),
    }),
  ],
  preview: {
    select: { otsikko: "otsikko", rivit: "rows", sarakkeet: "columns" },
    prepare: ({ otsikko, rivit, sarakkeet }) => ({
      title: otsikko || "Taulukko",
      subtitle: `Taulukko · ${Array.isArray(rivit) ? rivit.length : 0} riviä, ${
        Array.isArray(sarakkeet) ? sarakkeet.length : 0
      } saraketta`,
      media: ThListIcon,
    }),
  },
});
