import { defineField, defineType } from "sanity";

/**
 * Ottelu otteluohjelmaan.
 *
 * Veikkausliigan ottelut haetaan automaattisesti (lib/ottelut.ts), joten niitä
 * ei tarvitse lisätä käsin. Tähän lisätään:
 *  - ottelut joita automaattinen haku ei kata (esim. maajoukkue, cup)
 *  - Huuhkajien (miesten maajoukkue) ottelut: joukkueeksi kirjoitetaan "Suomi",
 *    jolloin ottelu korostetaan; kotiottelut merkitään automaattisesti
 *    "Klubi paikalla"
 *  - klubin merkinnät ("Klubi paikalla", "Vierasmatka") mihin tahansa
 *    otteluun — myös automaattisesti haettuun. Merkintä yhdistyy
 *    automaattiseen otteluun, kun päivä ja joukkueet täsmäävät.
 */
export const ottelu = defineType({
  name: "ottelu",
  title: "Ottelu",
  type: "document",
  fields: [
    defineField({
      name: "aika",
      title: "Alkamisaika",
      type: "datetime",
      options: { timeStep: 15 },
      validation: (rule) => rule.required().error("Anna ottelun alkamisaika."),
    }),
    defineField({
      name: "koti",
      title: "Kotijoukkue",
      description:
        'Kirjoita kuten Veikkausliigan sivuilla, esim. "FC Lahti". Huuhkajien ottelussa kirjoita "Suomi" — ottelu korostetaan, ja Suomen kotiottelu merkitään automaattisesti "Klubi paikalla". Muille maajoukkueille tarkenne, esim. "Suomi (naiset)" tai "Suomi U21".',
      type: "string",
      validation: (rule) => rule.required().error("Anna kotijoukkue."),
    }),
    defineField({
      name: "vieras",
      title: "Vierasjoukkue",
      type: "string",
      validation: (rule) => rule.required().error("Anna vierasjoukkue."),
    }),
    defineField({
      name: "kilpailu",
      title: "Kilpailu",
      description: 'Esim. "Veikkausliiga", "Suomen Cup" tai "Maaottelu".',
      type: "string",
    }),
    defineField({
      name: "stadion",
      title: "Stadion",
      description: 'Esim. "Lahden stadion" tai "Olympiastadion, Helsinki".',
      type: "string",
    }),
    defineField({
      name: "klubiPaikalla",
      title: "Klubi paikalla",
      description:
        "Klubilaisia on menossa katsomoon. Näkyy sinisenä merkkinä otteluohjelmassa. Huuhkajien kotiotteluissa merkintä tulee automaattisesti; vieraspeliin valitse se tästä, jos klubi lähtee mukaan.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "vierasmatka",
      title: "Vierasmatka",
      description: "Klubi järjestää yhteisen matkan. Näkyy merkkinä otteluohjelmassa.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [
    { title: "Alkamisajan mukaan", name: "aikaAsc", by: [{ field: "aika", direction: "asc" }] },
  ],
  preview: {
    select: { koti: "koti", vieras: "vieras", aika: "aika", paikalla: "klubiPaikalla", matka: "vierasmatka" },
    prepare({ koti, vieras, aika, paikalla, matka }) {
      const pvm = aika
        ? new Intl.DateTimeFormat("fi-FI", {
            weekday: "short",
            day: "numeric",
            month: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/Helsinki",
          }).format(new Date(aika))
        : "Ei aikaa";
      const merkinnat = [paikalla && "Klubi paikalla", matka && "Vierasmatka"].filter(Boolean);
      return {
        title: `${koti ?? "?"} – ${vieras ?? "?"}`,
        subtitle: [pvm, ...merkinnat].join(" · "),
      };
    },
  },
});
