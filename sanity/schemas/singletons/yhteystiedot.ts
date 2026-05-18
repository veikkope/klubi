import { defineField, defineType } from "sanity";

export const yhteystiedot = defineType({
  name: "yhteystiedot",
  title: "Yhteystiedot",
  type: "document",
  fields: [
    defineField({
      name: "address",
      title: "Katuosoite",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "postalCode",
      title: "Postinumero",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "city",
      title: "Kaupunki",
      type: "string",
      initialValue: "Lahti",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "email",
      title: "Yleinen sähköposti",
      type: "email",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "phone",
      title: "Puhelin",
      type: "string",
    }),
    defineField({
      name: "yTunnus",
      title: "Y-tunnus",
      type: "string",
    }),
    defineField({
      name: "iban",
      title: "IBAN",
      type: "string",
    }),
    defineField({
      name: "socials",
      title: "Sosiaaliset mediat",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "platform",
              title: "Alusta",
              type: "string",
              options: {
                list: [
                  { title: "YouTube", value: "youtube" },
                  { title: "Facebook", value: "facebook" },
                  { title: "Instagram", value: "instagram" },
                  { title: "LinkedIn", value: "linkedin" },
                  { title: "X / Twitter", value: "x" },
                ],
              },
              validation: (rule) => rule.required(),
            },
            { name: "url", title: "URL", type: "url", validation: (rule) => rule.required() },
          ],
          preview: { select: { title: "platform", subtitle: "url" } },
        },
      ],
    }),
    defineField({
      name: "location",
      title: "Karttapaikka",
      type: "geopoint",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Yhteystiedot" }),
  },
});
