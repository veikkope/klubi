import { defineField, defineType } from "sanity";
import { seoFields } from "../objects/seoFields";
import {
  legacyUrlField,
  needsReviewField,
  tiivistelmaField,
} from "../objects/contentMeta";

/**
 * Klubin toistuva toimintamuoto: talkoot, vappu, mölkky, vuosikokous,
 * jouluruokailu, ilotulitukset, venetsialaiset, matkat, musiikki.
 *
 * Vanhalla sivustolla nämä olivat erillisiä .htm-sivuja, joissa sama tapahtuma
 * toistui vuodesta toiseen. Mallinnetaan yhtenä toimintamuotona, jolla on
 * vuosittaisia merkintöjä — niin isä lisää uuden vuoden ilman uutta sivua.
 */
export const klubiToiminta = defineType({
  name: "klubiToiminta",
  title: "Klubin toiminta",
  type: "document",
  groups: [
    { name: "perustiedot", title: "Perustiedot", default: true },
    { name: "vuodet", title: "Vuosittain" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Toimintamuodon nimi",
      description: 'Esim. "Vappu" tai "Mölkky-turnaus".',
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
    tiivistelmaField("perustiedot"),
    defineField({
      name: "kuvaus",
      title: "Kuvaus",
      description: "Mistä toiminnassa on kyse, kenelle se on ja miten mukaan pääsee.",
      type: "portableText",
      group: "perustiedot",
    }),
    defineField({
      name: "jarjestys",
      title: "Järjestysnumero",
      description: "Pienempi luku näkyy listauksessa ylempänä.",
      type: "number",
      initialValue: 100,
      group: "perustiedot",
    }),
    defineField({
      name: "kuvat",
      title: "Kuvat",
      type: "array",
      of: [{ type: "imageWithAlt" }],
      group: "perustiedot",
    }),
    defineField({
      name: "vuodet",
      title: "Vuosittaiset merkinnät",
      description: "Lisää uusi rivi joka vuosi. Uusin näkyy sivulla ensimmäisenä.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "vuosi",
              title: "Vuosi",
              type: "number",
              validation: (rule) => rule.required().integer().min(1900).max(2100),
            },
            { name: "paivamaara", title: "Päivämäärä", type: "date" },
            { name: "paikka", title: "Paikka", type: "string" },
            { name: "kuvaus", title: "Kuvaus", type: "text", rows: 3 },
            {
              name: "kuvat",
              title: "Kuvat",
              type: "array",
              of: [{ type: "imageWithAlt" }],
            },
          ],
          preview: {
            select: { title: "vuosi", subtitle: "paikka" },
            prepare({ title, subtitle }) {
              return { title: String(title ?? "—"), subtitle };
            },
          },
        },
      ],
      group: "vuodet",
    }),
    needsReviewField("perustiedot"),
    ...seoFields,
    legacyUrlField("seo"),
  ],
  orderings: [
    {
      title: "Järjestys",
      name: "jarjestysAsc",
      by: [{ field: "jarjestys", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", vuodet: "vuodet", needsReview: "needsReview" },
    prepare({ title, vuodet, needsReview }) {
      const count = Array.isArray(vuodet) ? vuodet.length : 0;
      return {
        title: needsReview ? `⚠ ${title}` : title,
        subtitle: count ? `${count} vuotta kirjattu` : "Ei vuosimerkintöjä",
      };
    },
  },
});
