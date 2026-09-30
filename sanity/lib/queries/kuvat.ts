/**
 * Kuvakenttien GROQ-projektiot.
 *
 * Sanity laskee jokaiselle kuvalle latauksen yhteydessä pienen sumean
 * esikatselun (`metadata.lqip`, noin 20 px leveä JPEG base64-muodossa, ~0,6 kt).
 * Se näytetään kuvan paikalla, kunnes varsinainen kuva on latautunut, jottei
 * sivulle jää tyhjiä laatikoita (`SanityImage`, `FramedImage`).
 *
 * Projektiot säilyttävät kuvan kaikki kentät (`...`: asset-viittaus, alt,
 * caption, hotspot, crop) ja lisäävät vain uuden kentän.
 *
 * Käyttö kyselyssä:
 *   coverImage{${kuva}}          yksittäinen kuva
 *   "image": images[0]{${kuva}}  taulukon ensimmäinen kuva
 *   body[]{${runko}}             Portable Text, jossa voi olla kuvia
 *   images[]{${ruutukuva}}       isot kuvaruudukot (galleria-albumi)
 */

/** Sumea esikatselu data-URL:na. Rajattuihin projektioihin: `{ alt, asset, ${lqip} }`. */
export const lqip = `"lqip": asset->metadata.lqip`;

/** Kuvan hallitseva väri (esim. "#5a6b7c") pienen ruudun taustaksi. */
export const vari = `"vari": asset->metadata.palette.dominant.background`;

/** Kuvakenttä sumealla esikatselulla. */
export const kuva = `..., ${lqip}`;

/** Portable Text -kenttä: vain kuvalohkoihin lisätään esikatselu. */
export const runko = `..., _type == "imageWithAlt" => { ${lqip} }`;

/**
 * Kuvaruudukko, jossa voi olla satoja kuvia: esikatselun (~0,6 kt/kuva, HTML:ssä
 * ja RSC-datassa) sijaan vain kuvan hallitseva väri (7 merkkiä) ruudun taustaksi.
 */
export const ruutukuva = `..., ${vari}`;
