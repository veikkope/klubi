import { defineArrayMember, defineType } from "sanity";

export const portableText = defineType({
  name: "portableText",
  title: "Sisältö",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Leipäteksti", value: "normal" },
        { title: "Otsikko 2", value: "h2" },
        { title: "Otsikko 3", value: "h3" },
        { title: "Otsikko 4", value: "h4" },
        { title: "Lainaus", value: "blockquote" },
      ],
      lists: [
        { title: "Luettelo", value: "bullet" },
        { title: "Numeroitu", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Lihava", value: "strong" },
          { title: "Kursiivi", value: "em" },
          { title: "Alleviivattu", value: "underline" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Linkki",
            fields: [
              {
                name: "href",
                type: "url",
                title: "URL",
                validation: (rule) =>
                  rule.uri({ scheme: ["http", "https", "mailto", "tel"] }),
              },
              {
                name: "newTab",
                type: "boolean",
                title: "Avaa uuteen välilehteen",
                initialValue: false,
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({ type: "imageWithAlt" }),
  ],
});
