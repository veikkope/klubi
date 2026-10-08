import { ImagesIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import {
  aiemmatPolutField,
  legacyUrlField,
  needsReviewField,
  polkuMuuttunut,
  tarkistettavaaField,
  tiivistelmaField,
} from "../objects/contentMeta";
import { OSOITE_OTSIKKO } from "../objects/sanasto";

export const galleriaAlbumi = defineType({
  name: "galleriaAlbumi",
  title: "Galleria-albumi",
  type: "document",
  icon: ImagesIcon,
  fields: [
    defineField({
      name: "title",
      title: "Albumin nimi",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: OSOITE_OTSIKKO,
      description: "Muodostuu otsikosta: paina Luo. Albumin osoite on /galleria/tämä-osa. Jos muutat julkaistun albumin osoitetta, vanha osoite ohjautuu uuteen automaattisesti. (Aiemmin kentän nimi oli Polku.)",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => [rule.required(), polkuMuuttunut(rule)],
    }),
    tiivistelmaField(),
    defineField({
      name: "date",
      title: "Päivämäärä",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "event",
      title: "Liittyvä tapahtuma (valinnainen)",
      type: "reference",
      to: [{ type: "tapahtuma" }],
    }),
    defineField({
      name: "coverImage",
      title: "Kansikuva",
      type: "imageWithAlt",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "images",
      title: "Kuvat",
      description:
        "Raahaa kuvat tähän useita kerralla. Järjestä raahaamalla. Kuvaukset voi lisätä myöhemmin.",
      type: "array",
      of: [{ type: "galleriaKuva" }],
      options: { layout: "grid" },
      validation: (rule) => rule.required().min(1).error("Vähintään yksi kuva tarvitaan."),
    }),
    needsReviewField(),
    tarkistettavaaField(),
    legacyUrlField(),
    aiemmatPolutField(),
  ],
  orderings: [
    { title: "Päivämäärä (uusin ensin)", name: "dateDesc", by: [{ field: "date", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", date: "date", media: "coverImage" },
    prepare({ title, date, media }) {
      const formatted = date ? new Date(date).toLocaleDateString("fi-FI") : "";
      return { title, subtitle: formatted, media };
    },
  },
});
