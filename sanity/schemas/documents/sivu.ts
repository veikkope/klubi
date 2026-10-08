import { DocumentIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { seoFields } from "../objects/seoFields";
import {
  legacyUrlField,
  muutLegacyUrlitField,
  needsReviewField,
  tarkistettavaaField,
  tiivistelmaField,
  polkuMuuttunut,
  koodiinSidottuSlug,
} from "../objects/contentMeta";
import { HAKUKONEET_RYHMA, OSOITE_OTSIKKO } from "../objects/sanasto";
import { KOODIIN_SIDOTUT_SIVUT } from "../../../lib/path";
import { tarkistaSivunPolku } from "../../../lib/sivupolku";

/**
 * Yleisen sisältösivun dokumenttityyppi. Yksi `sivu` per polku — slug voi
 * sisältää kauttaviivoja monitasoisille sivuille, esim. `klubi/historia`.
 *
 * Polkurakenne renderöityy `/[...slug]`-reitissä. Studiossa slug muotoillaan
 * automaattisesti otsikosta, mutta käyttäjä saa muokata sitä.
 */

/**
 * Slugify joka säilyttää kauttaviivat hierarkkista polkua varten.
 * Esim. "Klubin säännöt" → "klubin-saannot",
 *      "Klubi/Historia" → "klubi/historia".
 */
function slugifyPath(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9/]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^[/-]+|[/-]+$/g, "")
    .slice(0, 96);
}

export const sivu = defineType({
  name: "sivu",
  title: "Sivu",
  type: "document",
  icon: DocumentIcon,
  groups: [
    { name: "sisalto", title: "Sisältö", default: true },
    HAKUKONEET_RYHMA,
  ],
  fields: [
    defineField({
      name: "title",
      title: "Otsikko",
      type: "string",
      validation: (rule) => rule.required().error("Otsikko on pakollinen."),
      group: "sisalto",
    }),
    defineField({
      name: "slug",
      title: OSOITE_OTSIKKO,
      description:
        "Vain pieniä kirjaimia, numeroita ja yhdysmerkkejä. Alasivulle kauttaviiva: " +
        "klubi/historia → /klubi/historia. Klubi-osion pääsivujen ja tietosuojaselosteen " +
        "osoitteet on lukittu.",
      type: "slug",
      readOnly: ({ document }) => koodiinSidottuSlug(document, KOODIIN_SIDOTUT_SIVUT),
      options: {
        source: "title",
        maxLength: 96,
        slugify: slugifyPath,
      },
      validation: (rule) => [
        rule.required().custom((slug) => tarkistaSivunPolku(slug?.current)),
        polkuMuuttunut(rule),
      ],
      group: "sisalto",
    }),
    defineField({
      name: "kieli",
      title: "Sisällön kieli",
      description:
        "Vaihda, jos sivu on kirjoitettu muulla kuin suomella (esim. englanninkielinen " +
        "esittely). Ruudunlukija ääntää tekstin silloin oikein.",
      type: "string",
      options: {
        list: [
          { title: "Suomi", value: "fi" },
          { title: "Englanti", value: "en" },
          { title: "Ruotsi", value: "sv" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "fi",
      group: "sisalto",
    }),
    tiivistelmaField("sisalto", {
      title: "Tiivistelmä sivun alussa",
      description: "2–3 virkettä, jotka näkyvät sivun alussa isommalla tekstillä ja hakukoneissa.",
    }),
    defineField({
      name: "hero",
      title: "Iso kuva sivun yläosassa",
      description: "Valinnainen. Näkyy sivun yläosassa (tavallisilla sivuilla otsikon takana, Klubi-osiossa omana kuvanaan) ja somejaoissa.",
      type: "imageWithAlt",
      group: "sisalto",
    }),
    defineField({
      name: "ingress",
      title: "Ingressi (vanha kenttä)",
      description:
        "Näkyy sivun alussa vain, jos Tiivistelmä on tyhjä. Kirjoita johdanto Tiivistelmään.",
      type: "text",
      rows: 3,
      // Vanha kenttä: näkyy vain sivuilla, joilla se on jo täytetty (docs/24 askel 1, Y10).
      hidden: ({ value }) => !value,
      validation: (rule) => rule.max(300),
      group: "sisalto",
    }),
    defineField({
      name: "body",
      title: "Pääsisältö",
      type: "portableText",
      group: "sisalto",
    }),
    defineField({
      name: "tilastot",
      title: "Taulukot",
      description:
        "Sivulla näytettävät taulukot (esim. palloveikkauksen tulokset). Taulukot " +
        "ylläpidetään Jalkapallotilasto-dokumentteina kategorialla \"Klubin omat tilastot\".",
      type: "array",
      of: [{ type: "reference", to: [{ type: "jalkapalloTilasto" }] }],
      group: "sisalto",
    }),
    needsReviewField("sisalto"),
    tarkistettavaaField("sisalto"),
    ...seoFields,
    legacyUrlField("seo"),
    muutLegacyUrlitField("seo"),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current", media: "hero" },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: subtitle ? `/${subtitle}` : "", media };
    },
  },
});
