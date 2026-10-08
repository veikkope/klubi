/**
 * Uutiskortin yhteinen projektio (docs/24 askel 2 ja 2b).
 *
 * Yksi paikka kaikille uutiskorteille: uutislista, haku, tunnisteet, arkisto,
 * etusivun nosto ja uusimmat sekä pelaajasivun lehtijutut. Muoto on
 * `UutinenCard` (lib/types.ts).
 *
 * - `excerpt`: Lyhenne, sen puuttuessa Tiivistelmä.
 * - `ote`: vain kun kumpaakaan ei ole, kolmen ensimmäisen tavallisen
 *   kappaleen teksti. Kortti lyhentää sen (`korttiTeksti`, lib/sisaltolohkot.ts).
 * - `coverImage`: kansikuva, sen puuttuessa tekstin ensimmäinen iso kuva
 *   (`korttikuva`, kuvat.ts).
 */
import { korttikuva } from "@/sanity/lib/queries/kuvat";
import { uutisenKategoriat } from "@/sanity/lib/queries/kategoriat";

/** Uutiskortin kentät ilman kuvaa. Uutissivu käyttää tätä ja omaa kansikuvaansa. */
export const uutisKortinPerus = `
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      tiivistelma,
      "excerpt": coalesce(excerpt, tiivistelma),
      "ote": select(!defined(excerpt) && !defined(tiivistelma) =>
        pt::text(body[_type == "block" && style == "normal" && !defined(listItem)][0...3])),
      ${uutisenKategoriat}`;

/** Listat, etusivu, haku ja tunnisteet: kortti kuvan varakäytöksellä. */
export const uutisKortti = `${uutisKortinPerus},
      ${korttikuva()}`;
