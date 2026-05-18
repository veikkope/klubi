import { defineField, defineType } from "sanity";
import { seoFields } from "../objects/seoFields";

export const uutinen = defineType({
  name: "uutinen",
  title: "Uutinen",
  type: "document",
  groups: [
    { name: "sisalto", title: "Sisältö", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Otsikko",
      type: "string",
      validation: (rule) => rule.required(),
      group: "sisalto",
    }),
    defineField({
      name: "slug",
      title: "Polku (slug)",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => rule.required(),
      group: "sisalto",
    }),
    defineField({
      name: "publishedAt",
      title: "Julkaisuaika",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
      group: "sisalto",
    }),
    defineField({
      name: "excerpt",
      title: "Lyhenne",
      description: "Lyhyt teaser uutislistalle. Max 200 merkkiä.",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(200),
      group: "sisalto",
    }),
    defineField({
      name: "coverImage",
      title: "Kansikuva",
      type: "imageWithAlt",
      group: "sisalto",
    }),
    defineField({
      name: "body",
      title: "Sisältö",
      type: "portableText",
      validation: (rule) => rule.required(),
      group: "sisalto",
    }),
    defineField({
      name: "categories",
      title: "Kategoriat",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Tiedote", value: "tiedote" },
          { title: "Tapahtumaraportti", value: "tapahtumaraportti" },
          { title: "Jäsentieto", value: "jasentieto" },
          { title: "Jalkapallo", value: "jalkapallo" },
          { title: "Ravintola", value: "ravintola" },
        ],
        layout: "tags",
      },
      group: "sisalto",
    }),
    defineField({
      name: "author",
      title: "Kirjoittaja",
      type: "reference",
      to: [{ type: "hallitusJasen" }],
      group: "sisalto",
    }),
    ...seoFields,
  ],
  orderings: [
    {
      title: "Julkaisuaika (uusimmat ensin)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", date: "publishedAt", media: "coverImage" },
    prepare({ title, date, media }) {
      const formatted = date
        ? new Date(date).toLocaleDateString("fi-FI")
        : "Ei päivämäärää";
      return { title, subtitle: formatted, media };
    },
  },
});
