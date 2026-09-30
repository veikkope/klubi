import type { SanityClient } from "sanity";

import {
  kokoaTunnisteet,
  siistiTunniste,
  suosituimmat,
  tunnisteSlug,
  TUNNISTE_MAX_PITUUS,
  TUNNISTEITA_MAX,
  type Tunniste,
} from "../../../lib/tunnisteet";

/**
 * Studion tunnistekentän apurit: muissa uutisissa jo käytetyt tunnisteet
 * (ehdotuksia varten) ja syötteen tarkistus ennen lisäämistä.
 */

/**
 * Julkaistuissa uutisissa käytetyt tunnisteet. Tulos pidetään minuutin, jotta
 * toisessa uutisessa juuri lisätty tunniste tulee ehdotuksiin ilman sivun
 * päivitystä, mutta kentästä toiseen siirtyminen ei hae joka kerta uudelleen.
 * Virhe tai palvelinympäristö (esim. `sanity schema validate`) → tyhjä lista,
 * jolloin ehdotuksia ei näytetä, mutta tunnisteita voi silti lisätä.
 */
const VOIMASSA_MS = 60_000;
let haku: Promise<Tunniste[]> | null = null;
let haettu = 0;

export function haeKaytetytTunnisteet(client: SanityClient): Promise<Tunniste[]> {
  if (typeof window === "undefined") return Promise.resolve([]);
  if (haku && Date.now() - haettu > VOIMASSA_MS) haku = null;
  if (!haku) haettu = Date.now();
  // Luonnokset ja julkaisujen versiot pois, ettei sama uutinen laskeudu kahdesti.
  haku ??= client
    .fetch<(string[] | null)[]>(
      `*[_type == "uutinen" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))].tunnisteet`,
    )
    .then((listat) => kokoaTunnisteet(Array.isArray(listat) ? listat : []))
    .catch(() => {
      haku = null; // yritetään uudelleen seuraavalla kerralla
      return [];
    });
  return haku;
}

/** "1 uutinen" / "117 uutista". */
export function uutistenMaara(maara: number): string {
  return maara === 1 ? "1 uutinen" : `${maara} uutista`;
}

/**
 * Ehdotukset kirjoitetulle tekstille: tunnisteet, joiden jokin kirjoitusasu
 * sisältää tekstin (kirjainkoosta välittämättä) tai joiden osoite sisältää
 * tekstin osoitemuodon ("valko venäjä" löytää "Valko-Venäjä"). Uutisessa jo
 * olevat jätetään pois. Järjestys: täsmälleen sama tunniste, sitten tekstillä
 * alkavat, sitten suosituimmat.
 */
export function etsiEhdotukset(
  kaikki: readonly Tunniste[],
  kysely: string,
  kaytossa: ReadonlySet<string>,
  maara: number,
): Tunniste[] {
  const teksti = siistiTunniste(kysely).toLocaleLowerCase("fi");
  if (!teksti) return [];
  const slug = tunnisteSlug(teksti);
  const osumat = kaikki.filter(
    (t) =>
      !kaytossa.has(t.slug) &&
      (t.nimet.some((n) => n.toLocaleLowerCase("fi").includes(teksti)) || (slug !== "" && t.slug.includes(slug))),
  );
  const sija = (t: Tunniste) =>
    t.slug === slug ? 0 : t.nimi.toLocaleLowerCase("fi").startsWith(teksti) || (slug && t.slug.startsWith(slug)) ? 1 : 2;
  return suosituimmat(osumat, osumat.length)
    .sort((a, b) => sija(a) - sija(b))
    .slice(0, maara);
}

export type Tarkistus =
  | { ok: true; nimi: string; slug: string; muutettu: boolean }
  | { ok: false; syy: "tyhja" | "virheellinen" | "pitka" | "kaytossa" | "taynna"; nimi: string };

/**
 * Tarkistaa lisättävän tunnisteen. Jos sama tunniste (sama osoite) on jo
 * käytössä muissa uutisissa, palautetaan sen vakiintunut kirjoitusasu:
 * "huuhkajat" → "Huuhkajat". Näin samasta aiheesta ei synny muunnelmia.
 */
export function tarkistaLisattava(
  syote: string,
  kaikki: ReadonlyMap<string, Tunniste>,
  nykyiset: readonly string[],
): Tarkistus {
  const siisti = siistiTunniste(syote);
  if (!siisti) return { ok: false, syy: "tyhja", nimi: siisti };
  const slug = tunnisteSlug(siisti);
  if (!slug) return { ok: false, syy: "virheellinen", nimi: siisti };
  const olemassa = nykyiset.find((n) => tunnisteSlug(n) === slug);
  if (olemassa !== undefined) return { ok: false, syy: "kaytossa", nimi: siistiTunniste(olemassa) };
  if (nykyiset.length >= TUNNISTEITA_MAX) return { ok: false, syy: "taynna", nimi: siisti };
  const vakiintunut = kaikki.get(slug)?.nimi;
  const nimi = vakiintunut ?? siisti;
  if (nimi.length > TUNNISTE_MAX_PITUUS) return { ok: false, syy: "pitka", nimi };
  return { ok: true, nimi, slug, muutettu: nimi !== siisti };
}

/** Hylätyn tunnisteen syy suomeksi. */
export function hylkayksenSyy(tarkistus: Extract<Tarkistus, { ok: false }>): string {
  switch (tarkistus.syy) {
    case "tyhja":
      return "Kirjoita ensin tunniste.";
    case "virheellinen":
      return `Tunnisteessa “${tarkistus.nimi}” pitää olla kirjaimia tai numeroita.`;
    case "pitka":
      return `Tunniste on liian pitkä (enintään ${TUNNISTE_MAX_PITUUS} merkkiä).`;
    case "kaytossa":
      return `“${tarkistus.nimi}” on jo tämän uutisen tunnisteena.`;
    case "taynna":
      return `Uutisessa voi olla enintään ${TUNNISTEITA_MAX} tunnistetta.`;
  }
}
