import { defineField, defineType } from "sanity";
import { seoFields } from "../objects/seoFields";

export const stadion = defineType({
  name: "stadion",
  title: "Stadion",
  type: "document",
  groups: [
    { name: "perustiedot", title: "Perustiedot", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Nimi",
      type: "string",
      validation: (rule) => rule.required(),
      group: "perustiedot",
    }),
    defineField({
      name: "slug",
      title: "Polku (slug)",
      type: "slug",
      options: { source: "name", maxLength: 80 },
      validation: (rule) => rule.required(),
      group: "perustiedot",
    }),
    defineField({
      name: "city",
      title: "Kaupunki",
      type: "reference",
      to: [{ type: "kaupunki" }],
      validation: (rule) => rule.required(),
      group: "perustiedot",
    }),
    defineField({
      name: "capacity",
      title: "Kapasiteetti",
      type: "number",
      validation: (rule) => rule.integer().positive(),
      group: "perustiedot",
    }),
    defineField({
      name: "openedYear",
      title: "Rakennusvuosi",
      type: "number",
      validation: (rule) => rule.integer().min(1800).max(new Date().getFullYear() + 5),
      group: "perustiedot",
    }),
    defineField({
      name: "description",
      title: "Kuvaus",
      type: "portableText",
      group: "perustiedot",
    }),
    defineField({
      name: "images",
      title: "Kuvat",
      type: "array",
      of: [{ type: "imageWithAlt" }],
      group: "perustiedot",
    }),
    ...seoFields,
  ],
  preview: {
    select: { title: "name", city: "city.name", capacity: "capacity", media: "images.0" },
    prepare({ title, city, capacity, media }) {
      const cap = capacity ? `${capacity.toLocaleString("fi-FI")} paikkaa` : "";
      return { title, subtitle: [city, cap].filter(Boolean).join(" — "), media };
    },
  },
});
