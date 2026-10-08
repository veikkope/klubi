import { UsersIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const hallitusJasen = defineType({
  name: "hallitusJasen",
  title: "Hallituksen jäsen",
  type: "document",
  icon: UsersIcon,
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
      name: "nykyinen",
      title: "Nykyinen jäsen",
      description:
        "Kun jäsen jää hallituksesta, ota rasti pois. Älä poista jäsentä: hän siirtyy listaan " +
        "Entiset jäsenet, eikä näy enää hallitussivulla.",
      type: "boolean",
      initialValue: true,
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
      title: "Järjestys hallitussivulla",
      description: "1 = ensimmäisenä (yleensä puheenjohtaja).",
      type: "number",
      validation: (rule) => rule.required().integer().positive(),
      initialValue: 99,
    }),
  ],
  orderings: [
    {
      title: "Järjestys hallitussivulla",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "name", role: "role", nykyinen: "nykyinen", media: "image" },
    prepare: ({ title, role, nykyinen, media }) => ({
      title,
      subtitle: nykyinen === false ? `Entinen · ${role ?? ""}` : role,
      media,
    }),
  },
});
