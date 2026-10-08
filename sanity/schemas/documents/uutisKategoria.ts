import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { AIEMMAT_TUNNISTEET_KUVAUS, aiemmatPolutField, polkuMuuttunut } from "../objects/contentMeta";

/**
 * Uutiskategoria (docs/05, docs/09). Sihteeri lisää ja nimeää kategoriat
 * itse; uutinen viittaa kategoriaan (`uutinen.kategoriat`), joten nimen
 * muutos näkyy kaikissa uutisissa, eikä käytössä olevaa kategoriaa voi
 * poistaa vahingossa (Sanity estää poiston, kun siihen viitataan).
 *
 * Polku on uutislistan suodattimen osoite: /uutiset?kategoria=<polku>.
 * Vanhojen kategorioiden polut säilytettiin siirrossa (4.10.2026), joten
 * vanhat linkit toimivat. Kun polku muuttuu, webhook tallentaa vanhan
 * kenttään `aiemmatPolut`, ja uutislista ohjaa sen uuteen.
 */
export const uutisKategoria = defineType({
  name: "uutisKategoria",
  title: "Uutiskategoria",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "nimi",
      title: "Nimi",
      description: "Näkyy uutisten yhteydessä ja uutislistan suodattimessa, esim. Matkakuvaus.",
      type: "string",
      validation: (rule) => [
        rule.required().min(2).max(40).error("Nimi on pakollinen (2–40 merkkiä)."),
        rule.custom(async (nimi, context) => {
          if (!nimi) return true;
          const id = (context.document?._id ?? "").replace(/^drafts\./, "");
          const sama = await context
            .getClient({ apiVersion: "2025-08-15" })
            .fetch<number>(
              `count(*[_type == "uutisKategoria" && lower(nimi) == lower($nimi) && !(_id in [$id, "drafts." + $id])])`,
              { nimi: nimi.trim(), id },
            );
          return sama > 0 ? "Samanniminen kategoria on jo olemassa." : true;
        }),
      ],
    }),
    defineField({
      name: "slug",
      title: "Osoite suodattimessa",
      description:
        "Muodostuu nimestä: paina Luo. Osoite on /uutiset?kategoria=tämä-osa. " +
        "Jos muutat julkaistun kategorian osoitetta, vanhat linkit ohjautuvat uuteen automaattisesti.",
      type: "slug",
      options: { source: "nimi", maxLength: 40 },
      validation: (rule) => [
        rule.required().error("Paina Luo, niin osoite muodostuu nimestä."),
        polkuMuuttunut(rule),
      ],
    }),
    defineField({
      name: "kuvaus",
      title: "Kuvaus hakukoneille (valinnainen)",
      description: "Lyhyt kuvaus kategorian uutislistalle hakutuloksiin. Jos tyhjä, kuvaus kootaan nimestä.",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(200).warning("Hakukone näyttää noin 160 ensimmäistä merkkiä."),
    }),
    defineField({
      name: "jarjestys",
      title: "Järjestys suodattimessa",
      description: "Pienin numero ensin. Jos tyhjä, kategoria tulee numeroitujen jälkeen aakkosjärjestyksessä.",
      type: "number",
      validation: (rule) => rule.integer().min(0).error("Anna kokonaisluku, esim. 10."),
    }),
    // Webhook lisää vanhan osoitteen, kun osoite muuttuu (docs/24 askel 8).
    // Ennen askelta 8 muokattava kenttä: nimi ja datamuoto ennallaan.
    aiemmatPolutField(undefined, AIEMMAT_TUNNISTEET_KUVAUS),
  ],
  orderings: [
    {
      title: "Suodattimen järjestys",
      name: "jarjestysAsc",
      by: [
        { field: "jarjestys", direction: "asc" },
        { field: "nimi", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { nimi: "nimi", slug: "slug.current" },
    prepare: ({ nimi, slug }) => ({
      title: nimi ?? "Nimetön kategoria",
      subtitle: slug ? `/uutiset?kategoria=${slug}` : "Osoite puuttuu",
    }),
  },
});
