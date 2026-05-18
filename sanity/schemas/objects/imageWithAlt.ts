import { defineField, defineType } from "sanity";

export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Kuva",
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
      description: "Näkyy kuvan alla.",
      type: "string",
    }),
  ],
});
