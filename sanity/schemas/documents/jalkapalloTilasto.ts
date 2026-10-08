import { BarChartIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { HUUHKAJAT_OSIOT, findHuuhkajatOsio, osioLiittyyKauteen } from "../../../lib/huuhkajat-osiot";
import { TILASTO_KATEGORIA_VALINNAT, kategorianNimi } from "../../../lib/tilasto-kategoriat";
import { MESTARUUSMAAT } from "../../../lib/ulkomaiset-mestarit";
import { TaulukkoKontekstiInput } from "../../components/taulukkoeditori/konteksti";
import { seoFields } from "../objects/seoFields";
import {
  aiemmatPolutField,
  legacyUrlField,
  muutLegacyUrlitField,
  needsReviewField,
  polkuMuuttunut,
  tarkistettavaaField,
  tiivistelmaField,
} from "../objects/contentMeta";
import { HAKUKONEET_RYHMA, OSOITE_OTSIKKO } from "../objects/sanasto";
import { rivitKentta, sarakkeetKentta } from "../objects/taulukkoKentat";

export const jalkapalloTilasto = defineType({
  name: "jalkapalloTilasto",
  title: "Jalkapallotilasto",
  type: "document",
  icon: BarChartIcon,
  // Taulukkoeditori muokkaa sekä sarakkeita että rivejä (docs/19).
  components: { input: TaulukkoKontekstiInput },
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
      description: "Taulukon tunniste osoitteessa. Jos taulukolla on oma sivu ja muutat julkaistun taulukon osoitetta, vanha osoite ohjautuu uuteen automaattisesti.",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => [rule.required(), polkuMuuttunut(rule)],
      group: "perustiedot",
    }),
    tiivistelmaField("perustiedot"),
    defineField({
      name: "category",
      title: "Kategoria",
      description:
        "Ratkaisee, millä sivulla taulukko näkyy. Tarkka sivu näkyy lomakkeen yläreunassa " +
        "(Käytetty yhdellä sivulla: avaa nuolesta). " +
        "Klubin omat tilastot ja pelaajatilastot näkyvät vasta, kun ne on lisätty sivun, klubin toiminnan " +
        "tai pelaajan kenttään Taulukot (sivu) tai Tilastotaulukot (klubin toiminta, pelaaja).",
      type: "string",
      options: {
        // Kategoriat ja Studion ryhmät: lib/tilasto-kategoriat.ts (docs/24 askel 11).
        list: TILASTO_KATEGORIA_VALINNAT,
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
    sarakkeetKentta({ group: "data" }),
    rivitKentta({ group: "data" }),
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
    aiemmatPolutField("seo"),
  ],
  preview: {
    select: { title: "title", category: "category", huuhkajatOsio: "huuhkajatOsio", needsReview: "needsReview" },
    prepare({ title, category, huuhkajatOsio, needsReview }) {
      // Alaotsikko: kategorian nimi ja Huuhkajat-taulukon osio (docs/24 askel 11).
      const osio = category === "huuhkajat" && huuhkajatOsio ? findHuuhkajatOsio(huuhkajatOsio)?.title : undefined;
      return {
        title: needsReview ? `⚠ ${title}` : title,
        subtitle: [kategorianNimi(category), osio].filter(Boolean).join(" · "),
      };
    },
  },
});
