/**
 * Kuvaloaderin testit (lib/sanity-image-loader.ts).
 *
 * Ajo: npm run test:kuvat
 */
import assert from "node:assert/strict";

import loader from "../lib/sanity-image-loader";

let ok = 0;
function test(nimi: string, fn: () => void) {
  fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

const CDN = "https://cdn.sanity.io/images/proj/production/abc123-1600x1200.jpg";
const param = (url: string) => new URL(url).searchParams;

test("rajattu kuva: korkeus skaalautuu leveyden mukana, rajaus säilyy", () => {
  const src = `${CDN}?rect=100,0,1400,1200&w=900&h=600&fit=crop&auto=format`;
  const p = param(loader({ src, width: 450 }));
  assert.equal(p.get("w"), "450");
  assert.equal(p.get("h"), "300");
  assert.equal(p.get("rect"), "100,0,1400,1200");
  assert.equal(p.get("fit"), "crop");
  assert.equal(p.get("q"), "75");
});

test("leveys rajataan rajauksen leveyteen (ei suurennusta)", () => {
  const src = `${CDN}?rect=100,0,1400,1200&w=900&h=600&fit=crop`;
  const p = param(loader({ src, width: 3840 }));
  assert.equal(p.get("w"), "1400");
  assert.equal(p.get("h"), "933");
});

test("ilman rajausta leveys rajataan lähdekuvaan", () => {
  const p = param(loader({ src: `${CDN}?w=1200&fit=max&auto=format`, width: 2048 }));
  assert.equal(p.get("w"), "1600");
  assert.equal(p.get("h"), null);
});

test("laatu ja formaatti", () => {
  const p = param(loader({ src: `${CDN}?w=800`, width: 640, quality: 60 }));
  assert.equal(p.get("q"), "60");
  assert.equal(p.get("auto"), "format");
});

test("paikallinen kuva palautetaan sellaisenaan (leveys mukana)", () => {
  assert.equal(loader({ src: "/brand/web/mark-blue.png", width: 96 }), "/brand/web/mark-blue.png?w=96");
});

console.log(`\n${ok} testiä ok`);
