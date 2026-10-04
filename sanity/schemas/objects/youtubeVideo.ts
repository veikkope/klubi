import { createElement } from "react";
import { PlayIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { esikatselukuva, tulkitseYoutube } from "../../../lib/youtube";

/**
 * YouTube-video tekstin keskellä (Portable Text -lohko, components/youtube-video.tsx).
 *
 * Sivulla näkyy ensin esikatselukuva ja toistopainike; YouTuben soitin
 * ladataan vasta painalluksesta youtube-nocookie.com-osoitteesta. Sivu
 * pysyy nopeana eikä YouTube aseta evästeitä ennen kuin lukija toistaa videon.
 */
export const youtubeVideo = defineType({
  name: "youtubeVideo",
  title: "YouTube-video",
  type: "object",
  icon: PlayIcon,
  fields: [
    defineField({
      name: "url",
      title: "Videon osoite",
      description:
        "Kopioi osoite YouTubesta: selaimen osoiteriviltä tai videon alta Jaa → Kopioi. Jos osoitteessa on aloituskohta (esim. ?t=90), video alkaa siitä.",
      type: "url",
      validation: (rule) =>
        rule
          .required()
          .error("Liitä YouTube-videon osoite.")
          .custom((arvo) =>
            !arvo || tulkitseYoutube(arvo)
              ? true
              : "Osoite ei ole YouTube-video. Kopioi osoite videon sivulta, esim. https://www.youtube.com/watch?v=…",
          ),
    }),
    defineField({
      name: "otsikko",
      title: "Videon otsikko",
      description:
        'Mitä videolla on, esim. "Huuhkajien maali Unkaria vastaan 2023". Ruudunlukija lukee tämän, ja se näkyy toistopainikkeessa.',
      type: "string",
      validation: (rule) =>
        rule.required().error("Kirjoita videolle otsikko.").max(120).warning("Lyhyempi otsikko näyttää paremmalta."),
    }),
    defineField({
      name: "kuvateksti",
      title: "Kuvateksti (valinnainen)",
      description: "Näkyy videon alla, esim. lähde tai lisätieto.",
      type: "string",
    }),
  ],
  preview: {
    select: { otsikko: "otsikko", url: "url" },
    prepare: ({ otsikko, url }) => {
      const video = tulkitseYoutube(url);
      return {
        title: otsikko || "YouTube-video",
        subtitle: video ? `YouTube-video · ${url}` : "Osoite puuttuu tai ei ole YouTube-video",
        media: video
          ? createElement("img", {
              src: esikatselukuva(video.id),
              alt: "",
              style: { objectFit: "cover", width: "100%", height: "100%" },
            })
          : PlayIcon,
      };
    },
  },
});
