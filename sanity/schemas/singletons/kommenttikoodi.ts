import { LockIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

/**
 * Klubin yhteinen koodisana kommenttien ja veikkausten lähettämiseen (docs/15 §3.3).
 *
 * Dokumentin id on `secrets.kommenttikoodi`. Pisteen sisältävät id:t eivät näy
 * julkisen datasetin kirjautumattomille pyynnöille (testattu 2026-09-28), joten
 * koodi ei vuoda sivuston API:sta. Palvelin lukee sen tokenilla.
 */
export const KOMMENTTIKOODI_ID = "secrets.kommenttikoodi";

export const kommenttikoodi = defineType({
  name: "kommenttikoodi",
  title: "Kommenttien koodisana",
  type: "document",
  icon: LockIcon,
  fields: [
    defineField({
      name: "koodi",
      title: "Koodisana",
      description:
        "Jäsenet kirjoittavat tämän sanan, kun he jättävät kommentin tai veikkauksen. " +
        "Kerro sana jäsenille esim. vuosikokouksessa tai sähköpostilla. Kirjainkoolla " +
        "ei ole väliä. Vaihda sana, jos sivulle alkaa tulla roskaviestejä.",
      type: "string",
      validation: (rule) =>
        rule.required().min(4).max(40).error("Koodisanan pitää olla 4–40 merkkiä."),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Kommenttien koodisana" }),
  },
});
