import { DocumentPdfIcon } from "@sanity/icons";
import { defineField, defineType, type FileRule } from "sanity";

import { LIITE_ISO_TAVUA, LIITTEEN_ACCEPT, liitteenTiedot, tarkistaLiitetiedosto } from "../../../lib/liite";
import { apiVersion } from "../../env";

/**
 * Liitetiedoston kenttä (PDF, Word, Excel): linkin Tiedosto-vaihtoehto
 * (docs/24 askel 4) ja tekstin liitelohko (askel 6). Säännöt: lib/liite.ts.
 *
 * Kuvaus kertoo julkisuudesta (docs/24 Liite A, K4): datasetti on julkinen,
 * ja kuka tahansa voi listata kaikki tiedostot nimineen, myös ne, joihin ei
 * enää linkitetä.
 */
export const LIITTEEN_KUVAUS =
  "PDF, Word (.docx) tai Excel (.xlsx). Tiedosto on julkinen: se löytyy sivuston tietokannasta, " +
  "vaikka et linkittäisi sitä, ja myös tiedoston alkuperäinen nimi näkyy. Älä liitä jäsenluetteloita, " +
  "pöytäkirjoja, joissa on henkilötietoja, tai muuta luottamuksellista.";

type Asetukset = {
  name?: string;
  title?: string;
  description?: string;
  /** Virhe (`tyhjaVirhe`), kun kenttä on käytössä ja tyhjä. */
  pakollinen?: boolean;
  /** Pakollisen tyhjän kentän virhe. */
  tyhjaVirhe?: string;
  /** Onko kenttä käytössä (esim. linkin tyyppi on Tiedosto). Muuten säännöt ohitetaan. */
  aktiivinen?: (parent: unknown) => boolean;
  hidden?: (konteksti: { parent?: unknown; value?: unknown }) => boolean;
  /** Varoitus, kun kenttä ei ole käytössä mutta tiedosto on yhä tallessa. */
  kayttamatonVaroitus?: string;
  /** Varoitus, kun kenttä on käytössä, ei pakollinen ja tyhjä. */
  tyhjaVaroitus?: string;
};

const MT = 1024 * 1024;

export function liitetiedostoKentta({
  name = "tiedosto",
  title = "Tiedosto",
  description = LIITTEEN_KUVAUS,
  pakollinen = true,
  tyhjaVirhe = "Lisää tiedosto.",
  aktiivinen = () => true,
  hidden,
  kayttamatonVaroitus,
  tyhjaVaroitus,
}: Asetukset = {}) {
  return defineField({
    name,
    title,
    type: "file",
    description,
    options: { accept: LIITTEEN_ACCEPT, storeOriginalFilename: true },
    ...(hidden ? { hidden } : {}),
    validation: (rule: FileRule) => [
      rule.custom((arvo, konteksti) => {
        if (!aktiivinen(konteksti.parent)) return true;
        if (!arvo?.asset?._ref) return pakollinen ? tyhjaVirhe : true;
        return tarkistaLiitetiedosto(arvo);
      }),
      rule
        .custom((arvo, konteksti) => {
          const kaytossa = aktiivinen(konteksti.parent);
          if (!kaytossa && arvo?.asset?._ref && kayttamatonVaroitus) return kayttamatonVaroitus;
          if (kaytossa && !arvo?.asset?._ref && !pakollinen && tyhjaVaroitus) return tyhjaVaroitus;
          return true;
        })
        .warning(),
      rule
        .custom(async (arvo, konteksti) => {
          const ref = arvo?.asset?._ref;
          if (!ref || !aktiivinen(konteksti.parent)) return true;
          try {
            const koko = await konteksti
              .getClient({ apiVersion })
              .fetch<number | null>(`*[_id == $id][0].size`, { id: ref });
            if (typeof koko !== "number" || koko <= LIITE_ISO_TAVUA) return true;
            const mt = String(Math.round((koko / MT) * 10) / 10).replace(".", ",");
            return `Tiedosto on iso (${mt} Mt). Pienennä PDF (esim. Wordissa Tallenna nimellä → PDF → Pienin koko).`;
          } catch {
            return true;
          }
        })
        .warning(),
    ],
  });
}

/**
 * Tekstin liitelohko (docs/24 askel 6): linkki tiedostoon, jonka perässä
 * sivulla näkyvät tyyppi ja koko, esim. "Vuosikokouskutsu 2027 (PDF, 240 kt)".
 */
export const liite = defineType({
  name: "liite",
  title: "Liite (PDF, Word, Excel)",
  type: "object",
  icon: DocumentPdfIcon,
  fields: [
    defineField({
      name: "otsikko",
      title: "Linkin teksti",
      type: "string",
      description:
        'Mikä tiedosto on, esim. "Vuosikokouskutsu 2027" tai "Klubin säännöt". Sivulla näkyy myös tiedoston tyyppi ja koko.',
      validation: (rule) => rule.required().min(3).max(100).error("Kirjoita liitteelle nimi (3–100 merkkiä)."),
    }),
    liitetiedostoKentta({ tyhjaVirhe: "Valitse tiedosto." }),
  ],
  preview: {
    select: {
      otsikko: "otsikko",
      paate: "tiedosto.asset.extension",
      koko: "tiedosto.asset.size",
      nimi: "tiedosto.asset.originalFilename",
    },
    prepare: ({ otsikko, paate, koko, nimi }) => {
      const tiedot = liitteenTiedot({ extension: paate, size: koko });
      return {
        title: otsikko || nimi || "Liite",
        subtitle: tiedot ? `Liite · ${tiedot}` : "Liite · tiedosto puuttuu",
        media: DocumentPdfIcon,
      };
    },
  },
});
