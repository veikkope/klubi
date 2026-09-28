import { CommentIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

/**
 * Jäsenen kommentti tai veikkaus uutisen alla (docs/15).
 *
 * Lähetetään sivuston lomakkeelta (`app/(public)/uutiset/[slug]/kommentit/`) ja
 * julkaistaan heti. Isä moderoi jälkikäteen valinnalla "Piilota". Vanhat
 * Blogspot-blogin veikkauskommentit on tuotu tähän samaan tyyppiin (`lahde`).
 */
export const kommentti = defineType({
  name: "kommentti",
  title: "Kommentti tai veikkaus",
  type: "document",
  icon: CommentIcon,
  fields: [
    defineField({
      name: "piilotettu",
      title: "Piilota sivulta",
      description:
        "Piilotettu kommentti ei näy sivulla, mutta säilyy tässä. Käytä asiattomiin " +
        "viesteihin tai kun jäsen pyytää poistamaan veikkauksensa näkyvistä.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "uutinen",
      title: "Uutinen",
      description: "Kirjoitus, jonka alla kommentti näkyy.",
      type: "reference",
      to: [{ type: "uutinen" }],
      validation: (rule) => rule.required().error("Valitse uutinen, jonka alle kommentti kuuluu."),
    }),
    defineField({
      name: "nimi",
      title: "Nimi",
      description: "Näkyy sivulla julkisesti.",
      type: "string",
      validation: (rule) =>
        rule.required().min(2).max(40).error("Nimi on pakollinen (2–40 merkkiä)."),
    }),
    defineField({
      name: "teksti",
      title: "Kommentti",
      type: "text",
      rows: 4,
      validation: (rule) =>
        // Lomake rajaa 1000 merkkiin; vanhoissa blogikommenteissa on pidempiä.
        rule.max(2000).error("Kommentti saa olla enintään 2000 merkkiä.").custom((value, context) =>
          value || (context.document as { veikkaus?: { jarjestys?: unknown[] } } | undefined)?.veikkaus?.jarjestys?.length
            ? true
            : "Kirjoita kommentti tai anna veikkaus.",
        ),
    }),
    defineField({
      name: "veikkaus",
      title: "Veikkaus",
      description: "Täytetään lomakkeelta, kun uutisessa on veikkaus.",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "jarjestys",
          title: "Sijoitukset järjestyksessä",
          description: "Ensimmäinen rivi = 1. sija.",
          type: "array",
          of: [{ type: "string" }],
        }),
        defineField({
          name: "maalikuningas",
          title: "Maalikuningas",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "lahetetty",
      title: "Lähetysaika",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "lahde",
      title: "Lähde",
      type: "string",
      options: {
        list: [
          { title: "Sivuston lomake", value: "sivusto" },
          { title: "Vanha Blogspot-blogi", value: "blogspot" },
        ],
      },
      initialValue: "sivusto",
      readOnly: true,
    }),
    defineField({
      name: "blogspotId",
      title: "Blogspot-kommentin tunniste",
      type: "string",
      readOnly: true,
      hidden: ({ document }) => document?.lahde !== "blogspot",
    }),
  ],
  orderings: [
    { title: "Uusin ensin", name: "lahetettyDesc", by: [{ field: "lahetetty", direction: "desc" }] },
  ],
  preview: {
    select: {
      nimi: "nimi",
      uutinen: "uutinen.title",
      lahetetty: "lahetetty",
      piilotettu: "piilotettu",
      teksti: "teksti",
      jarjestys: "veikkaus.jarjestys",
    },
    prepare({ nimi, uutinen, lahetetty, piilotettu, teksti, jarjestys }) {
      const pvm = lahetetty ? new Date(lahetetty).toLocaleDateString("fi-FI") : "";
      const sisalto = Array.isArray(jarjestys) && jarjestys.length
        ? `Veikkaus: ${jarjestys.slice(0, 3).join(", ")}…`
        : (teksti ?? "").slice(0, 60);
      return {
        title: `${piilotettu ? "🚫 " : ""}${nimi ?? "?"} → ${uutinen ?? "?"}`,
        subtitle: [pvm, sisalto].filter(Boolean).join(" · "),
      };
    },
  },
});
