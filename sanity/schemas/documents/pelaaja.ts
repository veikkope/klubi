import { UserIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { seoFields } from "../objects/seoFields";
import {
  legacyUrlField,
  muutLegacyUrlitField,
  needsReviewField,
  tarkistettavaaField,
  tiivistelmaField,
  polkuMuuttunut,
} from "../objects/contentMeta";

/**
 * Pelaajaprofiili jalkapalloarkistossa (Litmanen, Hyypiä, Pukki …).
 *
 * Vanhalla sivustolla nämä olivat omia sivujaan (litmanen.htm, litmanenjari.htm).
 */
export const pelaaja = defineType({
  name: "pelaaja",
  title: "Pelaaja",
  type: "document",
  icon: UserIcon,
  groups: [
    { name: "perustiedot", title: "Perustiedot", default: true },
    { name: "ura", title: "Ura" },
    { name: "seo", title: "SEO" },
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
      title: "Polku (slug)",
      type: "slug",
      options: { source: "name", maxLength: 80 },
      validation: (rule) => [rule.required(), polkuMuuttunut(rule)],
      group: "perustiedot",
    }),
    tiivistelmaField("perustiedot"),
    defineField({
      name: "syntymaaika",
      title: "Syntymäaika",
      type: "date",
      group: "perustiedot",
    }),
    defineField({
      name: "pelipaikka",
      title: "Pelipaikka",
      type: "string",
      options: {
        list: [
          { title: "Maalivahti", value: "maalivahti" },
          { title: "Puolustaja", value: "puolustaja" },
          { title: "Keskikenttäpelaaja", value: "keskikentta" },
          { title: "Hyökkääjä", value: "hyokkaaja" },
        ],
        layout: "dropdown",
      },
      group: "perustiedot",
    }),
    defineField({
      name: "maaottelut",
      title: "Maaottelut",
      type: "number",
      validation: (rule) => rule.integer().min(0),
      group: "ura",
    }),
    defineField({
      name: "maalit",
      title: "Maalit maajoukkueessa",
      type: "number",
      validation: (rule) => rule.integer().min(0),
      group: "ura",
    }),
    defineField({
      name: "seurat",
      title: "Seurat",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "seura",
              title: "Seura",
              type: "string",
              validation: (rule) => rule.required(),
            },
            { name: "alkuvuosi", title: "Alkuvuosi", type: "number" },
            { name: "loppuvuosi", title: "Loppuvuosi", type: "number" },
          ],
          preview: {
            select: { title: "seura", a: "alkuvuosi", b: "loppuvuosi" },
            prepare({ title, a, b }) {
              return { title, subtitle: [a, b].filter(Boolean).join("–") };
            },
          },
        },
      ],
      group: "ura",
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
      description: "Pelaajaan liittyvät taulukot, esim. loukkaantumiset tai maaottelut.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "jalkapalloTilasto" }] }],
      group: "ura",
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
  ],
  orderings: [{ title: "Nimi A–Ö", name: "nameAsc", by: [{ field: "name", direction: "asc" }] }],
  preview: {
    select: {
      title: "name",
      pelipaikka: "pelipaikka",
      maaottelut: "maaottelut",
      needsReview: "needsReview",
      media: "kuvat.0",
    },
    prepare({ title, pelipaikka, maaottelut, needsReview, media }) {
      return {
        title: needsReview ? `⚠ ${title}` : title,
        subtitle: [pelipaikka, maaottelut && `${maaottelut} maaottelua`]
          .filter(Boolean)
          .join(" — "),
        media,
      };
    },
  },
});
