import { timingSafeEqual } from "node:crypto";

import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "@/sanity/env";
import { cleanupOrphanReviewPhotos } from "@/sanity/lib/arvostelukuvat-siivous";

/**
 * Vercel Cron: poistaa kerran päivässä kävijöiden arvostelukuvat, joihin
 * mikään dokumentti ei enää viittaa (docs/18, sanity/lib/arvostelukuvat-siivous.ts).
 *
 * Aikataulu on `vercel.json`-tiedostossa. Vercel lähettää pyynnön otsakkeella
 * `Authorization: Bearer <CRON_SECRET>`, kun ympäristömuuttuja CRON_SECRET on
 * asetettu projektiin. Ilman sitä reitti on pois käytöstä (501), jotta kukaan
 * muu ei voi käynnistää poistoja.
 */

export const dynamic = "force-dynamic";

function authorized(header: string | null, secret: string): boolean {
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header ?? "");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!secret || !token || !projectId) {
    return Response.json(
      { message: "CRON_SECRET, SANITY_API_WRITE_TOKEN tai projektin tunnus puuttuu: siivous ei ole käytössä." },
      { status: 501 },
    );
  }
  if (!authorized(request.headers.get("authorization"), secret)) {
    return Response.json({ message: "Ei oikeutta." }, { status: 401 });
  }

  const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: "raw" });
  try {
    const { orphans, deleted, failed } = await cleanupOrphanReviewPhotos(client);
    console.info(`[cron siivoa-arvostelukuvat] ${dataset}: orpoja ${orphans.length}, poistettu ${deleted.length}, epäonnistui ${failed.length}`);
    return Response.json({ dataset, orphans: orphans.length, deleted: deleted.length, failed });
  } catch (error) {
    console.error("[cron siivoa-arvostelukuvat] epäonnistui:", error);
    return Response.json({ message: "Siivous epäonnistui." }, { status: 500 });
  }
}
