import { ConfettiIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { seoFields } from "../objects/seoFields";
import {
  legacyUrlField,
  muutLegacyUrlitField,
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
  icon: ConfettiIcon,
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
            {
              name: "otsikko",
              title: "Otsikko",
              description:
                'Käytä, jos samana vuonna on useita kertoja, esim. "Pääsiäisen mölkky" tai "Koivun kaato".',
              type: "string",
            },
            {
              name: "jarjestysnumero",
              title: "Järjestysnumero",
              description: 'Monesko kerta, esim. vuosikokous "(11)" tai mölkky "XXXVII".',
              type: "number",
              validation: (rule) => rule.integer().min(1),
            },
            { name: "paikka", title: "Paikka", type: "string" },
            {
              name: "osallistujat",
              title: "Osallistujat",
              description: "Osallistujien etunimet, yksi per rivi.",
              type: "array",
              of: [{ type: "string" }],
              options: { layout: "tags" },
            },
            { name: "kuvaus", title: "Kuvaus", type: "text", rows: 3 },
            {
              name: "linkki",
              title: "Linkki",
              description:
                'Linkki lisätietoon, esim. matkakuvaus blogissa tai video. Kirjoita linkin teksti, esim. "Matkakuvaus".',
              type: "object",
              options: { collapsible: true, collapsed: true },
              fields: [
                {
                  name: "url",
                  title: "Osoite",
                  description:
                    "Ulkoinen osoite (https://…) tai sivuston oma polku, esim. /uutiset/2019-03-10-milano.",
                  type: "url",
                  validation: (rule) =>
                    rule
                      // allowRelative: Blogspot-migraatio kääntää blogin matkakuvauslinkit
                      // tuotujen uutisten poluiksi (docs/14).
                      .uri({ scheme: ["http", "https"], allowRelative: true })
                      .error("Tarkista linkki: https://… tai /polku."),
                },
                {
                  name: "teksti",
                  title: "Linkin teksti",
                  description: 'Esim. "Matkakuvaus" tai "Video".',
                  type: "string",
                },
              ],
            },
            {
              name: "kuvat",
              title: "Kuvat",
              type: "array",
              of: [{ type: "imageWithAlt" }],
            },
          ],
          preview: {
            select: { title: "vuosi", otsikko: "otsikko", subtitle: "paikka" },
            prepare({ title, otsikko, subtitle }) {
              return {
                title: [title ?? "—", otsikko].filter(Boolean).join(" — "),
                subtitle,
              };
            },
          },
        },
      ],
      group: "vuodet",
    }),
    defineField({
      name: "tilastot",
      title: "Tilastotaulukot",
      description:
        "Toimintaan liittyvät taulukot, esim. mölkyn pistetaulukot tai jouluruokailujen osallistumistilasto.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "jalkapalloTilasto" }] }],
      group: "vuodet",
    }),
    needsReviewField("perustiedot"),
    ...seoFields,
    legacyUrlField("seo"),
    muutLegacyUrlitField("seo"),
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
