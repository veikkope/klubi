import { ImagesIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

/**
 * Kuvasarja tekstin seassa (docs/24 askel 2, docs/23 Y9).
 *
 * Kuvat raahataan kerralla, ja yksi yhteinen kuvaus riittää julkaisuun.
 * Kuvakohtainen alt on suositus (`galleriaKuva`): ilman sitä ruudunlukija
 * kuulee yhteisen kuvauksen ja kuvan numeron ("Klubin vappu 2026, kuva 3/9").
 * Sivulla sarja näkyy galleria-albumin ruudukkona (components/kuvasarja.tsx).
 */
export const kuvasarja = defineType({
  name: "kuvasarja",
  title: "Kuvasarja (useita kuvia)",
  type: "object",
  icon: ImagesIcon,
  fields: [
    defineField({
      name: "kuvat",
      title: "Kuvat",
      type: "array",
      of: [{ type: "galleriaKuva" }],
      options: { layout: "grid" },
      description:
        "Raahaa kaikki kuvat tähän kerralla tietokoneen kansiosta (puhelimessa: Lisää kohde → Lataa). Järjestä raahaamalla.",
      validation: (rule) => [
        rule.required().min(1).error("Lisää kuvasarjaan kuvia."),
        rule.min(2).warning("Yhdelle kuvalle käytä lohkoa Kuva."),
        rule.max(60).warning("Yli 60 kuvaa: harkitse galleria-albumia."),
      ],
    }),
    defineField({
      name: "kuvaus",
      title: "Mitä kuvissa on (yhteinen kuvaus)",
      type: "string",
      description:
        'Esim. "Klubin vappu 2026 Lahden torilla". Näkyy kuvien alla, ja ruudunlukija käyttää sitä ' +
        "kuvien kuvauksena, jos kuvalla ei ole omaa kuvausta (\"Klubin vappu 2026, kuva 3/9\").",
      validation: (rule) =>
        rule.required().min(3).max(120).error("Kirjoita kuvasarjalle lyhyt kuvaus (3–120 merkkiä)."),
    }),
    defineField({
      name: "asettelu",
      title: "Kuvien muoto",
      type: "string",
      options: {
        list: [
          { title: "Tasainen ruudukko (kuvat rajataan neliöiksi)", value: "ruudukko" },
          {
            title: "Kokonaiset kuvat (kuvakaappaukset, lehtileikkeet, kaaviot)",
            value: "kokonaisena",
          },
        ],
        layout: "radio",
      },
      initialValue: "ruudukko",
    }),
  ],
  preview: {
    select: { kuvaus: "kuvaus", kuvat: "kuvat", media: "kuvat.0" },
    prepare: ({ kuvaus, kuvat, media }) => ({
      title: kuvaus || "Kuvasarja",
      subtitle: `Kuvasarja · ${Array.isArray(kuvat) ? kuvat.length : 0} kuvaa`,
      media: media ?? ImagesIcon,
    }),
  },
});
