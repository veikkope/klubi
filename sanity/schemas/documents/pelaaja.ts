import { UserIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { seoFields } from "../objects/seoFields";
import {
  aiemmatPolutField,
  koodiinSidottuSlug,
  legacyUrlField,
  muutLegacyUrlitField,
  needsReviewField,
  polkuMuuttunut,
  tarkistettavaaField,
  tiivistelmaField,
} from "../objects/contentMeta";
import { HAKUKONEET_RYHMA, OSOITE_OTSIKKO } from "../objects/sanasto";
import { LITMANEN_SLUG } from "../../../lib/path";

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
    { name: "patsas", title: "Patsas" },
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
      type: "slug",
      description:
        "Muodostuu nimestä: paina Luo. Pelaajan osoite on /jalkapalloarkisto/pelaajat/tämä-osa. Litmasen osoite on lukittu, koska Litmanen-osio hakee hänet sen perusteella. Jos muutat julkaistun pelaajan osoitetta, vanha osoite ohjautuu uuteen automaattisesti.",
      options: { source: "name", maxLength: 80 },
      readOnly: ({ document }) => koodiinSidottuSlug(document, [LITMANEN_SLUG]),
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
      name: "syntymapaikka",
      title: "Syntymäpaikka",
      type: "string",
      group: "perustiedot",
    }),
    defineField({
      name: "pituus",
      title: "Pituus (cm)",
      type: "number",
      validation: (rule) => rule.integer().min(140).max(220),
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
      name: "saavutukset",
      title: "Saavutukset ja palkinnot",
      description: "Näkyvät pelaajasivulla ryhmiteltyinä. Järjestä raahaamalla.",
      type: "array",
      of: [
        {
          type: "object",
          name: "saavutus",
          fields: [
            {
              name: "ryhma",
              title: "Ryhmä",
              type: "string",
              options: {
                list: [
                  { title: "Seurajoukkueissa", value: "seurajoukkueet" },
                  { title: "Maajoukkueessa", value: "maajoukkue" },
                  { title: "Henkilökohtaiset palkinnot", value: "henkilokohtaiset" },
                ],
                layout: "radio",
              },
              initialValue: "seurajoukkueet",
              validation: (rule) => rule.required(),
            },
            {
              name: "nimi",
              title: "Saavutus",
              description: "Esim. Hollannin mestaruus",
              type: "string",
              validation: (rule) => rule.required(),
            },
            {
              name: "vuodet",
              title: "Vuodet",
              description: "Esim. 1994, 1995, 1996",
              type: "string",
            },
          ],
          preview: {
            select: { title: "nimi", subtitle: "vuodet" },
          },
        },
      ],
      group: "ura",
    }),
    defineField({
      name: "kuvaus",
      title: "Esittely",
      description: "Lyhyt esittely pelaajasivun alkuun (valinnainen). Lehtijutut lisätään Lehtileikkeet-listaan.",
      type: "portableText",
      group: "perustiedot",
    }),
    defineField({
      name: "uutistunniste",
      title: "Uutisten tunniste",
      description:
        "Uutiset, joilla on tämä tunniste, näkyvät pelaajasivulla (esim. litmanen). Jätä tyhjäksi, jos ei tarvita.",
      type: "string",
      group: "perustiedot",
    }),
    defineField({
      name: "patsas",
      title: "Patsas",
      description: "Pelaajan patsas tai muistomerkki (valinnainen). Täytettynä sille tulee oma sivu.",
      type: "object",
      group: "patsas",
      fields: [
        { name: "paljastettu", title: "Paljastuspäivä", type: "date" },
        { name: "sijainti", title: "Sijainti", description: "Esim. Kisapuisto, Lahti", type: "string" },
        { name: "esittely", title: "Esittely", type: "portableText" },
        {
          name: "kuvat",
          title: "Kuvat",
          description: "Kuvat näytetään kuvauspäivän mukaan, tuorein ensin.",
          type: "array",
          of: [{ type: "paivattyKuva" }],
          options: { layout: "grid" },
        },
        {
          name: "uutistunniste",
          title: "Uutisten tunniste",
          description: "Esim. patsas: patsassivulla on linkki tämän tunnisteen uutisiin.",
          type: "string",
        },
      ],
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
    aiemmatPolutField("seo"),
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
