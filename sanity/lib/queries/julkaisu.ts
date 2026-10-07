/**
 * Uutisen näkyvyys sivustolla (docs/23 Y12).
 *
 * Sanityn ajastettu julkaisu ei kuulu ilmaistasoon, joten ajastus tehdään
 * julkaisuajalla: uutinen, jonka julkaisuaika on tulevaisuudessa, odottaa
 * piilossa ja tulee näkyviin itsestään (sivujen välimuisti päivittyy noin
 * minuutissa). Ehto on kaikissa uutishauissa: listat, haku, tunnisteet,
 * arkisto, etusivu, sitemap sekä edellinen- ja seuraava-linkit.
 *
 * Julkaisuaika on pakollinen kenttä; ehto sallii puuttuvan varmuuden vuoksi,
 * jottei vanha dokumentti katoa hiljaa.
 */
export const JULKAISTU = `(!defined(publishedAt) || dateTime(publishedAt) <= dateTime(now()))`;

/** Sivustolla näkyvä uutinen: oma polku ja julkaisuaika mennyt. */
export const NAKYVA_UUTINEN = `_type == "uutinen" && defined(slug.current) && ${JULKAISTU}`;
