import { CommentIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

/**
 * Kävijän ravintola-arvostelu.
 *
 * Moderointi on Sanityn oma julkaisumalli: lomake tallentaa arvostelun
 * luonnoksena, jota ei voi lukea julkisesta rajapinnasta. Sihteeri **hyväksyy
 * julkaisemalla** (Publish) ja **hylkää poistamalla** luonnoksen. Erillistä
 * tilakenttää ei tarvita, joten hyväksyntää ei voi unohtaa julkaisun jälkeen.
 *
 * Arvostelijalta kysytään vain julkaistava nimi (tietojen minimointi, docs/16).
 */
export const ravintolaKayttajaArvostelu = defineType({
  name: "ravintolaKayttajaArvostelu",
  title: "Käyttäjän ravintola-arvostelu",
  type: "document",
  icon: CommentIcon,
  description:
    "Hyväksy arvostelu painamalla Publish. Hylkää poistamalla luonnos (valikko ⋯ → Delete). " +
    "Julkaistu arvostelu näkyy ravintolan sivulla.",
  fields: [
    defineField({
      name: "reviewerName",
      title: "Arvostelijan nimi",
      description: "Näkyy sivulla arvostelun yhteydessä.",
      type: "string",
      validation: (rule) => rule.required().error("Nimi on pakollinen."),
    }),
    defineField({
      name: "restaurant",
      title: "Ravintola",
      type: "reference",
      to: [{ type: "ravintola" }],
      validation: (rule) => rule.required().error("Valitse ravintola."),
    }),
    defineField({
      name: "stars",
      title: "Tähdet (1–5)",
      type: "number",
      validation: (rule) => rule.required().integer().min(1).max(5).error("Arvosana on 1–5 tähteä."),
    }),
    defineField({
      name: "comment",
      title: "Arvostelu",
      type: "text",
      rows: 5,
      validation: (rule) => rule.required().max(1000).error("Arvostelu on pakollinen (enintään 1000 merkkiä)."),
    }),
    defineField({
      name: "submittedAt",
      title: "Lähetysaika",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
  ],
  orderings: [
    { title: "Lähetysaika (uusin ensin)", name: "submittedAtDesc", by: [{ field: "submittedAt", direction: "desc" }] },
  ],
  preview: {
    select: { name: "reviewerName", restaurant: "restaurant.name", stars: "stars", submittedAt: "submittedAt" },
    prepare({ name, restaurant, stars, submittedAt }) {
      const pvm = submittedAt ? new Date(submittedAt).toLocaleDateString("fi-FI") : "";
      return {
        title: `${name ?? "?"} → ${restaurant ?? "?"}`,
        subtitle: [stars ? "★".repeat(stars) : "", pvm].filter(Boolean).join(" · "),
      };
    },
  },
});
