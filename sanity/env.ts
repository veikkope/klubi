/**
 * Sanity-ympäristömuuttujat. Lataa `.env.local`-tiedostosta.
 *
 * Aseta nämä Sanity-projektin luomisen jälkeen:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=xxxxxxx
 *   NEXT_PUBLIC_SANITY_DATASET=production
 *   NEXT_PUBLIC_SANITY_API_VERSION=2024-10-01
 *   SANITY_API_READ_TOKEN=... (vain palvelinpuolen kutsuihin, esim. preview)
 */

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Puuttuva ympäristömuuttuja: NEXT_PUBLIC_SANITY_DATASET",
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Puuttuva ympäristömuuttuja: NEXT_PUBLIC_SANITY_PROJECT_ID",
);

export const readToken = process.env.SANITY_API_READ_TOKEN;

export const studioUrl = "/studio";

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}
