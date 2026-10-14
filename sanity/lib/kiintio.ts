/**
 * Sanityn kuukausikiintiön loppuminen (docs/decisions/001-sanity-kiintio.md).
 *
 * Ilmaistasolla suoran rajapinnan (api.sanity.io) pyyntöjä on 250 000 ja
 * CDN:n (apicdn.sanity.io) 1 000 000 kuukaudessa, ja kiintiöt ovat erilliset.
 * Kun suoran rajapinnan kiintiö loppuu, Sanity vastaa 402 "plan_limit_reached"
 * kaikkiin sen pyyntöihin, myös kirjoituksiin, kunnes kuukausi vaihtuu.
 * Lukuja voi silloin jatkaa CDN:n kautta (sanity/lib/fetch.ts), mutta
 * kirjoituksia (arvostelut, kommentit) ei.
 */

type SanityVirhe = {
  statusCode?: number;
  response?: { statusCode?: number; body?: { error?: string } };
};

/** Onko virhe Sanityn kiintiön loppuminen (402). */
export function onKiintioTaynna(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const virhe = error as SanityVirhe;
  return (
    virhe.statusCode === 402 ||
    virhe.response?.statusCode === 402 ||
    virhe.response?.body?.error === "plan_limit_reached"
  );
}
