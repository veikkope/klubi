/**
 * Ylläpito-ohjeen koostaminen (docs/25): docs/ohje/ →
 *   - sanity/ohje/sisalto.generated.ts   Studion Ohjeet-työkalu ja Ohje-paneeli (commitoidaan)
 *   - sanity/ohje/tyypit.generated.ts    Ohje-paneelin valikko (kevyt, commitoidaan)
 *   - public/studio-ohje/ohje.html       koko ohje tulostettavana (PDF:n lähde)
 *   - public/studio-ohje/pikaopas.html   pikaopas yhdelle sivulle
 *
 * Ajo: npm run ohje   (sen jälkeen tarvittaessa npm run ohje:pdf ja npm run test:ohje)
 *
 * Toimii myös tyhjällä tai vajaalla docs/ohje-kansiolla. Kortit, joilta puuttuu
 * otsikko, jätetään pois ja listataan; muut virheet kertoo `npm run test:ohje`.
 * Tiedostot kirjoitetaan vain, jos sisältö muuttui (git ei näe turhia muutoksia).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  MODUULI,
  PIKAOPAS_TULOSTE,
  TULOSTE,
  TYYPPIMODUULI,
  generoiModuuli,
  generoiTuloste,
  generoiTyyppiModuuli,
  koostaOhje,
} from "../lib/ohje/koosta";

const JUURI = process.cwd();

function kirjoita(tiedosto: string, sisalto: string): boolean {
  const polku = join(JUURI, tiedosto);
  if (existsSync(polku) && readFileSync(polku, "utf8") === sisalto) return false;
  mkdirSync(dirname(polku), { recursive: true });
  writeFileSync(polku, sisalto, "utf8");
  return true;
}

const koonti = koostaOhje(JUURI);
const kortteja = koonti.sisalto.osiot.reduce((n, o) => n + o.kortit.length, 0);

const tulokset: [string, boolean][] = [
  [MODUULI, kirjoita(MODUULI, generoiModuuli(koonti.sisalto))],
  [TYYPPIMODUULI, kirjoita(TYYPPIMODUULI, generoiTyyppiModuuli(koonti.sisalto))],
  [TULOSTE, kirjoita(TULOSTE, generoiTuloste(koonti))],
  [PIKAOPAS_TULOSTE, kirjoita(PIKAOPAS_TULOSTE, generoiTuloste(koonti, true))],
];

console.log(`Ohje: ${kortteja} korttia, ${koonti.sisalto.osiot.length} osiota, versio ${koonti.sisalto.versio}`);
for (const o of koonti.sisalto.osiot) console.log(`  ${o.otsikko}: ${o.kortit.length}`);
for (const [tiedosto, muuttui] of tulokset) console.log(`${muuttui ? "kirjoitettu" : "ennallaan "}  ${tiedosto}`);
for (const t of koonti.ohitetut) console.warn(`VAROITUS: ohitettu (otsikko puuttuu): ${t}`);
for (const t of koonti.tuntemattomat) console.warn(`VAROITUS: ei kuulu mihinkään osioon: ${t}`);
const virheellisia = koonti.kasitellyt.filter((k) => k.virheet.length).length;
if (virheellisia) console.warn(`VAROITUS: ${virheellisia} kortissa on virheitä. Aja npm run test:ohje.`);
