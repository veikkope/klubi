import { UsersIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Kokoonpano pelikentällä (Portable Text -lohko, components/kokoonpano.tsx).
 *
 * Pelaajat syötetään riveittäin hyökkäyksestä maalivahtiin, kuten vanhan
 * sivuston listoissa: "Pohjanpalo 26, Forssell 16" on ylin rivi. Sivulla rivit
 * piirretään kentälle samassa järjestyksessä ylhäältä alas.
 */
export const kokoonpano = defineType({
  name: "kokoonpano",
  title: "Kokoonpano pelikentällä",
  type: "object",
  icon: UsersIcon,
  fields: [
    defineField({
      name: "otsikko",
      title: "Otsikko",
      description: 'Esim. "Huuhkajat avauskokoonpano 2005–2025 (91 ottelua)". Näkyy kentän yläpuolella.',
      type: "string",
      validation: (rule) => rule.required().error("Kirjoita kokoonpanolle otsikko."),
    }),
    defineField({
      name: "rivit",
      title: "Rivit hyökkäyksestä maalivahtiin",
      description:
        "Ylin rivi on hyökkäys ja alin maalivahti. Pelaajat rivin sisällä vasemmalta oikealle.",
      type: "array",
      of: [
        defineArrayMember({
          name: "kokoonpanoRivi",
          title: "Rivi",
          type: "object",
          fields: [
            defineField({
              name: "nimi",
              title: "Rivin nimi (valinnainen)",
              description:
                'Ruudunlukijalle, esim. "Keskikenttä". Tyhjänä: ylin rivi "Hyökkäys", alin "Maalivahti", toiseksi alin "Puolustus", muut "Keskikenttä".',
              type: "string",
            }),
            defineField({
              name: "pelaajat",
              title: "Pelaajat",
              type: "array",
              of: [
                defineArrayMember({
                  name: "kokoonpanoPelaaja",
                  title: "Pelaaja",
                  type: "object",
                  fields: [
                    defineField({
                      name: "nimi",
                      title: "Nimi",
                      type: "string",
                      validation: (rule) => rule.required().error("Pelaajan nimi puuttuu."),
                    }),
                    defineField({
                      name: "luku",
                      title: "Luku (valinnainen)",
                      description: "Näkyy pelaajan pallossa, esim. saatujen Huuhkajien määrä.",
                      type: "number",
                      validation: (rule) => rule.integer().min(0).error("Luvun pitää olla kokonaisluku 0 tai suurempi."),
                    }),
                  ],
                  preview: {
                    select: { title: "nimi", luku: "luku" },
                    prepare: ({ title, luku }) => ({ title, subtitle: typeof luku === "number" ? String(luku) : undefined }),
                  },
                }),
              ],
              validation: (rule) =>
                rule.required().min(1).max(6).error("Rivillä pitää olla 1–6 pelaajaa."),
            }),
          ],
          preview: {
            select: { nimi: "nimi", pelaajat: "pelaajat" },
            prepare: ({ nimi, pelaajat }) => {
              const lista = (pelaajat ?? []) as { nimi?: string; luku?: number }[];
              return {
                title: lista.map((p) => [p.nimi, p.luku].filter((x) => x !== undefined).join(" ")).join(", ") || "Tyhjä rivi",
                subtitle: nimi,
              };
            },
          },
        }),
      ],
      validation: (rule) => [
        rule.required().min(1).max(6).error("Kokoonpanossa pitää olla 1–6 riviä."),
        rule
          .custom((rivit) => {
            const maara = ((rivit ?? []) as { pelaajat?: unknown[] }[]).reduce(
              (n, r) => n + (r.pelaajat?.length ?? 0),
              0,
            );
            return maara === 0 || maara === 11 ? true : `Kentällä on ${maara} pelaajaa (yleensä 11).`;
          })
          .warning(),
      ],
    }),
    defineField({
      name: "selite",
      title: "Selite (valinnainen)",
      description: 'Näkyy kentän alla, esim. "Luku on pelaajan saamien Huuhkajien määrä."',
      type: "string",
    }),
  ],
  preview: {
    select: { otsikko: "otsikko", rivit: "rivit" },
    prepare: ({ otsikko, rivit }) => {
      const lista = (rivit ?? []) as { pelaajat?: unknown[] }[];
      const pelaajia = lista.reduce((n, r) => n + (r.pelaajat?.length ?? 0), 0);
      return {
        title: otsikko || "Kokoonpano",
        subtitle: `Kokoonpano pelikentällä · ${lista.map((r) => r.pelaajat?.length ?? 0).join("-")} (${pelaajia} pelaajaa)`,
      };
    },
  },
});
