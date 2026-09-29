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
 *
 * Kävijä voi arvostella myös ravintolan, jota hakemistossa ei vielä ole. Silloin
 * `restaurant` puuttuu ja ehdotuksen tiedot ovat `ehdotettuRavintola`-kentässä.
 * Arvostelua ei voi julkaista ilman ravintolaa: toiminto "Hyväksy ja luo
 * ravintola" (sanity/actions/hyvaksy-ja-luo-ravintola.tsx) luo ravintolan,
 * liittää arvostelun siihen ja julkaisee molemmat.
 */
export const ravintolaKayttajaArvostelu = defineType({
  name: "ravintolaKayttajaArvostelu",
  title: "Käyttäjän ravintola-arvostelu",
  type: "document",
  icon: CommentIcon,
  description:
    "Hyväksy arvostelu painamalla Julkaise. Jos kävijä ehdotti uutta ravintolaa, paina " +
    "\"Hyväksy ja luo ravintola\". Hylkää poistamalla luonnos (valikko ⋯ → Poista). " +
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
      name: "ehdotettuRavintola",
      title: "Kävijän ehdottama uusi ravintola",
      description:
        "Ravintolaa ei ollut hakemistossa. Tarkista tiedot ja paina alareunasta " +
        "\"Hyväksy ja luo ravintola\": ravintola lisätään hakemistoon ja arvostelu julkaistaan. " +
        "Voit myös valita alta olemassa olevan ravintolan, jos se löytyy jo toisella nimellä.",
      type: "object",
      readOnly: true,
      hidden: ({ value }) => !value,
      fields: [
        defineField({ name: "nimi", title: "Nimi", type: "string" }),
        defineField({ name: "kaupunki", title: "Kaupunki", type: "string" }),
        defineField({ name: "maa", title: "Maa", type: "string" }),
        defineField({ name: "lisatieto", title: "Osoite tai verkkosivu", type: "string" }),
      ],
    }),
    defineField({
      name: "restaurant",
      title: "Ravintola",
      type: "reference",
      to: [{ type: "ravintola" }],
      validation: (rule) =>
        rule.custom((value, context) => {
          if (value) return true;
          const ehdotus = (context.document as { ehdotettuRavintola?: { nimi?: string } } | undefined)
            ?.ehdotettuRavintola;
          return ehdotus
            ? `Ravintolaa "${ehdotus.nimi ?? ""}" ei ole vielä hakemistossa. Paina "Hyväksy ja luo ravintola" tai valitse olemassa oleva ravintola.`
            : "Valitse ravintola.";
        }),
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
    select: {
      name: "reviewerName",
      restaurant: "restaurant.name",
      uusi: "ehdotettuRavintola.nimi",
      stars: "stars",
      submittedAt: "submittedAt",
    },
    prepare({ name, restaurant, uusi, stars, submittedAt }) {
      const pvm = submittedAt ? new Date(submittedAt).toLocaleDateString("fi-FI") : "";
      return {
        title: `${name ?? "?"} → ${restaurant ?? (uusi ? `UUSI: ${uusi}` : "?")}`,
        subtitle: [stars ? "★".repeat(stars) : "", pvm].filter(Boolean).join(" · "),
      };
    },
  },
});
