/**
 * Tekstisisällön lohkot ja niiden kuvat (docs/24 askel 2, docs/05 `rikasSisalto`).
 *
 * Puhdas moduuli: vain suhteelliset ja `import type` -tuonnit, jotta testit
 * (scripts/test-lohkot.ts) ajautuvat tsx:llä.
 *
 * - `RIKKAAT_LOHKOT`: lohkot, jotka isä voi lisätä sivun, uutisen, tapahtuman
 *   ja klubin toiminnan tekstiin (+ -valikko).
 * - `PERUSLOHKOT`: tavallisen `portableText`-kentän lohkot (arkisto,
 *   ravintola-arvio, lehtileike …). Järjestys ennallaan.
 * - Kuvien poiminta tekstistä: korttikuvan varakäytös (GROQ `korttikuva()`
 *   tekee saman Sanityssa), jakokuva (lib/seo.ts) ja Studion kansikuvavaroitus.
 */

/**
 * Rikkaan sisällön muut kuin tekstilohkot, Studion valikon järjestyksessä
 * (docs/24 §2.3). Valikkoa ei ryhmitellä: `options.insertMenu` ei vaikuta
 * tekstieditorin työkalupalkkiin (sanity 5.31), joten järjestys, otsikot ja
 * ikonit ohjaavat valintaa. Kuvat ja video ensin, sitten tiedotteet ja
 * tiedostot, lopuksi taulukot.
 */
export const RIKKAAT_LOHKOT = [
  "imageWithAlt",
  "kuvasarja",
  "youtubeVideo",
  "upotus",
  "huomio",
  "painike",
  "liite",
  "taulukko",
  "kokoonpano",
] as const;
export type RikasLohko = (typeof RIKKAAT_LOHKOT)[number];

/** Tavallisen `portableText`-kentän lohkot: nykyiset kolme, järjestys ennallaan. */
export const PERUSLOHKOT = [
  "imageWithAlt",
  "kokoonpano",
  "youtubeVideo",
] as const satisfies readonly RikasLohko[];

/** Tekstikuvalta vaadittu leveys kortti- ja jakokuvaksi (pienet logot ja kaaviot jäävät pois). */
export const KUVAN_MIN_LEVEYS_SISALTO = 600;

/** Kuvan mitat Sanityn kuvaviittauksesta: image-<tunnus>-<leveys>x<korkeus>-<muoto>. */
export function kuvanMitat(image: unknown): { w: number; h: number } | null {
  const ref = (image as { asset?: { _ref?: string } } | null)?.asset?._ref ?? "";
  const m = /-(\d+)x(\d+)-[a-z]+$/.exec(ref);
  return m ? { w: Number(m[1]), h: Number(m[2]) } : null;
}

type Lohko = {
  _type?: string;
  asset?: unknown;
  kuvat?: readonly { asset?: unknown }[] | null;
};

/**
 * Tekstin kuvat järjestyksessä: yksittäiset kuvat ja kuvasarjojen kuvat
 * litistettynä. Vain kuvat, joilla on asset (keskeneräinen lataus jää pois).
 */
export function sisallonKuvat(lohkot: readonly Lohko[] | null | undefined): unknown[] {
  const kuvat: unknown[] = [];
  for (const lohko of lohkot ?? []) {
    if (!lohko) continue;
    if (lohko._type === "imageWithAlt") {
      if (lohko.asset) kuvat.push(lohko);
    } else if (lohko._type === "kuvasarja") {
      for (const k of lohko.kuvat ?? []) if (k?.asset) kuvat.push(k);
    }
  }
  return kuvat;
}

/** Ensimmäinen tekstin kuva, jonka leveys viittauksesta on vähintään `min`; muuten null. */
export function ensimmainenIsoKuva(
  lohkot: readonly Lohko[] | null | undefined,
  min: number = KUVAN_MIN_LEVEYS_SISALTO,
): unknown | null {
  for (const kuva of sisallonKuvat(lohkot)) {
    const mitat = kuvanMitat(kuva);
    if (mitat && mitat.w >= min) return kuva;
  }
  return null;
}

/**
 * Kortin teksti, kun Lyhenne puuttuu (docs/24 askel 2b): välilyönnit ja
 * rivinvaihdot yhdeksi välilyönniksi, enintään `max` merkkiä sanarajalla ja
 * perään "…". Tyhjä → null.
 */
export function korttiOte(teksti: string | null | undefined, max = 200): string | null {
  const siisti = (teksti ?? "").replace(/\s+/g, " ").trim();
  if (!siisti) return null;
  if (siisti.length <= max) return siisti;
  // Tilaa "…"-merkille; katkaisu viimeiseen välilyöntiin, ettei sana katkea.
  const raaka = siisti.slice(0, max - 1);
  const raja = raaka.lastIndexOf(" ");
  const alku = (raja > max / 2 ? raaka.slice(0, raja) : raaka).replace(/[\s,.;:–-]+$/, "");
  return `${alku}…`;
}

/**
 * Kortin näkyvä teksti: Lyhenne (GROQ antaa jo `coalesce(excerpt, tiivistelma)`),
 * muuten tekstin alku (`ote`) lyhennettynä.
 */
export function korttiTeksti(k: { excerpt?: string | null; ote?: string | null }): string | null {
  return k.excerpt?.trim() || korttiOte(k.ote);
}

/** Huomiolaatikon sävyt (docs/24 askel 6). `title` Studioon, `nimi` ruudunlukijalle. */
export const HUOMION_SAVYT = [
  { value: "tieto", title: "Tiedote (sininen)", nimi: "Tiedote" },
  { value: "tarkea", title: "Tärkeä (keltainen)", nimi: "Tärkeä" },
] as const;
export type HuomionSavy = (typeof HUOMION_SAVYT)[number]["value"];

/** Sävy arvosta. Tuntematon tai puuttuva → "tieto" (tavallinen tiedote). */
export function huomionSavy(arvo: unknown): HuomionSavy {
  return HUOMION_SAVYT.some((s) => s.value === arvo) ? (arvo as HuomionSavy) : "tieto";
}

/** Sävyn nimi ("Tiedote" tai "Tärkeä"). */
export function huomionSavynNimi(arvo: unknown): string {
  const savy = huomionSavy(arvo);
  return HUOMION_SAVYT.find((s) => s.value === savy)!.nimi;
}
