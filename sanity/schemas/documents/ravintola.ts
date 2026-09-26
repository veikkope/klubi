import { defineField, defineType } from "sanity";
import { seoFields } from "../objects/seoFields";
import {
  legacyUrlField,
  needsReviewField,
  tiivistelmaField,
} from "../objects/contentMeta";

/**
 * Ravintola-arvostelu.
 *
 * Vanhalla sivustolla arvio annettiin kahdessa muodossa: tähtinä (★★★★) ja
 * kolmena osa-arviona (Ruoka / Hinta / Viihtyvyys) joista laskettiin kokonaisluku
 * yhden desimaalin tarkkuudella. Molemmat säilytetään: tähdet ovat nopea
 * visuaalinen signaali, osa-arviot varsinainen sisältö.
 */
export const ravintola = defineType({
  name: "ravintola",
  title: "Ravintola",
  type: "document",
  groups: [
    { name: "perustiedot", title: "Perustiedot", default: true },
    { name: "arvostelu", title: "Arvostelu" },
    { name: "sijainti", title: "Sijainti" },
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
      validation: (rule) => rule.required(),
      group: "perustiedot",
    }),
    tiivistelmaField("perustiedot"),
    defineField({
      name: "city",
      title: "Kaupunki",
      type: "reference",
      to: [{ type: "kaupunki" }],
      validation: (rule) => rule.required(),
      group: "sijainti",
    }),
    defineField({
      name: "address",
      title: "Katuosoite",
      type: "string",
      group: "sijainti",
    }),
    defineField({
      name: "postalCode",
      title: "Postinumero",
      type: "string",
      validation: (rule) =>
        rule.regex(/^\d{4,6}$/, { name: "postinumero" }).warning("Tarkista postinumero."),
      group: "sijainti",
    }),
    defineField({
      name: "location",
      title: "Karttapaikka",
      type: "geopoint",
      group: "sijainti",
    }),
    defineField({
      name: "phone",
      title: "Puhelin",
      type: "string",
      group: "perustiedot",
    }),
    defineField({
      name: "website",
      title: "Verkkosivut",
      type: "url",
      group: "perustiedot",
    }),
    defineField({
      name: "cuisine",
      title: "Ruokatyyppi",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Lounas", value: "lounas" },
          { title: "Pizza", value: "pizza" },
          { title: "Burgeri", value: "burgeri" },
          { title: "Italialainen", value: "italialainen" },
          { title: "Aasialainen", value: "aasialainen" },
          { title: "Suomalainen", value: "suomalainen" },
          { title: "Kreikkalainen", value: "kreikkalainen" },
          { title: "Kahvila", value: "kahvila" },
          { title: "Á la carte", value: "alacarte" },
          { title: "Pikaruoka", value: "pikaruoka" },
        ],
        layout: "tags",
      },
      group: "perustiedot",
    }),
    defineField({
      name: "priceLevel",
      title: "Hintaluokka",
      type: "string",
      options: {
        list: [
          { title: "€ Edullinen", value: "€" },
          { title: "€€ Keskitaso", value: "€€" },
          { title: "€€€ Kallis", value: "€€€" },
        ],
      },
      group: "perustiedot",
    }),

    // ── Arvostelu ───────────────────────────────────────────────────────────
    defineField({
      name: "stars",
      title: "Tähdet (1–5)",
      description:
        "Nopea visuaalinen arvio. Jätä tyhjäksi jos ravintolaa ei ole vielä arvioitu.",
      type: "number",
      validation: (rule) => rule.integer().min(1).max(5),
      group: "arvostelu",
    }),
    defineField({
      name: "ratingOverall",
      title: "Kokonaisarvosana",
      description: "0–5, yksi desimaali. Esim. 3,6.",
      type: "number",
      validation: (rule) => rule.min(0).max(5).precision(2),
      group: "arvostelu",
    }),
    defineField({
      name: "ratingFood",
      title: "Ruoka",
      type: "number",
      validation: (rule) => rule.min(0).max(5).precision(2),
      group: "arvostelu",
    }),
    defineField({
      name: "ratingPrice",
      title: "Hinta",
      type: "number",
      validation: (rule) => rule.min(0).max(5).precision(2),
      group: "arvostelu",
    }),
    defineField({
      name: "ratingAtmosphere",
      title: "Viihtyvyys",
      type: "number",
      validation: (rule) => rule.min(0).max(5).precision(2),
      group: "arvostelu",
    }),
    defineField({
      name: "review",
      title: "Sanallinen arvostelu",
      type: "portableText",
      group: "arvostelu",
    }),
    defineField({
      name: "pros",
      title: "Plussat",
      type: "array",
      of: [{ type: "string" }],
      group: "arvostelu",
    }),
    defineField({
      name: "cons",
      title: "Miinukset",
      type: "array",
      of: [{ type: "string" }],
      group: "arvostelu",
    }),

    // ── Käyntihistoria ──────────────────────────────────────────────────────
    defineField({
      name: "visitedAt",
      title: "Ensimmäinen käynti",
      type: "date",
      group: "arvostelu",
    }),
    defineField({
      name: "visits",
      title: "Käynnit",
      description: "Kaikki klubin käynnit tässä ravintolassa, uusin ensin.",
      type: "array",
      of: [{ type: "date" }],
      group: "arvostelu",
    }),
    defineField({
      name: "visitContext",
      title: "Käynnin yhteys",
      description: 'Esim. "Jouluruokailu" tai "Suomi – Slovenia 21v".',
      type: "string",
      group: "arvostelu",
    }),

    // ── Tila ────────────────────────────────────────────────────────────────
    defineField({
      name: "closed",
      title: "Toiminta loppunut",
      description:
        "Merkitse jos ravintolaa ei enää ole. Sivu säilyy, mutta se merkitään " +
        "päättyneeksi eikä nouse listauksissa.",
      type: "boolean",
      initialValue: false,
      group: "perustiedot",
    }),
    defineField({
      name: "closedNote",
      title: "Lisätieto lopettamisesta",
      type: "string",
      hidden: ({ document }) => !document?.closed,
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
    ...seoFields,
    legacyUrlField("seo"),
  ],
  orderings: [
    {
      title: "Arvosana (parhaat ensin)",
      name: "ratingDesc",
      by: [{ field: "ratingOverall", direction: "desc" }],
    },
    {
      title: "Tähdet (parhaat ensin)",
      name: "starsDesc",
      by: [{ field: "stars", direction: "desc" }],
    },
    { title: "Nimi A–Ö", name: "nameAsc", by: [{ field: "name", direction: "asc" }] },
  ],
  preview: {
    select: {
      title: "name",
      city: "city.name",
      rating: "ratingOverall",
      stars: "stars",
      closed: "closed",
      needsReview: "needsReview",
      media: "images.0",
    },
    prepare({ title, city, rating, stars, closed, needsReview, media }) {
      const starString =
        typeof stars === "number" ? "★".repeat(stars) + "☆".repeat(5 - stars) : "";
      const ratingString =
        typeof rating === "number" ? rating.toFixed(1).replace(".", ",") : "";
      const flags = [closed ? "päättynyt" : null, needsReview ? "tarkista" : null]
        .filter(Boolean)
        .join(", ");
      return {
        title: needsReview ? `⚠ ${title}` : title,
        subtitle: [city, starString, ratingString, flags]
          .filter(Boolean)
          .join(" — "),
        media,
      };
    },
  },
});
