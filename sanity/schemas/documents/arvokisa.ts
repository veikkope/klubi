import { StarIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { seoFields } from "../objects/seoFields";
import {
  aiemmatPolutField,
  legacyUrlField,
  muutLegacyUrlitField,
  needsReviewField,
  polkuMuuttunut,
  tarkistettavaaField,
  tiivistelmaField,
} from "../objects/contentMeta";
import { HAKUKONEET_RYHMA, OSOITE_OTSIKKO } from "../objects/sanasto";

/**
 * Yksi arvokisa: MM 2026, EM 2024, Kansojen liiga jne.
 *
 * Vanhalla sivustolla jokainen kisa oli oma .htm-sivunsa (MM2010.htm …
 * EM2024.htm). Mallinnetaan yhtenä tyyppinä, jotta uuden kisan lisääminen on
 * Studiossa yksi uusi dokumentti eikä koodimuutos.
 */
export const arvokisa = defineType({
  name: "arvokisa",
  title: "Arvokisa",
  type: "document",
  icon: StarIcon,
  groups: [
    { name: "perustiedot", title: "Perustiedot", default: true },
    { name: "tulokset", title: "Tulokset" },
    HAKUKONEET_RYHMA,
  ],
  fields: [
    defineField({
      name: "title",
      title: "Kisan nimi",
      description: 'Esim. "MM-kisat 2026" tai "EM-kisat 2024".',
      type: "string",
      validation: (rule) => rule.required(),
      group: "perustiedot",
    }),
    defineField({
      name: "slug",
      title: OSOITE_OTSIKKO,
      description: "Muodostuu otsikosta: paina Luo. Arvokisan osoite on /jalkapalloarkisto/arvokisat/tämä-osa. Jos muutat julkaistun arvokisan osoitetta, vanha osoite ohjautuu uuteen automaattisesti. (Aiemmin kentän nimi oli Polku.)",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => [rule.required(), polkuMuuttunut(rule)],
      group: "perustiedot",
    }),
    tiivistelmaField("perustiedot"),
    defineField({
      name: "kisatyyppi",
      title: "Kisatyyppi",
      type: "string",
      options: {
        list: [
          { title: "MM-kisat", value: "mm" },
          { title: "EM-kisat", value: "em" },
          { title: "Kansojen liiga", value: "kansojen-liiga" },
          { title: "Olympialaiset", value: "olympialaiset" },
          { title: "Alle 21-vuotiaiden EM", value: "u21-em" },
          { title: "Muu", value: "muu" },
        ],
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
      group: "perustiedot",
    }),
    defineField({
      name: "vuosi",
      title: "Vuosi",
      type: "number",
      validation: (rule) => rule.required().integer().min(1900).max(2100),
      group: "perustiedot",
    }),
    defineField({
      name: "isantamaat",
      title: "Isäntämaa(t)",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "perustiedot",
    }),
    defineField({
      name: "alkuPvm",
      title: "Alkupäivä",
      description: 'Vanhalla sivustolla esim. "11.06.-11.07.2010".',
      type: "date",
      group: "perustiedot",
    }),
    defineField({
      name: "loppuPvm",
      title: "Loppupäivä",
      type: "date",
      validation: (rule) =>
        rule.custom((value, context) => {
          const alku = (context.document as { alkuPvm?: string } | undefined)?.alkuPvm;
          return !value || !alku || value >= alku
            ? true
            : "Loppupäivä ei voi olla ennen alkupäivää.";
        }),
      group: "perustiedot",
    }),
    defineField({
      name: "voittaja",
      title: "Voittaja",
      type: "string",
      group: "tulokset",
    }),
    defineField({
      name: "hopea",
      title: "Hopea",
      description: "Loppuottelun hävinnyt joukkue.",
      type: "string",
      group: "tulokset",
    }),
    defineField({
      name: "pronssi",
      title: "Pronssi",
      description: 'Pronssiottelun voittaja. Kirjoita "ei jaettu", jos pronssia ei ratkaistu.',
      type: "string",
      group: "tulokset",
    }),
    defineField({
      name: "suomenSijoitus",
      title: "Suomen sijoitus",
      description: 'Esim. "Ei karsiutunut" tai "Lohkovaihe".',
      type: "string",
      group: "tulokset",
    }),
    defineField({
      name: "kuvaus",
      title: "Kuvaus",
      type: "portableText",
      group: "perustiedot",
    }),
    defineField({
      name: "tilastot",
      title: "Tilastotaulukot",
      description: "Liitä kisaan kuuluvat taulukot.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "jalkapalloTilasto" }] }],
      group: "tulokset",
    }),
    defineField({
      name: "kuvat",
      title: "Kuvat",
      type: "array",
      of: [{ type: "imageWithAlt" }],
      group: "perustiedot",
    }),
    needsReviewField("perustiedot"),
    tarkistettavaaField("perustiedot"),
    ...seoFields,
    legacyUrlField("seo"),
    muutLegacyUrlitField("seo"),
    aiemmatPolutField("seo"),
  ],
  orderings: [
    { title: "Uusin ensin", name: "vuosiDesc", by: [{ field: "vuosi", direction: "desc" }] },
  ],
  preview: {
    select: {
      title: "title",
      vuosi: "vuosi",
      voittaja: "voittaja",
      needsReview: "needsReview",
    },
    prepare({ title, vuosi, voittaja, needsReview }) {
      return {
        title: needsReview ? `⚠ ${title}` : title,
        subtitle: [vuosi, voittaja && `voittaja: ${voittaja}`]
          .filter(Boolean)
          .join(" — "),
      };
    },
  },
});
