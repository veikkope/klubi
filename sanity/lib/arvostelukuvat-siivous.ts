import type { SanityClient } from "next-sanity";

import { ORPHAN_GRACE_HOURS, REVIEW_PHOTO_SOURCE } from "../../lib/arvostelukuvat";

/**
 * Kävijöiden arvostelukuvien siivous (docs/18).
 *
 * Poistaa kuvat, jotka
 *  1. lomake on ladannut (`source.name == "kavija-arvostelu"`) — klubin omiin
 *     kuviin siivous ei koske koskaan,
 *  2. eivät ole minkään dokumentin käytössä, luonnokset mukaan lukien, ja
 *  3. ovat vanhempia kuin ORPHAN_GRACE_HOURS (lataus ja arvostelun luonti
 *     eivät tapahdu samalla hetkellä).
 *
 * Orpoja syntyy harvoin: kun sihteeri poistaa yksittäisen kuvan ennen
 * julkaisua, tai kun kuvan poisto hylkäyksen tai katkenneen tallennuksen
 * yhteydessä epäonnistuu. Siksi siivous ajetaan käsin tarvittaessa, ei ajastettuna.
 *
 * TÄRKEÄÄ: kysely ajetaan `raw`-näkökulmassa. Julkaistujen näkökulmassa
 * luonnokset eivät näkyisi, ja moderointia odottavien arvostelujen kuvat
 * näyttäisivät orvoilta.
 *
 * Käyttö: scripts/siivoa-arvostelukuvat.ts (npm run siivoa:arvostelukuvat).
 */

export type OrphanPhoto = { _id: string; _createdAt: string; originalFilename: string | null; size: number | null };

export type CleanupResult = { orphans: OrphanPhoto[]; deleted: string[]; failed: string[] };

/** Yhden ajon enimmäismäärä; loput poistuvat seuraavalla kerralla. */
const BATCH = 200;

export async function cleanupOrphanReviewPhotos(
  client: SanityClient,
  { dryRun = false, now = new Date() }: { dryRun?: boolean; now?: Date } = {},
): Promise<CleanupResult> {
  const raw = client.withConfig({ perspective: "raw", useCdn: false });
  const cutoff = new Date(now.getTime() - ORPHAN_GRACE_HOURS * 3_600_000).toISOString();

  const orphans = await raw.fetch<OrphanPhoto[]>(
    /* groq */ `*[_type == "sanity.imageAsset" && source.name == $source && _createdAt < $cutoff
      && count(*[references(^._id)]) == 0] | order(_createdAt asc)[0...${BATCH}]{
        _id, _createdAt, originalFilename, size
      }`,
    { source: REVIEW_PHOTO_SOURCE, cutoff },
  );

  if (dryRun || orphans.length === 0) return { orphans, deleted: [], failed: [] };

  // Peräkkäin, jotta Sanityn mutaatioiden nopeusraja ei täyty.
  const deleted: string[] = [];
  const failed: string[] = [];
  for (const orphan of orphans) {
    try {
      await raw.delete(orphan._id);
      deleted.push(orphan._id);
    } catch (error) {
      console.warn(`[arvostelukuvat-siivous] ${orphan._id} jäi poistamatta:`, error);
      failed.push(orphan._id);
    }
  }
  return { orphans, deleted, failed };
}
