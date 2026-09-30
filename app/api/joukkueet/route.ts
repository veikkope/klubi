import { getJoukkueet } from "@/lib/ottelut";

/**
 * Automaattisen otteluohjelman joukkueiden nimet Studiolle (ottelun
 * joukkuekentän ehdotukset ja kirjoitusvirheiden varoitus, lib/joukkueet.ts).
 * Julkista tietoa: sama lista näkyy /ottelut-sivulla. Päivittyy tunnin välein
 * kuten otteluohjelma.
 */
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  return Response.json({ joukkueet: await getJoukkueet() });
}
