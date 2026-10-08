import { PinIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { AIEMMAT_TUNNISTEET_KUVAUS, aiemmatPolutField, polkuMuuttunut } from "../objects/contentMeta";

import { MAAKUNNAT, SUOMI, maakuntaTitle } from "../../../lib/maakunnat";

export const kaupunki = defineType({
  name: "kaupunki",
  title: "Kaupunki",
  type: "document",
  icon: PinIcon,
  fields: [
    defineField({
      name: "name",
      title: "Nimi",
      type: "string",
      description:
        "Kaupungin tai paikkakunnan nimi suomeksi, esim. \"Lahti\", \"Tukholma\" tai \"Sirkka\".",
      validation: (rule) => rule.required().error("Kirjoita kaupungin nimi."),
    }),
    defineField({
      name: "slug",
      title: "Osoite suodattimessa",
      type: "slug",
      description:
        "Muodostuu nimestä: paina Luo. Esim. /ravintolat?kaupunki=lahti. Jos muutat julkaistun " +
        "kaupungin osoitetta, vanhat linkit ohjautuvat uuteen automaattisesti.",
      options: { source: "name", maxLength: 60 },
      validation: (rule) => [
        rule.required().error("Paina Luo, niin osoite muodostuu nimestä."),
        polkuMuuttunut(rule),
      ],
    }),
    aiemmatPolutField(undefined, AIEMMAT_TUNNISTEET_KUVAUS),
    defineField({
      name: "country",
      title: "Maa",
      type: "string",
      description:
        "Maan virallinen suomenkielinen nimi, esim. \"Suomi\", \"Saksa\", \"Venäjä\", \"Alankomaat\", " +
        "\"Iso-Britannia\" tai \"Tšekki\". Kirjoita nimi aina samalla tavalla — ravintolahakemiston " +
        "maasuodatin ryhmittelee kaupungit tämän kentän mukaan.",
      initialValue: SUOMI,
      validation: (rule) =>
        rule
          .required()
          .error("Kirjoita maa, esim. \"Suomi\".")
          .custom((value) => {
            if (!value) return true;
            if (value !== value.trim()) return "Poista välilyönnit nimen alusta ja lopusta.";
            if (value[0] !== value[0].toLocaleUpperCase("fi")) {
              return "Kirjoita maan nimi isolla alkukirjaimella, esim. \"Saksa\".";
            }
            return true;
          }),
    }),
    defineField({
      name: "maakunta",
      title: "Maakunta",
      type: "string",
      description:
        "Suomen maakunta, johon kaupunki kuuluu. Ravintolahakemiston maakuntasuodatin käyttää tätä. " +
        "Näkyy vain, kun maa on \"Suomi\".",
      options: { list: MAAKUNNAT.map((m) => ({ title: m.title, value: m.value })), layout: "dropdown" },
      hidden: ({ document }) => document?.country !== SUOMI,
      validation: (rule) =>
        rule.custom((value, context) => {
          const country = (context.document as { country?: string } | undefined)?.country;
          if (country === SUOMI && !value) {
            return "Valitse maakunta, jotta kaupungin ravintolat löytyvät maakuntasuodattimella.";
          }
          return true;
        }).warning(),
    }),
  ],
  orderings: [
    { title: "Nimi A–Ö", name: "nameAsc", by: [{ field: "name", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", country: "country", maakunta: "maakunta" },
    prepare({ title, country, maakunta }) {
      const region = country === SUOMI ? maakuntaTitle(maakunta) : null;
      return {
        title,
        subtitle: [region, country].filter(Boolean).join(", ") || undefined,
      };
    },
  },
});
