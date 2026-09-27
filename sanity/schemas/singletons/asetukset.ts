import { defineField, defineType } from "sanity";

export const asetukset = defineType({
  name: "asetukset",
  title: "Sivuston asetukset",
  type: "document",
  fields: [
    defineField({
      name: "siteName",
      title: "Sivuston nimi",
      type: "string",
      initialValue: "Lahden Suomalainen Klubi ry",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Slogan / alaotsikko",
      type: "string",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      fields: [
        defineField({
          name: "alt",
          title: "Vaihtoehtoinen teksti (alt)",
          description:
            'Mitä logossa lukee tai mitä se esittää, esim. "Lahden Suomalainen Klubi ry:n logo". Ruudunlukija lukee tämän.',
          type: "string",
          validation: (rule) =>
            rule.custom((value, context) =>
              (context.parent as { asset?: unknown } | undefined)?.asset && !value
                ? "Kirjoita logolle vaihtoehtoinen teksti."
                : true,
            ),
        }),
      ],
    }),
    defineField({
      name: "favicon",
      title: "Favicon",
      type: "image",
    }),
    defineField({
      name: "defaultOgImage",
      title: "Oletus-OG-kuva",
      description: "Käytetään jakolinkkien esikatselussa, kun sivulla ei ole omaa.",
      type: "imageWithAlt",
    }),
    defineField({
      name: "defaultSeoDescription",
      title: "Oletus-SEO-kuvaus",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "heroFallback",
      title: "Hero-varakuva",
      type: "imageWithAlt",
    }),
  ],
  preview: { prepare: () => ({ title: "Sivuston asetukset" }) },
});
