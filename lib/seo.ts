import type { Metadata } from "next";
import { stegaClean } from "next-sanity";

import { absoluteUrl, siteLocale, siteName } from "@/lib/site";
import { KUVAN_MIN_LEVEYS_SISALTO, kuvanMitat, sisallonKuvat } from "@/lib/sisaltolohkot";
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
  /** Sanity-kuvalähde tai valmis URL. Jos puuttuu, kuva haetaan `sisalto`sta. */
  image?: unknown;
  /**
   * Tekstisisältö (Portable Text), josta jakokuva haetaan, kun `image` puuttuu:
   * ensimmäinen kuva tai YouTube-video. Ilman kumpaakaan jakokuvana on klubin logo.
   */
  sisalto?: readonly SisaltoLohko[] | null;
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

type SisaltoLohko = {
  _type?: string;
  asset?: unknown;
  url?: string;
  /** Kuvasarjan kuvat (docs/24 askel 2). */
  kuvat?: readonly { asset?: unknown }[] | null;
};

export type Jakokuva = { url: string; width: number; height: number };

const OG_LEVEYS = 1200;
const OG_KORKEUS = 630;
/** Tätä kapeampi rajaus ei kelpaa jakokuvaksi; varalla on logo. */
const MIN_LEVEYS = 400;
/**
 * Tekstin seasta otetulta kuvalta vaaditaan enemmän (pienet logot, kaaviot).
 * Sama raja kuin uutiskortin kuvalla (lib/sisaltolohkot.ts).
 */
const MIN_LEVEYS_SISALTO = KUVAN_MIN_LEVEYS_SISALTO;

/**
 * Kuvalähteen jakokuva 1.91:1-rajauksena (hotspotin mukaan). Kuvaa ei
 * suurenneta yli alkuperäisen: vanhan sivuston pienet kuvat venyisivät
 * 1200 pikseliin suttuisiksi. Liian pieni kuva → null.
 */
function jakokuvaLahteesta(image: unknown, minLeveys = MIN_LEVEYS): Jakokuva | null {
  if (typeof image === "string" && image.length > 0) {
    return { url: absoluteUrl(image), width: OG_LEVEYS, height: OG_KORKEUS };
  }
  const mitat = kuvanMitat(image);
  // Suurin rajaus, joka mahtuu kuvaan ilman suurentamista.
  const leveys = mitat
    ? Math.floor(Math.min(OG_LEVEYS, mitat.w, (mitat.h * OG_LEVEYS) / OG_KORKEUS))
    : OG_LEVEYS;
  if (leveys < minLeveys) return null;
  const korkeus = Math.round((leveys * OG_KORKEUS) / OG_LEVEYS);
  const url = urlForImage(image as never)?.width(leveys).height(korkeus).fit("crop").url();
  return url ? { url, width: leveys, height: korkeus } : null;
}

/**
 * Jakokuva tekstisisällöstä: ensimmäinen riittävän iso kuva (myös
 * kuvasarjasta), muuten ensimmäisen YouTube-videon kuva toistopainikkeella
 * (app/api/og).
 */
function jakokuvaSisallosta(sisalto: readonly SisaltoLohko[] | null | undefined): Jakokuva | null {
  for (const kuva of sisallonKuvat(sisalto)) {
    const jakokuva = jakokuvaLahteesta(kuva, MIN_LEVEYS_SISALTO);
    if (jakokuva) return jakokuva;
  }
  for (const b of sisalto ?? []) {
    const video = b._type === "youtubeVideo" ? tulkitseYoutube(b.url) : null;
    if (video) return jakokuvaLahteesta(`/api/og?video=${video.id}`);
  }
  return null;
}

/**
 * Jakokuva: dokumentin oma kuva, sitten tekstin kuva tai YouTube-video,
 * muuten klubin logo (app/api/og). Käytetään myös JSON-LD:ssä.
 */
export function resolveOgImage(image: unknown, sisalto?: readonly SisaltoLohko[] | null): Jakokuva {
  return (
    jakokuvaLahteesta(image) ??
    jakokuvaSisallosta(sisalto) ?? { url: absoluteUrl("/api/og"), width: OG_LEVEYS, height: OG_KORKEUS }
  );
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
    sisalto,
    publishedAt,
    modifiedAt,
    noIndex = false,
    noFollow = false,
    absoluteTitle = false,
    type = "website",
  } = stegaClean(input);
  const url = absoluteUrl(path);
  const ogImage = resolveOgImage(image, sisalto);
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
      images: [{ ...ogImage, alt: title }],
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
      images: [ogImage.url],
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
