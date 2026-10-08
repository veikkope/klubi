/**
 * Kirjoittajien kuvatilaukset korttien frontmatterista (`docs/ohje/**.md`,
 * kenttä `kuvat`). Vain luku. Kuvaskripti vertaa tilauksia manifestiin:
 * tilaus ilman manifestia ja merkintänumeroiden ero raportoidaan.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { parse as jasennaYaml } from "yaml";

export interface Tilaus {
  id: string;
  /** Kortin tiedosto (docs/ohje/…). */
  kortti: string;
  nakyma?: string;
  avaa?: string;
  merkinnat: Record<number, string>;
  alt?: string;
}

function mdTiedostot(kansio: string): string[] {
  if (!existsSync(kansio)) return [];
  return readdirSync(kansio).flatMap((nimi) => {
    const polku = join(kansio, nimi);
    if (statSync(polku).isDirectory()) return mdTiedostot(polku);
    return nimi.endsWith(".md") && nimi !== "README.md" ? [polku] : [];
  });
}

/** Lukee tilaukset. Jäsennysvirheet palautetaan erikseen (kortti ei kaada ajoa). */
export function lueTilaukset(juuri: string, kansio = "docs/ohje"): { tilaukset: Map<string, Tilaus>; virheet: string[] } {
  const tilaukset = new Map<string, Tilaus>();
  const virheet: string[] = [];
  for (const tiedosto of mdTiedostot(join(juuri, kansio))) {
    const kortti = relative(juuri, tiedosto).replaceAll("\\", "/");
    const osuma = readFileSync(tiedosto, "utf-8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!osuma) continue;
    let fm: { kuvat?: unknown };
    try {
      fm = (jasennaYaml(osuma[1]) ?? {}) as { kuvat?: unknown };
    } catch (e) {
      virheet.push(`${kortti}: frontmatter ei jäsenny (${(e as Error).message.split("\n")[0]})`);
      continue;
    }
    if (!Array.isArray(fm.kuvat)) continue;
    for (const k of fm.kuvat as Record<string, unknown>[]) {
      if (typeof k?.id !== "string") {
        virheet.push(`${kortti}: kuvatilaukselta puuttuu id`);
        continue;
      }
      const merkinnat: Record<number, string> = {};
      if (k.merkinnat && typeof k.merkinnat === "object") {
        for (const [n, kuvaus] of Object.entries(k.merkinnat as Record<string, unknown>)) {
          merkinnat[Number(n)] = String(kuvaus);
        }
      }
      if (tilaukset.has(k.id)) {
        virheet.push(`${kortti}: kuvan id ${k.id} on jo tilattu kortissa ${tilaukset.get(k.id)?.kortti}`);
        continue;
      }
      tilaukset.set(k.id, {
        id: k.id,
        kortti,
        nakyma: typeof k.nakyma === "string" ? k.nakyma : undefined,
        avaa: typeof k.avaa === "string" ? k.avaa : undefined,
        merkinnat,
        alt: typeof k.alt === "string" ? k.alt : undefined,
      });
    }
  }
  return { tilaukset, virheet };
}
