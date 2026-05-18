/**
 * Sivupolku-apurit. `sivu`-dokumenttien slug voi sisältää kauttaviivoja
 * (esim. "klubi/saannot"), jolloin polku on /klubi/saannot.
 */

/** Yhdistää URL-segmentit yhdeksi slug-stringiksi. */
export function joinSlug(segments: string[]): string {
  return segments.filter(Boolean).join("/");
}

/** Palauttaa esi-isäsivujen slugit pisimmästä lyhimpään. */
export function ancestorSlugs(segments: string[]): string[] {
  const result: string[] = [];
  for (let i = 1; i < segments.length; i++) {
    result.push(segments.slice(0, i).join("/"));
  }
  return result;
}

/** Lisää johtavan kauttaviivan jos puuttuu. */
export function toHref(slug: string): string {
  return slug.startsWith("/") ? slug : `/${slug}`;
}
