import { MenuIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { linkinEsikatselunKentat, linkinEsikatselunTekstit, linkinEsikatselu, linkkiKentat } from "../objects/linkki";

/**
 * Päänavigaation singleton. Esitäytetty valmiilla 6 päälinkillä + CTA:lla
 * sivuston julkaisua varten. Isä voi muokata Studiossa raahaamalla.
 *
 * Rakenne perustuu vanhan sivuston 10+1 linkin auditointiin
 * (ks. docs/02-information-architecture.md).
 *
 * Kohdat ovat linkkiobjekteja (docs/24 askel 4): Sivuston sivu seuraa sivun
 * osoitteen muutosta. Vanha muoto { label, href } on kelvollinen Muu osoite.
 * Alatunnisteen linkkisarakkeet johdetaan tästä valikosta (lib/navigaatio.ts).
 */
export const navigaatio = defineType({
  name: "navigaatio",
  title: "Navigaatio",
  type: "document",
  icon: MenuIcon,
  fields: [
    defineField({
      name: "items",
      title: "Päänavigaation linkit",
      description:
        "Järjestä raahaamalla. Enintään 7 päälinkkiä. Sama valikko näkyy sivun alareunassa (alatunniste): kohdat, joilla on alavalikko, omina sarakkeinaan ja muut sarakkeessa Sivusto. Tyhjät osiot (esim. Tapahtumat ilman tapahtumia) piiloutuvat itsestään.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            { name: "label", title: "Otsikko", type: "string", validation: (rule) => rule.required() },
            ...linkkiKentat({ pakollinen: true }),
            // Tyyliopas: valikossa ei ole CTA-korostusta. Vanhentunut kenttä: näkyy vain
            // (lukittuna, varoituksen kera) niissä linkeissä, joissa sillä on jo arvo.
            defineField({
              name: "highlight",
              title: "Korosta (CTA)",
              type: "boolean",
              deprecated: { reason: "Uudessa ilmeessä valikossa ei ole korostettuja linkkejä. Kenttää ei enää käytetä." },
              readOnly: true,
              hidden: ({ value }) => value === undefined,
              initialValue: undefined,
            }),
            {
              name: "children",
              title: "Alavalikko",
              description: "Näkyy valikossa avautuvana listana ja alatunnisteessa omana sarakkeenaan.",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    { name: "label", title: "Otsikko", type: "string", validation: (rule) => rule.required() },
                    ...linkkiKentat({ pakollinen: true }),
                  ],
                  preview: linkinEsikatselu("label"),
                },
              ],
            },
          ],
          preview: {
            select: { ...linkinEsikatselunKentat("label"), highlight: "highlight" },
            prepare: ({ highlight, ...arvot }) => {
              const { title, subtitle } = linkinEsikatselunTekstit(arvot);
              return { title: highlight ? `★ ${title}` : title, subtitle };
            },
          },
        }),
      ],
      validation: (rule) => rule.max(7).warning("Maksimi 7 päälinkkiä mobiilin luettavuuden takia."),
      initialValue: [
        {
          label: "Klubi",
          href: "/klubi",
          children: [
            { label: "Esittely", href: "/klubi" },
            { label: "Hallitus", href: "/klubi/hallitus" },
            { label: "Palloveikkaus", href: "/klubi/palloveikkaus" },
            { label: "Yhteystiedot", href: "/klubi/yhteystiedot" },
          ],
        },
        { label: "Tapahtumat", href: "/tapahtumat" },
        { label: "Uutiset", href: "/uutiset" },
        {
          label: "Jalkapalloarkisto",
          href: "/jalkapalloarkisto",
          children: [
            { label: "Huuhkajat", href: "/jalkapalloarkisto/huuhkajat" },
            { label: "Suomen mestarit", href: "/jalkapalloarkisto/mestarit" },
            { label: "Eurocupit", href: "/jalkapalloarkisto/eurocupit" },
            { label: "Vuoden pelaajat", href: "/jalkapalloarkisto/vuoden-pelaajat" },
            { label: "Stadionit", href: "/jalkapalloarkisto/stadionit" },
          ],
        },
        { label: "Ravintolat", href: "/ravintolat" },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Navigaatio" }) },
});
