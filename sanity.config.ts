import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes, singletonTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";

export default defineConfig({
  name: "klubi",
  title: "Lahden Suomalainen Klubi ry",
  basePath: "/studio",
  projectId,
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
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
