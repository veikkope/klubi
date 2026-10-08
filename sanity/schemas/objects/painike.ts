import { ArrowRightIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { linkinEsikatselunKentat, linkinEsikatselunTekstit, vaadiLinkki } from "./linkki";

/**
 * Painike tekstin seassa (docs/24 askel 6), esim. "Ilmoittaudu" tai "Lue
 * säännöt". Kohde valitaan samalla linkkiobjektilla kuin valikossa ja
 * etusivulla (Sivuston sivu / Muu osoite / Tiedosto, §2.2).
 */
export const painike = defineType({
  name: "painike",
  title: "Painike",
  type: "object",
  icon: ArrowRightIcon,
  fields: [
    defineField({
      name: "teksti",
      title: "Painikkeen teksti",
      type: "string",
      description: 'Lyhyt toiminto, esim. "Ilmoittaudu" tai "Lue säännöt".',
      validation: (rule) => [
        rule.required().error("Kirjoita painikkeelle teksti."),
        rule.max(40).warning("Lyhyt teksti mahtuu puhelimessa yhdelle riville."),
      ],
    }),
    defineField({
      name: "linkki",
      title: "Mihin painike vie",
      type: "linkki",
      validation: vaadiLinkki,
    }),
  ],
  preview: {
    select: {
      teksti: "teksti",
      ...Object.fromEntries(
        Object.entries(linkinEsikatselunKentat()).map(([avain, polku]) => [avain, `linkki.${polku}`]),
      ),
    },
    prepare: ({ teksti, ...linkki }) => {
      const { subtitle } = linkinEsikatselunTekstit(linkki);
      return {
        title: teksti || "Painike",
        subtitle: `Painike · ${subtitle}`,
        media: ArrowRightIcon,
      };
    },
  },
});
