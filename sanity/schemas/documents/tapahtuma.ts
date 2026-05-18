import { defineField, defineType } from "sanity";
import { seoFields } from "../objects/seoFields";

export const tapahtuma = defineType({
  name: "tapahtuma",
  title: "Tapahtuma",
  type: "document",
  groups: [
    { name: "perustiedot", title: "Perustiedot", default: true },
    { name: "ilmoittautuminen", title: "Ilmoittautuminen" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Tapahtuman nimi",
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
      name: "startsAt",
      title: "Alkamisaika",
      type: "datetime",
      validation: (rule) => rule.required().error("Alkamisaika on pakollinen."),
      group: "perustiedot",
    }),
    defineField({
      name: "endsAt",
      title: "Päättymisaika",
      type: "datetime",
      group: "perustiedot",
    }),
    defineField({
      name: "location",
      title: "Paikka",
      description: 'Esim. "Klubin tila, Vapaudenkatu 12, Lahti"',
      type: "string",
      group: "perustiedot",
    }),
    defineField({
      name: "image",
      title: "Kansikuva",
      type: "imageWithAlt",
      group: "perustiedot",
    }),
    defineField({
      name: "description",
      title: "Kuvaus",
      type: "portableText",
      validation: (rule) => rule.required(),
      group: "perustiedot",
    }),
    defineField({
      name: "signupUrl",
      title: "Ilmoittautumislinkki",
      description: "Ulkoinen ilmoittautumissivu (esim. lomake).",
      type: "url",
      group: "ilmoittautuminen",
    }),
    defineField({
      name: "signupEmail",
      title: "Ilmoittautumis-sähköposti",
      type: "email",
      group: "ilmoittautuminen",
    }),
    ...seoFields,
  ],
  orderings: [
    {
      title: "Alkamisajan mukaan (uusimmat ensin)",
      name: "startsAtDesc",
      by: [{ field: "startsAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", date: "startsAt", media: "image" },
    prepare({ title, date, media }) {
      const formatted = date
        ? new Date(date).toLocaleString("fi-FI", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Ei alkamisaikaa";
      return { title, subtitle: formatted, media };
    },
  },
});
