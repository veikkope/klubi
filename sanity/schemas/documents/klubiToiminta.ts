import { ConfettiIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { puuttuukoLinkinKohde } from "../../../lib/linkki";
import { linkkiKentat } from "../objects/linkki";
import { seoFields } from "../objects/seoFields";
import {
  legacyUrlField,
  muutLegacyUrlitField,
  needsReviewField,
  tarkistettavaaField,
  tiivistelmaField,
  polkuMuuttunut,
} from "../objects/contentMeta";
import { HAKUKONEET_RYHMA, OSOITE_OTSIKKO } from "../objects/sanasto";

/**
 * Klubin toistuva toimintamuoto: talkoot, vappu, mölkky, vuosikokous,
 * jouluruokailu, ilotulitukset, venetsialaiset, matkat, musiikki.
 *
 * Vanhalla sivustolla nämä olivat erillisiä .htm-sivuja, joissa sama tapahtuma
 * toistui vuodesta toiseen. Mallinnetaan yhtenä toimintamuotona, jolla on
 * vuosittaisia merkintöjä — niin isä lisää uuden vuoden ilman uutta sivua.
 */
type LinkinArvo = Parameters<typeof puuttuukoLinkinKohde>[1];

export const klubiToiminta = defineType({
  name: "klubiToiminta",
  title: "Klubin toiminta",
  type: "document",
  icon: ConfettiIcon,
  groups: [
    { name: "perustiedot", title: "Perustiedot", default: true },
    { name: "vuodet", title: "Vuosittain" },
    HAKUKONEET_RYHMA,
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
      title: OSOITE_OTSIKKO,
      description: "Muodostuu otsikosta: paina Luo. Toimintamuodon osoite on /klubi/toiminta/tämä-osa. (Aiemmin kentän nimi oli Polku.)",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => [rule.required(), polkuMuuttunut(rule)],
      group: "perustiedot",
    }),
    tiivistelmaField("perustiedot"),
    defineField({
      name: "kuvaus",
      title: "Kuvaus",
      description: "Mistä toiminnassa on kyse, kenelle se on ja miten mukaan pääsee.",
      type: "rikasSisalto",
      group: "perustiedot",
    }),
    defineField({
      name: "jarjestys",
      title: "Järjestys listassa",
      description: "Pienempi luku näkyy Toiminta-sivulla ja Studion listassa ylempänä.",
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
              title: "Monesko kerta",
              description: "Tavallisena lukuna, esim. 37. Sivulla näkyy (37.).",
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
                'Linkki lisätietoon, esim. matkakuvaus uutisissa tai video. Kirjoita linkin teksti, esim. "Matkakuvaus".',
              type: "object",
              options: { collapsible: true, collapsed: true },
              fields: [
                defineField({
                  name: "teksti",
                  title: "Linkin teksti",
                  description: 'Esim. "Matkakuvaus" tai "Video".',
                  type: "string",
                  validation: (rule) =>
                    rule
                      .custom((teksti, konteksti) => {
                        const linkki = konteksti.parent as (LinkinArvo & { url?: string }) | undefined;
                        // Vanha osoite (url) riittää sivustolle, kunnes linkit muunnetaan
                        // (docs/24 askel 5), mutta keskeneräisestä valinnasta varoitetaan aina.
                        return puuttuukoLinkinKohde(teksti, linkki, linkki?.url)
                          ? "Linkin teksti on kirjoitettu, mutta kohde puuttuu."
                          : true;
                      })
                      .warning(),
                }),
                // Ei oletusvalintaa: vuoden linkki on vapaaehtoinen.
                ...linkkiKentat({ pakollinen: false }),
                defineField({
                  name: "url",
                  title: "Vanha osoite",
                  type: "string",
                  deprecated: { reason: "Korvattu kentillä Mihin linkki vie ja Sivu/Osoite." },
                  readOnly: true,
                  hidden: true,
                }),
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
    tarkistettavaaField("perustiedot"),
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
