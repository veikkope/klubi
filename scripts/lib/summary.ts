/**
 * Tiivistelmä ja lyhenne leipätekstistä (docs/12 §2.1.6). Yhteinen uutis- ja
 * Blogspot-putkelle, jotta molemmat noudattavat samaa sääntöä: vain lähteen
 * omia kokonaisia virkkeitä sanatarkasti, ei mitään lisättyä.
 */

const SUMMARY_MAX = 300;
/** Virkeraja: välimerkki (+ lainaus/sulku) + välilyönti + iso kirjain/lainaus/viiva. */
const SENTENCE_SPLIT = /(?<=[.!?]["”»)]*)\s+(?=[A-ZÅÄÖ"”–-])/;
const SENTENCE_COMPLETE = /[.!?]["”»)]*$/;
/** Piste, joka ei pääty virkettä: "esim. FC Lahti", "J. Litmanen", "klo 18.". */
const ABBREVIATION_END = /(?:^|\s)(?:esim|mm|ym|ns|n|ks|vrt|klo|jne|tms|yms|vs|ts|os|synt|pj|puh|tri|prof|jr|st|dr|mr|[A-ZÅÄÖ])\.$/i;

/**
 * Tiivistelmä tekstin ensimmäisistä kokonaisista virkkeistä sanatarkasti,
 * enintään 300 merkkiä. Ei katkaista kesken virkkeen eikä lisätä mitään.
 * Palauttaa null, jos ensimmäinen virke ei ole kokonainen asiavirke (liian
 * lyhyt, ei pääty välimerkkiin tai on yli 300 merkkiä).
 */
export function summaryFromText(input: string): string | null {
  const text = input.replace(/\s+/g, " ").trim();
  if (!text) return null;

  const sentences: string[] = [];
  for (const piece of text.split(SENTENCE_SPLIT)) {
    const prev = sentences[sentences.length - 1];
    if (prev !== undefined && ABBREVIATION_END.test(prev)) sentences[sentences.length - 1] = `${prev} ${piece}`;
    else sentences.push(piece);
  }

  // Lainaus voi sisältää useita virkkeitä ("Mitä vielä. Yrittivät …") — tiivistelmä
  // ei saa päättyä kesken lainauksen, joten hyväksytään vain tasapainoiset kohdat.
  const quotesBalanced = (s: string) =>
    (s.match(/["”“]/g)?.length ?? 0) % 2 === 0 && (s.match(/«/g)?.length ?? 0) === (s.match(/»/g)?.length ?? 0);

  let out = "";
  let best = "";
  for (const s of sentences) {
    if (!SENTENCE_COMPLETE.test(s)) break;
    const next = out ? `${out} ${s}` : s;
    if (next.length > SUMMARY_MAX) break;
    out = next;
    if (quotesBalanced(out)) best = out;
  }
  // Vähintään yksi kokonainen asiavirke: ei pelkkää "Kiitos!"-tyyppistä huudahdusta.
  if (!best || best.length < 25 || best.split(" ").length < 4) return null;
  return best;
}

/**
 * Virkkeet alusta kunnes raja täyttyy. Jos jo ensimmäinen virke ylittää rajan,
 * se katkaistaan sanarajaan "…"-merkillä. Tekstiä ei muokata muuten.
 */
export function leadSentences(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  // Virkeraja = välimerkki + välilyönti + iso kirjain/lainausmerkki/viiva.
  // Päivämäärät ("29.07.2007") ja järjestysluvut ("15. marraskuuta") eivät katkaise.
  const sentences = clean.split(/(?<=[.!?]["”»)]*)\s+(?=[A-ZÅÄÖ"”–-])/);
  let out = "";
  for (const s of sentences) {
    const next = out ? `${out} ${s}` : s;
    if (next.length > max) break;
    out = next;
  }
  out = out.trim();
  // Liian lyhyt osuma (esim. "FC:n" tai "9.8." katkaisi) → sanaraja.
  if (out.length >= Math.min(60, max / 3)) return out;
  const cut = clean.lastIndexOf(" ", max - 1);
  return `${clean.slice(0, cut > 0 ? cut : max - 1).replace(/[\s,;:–-]+$/, "")}…`;
}
