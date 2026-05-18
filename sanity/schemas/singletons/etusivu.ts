import { defineArrayMember, defineField, defineType } from "sanity";

export const etusivu = defineType({
  name: "etusivu",
  title: "Etusivu",
  type: "document",
  groups: [
    { name: "hero", title: "Hero-alue", default: true },
    { name: "blocks", title: "Lohkot" },
  ],
  fields: [
    defineField({
      name: "heroEyebrow",
      title: "Hero — yläteksti",
      description: 'Pieni teksti otsikon yläpuolella, esim. "Perustettu 2007"',
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero — pääotsikko",
      type: "string",
      initialValue: "Lahden Suomalainen Klubi",
      validation: (rule) => rule.required(),
      group: "hero",
    }),
    defineField({
      name: "heroDescription",
      title: "Hero — kuvaus",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
      group: "hero",
    }),
    defineField({
      name: "heroImage",
      title: "Hero — taustakuva (valinnainen)",
      type: "imageWithAlt",
      group: "hero",
    }),
    defineField({
      name: "heroCtas",
      title: "Hero — napit",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", title: "Teksti", type: "string", validation: (rule) => rule.required() },
            { name: "href", title: "Linkki", type: "string", validation: (rule) => rule.required() },
            { name: "primary", title: "Pääpainike", type: "boolean", initialValue: false },
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        },
      ],
      validation: (rule) => rule.max(2),
      group: "hero",
    }),
    defineField({
      name: "blocks",
      title: "Etusivun lohkot (järjestyksessä)",
      description: "Lisää, järjestä ja piilota lohkoja vetämällä.",
      type: "array",
      of: [
        defineArrayMember({
          name: "uutiset",
          title: "Uutiset-nostot",
          type: "object",
          fields: [
            { name: "heading", title: "Otsikko", type: "string", initialValue: "Ajankohtaista" },
            { name: "count", title: "Näytettävien määrä", type: "number", initialValue: 3, validation: (r) => r.min(1).max(6) },
          ],
          preview: { prepare: () => ({ title: "Uutiset-nostot" }) },
        }),
        defineArrayMember({
          name: "tapahtumat",
          title: "Tulevat tapahtumat",
          type: "object",
          fields: [
            { name: "heading", title: "Otsikko", type: "string", initialValue: "Tulevat tapahtumat" },
            { name: "count", title: "Näytettävien määrä", type: "number", initialValue: 3, validation: (r) => r.min(1).max(6) },
          ],
          preview: { prepare: () => ({ title: "Tulevat tapahtumat" }) },
        }),
        defineArrayMember({
          name: "esittely",
          title: "Esittelyteksti",
          type: "object",
          fields: [
            { name: "heading", title: "Otsikko", type: "string" },
            { name: "body", title: "Teksti", type: "portableText" },
            { name: "image", title: "Kuva", type: "imageWithAlt" },
            { name: "ctaLabel", title: "Napin teksti", type: "string" },
            { name: "ctaHref", title: "Napin linkki", type: "string" },
          ],
          preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "Esittelyteksti" }) },
        }),
        defineArrayMember({
          name: "ravintolatSpotlight",
          title: "Ravintolat-spotlight",
          type: "object",
          fields: [
            { name: "heading", title: "Otsikko", type: "string", initialValue: "Parhaat ravintolat" },
            { name: "city", title: "Kaupunki (suodatin, valinnainen)", type: "reference", to: [{ type: "kaupunki" }] },
            { name: "count", title: "Näytettävien määrä", type: "number", initialValue: 5, validation: (r) => r.min(1).max(10) },
          ],
          preview: { prepare: () => ({ title: "Ravintolat-spotlight" }) },
        }),
        defineArrayMember({
          name: "cta",
          title: "CTA-lohko",
          type: "object",
          fields: [
            { name: "heading", title: "Otsikko", type: "string", validation: (r) => r.required() },
            { name: "body", title: "Teksti", type: "text", rows: 2 },
            { name: "ctaLabel", title: "Napin teksti", type: "string", validation: (r) => r.required() },
            { name: "ctaHref", title: "Napin linkki", type: "string", validation: (r) => r.required() },
          ],
          preview: { select: { title: "heading" } },
        }),
      ],
      group: "blocks",
    }),
  ],
  preview: { prepare: () => ({ title: "Etusivu" }) },
});
