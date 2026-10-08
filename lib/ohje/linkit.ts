/**
 * Ohjeen linkkien ja kuvapolkujen muunnokset (docs/ohje/README.md, kohta Linkit).
 *
 * - `studio:rakenne/a/b`              → /studio/structure/a;b (rakenteen kiinteät tunnukset, sanity/structure.ts)
 * - `studio:luo/<tyyppi>[?pohja=x]`   → /studio/intent/create/template=x;type=<tyyppi>
 * - `studio:muokkaa/<id>`             → /studio/intent/edit/id=<id>
 * - `studio:aloitus`                  → /studio/aloitus
 * - `../osio/kortti.md[#ankkuri]`     → /studio/ohjeet/kortti
 * - `../../public/studio-ohje/x.webp` → /studio-ohje/x.webp
 *
 * Intent-osoitteen muoto on Sanityn reitittimen (sanity 5.31.2 `route.intents`,
 * parametrit `avain=arvo;avain=arvo`). Puhdas moduuli: Studio, koostaja ja testi.
 */

import { OHJE_JULKINEN_POLKU, OHJEET_TYOKALU } from "./tyypit";

export type StudioLinkki =
  | { laji: "aloitus"; polku: string }
  | { laji: "rakenne"; osat: string[]; polku: string }
  | { laji: "luo"; tyyppi: string; pohja: string | null; polku: string }
  | { laji: "muokkaa"; id: string; polku: string };

const TUNNUS = /^[A-Za-z0-9_.-]+$/;

function koodaa(arvot: [string, string][]): string {
  return arvot.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join(";");
}

/** Onko osoite ohjeen Studio-linkki (`studio:`). */
export function onStudioLinkki(href: string): boolean {
  return href.startsWith("studio:");
}

/**
 * Studio-linkin jäsennys. Palauttaa virheen tekstinä, jos muoto ei kelpaa
 * (olemassaolon tarkistaa test:ohje Studion rakennetta ja skeemaa vasten).
 */
export function jasennaStudioLinkki(href: string): StudioLinkki | { virhe: string } {
  if (!onStudioLinkki(href)) return { virhe: `ei studio:-linkki: ${href}` };
  const loppu = href.slice("studio:".length);
  const [polkuOsa, kysely = ""] = loppu.split("?", 2);
  const osat = polkuOsa.split("/").filter(Boolean);
  const [laji, ...muut] = osat;
  const parametrit = new URLSearchParams(kysely);

  if (laji === "aloitus" && muut.length === 0 && !kysely) return { laji: "aloitus", polku: "/studio/aloitus" };

  if (laji === "rakenne") {
    if (kysely) return { virhe: `rakennelinkissä ei käytetä ?-parametreja: ${href}` };
    const virheellinen = muut.find((o) => !TUNNUS.test(o));
    if (virheellinen) return { virhe: `rakenteen tunnus "${virheellinen}" ei kelpaa: ${href}` };
    return {
      laji: "rakenne",
      osat: muut,
      polku: muut.length ? `/studio/structure/${muut.join(";")}` : "/studio/structure",
    };
  }

  if (laji === "luo") {
    const [tyyppi] = muut;
    if (!tyyppi || muut.length !== 1 || !TUNNUS.test(tyyppi)) return { virhe: `luo-linkistä puuttuu tyyppi: ${href}` };
    const tuntemattomat = [...parametrit.keys()].filter((k) => k !== "pohja");
    if (tuntemattomat.length) return { virhe: `tuntematon parametri ${tuntemattomat.join(", ")}: ${href}` };
    const pohja = parametrit.get("pohja");
    if (pohja !== null && !TUNNUS.test(pohja)) return { virhe: `pohjan tunnus ei kelpaa: ${href}` };
    const arvot: [string, string][] = pohja
      ? [
          ["template", pohja],
          ["type", tyyppi],
        ]
      : [["type", tyyppi]];
    return { laji: "luo", tyyppi, pohja, polku: `/studio/intent/create/${koodaa(arvot)}` };
  }

  if (laji === "muokkaa") {
    const [id] = muut;
    if (!id || muut.length !== 1 || !TUNNUS.test(id) || kysely)
      return { virhe: `muokkaa-linkistä puuttuu tunnus: ${href}` };
    return { laji: "muokkaa", id, polku: `/studio/intent/edit/${koodaa([["id", id]])}` };
  }

  return { virhe: `tuntematon studio:-linkki (sallitut: rakenne, luo, muokkaa, aloitus): ${href}` };
}

/** Ohjeen polku Studiossa yhdelle kortille. */
export function korttiPolku(id: string): string {
  return `${OHJEET_TYOKALU}/${id}`;
}

/**
 * Korttilinkki (`../uutiset/ajasta-uutinen.md`, `ajasta-uutinen.md#kohta`):
 * palauttaa kortin tunnuksen ja ankkurin, tai null, jos linkki ei ole korttilinkki.
 */
export function jasennaKorttiLinkki(href: string): { id: string; ankkuri: string | null; suhteellinen: string } | null {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("/") || href.startsWith("#")) return null;
  const osuma = /^((?:\.{1,2}\/)*(?:[a-z0-9-]+\/)?)([a-z0-9-]+)\.md(?:#(.*))?$/.exec(href);
  if (!osuma) return null;
  return { id: osuma[2], ankkuri: osuma[3] ?? null, suhteellinen: `${osuma[1]}${osuma[2]}.md` };
}

/** Kuvaviite `…/public/studio-ohje/<tiedosto>` → tiedostonimi, tai null. */
export function kuvanTiedosto(src: string): string | null {
  const osuma = /(?:^|\/)public\/studio-ohje\/([A-Za-z0-9._-]+)$/.exec(src);
  return osuma ? osuma[1] : null;
}

/** Kuvan julkinen osoite sivustolla. */
export function kuvanOsoite(tiedosto: string): string {
  return `${OHJE_JULKINEN_POLKU}/${tiedosto}`;
}

/** Kuvan tunnus (tiedostonimi ilman päätettä) = frontmatterin `kuvat[].id`. */
export function kuvanTunnus(tiedosto: string): string {
  return tiedosto.replace(/\.[A-Za-z0-9]+$/, "");
}
