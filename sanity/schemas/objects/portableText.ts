import { LinkIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

import { linkinTyyppi } from "../../../lib/linkki";
import { PERUSLOHKOT } from "../../../lib/sisaltolohkot";
import { linkkiKentat } from "./linkki";

/**
 * Tekstin linkki (docs/24 askel 4): sama "Mihin linkki vie?" -valinta kuin
 * valikossa ja etusivulla. Annotaation nimi `link` ja vanha `href` säilyvät,
 * joten vanhat linkit ovat sellaisenaan kelvollisia (Muu osoite).
 */
export const tekstinLinkki = {
  name: "link",
  type: "object",
  title: "Linkki",
  icon: LinkIcon,
  fields: [
    ...linkkiKentat({ pakollinen: true }),
    defineField({
      name: "newTab",
      type: "boolean",
      title: "Avaa uuteen välilehteen",
      initialValue: false,
      // Vain muulle osoitteelle ja tiedostolle: sivuston oma sivu avautuu aina samaan välilehteen.
      hidden: ({ parent }) => {
        const tyyppi = linkinTyyppi(parent as { tyyppi?: string; href?: string });
        return tyyppi !== "osoite" && tyyppi !== "tiedosto";
      },
    }),
  ],
};

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
    annotations: [tekstinLinkki],
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
