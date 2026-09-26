import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";

import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes, singletonTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";

export default defineConfig({
  name: "klubi",
  title: "Lahden Suomalainen Klubi ry",
  basePath: "/studio",
  projectId: projectId || "",
  dataset,
  schema: {
    types: schemaTypes,
    // Estä singletonien duplikointi
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    actions: (input, context) => {
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
    // Presentation on oletusnäkymä: editori näkee sivun sellaisena kuin se on
    // ja muokkaa klikkaamalla. Rakennenäkymä jää sen rinnalle niitä kertoja
    // varten kun halutaan selata dokumenttilistoja.
    presentationTool({
      title: "Esikatselu",
      previewUrl: {
        preview: "/",
        previewMode: {
          enable: "/api/draft-mode/enable",
          disable: "/api/draft-mode/disable",
        },
      },
    }),
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
