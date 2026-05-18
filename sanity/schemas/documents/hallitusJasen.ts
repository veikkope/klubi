import { defineField, defineType } from "sanity";

export const hallitusJasen = defineType({
  name: "hallitusJasen",
  title: "Hallituksen jäsen",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nimi",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Rooli",
      description: 'Esim. "Puheenjohtaja", "Sihteeri"',
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Profiilikuva",
      type: "imageWithAlt",
    }),
    defineField({
      name: "bio",
      title: "Lyhyt esittely",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "email",
      title: "Sähköposti",
      type: "email",
    }),
    defineField({
      name: "phone",
      title: "Puhelin",
      type: "string",
    }),
    defineField({
      name: "order",
      title: "Järjestysnumero",
      description: "1 = puheenjohtaja näkyy ensin",
      type: "number",
      validation: (rule) => rule.required().integer().positive(),
      initialValue: 99,
    }),
  ],
  orderings: [
    {
      title: "Järjestysnumero",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "image" },
  },
});
