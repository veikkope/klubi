import { createClient } from "next-sanity";

import { paivitaArvosanat } from "@/lib/ravintola-arvosana";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { cleanupOrphanReviewPhotos } from "@/sanity/lib/arvostelukuvat-siivous";

/**
 * Yöllinen huolto (Vercel Cron, vercel.json): pitää ravintola-arvostelut
 * kunnossa ilman kehittäjää. Molemmat tehtävät ovat idempotentteja, eli
 * uudelleenajo ei muuta mitään, jos kaikki on jo kunnossa.
 *
 * 1. Ravintoloiden arvosanat uudelleen klubilaisten arvosanoista
 *    (lib/ravintola-arvosana.ts). Webhook (app/api/revalidate) tekee tämän
 *    jokaisesta muutoksesta; tämä on turvaverkko sille, että webhook-kutsu
 *    epäonnistui (esim. katkos hyväksynnän hetkellä). Muuttunut ravintola
 *    laukaisee oman webhookinsa, joka tyhjentää sivujen välimuistin.
 * 2. Orvot arvostelukuvat (sanity/lib/arvostelukuvat-siivous.ts): vain
 *    lomakkeen lataamat kuvat, joihin mikään dokumentti (luonnokset mukaan
 *    lukien) ei viittaa ja jotka ovat vanhempia kuin varoaika.
 *
 * Vercel kutsuu otsakkeella `Authorization: Bearer <CRON_SECRET>`. Tulos
 * näkyy Vercelin Cron-lokissa. Käsin: npm run laske:arvosanat ja
 * npm run siivoa:arvostelukuvat.
 */

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!secret || !token || !projectId) {
    return Response.json(
      { virhe: "CRON_SECRET, SANITY_API_WRITE_TOKEN tai projekti puuttuu: huolto ei ole käytössä." },
      { status: 501 },
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ virhe: "Ei oikeutta." }, { status: 401 });
  }

  const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: "raw" });
  const tulos: Record<string, unknown> = {};
  let onnistui = true;

  // Tehtävät erikseen: toisen virhe ei estä toista.
  try {
    const muutokset = await paivitaArvosanat(client);
    tulos.arvosanat = { korjattu: muutokset.map((m) => m.name) };
    if (muutokset.length > 0) console.log(`[huolto] arvosana korjattu: ${muutokset.map((m) => m.name).join(", ")}`);
  } catch (error) {
    onnistui = false;
    tulos.arvosanat = { virhe: error instanceof Error ? error.message : String(error) };
    console.error("[huolto] arvosanojen laskenta epäonnistui:", error);
  }

  try {
    const { deleted, failed } = await cleanupOrphanReviewPhotos(client);
    tulos.kuvat = { poistettu: deleted.length, epaonnistui: failed.length };
    if (deleted.length > 0) console.log(`[huolto] orpoja arvostelukuvia poistettu: ${deleted.length}`);
    if (failed.length > 0) onnistui = false;
  } catch (error) {
    onnistui = false;
    tulos.kuvat = { virhe: error instanceof Error ? error.message : String(error) };
    console.error("[huolto] kuvien siivous epäonnistui:", error);
  }

  // 500 näkyy Vercelin Cron-lokissa epäonnistuneena ajona.
  return Response.json(tulos, { status: onnistui ? 200 : 500 });
}
