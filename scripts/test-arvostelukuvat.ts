/**
 * Arvostelukuvien sääntöjen testit (docs/18).
 *
 * Ajo: npm run test:arvostelukuvat
 *
 * Testaa puhtaan moduulin lib/arvostelukuvat.ts ilman palvelinta ja Sanityä:
 * JPEG-tunnistuksen, metatietojen poiston ja lomakkeen kuvatarkistuksen.
 */
import assert from "node:assert/strict";

import {
  defaultPhotoAlt,
  isJpeg,
  PHOTO_ALT_MAX,
  PHOTO_MAX_BYTES,
  PHOTO_MAX_COUNT,
  stripJpegMetadata,
  validatePhotos,
} from "../lib/arvostelukuvat";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

/** JPEG-segmentti: FF <merkki> <pituus 2 tavua> <data>. */
function segment(marker: number, data: number[]): number[] {
  const length = data.length + 2;
  return [0xff, marker, length >> 8, length & 0xff, ...data];
}

const SOI = [0xff, 0xd8];
const APP0 = segment(0xe0, [...ascii("JFIF"), 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]);
const EXIF = segment(0xe1, [...ascii("Exif"), 0, 0, ...ascii("GPS 60.98N 25.66E")]);
const XMP = segment(0xe1, [...ascii("http://ns.adobe.com/xap/1.0/"), 0, ...ascii("<x:xmpmeta/>")]);
const ICC = segment(0xe2, [...ascii("ICC_PROFILE"), 0, 1, 1, 0xaa, 0xbb]);
const APP2_MUU = segment(0xe2, [...ascii("MPF"), 0, 0x11]);
const IPTC = segment(0xed, [...ascii("Photoshop 3.0"), 0, 0x22]);
const COM = segment(0xfe, ascii("Kuvattu iPhonella"));
const DQT = segment(0xdb, [0, ...Array.from({ length: 64 }, (_, i) => i + 1)]);
const SOF = segment(0xc0, [8, 0, 2, 0, 2, 1, 1, 0x11, 0]);
// Kuvadata sisältää tavuja, jotka näyttävät merkeiltä (FF 00, FF D0); niitä ei saa jäsentää.
const SOS_JA_DATA = [...segment(0xda, [1, 1, 0, 0, 0x3f, 0]), 0x12, 0xff, 0x00, 0x34, 0xff, 0xd0, 0x56];
const EOI = [0xff, 0xd9];

const bytes = (...parts: number[][]) => new Uint8Array(parts.flat());
const has = (haystack: Uint8Array, needle: number[]) =>
  Buffer.from(haystack).indexOf(Buffer.from(needle)) !== -1;

const TAYSI = bytes(SOI, APP0, EXIF, XMP, ICC, APP2_MUU, IPTC, COM, DQT, SOF, SOS_JA_DATA, EOI);
const PUHDAS = bytes(SOI, APP0, ICC, DQT, SOF, SOS_JA_DATA, EOI);

test("isJpeg tunnistaa JPEG:n alusta, ei muita", () => {
  assert.equal(isJpeg(TAYSI), true);
  assert.equal(isJpeg(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), false); // PNG
  assert.equal(isJpeg(new Uint8Array(ascii("<svg xmlns="))), false);
  assert.equal(isJpeg(new Uint8Array([0xff, 0xd8])), false);
});

test("metatiedot poistuvat: EXIF/GPS, XMP, IPTC, MPF ja kommentti", () => {
  const out = stripJpegMetadata(TAYSI);
  assert.ok(out);
  assert.equal(has(out, ascii("GPS")), false);
  assert.equal(has(out, ascii("xmpmeta")), false);
  assert.equal(has(out, ascii("Photoshop")), false);
  assert.equal(has(out, ascii("MPF")), false);
  assert.equal(has(out, ascii("iPhonella")), false);
});

test("kuvadata, JFIF ja ICC-väriprofiili säilyvät tavu tavulta", () => {
  assert.deepEqual(stripJpegMetadata(TAYSI), PUHDAS);
});

