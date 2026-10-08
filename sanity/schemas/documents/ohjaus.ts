import { ArrowRightIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { linkinKuvaus } from "../../../lib/linkki";
import { tarkistaOhjauksenLahde } from "../../../lib/ohjaukset";
import { kohdeEiItseensa, kohdeOnOhjaus, lahdeKorvaaAutomaattisen, lahdeOnVapaa } from "../../lib/ohjauksen-lahde";
import { OSOITE_OTSIKKO } from "../objects/sanasto";
import { vaadiLinkki } from "../objects/linkki";

/**
 * Ohjaus tai lyhytosoite (docs/24 askel 8, docs/09 "Lyhytosoite esitteeseen").
 * Isä tekee lyhyen osoitteen esitteeseen (esim. /jasenmaksu) tai ohjaa
 * poistetun sivun osoitteen toiselle sivulle. Ohjaus ratkaistaan vain, kun
 * osoitteessa ei ole sivua (sanity/lib/ohjaus.ts), ja se on tilapäinen (307),
 * joten kohteen voi vaihtaa milloin vain.
 */
export const ohjaus = defineType({
  name: "ohjaus",
  title: "Ohjaus tai lyhytosoite",
  type: "document",
  icon: ArrowRightIcon,
  description:
    "Lyhyt osoite esitteeseen (esim. /jasenmaksu) tai poistetun sivun osoite, joka ohjataan toiselle sivulle.",
  fields: [
    defineField({
      name: "lahde",
      title: OSOITE_OTSIKKO,
      description:
        "Osoite, jonka kävijä kirjoittaa tai joka painetaan esitteeseen, esim. /jasenmaksu. Alkaa " +
        "kauttaviivalla. Käytä vain pieniä kirjaimia a–z, numeroita ja yhdysmerkkejä. Ohjaus toimii " +
        "vain osoitteessa, jossa ei ole sivua.",
      type: "string",
      initialValue: "/",
      validation: (rule) => [
        rule.custom((arvo: string | undefined) => tarkistaOhjauksenLahde(arvo)),
        rule.custom(lahdeOnVapaa),
        rule.custom(lahdeKorvaaAutomaattisen).warning(),
      ],
    }),
    defineField({
      name: "minne",
      title: "Minne ohjataan",
      description:
        "Valitse sivuston sivu listasta, kirjoita ulkoinen osoite (https://…) tai valitse tiedosto. " +
        "Kohteen voi vaihtaa milloin vain.",
      type: "linkki",
      validation: (rule) => [
        vaadiLinkki(rule),
        rule.custom(kohdeEiItseensa),
        rule.custom(kohdeOnOhjaus).warning(),
      ],
    }),
    defineField({
      name: "muistiinpano",
      title: "Muistiinpano (ei näy sivuilla)",
      description:
        "Mihin osoitetta käytetään, esim. \"Jäsenmaksukirje 2027\". Näkyy kaikille, jotka lukevat " +
        "sivuston tietokantaa. Älä kirjoita henkilötietoja.",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(300).error("Enintään 300 merkkiä."),
    }),
  ],
  orderings: [{ title: "Osoite A–Ö", name: "lahdeAsc", by: [{ field: "lahde", direction: "asc" }] }],
  preview: {
    select: {
      lahde: "lahde",
      tyyppi: "minne.tyyppi",
      href: "minne.href",
      kohdeTyyppi: "minne.kohde._type",
      kohdeSlug: "minne.kohde.slug.current",
      kohdeOtsikko: "minne.kohde.title",
      kohdeNimi: "minne.kohde.name",
      tiedostonNimi: "minne.tiedosto.asset.originalFilename",
      muistiinpano: "muistiinpano",
    },
    prepare: ({ lahde, kohdeOtsikko, kohdeNimi, muistiinpano, ...linkki }) => {
      const kohde = linkinKuvaus({ ...linkki, kohdeNimi: kohdeOtsikko || kohdeNimi });
      return {
        title: lahde && lahde !== "/" ? lahde : "Osoite puuttuu",
        subtitle: `${kohde}${muistiinpano ? ` · ${muistiinpano}` : ""}`,
        media: ArrowRightIcon,
      };
    },
  },
});
