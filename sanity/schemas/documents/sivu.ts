import { DocumentIcon } from "@sanity/icons";
import { defineField, defineType, type SanityDocumentLike } from "sanity";
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
import { onLukittuSivu } from "../../../lib/path";
import { johdantoPakollinen, osioSivu, piilotaKentta } from "../../../lib/osiosivut";
import { tarkistaSivunPolku } from "../../../lib/sivupolku";
import { OsioSivunOhje } from "../../components/osiosivu/OsioSivunOhje";

/**
 * Yleisen sisältösivun dokumenttityyppi. Yksi `sivu` per polku — slug voi
 * sisältää kauttaviivoja monitasoisille sivuille, esim. `klubi/historia`.
 *
 * Polkurakenne renderöityy `/[...slug]`-reitissä. Studiossa slug muotoillaan
 * automaattisesti otsikosta, mutta käyttäjä saa muokata sitä.
 */

/** Dokumentin polku (slug.current). */
const slugOf = (document?: SanityDocumentLike) => (document?.slug as { current?: string } | undefined)?.current;

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
    // Osioiden sivuilla (lib/osiosivut.ts) ohjelaatikko: mitä tässä muokataan
    // ja mikä tulee sivulle automaattisesti. Ei tallenna dataa.
    defineField({
      name: "osionOhje",
      title: "Tietoa sivusta",
      type: "string",
      readOnly: true,
      hidden: ({ document }) => !osioSivu(slugOf(document)),
      components: { input: OsioSivunOhje },
      group: "sisalto",
    }),
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
        "klubi/historia → /klubi/historia. Osioiden sivujen (esim. /uutiset), Klubin " +
        "pääsivujen ja tietosuojaselosteen osoitteet on lukittu, koska sivusto hakee ne " +
        "osoitteen perusteella.",
      type: "slug",
      readOnly: ({ document }) =>
        onLukittuSivu(document?._id, (document?.slug as { current?: string } | undefined)?.current),
      options: {
        source: "title",
        maxLength: 96,
        slugify: slugifyPath,
      },
      validation: (rule) => [
        rule.required().custom((slug, context) => tarkistaSivunPolku(slug?.current, context.document?._id)),
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
      // Osioiden sivut ovat aina suomeksi.
      hidden: ({ document }) => Boolean(osioSivu(slugOf(document))),
      group: "sisalto",
    }),
    tiivistelmaField("sisalto", {
      title: "Tiivistelmä sivun alussa",
      description: "2–3 virkettä, jotka näkyvät sivun alussa isommalla tekstillä ja hakukoneissa.",
      validation: (rule) => [
        rule.max(300).warning("Suositus: alle 300 merkkiä — tiivistelmä, ei johdanto."),
        rule.custom((arvo, { document }) => {
          const o = osioSivu(slugOf(document));
          return o && johdantoPakollinen(o) && !String(arvo ?? "").trim()
            ? "Tiivistelmä on tällä sivulla pakollinen: se näkyy otsikon alla johdantona ja hakukoneissa."
            : true;
        }),
      ],
    }),
    // Vain jalkapalloarkiston osioiden sivuilla (lib/osiosivut.ts oletus.kortti).
    defineField({
      name: "korttiteksti",
      title: "Teksti arkiston etusivun kortissa",
      description:
        "Yksi lyhyt virke, joka näkyy Jalkapalloarkiston etusivulla tämän osion kortissa. " +
        "Jos jätät tyhjäksi, käytetään sivuston oletustekstiä.",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(140).warning("Suositus: alle 140 merkkiä, kortti on pieni."),
      hidden: ({ document, value }) => !osioSivu(slugOf(document))?.oletus.kortti && !value,
      group: "sisalto",
    }),
    defineField({
      name: "hero",
      title: "Iso kuva sivun yläosassa",
      description: "Valinnainen. Näkyy sivun yläosassa (tavallisilla sivuilla otsikon takana, Klubi-osiossa omana kuvanaan) ja somejaoissa.",
      type: "imageWithAlt",
      // Osion sivulla vain, jos sivu näyttää kuvan (olemassa oleva kuva näkyy aina).
      hidden: ({ document, value }) => piilotaKentta(slugOf(document), "hero", value),
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
      type: "rikasSisalto",
      hidden: ({ document, value }) => piilotaKentta(slugOf(document), "body", value),
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
      hidden: ({ document, value }) => piilotaKentta(slugOf(document), "tilastot", value),
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
      const polku = subtitle ? `/${subtitle}` : "";
      return { title, subtitle: osioSivu(subtitle) ? `Osion sivu · ${polku}` : polku, media };
    },
  },
});
