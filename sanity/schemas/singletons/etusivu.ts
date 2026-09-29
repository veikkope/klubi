import { HomeIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { legacyUrlField } from "../objects/contentMeta";

export const etusivu = defineType({
  name: "etusivu",
  title: "Etusivu",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "hero", title: "Hero-alue", default: true },
    { name: "blocks", title: "Lohkot" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "heroEyebrow",
      title: "Hero — yläteksti",
      description: 'Pieni teksti otsikon yläpuolella, esim. "Lahden Suomalainen Klubi ry"',
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero — pääotsikko",
      type: "string",
      initialValue: "Lahden Suomalainen Klubi",
      validation: (rule) => rule.required(),
      group: "hero",
    }),
    defineField({
      name: "heroDescription",
      title: "Hero — kuvaus",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
      group: "hero",
    }),
    defineField({
      name: "heroImage",
      title: "Hero — kuva (valinnainen)",
      description:
        "Koko heron taustakuva, jonka päällä on yönsininen sävy. Teksti on vasemmalla, joten kuvan tärkein kohta kannattaa olla keskellä tai oikealla. Käytä vaakakuvaa, vähintään 2000 px leveää. Valitse polttopiste (Hotspot), niin kapealla näytöllä rajaus osuu oikeaan kohtaan.",
      type: "imageWithAlt",
      group: "hero",
    }),
    defineField({
      name: "heroCtas",
      title: "Hero — linkit",
      description:
        "Näkyvät alleviivattuina tekstilinkkeinä (esim. \"Tulevat ottelut\", \"Lue klubista\"). Pääpainike-valinta näyttää linkin valkoisena, muut vaaleampina.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", title: "Teksti", type: "string", validation: (rule) => rule.required() },
            { name: "href", title: "Linkki", type: "string", validation: (rule) => rule.required() },
            { name: "primary", title: "Korostettu (valkoinen)", type: "boolean", initialValue: false },
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        },
      ],
      validation: (rule) => rule.max(2),
      group: "hero",
    }),
    defineField({
      name: "seuraavaOttelu",
      title: "Seuraava ottelu",
      description:
        'Vanhan etusivun "Seuraavaksi" -nosto ja laskuri, esim. "Suomi – Valko-Venäjä, Kansojen liiga". ' +
        "Jätä tyhjäksi, kun ottelua ei ole tiedossa.",
      type: "object",
      // Korvattu etusivun otteluohjelmalla (Otteluohjelma ja tapahtumat -lohko).
      // Vanhentunut kenttä: säilyy, jotta vanha data pysyy validina, mutta näkyy
      // (lukittuna, varoituksen kera) vain jos sillä on jo arvo.
      deprecated: {
        reason: 'Korvattu etusivun "Otteluohjelma ja tapahtumat" -lohkolla. Lisää tulevat ottelut Ottelut-osioon.',
      },
      readOnly: true,
      hidden: ({ value }) => value === undefined,
      initialValue: undefined,
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "ottelu",
          title: "Ottelu",
          description: 'Esim. "Suomi – Valko-Venäjä".',
          type: "string",
        }),
        defineField({
          name: "kilpailu",
          title: "Kilpailu",
          description: 'Esim. "Kansojen liiga" tai "MM-karsinta".',
          type: "string",
        }),
        defineField({
          name: "aika",
          title: "Alkamisaika",
          type: "datetime",
          validation: (rule) =>
            rule.custom((value, context) =>
              value || !(context.parent as { ottelu?: string } | undefined)?.ottelu
                ? true
                : "Anna ottelun alkamisaika."
            ),
        }),
      ],
      group: "hero",
    }),
    defineField({
      name: "blocks",
      title: "Etusivun lohkot (järjestyksessä)",
      description: "Lisää, järjestä ja piilota lohkoja vetämällä.",
      type: "array",
      of: [
        defineArrayMember({
          name: "uutiset",
          title: "Jutut (Kentältä ja katsomosta)",
          type: "object",
          description: "Uusin juttu isona, seuraavat listana vieressä.",
          fields: [
            { name: "eyebrow", title: "Yläotsake", type: "string", description: "Pieni versaaliteksti otsikon yläpuolella.", initialValue: "Jalkapallo" },
            { name: "heading", title: "Otsikko", type: "string", initialValue: "Kentältä ja katsomosta" },
            { name: "count", title: "Näytettävien määrä", type: "number", initialValue: 4, validation: (r) => r.min(1).max(6) },
          ],
          preview: { prepare: () => ({ title: "Jutut (Kentältä ja katsomosta)" }) },
        }),
        defineArrayMember({
          name: "otteluohjelma",
          title: "Otteluohjelma ja tapahtumat",
          type: "object",
          description:
            "Vasemmalla tulevat ottelut (haetaan automaattisesti), oikealla klubin omat tapahtumat. Jos toinen puoli on tyhjä, toinen täyttää koko leveyden.",
          fields: [
            { name: "ottelutHeading", title: "Otteluiden otsikko", type: "string", initialValue: "Tulevat ottelut" },
            { name: "ottelutCount", title: "Otteluiden määrä", type: "number", initialValue: 4, validation: (r) => r.min(1).max(10) },
            {
              name: "vainMaajoukkue",
              title: "Näytä vain Huuhkajien ottelut",
              description:
                "Päällä: listassa vain miesten maajoukkueen ottelut (Suomi). Pois: myös Veikkausliiga ja muut Ottelut-osion ottelut. Koskee vain etusivua; /ottelut-sivulla näkyy aina koko ohjelma.",
              type: "boolean",
              initialValue: true,
            },
            {
              name: "laskuri",
              title: "Näytä laskuri seuraavaan Huuhkajien otteluun",
              description:
                "Laskuri lasketaan automaattisesti Ottelut-osion seuraavasta Suomen ottelusta. Jos ottelua ei ole tiedossa, laskuria ei näytetä.",
              type: "boolean",
              initialValue: true,
            },
            { name: "tapahtumatHeading", title: "Tapahtumien otsikko", type: "string", initialValue: "Nähdään" },
            { name: "tapahtumatCount", title: "Tapahtumien määrä", type: "number", initialValue: 3, validation: (r) => r.min(1).max(6) },
          ],
          preview: { prepare: () => ({ title: "Otteluohjelma ja tapahtumat" }) },
        }),
        defineArrayMember({
          name: "tapahtumat",
          title: "Tulevat tapahtumat",
          type: "object",
          fields: [
            { name: "heading", title: "Otsikko", type: "string", initialValue: "Tulevat tapahtumat" },
            { name: "count", title: "Näytettävien määrä", type: "number", initialValue: 3, validation: (r) => r.min(1).max(6) },
          ],
          preview: { prepare: () => ({ title: "Tulevat tapahtumat" }) },
        }),
        defineArrayMember({
          name: "esittely",
          title: "Esittelyteksti (Klubista)",
          type: "object",
          description: "Kuva vasemmalla, teksti oikealla.",
          fields: [
            { name: "eyebrow", title: "Yläotsake", type: "string", description: "Pieni versaaliteksti otsikon yläpuolella.", initialValue: "Klubista" },
            { name: "heading", title: "Otsikko", type: "string" },
            { name: "body", title: "Teksti", type: "portableText" },
            { name: "image", title: "Kuva", type: "imageWithAlt" },
            { name: "ctaLabel", title: "Linkin teksti", type: "string", description: 'Esim. "Lue lisää klubista".' },
            { name: "ctaHref", title: "Linkin osoite", type: "string" },
          ],
          preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "Esittelyteksti" }) },
        }),
        defineArrayMember({
          name: "ravintolatSpotlight",
          title: "Ravintola-arviot",
          type: "object",
          description: "Parhaiten arvioidut ravintolat kortteina.",
          fields: [
            { name: "eyebrow", title: "Yläotsake", type: "string", description: "Pieni versaaliteksti otsikon yläpuolella.", initialValue: "Ravintola-arviot" },
            { name: "heading", title: "Otsikko", type: "string", initialValue: "Missä pelipäivänä syödään" },
            { name: "city", title: "Kaupunki (suodatin, valinnainen)", type: "reference", to: [{ type: "kaupunki" }] },
            { name: "count", title: "Näytettävien määrä", type: "number", initialValue: 3, validation: (r) => r.min(1).max(9) },
          ],
          preview: { prepare: () => ({ title: "Ravintola-arviot" }) },
        }),
        defineArrayMember({
          name: "jalkapalloarkisto",
          title: "Jalkapalloarkisto-nosto",
          type: "object",
          fields: [
            {
              name: "heading",
              title: "Otsikko",
              type: "string",
              initialValue: "Jalkapalloarkisto",
            },
            {
              name: "body",
              title: "Teksti",
              type: "text",
              rows: 2,
              description: "Lyhyt kuvaus siitä, mitä arkisto sisältää.",
            },
            {
              name: "ctaLabel",
              title: "Napin teksti",
              type: "string",
              initialValue: "Selaa arkistoa",
            },
            {
              name: "ctaHref",
              title: "Napin linkki",
              type: "string",
              initialValue: "/jalkapalloarkisto",
            },
          ],
          preview: {
            select: { title: "heading" },
            prepare: ({ title }) => ({ title: title || "Jalkapalloarkisto-nosto" }),
          },
        }),
        defineArrayMember({
          name: "galleria",
          title: "Galleria-nosto",
          type: "object",
          fields: [
            {
              name: "heading",
              title: "Otsikko",
              type: "string",
              initialValue: "Kuvagalleria",
            },
            {
              name: "count",
              title: "Näytettävien albumien määrä",
              type: "number",
              initialValue: 3,
              validation: (r) => r.min(1).max(6),
            },
          ],
          preview: { prepare: () => ({ title: "Galleria-nosto" }) },
        }),
        defineArrayMember({
          name: "cta",
          // Tyyliopas: ei liittymis- tai uutiskirjekehotteita. Tyyppi säilyy,
          // jotta vanha data pysyy validina, mutta sitä ei suositella.
          title: "CTA-lohko (vanha — ei käytössä)",
          type: "object",
          fields: [
            { name: "heading", title: "Otsikko", type: "string", validation: (r) => r.required() },
            { name: "body", title: "Teksti", type: "text", rows: 2 },
            { name: "ctaLabel", title: "Napin teksti", type: "string", validation: (r) => r.required() },
            { name: "ctaHref", title: "Napin linkki", type: "string", validation: (r) => r.required() },
          ],
          preview: { select: { title: "heading" } },
        }),
      ],
      group: "blocks",
    }),
    legacyUrlField("seo"),
  ],
  preview: { prepare: () => ({ title: "Etusivu" }) },
});
