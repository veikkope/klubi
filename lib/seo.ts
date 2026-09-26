import type { Metadata } from "next";

import { absoluteUrl, siteLocale, siteName } from "@/lib/site";
import { urlForImage } from "@/sanity/lib/image";

/**
 * Sivukohtaisen metadatan rakentaja.
 *
 * Jokainen reitti käyttää tätä — ei käsin koottuja Metadata-objekteja. Näin
 * kanoniset osoitteet, OG-kuvat ja otsikkomalli pysyvät samanlaisina 24
 * reitillä ilman että kukaan muistaa niitä erikseen.
 *
 * Katso `docs/11-maali-ja-rinnakkaistoteutus.md` §2.3.
 */

export interface BuildMetadataInput {
  /** Sivun otsikko ilman sivuston nimeä — malli lisää sen automaattisesti. */
  title: string;
  /** 120–160 merkkiä. Kirjoitettu ihmiselle, ei katkaistu leipätekstistä. */
  description?: string | null;
  /** Absoluuttinen polku, esim. "/ravintolat/mamma-maria". */
  path: string;
  /** Sanity-kuvalähde tai valmis URL. Jos puuttuu, käytetään generoitua OG-kuvaa. */
  image?: unknown;
  publishedAt?: string | null;
  modifiedAt?: string | null;
  /** Estä indeksointi (lomakkeiden kiitos-sivut, esikatselut). */
  noIndex?: boolean;
  /**
   * Estä linkkien seuraaminen. Erillinen `noIndex`:stä tarkoituksella:
   * sivutetulla listasivulla halutaan usein `noindex, follow`, jotta
   * syvemmät sivut löytyvät vaikka listasivua itseään ei indeksoida.
   */
  noFollow?: boolean;
  /**
   * Käytä otsikkoa sellaisenaan ilman `· Lahden Suomalainen Klubi ry`
   * -jälkiliitettä. Etusivu tarvitsee tätä, muuten nimi toistuisi kahdesti.
   */
  absoluteTitle?: boolean;
  /** `article` sisällölle jolla on julkaisuaika, muuten `website`. */
  type?: "website" | "article";
}

/** OG-kuvan URL: dokumentin oma kuva, muuten generoitu brändikuva. */
function resolveOgImage(image: unknown, title: string): string {
  if (typeof image === "string" && image.length > 0) {
    return absoluteUrl(image);
  }
  const built = urlForImage(image as never)?.width(1200).height(630).fit("crop").url();
  if (built) return built;
  return absoluteUrl(`/api/og?title=${encodeURIComponent(title)}`);
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  publishedAt,
  modifiedAt,
  noIndex = false,
  noFollow = false,
  absoluteTitle = false,
  type = "website",
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = resolveOgImage(image, title);
  const desc = description?.trim() || undefined;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: desc,
    alternates: { canonical: url },
    robots: { index: !noIndex, follow: !noFollow },
    openGraph: {
      type,
      url,
      title,
      description: desc,
      siteName,
      locale: siteLocale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(type === "article"
        ? {
            publishedTime: publishedAt ?? undefined,
            modifiedTime: modifiedAt ?? publishedAt ?? undefined,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [ogImage],
    },
  };
}

/**
 * Kuvaus sisällöstä kun kirjoitettua SEO-kuvausta ei ole.
 *
 * Ensisijaisesti tiivistelmä (joka on kirjoitettu itsenäiseksi vastaukseksi),
 * vasta viimeisenä keinona leipätekstin katkaisu.
 */
export function resolveDescription(
  ...candidates: (string | null | undefined)[]
): string | undefined {
  for (const candidate of candidates) {
    const text = candidate?.trim();
    if (text) return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
  }
  return undefined;
}
