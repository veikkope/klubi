/**
 * Linkkiobjektin GROQ-fragmentit (docs/24 askel 4, §2.2).
 *
 * Kysely palauttaa vain kohteen tunnisteet; kävijän osoite lasketaan koodissa
 * (`linkinOsoite`, lib/linkki.ts), jotta reittisäännöt ovat yhdessä paikassa
 * (lib/path.ts).
 *
 * Käyttö: `items[]{ label, ${linkkiProjektio} }` tai `ctaLinkki{ ${linkkiProjektio} }`.
 *
 * Tämä tiedosto ei saa tuoda tiedostoa kuvat.ts, koska kuvat.ts tuo tämän.
 */
import { JULKINEN_RAVINTOLA } from "@/lib/ravintola-arvosana";
import { JULKAISTU } from "@/sanity/lib/queries/julkaisu";

/**
 * Viitatun dokumentin tiedot. `piilossa`: ajastettu uutinen tai ravintola,
 * joka odottaa toista arvioijaa, ei näy sivustolla, joten linkkiä ei näytetä.
 * Julkaisematon kohde ei tule kyselyyn lainkaan (perspektiivi published).
 */
export const kohdeProjektio = /* groq */ `{
  _id,
  _type,
  "slug": slug.current,
  "nimi": coalesce(title, name),
  "piilossa": (_type == "uutinen" && !${JULKAISTU}) || (_type == "ravintola" && !${JULKINEN_RAVINTOLA})
}`;

/** Tiedoston tiedot linkin osoitteeseen ja kävijälle näytettävään tyyppiin ja kokoon. */
export const tiedostoProjektio = /* groq */ `{ url, originalFilename, extension, size }`;

/** Linkin kentät projektioon (vanha `href` mukana: kaksoisluku, docs/24 §0.3). */
export const linkkiProjektio = /* groq */ `tyyppi,
  href,
  "kohde": kohde->${kohdeProjektio},
  "tiedosto": tiedosto.asset->${tiedostoProjektio}`;
