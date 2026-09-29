/**
 * Migroidun Huuhkajat-taulukon osio (`lib/huuhkajat-osiot.ts`) slugin
 * perusteella. Käytetään vain migraatiossa: tuonti ja patch asettavat osion
 * kenttään, minkä jälkeen sivusto lukee sen kentästä eikä slugista.
 */
import { HUUHKAJAT_OSIO_OLETUS } from "../../lib/huuhkajat-osiot";

const SAANNOT: [RegExp, string][] = [
  [/^huuhkajat-pelaajatilasto-/, "pelaajatilastot"],
  [/^huuhkaja-arvostelu/, "huuhkaja-arvostelu"],
  [/^kansojen-liiga-/, "kansojen-liiga"],
  [/^suomen-paras-avauskokoonpano-/, "avauskokoonpano"],
  [/^huuhkajat-englannin-/, "englanti"],
];

export function huuhkajatOsioForSlug(slug: string): string {
  return SAANNOT.find(([pattern]) => pattern.test(slug))?.[1] ?? HUUHKAJAT_OSIO_OLETUS;
}
