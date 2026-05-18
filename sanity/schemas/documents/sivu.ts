import { defineField, defineType } from "sanity";
import { seoFields } from "../objects/seoFields";

export const sivu = defineType({
  name: "sivu",
  title: "Sivu",
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
      validation: (rule) => rule.required().error("Otsikko on pakollinen."),
      group: "sisalto",
    }),
    defineField({
      name: "slug",
      title: "Polku (slug)",
      description: "URL-osa. Älä käytä ääkkösiä eikä välilyöntejä.",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => rule.required(),
      group: "sisalto",
    }),
    defineField({
      name: "hero",
      title: "Yläbanneri (hero-kuva)",
      type: "imageWithAlt",
      group: "sisalto",
    }),
    defineField({
      name: "ingress",
      title: "Ingressi",
      description: "Lyhyt johdanto. Näkyy hero-alueella.",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(300),
      group: "sisalto",
    }),
    defineField({
      name: "body",
      title: "Pääsisältö",
      type: "portableText",
      group: "sisalto",
    }),
    ...seoFields,
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current", media: "hero" },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: subtitle ? `/${subtitle}` : "", media };
    },
  },
});
