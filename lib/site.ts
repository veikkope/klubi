/**
 * Sivuston vakiot — yksi totuuden lähde.
 *
 * Kaikki mikä toistuu metadatassa, JSON-LD:ssä, sitemapissa ja footerissa
 * luetaan täältä. Älä kovakoodaa näitä arvoja muualle.
 */

export const siteUrl = "https://www.lahdensuomalainenklubi.com";

export const siteName = "Lahden Suomalainen Klubi ry";

export const siteShortName = "Lahden Suomalainen Klubi";

export const siteDescription =
  "Lahden Suomalainen Klubi ry — perustettu 2007. Tapahtumat, jäsenyys, " +
  "jalkapalloarkisto ja ravintola-arvostelut.";

export const siteLocale = "fi_FI";

export const siteLang = "fi";

export const foundingYear = "2007";

export const siteCity = "Lahti";

export const siteCountry = "FI";

/**
 * Ulkoiset profiilit. Nämä ovat `sameAs`-viittauksia JSON-LD:ssä: ne kertovat
 * hakukoneille ja tekoälyavustajille, että kyse on samasta yhdistyksestä eikä
 * samannimisestä toisesta toimijasta.
 */
export const siteProfiles = [
  "https://lahdensuomalainenklubi.blogspot.com/",
  "https://www.youtube.com/@suomalainenklubi",
];

/** Absoluuttinen URL suhteellisesta polusta. */
export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
