/**
 * Upotuslohkon tulkinnan testit (lib/upotus.ts, docs/24 askel 6).
 *
 * Sivulle päätyy vain `tulkitseUpotus`-funktion rakentama osoite, joten
 * sallittujen palvelujen raja testataan tarkasti: vieraat palvelut,
 * harhaanjohtavat isäntänimet, javascript:- ja data:-osoitteet sekä
 * upotuskoodin muu HTML.
 *
 * Ajo: npm run test:upotus
 */
import assert from "node:assert/strict";

import {
  LOMAKKEEN_KORKEUS,
  UPOTUS_VIRHEET,
  UPOTUSPALVELUT,
  poimiOsoite,
  tulkitseUpotus,
  upotuksenVirhe,
} from "../lib/upotus";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const MAPS_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1906.5!2d25.66!3d60.98!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1";
const MAPS_KOODI = `<iframe src="${MAPS_SRC.replace(/&/g, "&amp;")}" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
const FORMS_ID = "1FAIpQLSdAbC_dEf-123";
const FORMS_VIEW = `https://docs.google.com/forms/d/e/${FORMS_ID}/viewform`;

/** Hylätty: ei upotusta, ja Studion virhe on annettu teksti. */
function hylatty(syote: string, virhe: string) {
  assert.equal(tulkitseUpotus(syote), null, syote);
  assert.equal(upotuksenVirhe(syote), virhe, syote);
}

test("Maps: koko upotuskoodi → src sellaisenaan, suhde 4/3", () => {
  const u = tulkitseUpotus(MAPS_KOODI);
  assert.ok(u);
  assert.equal(u.palvelu, "google-maps");
  assert.equal(u.src, MAPS_SRC);
  assert.equal(u.avaaOsoite, MAPS_SRC);
  assert.equal(u.suhde, "4/3");
  assert.equal(u.korkeus, null);
  assert.equal(upotuksenVirhe(MAPS_KOODI), null);
});

test("Maps: &amp; puretaan upotuskoodista", () => {
  const u = tulkitseUpotus('<iframe src="https://www.google.com/maps/embed?pb=a&amp;b=c"></iframe>');
  assert.equal(u?.src, "https://www.google.com/maps/embed?pb=a&b=c");
});

test("Maps: output=embed → https, avaa-linkki ilman output-parametria", () => {
  const u = tulkitseUpotus("http://maps.google.com/maps?q=Lahti&output=embed");
  assert.ok(u);
  assert.equal(u.palvelu, "google-maps");
  assert.equal(u.src, "https://maps.google.com/maps?q=Lahti&output=embed");
  assert.equal(u.avaaOsoite, "https://maps.google.com/maps?q=Lahti");
  assert.equal(u.suhde, "4/3");
});

test("Google My Maps: /maps/d/embed, vain mid ja sallitut lisäparametrit", () => {
  const u = tulkitseUpotus(
    '<iframe src="https://www.google.com/maps/d/embed?mid=1AbC_d-EF&amp;ehbc=2E312F&amp;noprof=1&amp;evil=<x>" width="640" height="480"></iframe>',
  );
  assert.ok(u);
  assert.equal(u.palvelu, "google-maps");
  assert.equal(u.src, "https://www.google.com/maps/d/embed?mid=1AbC_d-EF&ehbc=2E312F");
  assert.equal(u.avaaOsoite, "https://www.google.com/maps/d/viewer?mid=1AbC_d-EF");
  assert.equal(u.suhde, "4/3");
  assert.equal(
    tulkitseUpotus("https://www.google.com/maps/d/embed?mid=1AbC&ll=60.98,25.66&z=12")?.src,
    "https://www.google.com/maps/d/embed?mid=1AbC&ll=60.98%2C25.66&z=12",
  );
  // Kelvoton lisäparametri jätetään pois.
  assert.equal(
    tulkitseUpotus("https://www.google.com/maps/d/embed?mid=1AbC&z=javascript:x")?.src,
    "https://www.google.com/maps/d/embed?mid=1AbC",
  );
  // Ilman mid-tunnistetta tai muulla isännällä ei kelpaa.
  hylatty("https://www.google.com/maps/d/embed", UPOTUS_VIRHEET.mapsJakolinkki);
  hylatty("https://www.google.com/maps/d/embed?mid=<script>", UPOTUS_VIRHEET.mapsJakolinkki);
  assert.equal(tulkitseUpotus("https://google.com/maps/d/embed?mid=1AbC"), null);
  assert.equal(tulkitseUpotus("https://maps.google.com/maps/d/embed?mid=1AbC"), null);
});

