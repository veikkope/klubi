import { CubeIcon } from "@sanity/icons";
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

export const stadion = defineType({
  name: "stadion",
  title: "Stadion",
  type: "document",
  icon: CubeIcon,
  groups: [
    { name: "perustiedot", title: "Perustiedot", default: true },
    HAKUKONEET_RYHMA,
  ],
  fields: [
    defineField({
      name: "name",
      title: "Nimi",
      type: "string",
      validation: (rule) => rule.required(),
      group: "perustiedot",
    }),
    defineField({
      name: "slug",
      title: OSOITE_OTSIKKO,
      description: "Muodostuu nimestä: paina Luo. Stadionin osoite on /jalkapalloarkisto/stadionit/tämä-osa. Jos muutat julkaistun stadionin osoitetta, vanha osoite ohjautuu uuteen automaattisesti. (Aiemmin kentän nimi oli Polku.)",
      type: "slug",
      options: { source: "name", maxLength: 80 },
      validation: (rule) => [rule.required(), polkuMuuttunut(rule)],
      group: "perustiedot",
    }),
    tiivistelmaField("perustiedot"),
    defineField({
      name: "city",
      title: "Kaupunki",
      type: "reference",
      to: [{ type: "kaupunki" }],
      validation: (rule) => rule.required(),
      group: "perustiedot",
    }),
    defineField({
      name: "address",
      title: "Osoite",
      description: 'Stadionin katuosoite, esim. "Wembley, London, HA9 0WS".',
      type: "string",
      group: "perustiedot",
    }),
    defineField({
      name: "location",
      title: "Karttapaikka",
      description:
        "Stadionin sijainti kartalla. Näkyy sivulla ja kerrotaan hakukoneille.",
      type: "geopoint",
      group: "perustiedot",
    }),
    defineField({
      name: "capacity",
      title: "Kapasiteetti",
      type: "number",
      validation: (rule) => rule.integer().positive(),
      group: "perustiedot",
    }),
    defineField({
      name: "openedYear",
      title: "Rakennusvuosi",
      type: "number",
      validation: (rule) => rule.integer().min(1800).max(new Date().getFullYear() + 5),
      group: "perustiedot",
    }),
    defineField({
      name: "description",
      title: "Kuvaus",
      type: "portableText",
      group: "perustiedot",
    }),
    defineField({
      name: "images",
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
  preview: {
    select: { title: "name", city: "city.name", capacity: "capacity", media: "images.0", needsReview: "needsReview" },
    prepare({ title, city, capacity, media, needsReview }) {
      const cap = capacity ? `${capacity.toLocaleString("fi-FI")} paikkaa` : "";
      return { title: needsReview ? `⚠ ${title}` : title, subtitle: [city, cap].filter(Boolean).join(" — "), media };
    },
  },
});
