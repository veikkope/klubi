import type { Metadata } from "next";
import { stegaClean } from "next-sanity";

import { absoluteUrl, siteLocale, siteName } from "@/lib/site";
import { tulkitseYoutube } from "@/lib/youtube";
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
  /** Sanity-kuvalähde tai valmis URL. Jos puuttuu, jakokuvana on klubin logo. */
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

/** OG-kuvan URL: dokumentin oma kuva, muuten klubin logo (app/api/og). */
function resolveOgImage(image: unknown): string {
  if (typeof image === "string" && image.length > 0) {
    return absoluteUrl(image);
  }
  const built = urlForImage(image as never)?.width(1200).height(630).fit("crop").url();
  if (built) return built;
  return absoluteUrl("/api/og");
}

/**
 * Jakokuva tekstisisällöstä, kun dokumentilla ei ole omaa kuvaa: ensimmäinen
 * kuva tekstin seasta, muuten ensimmäisen YouTube-videon kuva
 * toistopainikkeella. Palauttaa `buildMetadata`n `image`-arvon tai undefined.
 */
export function jakokuvaSisallosta(
  sisalto: readonly { _type?: string; asset?: unknown; url?: string }[] | null | undefined,
): unknown {
  const kuva = sisalto?.find((b) => b._type === "imageWithAlt" && b.asset);
  if (kuva) return kuva;
  for (const b of sisalto ?? []) {
    const video = b._type === "youtubeVideo" ? tulkitseYoutube(b.url) : null;
    if (video) return `/api/og?video=${video.id}`;
  }
  return undefined;
}

export function buildMetadata(input: BuildMetadataInput): Metadata {
  // Luonnosnäkymässä Sanityn merkkijonoissa on näkymättömiä stega-merkkejä.
  // Niitä ei saa päätyä <head>iin (otsikko, kuvaus, canonical, OG-kuvan URL),
  // joten koko syöte puhdistetaan tässä kerran kaikkien reittien puolesta.
  const {
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
  } = stegaClean(input);
  const url = absoluteUrl(path);
  const ogImage = resolveOgImage(image);
  const desc = description?.trim() || undefined;

  return {
    // Otsikkopohja lisää sivuston nimen perään. Jos otsikko on jo sivuston nimi
    // (esim. /klubi), sitä ei toisteta: "Lahden Suomalainen Klubi ry · Lahden…".
    title:
      absoluteTitle || title.trim().toLocaleLowerCase("fi") === siteName.toLocaleLowerCase("fi")
        ? { absolute: title }
        : title,
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
    // Stega pois ennen pituuslaskua, ettei katkaisu osu koodattuun jaksoon.
    const text = stegaClean(candidate)?.trim();
    if (text) return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
  }
  return undefined;
}
