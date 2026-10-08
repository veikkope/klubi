import { InfoOutlineIcon, WarningOutlineIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { HUOMION_SAVYT, huomionSavy, huomionSavynNimi } from "../../../lib/sisaltolohkot";

/**
 * Huomiolaatikko tekstin seassa (docs/24 askel 6): lyhyt tiedote tai tärkeä
 * ilmoitus omassa laatikossaan. Sivulla components/huomiolaatikko.tsx.
 */
export const huomio = defineType({
  name: "huomio",
  title: "Huomiolaatikko",
  type: "object",
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: "savy",
      title: "Sävy",
      type: "string",
      description:
        "Tiedote tavalliseen ilmoitukseen. Tärkeä vain, kun lukijan pitää toimia (määräaika, muutos, peruutus).",
      options: {
        list: HUOMION_SAVYT.map(({ title, value }) => ({ title, value })),
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "tieto",
    }),
    defineField({
      name: "otsikko",
      title: "Otsikko (valinnainen)",
      type: "string",
      description: 'Esim. "Jäsenmaksu 2027".',
      validation: (rule) => rule.max(80).error("Enintään 80 merkkiä."),
    }),
    defineField({
      name: "teksti",
      title: "Teksti",
      type: "text",
      rows: 4,
      description:
        "Lyhyt ja selkeä, muutama rivi. Rivinvaihdot säilyvät. Linkin tai ilmoittautumisen saat lisäämällä laatikon alle Painikkeen.",
      validation: (rule) => [
        rule.required().error("Kirjoita laatikkoon teksti."),
        rule.max(600).error("Enintään 600 merkkiä."),
        rule.max(400).warning("Lyhyt teksti erottuu parhaiten."),
      ],
    }),
  ],
  preview: {
    select: { otsikko: "otsikko", teksti: "teksti", savy: "savy" },
    prepare: ({ otsikko, teksti, savy }) => ({
      title: otsikko || (typeof teksti === "string" ? teksti.slice(0, 60) : "") || "Huomiolaatikko",
      subtitle: `Huomiolaatikko · ${huomionSavynNimi(savy)}`,
      media: huomionSavy(savy) === "tarkea" ? WarningOutlineIcon : InfoOutlineIcon,
    }),
  },
});
