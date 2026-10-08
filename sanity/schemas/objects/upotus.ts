import { EarthGlobeIcon, PinIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { tulkitseUpotus, upotuksenVirhe, UPOTUSPALVELUT } from "../../../lib/upotus";

/**
 * Kartta, lomake tai Vimeo-video tekstin seassa (docs/24 askel 6).
 *
 * Isä liittää palvelun upotuskoodin tai osoitteen. Vain sallitut palvelut
 * kelpaavat (lib/upotus.ts), ja sivulla näkyy ensin painike: palvelu
 * ladataan vasta lukijan painalluksesta (components/upotus.tsx). Sivulle ei
 * koskaan päädy liitettyä HTML:ää, vain siitä poimittu osoite.
 */
export const upotus = defineType({
  name: "upotus",
  title: "Kartta, lomake tai Vimeo-video",
  type: "object",
  icon: PinIcon,
  fields: [
    defineField({
      name: "osoite",
      title: "Upotuskoodi tai osoite",
      type: "text",
      rows: 3,
      description:
        "Google Maps: Jaa → Upota kartta → Kopioi HTML. Google Forms: Lähetä → <> → Kopioi. Vimeo: videon osoite. " +
        "Liitä koko koodi tähän. Sivulla näkyy ensin painike, ja palvelu ladataan vasta, kun lukija painaa sitä.",
      validation: (rule) => [
        rule.required().error("Liitä upotuskoodi tai osoite."),
        rule.custom((arvo: string | undefined) => upotuksenVirhe(arvo) ?? true),
      ],
    }),
    defineField({
      name: "otsikko",
      title: "Mitä upotuksessa on",
      type: "string",
      description:
        'Esim. "Kartta: klubin kokoontumispaikka" tai "Ilmoittautuminen pikkujouluihin". Näkyy painikkeen yläpuolella, ja ruudunlukija lukee tämän.',
      validation: (rule) => rule.required().min(3).max(120).error("Kirjoita upotukselle otsikko."),
    }),
    defineField({
      name: "kuvateksti",
      title: "Kuvateksti (valinnainen)",
      type: "string",
      description: "Näkyy upotuksen alla.",
    }),
  ],
  preview: {
    select: { otsikko: "otsikko", osoite: "osoite" },
    prepare: ({ otsikko, osoite }) => {
      const u = tulkitseUpotus(typeof osoite === "string" ? osoite : null);
      return {
        title: otsikko || "Upotus",
        subtitle: u ? `Upotus · ${UPOTUSPALVELUT[u.palvelu].nimi}` : "Upotus · osoite puuttuu tai ei kelpaa",
        media: u?.palvelu === "google-maps" ? PinIcon : EarthGlobeIcon,
      };
    },
  },
});
