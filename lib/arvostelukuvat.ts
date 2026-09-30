/**
 * Kävijän ravintola-arvostelun kuvat: yhteiset säännöt (docs/18).
 *
 * Puhdas moduuli ilman selain- tai palvelinriippuvuuksia, jotta samat rajat
 * ovat voimassa lomakkeessa, palvelintoiminnossa, siivouksessa ja testeissä
 * (scripts/test-arvostelukuvat.ts).
 *
 * Kulku:
 * 1. Selain pienentää kuvan (enintään PHOTO_MAX_EDGE px) ja tallentaa sen
 *    JPEG:ksi. Uudelleenpiirto poistaa samalla metatiedot, kuten GPS-sijainnin.
 * 2. Palvelin ei luota selaimeen: se hyväksyy vain JPEG:n (tunnistetaan
 *    tiedoston alusta, ei ilmoitetusta tyypistä) ja poistaa metatiedot vielä
 *    kerran (`stripJpegMetadata`), jos joku lähettää lomakkeen ohi selaimen.
 * 3. Kuva ladataan Sanityyn `source.name = REVIEW_PHOTO_SOURCE` -merkinnällä.
 *    Siivous poistaa vain näin merkityt kuvat, joten klubin omiin kuviin se
 *    ei koske koskaan.
 */

/** Enintään näin monta kuvaa yhteen arvosteluun. */
export const PHOTO_MAX_COUNT = 3;

/** Selaimen pienentämän kuvan pidempi sivu pikseleinä. */
export const PHOTO_MAX_EDGE = 1600;

/**
 * Yhden kuvan enimmäiskoko palvelimella. Selaimen tuottama kuva on yleensä
 * 200–600 kt; raja jättää varaa mutta pitää koko pyynnön Vercelin 4,5 Mt:n
 * rajan alla (3 × 1,3 Mt + lomakkeen teksti < `serverActions.bodySizeLimit` 4 Mt).
 */
export const PHOTO_MAX_BYTES = 1_300_000;

/** Selain yrittää pysyä tämän alla laskemalla laatua tarvittaessa. */
export const PHOTO_TARGET_BYTES = 900_000;

/** Kuvan kuvauksen (alt-teksti) enimmäispituus. */
export const PHOTO_ALT_MAX = 150;

/**
 * Selain ei pienennä tätä suurempia tiedostoja (esim. RAW-kuvat): purkaminen
 * voisi kaataa puhelimen selaimen muistin loppumiseen.
 */
export const PHOTO_SOURCE_MAX_BYTES = 40_000_000;

/** Sanity-kuvan `source.name`: tunnistaa kävijöiden lataamat kuvat siivousta varten. */
export const REVIEW_PHOTO_SOURCE = "kavija-arvostelu";

/**
 * Orpo kuva poistetaan vasta, kun se on ollut ilman viittausta tämän ajan.
 * Suojaa hetken, jolloin kuva on jo ladattu mutta arvostelua ei vielä luotu.
 */
export const ORPHAN_GRACE_HOURS = 24;

/** Lomakkeen kenttänimet (FormData). */
export const PHOTO_FIELD = "kuvat";
export const PHOTO_ALT_FIELD = "kuvaKuvaus";
export const PHOTO_CONSENT_FIELD = "kuvaLupa";

