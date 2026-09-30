import { defineField, defineType } from "sanity";

/**
 * Galleria-albumin kuva. Kuten `imageWithAlt`, mutta alt-teksti on suositus
 * eikä pakollinen: 40 kuvan albumiin ei tarvitse kirjoittaa 40 kuvausta ennen
 * julkaisua. Ilman kuvausta sivusto nimeää kuvan albumin ja järjestysnumeron
 * mukaan ("Vappu 2026, kuva 3/40"), joten ruudunlukija ei jää tyhjän päälle
 * (components/gallery). Kuvia voi raahata albumiin useita kerralla.
 */
export const galleriaKuva = defineType({
  name: "galleriaKuva",
  title: "Kuva",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Mitä kuvassa on (alt)",
      description:
        "Suositeltava, ei pakollinen. Esim. \"Klubilaiset Lahden stadionin katsomossa\". " +
        "Ilman kuvausta sivu käyttää albumin nimeä ja kuvan numeroa.",
      type: "string",
      validation: (rule) => [
        rule.max(200).error("Enintään 200 merkkiä."),
        rule
          .required()
          .warning("Kuvaus auttaa näkövammaisia kävijöitä. Voit julkaista myös ilman sitä."),
      ],
    }),
    defineField({
      name: "caption",
      title: "Kuvateksti (valinnainen)",
      description: "Näkyy suurennetun kuvan alla.",
      type: "string",
    }),
  ],
});
