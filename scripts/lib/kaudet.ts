/**
 * Kansojen liigan lohkotaulukko ↔ saman kauden karsintasivu.
 *
 * Vanhalla sivustolla kauden sivu (`ottelut2026ja2027.htm`) sisälsi sekä
 * karsinnan että Kansojen liigan. Migraatio jakoi sivun kahdeksi
 * dokumentiksi, joilla on sama `legacyUrl`: siitä parit tunnistetaan.
 * Käytetään tuonnissa (`import-huuhkajat.ts`) ja olemassa olevan datan
 * korjauksessa (`scripts/kerta/2026-10-06-patch-kansojen-liiga.ts`).
 */
import { osioLiittyyKauteen } from "../../lib/huuhkajat-osiot";

export interface KausiTaulukko {
  _id: string;
  category?: string | null;
  huuhkajatOsio?: string | null;
  legacyUrl?: string | null;
}

export interface KausiPari {
  taulukko: string;
  karsinta: string;
}

export interface KausiParitus {
  parit: KausiPari[];
  /** Taulukot, joille ei löytynyt yksiselitteistä karsintasivua. */
  ongelmat: string[];
}

function avain(url: string | null | undefined): string | null {
  const clean = url?.trim().toLowerCase().split("#")[0];
  return clean ? clean : null;
}

/** Parittaa kauteen liitettävät taulukot karsintasivuihin `legacyUrl`:n perusteella. */
export function paritaKaudet(dokumentit: KausiTaulukko[]): KausiParitus {
  const karsinnat = new Map<string, string[]>();
  for (const doc of dokumentit) {
    const url = avain(doc.legacyUrl);
    if (doc.category !== "karsinta" || !url) continue;
    karsinnat.set(url, [...(karsinnat.get(url) ?? []), doc._id]);
  }

  const parit: KausiPari[] = [];
  const ongelmat: string[] = [];
  for (const doc of dokumentit) {
    if (doc.category !== "huuhkajat" || !osioLiittyyKauteen(doc.huuhkajatOsio)) continue;
    const url = avain(doc.legacyUrl);
    const osumat = url ? (karsinnat.get(url) ?? []) : [];
    if (osumat.length === 1) {
      parit.push({ taulukko: doc._id, karsinta: osumat[0] });
    } else if (osumat.length === 0) {
      ongelmat.push(`${doc._id}: ei karsintasivua samalla vanhalla osoitteella (${doc.legacyUrl ?? "ei osoitetta"})`);
    } else {
      ongelmat.push(`${doc._id}: useita karsintasivuja (${osumat.join(", ")})`);
    }
  }
  return { parit, ongelmat };
}
