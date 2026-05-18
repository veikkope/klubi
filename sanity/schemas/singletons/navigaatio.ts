import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Päänavigaation singleton. Esitäytetty valmiilla 6 päälinkillä + CTA:lla
 * sivuston julkaisua varten. Isä voi muokata Studiossa raahaamalla.
 *
 * Rakenne perustuu vanhan sivuston 10+1 linkin auditointiin
 * (ks. docs/02-information-architecture.md).
 */
export const navigaatio = defineType({
  name: "navigaatio",
  title: "Navigaatio",
  type: "document",
  fields: [
    defineField({
      name: "items",
      title: "Päänavigaation linkit",
      description: "Järjestä raahaamalla. Maksimi 7 päälinkkiä.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            { name: "label", title: "Otsikko", type: "string", validation: (rule) => rule.required() },
            { name: "href", title: "Linkki (esim. /tapahtumat)", type: "string", validation: (rule) => rule.required() },
            { name: "highlight", title: "Korosta (CTA)", type: "boolean", initialValue: false },
            {
              name: "children",
              title: "Alavalikko",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    { name: "label", title: "Otsikko", type: "string", validation: (rule) => rule.required() },
                    { name: "href", title: "Linkki", type: "string", validation: (rule) => rule.required() },
                  ],
                  preview: { select: { title: "label", subtitle: "href" } },
                },
              ],
            },
          ],
          preview: {
            select: { title: "label", subtitle: "href", highlight: "highlight" },
            prepare: ({ title, subtitle, highlight }) => ({
              title: highlight ? `★ ${title}` : title,
              subtitle,
            }),
          },
        }),
      ],
      validation: (rule) => rule.max(7).warning("Maksimi 7 päälinkkiä mobiilin luettavuuden takia."),
      initialValue: [
        {
          label: "Klubi",
          href: "/klubi",
          highlight: false,
          children: [
            { label: "Esittely", href: "/klubi" },
            { label: "Hallitus", href: "/klubi/hallitus" },
            { label: "Säännöt", href: "/klubi/saannot" },
            { label: "Palloveikkaus", href: "/klubi/palloveikkaus" },
            { label: "Yhteystiedot", href: "/klubi/yhteystiedot" },
          ],
        },
        { label: "Tapahtumat", href: "/tapahtumat", highlight: false },
        { label: "Uutiset", href: "/uutiset", highlight: false },
        {
          label: "Jalkapalloarkisto",
          href: "/jalkapalloarkisto",
          highlight: false,
          children: [
            { label: "Huuhkajat", href: "/jalkapalloarkisto/huuhkajat" },
            { label: "Suomen mestarit", href: "/jalkapalloarkisto/mestarit" },
            { label: "Eurocupit", href: "/jalkapalloarkisto/eurocupit" },
            { label: "Vuoden pelaajat", href: "/jalkapalloarkisto/vuoden-pelaajat" },
            { label: "Stadionit", href: "/jalkapalloarkisto/stadionit" },
          ],
        },
        { label: "Ravintolat", href: "/ravintolat", highlight: false },
        { label: "Liity jäseneksi", href: "/klubi/liity", highlight: true },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Navigaatio" }) },
});
