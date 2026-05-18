import { defineField, defineType } from "sanity";
import { seoFields } from "../objects/seoFields";

export const jalkapalloTilasto = defineType({
  name: "jalkapalloTilasto",
  title: "Jalkapallotilasto",
  type: "document",
  groups: [
    { name: "perustiedot", title: "Perustiedot", default: true },
    { name: "data", title: "Tilastodata" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Otsikko",
      type: "string",
      validation: (rule) => rule.required(),
      group: "perustiedot",
    }),
    defineField({
      name: "slug",
      title: "Polku (slug)",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => rule.required(),
      group: "perustiedot",
    }),
    defineField({
      name: "category",
      title: "Kategoria",
      description: "Vaikuttaa siihen, miten tilasto näytetään sivulla.",
      type: "string",
      options: {
        list: [
          { title: "FIFA-ranking", value: "fifa-ranking" },
          { title: "Suomen mestarit", value: "champions" },
          { title: "Huuhkajien valmentajat", value: "valmentajat" },
          { title: "Vuoden pelaaja", value: "vuoden-pelaaja" },
          { title: "Ballon d'Or", value: "ballon-dor" },
          { title: "Suomen jalkapallon saavutukset", value: "saavutukset" },
          { title: "Champions League / Eurocup", value: "eurocup" },
          { title: "Europa League / UEFA Cup", value: "uefa-cup" },
          { title: "UEFA Super Cup", value: "super-cup" },
          { title: "Conference League / Cup Winners' Cup", value: "conference-league" },
          { title: "Intercontinental / Club World Cup", value: "intercontinental" },
          { title: "Karsinta", value: "karsinta" },
        ],
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
      group: "perustiedot",
    }),
    defineField({
      name: "intro",
      title: "Johdanto",
      type: "portableText",
      group: "perustiedot",
    }),
    defineField({
      name: "columns",
      title: "Taulukon sarakkeet",
      description: "Määrittele sarakkeiden avain, otsikko ja tyyppi.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "key", title: "Avain (data-key)", type: "string", validation: (rule) => rule.required() },
            { name: "label", title: "Otsikko (näkyvä)", type: "string", validation: (rule) => rule.required() },
            {
              name: "type",
              title: "Tyyppi",
              type: "string",
              options: {
                list: [
                  { title: "Teksti", value: "text" },
                  { title: "Numero", value: "number" },
                  { title: "Päivämäärä", value: "date" },
                  { title: "Vuosi", value: "year" },
                  { title: "Linkki", value: "link" },
                ],
              },
              initialValue: "text",
            },
          ],
          preview: { select: { title: "label", subtitle: "key" } },
        },
      ],
      group: "data",
    }),
    defineField({
      name: "rows",
      title: "Taulukon rivit",
      description: "Anna jokainen rivi avain-arvo-pareina (key vastaa saraketta).",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "cells",
              title: "Solut",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    { name: "key", title: "Sarake-avain", type: "string", validation: (rule) => rule.required() },
                    { name: "value", title: "Arvo", type: "string" },
                  ],
                  preview: { select: { title: "key", subtitle: "value" } },
                },
              ],
            },
          ],
        },
      ],
      group: "data",
    }),
    defineField({
      name: "sources",
      title: "Lähteet",
      type: "array",
      of: [{ type: "url" }],
      group: "data",
    }),
    ...seoFields,
  ],
  preview: {
    select: { title: "title", category: "category" },
    prepare({ title, category }) {
      return { title, subtitle: category };
    },
  },
});
