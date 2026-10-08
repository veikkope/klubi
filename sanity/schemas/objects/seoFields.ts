import { defineField } from "sanity";

import { HAKUKONEET_RYHMA } from "./sanasto";

export const seoFields = [
  defineField({
    name: "seoTitle",
    title: "Otsikko hakutuloksissa (valinnainen)",
    description: "Näkyy Googlessa ja selaimen välilehdellä. Jos tyhjä, käytetään otsikkoa.",
    type: "string",
    validation: (rule) => rule.max(70).warning("Suositus: alle 70 merkkiä"),
    group: HAKUKONEET_RYHMA.name,
  }),
  defineField({
    name: "seoDescription",
    title: "Kuvaus hakutuloksissa (valinnainen)",
    description:
      "Teksti Googlen hakutuloksen alla. Jos tyhjä, käytetään sivun alussa näkyvää tekstiä " +
      "(Tiivistelmä, Lyhenne tai Ingressi). Enintään 160 merkkiä.",
    type: "text",
    rows: 3,
    validation: (rule) =>
      rule.max(160).warning("Suositus: alle 160 merkkiä"),
    group: HAKUKONEET_RYHMA.name,
  }),
];
