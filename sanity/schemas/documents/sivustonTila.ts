import { ActivityIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Sivuston tila (docs/24 askel 7, docs/23 Y33): yöllisen huollon ja
 * viikkovarmuuskopion kirjaama tulos. Koneen kirjoittama järjestelmäloki,
 * kuten `varmuuskopio`: kaksi kiinteän tunnuksen dokumenttia
 * (`sivustonTila.huolto`, `sivustonTila.varmuuskopio`, lib/sivuston-tila.ts).
 *
 * - Ei näy Studion rakenteessa, haussa eikä Luo-valikossa, eikä sillä ole
 *   toimintoja (sanity.config.ts, sanity/pohjat.ts). Aloitus-näkymä lukee sen.
 * - Ei kuulu varmuuskopioon eikä palautukseen (lib/varmuuskopio.ts, lib/palautus.ts).
 * - Webhook ohittaa sen (app/api/revalidate).
 * - Pistetunnus ei näy julkisesta datasetistä tunnistautumattomille (tarkistus
 *   26.10.2026, docs/24 P10).
 */
export const sivustonTila = defineType({
  name: "sivustonTila",
  title: "Sivuston tila (automaattinen)",
  type: "document",
  icon: ActivityIcon,
  readOnly: true,
  // Ei Studion haussa eikä viittausvalitsimissa (docs/24 Liite A).
  __experimental_omnisearch_visibility: false,
  description: "Yöllisen huollon ja varmuuskopion kirjaama tulos. Näkyy Aloitus-näkymässä. Ei muokata käsin.",
  fields: [
    defineField({
      name: "tehtava",
      title: "Tehtävä",
      type: "string",
      options: {
        list: [
          { title: "Yöllinen huolto", value: "huolto" },
          { title: "Viikkovarmuuskopio", value: "varmuuskopio" },
        ],
      },
    }),
    defineField({ name: "aika", title: "Viimeisin ajo", type: "datetime" }),
    defineField({ name: "onnistui", title: "Onnistui", type: "boolean" }),
    defineField({ name: "viimeisinOnnistunut", title: "Viimeisin onnistunut ajo", type: "datetime" }),
    defineField({
      name: "tulokset",
      title: "Tulokset",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "tilaTulos",
          title: "Tulos",
          fields: [
            defineField({ name: "nimi", title: "Mitä tarkistettiin", type: "string" }),
            defineField({
              name: "tila",
              title: "Tila",
              type: "string",
              options: {
                list: [
                  { title: "Kunnossa", value: "ok" },
                  { title: "Huomio", value: "huomio" },
                  { title: "Virhe", value: "virhe" },
                ],
              },
            }),
            defineField({ name: "viesti", title: "Selitys", type: "text", rows: 2 }),
            defineField({ name: "maara", title: "Määrä", type: "number" }),
          ],
          preview: { select: { title: "nimi", subtitle: "viesti" } },
        }),
      ],
    }),
    defineField({
      name: "orvotTiedostot",
      title: "Käyttämättömät tiedostot",
      description:
        "Huollon muistiinpano: milloin kukin tiedosto havaittiin käyttämättömäksi. " +
        "Tiedosto poistetaan, kun se on ollut käyttämättä 7 päivää (lib/tiedostosiivous.ts). " +
        "Tunnus on tekstiä eikä viittaus, jotta tiedosto ei näyttäisi käytetyltä.",
      type: "array",
      hidden: true,
      of: [
        defineArrayMember({
          type: "object",
          name: "orpoTiedosto",
          fields: [
            defineField({ name: "asset", title: "Tiedoston tunnus", type: "string" }),
            defineField({ name: "havaittu", title: "Havaittu käyttämättömäksi", type: "datetime" }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: { tehtava: "tehtava", aika: "aika", onnistui: "onnistui" },
    prepare: ({ tehtava, aika, onnistui }) => ({
      title: tehtava === "varmuuskopio" ? "Viikkovarmuuskopio" : "Yöllinen huolto",
      subtitle: `${onnistui ? "Onnistui" : "Epäonnistui"} · ${aika ? new Date(aika).toLocaleString("fi-FI") : "ei ajettu"}`,
    }),
  },
});
