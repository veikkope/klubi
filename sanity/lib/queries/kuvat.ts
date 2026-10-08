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
 *   ${korttikuva()}              uutiskortin kuva varakäytöksellä (alla)
 *   coverImage{${kuva}}          yksittäinen kuva
 *   "image": images[0]{${kuva}}  taulukon ensimmäinen kuva
 *   body[]{${runko}}             Portable Text, jossa voi olla kuvia
 *   images[]{${ruutukuva}}       isot kuvaruudukot (galleria-albumi)
 */

import { KUVAN_MIN_LEVEYS_SISALTO } from "@/lib/sisaltolohkot";

/** Sumea esikatselu data-URL:na. Rajattuihin projektioihin: `{ alt, asset, ${lqip} }`. */
export const lqip = `"lqip": asset->metadata.lqip`;

/** Kuvan hallitseva väri (esim. "#5a6b7c") pienen ruudun taustaksi. */
export const vari = `"vari": asset->metadata.palette.dominant.background`;

/** Kuvakenttä sumealla esikatselulla. */
export const kuva = `..., ${lqip}`;

/**
 * Portable Text -kenttä: kuviin esikatselu, kuvasarjan kuviin esikatselu ja
 * hallitseva väri (ruudun tausta). `kuvat`-avain korvaa `...`-levityksen
 * kuvat-taulukon (GROQ: myöhempi avain voittaa), ja keskeneräiset kuvat ilman
 * assetia jäävät pois.
 */
export const runko = `...,
  _type == "imageWithAlt" => { ${lqip} },
  _type == "kuvasarja" => { "kuvat": kuvat[defined(asset)]{ ${kuva}, ${vari} } }`;

/** Kuva on tarpeeksi iso kortti- ja jakokuvaksi (≥ 600 px, lib/sisaltolohkot.ts). */
const isoKuva = `asset->metadata.dimensions.width >= ${KUVAN_MIN_LEVEYS_SISALTO}`;

/**
 * Uutiskortin kuva (docs/24 askel 2): kansikuva, muuten tekstin ensimmäinen
 * vähintään 600 px leveä kuva, myös kuvasarjasta. Sama sääntö kuin jakokuvassa
 * (lib/seo.ts) ja Studion kansikuvavaroituksessa (`ensimmainenIsoKuva`).
 * Uutissivu ei käytä tätä, jottei sama kuva näy kahdesti.
 *
 * Nuolifunktio lausekerunkona: `sanity typegen` osaa laskea vain sellaisen
 * kutsun (ei lohkorunkoa), ja kyselyn tulostyyppi johdetaan siitä.
 */
export const korttikuva = (kentta = "coverImage", runkoKentta = "body") => `"${kentta}": coalesce(
    select(defined(${kentta}.asset) => ${kentta}),
    ${runkoKentta}[(_type == "imageWithAlt" && ${isoKuva}) || (_type == "kuvasarja" && count(kuvat[${isoKuva}]) > 0)][0]{
      "k": select(_type == "kuvasarja" => kuvat[${isoKuva}][0], @)
    }.k
  ){${kuva}}`;

/**
 * Kuvaruudukko, jossa voi olla satoja kuvia: esikatselun (~0,6 kt/kuva, HTML:ssä
 * ja RSC-datassa) sijaan vain kuvan hallitseva väri (7 merkkiä) ruudun taustaksi.
 */
export const ruutukuva = `..., ${vari}`;
