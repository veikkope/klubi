import { defineField, type ArrayRule } from "sanity";

import { TaulukkoEditori } from "../../components/taulukkoeditori/TaulukkoEditori";

/**
 * Taulukon sarakkeet ja rivit (docs/19, docs/24 askel 6). Yhteiset
 * jalkapallotilastolle ja tekstin Taulukko-lohkolle: tallennusmuoto on sama,
 * joten sivuston `StatTable` ja taulukkoeditori toimivat molemmissa.
 *
 * Editori muokkaa rinnakkaisia `columns`- ja `rows`-kenttiä, joten objektin
 * juurisyötteeksi tarvitaan `TaulukkoKontekstiInput` (konteksti.tsx).
 */

type Asetukset = {
  group?: string;
  title?: string;
  description?: string;
  validation?: (rule: ArrayRule<unknown[]>) => ArrayRule<unknown[]> | ArrayRule<unknown[]>[];
  /**
   * Rivin jäsentyypin nimi. Tarvitaan tekstin Taulukko-lohkossa: Portable Text
   * -editorin skeemasilta (@portabletext/sanity-bridge) tunnistaa sisäkkäiset
   * objektit nimen perusteella, ja nimetön rivi ja sen sisällä nimetön solu
   * ovat molemmat "object", joten solu tulkittiin kehäksi ilman kenttiä ja koko
   * tekstieditori kaatui ("Cannot read properties of undefined (reading 'map')",
   * 8.10.2026). Jalkapallotilastossa rivi pysyy nimettömänä, koska sen data
   * on tallennettu ilman `_type`-kenttää eikä se ole tekstieditorissa.
   */
  riviTyyppi?: string;
};

export function sarakkeetKentta({ group }: Pick<Asetukset, "group"> = {}) {
  return defineField({
    name: "columns",
    title: "Taulukon sarakkeet",
    description: "Määrittele sarakkeiden avain, otsikko ja tyyppi.",
    type: "array",
    // Sarakkeita muokataan taulukkoeditorin otsikkoriviltä (rows-kenttä).
    hidden: true,
    of: [
      {
        type: "object",
        fields: [
          { name: "key", title: "Avain (data-key)", type: "string", validation: (rule) => rule.required() },
          { name: "label", title: "Otsikko (näkyvä)", type: "string", validation: (rule) => rule.required() },
          {
            name: "type",
            title: "Tyyppi",
            type: "string",
            options: {
              list: [
                { title: "Teksti", value: "text" },
                { title: "Numero", value: "number" },
                { title: "Päivämäärä", value: "date" },
                { title: "Vuosi", value: "year" },
                { title: "Linkki", value: "link" },
              ],
            },
            initialValue: "text",
          },
        ],
        preview: { select: { title: "label", subtitle: "key" } },
      },
    ],
    ...(group ? { group } : {}),
  });
}

export function rivitKentta({
  group,
  title = "Taulukko",
  description = "Muokkaa soluja kuten Excelissä. Sarakkeen nimen, tyypin ja järjestyksen saa " +
    "muutettua otsikon ⋮-valikosta, rivit rivinumeron vierestä.",
  validation,
  riviTyyppi,
}: Asetukset = {}) {
  return defineField({
    name: "rows",
    title,
    description,
    type: "array",
    components: { input: TaulukkoEditori },
    of: [
      {
        type: "object",
        ...(riviTyyppi ? { name: riviTyyppi, title: "Rivi" } : {}),
        fields: [
          {
            name: "cells",
            title: "Solut",
            type: "array",
            of: [
              {
                type: "object",
                fields: [
                  { name: "key", title: "Sarake-avain", type: "string", validation: (rule) => rule.required() },
                  { name: "value", title: "Arvo", type: "string" },
                ],
                preview: { select: { title: "key", subtitle: "value" } },
              },
            ],
          },
        ],
      },
    ],
    ...(validation ? { validation } : {}),
    ...(group ? { group } : {}),
  });
}
