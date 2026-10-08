/**
 * Studion yhteinen sanasto (docs/24 askel 1, docs/23 Y38).
 *
 * Kenttien ja välilehtien nimet puhuvat ylläpitäjän kieltä, ei kehittäjän:
 * "Osoite sivustolla" eikä "Polku (slug)", "Hakukoneet ja jako" eikä "SEO".
 * Kaikki uudet ja muutettavat skeemat käyttävät näitä vakioita, jotta sama
 * asia on joka paikassa samanniminen.
 *
 * Ryhmän tekninen nimi pysyy `seo`, joten tallennettuun dataan ei kosketa.
 */

/** Dokumentin `slug`-kentän otsikko kaikissa tyypeissä, joilla on oma sivu. */
export const OSOITE_OTSIKKO = "Osoite sivustolla";

/** Hakukone- ja jakokenttien välilehti (seoTitle, seoDescription, jakokuva). */
export const HAKUKONEET_RYHMA = { name: "seo", title: "Hakukoneet ja jako" } as const;
