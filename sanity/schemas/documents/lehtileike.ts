import { DocumentTextIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { LITMANEN_SLUG } from "../../../lib/path";
import { needsReviewField, tarkistettavaaField } from "../objects/contentMeta";

/** Pelaajasivun osiot, joille lehtileike voi kuulua (docs/20 §2). */
export const LEHTILEIKE_OSIOT = [
  { title: "Lehtileikkeet (ura ja elämä)", value: "lehtileikkeet" },
  { title: "Patsas", value: "patsas" },
  { title: "Terveys ja loukkaantumiset", value: "terveys" },
] as const;

/**
 * Lehtileike: yksittäinen pelaajasta kertova lehtijuttu (Litmanen-osio, docs/20).
 * Näkyy pelaajan osion sivulla vuosittain ryhmiteltynä, tuorein ensin.
 */
export const lehtileike = defineType({
  name: "lehtileike",
  title: "Lehtileike",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "otsikko",
      title: "Otsikko",
      type: "string",
      validation: (rule) => rule.required().error("Otsikko on pakollinen."),
    }),
    defineField({
      name: "pelaaja",
      title: "Pelaaja",
      description:
        "Lehtileikkeet näkyvät toistaiseksi vain Jari Litmasen osiossa. Muille pelaajille ei ole " +
        "vielä leikesivua, joten valittavana on vain Litmanen.",
      type: "reference",
      to: [{ type: "pelaaja" }],
      // Muiden pelaajien leikkeet eivät näkyisi missään (lib/path.ts documentRoute, docs/23 Y28).
      options: {
        disableNew: true,
        filter: "slug.current == $slug",
        filterParams: { slug: LITMANEN_SLUG },
      },
      // Uudessa leikkeessä Litmanen valmiina: ainoa vaihtoehto ei vaadi valintaa.
      initialValue: async (_params, { getClient }) => {
        const id = await getClient({ apiVersion: "2025-08-15" }).fetch<string | null>(
          `*[_type == "pelaaja" && slug.current == $slug && !(_id in path("drafts.**"))][0]._id`,
          { slug: LITMANEN_SLUG },
        );
        // Ilman Litmasta kenttä jää tyhjäksi (Sanity hyväksyy tyhjän alkuarvon).
        return (id ? { _ref: id } : undefined) as { _ref: string };
      },
      validation: (rule) => rule.required().error("Valitse pelaaja."),
    }),
    defineField({
      name: "osio",
      title: "Sivu",
      description: "Millä sivulla juttu näkyy.",
      type: "string",
      options: { list: [...LEHTILEIKE_OSIOT], layout: "radio" },
      initialValue: "lehtileikkeet",
      validation: (rule) => rule.required().error("Valitse sivu."),
    }),
    defineField({
      name: "julkaistu",
      title: "Julkaisupäivä",
      description: "Jutun alkuperäinen julkaisupäivä. Jutut järjestetään tämän mukaan.",
      type: "date",
      validation: (rule) => rule.required().error("Julkaisupäivä on pakollinen."),
    }),
    defineField({
      name: "lahde",
      title: "Lähde",
      description: "Esim. is.fi, Iltalehti, HS, ESS.",
      type: "string",
    }),
    defineField({
      name: "linkki",
      title: "Linkki alkuperäiseen juttuun (valinnainen)",
      type: "url",
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "teksti",
      title: "Teksti",
      description: "Ensimmäinen kappale näkyy sivulla aina, loput avautuvat \"Lue koko juttu\" -painikkeesta.",
      type: "portableText",
      validation: (rule) => rule.required().error("Teksti on pakollinen."),
    }),
    needsReviewField(),
    tarkistettavaaField(),
  ],
  orderings: [
    { title: "Julkaisupäivä, uusin ensin", name: "julkaistuDesc", by: [{ field: "julkaistu", direction: "desc" }] },
  ],
  preview: {
    select: { title: "otsikko", julkaistu: "julkaistu", lahde: "lahde", osio: "osio", needsReview: "needsReview" },
    prepare({ title, julkaistu, lahde, osio, needsReview }) {
      const pvm = julkaistu ? julkaistu.split("-").reverse().join(".") : "ei päiväystä";
      const sivu = LEHTILEIKE_OSIOT.find((o) => o.value === osio)?.title.split(" (")[0];
      return {
        title: needsReview ? `⚠ ${title}` : title,
        subtitle: [pvm, lahde, sivu].filter(Boolean).join(" · "),
      };
    },
  },
});
