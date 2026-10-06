import { CommentIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

/**
 * Kävijän ravintola-arvostelu.
 *
 * Moderointi on Sanityn oma julkaisumalli: lomake tallentaa arvostelun
 * luonnoksena, jota ei voi lukea julkisesta rajapinnasta. Sihteeri **hyväksyy
 * julkaisemalla** (Publish) ja **hylkää poistamalla** luonnoksen. Erillistä
 * tilakenttää ei tarvita, joten hyväksyntää ei voi unohtaa julkaisun jälkeen.
 *
 * Arvostelijalta kysytään vain julkaistava nimi (tietojen minimointi, docs/16).
 *
 * Kävijä voi arvostella myös ravintolan, jota hakemistossa ei vielä ole. Silloin
 * `restaurant` puuttuu ja ehdotuksen tiedot ovat `ehdotettuRavintola`-kentässä.
 * Arvostelua ei voi julkaista ilman ravintolaa: toiminto "Hyväksy ja luo
 * ravintola" (sanity/actions/hyvaksy-ja-luo-ravintola.tsx) luo ravintolan,
 * liittää arvostelun siihen ja julkaisee molemmat.
 *
 * Kuvat (enintään 3, docs/18): Sanityn kuvatiedostoilla ei ole luonnostilaa,
 * joten hylkäys ja poisto tehdään toiminnolla "Hylkää arvostelu" / "Poista
 * arvostelu", joka poistaa myös kuvat (sanity/actions/hylkaa-arvostelu.tsx).
 * Tavallinen Poista on piilotettu tältä tyypiltä (sanity.config.ts).
 */
export const ravintolaKayttajaArvostelu = defineType({
  name: "ravintolaKayttajaArvostelu",
  title: "Käyttäjän ravintola-arvostelu",
  type: "document",
  icon: CommentIcon,
  description:
    "Hyväksy arvostelu painamalla Julkaise. Jos kävijä ehdotti uutta ravintolaa, paina " +
    "\"Hyväksy ja luo ravintola\". Hylkää painamalla \"Hylkää arvostelu\" (poistaa myös kuvat). " +
    "Julkaistu arvostelu näkyy ravintolan sivulla.",
  fields: [
    defineField({
      name: "reviewerName",
      title: "Arvostelijan nimi",
      description: "Näkyy sivulla arvostelun yhteydessä.",
      type: "string",
      validation: (rule) => rule.required().error("Nimi on pakollinen."),
    }),
    defineField({
      name: "arvioija",
      title: "Klubilainen",
      description:
        "Lomake liittää klubilaisen itse, kun arvostelija valitsee nimensä listasta tai kirjoittaa saman nimen. Klubilaisen arvostelu saa sivulla merkin " +
        "\"Klubilainen\", ja se korvaa hänen aiemman arvosanansa ravintolalle. Jätä tyhjäksi, jos " +
        "arvostelija ei ole klubilainen: arvostelu näkyy silti, mutta ei vaikuta ravintolan arvosanaan.",
      type: "reference",
      to: [{ type: "klubilainen" }],
      validation: (rule) =>
        rule.custom((arvioija) =>
          arvioija
            ? true
            : "Arvostelijaa ei ole liitetty klubilaiseen. Valitse klubilainen, jos arvostelija on klubin jäsen.",
        ).warning(),
    }),
    defineField({
      name: "ehdotettuRavintola",
      title: "Kävijän ehdottama uusi ravintola",
      description:
        "Ravintolaa ei ollut hakemistossa. Tarkista ja korjaa tiedot tarvittaessa ja paina alareunasta " +
        "\"Hyväksy ja luo ravintola\": ravintola luodaan näillä tiedoilla ja arvostelu julkaistaan. " +
        "Voit myös valita alta olemassa olevan ravintolan, jos se löytyy jo toisella nimellä.",
      type: "object",
      // Muokattava: sihteeri voi korjata kirjoitusvirheet ja lisätä osoitteen ennen
      // hyväksyntää. "Hyväksy ja luo ravintola" lukee tiedot luonnoksesta.
      hidden: ({ value }) => !value,
      fields: [
        defineField({
          name: "nimi",
          title: "Nimi",
          type: "string",
          validation: (rule) => rule.required().error("Ravintolan nimi on pakollinen."),
        }),
        defineField({
          name: "kaupunki",
          title: "Kaupunki",
          type: "string",
          validation: (rule) => rule.required().error("Kaupunki on pakollinen."),
        }),
        defineField({ name: "maa", title: "Maa", type: "string" }),
        defineField({
          name: "lisatieto",
          title: "Osoite tai verkkosivu",
          description: "Verkko-osoite (https://… tai www.…) tallentuu ravintolan verkkosivuksi, muu teksti osoitteeksi.",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "restaurant",
      title: "Ravintola",
      type: "reference",
      to: [{ type: "ravintola" }],
      // Uuden ravintolan ehdotuksessa tyhjä ravintola on odotettu tila (keltainen
      // ohje, ei punaista virhettä): "Hyväksy ja luo ravintola" täyttää sen, eikä
      // tavallista Julkaise-toimintoa ole (sanity.config.ts). Muuten pakollinen.
      validation: (rule) => [
        rule.custom((value, context) => {
          const ehdotus = (context.document as { ehdotettuRavintola?: { nimi?: string } } | undefined)
            ?.ehdotettuRavintola;
          return value || ehdotus?.nimi ? true : "Valitse ravintola.";
        }),
        rule
          .custom((value, context) => {
            const ehdotus = (context.document as { ehdotettuRavintola?: { nimi?: string } } | undefined)
              ?.ehdotettuRavintola;
            return !value && ehdotus?.nimi
              ? `Uusi ravintola "${ehdotus.nimi}": paina alareunan vihreää "Hyväksy ja luo ravintola". ` +
                  "Jos ravintola on jo hakemistossa toisella nimellä, valitse se tähän."
              : true;
          })
          .warning(),
      ],
    }),
    defineField({
      name: "kayntipaiva",
      title: "Käyntipäivä",
      description:
        "Milloin arvostelija kävi ravintolassa (lomakkeella oletuksena lähetyspäivä). Klubilaisen " +
        "arvostelun päivä näkyy ravintolan sivulla klubin käyntinä. Vanhoissa arvosteluissa tyhjä: " +
        "silloin käytetään lähetyspäivää.",
      type: "date",
      options: { dateFormat: "D.M.YYYY" },
      validation: (rule) =>
        rule.custom((paiva) =>
          typeof paiva === "string" && paiva > new Date().toISOString().slice(0, 10)
            ? "Käyntipäivä ei voi olla tulevaisuudessa."
            : true,
        ),
    }),
    // Arvosana kolmesta osa-alueesta kuten klubin arvioissa (ravintola.ratingFood jne.).
    // Kokonaisarvosana on keskiarvo, ja se lasketaan kyselyssä.
    ...(
      [
        ["ratingFood", "Ruoka (1,0–5,0)"],
        ["ratingPrice", "Hinta (1,0–5,0)"],
        ["ratingAtmosphere", "Viihtyvyys (1,0–5,0)"],
      ] as const
    ).map(([name, title]) =>
      defineField({
        name,
        title,
        type: "number",
        validation: (rule) =>
          rule.required().min(1).max(5).precision(1).error("Arvosana on 1,0–5,0 yhden desimaalin tarkkuudella."),
      }),
    ),
    defineField({
      name: "comment",
      title: "Arvostelu",
      description: "Vapaaehtoinen: arvostelija voi antaa pelkät arvosanat.",
      type: "text",
      rows: 5,
      validation: (rule) => rule.max(1000).error("Arvostelu saa olla enintään 1000 merkkiä."),
    }),
    defineField({
      name: "kuvat",
      title: "Kuvat",
      description:
        "Kävijän liittämät kuvat (enintään 3). Tarkista ne ennen julkaisua. Voit poistaa " +
        "yksittäisen kuvan (⋯ → Poista) ja korjata kuvauksen. Kuvauksen lukee ruudunlukija.",
      type: "array",
      of: [
        {
          type: "image",
          fields: [
            defineField({
              name: "alt",
              title: "Kuvaus (alt-teksti)",
              description: "Mitä kuvassa on, esim. \"Paahdettu lohi ja perunamuusi\".",
              type: "string",
              validation: (rule) =>
                rule.required().max(150).error("Kuvaus on pakollinen (enintään 150 merkkiä)."),
            }),
          ],
        },
      ],
      validation: (rule) => rule.max(3).error("Arvostelussa voi olla enintään 3 kuvaa."),
    }),
    defineField({
      name: "submittedAt",
      title: "Lähetysaika",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
  ],
  orderings: [
    { title: "Lähetysaika (uusin ensin)", name: "submittedAtDesc", by: [{ field: "submittedAt", direction: "desc" }] },
  ],
  preview: {
    select: {
      name: "reviewerName",
      restaurant: "restaurant.name",
      uusi: "ehdotettuRavintola.nimi",
      food: "ratingFood",
      price: "ratingPrice",
      atmosphere: "ratingAtmosphere",
      submittedAt: "submittedAt",
      kayntipaiva: "kayntipaiva",
      kuvat: "kuvat",
      // Esikatselu seuraa viittausta: "arvioija._ref" haettaisiin klubilaisesta
      // itsestään ja olisi aina tyhjä. Klubilaisen _id kertoo, että viittaus on.
      arvioija: "arvioija._id",
    },
    prepare({ name, restaurant, uusi, food, price, atmosphere, submittedAt, kayntipaiva, kuvat, arvioija }) {
      // Käyntipäivä, vanhoissa arvosteluissa lähetyspäivä.
      const pvm = kayntipaiva
        ? new Date(`${kayntipaiva}T12:00:00`).toLocaleDateString("fi-FI")
        : submittedAt
          ? new Date(submittedAt).toLocaleDateString("fi-FI")
          : "";
      const osat = [food, price, atmosphere].filter((v): v is number => typeof v === "number");
      const ka = osat.length === 3 ? `★ ${((food + price + atmosphere) / 3).toFixed(1).replace(".", ",")}` : "";
      const kuvia = Array.isArray(kuvat) ? kuvat.length : 0;
      return {
        title: `${name ?? "?"} → ${restaurant ?? (uusi ? `UUSI: ${uusi}` : "?")}`,
        subtitle: [
          arvioija ? "" : "Ei klubilainen",
          ka,
          kuvia > 0 ? `${kuvia} ${kuvia === 1 ? "kuva" : "kuvaa"}` : "",
          pvm,
        ]
          .filter(Boolean)
          .join(" · "),
        // Ensimmäinen kuva listan pikkukuvaksi, jotta kuvalliset erottuvat jonossa.
        media: kuvia > 0 ? kuvat[0] : undefined,
      };
    },
  },
});
