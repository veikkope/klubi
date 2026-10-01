import { defineField, defineType } from "sanity";

/**
 * Kuva, jolla on päivämäärä: esim. patsaskuvat, jotka näytetään aikajärjestyksessä.
 * Päivämäärä on oma kenttänsä, jotta järjestys ei riipu kuvatekstin kirjoitusasusta.
 */
export const paivattyKuva = defineType({
  name: "paivattyKuva",
  title: "Päivätty kuva",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Vaihtoehtoinen teksti (alt)",
      description:
        "Pakollinen saavutettavuuden vuoksi. Kuvaile mitä kuvassa näkyy 1–2 lauseessa.",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .min(3)
          .max(200)
          .error("Alt-teksti on pakollinen (3–200 merkkiä)."),
    }),
    defineField({
      name: "caption",
      title: "Kuvateksti (valinnainen)",
      description: "Näkyy kuvan alla ja suurennetussa kuvassa.",
      type: "string",
    }),
    defineField({
      name: "paivamaara",
      title: "Kuvauspäivä",
      description: "Kuvat järjestetään tämän mukaan, tuorein ensin.",
      type: "date",
      validation: (rule) =>
        rule.required().warning("Ilman päivämäärää kuva näytetään listan lopussa."),
    }),
  ],
  preview: {
    select: { title: "caption", alt: "alt", paivamaara: "paivamaara", media: "asset" },
    prepare({ title, alt, paivamaara, media }) {
      const pvm = paivamaara ? paivamaara.split("-").reverse().join(".") : "Ei päivämäärää";
      return { title: title || alt || "Kuva", subtitle: pvm, media };
    },
  },
});
