import { defineField, defineType } from "sanity";
import { seoFields } from "../objects/seoFields";
import {
  legacyUrlField,
  muutLegacyUrlitField,
  needsReviewField,
  tiivistelmaField,
} from "../objects/contentMeta";

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
    tiivistelmaField("sisalto"),
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
      description:
        "Lyhyt teaser uutislistalle. Max 200 merkkiä. Ei pakollinen, jos uutinen " +
        "on pelkkä otsikko, joka linkittää alkuperäiseen kirjoitukseen.",
      type: "text",
      rows: 2,
      validation: (rule) =>
        rule
          .max(200)
          .custom((value, context) =>
            value || (context.document as { ulkoinenLinkki?: string } | undefined)?.ulkoinenLinkki
              ? true
              : "Lyhenne on pakollinen."
          ),
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
      description:
        "Uutisen teksti. Ei pakollinen, jos uutinen linkittää alkuperäiseen " +
        "kirjoitukseen (kenttä Alkuperäinen kirjoitus).",
      validation: (rule) =>
        rule.custom((value, context) =>
          (Array.isArray(value) && value.length > 0) ||
          (context.document as { ulkoinenLinkki?: string } | undefined)?.ulkoinenLinkki
            ? true
            : "Sisältö on pakollinen."
        ),
      group: "sisalto",
    }),
    defineField({
      name: "ulkoinenLinkki",
      title: "Alkuperäinen kirjoitus (linkki)",
      description:
        "Jos uutinen on julkaistu muualla (esim. klubin Blogspot-blogissa), linkki " +
        "siihen. Vanhan sivuston otsikkoarkisto koostuu tällaisista linkeistä.",
      type: "url",
      validation: (rule) =>
        rule.uri({ scheme: ["http", "https"] }).error("Linkin pitää alkaa https://."),
      group: "sisalto",
    }),
    defineField({
      name: "lahde",
      title: "Lähde",
      description:
        'Mistä uutinen on lainattu, esim. "palloliitto.fi" tai "ESS". Vanhalla ' +
        "sivustolla merkintä oli uutisen lopussa: (palloliitto.fi 07.02.2008).",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "nimi", title: "Lähteen nimi", type: "string" }),
        defineField({
          name: "url",
          title: "Lähteen osoite",
          type: "url",
          validation: (rule) =>
            rule.uri({ scheme: ["http", "https"] }).error("Linkin pitää alkaa https://."),
        }),
        defineField({
          name: "pvm",
          title: "Lähteen päiväys",
          description: "Täytä vain, jos eri kuin julkaisuaika.",
          type: "date",
        }),
      ],
      group: "sisalto",
    }),
    defineField({
      name: "categories",
      title: "Kategoriat",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Otteluraportti", value: "otteluraportti" },
          { title: "Kannattajakulttuuri", value: "kannattajakulttuuri" },
          { title: "Tiedote", value: "tiedote" },
          { title: "Tapahtumaraportti", value: "tapahtumaraportti" },
          { title: "Jäsentieto", value: "jasentieto" },
          { title: "Jalkapallo", value: "jalkapallo" },
          { title: "Ravintola", value: "ravintola" },
          { title: "Blogikirjoitus", value: "blogi" },
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
    needsReviewField("sisalto"),
    ...seoFields,
    legacyUrlField("seo"),
    muutLegacyUrlitField("seo"),
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
