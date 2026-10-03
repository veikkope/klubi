import { HomeIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { legacyUrlField } from "../objects/contentMeta";

export const etusivu = defineType({
  name: "etusivu",
  title: "Etusivu",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "hero", title: "Yläosa", default: true },
    { name: "blocks", title: "Lohkot" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "heroEyebrow",
      title: "Klubin nimi yläosassa",
      description:
        'Pieni rivi sivun yläreunassa, esim. "Lahden Suomalainen Klubi ry". Tämä on etusivun pääotsikko hakukoneille.',
      type: "string",
      initialValue: "Lahden Suomalainen Klubi ry",
      group: "hero",
    }),
    defineField({
      name: "heroNosto",
      title: "Pääjuttu (valinnainen)",
      description:
        "Jätä tyhjäksi, niin yläosassa näkyy aina automaattisesti uusin juttu. Valitse juttu vain, jos haluat nostaa jonkin tietyn (esim. vuosikokouskutsun) uusimman tilalle.",
      type: "reference",
      to: [{ type: "uutinen" }],
      options: { disableNew: true },
      group: "hero",
    }),
    defineField({
      name: "heroNostoAsti",
      title: "Pääjuttu näkyy asti",
      description:
        "Valinnainen. Tämän jälkeen yläosassa näkyy taas uusin juttu, eikä valintaa tarvitse muistaa poistaa.",
      type: "datetime",
      hidden: ({ parent }) => !(parent as { heroNosto?: unknown } | undefined)?.heroNosto,
      group: "hero",
    }),
    defineField({
      name: "heroLaskuri",
      title: "Näytä seuraava Huuhkajien ottelu ja laskuri",
      description:
        "Ottelu haetaan automaattisesti Ottelut-osiosta. Jos ottelua ei ole tiedossa, kohtaa ei näytetä.",
      type: "boolean",
      initialValue: true,
      group: "hero",
    }),
    defineField({
      name: "heroImage",
      title: "Taustakuva (valinnainen)",
      description:
        "Näkyy yläosan taustalla mustavalkoisena ja tummansinisen sävyn alla, joten tekstit erottuvat aina. Sama kuva näkyy, kun etusivu jaetaan somessa. Vaakakuva, vähintään 2000 px leveä; esim. katsomo- tai tifokuva. Ilman kuvaa taustalla on klubin logo.",
      type: "imageWithAlt",
      group: "hero",
    }),
    defineField({
      name: "heroCtas",
      title: "Pikalinkit",
      description:
        'Näkyvät yläosassa tuoreimpien juttujen alla, esim. "Palloveikkaus" → /palloveikkaus. Enintään neljä.',
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", title: "Teksti", type: "string", validation: (rule) => rule.required() },
            { name: "href", title: "Linkki", type: "string", validation: (rule) => rule.required() },
            // Vanhan heron korostusvalinta: uusi yläosa ei käytä sitä.
            { name: "primary", title: "Korostettu", type: "boolean", hidden: true },
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        },
      ],
      validation: (rule) => rule.max(4),
      group: "hero",
    }),
    defineField({
      name: "heroTitle",
      title: "Vanha pääotsikko",
      // Vanhan kuvaheron otsikko. Uusi yläosa ei näytä sitä; kenttä säilyy,
      // jotta vanha data pysyy validina.
      type: "string",
      hidden: true,
      group: "hero",
    }),
    defineField({
      name: "heroDescription",
      title: "Etusivun kuvaus hakukoneille",
      description:
        "Lyhyt kuvaus klubista. Näkyy Googlen hakutuloksissa ja kun etusivu jaetaan somessa. Ei näy itse sivulla.",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
      group: "seo",
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
          title: "Jutut (uusimmat uutiset)",
          type: "object",
          description: "Uusin juttu isona, seuraavat listana vieressä.",
          fields: [
            { name: "eyebrow", title: "Yläotsake", type: "string", description: "Pieni versaaliteksti otsikon yläpuolella. Näkyy vain, jos otsikko on täytetty." },
            { name: "heading", title: "Otsikko", type: "string", description: "Jätä tyhjäksi, jos osiolla ei ole näkyvää otsikkoa (jutut ja Kaikki jutut -linkki näkyvät silti)." },
            { name: "count", title: "Näytettävien määrä", type: "number", initialValue: 4, validation: (r) => r.min(1).max(6) },
          ],
          preview: {
            select: { heading: "heading" },
            prepare: ({ heading }) => ({ title: "Jutut (uusimmat uutiset)", subtitle: heading || "Ei näkyvää otsikkoa" }),
          },
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
              title: "Näytä vain Huuhkajien ja valittujen seurojen ottelut",
              description:
                "Päällä: listassa miesten maajoukkueen (Suomi) ja alla lueteltujen seurojen ottelut. Pois: kaikki Veikkausliigan ja Ottelut-osion ottelut. Koskee vain etusivua; /ottelut-sivulla näkyvät aina vain Huuhkajat ja alla luetellut seurat.",
              type: "boolean",
              initialValue: true,
            },
            {
              name: "seurat",
              title: "Näytä myös näiden seurojen ottelut",
              description:
                'Kirjoita seuran nimi kuten Veikkausliigan sivuilla, esim. "FC Lahti". Ottelut haetaan automaattisesti. Sama lista rajaa myös /ottelut-sivun. Tyhjä lista = vain Huuhkajat.',
              type: "array",
              of: [{ type: "string" }],
              options: { layout: "tags" },
              initialValue: ["FC Lahti"],
            },
            {
              name: "laskuri",
              title: "Näytä laskuri seuraavaan Huuhkajien otteluun",
              // Laskuri on siirtynyt etusivun yläosaan (Yläosa-välilehti).
              // Kenttä säilyy, jotta vanha data pysyy validina.
              type: "boolean",
              hidden: true,
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
          description: "Tuoreimmin arvioidut ravintolat kortteina (viimeisin käynti ensin).",
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
      ],
      group: "blocks",
    }),
    legacyUrlField("seo"),
  ],
  preview: { prepare: () => ({ title: "Etusivu" }) },
});
