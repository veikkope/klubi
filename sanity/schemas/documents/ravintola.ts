import { LemonIcon } from "@sanity/icons";
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

/**
 * Arvosanakentät ovat muokattavissa vain vanhan sivuston ravintolalla, jolla
 * on jo käsin annettu arvosana eikä vielä klubilaisten arvosanoja. Uudella
 * ravintolalla käsin kirjoitettu arvosana tekisi siitä julkisen ohi kahden
 * klubilaisen säännön (JULKINEN_RAVINTOLA, docs/21), joten se on lukittu.
 */
function arvosanaLukittu({ document }: { document?: SanityDocumentLike }): boolean {
  if (document?.automaattinenArvosana) return true;
  return document?.ratingOverall == null && document?.stars == null;
}

/**
 * Ravintola-arvostelu.
 *
 * Vanhalla sivustolla arvio annettiin kahdessa muodossa: tähtinä (★★★★) ja
 * kolmena osa-arviona (Ruoka / Hinta / Viihtyvyys) joista laskettiin kokonaisluku
 * yhden desimaalin tarkkuudella. Molemmat säilytetään: tähdet ovat nopea
 * visuaalinen signaali, osa-arviot varsinainen sisältö.
 */
export const ravintola = defineType({
  name: "ravintola",
  title: "Ravintola",
  type: "document",
  icon: LemonIcon,
  groups: [
    { name: "perustiedot", title: "Perustiedot", default: true },
    { name: "arvostelu", title: "Arvostelu" },
    { name: "sijainti", title: "Sijainti" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Nimi",
      type: "string",
      validation: (rule) => rule.required(),
      group: "perustiedot",
    }),
    defineField({
      name: "slug",
      title: "Polku (slug)",
      type: "slug",
      options: { source: "name", maxLength: 80 },
      validation: (rule) => [rule.required(), polkuMuuttunut(rule)],
      group: "perustiedot",
    }),
    tiivistelmaField("perustiedot"),
    defineField({
      name: "city",
      title: "Kaupunki",
      type: "reference",
      to: [{ type: "kaupunki" }],
      validation: (rule) => rule.required(),
      group: "sijainti",
    }),
    defineField({
      name: "address",
      title: "Katuosoite",
      type: "string",
      group: "sijainti",
    }),
    defineField({
      name: "postalCode",
      title: "Postinumero",
      type: "string",
      validation: (rule) =>
        // Hyväksyy suomalaiset (15110) ja ulkomaiset muodot (141 21, 00-271, SW1A 1AA).
        rule
          .regex(/^(?=.*\d)[A-Za-z0-9][A-Za-z0-9 -]{1,9}$/, { name: "postinumero" })
          .warning("Tarkista postinumero."),
      group: "sijainti",
    }),
    defineField({
      name: "location",
      title: "Karttapaikka",
      type: "geopoint",
      group: "sijainti",
    }),
    defineField({
      name: "phone",
      title: "Puhelin",
      type: "string",
      group: "perustiedot",
    }),
    defineField({
      name: "website",
      title: "Verkkosivut",
      type: "url",
      group: "perustiedot",
    }),
    defineField({
      name: "priceLevel",
      title: "Hintaluokka",
      type: "string",
      options: {
        list: [
          { title: "€ Edullinen", value: "€" },
          { title: "€€ Keskitaso", value: "€€" },
          { title: "€€€ Kallis", value: "€€€" },
        ],
      },
      group: "perustiedot",
    }),

    // ── Arvostelu ───────────────────────────────────────────────────────────
    defineField({
      name: "automaattinenArvosana",
      title: "Arvosana lasketaan klubilaisten arvosanoista",
      description:
        "Ruoka, hinta ja viihtyvyys ovat klubilaisten arvosanojen keskiarvo (kunkin klubilaisen uusin " +
        "arvosana), ja kokonaisarvosana on niiden keskiarvo. Ne päivittyvät itsestään, kun arvosana " +
        "tai klubilaisen arvostelu lisätään, muutetaan tai poistetaan. Kenttiä ei voi muokata käsin: " +
        "muokkaa klubilaisen arvosanaa (Ravintolat → Klubilaisten arvosanat).",
      type: "object",
      readOnly: true,
      hidden: ({ value }) => !value,
      group: "arvostelu",
      fields: [
        defineField({ name: "arvioijia", title: "Klubilaisia", type: "number" }),
        defineField({ name: "viimeisinArvio", title: "Tuorein arvosana", type: "date" }),
      ],
    }),
    defineField({
      name: "alkuperainenArvio",
      title: "Aiempi arvosana",
      description:
        "Vanhan sivuston arvosana ennen automaattista laskentaa (painotettu Excelin kaava). Vain " +
        "vertailua varten: ei vaikuta arvosanaan. Palautuu käyttöön, jos klubilaisten arvosanat poistetaan.",
      type: "object",
      readOnly: true,
      hidden: ({ value }) => !value,
      group: "arvostelu",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "ratingOverall", title: "Kokonaisarvosana", type: "number" }),
        defineField({ name: "ratingFood", title: "Ruoka", type: "number" }),
        defineField({ name: "ratingPrice", title: "Hinta", type: "number" }),
        defineField({ name: "ratingAtmosphere", title: "Viihtyvyys", type: "number" }),
      ],
    }),
    defineField({
      name: "stars",
      title: "Tähdet (1–5)",
      description:
        "Vanhan sivuston arvio. Uudelle ravintolalle arvosana tulee klubilaisten arvosanoista.",
      type: "number",
      validation: (rule) => rule.integer().min(1).max(5),
      readOnly: arvosanaLukittu,
      group: "arvostelu",
    }),
    defineField({
      name: "ratingOverall",
      title: "Kokonaisarvosana",
      description: "0–5, yksi desimaali. Esim. 3,6. Lasketaan automaattisesti, kun ravintolalla on klubilaisten arvosanoja.",
      type: "number",
      validation: (rule) => rule.min(0).max(5).precision(2),
      readOnly: arvosanaLukittu,
      group: "arvostelu",
    }),
    defineField({
      name: "ratingFood",
      title: "Ruoka",
      type: "number",
      validation: (rule) => rule.min(0).max(5).precision(2),
      readOnly: arvosanaLukittu,
      group: "arvostelu",
    }),
    defineField({
      name: "ratingPrice",
      title: "Hinta",
      type: "number",
      validation: (rule) => rule.min(0).max(5).precision(2),
      readOnly: arvosanaLukittu,
      group: "arvostelu",
    }),
    defineField({
      name: "ratingAtmosphere",
      title: "Viihtyvyys",
      type: "number",
      validation: (rule) => rule.min(0).max(5).precision(2),
      readOnly: arvosanaLukittu,
      group: "arvostelu",
    }),
    defineField({
      name: "tuomio",
      title: "Tuomio yhdellä rivillä",
      description:
        'Näkyy arviokortissa nimen alla. Esim. "Rehellistä järvikalaa ilman kikkailua." Enintään 90 merkkiä.',
      type: "string",
      validation: (rule) => rule.max(90).warning("Pidä tuomio lyhyenä — se mahtuu korttiin yhdelle riville."),
      group: "arvostelu",
    }),
    defineField({
      name: "stadionHuomio",
      title: "Matka stadionille tai ottelu-yhteys",
      description:
        'Lyhyt merkintä korttiin, esim. "15 min stadionille" tai "Vierasmatka". Jätä tyhjäksi, jos ei liity otteluun.',
      type: "string",
      validation: (rule) => rule.max(30),
      group: "arvostelu",
    }),
    defineField({
      name: "review",
      title: "Sanallinen arvostelu",
      description:
        "Ensimmäinen kappale näytetään ingressinä isommalla fontilla. Lainaus-tyyli (Quote) näkyy nostona messinkiviivalla.",
      type: "portableText",
      group: "arvostelu",
    }),
    defineField({
      name: "ottelupaivana",
      title: "Ottelupäivänä",
      description:
        "Vinkit ottelupäivälle, esim. kävelymatka stadionille ja pöytävaraus. Näkyy arvion lopussa omana laatikkonaan.",
      type: "text",
      rows: 3,
      group: "arvostelu",
    }),
    defineField({
      name: "pros",
      title: "Plussat",
      type: "array",
      of: [{ type: "string" }],
      group: "arvostelu",
    }),
    defineField({
      name: "cons",
      title: "Miinukset",
      type: "array",
      of: [{ type: "string" }],
      group: "arvostelu",
    }),

    // ── Käyntihistoria ──────────────────────────────────────────────────────
    defineField({
      name: "visitedAt",
      title: "Ensimmäinen käynti",
      type: "date",
      group: "arvostelu",
    }),
    defineField({
      name: "visits",
      title: "Käynnit",
      description:
        "Kaikki klubin käynnit tässä ravintolassa, uusin ensin. Lisää uusi käynti listan alkuun: " +
        "uusin käynti määrää, missä kohtaa ravintola näkyy etusivulla ja ravintolalistassa.",
      type: "array",
      of: [{ type: "date" }],
      validation: (rule) =>
        rule.custom((kaynnit) => {
          const paivat = ((kaynnit ?? []) as unknown[]).filter((p): p is string => typeof p === "string");
          const jarjestyksessa = paivat.every((paiva, i) => i === 0 || paivat[i - 1] >= paiva);
          return jarjestyksessa || "Järjestä käynnit uusin ensin: vedä uusin käynti listan alkuun.";
        }),
      group: "arvostelu",
    }),
    defineField({
      name: "visitContext",
      title: "Käynnin yhteys",
      description: 'Esim. "Jouluruokailu" tai "Suomi – Slovenia 21v".',
      type: "string",
      group: "arvostelu",
    }),

    // ── Tila ────────────────────────────────────────────────────────────────
    defineField({
      name: "closed",
      title: "Toiminta loppunut",
      description:
        "Merkitse jos ravintolaa ei enää ole. Sivu säilyy, mutta se merkitään " +
        "päättyneeksi eikä nouse listauksissa.",
      type: "boolean",
      initialValue: false,
      group: "perustiedot",
    }),
    defineField({
      name: "closedNote",
      title: "Lisätieto lopettamisesta",
      type: "string",
      hidden: ({ document }) => !document?.closed,
      group: "perustiedot",
    }),

    defineField({
      name: "images",
      title: "Kuvat",
      type: "array",
      of: [{ type: "imageWithAlt" }],
      group: "perustiedot",
    }),

    needsReviewField("perustiedot"),
    tarkistettavaaField("perustiedot"),
    ...seoFields,
    legacyUrlField("seo"),
    muutLegacyUrlitField("seo"),
  ],
  orderings: [
    {
      title: "Arvosana (parhaat ensin)",
      name: "ratingDesc",
      by: [{ field: "ratingOverall", direction: "desc" }],
    },
    {
      title: "Tähdet (parhaat ensin)",
      name: "starsDesc",
      by: [{ field: "stars", direction: "desc" }],
    },
    { title: "Nimi A–Ö", name: "nameAsc", by: [{ field: "name", direction: "asc" }] },
  ],
  preview: {
    select: {
      title: "name",
      city: "city.name",
      rating: "ratingOverall",
      stars: "stars",
      closed: "closed",
      needsReview: "needsReview",
      arvioijia: "automaattinenArvosana.arvioijia",
      media: "images.0",
    },
    prepare({ title, city, rating, stars, closed, needsReview, arvioijia, media }) {
      const starString =
        typeof stars === "number" ? "★".repeat(stars) + "☆".repeat(5 - stars) : "";
      const ratingString =
        typeof rating === "number" ? rating.toFixed(1).replace(".", ",") : "";
      // Sama sääntö kuin JULKINEN_RAVINTOLA (lib/ravintola-arvosana.ts).
      const piilossa =
        typeof arvioijia === "number" ? arvioijia < 2 : typeof rating !== "number" && typeof stars !== "number";
      const flags = [
        piilossa ? "piilossa: odottaa toista arvioijaa" : null,
        closed ? "päättynyt" : null,
        needsReview ? "tarkista" : null,
      ]
        .filter(Boolean)
        .join(", ");
      return {
        title: needsReview ? `⚠ ${title}` : title,
        subtitle: [city, starString, ratingString, flags]
          .filter(Boolean)
          .join(" — "),
        media,
      };
    },
  },
});
