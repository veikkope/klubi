/**
 * Studion linkkikenttien yhteinen tarkistus (sanity/schemas: valikko,
 * etusivun napit, tekstin linkit, klubitoiminnan linkit).
 *
 * Tyypillinen virhe on kirjoittaa osoite muodossa "www.palloliitto.fi" tai
 * "uutiset" ilman kauttaviivaa. Sanityn `uri({ allowRelative: true })`
 * hyväksyy molemmat suhteellisena polkuna, ja Next Link ratkaisee ne nykyisen
 * sivun alle, jolloin kävijä päätyy 404-sivulle. Siksi linkin pitää alkaa
 * jollakin sallituista alkuosista.
 *
 * Linkkiobjekti (docs/24 askel 4, §2.2): jokainen linkki valitaan kolmesta
 * vaihtoehdosta (Sivuston sivu, Muu osoite, Tiedosto). Sivuston sivu on
 * viittaus, joten linkki seuraa kohteen osoitteen muutosta. Kävijän osoite
 * lasketaan koodissa `linkinOsoite`-funktiolla (reittisäännöt lib/path.ts).
 *
 * Puhdas moduuli: vain suhteelliset tuonnit (Studio, sivusto, tsx-skriptit).
 */

import { tiedostonOsoite, type LiitteenTiedosto } from "./liite";
import { documentHref } from "./path";
import { ilmanStegaa } from "./stega";

export type LinkkiSkeema = "http" | "https" | "mailto" | "tel";

const KAIKKI: readonly LinkkiSkeema[] = ["http", "https", "mailto", "tel"];

/**
 * Palauttaa `true`, jos linkki kelpaa, muuten suomenkielisen ohjeen siitä,
 * miten linkki korjataan. Tyhjä arvo kelpaa: pakollisuus on kentän oma sääntö.
 */
export function tarkistaLinkki(
  href: string | null | undefined,
  skeemat: readonly LinkkiSkeema[] = KAIKKI,
): true | string {
  if (!href) return true;
  const arvo = href.trim();
  if (arvo !== href) return "Poista välilyönnit linkin alusta ja lopusta.";
  if (/\s/.test(arvo)) return "Linkissä ei saa olla välilyöntejä.";
  if (arvo.startsWith("//")) return 'Aloita joko yhdellä "/" (sivuston oma sivu) tai "https://".';
  if (arvo.startsWith("/")) return true;

  const skeema = /^([a-z][a-z0-9+.-]*):/i.exec(arvo)?.[1].toLowerCase();
  if (skeema && (skeemat as readonly string[]).includes(skeema)) {
    // "https:palloliitto.fi" tai "https:/palloliitto.fi" ei ole kelvollinen osoite.
    if ((skeema === "http" || skeema === "https") && !/^https?:\/\/[^/]/i.test(arvo)) {
      return 'Tarkista osoitteen alku: sen pitää olla "https://", esim. https://www.palloliitto.fi.';
    }
    return true;
  }

  if (/^www\./i.test(arvo)) return `Lisää alkuun "https://", esim. https://${arvo}`;
  return ohje(skeemat);
}

function ohje(skeemat: readonly LinkkiSkeema[]): string {
  const muut = [
    skeemat.includes("mailto") && 'sähköposti "mailto:"',
    skeemat.includes("tel") && 'puhelinnumero "tel:"',
  ].filter(Boolean);
  return (
    'Sivuston oma sivu alkaa "/" (esim. /uutiset), ulkoinen osoite "https://"' +
    (muut.length ? `, ${muut.join(" ja ")}` : "") +
    "."
  );
}

/**
 * Sivuston oman linkin polku kohteen tarkistusta varten (Studion varoitus
 * "Sivustolla ei ole sivua…", sanity/lib/linkin-kohde.ts): ilman ankkuria ja
 * kyselyä. Muut kuin sisäiset linkit (https:, mailto:, //) → null.
 */
