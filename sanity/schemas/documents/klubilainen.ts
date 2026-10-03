import { UserIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

/**
 * Klubilainen: ravintola-arvioija.
 *
 * Arvosanat (`klubiArvio`) ja lomakkeen arvostelut liitetään klubilaiseen,
 * jotta saman ihmisen uusi arvio korvaa hänen edellisensä ("VEIKKO"
 * ruokailutaulukossa ja "Veikko" lomakkeella ovat sama ihminen).
 * Nimi näkyy ravintolasivun Klubilaisten arvosanat -taulukossa.
 */
export const klubilainen = defineType({
  name: "klubilainen",
  title: "Klubilainen",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "nimi",
      title: "Nimi",
      description:
        "Näkyy ravintolasivun Klubilaisten arvosanat -taulukossa. Lomakkeen arvostelu liitetään " +
        "klubilaiseen automaattisesti, kun arvostelija kirjoittaa saman nimen.",
      type: "string",
      validation: (rule) => rule.required().error("Nimi on pakollinen."),
    }),
    defineField({
      name: "taulukkoNumero",
      title: "Numero ruokailutaulukossa",
      description: "Arvioijan numero vanhassa Excel-taulukossa (R1, R2 …). Vain tuontia varten.",
      type: "number",
      readOnly: true,
      hidden: ({ value }) => value === undefined,
    }),
  ],
  orderings: [{ title: "Nimi A–Ö", name: "nimiAsc", by: [{ field: "nimi", direction: "asc" }] }],
  preview: { select: { title: "nimi" } },
});
