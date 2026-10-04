import { UserIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { apiVersion } from "../../env";

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
        "Näkyy ravintolasivun Klubilaisten arvosanat -taulukossa ja arvostelulomakkeen nimivalinnassa. " +
        "Lomakkeen arvostelu liitetään klubilaiseen, kun arvostelija valitsee nimensä.",
      type: "string",
      validation: (rule) => [
        rule.required().error("Nimi on pakollinen."),
        // Arvostelulomakkeen nimipainikkeet erottuvat vain eri nimillä.
        rule.custom(async (nimi, context) => {
          if (typeof nimi !== "string" || !nimi.trim()) return true;
          const id = (context.document?._id ?? "").replace(/^drafts\./, "");
          const samoja = await context
            .getClient({ apiVersion })
            .fetch<number>(
              `count(*[_type == "klubilainen" && lower(nimi) == lower($nimi) && !(_id in [$id, "drafts." + $id])])`,
              { nimi: nimi.trim(), id },
            );
          return samoja > 0
            ? "Samanniminen klubilainen on jo olemassa. Lisää sukunimen alkukirjain (esim. \"Mikko K.\"), jotta nimet erottuvat arvostelulomakkeella."
            : true;
        }),
      ],
    }),
    defineField({
      name: "lomakkeella",
      title: "Näytä arvostelulomakkeella",
      description:
        "Klubilainen voi valita nimensä arvostelulomakkeella. Poista valinta, kun klubilainen ei enää arvostele " +
        "(esim. lopettanut): hänen aiemmat arvosanansa säilyvät ravintoloilla.",
      type: "boolean",
      initialValue: true,
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
  preview: {
    select: { title: "nimi", lomakkeella: "lomakkeella" },
    prepare: ({ title, lomakkeella }) => ({
      title,
      subtitle: lomakkeella === false ? "Ei arvostelulomakkeella" : undefined,
    }),
  },
});
