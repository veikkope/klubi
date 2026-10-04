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
import { KOODIIN_SIDOTUT_SIVUT } from "../../../lib/path";

/**
 * Yleisen sisältösivun dokumenttityyppi. Yksi `sivu` per polku — slug voi
 * sisältää kauttaviivoja monitasoisille sivuille, esim. `klubi/historia`.
 *
 * Polkurakenne renderöityy `/[...slug]`-reitissä. Studiossa slug muotoillaan
 * automaattisesti otsikosta, mutta käyttäjä saa muokata sitä.
 */

const RESERVED_TOP_LEVEL = new Set([
  "studio",
  "api",
  "yhteystiedot",
  "tapahtumat",
  "uutiset",
  "ravintolat",
  "jalkapalloarkisto",
  "galleria",
  "stadionit",
]);

const SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

function validateSlugPath(slug: string | undefined): true | string {
  if (!slug) return "Slug on pakollinen.";
  if (slug.length > 96) return "Slug on liian pitkä (max 96 merkkiä).";
  const segments = slug.split("/");
  if (segments.length > 4) {
    return "Liian monta tasoa polussa (max 4).";
  }
  for (const segment of segments) {
    if (!SEGMENT.test(segment)) {
      return `Virheellinen polun osa "${segment}". Käytä vain pieniä kirjaimia a-z, numeroita ja yksittäisiä yhdysmerkkejä.`;
    }
  }
  if (RESERVED_TOP_LEVEL.has(segments[0])) {
    return `"${segments[0]}" on varattu järjestelmäpolku — valitse toinen.`;
  }
  return true;
}

export const sivu = defineType({
  name: "sivu",
  title: "Sivu",
  type: "document",
  icon: DocumentIcon,
  groups: [
    { name: "sisalto", title: "Sisältö", default: true },
    { name: "seo", title: "SEO" },
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
      title: "Polku (slug)",
      description:
        'URL-osa. Vain pieniä kirjaimia, numeroita ja yhdysmerkkejä. ' +
        'Käytä "/" alasivuille — esim. "klubi/historia" → /klubi/historia. ' +
        "Klubi-osion pääsivujen polut on lukittu, koska sivusto hakee ne polun perusteella.",
      type: "slug",
      readOnly: ({ document }) => koodiinSidottuSlug(document, KOODIIN_SIDOTUT_SIVUT),
      options: {
        source: "title",
        maxLength: 96,
        slugify: slugifyPath,
      },
      validation: (rule) => [
        rule.required().custom((slug) => validateSlugPath(slug?.current)),
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
    tiivistelmaField("sisalto"),
    defineField({
      name: "hero",
      title: "Yläbanneri (hero-kuva)",
      type: "imageWithAlt",
      group: "sisalto",
    }),
    defineField({
      name: "ingress",
      title: "Ingressi",
      description: "Lyhyt johdanto. Näkyy hero-alueella.",
      type: "text",
      rows: 3,
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