test("Maps: jakolinkit → jakolinkkivirhe", () => {
  for (const s of [
    "https://maps.app.goo.gl/AbC123",
    "https://goo.gl/maps/AbC123",
    "https://www.google.com/maps/place/Lahti/@60.98,25.66,13z",
    "https://www.google.com/maps/@60.98,25.66,13z",
    "https://www.google.com/maps/dir/Lahti/Helsinki",
    "https://www.google.fi/maps/place/Lahti",
    "https://www.google.com/maps?q=Lahti",
  ]) {
    hylatty(s, UPOTUS_VIRHEET.mapsJakolinkki);
  }
});

test("Forms: upotuskoodin korkeus ja embedded=true", () => {
  const koodi = `<iframe src="${FORMS_VIEW}?embedded=true" width="640" height="1200" frameborder="0" marginheight="0" marginwidth="0">Ladataan…</iframe>`;
  const u = tulkitseUpotus(koodi);
  assert.ok(u);
  assert.equal(u.palvelu, "google-forms");
  assert.equal(u.src, `${FORMS_VIEW}?embedded=true`);
  assert.ok(u.src.endsWith("embedded=true"));
  assert.equal(u.avaaOsoite, FORMS_VIEW);
  assert.equal(u.korkeus, 1200);
  assert.equal(u.suhde, null);
});

test("Forms: pelkkä viewform-osoite → embedded lisätään, korkeus 900", () => {
  const u = tulkitseUpotus(`${FORMS_VIEW}?usp=sf_link`);
  assert.equal(u?.src, `${FORMS_VIEW}?embedded=true`);
  assert.equal(u?.avaaOsoite, FORMS_VIEW);
  assert.equal(u?.korkeus, LOMAKKEEN_KORKEUS);
  assert.equal(LOMAKKEEN_KORKEUS, 900);
});

test("Forms: korkeus rajataan 400–3000, prosenttikorkeus ohitetaan", () => {
  const koodi = (h: string) => `<iframe src="${FORMS_VIEW}?embedded=true" height="${h}"></iframe>`;
  assert.equal(tulkitseUpotus(koodi("10000"))?.korkeus, 3000);
  assert.equal(tulkitseUpotus(koodi("3000"))?.korkeus, 3000);
  assert.equal(tulkitseUpotus(koodi("120"))?.korkeus, 400);
  assert.equal(tulkitseUpotus(koodi("1500px"))?.korkeus, 1500);
  assert.equal(tulkitseUpotus(koodi("100%"))?.korkeus, 900);
});

test("Forms: lyhytlinkki ja muokkausosoite → omat virheet", () => {
  hylatty("https://forms.gle/AbCdEf123", UPOTUS_VIRHEET.formsLyhytlinkki);
  hylatty("https://docs.google.com/forms/d/1AbCdEf123/edit", UPOTUS_VIRHEET.formsMuokkaus);
  hylatty("https://docs.google.com/forms/d/e/1AbC/edit", UPOTUS_VIRHEET.formsMuokkaus);
  hylatty("https://docs.google.com/document/d/1AbC/edit", UPOTUS_VIRHEET.muu);
});

test("Vimeo: osoitemuodot → soittimen osoite ilman seurantaa (dnt=1)", () => {
  const tapaukset: [string, string, string][] = [
    ["https://vimeo.com/76979871", "https://player.vimeo.com/video/76979871?dnt=1&autoplay=1", "https://vimeo.com/76979871"],
    [
      "https://vimeo.com/76979871/abc123",
      "https://player.vimeo.com/video/76979871?dnt=1&h=abc123&autoplay=1",
      "https://vimeo.com/76979871/abc123",
    ],
    [
      "https://player.vimeo.com/video/76979871?h=abc123",
      "https://player.vimeo.com/video/76979871?dnt=1&h=abc123&autoplay=1",
      "https://vimeo.com/76979871/abc123",
    ],
    [
      '<iframe src="https://player.vimeo.com/video/76979871?h=abc123&amp;badge=0" width="640" height="360" allow="autoplay; fullscreen"></iframe>',
      "https://player.vimeo.com/video/76979871?dnt=1&h=abc123&autoplay=1",
      "https://vimeo.com/76979871/abc123",
    ],
    ["https://vimeo.com/channels/staffpicks/76979871", "https://player.vimeo.com/video/76979871?dnt=1&autoplay=1", "https://vimeo.com/76979871"],
  ];
  for (const [syote, src, avaa] of tapaukset) {
    const u = tulkitseUpotus(syote);
    assert.ok(u, syote);
    assert.equal(u.palvelu, "vimeo");
    assert.equal(u.src, src, syote);
    assert.equal(u.avaaOsoite, avaa, syote);
    assert.equal(u.suhde, "16/9");
  }
});

