import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, hasSanity, projectId } from "../env";

export const client: SanityClient | null = hasSanity
  ? createClient({
      projectId: projectId!,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: "published",
      stega: {
        studioUrl: "/studio",
      },
    })
  : null;
