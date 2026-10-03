import { StarIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { apiVersion } from "../../env";

/**
 * Klubilaisen arvosana ravintolalle (ruokailutaulukon yksi arvioija-rivi).
 *
 * Jokaisella klubilaisella on yksi voimassa oleva arvosana ravintolaa kohden:
 * uusin (päivän mukaan) korvaa vanhemman. Myös lomakkeen arvostelu, joka on
 * liitetty klubilaiseen, on klubilaisen arvosana. Ravintolan arvosana on
 * klubilaisten arvosanojen keskiarvo (lib/ravintola-arvosana.ts), ja se
 * päivittyy itsestään, kun arvosana lisätään, muutetaan tai poistetaan.
 */
const arvosana = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "number",
    validation: (rule) =>
      rule.required().min(1).max(5).precision(2).error("Arvosana on 1,0–5,0."),
  });

export const klubiArvio = defineType({
  name: "klubiArvio",
  title: "Klubilaisen arvosana",
  type: "document",
  icon: StarIcon,
  description:
    "Klubilaisen pisteet ravintolalle. Jos klubilainen käy ravintolassa uudelleen, muuta hänen " +
    "pisteitään ja päivää: ravintolan arvosana päivittyy itsestään.",
  fields: [
    defineField({
      name: "ravintola",
      title: "Ravintola",
      type: "reference",
      to: [{ type: "ravintola" }],
      validation: (rule) => rule.required().error("Valitse ravintola."),
    }),
    defineField({
      name: "arvioija",
      title: "Klubilainen",
      type: "reference",
      to: [{ type: "klubilainen" }],
      validation: (rule) => [
        rule.required().error("Valitse klubilainen."),
        rule.custom(async (arvioija, context) => {
          const doc = context.document as { _id?: string; ravintola?: { _ref?: string } } | undefined;
          const ref = (arvioija as { _ref?: string } | undefined)?._ref;
          if (!ref || !doc?.ravintola?._ref) return true;
          const id = (doc._id ?? "").replace(/^drafts\./, "");
          const toinen = await context
            .getClient({ apiVersion })
            .fetch<number>(
              `count(*[_type == "klubiArvio" && arvioija._ref == $ref && ravintola._ref == $ravintola
                && !(_id in [$id, "drafts." + $id])])`,
              { ref, ravintola: doc.ravintola._ref, id },
            );
          return toinen === 0
            ? true
            : "Tällä klubilaisella on jo arvosana tähän ravintolaan. Muokkaa sitä uuden lisäämisen sijaan.";
        }),
      ],
    }),
    arvosana("ratingFood", "Ruoka"),
    arvosana("ratingPrice", "Hinta"),
    arvosana("ratingAtmosphere", "Viihtyvyys"),
    defineField({
      name: "paiva",
      title: "Päivä",
      description: "Milloin arvosana annettiin tai viimeksi päivitettiin. Uusin arvosana on voimassa.",
      type: "date",
      options: { dateFormat: "D.M.YYYY" },
      validation: (rule) => rule.required().error("Päivä on pakollinen."),
    }),
    defineField({
      name: "kaynnit",
      title: "Klubilaisen käynnit",
      description: "Ruokailutaulukon käyntipäivät tälle klubilaiselle (vain tiedoksi).",
      type: "array",
      of: [{ type: "date" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "tuotu",
      title: "Tuotu ruokailutaulukosta",
      type: "boolean",
      readOnly: true,
      hidden: ({ value }) => !value,
    }),
  ],
  orderings: [
    { title: "Päivä (uusin ensin)", name: "paivaDesc", by: [{ field: "paiva", direction: "desc" }] },
  ],
  preview: {
    select: {
      nimi: "arvioija.nimi",
      ravintola: "ravintola.name",
      food: "ratingFood",
      price: "ratingPrice",
      atmosphere: "ratingAtmosphere",
      paiva: "paiva",
    },
    prepare({ nimi, ravintola, food, price, atmosphere, paiva }) {
      const luku = (v: unknown) => (typeof v === "number" ? v.toFixed(1).replace(".", ",") : "–");
      const pvm = paiva ? new Date(paiva).toLocaleDateString("fi-FI") : "";
      return {
        title: `${nimi ?? "?"} → ${ravintola ?? "?"}`,
        subtitle: [`${luku(food)} / ${luku(price)} / ${luku(atmosphere)}`, pvm].filter(Boolean).join(" · "),
      };
    },
  },
});
