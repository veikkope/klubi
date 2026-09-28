import { DocumentTextIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { seoFields } from "../objects/seoFields";
import {
  legacyUrlField,
  muutLegacyUrlitField,
  needsReviewField,
  tarkistettavaaField,
  tiivistelmaField,
} from "../objects/contentMeta";

export const uutinen = defineType({
  name: "uutinen",
  title: "Uutinen",
  type: "document",
  icon: DocumentTextIcon,
  groups: [
    { name: "sisalto", title: "Sisältö", default: true },
    { name: "kommentit", title: "Kommentit ja veikkaus" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Otsikko",
      type: "string",
      validation: (rule) => rule.required(),
      group: "sisalto",
    }),
    defineField({
      name: "slug",
      title: "Polku (slug)",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => rule.required(),
      group: "sisalto",
    }),
    tiivistelmaField("sisalto"),
    defineField({
      name: "publishedAt",
      title: "Julkaisuaika",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
      group: "sisalto",
    }),
    defineField({
      name: "excerpt",
      title: "Lyhenne",
      description:
        "Lyhyt teaser uutislistalle. Max 200 merkkiä. Ei pakollinen, jos uutinen " +
        "on pelkkä otsikko, joka linkittää alkuperäiseen kirjoitukseen.",
      type: "text",
      rows: 2,
      validation: (rule) =>
        rule
          .max(200)
          .custom((value, context) =>
            value || (context.document as { ulkoinenLinkki?: string } | undefined)?.ulkoinenLinkki
              ? true
              : "Lyhenne on pakollinen."
          ),
      group: "sisalto",
    }),
    defineField({
      name: "coverImage",
      title: "Kansikuva",
      type: "imageWithAlt",
      group: "sisalto",
    }),
    defineField({
      name: "body",
      title: "Sisältö",
      type: "portableText",
      description:
        "Uutisen teksti. Ei pakollinen, jos uutinen linkittää alkuperäiseen " +
        "kirjoitukseen (kenttä Alkuperäinen kirjoitus).",
      validation: (rule) =>
        rule.custom((value, context) =>
          (Array.isArray(value) && value.length > 0) ||
          (context.document as { ulkoinenLinkki?: string } | undefined)?.ulkoinenLinkki
            ? true
            : "Sisältö on pakollinen."
        ),
      group: "sisalto",
    }),
    defineField({
      name: "ulkoinenLinkki",
      title: "Alkuperäinen kirjoitus (linkki)",
      description:
        "Jos uutinen on julkaistu muualla (esim. klubin Blogspot-blogissa), linkki " +
        "siihen. Vanhan sivuston otsikkoarkisto koostuu tällaisista linkeistä.",
      type: "url",
      validation: (rule) =>
        rule.uri({ scheme: ["http", "https"] }).error("Linkin pitää alkaa https://."),
      group: "sisalto",
    }),
    defineField({
      name: "lahde",
      title: "Lähde",
      description:
        'Mistä uutinen on lainattu, esim. "palloliitto.fi" tai "ESS". Vanhalla ' +
        "sivustolla merkintä oli uutisen lopussa: (palloliitto.fi 07.02.2008).",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "nimi", title: "Lähteen nimi", type: "string" }),
        defineField({
          name: "url",
          title: "Lähteen osoite",
          type: "url",
          validation: (rule) =>
            rule.uri({ scheme: ["http", "https"] }).error("Linkin pitää alkaa https://."),
        }),
        defineField({
          name: "pvm",
          title: "Lähteen päiväys",
          description: "Täytä vain, jos eri kuin julkaisuaika.",
          type: "date",
        }),
      ],
      group: "sisalto",
    }),
    defineField({
      name: "categories",
      title: "Kategoriat",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Otteluraportti", value: "otteluraportti" },
          { title: "Kannattajakulttuuri", value: "kannattajakulttuuri" },
          { title: "Tiedote", value: "tiedote" },
          { title: "Tapahtumaraportti", value: "tapahtumaraportti" },
          { title: "Jäsentieto", value: "jasentieto" },
          { title: "Jalkapallo", value: "jalkapallo" },
          { title: "Ravintola", value: "ravintola" },
          { title: "Blogikirjoitus", value: "blogi" },
          { title: "Palloveikkaus", value: "palloveikkaus" },
          { title: "Matkakuvaus", value: "matkakuvaus" },
        ],
        layout: "tags",
      },
      group: "sisalto",
    }),
    defineField({
      name: "author",
      title: "Kirjoittaja",
      type: "reference",
      to: [{ type: "hallitusJasen" }],
      group: "sisalto",
    }),
    needsReviewField("sisalto"),
    tarkistettavaaField("sisalto"),
    defineField({
      name: "kommentointi",
      title: "Kommentit ja veikkaus",
      description:
        "Salli jäsenten jättää kommentteja tai veikkauksia tämän uutisen alle. " +
        "Kommentit näkyvät sivulla heti. Ne löytyvät Studiosta kohdasta Kommentit ja veikkaukset.",
      type: "object",
      group: "kommentit",
      fields: [
        defineField({
          name: "kaytossa",
          title: "Salli kommentit",
          type: "boolean",
          initialValue: false,
        }),
        defineField({
          name: "tyyppi",
          title: "Lomakkeen tyyppi",
          type: "string",
          options: {
            list: [
              { title: "Kommentti (vapaa teksti)", value: "kommentti" },
              { title: "Sarjajärjestys (esim. Palloveikkaus: joukkueet järjestykseen)", value: "sarjajarjestys" },
              { title: "Voittajaveikkaus (esim. EM/MM: parhaat sijat ja maalikuningas)", value: "voittajaveikkaus" },
            ],
            layout: "radio",
          },
          initialValue: "kommentti",
          hidden: ({ parent }) => !parent?.kaytossa,
        }),
        defineField({
          name: "sulkeutuu",
          title: "Veikkaus sulkeutuu",
          description: "Tämän jälkeen uusia kommentteja ei voi lähettää. Jätä tyhjäksi, jos ei sulkeudu.",
          type: "datetime",
          hidden: ({ parent }) => !parent?.kaytossa,
        }),
        defineField({
          name: "vaihtoehdot",
          title: "Joukkueet",
          description:
            "Sarjajärjestys: kaikki sarjan joukkueet (esim. Veikkausliigan 12). Jäsen laittaa ne " +
            "järjestykseen. Voittajaveikkaus: valinnainen lista maista, joista jäsen valitsee. " +
            "Tyhjä = jäsen kirjoittaa itse.",
          type: "array",
          of: [{ type: "string" }],
          hidden: ({ parent }) => !parent?.kaytossa || parent?.tyyppi === "kommentti" || !parent?.tyyppi,
          validation: (rule) =>
            rule.custom((value, context) => {
              const parent = context.parent as { kaytossa?: boolean; tyyppi?: string } | undefined;
              const list = (value ?? []) as string[];
              if (!parent?.kaytossa) return true;
              if (parent.tyyppi === "sarjajarjestys" && list.length < 2) {
                return "Lisää vähintään kaksi joukkuetta.";
              }
              const seen = new Set(list.map((v) => v.trim().toLowerCase()));
              if (seen.size !== list.length) return "Sama joukkue on listalla kahdesti.";
              if (list.length > 60) return "Enintään 60 vaihtoehtoa.";
              return true;
            }),
        }),
        defineField({
          name: "sijoituksia",
          title: "Montako sijaa veikataan",
          description: "Esim. 4 = voittaja, hopea, pronssi ja neljäs.",
          type: "number",
          initialValue: 4,
          hidden: ({ parent }) => !parent?.kaytossa || parent?.tyyppi !== "voittajaveikkaus",
          validation: (rule) => rule.integer().min(1).max(10),
        }),
        defineField({
          name: "maalikuningas",
          title: "Kysy myös maalikuningasta",
          type: "boolean",
          initialValue: true,
          hidden: ({ parent }) => !parent?.kaytossa || parent?.tyyppi !== "voittajaveikkaus",
        }),
        defineField({
          name: "ohje",
          title: "Ohje jäsenille",
          description: 'Näkyy lomakkeen yläpuolella, esim. "Veikkaa Veikkausliigan lopputaulukko."',
          type: "text",
          rows: 2,
          hidden: ({ parent }) => !parent?.kaytossa,
        }),
      ],
    }),
    ...seoFields,
    legacyUrlField("seo"),
    muutLegacyUrlitField("seo"),
    defineField({
      name: "blogspot",
      title: "Alkuperäinen Blogspot-kirjoitus",
      description:
        "Täytetään automaattisesti, kun kirjoitus tuodaan klubin Blogspot-blogista. " +
        "Älä muuta käsin — blogin vanhat osoitteet ohjautuvat tämän varassa tähän uutiseen.",
      type: "object",
      readOnly: true,
      options: { collapsible: true, collapsed: true },
      hidden: ({ value }) => !value,
      fields: [
        defineField({ name: "id", title: "Kirjoituksen tunniste", type: "string" }),
        defineField({ name: "url", title: "Osoite blogissa", type: "url" }),
        defineField({
          name: "polku",
          title: "Polku blogissa",
          description: "Esim. /2019/03/milano.html",
          type: "string",
        }),
        defineField({
          name: "tunnisteet",
          title: "Blogin tunnisteet",
          description: "Kirjoituksen tunnisteet (labels) blogissa sellaisenaan.",
          type: "array",
          of: [{ type: "string" }],
        }),
        defineField({
          name: "kommentteja",
          title: "Kommentteja blogissa",
          description: "Kommentit jäivät blogiin; niitä ei tuotu sivustolle.",
          type: "number",
        }),
      ],
      group: "seo",
    }),
  ],
  orderings: [
    {
      title: "Julkaisuaika (uusimmat ensin)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", date: "publishedAt", media: "coverImage", needsReview: "needsReview" },
    prepare({ title, date, media, needsReview }) {
      const formatted = date
        ? new Date(date).toLocaleDateString("fi-FI")
        : "Ei päivämäärää";
      return { title: needsReview ? `⚠ ${title}` : title, subtitle: formatted, media };
    },
  },
});
