import { HomeIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { puuttuukoLinkinKohde } from "../../../lib/linkki";
import { legacyUrlField } from "../objects/contentMeta";
import { linkinEsikatselu, linkkiKentat } from "../objects/linkki";
import { HAKUKONEET_RYHMA } from "../objects/sanasto";

/**
 * Lohkon aito piilotus (docs/24 askel 1, Y38): lohko säilyy listassa
 * asetuksineen, mutta `etusivuQuery` jättää sen pois (`blocks[piilota != true]`).
 * Puuttuva arvo tarkoittaa näkyvää, joten vanhaa dataa ei tarvitse muuttaa.
 */
const piilotaLohko = defineField({
  name: "piilota",
  title: "Piilota lohko sivulta",
  type: "boolean",
  initialValue: false,
  description:
    "Lohko säilyy tässä listassa asetuksineen, mutta ei näy etusivulla. Käännä kytkin pois päältä, niin lohko palaa.",
});

/** Esikatselun alaotsikko: piilotetun lohkon eteen "Piilotettu · ". */
function lohkonAlaotsikko(piilota: unknown, alaotsikko?: string): string | undefined {
  if (piilota !== true) return alaotsikko;
  return alaotsikko ? `Piilotettu · ${alaotsikko}` : "Piilotettu";
}

/**
 * Lohkon vanha linkkikenttä (merkkijono). Korvattu linkkiobjektilla
 * `ctaLinkki` (docs/24 askel 4). Sivusto lukee sitä, kunnes linkit on
 * muunnettu (askel 5); sen jälkeen arvo poistetaan erikseen.
 */
const vanhaCtaHref = defineField({
  name: "ctaHref",
  title: "Vanha linkin osoite",
  type: "string",
  deprecated: { reason: 'Korvattu kentällä "Linkin kohde".' },
  readOnly: true,
  hidden: true,
  initialValue: undefined,
});

export const etusivu = defineType({
  name: "etusivu",
  title: "Etusivu",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "hero", title: "Yläosa", default: true },
    { name: "blocks", title: "Lohkot" },
    HAKUKONEET_RYHMA,
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
      description: 'Näkyvät yläosan oikean reunan Seuraavaksi-kortissa, esim. "Palloveikkaus". Enintään neljä.',
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", title: "Teksti", type: "string", validation: (rule) => rule.required() },
            ...linkkiKentat({ pakollinen: true }),
            // Vanhan heron korostusvalinta: uusi yläosa ei käytä sitä.
            { name: "primary", title: "Korostettu", type: "boolean", hidden: true },
          ],
          preview: linkinEsikatselu("label"),
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
      // Pelattu ottelu näkyi lukittuna lomakkeella (docs/23 Y41). Data poistetaan
      // siivousmigraatiossa; siihen asti kenttä on vain piilossa.
      hidden: true,
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
      description:
        "Järjestä lohkot vetämällä kahvasta (⋮⋮). Jos haluat lohkon pois sivulta väliaikaisesti, " +
        "avaa se ja käännä kytkin Piilota lohko sivulta päälle. Lohkon ⋯-valikon Poista poistaa lohkon asetuksineen.",
      type: "array",
      of: [
        defineArrayMember({
          name: "uutiset",
          title: "Jutut (uusimmat uutiset)",
          type: "object",
          description: "Uusin juttu isona, seuraavat listana vieressä.",
          fields: [
            piilotaLohko,
            { name: "eyebrow", title: "Yläotsake", type: "string", description: "Pieni versaaliteksti otsikon yläpuolella. Näkyy vain, jos otsikko on täytetty." },
            { name: "heading", title: "Otsikko", type: "string", description: "Jätä tyhjäksi, jos osiolla ei ole näkyvää otsikkoa (jutut ja Kaikki jutut -linkki näkyvät silti)." },
            { name: "count", title: "Näytettävien määrä", type: "number", initialValue: 4, validation: (r) => r.min(1).max(6) },
          ],
          preview: {
            select: { heading: "heading", piilota: "piilota" },
            prepare: ({ heading, piilota }) => ({
              title: "Jutut (uusimmat uutiset)",
              subtitle: lohkonAlaotsikko(piilota, heading || "Ei näkyvää otsikkoa"),
            }),
          },
        }),
        defineArrayMember({
          name: "otteluohjelma",
          title: "Otteluohjelma ja tapahtumat",
          type: "object",
          description:
            "Vasemmalla tulevat ottelut (haetaan automaattisesti), oikealla klubin omat tapahtumat. Jos toinen puoli on tyhjä, toinen täyttää koko leveyden.",
          fields: [
            piilotaLohko,
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
                'Kirjoita seuran nimi kuten Veikkausliigan sivuilla, esim. "FC Lahti". Ottelut haetaan automaattisesti. Tyhjä lista = vain Huuhkajat. Lista ohjaa myös Ottelut-sivua, vaikka lohko olisi piilotettu.',
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
          preview: {
            select: { piilota: "piilota" },
            prepare: ({ piilota }) => ({ title: "Otteluohjelma ja tapahtumat", subtitle: lohkonAlaotsikko(piilota) }),
          },
        }),
        defineArrayMember({
          name: "tapahtumat",
          title: "Tulevat tapahtumat",
          type: "object",
          fields: [
            piilotaLohko,
            { name: "heading", title: "Otsikko", type: "string", initialValue: "Tulevat tapahtumat" },
            { name: "count", title: "Näytettävien määrä", type: "number", initialValue: 3, validation: (r) => r.min(1).max(6) },
          ],
          preview: {
            select: { piilota: "piilota" },
            prepare: ({ piilota }) => ({ title: "Tulevat tapahtumat", subtitle: lohkonAlaotsikko(piilota) }),
          },
        }),
        defineArrayMember({
          name: "esittely",
          title: "Esittelyteksti (Klubista)",
          type: "object",
          description: "Kuva vasemmalla, teksti oikealla.",
          fields: [
            piilotaLohko,
            { name: "eyebrow", title: "Yläotsake", type: "string", description: "Pieni versaaliteksti otsikon yläpuolella.", initialValue: "Klubista" },
            { name: "heading", title: "Otsikko", type: "string" },
            { name: "body", title: "Teksti", type: "portableText" },
            { name: "image", title: "Kuva", type: "imageWithAlt" },
            { name: "ctaLabel", title: "Linkin teksti", type: "string", description: 'Esim. "Lue lisää klubista".' },
            defineField({
              name: "ctaLinkki",
              title: "Linkin kohde",
              type: "linkki",
              validation: (rule) =>
                rule
                  .custom((arvo, konteksti) => {
                    const lohko = konteksti.parent as { ctaLabel?: string; ctaHref?: string } | undefined;
                    // Vanha osoite (ctaHref) riittää sivustolle, kunnes linkit muunnetaan
                    // (docs/24 askel 5), mutta keskeneräisestä valinnasta varoitetaan aina.
                    return puuttuukoLinkinKohde(lohko?.ctaLabel, arvo as Parameters<typeof puuttuukoLinkinKohde>[1], lohko?.ctaHref)
                      ? "Lisää linkin kohde tai poista linkin teksti."
                      : true;
                  })
                  .warning(),
            }),
            vanhaCtaHref,
          ],
          preview: {
            select: { title: "heading", piilota: "piilota" },
            prepare: ({ title, piilota }) => ({ title: title || "Esittelyteksti", subtitle: lohkonAlaotsikko(piilota) }),
          },
        }),
        defineArrayMember({
          name: "ravintolatSpotlight",
          title: "Ravintola-arviot",
          type: "object",
          description: "Tuoreimmin arvioidut ravintolat kortteina (viimeisin käynti ensin).",
          fields: [
            piilotaLohko,
            { name: "eyebrow", title: "Yläotsake", type: "string", description: "Pieni versaaliteksti otsikon yläpuolella.", initialValue: "Ravintola-arviot" },
            { name: "heading", title: "Otsikko", type: "string", initialValue: "Missä pelipäivänä syödään" },
            { name: "city", title: "Kaupunki (suodatin, valinnainen)", type: "reference", to: [{ type: "kaupunki" }] },
            { name: "count", title: "Näytettävien määrä", type: "number", initialValue: 3, validation: (r) => r.min(1).max(9) },
          ],
          preview: {
            select: { piilota: "piilota" },
            prepare: ({ piilota }) => ({ title: "Ravintola-arviot", subtitle: lohkonAlaotsikko(piilota) }),
          },
        }),
        defineArrayMember({
          name: "jalkapalloarkisto",
          title: "Jalkapalloarkisto-nosto",
          type: "object",
          fields: [
            piilotaLohko,
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
            defineField({
              name: "ctaLinkki",
              title: "Napin kohde",
              type: "linkki",
              description: "Jätä tyhjäksi, niin nappi vie jalkapalloarkiston etusivulle.",
            }),
            vanhaCtaHref,
          ],
          preview: {
            select: { title: "heading", piilota: "piilota" },
            prepare: ({ title, piilota }) => ({
              title: title || "Jalkapalloarkisto-nosto",
              subtitle: lohkonAlaotsikko(piilota),
            }),
          },
        }),
        defineArrayMember({
          name: "galleria",
          title: "Galleria-nosto",
          type: "object",
          fields: [
            piilotaLohko,
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
          preview: {
            select: { piilota: "piilota" },
            prepare: ({ piilota }) => ({ title: "Galleria-nosto", subtitle: lohkonAlaotsikko(piilota) }),
          },
        }),
      ],
      group: "blocks",
    }),
    legacyUrlField("seo"),
  ],
  preview: { prepare: () => ({ title: "Etusivu" }) },
});
