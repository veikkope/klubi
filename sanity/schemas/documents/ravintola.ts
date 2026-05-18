import { defineField, defineType } from "sanity";
import { seoFields } from "../objects/seoFields";

export const ravintola = defineType({
  name: "ravintola",
  title: "Ravintola",
  type: "document",
  groups: [
    { name: "perustiedot", title: "Perustiedot", default: true },
    { name: "arvostelu", title: "Arvostelu" },
    { name: "sijainti", title: "Sijainti" },
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
      group: "sijainti",
    }),
    defineField({
      name: "address",
      title: "Katuosoite",
      type: "string",
      group: "sijainti",
    }),
    defineField({
      name: "location",
      title: "Karttapaikka",
      type: "geopoint",
      group: "sijainti",
    }),
    defineField({
      name: "cuisine",
      title: "Ruokatyyppi",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Lounas", value: "lounas" },
          { title: "Pizza", value: "pizza" },
          { title: "Burgeri", value: "burgeri" },
          { title: "Italialainen", value: "italialainen" },
          { title: "Aasialainen", value: "aasialainen" },
          { title: "Suomalainen", value: "suomalainen" },
          { title: "Kreikkalainen", value: "kreikkalainen" },
          { title: "Kahvila", value: "kahvila" },
          { title: "Á la carte", value: "alacarte" },
          { title: "Pikaruoka", value: "pikaruoka" },
        ],
        layout: "tags",
      },
      group: "perustiedot",
    }),
    defineField({
      name: "priceLevel",
      title: "Hintaluokka",
      type: "string",
      options: {
        list: [
          { title: "€ Edullinen", value: "€" },
          { title: "€€ Keskitaso", value: "€€" },
          { title: "€€€ Kallis", value: "€€€" },
        ],
      },
      group: "perustiedot",
    }),
    defineField({
      name: "stars",
      title: "Tähdet (1–5)",
      description: "Klubin oma tähtiarvio.",
      type: "number",
      validation: (rule) => rule.required().integer().min(1).max(5),
      group: "arvostelu",
    }),
    defineField({
      name: "review",
      title: "Arvostelu",
      type: "portableText",
      validation: (rule) => rule.required(),
      group: "arvostelu",
    }),
    defineField({
      name: "visitedAt",
      title: "Käyntiaika",
      type: "date",
      group: "arvostelu",
    }),
    defineField({
      name: "images",
      title: "Kuvat",
      type: "array",
      of: [{ type: "imageWithAlt" }],
      group: "perustiedot",
    }),
    defineField({
      name: "website",
      title: "Verkkosivut",
      type: "url",
      group: "perustiedot",
    }),
    ...seoFields,
  ],
  orderings: [
    { title: "Tähdet (parhaat ensin)", name: "starsDesc", by: [{ field: "stars", direction: "desc" }] },
    { title: "Nimi A–Ö", name: "nameAsc", by: [{ field: "name", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", city: "city.name", stars: "stars", media: "images.0" },
    prepare({ title, city, stars, media }) {
      const starString = stars ? `${"★".repeat(stars)}${"☆".repeat(5 - stars)}` : "";
      return {
        title,
        subtitle: [city, starString].filter(Boolean).join(" — "),
        media,
      };
    },
  },
});
