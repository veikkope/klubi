/**
 * Studion tilamerkkien säännöt (docs/24 askel 10, docs/23 Y37).
 *
 * Merkki näkyy dokumentin alapalkissa (Julkaise-painikkeen vieressä) tekstinä. Päätös 8.10.2026: vain tila,
 * jota Sanity ei itse näytä: Ajastettu (uutinen), Tarkistettava, Odottaa
 * toista arvioijaa (ravintola) ja Piilotettu (kommentti). Julkaisun tila
 * näkyy Sanityn omasta tilasta, ja entiset hallituksen jäsenet omalla
 * listallaan, joten niille ei ole merkkiä.
 *
 * Puhdas moduuli (vain suhteelliset tuonnit): testataan komennolla
 * `npm run test:tilamerkit`. Käyttöliittymä: sanity/merkit.ts.
 */
import { formatDateTime } from "./format";
import { VAHIMMAISARVIOIJAT } from "./ravintola-arvosana";

export type MerkinNimi = "ajastettu" | "tarkistettava" | "odottaaToistaArvioijaa" | "piilotettu";

/** Merkki ja sen tyypit. Tarkistettavan tyypit tulevat Tarkistettavat-rekisteristä. */
export function merkkienNimetTyypille(tyyppi: string, tarkistettavatTyypit: readonly string[]): MerkinNimi[] {
  const nimet: MerkinNimi[] = [];
  if (tyyppi === "uutinen") nimet.push("ajastettu");
  if (tarkistettavatTyypit.includes(tyyppi)) nimet.push("tarkistettava");
  if (tyyppi === "ravintola") nimet.push("odottaaToistaArvioijaa");
  if (tyyppi === "kommentti") nimet.push("piilotettu");
  return nimet;
}

function aika(arvo: unknown): number | null {
  if (typeof arvo !== "string" || !arvo) return null;
  const t = Date.parse(arvo);
  return Number.isNaN(t) ? null : t;
}

/** Julkaisuaika on tulevaisuudessa (sama ehto kuin sivuston JULKAISTU ja Ajastetut-lista). */
export function onAjastettu(publishedAt: unknown, nyt: Date): boolean {
  const t = aika(publishedAt);
  return t !== null && t > nyt.getTime();
}

/** Dokumentin versio (luonnos tai julkaistu); kentät tarkistetaan ajossa. */
export type Versio = Record<string, unknown> | null | undefined;

/**
 * Ajastetun uutisen merkin selite, tai null, jos uutinen ei ole ajastettu.
 * Studio näyttää luonnoksen, jos sellainen on: tuleva aika luonnoksessa tulee
 * voimaan vasta julkaisusta.
 */
export function ajastetunSelite(draft: Versio, published: Versio, nyt: Date): string | null {
  const nakyva = draft ?? published;
  if (!nakyva || !onAjastettu(nakyva.publishedAt, nyt)) return null;
  const pvm = formatDateTime(nakyva.publishedAt as string);
  const voimassa = published && (!draft || draft.publishedAt === published.publishedAt);
  return voimassa ? `Tulee sivustolle ${pvm}.` : `Tulee sivustolle ${pvm}, kun painat Julkaise.`;
}

/** Migraation "Vaatii tarkistuksen" -lippu. */
export function onTarkistettava(doc?: Versio): boolean {
  return doc?.needsReview === true;
}

export function tarkistettavanSelite(doc?: Versio): string {
  return typeof doc?.tarkistettavaa === "string" && doc.tarkistettavaa.trim()
    ? "Lue kohta Mitä tarkistaa. Kun asia on kunnossa, käännä kytkin Vaatii tarkistuksen pois päältä ja julkaise."
    : "Tarkista tiedot. Kun asia on kunnossa, käännä kytkin Vaatii tarkistuksen pois päältä ja julkaise.";
}

export type RavintolanArvosana = {
  automaattinenArvosana?: { arvioijia?: number | null } | null;
  ratingOverall?: number | null;
  stars?: number | null;
} | null;

/**
 * Näkyykö ravintola sivustolla. JS-vastine GROQ-ehdolle JULKINEN_RAVINTOLA
 * (lib/ravintola-arvosana.ts); pariteetti testataan groq-js:llä.
 */
export function onJulkinenRavintola(doc?: RavintolanArvosana): boolean {
  if (!doc) return false;
  const auto = doc.automaattinenArvosana;
  if (auto != null) return typeof auto.arvioijia === "number" && auto.arvioijia >= VAHIMMAISARVIOIJAT;
  return doc.ratingOverall != null || doc.stars != null;
}

export function odottavanSelite(doc?: RavintolanArvosana): string {
  const arvioijia = doc?.automaattinenArvosana?.arvioijia ?? 0;
  return (
    `Klubilaisten arvosanoja ${arvioijia}. Ravintola näkyy sivustolla, kun vähintään ` +
    `${VAHIMMAISARVIOIJAT} klubilaista on arvioinut sen.`
  );
}

/** Piilotettu kommentti. Piilotus muuttaa julkaistua versiota, joten se ratkaisee. */
export function onPiilotettu(draft?: Versio, published?: Versio): boolean {
  return (published ?? draft)?.piilotettu === true;
}