test("Vimeo: muu kuin video → muu-virhe", () => {
  hylatty("https://vimeo.com/user12345", UPOTUS_VIRHEET.muu);
  hylatty("https://player.vimeo.com/video/76979871/extra", UPOTUS_VIRHEET.muu);
});

test("YouTube → ohje omaan lohkoon", () => {
  hylatty("https://www.youtube.com/watch?v=dQw4w9WgXcQ", UPOTUS_VIRHEET.youtube);
  hylatty("https://youtu.be/dQw4w9WgXcQ", UPOTUS_VIRHEET.youtube);
  hylatty(
    '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player"></iframe>',
    UPOTUS_VIRHEET.youtube,
  );
});

test("javascript:, data: ja muut protokollat → null ja muu-virhe", () => {
  for (const s of [
    "javascript:alert(1)",
    "JavaScript:alert(document.cookie)",
    "javascript://www.google.com/maps/embed%0Aalert(1)",
    "data:text/html,<script>alert(1)</script>",
    "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
    "vbscript:msgbox(1)",
    "ftp://www.google.com/maps/embed?pb=x",
    '<iframe src="javascript:alert(1)"></iframe>',
    '<iframe src="data:text/html,<b>x</b>"></iframe>',
  ]) {
    hylatty(s, UPOTUS_VIRHEET.muu);
  }
});

test("vieraat ja harhaanjohtavat isäntänimet → null", () => {
  for (const s of [
    "https://evil.example/maps/embed",
    "https://www.google.com.evil.example/maps/embed",
    "https://evil.example/?https://www.google.com/maps/embed",
    "https://www.google.com@evil.example/maps/embed",
    "https://user:salasana@www.google.com/maps/embed?pb=x",
    "https://www.google.com:8443/maps/embed?pb=x",
    "https://docs.google.com.evil.example/forms/d/e/1AbC/viewform",
    "https://vimeo.com.evil.example/76979871",
    "https://evilvimeo.com/76979871",
    "https://example.com",
  ]) {
    hylatty(s, UPOTUS_VIRHEET.muu);
  }
});

test("isäntänimen erikoistapaukset: piste lopussa, isot kirjaimet, kyrilliset, kenoviiva", () => {
  // Piste lopussa: eri isäntänimi kuin sallittu → ei kelpaa.
  hylatty("https://www.google.com./maps/embed?pb=x", UPOTUS_VIRHEET.muu);
  hylatty("https://vimeo.com./76979871", UPOTUS_VIRHEET.muu);
  // Isot kirjaimet: isäntänimi normalisoidaan pieniksi.
  assert.equal(tulkitseUpotus("HTTPS://WWW.GOOGLE.COM/maps/embed?pb=x")?.src, "https://www.google.com/maps/embed?pb=x");
  assert.equal(tulkitseUpotus("https://Vimeo.com/76979871")?.palvelu, "vimeo");
  // Kyrilliset kirjaimet (о = U+043E) ja punycode: eri isäntä.
  hylatty("https://www.gооgle.com/maps/embed?pb=x", UPOTUS_VIRHEET.muu);
  hylatty("https://xn--ggle-55da.com/maps/embed?pb=x", UPOTUS_VIRHEET.muu);
  hylatty("https://vimeо.com/76979871", UPOTUS_VIRHEET.muu);
  // Kenoviiva: selain tulkitsee sen kauttaviivaksi, joten isäntä ratkeaa kuten selaimessa.
  hylatty("https://evil.example\\www.google.com/maps/embed?pb=x", UPOTUS_VIRHEET.muu);
  hylatty("https://www.google.com\\@evil.example/maps/embed", UPOTUS_VIRHEET.muu);
  hylatty("www.google.com\\maps\\embed?pb=x", UPOTUS_VIRHEET.muu);
  // Sallittu isäntä ja kenoviivat polussa: sama osoite kuin selaimessa, src kauttaviivoin.
  assert.equal(tulkitseUpotus("https://www.google.com\\maps\\embed?pb=x")?.src, "https://www.google.com/maps/embed?pb=x");
});

