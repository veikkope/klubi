import { defineField, defineType } from "sanity";

export const galleriaAlbumi = defineType({
  name: "galleriaAlbumi",
  title: "Galleria-albumi",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Albumin nimi",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Polku (slug)",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      title: "Päivämäärä",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "event",
      title: "Liittyvä tapahtuma (valinnainen)",
      type: "reference",
      to: [{ type: "tapahtuma" }],
    }),
    defineField({
      name: "coverImage",
      title: "Kansikuva",
      type: "imageWithAlt",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "images",
      title: "Kuvat",
      type: "array",
      of: [{ type: "imageWithAlt" }],
      validation: (rule) => rule.required().min(1).error("Vähintään yksi kuva tarvitaan."),
    }),
  ],
  orderings: [
    { title: "Päivämäärä (uusin ensin)", name: "dateDesc", by: [{ field: "date", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", date: "date", media: "coverImage" },
    prepare({ title, date, media }) {
      const formatted = date ? new Date(date).toLocaleDateString("fi-FI") : "";
      return { title, subtitle: formatted, media };
    },
  },
});
