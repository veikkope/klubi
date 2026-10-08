import { defineArrayMember, defineType } from "sanity";

import { tarkistaLinkki } from "../../../lib/linkki";
import { PERUSLOHKOT } from "../../../lib/sisaltolohkot";
import { linkinKohdeVaroitus } from "../../lib/linkin-kohde";

/**
 * Tekstikappaleet: tyylit, listat, korostukset ja linkki. Yhteinen jäsen
 * tavalliselle `portableText`-kentälle ja `rikasSisalto`lle (docs/24 askel 2).
 */
export const tekstiLohko = defineArrayMember({
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
              linkinKohdeVaroitus(rule),
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
});

/**
 * Tavallinen tekstikenttä (sivu, arkisto, ravintola-arvio, lehtileike,
 * tilastojen johdannot …): kuva, kokoonpano ja YouTube-video (`PERUSLOHKOT`).
 * Uutisen, tapahtuman ja klubin toiminnan teksti on `rikasSisalto`
 * (kuvasarja ym.); sivu siirtyy siihen askeleessa 6 (docs/24).
 */
export const portableText = defineType({
  name: "portableText",
  title: "Sisältö",
  type: "array",
  // Kuva, kokoonpano (pelikentälle piirretty avauskokoonpano) ja YouTube-video
  // (soitin latautuu vasta painalluksesta).
  of: [tekstiLohko, ...PERUSLOHKOT.map((type) => defineArrayMember({ type }))],
});
