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
      name: "ehdotettuRavintola",
      title: "Kävijän ehdottama uusi ravintola",
      description:
        "Ravintolaa ei ollut hakemistossa. Tarkista tiedot ja paina alareunasta " +
        "\"Hyväksy ja luo ravintola\": ravintola lisätään hakemistoon ja arvostelu julkaistaan. " +
        "Voit myös valita alta olemassa olevan ravintolan, jos se löytyy jo toisella nimellä.",
      type: "object",
      readOnly: true,
      hidden: ({ value }) => !value,
      fields: [
        defineField({ name: "nimi", title: "Nimi", type: "string" }),
        defineField({ name: "kaupunki", title: "Kaupunki", type: "string" }),
        defineField({ name: "maa", title: "Maa", type: "string" }),
        defineField({ name: "lisatieto", title: "Osoite tai verkkosivu", type: "string" }),
      ],
    }),
    defineField({
      name: "restaurant",
      title: "Ravintola",
      type: "reference",
      to: [{ type: "ravintola" }],
      validation: (rule) =>
        rule.custom((value, context) => {
          if (value) return true;
          const ehdotus = (context.document as { ehdotettuRavintola?: { nimi?: string } } | undefined)
            ?.ehdotettuRavintola;
          return ehdotus
            ? `Ravintolaa "${ehdotus.nimi ?? ""}" ei ole vielä hakemistossa. Paina "Hyväksy ja luo ravintola" tai valitse olemassa oleva ravintola.`
            : "Valitse ravintola.";
        }),
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
      type: "text",
      rows: 5,
      validation: (rule) => rule.required().max(1000).error("Arvostelu on pakollinen (enintään 1000 merkkiä)."),
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
      kuvat: "kuvat",
    },
    prepare({ name, restaurant, uusi, food, price, atmosphere, submittedAt, kuvat }) {
      const pvm = submittedAt ? new Date(submittedAt).toLocaleDateString("fi-FI") : "";
      const osat = [food, price, atmosphere].filter((v): v is number => typeof v === "number");
      const ka = osat.length === 3 ? `★ ${((food + price + atmosphere) / 3).toFixed(1).replace(".", ",")}` : "";
      const kuvia = Array.isArray(kuvat) ? kuvat.length : 0;
      return {
        title: `${name ?? "?"} → ${restaurant ?? (uusi ? `UUSI: ${uusi}` : "?")}`,
        subtitle: [ka, kuvia > 0 ? `${kuvia} ${kuvia === 1 ? "kuva" : "kuvaa"}` : "", pvm]
          .filter(Boolean)
          .join(" · "),
        // Ensimmäinen kuva listan pikkukuvaksi, jotta kuvalliset erottuvat jonossa.
        media: kuvia > 0 ? kuvat[0] : undefined,
      };
    },
  },
});