test("valmiiksi puhdas JPEG ei muutu (idempotentti)", () => {
  assert.deepEqual(stripJpegMetadata(PUHDAS), PUHDAS);
});

test("täytetavut merkin edessä hyväksytään", () => {
  const out = stripJpegMetadata(bytes(SOI, [0xff], EXIF, DQT, SOF, SOS_JA_DATA, EOI));
  assert.deepEqual(out, bytes(SOI, DQT, SOF, SOS_JA_DATA, EOI));
});

test("rikkinäinen tai muu tiedosto hylätään", () => {
  assert.equal(stripJpegMetadata(new Uint8Array(ascii("<svg onload=alert(1)>"))), null);
  assert.equal(stripJpegMetadata(bytes(SOI, APP0)), null, "SOS puuttuu");
  assert.equal(stripJpegMetadata(bytes(SOI, [0xff, 0xe1, 0xff, 0xff, 1, 2])), null, "pituus yli tiedoston");
  assert.equal(stripJpegMetadata(bytes(SOI, [0xff, 0xe1, 0x00, 0x01])), null, "pituus alle 2");
  assert.equal(stripJpegMetadata(bytes(SOI, [0x12, 0x34], SOS_JA_DATA)), null, "ei merkkiä");
  assert.equal(stripJpegMetadata(bytes(SOI, EOI)), null, "EOI ennen kuvadataa");
});

const kuva = (alt = "") => ({ bytes: TAYSI, alt });

test("ilman kuvia kelpaa, eikä lupaa tarvita", () => {
  assert.deepEqual(validatePhotos([], false), { ok: true, photos: [] });
});

test("kelvolliset kuvat: metatiedot pois, kuvaus siistitään", () => {
  const r = validatePhotos([kuva("  Paahdettu \n lohi  "), kuva()], true);
  assert.ok(r.ok);
  assert.equal(r.photos.length, 2);
  assert.deepEqual(r.photos[0].bytes, PUHDAS);
  assert.equal(r.photos[0].alt, "Paahdettu lohi");
  assert.equal(r.photos[1].alt, "");
});

test(`yli ${PHOTO_MAX_COUNT} kuvaa hylätään`, () => {
  const r = validatePhotos(Array.from({ length: PHOTO_MAX_COUNT + 1 }, () => kuva()), true);
  assert.equal(r.ok, false);
  assert.match(!r.ok ? r.error : "", /enintään 3/);
});

test("lupa on pakollinen, kun kuvia on", () => {
  const r = validatePhotos([kuva()], false);
  assert.equal(r.ok, false);
  assert.match(!r.ok ? r.error : "", /itse ottamiasi/);
});

test("liian suuri kuva hylätään ja virhe kertoo, mikä kuva", () => {
  const iso = new Uint8Array(PHOTO_MAX_BYTES + 1);
  iso.set(TAYSI);
  const r = validatePhotos([kuva(), { bytes: iso, alt: "" }], true);
  assert.equal(r.ok, false);
  assert.match(!r.ok ? r.error : "", /Kuva 2 on liian suuri/);
});

test("muu kuin JPEG hylätään (esim. PNG tai SVG ohi selaimen)", () => {
  const r = validatePhotos([{ bytes: new Uint8Array(ascii("<svg/>")), alt: "" }], true);
  assert.equal(r.ok, false);
  assert.match(!r.ok ? r.error : "", /Kuvaa 1 ei voitu lukea/);
});

test("liian pitkä kuvaus hylätään", () => {
  const r = validatePhotos([kuva("a".repeat(PHOTO_ALT_MAX + 1))], true);
  assert.equal(r.ok, false);
  assert.match(!r.ok ? r.error : "", /enintään 150 merkkiä/);
});

test("oletuskuvaus nimeää ravintolan", () => {
  assert.equal(defaultPhotoAlt("Ravintola Roux"), "Kävijän kuva ravintolasta Ravintola Roux");
});

console.log(`\n${ok} testiä läpi.`);
