import type { NavigationItem } from "./types";

/**
 * Osoittaako jokin alalinkki jo pääkohdan sivulle (esim. Klubi → Esittely
 * /klubi). Silloin erillistä "yleisesittely"-linkkiä ei lisätä, koska se
 * toistaisi saman.
 *
 * Omassa riippuvuuksettomassa moduulissaan, koska valikon selainkomponentti
 * (header-client.tsx) käyttää tätä: lib/navigaatio.ts toisi mukanaan
 * linkki- ja reittisäännöt (lib/linkki.ts, lib/path.ts) jokaisen sivun
 * selainpakettiin.
 */
export function onYleissivuAlavalikossa(item: NavigationItem): boolean {
  return Boolean(item.children?.some((c) => c.href === item.href));
}
