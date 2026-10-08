import { BarChartIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { HUUHKAJAT_OSIOT, osioLiittyyKauteen } from "../../../lib/huuhkajat-osiot";
import { MESTARUUSMAAT } from "../../../lib/ulkomaiset-mestarit";
import { TilastoDokumenttiInput } from "../../components/taulukkoeditori/konteksti";
import { TaulukkoEditori } from "../../components/taulukkoeditori/TaulukkoEditori";
import { seoFields } from "../objects/seoFields";
import {
  legacyUrlField,
  muutLegacyUrlitField,
  needsReviewField,
  tarkistettavaaField,
  tiivistelmaField,
  polkuMuuttunut,
} from "../objects/contentMeta";
import { HAKUKONEET_RYHMA, OSOITE_OTSIKKO } from "../objects/sanasto";

export const jalkapalloTilasto = defineType({
  name: "jalkapalloTilasto",
  title: "Jalkapallotilasto",
  type: "document",
  icon: BarChartIcon,
  // Taulukkoeditori muokkaa sekä sarakkeita että rivejä (docs/19).
  components: { input: TilastoDokumenttiInput },
  groups: [
    { name: "perustiedot", title: "Perustiedot", default: true },
    { name: "data", title: "Tilastodata" },
    HAKUKONEET_RYHMA,
  ],
  fields: [
    defineField({
      name: "title",
      title: "Otsikko",
      type: "string",
      validation: (rule) => rule.required(),
      group: "perustiedot",
    }),
    defineField({
      name: "slug",
      title: OSOITE_OTSIKKO,
      description: "Taulukon tunniste osoitteessa. (Aiemmin kentän nimi oli Polku.)",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => [rule.required(), polkuMuuttunut(rule)],
      group: "perustiedot",
    }),
    tiivistelmaField("perustiedot"),
    defineField({
      name: "category",
      title: "Kategoria",
      description: "Vaikuttaa siihen, miten tilasto näytetään sivulla.",
      type: "string",
      options: {
        list: [
          { title: "FIFA-ranking", value: "fifa-ranking" },
          { title: "Suomen mestarit", value: "champions" },
          { title: "Huuhkajat (maajoukkueen tilastot)", value: "huuhkajat" },
          { title: "Huuhkajien valmentajat", value: "valmentajat" },
          { title: "Valmentajien palkat", value: "valmentajien-palkat" },
          { title: "Vuoden pelaaja", value: "vuoden-pelaaja" },
          { title: "Lupaavat pelaajat", value: "lupaavat" },
          { title: "Ballon d'Or", value: "ballon-dor" },
          { title: "Maailman paras avaus", value: "maailman-parhaat" },
          { title: "Suomen jalkapallon saavutukset", value: "saavutukset" },
          { title: "Suomen jalkapallon järkytykset", value: "jarkytykset" },
          { title: "Champions League / Eurocup", value: "eurocup" },
          { title: "Europa League / UEFA Cup", value: "uefa-cup" },
          { title: "UEFA Super Cup", value: "super-cup" },
          { title: "Conference League / Cup Winners' Cup", value: "conference-league" },
          { title: "Intercontinental / Club World Cup", value: "intercontinental" },
          { title: "Karsinta", value: "karsinta" },
          { title: "Arvokisatilasto (MM, EM, Kansojen liiga)", value: "arvokisa" },
          { title: "Pelaajatilasto (yksittäinen pelaaja)", value: "pelaaja" },
          { title: "Ulkomaiden mestarit (Englanti, Venäjä …)", value: "ulkomaiset-mestarit" },
          { title: "Palloliiton puheenjohtajat", value: "palloliitto" },
          { title: "Klubin omat tilastot (veikkaus, mölkky, jouluruokailu)", value: "klubi" },
          { title: "Muu tilasto", value: "muu" },
        ],
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
      group: "perustiedot",
    }),
    defineField({
      name: "huuhkajatOsio",
      title: "Osio Huuhkajat-sivulla",
      description:
        "Minkä otsikon alle taulukko kuuluu. Jokaisella osiolla on oma sivunsa, " +
        "ja samaan osioon kuuluvat taulukot näytetään yhdessä.",
      type: "string",
      options: {
        list: HUUHKAJAT_OSIOT.map((osio) => ({ title: osio.title, value: osio.value })),
        layout: "radio",
      },
      hidden: ({ document }) => document?.category !== "huuhkajat",
      validation: (rule) =>
        rule.custom((value, context) =>
          context.document?.category === "huuhkajat" && !value
            ? "Valitse osio, jotta taulukko löytyy oikean otsikon alta."
            : true,
        ),
      group: "perustiedot",
    }),
    defineField({
      name: "kaudenOttelut",
      title: "Kauden ottelut ja tulokset",
      description:
        "Karsintasivu, jolla saman kauden ottelut ovat (esim. Suomen ottelut " +
        "2026–2027 ja EM 2028 -karsinta). Sarjataulukko näytetään myös sillä " +
        "sivulla, ja taulukon alta linkitetään otteluihin.",
      type: "reference",
      to: [{ type: "jalkapalloTilasto" }],
      options: { filter: 'category == "karsinta"', disableNew: true },
      hidden: ({ document }) =>
        document?.category !== "huuhkajat" ||
        !osioLiittyyKauteen(document?.huuhkajatOsio as string | undefined),
      validation: (rule) =>
        rule
          .custom((value, context) =>
            context.document?.category === "huuhkajat" &&
            osioLiittyyKauteen(context.document?.huuhkajatOsio as string | undefined) &&
            !value
              ? "Valitse kauden karsintasivu, jotta sarjataulukko ja ottelut näkyvät yhdessä."
              : true,
          )
          .warning(),
      group: "perustiedot",
    }),
    defineField({
      name: "mestaruusmaa",
      title: "Maa Ulkomaiset mestarit -sivulla",
      description:
        "Minkä maan valikon alle taulukko kuuluu. Jokaisella maalla on oma sivunsa.",
      type: "string",
      options: {
        list: MESTARUUSMAAT.map((maa) => ({ title: maa.title, value: maa.value })),
        layout: "radio",
      },
      hidden: ({ document }) => document?.category !== "ulkomaiset-mestarit",
      validation: (rule) =>
        rule
          .custom((value, context) =>
            context.document?.category === "ulkomaiset-mestarit" && !value
              ? "Valitse maa, jotta taulukko löytyy oikean valikon alta."
              : true,
          )
          .warning(),
      group: "perustiedot",
    }),
    defineField({
      name: "intro",
      title: "Johdanto",
      type: "portableText",
      group: "perustiedot",
    }),
    defineField({
      name: "columns",
      title: "Taulukon sarakkeet",
      description: "Määrittele sarakkeiden avain, otsikko ja tyyppi.",
      type: "array",
      // Sarakkeita muokataan taulukkoeditorin otsikkoriviltä (rows-kenttä).
      hidden: true,
      of: [
        {
          type: "object",
          fields: [
            { name: "key", title: "Avain (data-key)", type: "string", validation: (rule) => rule.required() },
            { name: "label", title: "Otsikko (näkyvä)", type: "string", validation: (rule) => rule.required() },
            {
              name: "type",
              title: "Tyyppi",
              type: "string",
              options: {
                list: [
                  { title: "Teksti", value: "text" },
                  { title: "Numero", value: "number" },
                  { title: "Päivämäärä", value: "date" },
                  { title: "Vuosi", value: "year" },
                  { title: "Linkki", value: "link" },
                ],
              },
              initialValue: "text",
            },
          ],
          preview: { select: { title: "label", subtitle: "key" } },
        },
      ],
      group: "data",
    }),
    defineField({
      name: "rows",
      title: "Taulukko",
      description:
        "Muokkaa soluja kuten Excelissä. Sarakkeen nimen, tyypin ja järjestyksen saa " +
        "muutettua otsikon ⋮-valikosta, rivit rivinumeron vierestä.",
      type: "array",
      components: { input: TaulukkoEditori },
      of: [
        {
          type: "object",
          fields: [
            {
              name: "cells",
              title: "Solut",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    { name: "key", title: "Sarake-avain", type: "string", validation: (rule) => rule.required() },
                    { name: "value", title: "Arvo", type: "string" },
                  ],
                  preview: { select: { title: "key", subtitle: "value" } },
                },
              ],
            },
          ],
        },
      ],
      group: "data",
    }),
    defineField({
      name: "lisatiedot",
      title: "Lisätiedot taulukon jälkeen",
      description:
        "Teksti, joka näytetään taulukon alla: otteluraportit, kokoonpanot, " +
        "huomautukset ja selitteet.",
      type: "portableText",
      group: "data",
    }),
    defineField({
      name: "paivitetty",
      title: "Tiedot päivitetty",
      description:
        'Päivä, jolloin taulukon tiedot on viimeksi tarkistettu (vanhalla sivustolla esim. "päävalmentajat: 26.09.2026").',
      type: "date",
      group: "data",
    }),
    defineField({
      name: "jarjestys",
      title: "Järjestys sivulla",
      description:
        "Kun samalla sivulla tai samassa osiossa on useita taulukoita (esim. lohkot A–H), pienempi luku näkyy ylempänä.",
      type: "number",
      validation: (rule) => rule.integer().min(0),
      group: "perustiedot",
    }),
    defineField({
      name: "kuvat",
      title: "Kuvat",
      type: "array",
      of: [{ type: "imageWithAlt" }],
      group: "perustiedot",
    }),
    defineField({
      name: "sources",
      title: "Lähteet",
      type: "array",
      of: [{ type: "url" }],
      group: "data",
    }),
    needsReviewField("perustiedot"),
    tarkistettavaaField("perustiedot"),
    ...seoFields,
    legacyUrlField("seo"),
    muutLegacyUrlitField("seo"),
  ],
  preview: {
    select: { title: "title", category: "category", needsReview: "needsReview" },
    prepare({ title, category, needsReview }) {
      return { title: needsReview ? `⚠ ${title}` : title, subtitle: category };
    },
  },
});
