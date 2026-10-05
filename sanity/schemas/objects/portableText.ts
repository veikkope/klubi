import { defineArrayMember, defineType } from "sanity";

import { tarkistaLinkki } from "../../../lib/linkki";

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
                description:
                  "Ulkoinen osoite (https://…) tai sivuston oma polku (/jalkapalloarkisto/…).",
                // allowRelative: migraatio muuntaa vanhat .htm-linkit sisäisiksi
                // poluiksi (docs/12 §2.1.3), jotka eivät ole absoluuttisia URL:eja.
                // Pelkkä uri() hyväksyisi myös "www.palloliitto.fi" suhteellisena
                // polkuna (→ 404), joten alku tarkistetaan erikseen (lib/linkki.ts).
                validation: (rule) => [
                  rule
                    .uri({
                      scheme: ["http", "https", "mailto", "tel"],
                      allowRelative: true,
                    })
                    .error("Tarkista linkki: https://…, mailto:, tel: tai /polku."),
                  rule.custom<string>((href) => tarkistaLinkki(href)),
                ],
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
    // Avauskokoonpanot ym. pelikentälle piirrettynä (components/kokoonpano.tsx).
    defineArrayMember({ type: "kokoonpano" }),
    // YouTube-video esikatselukuvana; soitin latautuu vasta painalluksesta.
    defineArrayMember({ type: "youtubeVideo" }),
  ],
});
