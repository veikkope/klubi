import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { fiFILocale } from "@sanity/locale-fi-fi";

import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes, singletonTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";
import { locations } from "./sanity/presentation";
import { HylkaaArvostelu } from "./sanity/actions/hylkaa-arvostelu";
import { HyvaksyJaLuoRavintola, ilmanJulkaisuaEhdotukselle } from "./sanity/actions/hyvaksy-ja-luo-ravintola";
import { PiilotaKommentti, PoistaKommentti } from "./sanity/actions/kommentin-moderointi";

export default defineConfig({
  name: "klubi",
  title: "Lahden Suomalainen Klubi ry",
  basePath: "/studio",
  projectId: projectId || "",
  dataset,
  schema: {
    types: schemaTypes,
    // Estä singletonien duplikointi
    // Singletoneja ja varmuuskopioita ei luoda käsin (varmuuskopiot tekee ajastus).
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType) && schemaType !== "varmuuskopio"),
  },
  document: {
    actions: (input, context) => {
      if (context.schemaType === "ravintolaKayttajaArvostelu") {
        // Ensisijainen toiminto, kun kävijä ehdotti uutta ravintolaa. "Hylkää
        // arvostelu" korvaa tavallisen Poista-toiminnon, koska se poistaa myös
        // kuvat (docs/18). Sijoitetaan heti julkaisun jälkeen; ehdotukselta
        // Julkaise on piilossa, joten Hylkää on silloin valikon ensimmäisenä.
        const actions = input
          .filter(({ action }) => action !== "delete")
          .map((toiminto) => (toiminto.action === "publish" ? ilmanJulkaisuaEhdotukselle(toiminto) : toiminto));
        const publishAt = actions.findIndex(({ action }) => action === "publish");
        // Jos julkaisutoimintoa ei ole, loppuun: hylkäys ei saa olla päätoiminto.
        actions.splice(publishAt === -1 ? actions.length : publishAt + 1, 0, HylkaaArvostelu);
        return [HyvaksyJaLuoRavintola, ...actions];
      }
      if (context.schemaType === "kommentti") {
        // Piilotus ensisijaisena: muuttaa julkaistua versiota suoraan, joten
        // erillistä Julkaise-painallusta ei tarvita. Pysyvä poisto omalla
        // vahvistuksellaan tavallisen Poista-toiminnon tilalle.
        const actions = input.filter(({ action }) => action !== "delete" && action !== "duplicate");
        return [PiilotaKommentti, ...actions, PoistaKommentti];
      }
      // Varmuuskopio on vain luettava: ladataan, ei muokata, julkaista eikä poisteta käsin.
      if (context.schemaType === "varmuuskopio") return [];
      if (singletonTypes.has(context.schemaType)) {
        return input.filter(
          ({ action }) => action !== "duplicate" && action !== "delete",
        );
      }
      return input;
    },
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === "global") {
        return prev.filter(
          (templateItem) => !singletonTypes.has(templateItem.templateId),
        );
      }
      return prev;
    },
  },
  plugins: [
    // Sisältö on ensimmäinen näkymä: sihteeri aloittaa selkeästä valikosta.
    // Esikatselu on sen rinnalla, ja jokaisessa dokumentissa on linkki sivulle,
    // jolla se näkyy (sanity/presentation.ts).
    structureTool({ title: "Sisältö", structure }),
    presentationTool({
      title: "Esikatselu",
      resolve: locations,
      previewUrl: {
        preview: "/",
        previewMode: {
          enable: "/api/draft-mode/enable",
          disable: "/api/draft-mode/disable",
        },
      },
    }),
    visionTool({ defaultApiVersion: apiVersion, title: "Kyselyt (kehittäjä)" }),
    // Studion käyttöliittymä suomeksi (CLAUDE.md: kaikki käyttöliittymäteksti suomeksi).
    fiFILocale(),
  ],
  // Kyselytyökalu vain ylläpitäjille: sihteerin (Editor) valikko pysyy selkeänä.
  tools: (prev, { currentUser }) =>
    currentUser?.roles.some((role) => role.name === "administrator")
      ? prev
      : prev.filter((tool) => tool.name !== "vision"),
});
