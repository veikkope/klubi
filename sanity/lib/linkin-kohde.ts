import type { Rule } from "sanity";

import { sisainenPolku } from "../../lib/linkki";

/**
 * Studion varoitus, kun sivuston oma linkki ei vie mihinkään (docs/23 Y17,
 * askel 1). Studio toimii samassa osoitteessa kuin sivusto, joten polku
 * tarkistetaan kysymällä sitä sivustolta: vastaus kattaa kaikki reitit,
 * Sanityn sivut ja ohjaukset ilman erillistä reittilistaa.
 *
 * Varoitus ei estä julkaisua: juuri tehty sivu voi olla vielä julkaisematta.
 * Verkkovirheessä ja palvelimen ulkopuolella (esim. `sanity documents
 * validate`) ei varoiteta.
 */

const VOIMASSA_MS = 60_000;
const valimuisti = new Map<string, { aika: number; loytyi: Promise<boolean | null> }>();

function onSivulla(polku: string): Promise<boolean | null> {
  const muistissa = valimuisti.get(polku);
  if (muistissa && Date.now() - muistissa.aika < VOIMASSA_MS) return muistissa.loytyi;
  const loytyi = fetch(polku, { method: "HEAD", redirect: "follow", credentials: "omit", cache: "no-store" })
    .then((vastaus) => (vastaus.status === 404 ? false : vastaus.ok ? true : null))
    .catch(() => null);
  valimuisti.set(polku, { aika: Date.now(), loytyi });
  return loytyi;
}

export async function tarkistaLinkinKohde(href: string | null | undefined): Promise<true | string> {
  if (typeof window === "undefined") return true;
  const polku = sisainenPolku(href);
  if (!polku) return true;
  const loytyi = await onSivulla(polku);
  return loytyi === false
    ? `Sivustolla ei ole sivua osoitteessa ${polku}. Tarkista kirjoitusasu, tai julkaise ensin sivu, johon linkki vie.`
    : true;
}

/** Varoitussääntö linkkikenttiin: lisää kentän muiden sääntöjen rinnalle. */
export const linkinKohdeVaroitus = (rule: Rule) =>
  rule.custom<string>((href) => tarkistaLinkinKohde(href)).warning();
