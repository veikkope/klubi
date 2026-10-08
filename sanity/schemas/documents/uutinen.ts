import { DocumentTextIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
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
import { KategoriatInput } from "../../components/kategoriat/KategoriatInput";
import { TunnisteetInput } from "../../components/tunnisteet/TunnisteetInput";
import { tarkistaTunnisteet } from "../../../lib/tunnisteet";

/** Uutisosion kiinteät reitit app/(public)/uutiset/-kansiossa. */
const VARATUT_POLUT = new Set(["arkisto", "tunniste", "tunnisteet"]);

export const uutinen = defineType({
  name: "uutinen",
  title: "Uutinen",
  type: "document",
  icon: DocumentTextIcon,
  groups: [
    { name: "sisalto", title: "Sisältö", default: true },
    { name: "kommentit", title: "Kommentit ja veikkaus" },
    HAKUKONEET_RYHMA,
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
      title: OSOITE_OTSIKKO,
      description: "Muodostuu otsikosta: paina Luo. Uutisen osoite on /uutiset/tämä-osa. (Aiemmin kentän nimi oli Polku.)",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => [
        rule.required(),
        polkuMuuttunut(rule),
        // Uutisosion omat sivut (/uutiset/arkisto, /uutiset/tunnisteet …) menevät
        // uutisen edelle: tällä polulla uutinen ei koskaan näkyisi.
        rule.custom((value: { current?: string } | undefined) =>
          value?.current && VARATUT_POLUT.has(value.current)
            ? `Osoite “${value.current}” on varattu uutisosion omalle sivulle. Valitse toinen.`
            : true,
        ),
      ],
      group: "sisalto",
    }),
    tiivistelmaField("sisalto", {
      title: "Tiivistelmä jutun alussa (valinnainen)",
      description:
        "Näkyy jutun alussa isommalla tekstillä ja hakukoneissa. Jos tämä on täytetty, se näkyy " +
        "jutun alussa Lyhenteen sijaan. Uudessa jutussa voit jättää tämän tyhjäksi: silloin " +
        "alussa näkyy Lyhenne.",
    }),
    defineField({
      name: "publishedAt",
      title: "Julkaisuaika",
      description:
        "Uutinen näkyy sivustolla tästä hetkestä alkaen. Ajastus: valitse tuleva aika ja paina " +
        "Julkaise. Uutinen odottaa piilossa ja tulee näkyviin itsestään noin minuutin kuluessa " +
        "valitusta ajasta. Listassa se näkyy siihen asti merkinnällä Ajastettu.",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
      group: "sisalto",
    }),
    defineField({
      name: "excerpt",
      title: "Lyhenne (uutislista ja etusivu)",
      description:
        "1–2 virkettä, jotka näkyvät uutislistassa ja etusivun kortissa. Näkyy myös jutun " +
        "alussa, jos Tiivistelmä on tyhjä. Enintään 200 merkkiä. Ei pakollinen, jos uutinen " +
        "on pelkkä linkki alkuperäiseen kirjoitukseen.",
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
      name: "kategoriat",
      title: "Kategoriat",
      description:
        "Uutislistan suodatin (/uutiset). Uusia kategorioita lisätään valikosta Uutiskategoriat.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "uutisKategoria" }] }],
      // Valintaruudut: kaikki kategoriat näkyvät kerralla (sanity/components/kategoriat).
      components: { input: KategoriatInput },
      validation: (rule) => rule.unique().error("Sama kategoria on valittu kahdesti."),
      group: "sisalto",
    }),
    defineField({
      name: "tunnisteet",
      title: "Tunnisteet",
      description:
        "Aiheet, paikat ja henkilöt, esim. Huuhkajat, Olympiastadion, Teemu Pukki. " +
        "Jokaisesta tunnisteesta tulee oma sivu, jolla on kaikki sen uutiset. " +
        "Valitse ehdotuksista, jos sama tunniste on jo käytössä.",
      type: "array",
      of: [{ type: "string" }],
      components: { input: TunnisteetInput },
      validation: (rule) => rule.custom(tarkistaTunnisteet),
      group: "sisalto",
    }),
    defineField({
      name: "author",
      title: "Kirjoittaja",
      type: "reference",
      to: [{ type: "hallitusJasen" }],
      // Ei käytössä yhdessäkään uutisessa, ja viittaus estäisi hallituksen jäsenen
      // poiston sekä näyttäisi vanhalla jutulla nykyisen roolin (docs/23 Y39).
      // Piilossa, kunnes kirjoittajamallista päätetään; näkyy, jos arvo on jo.
      hidden: ({ value }) => !value,
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
          title: "Osoite vanhassa blogissa",
          description: "Esim. /2019/03/milano.html",
          type: "string",
        }),
        defineField({
          name: "tunnisteet",
          title: "Blogin tunnisteet",
          description:
            "Kirjoituksen tunnisteet (labels) blogissa sellaisenaan, alkuperän tallenne. " +
            "Sivustolla näkyvät tunnisteet muokataan Sisältö-välilehden kentässä Tunnisteet.",
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
      const aika = date ? new Date(date) : null;
      // Tuleva julkaisuaika = ajastettu (sanity/lib/queries/julkaisu.ts).
      const subtitle = !aika
        ? "Ei päivämäärää"
        : aika.getTime() > Date.now()
          ? `Ajastettu ${aika.toLocaleString("fi-FI", { dateStyle: "short", timeStyle: "short" })}`
          : aika.toLocaleDateString("fi-FI");
      return { title: needsReview ? `⚠ ${title}` : title, subtitle, media };
    },
  },
});
