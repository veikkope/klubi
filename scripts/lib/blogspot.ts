/**
 * Blogspot-migraation jaetut tyypit ja kuva-URL-apurit (docs/14).
 * Käyttäjät: `scripts/fetch-blogspot.ts`, `scripts/parse-blogspot.ts`.
 */

export const BLOG_ORIGIN = "https://lahdensuomalainenklubi.blogspot.com";

/** Pidemmän sivun enimmäiskoko, jossa kuvat haetaan Bloggerista. */
export const IMAGE_SIZE = 2048;

export interface BlogspotPost {
  /** Bloggerin pysyvä kirjoitus-id — synkronoinnin avain. */
  id: string;
  url: string;
  published: string;
  updated: string;
  title: string;
  html: string;
  labels: string[];
  commentCount: number;
}

export interface BlogspotComment {
  id: string;
  postId: string;
  published: string;
  author: string;
  html: string;
}

export interface BlogspotImage {
  /** URL kanonisoituna kokoon {@link IMAGE_SIZE} — sama kuva eri kokoina on yksi rivi. */
  url: string;
  /** Paikallinen tiedostonimi `data/blogspot/images/`-kansiossa. */
  file: string;
  /** Alkuperäinen tiedostonimi URL:sta (alt-tekstin johtamiseen), jos on. */
  originalName: string | null;
  bytes: number;
  contentType: string | null;
  status: number;
  ok: boolean;
}

const BLOGGER_IMG = /^https?:\/\/(?:blogger\.googleusercontent\.com|\d\.bp\.blogspot\.com)\//i;

/**
 * Bloggerin kuva-URL kokoon 2048 px. Muodot:
 *   …/img/b/<avain>/s320/Tiedosto.jpg   → kokosegmentti vaihdetaan
 *   …/img/a/<avain>=s1599               → kokoparametri vaihdetaan
 *   …/img/a/<avain>                     → alkuperäinen; parametri lisätään
 */
export function canonicalImageUrl(src: string): string | null {
  const url = src.trim().replace(/^http:/, "https:");
  if (!BLOGGER_IMG.test(url)) return null;
  if (/\/(?:s\d+|w\d+-h\d+)[^/]*\/[^/]+$/.test(url)) {
    return url.replace(/\/(?:s\d+|w\d+-h\d+)[^/]*\/([^/]+)$/, `/s${IMAGE_SIZE}/$1`);
  }
  if (/=[swh]\d+[^/]*$/.test(url)) return url.replace(/=[swh]\d+[^/]*$/, `=s${IMAGE_SIZE}`);
  // …/img/b/<avain>/ (ei kokoa eikä nimeä): koko on polun segmentti, ei parametri.
  if (url.endsWith("/")) return `${url}s${IMAGE_SIZE}/`;
  return `${url}=s${IMAGE_SIZE}`;
}

/** Alkuperäinen tiedostonimi segmentoidusta URL:sta, esim. "LahtiMIFK240223.jpg". */
export function originalImageName(url: string): string | null {
  const m = /\/(?:s\d+|w\d+-h\d+)[^/]*\/([^/]+)$/.exec(url);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]).normalize("NFC");
  } catch {
    return m[1];
  }
}
