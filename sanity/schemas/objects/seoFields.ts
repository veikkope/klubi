import { defineField } from "sanity";

export const seoFields = [
  defineField({
    name: "seoTitle",
    title: "SEO-otsikko (override)",
    description:
      "Näkyy Googlessa ja selaimen välilehdellä. Jos jätät tyhjäksi, käytetään sivun otsikkoa.",
    type: "string",
    validation: (rule) => rule.max(70).warning("Suositus: alle 70 merkkiä"),
    group: "seo",
  }),
  defineField({
    name: "seoDescription",
    title: "SEO-kuvaus (override)",
    description:
      "Näkyy Googlen hakutuloksissa. Jos tyhjä, käytetään sivun ingressiä/excerptiä.",
    type: "text",
    rows: 3,
    validation: (rule) =>
      rule.max(160).warning("Suositus: alle 160 merkkiä"),
    group: "seo",
  }),
];
