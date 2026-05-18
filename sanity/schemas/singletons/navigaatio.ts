import { defineArrayMember, defineField, defineType } from "sanity";

export const navigaatio = defineType({
  name: "navigaatio",
  title: "Navigaatio",
  type: "document",
  fields: [
    defineField({
      name: "items",
      title: "Päänavigaation linkit",
      description: "Järjestä raahaamalla. Maksimi 7 päälinkkiä.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            { name: "label", title: "Otsikko", type: "string", validation: (rule) => rule.required() },
            { name: "href", title: "Linkki (esim. /tapahtumat)", type: "string", validation: (rule) => rule.required() },
            { name: "highlight", title: "Korosta (CTA)", type: "boolean", initialValue: false },
            {
              name: "children",
              title: "Alavalikko",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    { name: "label", title: "Otsikko", type: "string", validation: (rule) => rule.required() },
                    { name: "href", title: "Linkki", type: "string", validation: (rule) => rule.required() },
                  ],
                  preview: { select: { title: "label", subtitle: "href" } },
                },
              ],
            },
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        }),
      ],
      validation: (rule) => rule.max(7).warning("Maksimi 7 päälinkkiä mobiilin luettavuuden takia."),
    }),
  ],
  preview: { prepare: () => ({ title: "Navigaatio" }) },
});
