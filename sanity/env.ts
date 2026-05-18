/**
 * Sanity-ympäristömuuttujat. Lataa `.env.local`-tiedostosta.
 *
 * Aseta nämä Sanity-projektin luomisen jälkeen:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=xxxxxxx
 *   NEXT_PUBLIC_SANITY_DATASET=production
 *   NEXT_PUBLIC_SANITY_API_VERSION=2024-10-01
 *   SANITY_API_READ_TOKEN=... (vain palvelinpuolen kutsuihin, esim. preview)
 *
 * Kun projectId puuttuu, sivusto käyttää sisäänrakennettuja oletusarvoja
 * (lib/defaults.ts) — kehitys toimii myös ennen kuin `npx sanity init` on ajettu.
 */

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

export const readToken = process.env.SANITY_API_READ_TOKEN;

export const studioUrl = "/studio";

export const hasSanity = Boolean(projectId);