export function sisainenPolku(href: string | null | undefined): string | null {
  if (!href || !href.startsWith("/") || href.startsWith("//") || /\s/.test(href)) return null;
  const polku = href.split(/[?#]/)[0];
  return polku.length > 1 ? polku.replace(/\/+$/, "") : "/";
}

/* -------------------------------------------------------------------------- */
/* Linkkiobjekti                                                              */
/* -------------------------------------------------------------------------- */

/** Tyypit, joihin "Sivuston sivu" voi osoittaa. Jokaisella on oma reitti (lib/path.ts). */
export const LINKIN_KOHDETYYPIT = [
  "sivu",
  "uutinen",
  "tapahtuma",
  "ravintola",
  "klubiToiminta",
  "arvokisa",
  "galleriaAlbumi",
  "stadion",
  "pelaaja",
] as const;

export type LinkinTyyppi = "sivu" | "osoite" | "tiedosto";

const LINKIN_TYYPIT: readonly string[] = ["sivu", "osoite", "tiedosto"];

/** Kohteen projektio (`sanity/lib/queries/linkki.ts`, `kohdeProjektio`). */
export type LinkinKohde = {
  _id: string;
  _type: string;
  slug?: string | null;
  nimi?: string | null;
  /** Ajastettu uutinen tai ravintola, joka odottaa toista arvioijaa: ei näy sivustolla. */
  piilossa?: boolean | null;
};

export type LinkinTiedosto = LiitteenTiedosto;

/** GROQ-fragmentin `linkkiProjektio` tuottama muoto. Vanha data: pelkkä `href`. */
export type LinkkiData = {
  tyyppi?: string | null;
  href?: string | null;
  kohde?: LinkinKohde | null;
  tiedosto?: LinkinTiedosto | null;
};

/**
 * Linkin tyyppi. Vanha data ilman tyyppiä (valikko, pikalinkit, tekstin
 * linkit ennen askelta 5) on "Muu osoite", jos osoite on kirjoitettu.
 */
export function linkinTyyppi(
  l: { tyyppi?: string | null; href?: string | null } | null | undefined,
): LinkinTyyppi | null {
  const tyyppi = ilmanStegaa(l?.tyyppi);
  if (tyyppi && LINKIN_TYYPIT.includes(tyyppi)) return tyyppi as LinkinTyyppi;
  return l?.href ? "osoite" : null;
}

/**
 * Kävijän linkki tai null: kohde puuttuu tai on piilossa, osoite on
 * virheellinen tai tiedosto puuttuu. Null-linkkiä ei näytetä linkkinä.
 */
export function linkinOsoite(l: LinkkiData | null | undefined): string | null {
  switch (linkinTyyppi(l)) {
    case "sivu": {
      const kohde = l?.kohde;
      if (!kohde || kohde.piilossa) return null;
      return documentHref({ _id: kohde._id, _type: kohde._type, slug: kohde.slug });
    }
    case "osoite": {
      const href = l?.href;
      return href && tarkistaLinkki(href) === true ? href : null;
    }
    case "tiedosto":
      return tiedostonOsoite(l?.tiedosto);
    default:
      return null;
  }
}

/** Listat (pikalinkit, alavalikot): osoite ratkaistaan, ja kohdat ilman linkkiä jäävät pois. */
export function ratkaiseLinkit<T extends LinkkiData>(
  lista: readonly T[] | null | undefined,
): (Omit<T, "href"> & { href: string })[] {
  const tulos: (Omit<T, "href"> & { href: string })[] = [];
  for (const kohta of lista ?? []) {
    const href = linkinOsoite(kohta);
    if (href) tulos.push({ ...kohta, href });
  }
  return tulos;
}

/** Onko Studion linkkiobjekti täytetty valitun tyypin mukaan (raaka data, ei projektio). */
export function onLinkkiTaytetty(
  arvo:
    | {
        tyyppi?: string | null;
        href?: string | null;
        kohde?: { _ref?: string } | null;
        tiedosto?: { asset?: { _ref?: string } | null } | null;
      }
    | null
    | undefined,
): boolean {
  switch (linkinTyyppi(arvo)) {
    case "sivu":
      return Boolean(arvo?.kohde?._ref);
    case "osoite":
      return Boolean(arvo?.href);
    case "tiedosto":
      return Boolean(arvo?.tiedosto?.asset?._ref);
    default:
      return false;
  }
}

/** Studiossa valittu tyyppi tai null, jos "Mihin linkki vie?" on valitsematta (vanha linkki). */
export function valittuTyyppi(l: { tyyppi?: string | null } | null | undefined): LinkinTyyppi | null {
  const tyyppi = ilmanStegaa(l?.tyyppi);
  return tyyppi && LINKIN_TYYPIT.includes(tyyppi) ? (tyyppi as LinkinTyyppi) : null;
}

/**
 * Onko Osoite-kenttä Studiossa käytössä: Muu osoite on valittu, tai tyyppiä ei
 * ole valittu lainkaan (vanha linkki). Kenttä ei saa piiloutua kesken
 * kirjoituksen, kun vanhan linkin osoite tyhjennetään.
 */
export function osoiteKaytossa(l: { tyyppi?: string | null } | null | undefined): boolean {
  const tyyppi = valittuTyyppi(l);
  return tyyppi === null || tyyppi === "osoite";
}

export const SIVUSTON_TIEDOSTO_VIRHE = "Tämä on sivuston oma tiedosto. Valitse linkin tyypiksi Tiedosto, niin se ei katoa.";

/**
 * Onko osoite Sanityn tiedosto- tai kuva-CDN:ssä (`cdn.sanity.io/files/…` tai
 * `/images/…`), oletuksena minkä tahansa projektin, `projectId`:llä vain
 * tämän projektin. Pelkkä osoite ei ole viittaus: yöllinen huolto ei näe
 * tiedostoa käytetyksi ja poistaa sen (lib/tiedostosiivous.ts), jolloin linkki
 * vie 404-sivulle.
 */
export function onSivustonTiedostoOsoite(href: string | null | undefined, projectId?: string): boolean {
  if (!href) return false;
  const m = /^(?:https?:)?\/\/cdn\.sanity\.io\/(?:files|images)\/([^/?#]+)\//i.exec(href.trim());
  if (!m) return false;
  return !projectId || m[1].toLowerCase() === projectId.toLowerCase();
}

/**
 * Osoite-kentän virhe: tyhjä pakollinen linkki, virheellinen osoite tai
 * sivuston oma tiedosto osoitteena (pitää valita tyypiksi Tiedosto). Vain
 * Studion tarkistus: kävijän sivun `linkinOsoite` ei muutu.
 */
export function tarkistaOsoite(
  href: string | null | undefined,
  l: { tyyppi?: string | null } | null | undefined,
  pakollinen: boolean,
  projectId?: string,
): true | string {
  if (!osoiteKaytossa(l)) return true;
  if (!href) {
    if (!pakollinen) return true;
    return valittuTyyppi(l)
      ? "Kirjoita osoite, esim. https://www.palloliitto.fi."
      : "Valitse yltä, mihin linkki vie, tai kirjoita osoite.";
  }
  if (onSivustonTiedostoOsoite(href, projectId)) return SIVUSTON_TIEDOSTO_VIRHE;
  return tarkistaLinkki(href);
}

/** Tyyppi on valittu, mutta sen kohde (sivu, osoite tai tiedosto) puuttuu. */
export function onKeskenerainenLinkki(arvo: Parameters<typeof onLinkkiTaytetty>[0]): boolean {
  return valittuTyyppi(arvo) !== null && !onLinkkiTaytetty(arvo);
}

/**
 * Isännän varoitus "teksti on, mutta linkki ei vie mihinkään": uusi linkki on
 * keskeneräinen, tai sitä ei ole eikä vanhaa osoitetta (kaksoisluku) ole.
 */
export function puuttuukoLinkinKohde(
  teksti: string | null | undefined,
  linkki: Parameters<typeof onLinkkiTaytetty>[0],
  vanhaOsoite: string | null | undefined,
): boolean {
  if (!teksti) return false;
  if (onKeskenerainenLinkki(linkki)) return true;
  return !onLinkkiTaytetty(linkki) && !vanhaOsoite;
}

/**
 * Kaksoisluku (docs/24 §0.3): uuden linkkiobjektin osoite, ja jos se ei
 * ratkea (valinta kesken tai tekemättä), vanha merkkijono (`ctaHref`, `url`).
 */
export function linkinOsoiteTaiVanha(
  uusi: LinkkiData | null | undefined,
  vanha: string | null | undefined,
): string | null {
  return linkinOsoite(uusi) ?? linkinOsoite({ href: vanha });
}

export const VALITSE_LINKKI = "Valitse, mihin linkki vie";

/** Studion esikatselun alaotsikko: "→ /klubi", "→ https://…", "Tiedosto: saannot.pdf". */
export function linkinKuvaus(raaka: {
  tyyppi?: string | null;
  href?: string | null;
  kohdeTyyppi?: string | null;
  kohdeSlug?: string | null;
  kohdeNimi?: string | null;
  tiedostonNimi?: string | null;
}): string {
  switch (linkinTyyppi(raaka)) {
    case "sivu": {
      if (!raaka.kohdeTyyppi) return VALITSE_LINKKI;
      const polku = documentHref({ _id: "", _type: raaka.kohdeTyyppi, slug: raaka.kohdeSlug });
      return polku ? `→ ${polku}` : raaka.kohdeNimi ? `→ ${raaka.kohdeNimi}` : VALITSE_LINKKI;
    }
    case "osoite":
      return raaka.href ? `→ ${raaka.href}` : VALITSE_LINKKI;
    case "tiedosto":
      return raaka.tiedostonNimi ? `Tiedosto: ${raaka.tiedostonNimi}` : VALITSE_LINKKI;
    default:
      return VALITSE_LINKKI;
  }
}

/** Kohteen tila Studiota varten (`sanity/lib/linkin-kohde.ts` hakee, tämä päättää). */
export type KohteenTila = {
  /** Julkaistu versio, tai null, jos kohdetta ei ole julkaistu. */
  julkaistu: { _type: string; publishedAt?: string | null; nimi?: string | null } | null;
  /** Onko kohteesta luonnos. */
  luonnos: boolean;
  /** Luonnoksen nimi (julkaisematon kohde). */
  nimi?: string | null;
};

export type KohteenTilaViesti = { taso: "virhe" | "varoitus"; viesti: string };

/** "24.12.2026 klo 8.05" Suomen aikaan. */
function paivaJaKello(iso: string): string {
  const helsinki = new Intl.DateTimeFormat("fi-FI", {
    timeZone: "Europe/Helsinki",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const osat = Object.fromEntries(helsinki.formatToParts(new Date(iso)).map((o) => [o.type, o.value]));
  return `${osat.day}.${osat.month}.${osat.year} klo ${Number(osat.hour)}.${osat.minute}`;
}

/**
 * Valitun sivun tila: julkaistu → null; vain luonnos → varoitus; ei kumpaakaan
 * → virhe; ajastettu uutinen → varoitus päivämäärällä.
 */
export function kohteenTilaViesti(tila: KohteenTila, nyt: Date): KohteenTilaViesti | null {
  const { julkaistu } = tila;
  if (julkaistu) {
    const aika = julkaistu.publishedAt ? Date.parse(julkaistu.publishedAt) : NaN;
    if (julkaistu._type === "uutinen" && Number.isFinite(aika) && aika > nyt.getTime()) {
      return {
        taso: "varoitus",
        viesti: `Uutinen tulee näkyviin ${paivaJaKello(julkaistu.publishedAt!)}. Linkki näkyy sivustolla siitä alkaen.`,
      };
    }
    return null;
  }
  if (tila.luonnos) {
    const nimi = tila.nimi?.trim() || "Valittu sivu";
    return {
      taso: "varoitus",
      viesti: `“${nimi}” ei ole vielä julkaistu. Linkki näkyy sivustolla vasta, kun julkaiset sen.`,
    };
  }
  return { taso: "virhe", viesti: "Valittua sivua ei enää ole. Valitse toinen sivu." };
}
