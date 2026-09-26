/**
 * Sivutuksen apurit uutisosiolle.
 *
 * Sivunumero elää URL:ssa (`?sivu=2`), jotta jokainen sivu on jaettavissa,
 * indeksoitavissa ja toimii ilman JavaScriptiä.
 */

export type SearchParamValue = string | string[] | undefined;

/** Ottaa ensimmäisen arvon, koska `?kategoria=a&kategoria=b` on käyttäjän virhe. */
export function firstParam(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

/** Sivunumero 1..n. Virheellinen tai puuttuva arvo tarkoittaa ensimmäistä sivua. */
export function parsePage(value: SearchParamValue): number {
  const raw = firstParam(value);
  if (!raw) return 1;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

export function pageCount(total: number, perPage: number): number {
  if (total <= 0) return 1;
  return Math.max(1, Math.ceil(total / perPage));
}

/** GROQ-slice `[start...end]` annetulle sivulle. */
export function pageRange(page: number, perPage: number) {
  const start = (page - 1) * perPage;
  return { start, end: start + perPage };
}

/** Rakentaa polun kyselyparametreineen ja jättää tyhjät arvot pois. */
export function buildPath(
  basePath: string,
  params: Record<string, string | number | null | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}
