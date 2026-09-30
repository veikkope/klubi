/**
 * Sammuttaa draft moden ja palaa julkiselle sivulle: `?paluu=/polku` samalle
 * sivulle (esikatselupalkin painike), muuten etusivulle. Vain sivuston omat
 * polut kelpaavat, ettei reittiä voi käyttää ohjaamaan muualle.
 */
import { draftMode } from "next/headers";

export async function GET(request: Request): Promise<Response> {
  (await draftMode()).disable();
  const paluu = new URL(request.url).searchParams.get("paluu") ?? "/";
  const polku = paluu.startsWith("/") && !paluu.startsWith("//") && !paluu.includes("\\") ? paluu : "/";
  const target = new URL(polku, request.url);
  return Response.redirect(target, 307);
}