/** Onko tavujono JPEG (SOI-merkki FF D8 FF)? */
export function isJpeg(bytes: Uint8Array): boolean {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

const ICC_PROFILE = [0x49, 0x43, 0x43, 0x5f, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x00]; // "ICC_PROFILE\0"

function startsWith(bytes: Uint8Array, offset: number, prefix: number[]): boolean {
  if (offset + prefix.length > bytes.length) return false;
  return prefix.every((b, i) => bytes[offset + i] === b);
}

/**
 * Poistaa JPEG:stä metatiedot: APP1–APP15 (EXIF, XMP, IPTC, GPS, esikatselukuvat)
 * ja kommentit (COM). Säilyttää APP0:n (JFIF), APP2:n ICC-väriprofiilin ja kaikki
 * kuvadataan tarvittavat segmentit. Kuvadata (SOS:sta loppuun) kopioidaan sellaisenaan.
 *
 * Palauttaa `null`, jos tiedosto ei ole kelvollinen JPEG — silloin sitä ei
 * hyväksytä. Kuvan suunta on EXIFissä, mutta selain on jo kääntänyt kuvan
 * oikein päin pienentäessään, joten tietoa ei tarvita.
 */
export function stripJpegMetadata(bytes: Uint8Array): Uint8Array | null {
  if (!isJpeg(bytes)) return null;
  const out: Uint8Array[] = [bytes.subarray(0, 2)];
  let i = 2;

  while (i < bytes.length) {
    if (bytes[i] !== 0xff) return null;
    // Merkkiä voi edeltää täytetavuja (FF FF …).
    while (i < bytes.length && bytes[i] === 0xff) i++;
    if (i >= bytes.length) return null;
    const marker = bytes[i];
    const markerStart = i - 1;
    i++;

    // Pituudettomat merkit: TEM ja RSTn. EOI ennen SOS:ia on virhe.
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      out.push(bytes.subarray(markerStart, i));
      continue;
    }
    if (marker === 0xd9 || marker === 0xd8 || marker === 0x00) return null;

    if (i + 2 > bytes.length) return null;
    const length = (bytes[i] << 8) | bytes[i + 1];
    if (length < 2 || i + length > bytes.length) return null;
    const segmentEnd = i + length;

    if (marker === 0xda) {
      // Start of Scan: loppu on kuvadataa, jota ei jäsennetä.
      out.push(bytes.subarray(markerStart));
      return concat(out);
    }

    const isApp = marker >= 0xe1 && marker <= 0xef;
    const keepIcc = marker === 0xe2 && startsWith(bytes, i + 2, ICC_PROFILE);
    const drop = (isApp && !keepIcc) || marker === 0xfe;
    if (!drop) out.push(bytes.subarray(markerStart, segmentEnd));
    i = segmentEnd;
  }
  return null;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    result.set(p, offset);
    offset += p.length;
  }
  return result;
}

export type PhotoInput = { bytes: Uint8Array; alt: string };
export type CleanPhoto = { bytes: Uint8Array; alt: string };

/**
 * Palvelimen kuvatarkistus. Palauttaa joko siivotut kuvat tai suomenkielisen
 * virheen, joka näytetään kentän "Kuvat" kohdalla.
 */
export function validatePhotos(
  photos: PhotoInput[],
  consent: boolean,
): { ok: true; photos: CleanPhoto[] } | { ok: false; error: string } {
  if (photos.length === 0) return { ok: true, photos: [] };
  if (photos.length > PHOTO_MAX_COUNT) {
    return { ok: false, error: `Voit liittää enintään ${PHOTO_MAX_COUNT} kuvaa.` };
  }
  if (!consent) {
    return { ok: false, error: "Vahvista, että kuvat ovat itse ottamiasi ja klubi saa julkaista ne." };
  }

  const clean: CleanPhoto[] = [];
  for (const [index, photo] of photos.entries()) {
    const n = index + 1;
    if (photo.bytes.length > PHOTO_MAX_BYTES) {
      return { ok: false, error: `Kuva ${n} on liian suuri. Poista se ja lisää se uudelleen.` };
    }
    const stripped = stripJpegMetadata(photo.bytes);
    if (!stripped) {
      return { ok: false, error: `Kuvaa ${n} ei voitu lukea. Poista se ja lisää se uudelleen.` };
    }
    const alt = photo.alt.trim().replace(/\s+/g, " ");
    if (alt.length > PHOTO_ALT_MAX) {
      return { ok: false, error: `Kuvan ${n} kuvaus saa olla enintään ${PHOTO_ALT_MAX} merkkiä.` };
    }
    clean.push({ bytes: stripped, alt });
  }
  return { ok: true, photos: clean };
}

/** Alt-teksti, kun kävijä ei kuvannut kuvaa itse. */
export function defaultPhotoAlt(restaurantName: string): string {
  return `Kävijän kuva ravintolasta ${restaurantName}`;
}
