/**
 * Sammuttaa draft moden ja palaa julkiselle sivulle: `?paluu=/polku` samalle
 * sivulle (esikatselupalkin painike), muuten etusivulle. Vain sivuston omat
 * polut kelpaavat, ettei reittiä voi käyttää ohjaamaan muualle.
 */
import { draftMode } from "next/headers";

import { omaPaluuosoite } from "@/lib/paluuosoite";

export async function GET(request: Request): Promise<Response> {
  (await draftMode()).disable();
  const paluu = new URL(request.url).searchParams.get("paluu");
  return Response.redirect(omaPaluuosoite(paluu, request.url), 307);
}
