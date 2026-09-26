import { defineField } from "sanity";

/**
 * Kentät jotka toistuvat kaikissa sisältötyypeissä.
 *
 * `tiivistelma` on sekä käyttöliittymä- että GEO-kenttä: se renderöityy sivun
 * alkuun ingressiksi ja toimii samalla vastauksena, jonka hakukone tai
 * tekoälyavustaja voi siteerata sellaisenaan. Katso `docs/11-maali-ja-
 * rinnakkaistoteutus.md` §7.
 *
 * `legacyUrl` sitoo dokumentin vanhaan .htm-osoitteeseen, jotta
 * `scripts/generate-redirects.ts` voi tuottaa 301-ohjaukset automaattisesti
 * eikä niitä tarvitse ylläpitää käsin 198 sivulle.
 */

export const tiivistelmaField = (group?: string) =>
  defineField({
    name: "tiivistelma",
    title: "Tiivistelmä",
    description:
      "2–3 virkettä, jotka vastaavat sivun kysymykseen itsenäisesti. Näkyy sivun " +
      "alussa ingressinä ja on se teksti, jonka hakukone todennäköisimmin lainaa.",
    type: "text",
    rows: 3,
    validation: (rule) =>
      rule.max(300).warning("Suositus: alle 300 merkkiä — tiivistelmä, ei johdanto."),
    ...(group ? { group } : {}),
  });

export const legacyUrlField = (group?: string) =>
  defineField({
    name: "legacyUrl",
    title: "Vanha osoite",
    description:
      "Vanhan sivuston polku, esim. /ruokailulahti.htm. Täytetään migraatiossa " +
      "automaattisesti. Älä muuta käsin — tämän varassa vanhat linkit ohjautuvat.",
    type: "string",
    readOnly: true,
    ...(group ? { group } : {}),
  });

/** Migraation merkitsemä lippu: tieto vaatii ihmisen tarkistuksen. */
export const needsReviewField = (group?: string) =>
  defineField({
    name: "needsReview",
    title: "Vaatii tarkistuksen",
    description:
      "Migraatio ei saanut kaikkea tietoa varmasti oikein. Tarkista sisältö ja " +
      "ota rasti pois kun olet käynyt sen läpi.",
    type: "boolean",
    initialValue: false,
    ...(group ? { group } : {}),
  });
