import { DatabaseIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

/**
 * Viikoittainen automaattinen varmuuskopio (app/api/varmuuskopio, docs/17 §D).
 *
 * Syntyy Vercelin ajastuksesta, ei käsin. Kaikki kentät ovat vain luettavia:
 * Studiossa kopion voi ladata (tiedostokentän ⋯ → Lataa), mutta ei muuttaa.
 * Vanhimmat poistuvat automaattisesti, kun kopioita on yli 12.
 */
export const varmuuskopio = defineType({
  name: "varmuuskopio",
  title: "Varmuuskopio",
  type: "document",
  icon: DatabaseIcon,
  readOnly: true,
  fields: [
    defineField({
      name: "paiva",
      title: "Päivä",
      type: "date",
    }),
    defineField({
      name: "tiedosto",
      title: "Tiedosto",
      description:
        "Sivuston julkaistu sisältö (tekstit ja tiedot, ei kuvia) yhtenä tiedostona. " +
        "Lataa halutessasi talteen klubin omaan pilveen. Palautuksen tekee kehittäjä.",
      type: "file",
    }),
    defineField({
      name: "dokumentteja",
      title: "Dokumentteja",
      type: "number",
    }),
  ],
  orderings: [{ title: "Uusin ensin", name: "paivaDesc", by: [{ field: "paiva", direction: "desc" }] }],
  preview: {
    select: { paiva: "paiva", dokumentteja: "dokumentteja" },
    prepare({ paiva, dokumentteja }) {
      return {
        title: paiva ? new Date(`${paiva}T12:00:00`).toLocaleDateString("fi-FI") : "Varmuuskopio",
        subtitle: dokumentteja ? `${dokumentteja} dokumenttia` : undefined,
      };
    },
  },
});
