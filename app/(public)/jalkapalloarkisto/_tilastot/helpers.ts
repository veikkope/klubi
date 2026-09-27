import type { Crumb } from "@/components/layout/breadcrumbs";
import { rootCrumb } from "@/lib/nav-sections";
import { datasetSchema } from "@/lib/schema-org";
import type { TilastoDoc, TilastoSummary } from "@/sanity/lib/queries/arkisto";

/**
 * Arkistosivujen jaetut apurit: murupolut, JSON-LD-datajoukot ja
 * yhteenvetolaskenta hub-sivuille.
 */

export const arkistoBasePath = "/jalkapalloarkisto";
export const arkistoTitle = "Jalkapalloarkisto";

const arkistoCrumb: Crumb = { label: arkistoTitle, href: arkistoBasePath };

/**
 * Karsintataulukoiden osoitteet.
 *
 * Karsinnoilla ei ole omaa hub-reittiä: ne listataan Huuhkajat-sivulla, joka
 * on niiden vanhempi sekä navigaatiossa (`arkistoNav`) että murupolussa.
 */
export const karsinnatBasePath = "/jalkapalloarkisto/karsinnat";
export const huuhkajatPath = "/jalkapalloarkisto/huuhkajat";

export function karsintaPath(slug: string): string {
  return `${karsinnatBasePath}/${slug}`;
}

/** Kategorian "muu" koosteet: oma sivu per dokumentti (ks. lib/path.ts). */
export const muutTilastotPath = "/jalkapalloarkisto/tilastot";

export function muuTilastoPath(slug: string): string {
  return `${muutTilastotPath}/${slug}`;
}

/** Murupolku arkiston sisällä. Alkaa aina etusivulta. */
export function arkistoTrail(...steps: Crumb[]): Crumb[] {
  return [rootCrumb, arkistoCrumb, ...steps];
}

type Json = Record<string, unknown>;

interface DatasetInput {
  tilastot: TilastoDoc[];
  path: string;
  /** Sivun otsikko — käytetään kun tilastoja ei vielä ole. */
  title: string;
  description: string;
  /** Oma polku taulukolle, kun taulukko asuu eri osoitteessa kuin listaus. */
  itemPath?: (tilasto: TilastoDoc) => string;
}

/**
 * Jokainen tilastotaulukko on oma `Dataset`-entiteettinsä. Tyhjällä sivulla
 * kuvataan sivu itse, jolloin rakenne on olemassa ennen sisältöä.
 */
export function datasetSchemas({
  tilastot,
  path,
  title,
  description,
  itemPath,
}: DatasetInput): Json[] {
  if (tilastot.length === 0) {
    return [datasetSchema({ title, description, path })];
  }

  return tilastot.map((tilasto) =>
    datasetSchema({
      title: tilasto.title,
      description: tilasto.tiivistelma ?? description,
      path: itemPath
        ? itemPath(tilasto)
        : tilasto.slug
          ? `${path}#${tilasto.slug}`
          : path,
      modifiedAt: tilasto._updatedAt,
    }),
  );
}

/** Montako tilastotaulukkoa kussakin kategoriassa on. */
export function countByCategory(
  summary: TilastoSummary[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of summary) {
    if (!item.category) continue;
    counts[item.category] = (counts[item.category] ?? 0) + 1;
  }
  return counts;
}

/** Tuorein muokkausaika — tuoreussignaali hub-sivulle (docs/11 §7). */
export function latestUpdate(summary: TilastoSummary[]): string | null {
  let latest: string | null = null;
  for (const item of summary) {
    if (!item.updatedAt) continue;
    if (!latest || item.updatedAt > latest) latest = item.updatedAt;
  }
  return latest;
}

/** Suomenkielinen "n taulukkoa" ilman erillistä lokalisointikirjastoa. */
export function tableCountLabel(count: number): string {
  return count === 1 ? "1 taulukko" : `${count} taulukkoa`;
}
