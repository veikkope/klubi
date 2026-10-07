/**
 * Sivu-dokumentin polun säännöt Studiossa (sanity/schemas/documents/sivu.ts,
 * docs/23 Y21).
 *
 * Sivu näkyy reitissä `/[...slug]` vain, jos mikään koodin reitti ei vastaa
 * samaa osoitetta. Siksi koodin omistamiin polkuihin ei voi tehdä sivua:
 * se tallentuisi, mutta ei näkyisi koskaan. Poikkeuksia ovat lukitut sivut,
 * joista koodin reitti hakee sisältönsä (lib/path.ts KOODIIN_SIDOTUT_SIVUT),
 * ja palloveikkauksen alasivut.
 *
 * Puhdas moduuli: testataan komennolla `npm run test:sivupolku`, joka
 * tarkistaa myös, että jokainen app-kansion reitti on listalla.
 */
import { KOODIIN_SIDOTUT_SIVUT, PALLOVEIKKAUS_SLUG } from "./path";

/** Ensimmäiset polun osat, jotka ovat kokonaan koodin reittejä. */
export const VARATUT_YLATASON_POLUT: ReadonlySet<string> = new Set([
  "studio",
  "api",
  "blogspot",
  "yhteystiedot",
  "tapahtumat",
  "uutiset",
  "ravintolat",
  "ottelut",
  "jalkapalloarkisto",
  "galleria",
  "stadionit",
]);

/**
 * Klubi-osion koodireitit. Muut klubi/-alkuiset polut (esim. klubi/historia)
 * ovat vapaita: koodissa ei ole niille reittiä, joten sivu näkyy.
 */
export const VARATUT_KLUBIN_POLUT: ReadonlySet<string> = new Set([
  "klubi/hallitus",
  "klubi/toiminta",
  "klubi/yhteystiedot",
  "klubi/palloveikkaus",
]);

const OSA = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VARATTU = "Tämä osoite on sivuston oma osio, joten sivu ei näkyisi siinä. Valitse toinen polku.";

/** `true`, jos polku kelpaa sivulle, muuten suomenkielinen ohje. */
export function tarkistaSivunPolku(slug: string | undefined): true | string {
  if (!slug) return "Polku on pakollinen.";
  if (slug.length > 96) return "Polku on liian pitkä (enintään 96 merkkiä).";
  const osat = slug.split("/");
  if (osat.length > 4) return "Liian monta tasoa polussa (enintään 4).";
  for (const osa of osat) {
    if (!OSA.test(osa)) {
      return `Virheellinen polun osa "${osa}". Käytä vain pieniä kirjaimia a-z, numeroita ja yksittäisiä yhdysmerkkejä.`;
    }
  }
  // Lukitut sivut ovat koodireittien sisältöä (esim. klubi/hallitus).
  if (KOODIIN_SIDOTUT_SIVUT.includes(slug)) return true;
  if (VARATUT_YLATASON_POLUT.has(osat[0])) return VARATTU;
  // Palloveikkauksen alasivut (klubi/palloveikkaus/veikkausliiga) näyttää koodin reitti.
  if (slug.startsWith(`${PALLOVEIKKAUS_SLUG}/`) && osat.length === 3) return true;
  for (const varattu of VARATUT_KLUBIN_POLUT) {
    if (slug === varattu || slug.startsWith(`${varattu}/`)) return VARATTU;
  }
  return true;
}
