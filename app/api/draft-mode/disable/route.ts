/** Sammuttaa draft moden ja palaa julkiselle sivulle. */
import { draftMode } from "next/headers";

export async function GET(request: Request): Promise<Response> {
  (await draftMode()).disable();
  const target = new URL("/", request.url);
  return Response.redirect(target, 307);
}
