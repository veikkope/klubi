import { CalendarIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { seoFields } from "../objects/seoFields";
import {
  aiemmatPolutField,
  legacyUrlField,
  needsReviewField,
  polkuMuuttunut,
  tarkistettavaaField,
  tiivistelmaField,
} from "../objects/contentMeta";
import { HAKUKONEET_RYHMA, OSOITE_OTSIKKO } from "../objects/sanasto";

export const tapahtuma = defineType({
  name: "tapahtuma",
  title: "Tapahtuma",
  type: "document",
  icon: CalendarIcon,
  groups: [
    { name: "perustiedot", title: "Perustiedot", default: true },
    { name: "ilmoittautuminen", title: "Ilmoittautuminen" },
    HAKUKONEET_RYHMA,
  ],
  fields: [
    defineField({
      name: "title",
      title: "Tapahtuman nimi",
      type: "string",
      validation: (rule) => rule.required(),
      group: "perustiedot",
    }),
    defineField({
      name: "slug",
      title: OSOITE_OTSIKKO,
      description: "Muodostuu otsikosta: paina Luo. Tapahtuman osoite on /tapahtumat/tämä-osa. Jos muutat julkaistun tapahtuman osoitetta, vanha osoite ohjautuu uuteen automaattisesti.",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => [rule.required(), polkuMuuttunut(rule)],
      group: "perustiedot",
    }),
    tiivistelmaField("perustiedot"),
    defineField({
      name: "startsAt",
      title: "Alkamisaika",
      type: "datetime",
      validation: (rule) => rule.required().error("Alkamisaika on pakollinen."),
      group: "perustiedot",
    }),
    defineField({
      name: "endsAt",
      title: "Päättymisaika",
      description: "Valinnainen. Tapahtuma näkyy tulevana päättymisaikaan asti.",
      type: "datetime",
      validation: (rule) =>
        rule.custom((value, context) => {
          const alku = (context.document as { startsAt?: string } | undefined)?.startsAt;
          return !value || !alku || value >= alku
            ? true
            : "Päättymisaika ei voi olla ennen alkamisaikaa.";
        }),
      group: "perustiedot",
    }),
    defineField({
      name: "location",
      title: "Paikka",
      description: 'Esim. "Klubin tila, Vapaudenkatu 12, Lahti"',
      type: "string",
      group: "perustiedot",
    }),
    defineField({
      name: "juhla",
      title: "Juhlatapahtuma",
      description:
        "Valitse vain juhlille ja merkkipäiville (esim. itsenäisyyspäivä, vuosijuhla). Kortti saa messingin värisen korostuksen. Käytä harvoin — korostus menettää merkityksensä, jos sitä on joka kortissa.",
      type: "boolean",
      initialValue: false,
      group: "perustiedot",
    }),
    defineField({
      name: "image",
      title: "Kansikuva",
      type: "imageWithAlt",
      group: "perustiedot",
    }),
    defineField({
      name: "description",
      title: "Kuvaus",
      type: "rikasSisalto",
      validation: (rule) => rule.required(),
      group: "perustiedot",
    }),
    defineField({
      name: "signupUrl",
      title: "Ilmoittautumislinkki",
      description: "Ulkoinen ilmoittautumissivu (esim. lomake).",
      type: "url",
      group: "ilmoittautuminen",
    }),
    defineField({
      name: "signupEmail",
      title: "Ilmoittautumis-sähköposti",
      type: "email",
      group: "ilmoittautuminen",
    }),
    needsReviewField("perustiedot"),
    tarkistettavaaField("perustiedot"),
    ...seoFields,
    legacyUrlField("seo"),
    aiemmatPolutField("seo"),
  ],
  orderings: [
    {
      title: "Alkamisajan mukaan (uusimmat ensin)",
      name: "startsAtDesc",
      by: [{ field: "startsAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", date: "startsAt", media: "image" },
    prepare({ title, date, media }) {
      const formatted = date
        ? new Date(date).toLocaleString("fi-FI", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Ei alkamisaikaa";
      return { title, subtitle: formatted, media };
    },
  },
});
