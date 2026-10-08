/**
 * Liitetiedostot (PDF, Word, Excel): linkin Tiedosto-vaihtoehto (docs/24
 * askel 4) ja tekstin liitelohko (askel 6) käyttävät samoja sääntöjä.
 *
 * Puhdas moduuli: vain suhteelliset tuonnit, jotta toimii Studiossa,
 * sivustolla ja tsx-skripteissä. Testit: `npm run test:linkki`.
 */
import { ilmanStegaa } from "./stega";

export const LIITTEEN_PAATTEET = ["pdf", "docx", "xlsx"] as const;
export type LiitteenPaate = (typeof LIITTEEN_PAATTEET)[number];

/** Tiedostovalitsimen suodatin. `application/pdf`: osa puhelimista ei tunnista päätettä. */
export const LIITTEEN_ACCEPT = ".pdf,.docx,.xlsx,application/pdf";

/** Tätä isommasta tiedostosta Studio varoittaa (ei estä). */
export const LIITE_ISO_TAVUA = 15 * 1024 * 1024;

/** Sanityn tiedosto (`tiedosto.asset->{ url, originalFilename, extension, size }`). */
export type LiitteenTiedosto = {
  url?: string | null;
  originalFilename?: string | null;
  extension?: string | null;
  size?: number | null;
};

/** Pääte tiedostoviittauksesta `file-<hash>-<pääte>`, pienillä kirjaimilla. */
export function tiedostonPaate(ref: string | null | undefined): string | null {
  const osuma = /^file-[^-]+-([a-z0-9]+)$/i.exec(ref ?? "");
  return osuma ? osuma[1].toLowerCase() : null;
}

export const LIITTEEN_PAATE_VIRHE =
  "Sallitut tiedostot: PDF, Word (.docx) ja Excel (.xlsx). Tallenna tiedosto ensin johonkin näistä muodoista.";

/** Studion tarkistus: `true` tai virheteksti. Tyhjä kelpaa (pakollisuus on oma sääntönsä). */
export function tarkistaLiitetiedosto(arvo: { asset?: { _ref?: string } | null } | null | undefined): true | string {
  const ref = arvo?.asset?._ref;
  if (!ref) return true;
  const paate = tiedostonPaate(ref);
  return paate && (LIITTEEN_PAATTEET as readonly string[]).includes(paate) ? true : LIITTEEN_PAATE_VIRHE;
}

/** Tiedostotyypin nimi kävijälle: "PDF", "Word", "Excel", muuten pääte isoilla kirjaimilla. */
export function tiedostonTyyppi(paate: string | null | undefined): string {
  const p = ilmanStegaa(paate)?.trim().toLowerCase().replace(/^\./, "") ?? "";
  if (p === "pdf") return "PDF";
  if (p === "docx" || p === "doc") return "Word";
  if (p === "xlsx" || p === "xls") return "Excel";
  return p.toUpperCase();
}

/** Koko kävijälle: 245760 → "240 kt", 2 500 000 → "2,4 Mt" (kt = 1024 tavua). */
export function tiedostonKoko(tavut: number | null | undefined): string | null {
  if (typeof tavut !== "number" || !Number.isFinite(tavut) || tavut <= 0) return null;
  const MT = 1024 * 1024;
  if (tavut < MT) return `${Math.max(1, Math.round(tavut / 1024))} kt`;
  const mt = Math.round((tavut / MT) * 10) / 10;
  return `${String(mt).replace(".", ",")} Mt`;
}

/** Linkin perään sulkeisiin: "PDF, 240 kt", "Excel, 2,4 Mt" tai "Word". Ei tietoja → "". */
export function liitteenTiedot(t: { extension?: string | null; size?: number | null } | null | undefined): string {
  return [tiedostonTyyppi(t?.extension), tiedostonKoko(t?.size)].filter(Boolean).join(", ");
}

/**
 * Kävijän osoite tiedostolle. PDF avautuu selaimessa sellaisenaan; Word ja
 * Excel ladataan alkuperäisellä nimellä (`?dl=<nimi>`), muuten selain
 * tallentaisi ne Sanityn tunnisteella nimettyinä.
 */
export function tiedostonOsoite(t: LiitteenTiedosto | null | undefined): string | null {
  const url = t?.url;
  if (!url) return null;
  const paate = ilmanStegaa(t.extension)?.toLowerCase() ?? url.split(/[?#]/)[0].split(".").pop()?.toLowerCase();
  if (paate === "pdf") return url;
  const nimi = ilmanStegaa(t.originalFilename) ?? "";
  return `${url}?dl=${encodeURIComponent(nimi)}`;
}