test("protokollaton osoite saa https:n, ja sallittujen raja pätee silti", () => {
  assert.equal(tulkitseUpotus("www.google.com/maps/embed?pb=x")?.src, "https://www.google.com/maps/embed?pb=x");
  assert.equal(tulkitseUpotus("//www.google.com/maps/embed?pb=x")?.src, "https://www.google.com/maps/embed?pb=x");
  assert.equal(tulkitseUpotus("vimeo.com/76979871")?.src, "https://player.vimeo.com/video/76979871?dnt=1&autoplay=1");
  hylatty("evil.example/maps/embed", UPOTUS_VIRHEET.muu);
  hylatty("www.google.com.evil.example/maps/embed", UPOTUS_VIRHEET.muu);
});

test("liitetty iframe-HTML: vain src käytetään, muu HTML ohitetaan", () => {
  const koodi =
    `<script>alert(1)</script><iframe onload="alert(1)" data-src="https://evil.example/" src="${MAPS_SRC}" ` +
    `srcdoc="<script>alert(2)</script>" width="600" height="450"></iframe><img src=x onerror=alert(3)>`;
  const u = tulkitseUpotus(koodi);
  assert.ok(u);
  assert.equal(u.src, MAPS_SRC);
  // Tulos sisältää vain rakennetut osoitteet: ei HTML:ää eikä tapahtumankäsittelijöitä.
  for (const arvo of Object.values(u)) {
    if (typeof arvo === "string") assert.ok(!/[<>"]|onload|onerror|script/i.test(arvo), arvo);
  }
  // Vain ensimmäinen iframe luetaan.
  const kaksi = `<iframe src="https://evil.example/"></iframe><iframe src="${MAPS_SRC}"></iframe>`;
  hylatty(kaksi, UPOTUS_VIRHEET.muu);
  // Pelkkä muu HTML ilman iframea ei kelpaa.
  hylatty("<script>alert(1)</script>", UPOTUS_VIRHEET.muu);
  hylatty('<a href="https://www.google.com/maps/embed?pb=x">kartta</a>', UPOTUS_VIRHEET.muu);
  // Iframe ilman osoitetta on virhe (ei hiljaa tyhjä lohko).
  hylatty('<iframe src=""></iframe>', UPOTUS_VIRHEET.muu);
  hylatty('<iframe srcdoc="<p>x</p>"></iframe>', UPOTUS_VIRHEET.muu);
});

test("poimiOsoite: lainausmerkit, lainausmerkitön src ja tyhjä src", () => {
  assert.deepEqual(poimiOsoite("<iframe src='https://a.example/x' height='300'></iframe>"), {
    url: "https://a.example/x",
    korkeus: 300,
  });
  assert.deepEqual(poimiOsoite("<IFRAME SRC=https://a.example/x HEIGHT=200>"), { url: "https://a.example/x", korkeus: 200 });
  assert.equal(poimiOsoite('<iframe src=""></iframe>'), null);
  assert.deepEqual(poimiOsoite("  https://vimeo.com/1  "), { url: "https://vimeo.com/1", korkeus: null });
});

test("tyhjä tai välilyönnit → null ilman virhettä", () => {
  for (const s of ["", "   ", "\n\t", null, undefined]) {
    assert.equal(tulkitseUpotus(s), null);
    assert.equal(upotuksenVirhe(s), null);
  }
});

test("UPOTUSPALVELUT: jokaisella palvelulla tekstit", () => {
  for (const [palvelu, t] of Object.entries(UPOTUSPALVELUT)) {
    for (const [avain, arvo] of Object.entries(t)) assert.ok(arvo.trim().length > 0, `${palvelu}.${avain}`);
    assert.match(t.latausteksti, /evästeitä/);
  }
});

console.log(`\n${ok} testiä läpi.`);
