/**
 * YouTube-osoitteiden tulkinnan testit (lib/youtube.ts).
 *
 * Ajo: npm run test:youtube
 */
import assert from "node:assert/strict";

import { katseluOsoite, tulkitseYoutube, upotusOsoite } from "../lib/youtube";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const ID = "dQw4w9WgXcQ";

test("tavalliset osoitemuodot", () => {
  for (const osoite of [
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}&list=PL123&index=2`,
    `https://m.youtube.com/watch?v=${ID}`,
    `http://www.youtube.com/watch?feature=share&v=${ID}`,
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?si=AbCdEf`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/live/${ID}?feature=shared`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube-nocookie.com/embed/${ID}`,
    `  https://youtu.be/${ID}  `,
  ]) {
    assert.deepEqual(tulkitseYoutube(osoite), { id: ID, alku: null }, osoite);
  }
});

test("aloituskohta t= ja start=", () => {
  assert.equal(tulkitseYoutube(`https://youtu.be/${ID}?t=90`)?.alku, 90);
  assert.equal(tulkitseYoutube(`https://youtu.be/${ID}?t=90s`)?.alku, 90);
  assert.equal(tulkitseYoutube(`https://www.youtube.com/watch?v=${ID}&t=1m30s`)?.alku, 90);
  assert.equal(tulkitseYoutube(`https://www.youtube.com/watch?v=${ID}&t=1h2m3s`)?.alku, 3723);
  assert.equal(tulkitseYoutube(`https://www.youtube.com/embed/${ID}?start=45`)?.alku, 45);
  assert.equal(tulkitseYoutube(`https://youtu.be/${ID}?t=0`)?.alku, null);
  assert.equal(tulkitseYoutube(`https://youtu.be/${ID}?t=roskaa`)?.alku, null);
});

test("hylätään muut kuin YouTube-videot", () => {
  for (const osoite of [
    null,
    "",
    "ei osoite",
    `https://vimeo.com/${ID}`,
    `https://www.youtube.com/@kanava`,
    `https://www.youtube.com/playlist?list=PL123`,
    `https://www.youtube.com/watch?v=lyhyt`,
    `https://youtube.com.huijaus.fi/watch?v=${ID}`,
    `javascript:alert(1)//youtu.be/${ID}`,
  ]) {
    assert.equal(tulkitseYoutube(osoite), null, String(osoite));
  }
});

test("upotus- ja katseluosoite", () => {
  assert.equal(
    upotusOsoite({ id: ID, alku: null }),
    `https://www.youtube-nocookie.com/embed/${ID}?autoplay=1&rel=0`,
  );
  assert.equal(
    upotusOsoite({ id: ID, alku: 90 }),
    `https://www.youtube-nocookie.com/embed/${ID}?autoplay=1&rel=0&start=90`,
  );
  assert.equal(katseluOsoite({ id: ID, alku: 90 }), `https://www.youtube.com/watch?v=${ID}&t=90s`);
});

console.log(`\n${ok} testiä OK`);
