/**
 * Kytkee Next.js:n draft moden päälle. Sanityn Presentation-näkymä kutsuu tätä
 * kun editori avaa esikatselun, jolloin sivusto alkaa tarjoilla luonnoksia.
 *
 * Vaatii SANITY_API_READ_TOKEN:in. Ilman sitä reitti palauttaa 501 eikä
 * esikatselu ole käytettävissä — julkinen sivusto toimii silti normaalisti.
 */
import { defineEnableDraftMode } from "next-sanity/draft-mode";

import { client } from "@/sanity/lib/client";
import { readToken } from "@/sanity/env";

const handler =
  client && readToken
    ? defineEnableDraftMode({ client: client.withConfig({ token: readToken }) })
    : null;

export async function GET(request: Request): Promise<Response> {
  if (!handler) {
    return new Response(
      "Esikatselu ei ole käytössä: SANITY_API_READ_TOKEN puuttuu.",
      { status: 501 },
    );
  }
  return handler.GET(request);
}
