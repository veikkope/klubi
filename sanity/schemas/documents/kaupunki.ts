import { defineField, defineType } from "sanity";

export const kaupunki = defineType({
  name: "kaupunki",
  title: "Kaupunki",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nimi",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 60 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "country",
      title: "Maa",
      type: "string",
      initialValue: "Suomi",
    }),
  ],
  orderings: [
    { title: "Nimi A–Ö", name: "nameAsc", by: [{ field: "name", direction: "asc" }] },
  ],
  preview: { select: { title: "name", subtitle: "country" } },
});
