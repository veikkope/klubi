import { TargetIcon } from "@sanity/icons";
import { defineField, defineType, type StringRule } from "sanity";

import { ehdotaJoukkue } from "../../../lib/joukkueet";
import { haeJoukkueet } from "../../components/joukkue/joukkueet";
import { JoukkueInput } from "../../components/joukkue/JoukkueInput";

/**
 * Varoitus lähes oikeasta nimestä ("FC Lahden" → "FC Lahti"). Väärin kirjoitettu
 * nimi ei yhdisty automaattisesti haettuun otteluun eikä Huuhkajien korostukseen.
 * Täysin eri nimet (vastustajamaat, cup-joukkueet) eivät saa varoitusta.
 */
const tarkistaKirjoitusasu = (rule: StringRule) =>
  rule
    .custom(async (value) => {
      if (!value) return true;
      const ehdotus = ehdotaJoukkue(value, await haeJoukkueet());
      return ehdotus
        ? `Tarkoititko "${ehdotus}"? Nimen pitää olla sama kuin automaattisessa otteluohjelmassa, jotta merkinnät yhdistyvät oikeaan otteluun.`
        : true;
    })
    .warning();

/**
 * Ottelu otteluohjelmaan.
 *
 * Veikkausliigan ottelut haetaan automaattisesti (lib/ottelut.ts), joten niitä
 * ei tarvitse lisätä käsin. Tähän lisätään:
 *  - ottelut joita automaattinen haku ei kata (esim. maajoukkue, cup)
 *  - Huuhkajien (miesten maajoukkue) ottelut: joukkueeksi kirjoitetaan "Suomi",
 *    jolloin ottelu korostetaan; kotiottelut merkitään automaattisesti
 *    "Klubi paikalla"
 *  - klubin merkinnät ("Klubi paikalla", "Vierasmatka") mihin tahansa
 *    otteluun — myös automaattisesti haettuun. Merkintä yhdistyy
 *    automaattiseen otteluun, kun päivä ja joukkueet täsmäävät.
 */
export const ottelu = defineType({
  name: "ottelu",
  title: "Ottelu",
  type: "document",
  icon: TargetIcon,
  fields: [
    defineField({
      name: "aika",
      title: "Alkamisaika",
      type: "datetime",
      options: { timeStep: 15 },
      validation: (rule) => rule.required().error("Anna ottelun alkamisaika."),
    }),
    defineField({
      name: "koti",
      title: "Kotijoukkue",
      description:
        'Kirjoita kuten Veikkausliigan sivuilla, esim. "FC Lahti". Huuhkajien ottelussa kirjoita "Suomi" — ottelu korostetaan, ja Suomen kotiottelu merkitään automaattisesti "Klubi paikalla". Muille maajoukkueille tarkenne, esim. "Suomi (naiset)" tai "Suomi U21".',
      type: "string",
      components: { input: JoukkueInput },
      validation: (rule) => [rule.required().error("Anna kotijoukkue."), tarkistaKirjoitusasu(rule)],
    }),
    defineField({
      name: "vieras",
      title: "Vierasjoukkue",
      description: "Aloita kirjoittaminen, niin saat ehdotuksia.",
      type: "string",
      components: { input: JoukkueInput },
      validation: (rule) => [rule.required().error("Anna vierasjoukkue."), tarkistaKirjoitusasu(rule)],
    }),
    defineField({
      name: "kilpailu",
      title: "Kilpailu",
      description: 'Esim. "Veikkausliiga", "Suomen Cup" tai "Maaottelu".',
      type: "string",
    }),
    defineField({
      name: "stadion",
      title: "Stadion",
      description: 'Esim. "Lahden stadion" tai "Olympiastadion, Helsinki".',
      type: "string",
    }),
    defineField({
      name: "klubiPaikalla",
      title: "Klubi paikalla",
      description:
        "Klubilaisia on menossa katsomoon. Näkyy sinisenä merkkinä otteluohjelmassa. Huuhkajien kotiotteluissa merkintä tulee automaattisesti; vieraspeliin valitse se tästä, jos klubi lähtee mukaan.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "vierasmatka",
      title: "Vierasmatka",
      description: "Klubi järjestää yhteisen matkan. Näkyy merkkinä otteluohjelmassa.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [
    { title: "Alkamisajan mukaan", name: "aikaAsc", by: [{ field: "aika", direction: "asc" }] },
  ],
  preview: {
    select: { koti: "koti", vieras: "vieras", aika: "aika", paikalla: "klubiPaikalla", matka: "vierasmatka" },
    prepare({ koti, vieras, aika, paikalla, matka }) {
      const pvm = aika
        ? new Intl.DateTimeFormat("fi-FI", {
            weekday: "short",
            day: "numeric",
            month: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/Helsinki",
          }).format(new Date(aika))
        : "Ei aikaa";
      const merkinnat = [paikalla && "Klubi paikalla", matka && "Vierasmatka"].filter(Boolean);
      return {
        title: `${koti ?? "?"} – ${vieras ?? "?"}`,
        subtitle: [pvm, ...merkinnat].join(" · "),
      };
    },
  },
});
