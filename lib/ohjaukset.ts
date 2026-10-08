/**
 * Ajonaikaiset ohjaukset (docs/24 askel 8, docs/07 "Ajonaikaiset ohjaukset").
 *
 * Kaksi lähdettä, jotka ratkaistaan vain, kun osoitteessa ei ole sivua
 * (404-haara, `ohjaaTaiEiLoydy` tiedostossa sanity/lib/ohjaus.ts):
 *  1. Isän tekemät ohjaukset ja lyhytosoitteet (`ohjaus`-dokumentit, 307:
 *     kohteen voi vaihtaa milloin vain).
 *  2. Dokumenttien aiemmat osoitteet (`aiemmatPolut`, 308). Webhook
 *     (app/api/revalidate) lisää vanhan osoitteen itse, kun julkaistun
 *     dokumentin osoite muuttuu. Kohde lasketaan aina dokumentin nykyisestä
 *     reitistä, joten ketjua ei synny.
 *
 * Staattiset ohjaukset (lib/redirects.ts, next.config.ts) ajetaan ennen
 * reittejä eivätkä kuulu tähän.
 *
 * Puhdas moduuli: vain suhteelliset tuonnit (sivusto, Studio, tsx-skriptit).
 * Testit: `npm run test:ohjaukset`.
 */

import { KOODIIN_SIDOTUT_SIVUT, TILASTO_CATEGORY_DETAIL, documentHref, documentRoute, type RoutableDoc } from "./path";
import { siteUrl } from "./site";

/** Tyypit, joilla on oma sivu ja joiden vanha osoite ohjataan automaattisesti. */
export const OHJATTAVAT_TYYPIT: ReadonlySet<string> = new Set([
  "sivu",
  "uutinen",
  "tapahtuma",
  "ravintola",
  "galleriaAlbumi",
  "klubiToiminta",
  "arvokisa",
  "pelaaja",
  "stadion",
  "jalkapalloTilasto",
]);

/** Tyypit, joiden aiemmat osoitteet ovat suodattimen tunnisteita (?kategoria=, ?kaupunki=). */
export const TUNNISTE_TYYPIT: ReadonlySet<string> = new Set(["uutisKategoria", "kaupunki"]);

/** Polun ensimmäiset osat, joihin ohjausta ei voi tehdä. */
export const OHJAUKSELTA_VARATUT: ReadonlySet<string> = new Set(["studio", "api", "_next", "blogspot"]);

const OMAT_HOSTIT = new Set([new URL(siteUrl).host, new URL(siteUrl).host.replace(/^www\./, "")]);
const MAX_HYPYT = 5;
const MAX_PITUUS = 300;

/**
 * Ohjaus kartassa: `kohdeHref` on `linkinOsoite(minne)` (lib/linkki.ts).
 * `kohdeOnSivu`: kohde on valittu Sivuston sivu (tai tiedosto), eli osoite on
 * dokumentin nykyinen reitti, jossa on sivu: ketju päättyy siihen.
 */
export type OhjausRivi = { _id: string; lahde: string | null; kohdeHref: string | null; kohdeOnSivu?: boolean };
export type AiempiDokumentti = RoutableDoc & { aiemmatPolut?: string[] | null; _updatedAt?: string | null };
export type OhjausKartta = { ohjaukset: OhjausRivi[]; dokumentit: AiempiDokumentti[] };
export type Ohjaustulos = { kohde: string; pysyva: boolean };

/** Prosenttikoodauksen purku; virheellinen koodaus jää sellaisenaan. */
function purettu(polku: string): string {
  try {
    return decodeURIComponent(polku);
  } catch {
    return polku;
  }
}

/**
 * Vertailumuoto: alkuun "/", prosenttikoodaus purettu, kysely- ja
 * ankkuriosa pois, pienet kirjaimet, peräkkäiset ja lopun kauttaviivat pois.
 * Etusivu ("/") ja yli 300 merkin polku → null.
 */
export function normalisoiPolku(polku: string | null | undefined): string | null {
  if (!polku) return null;
  let p = polku.trim().split(/[?#]/)[0];
  p = purettu(p).toLowerCase();
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/{2,}/g, "/").replace(/\/+$/, "");
  if (!p || p === "/" || p.length > MAX_PITUUS) return null;
  return p;
}

/**
 * Sivuston oma osoite polkuna: "/x" (ei "//") sellaisenaan, ja
 * https://www.lahdensuomalainenklubi.com/x?y#z (myös ilman www-alkua) → "/x?y#z".
 * Muut → null (ulkoinen osoite).
 */
export function omaPolku(href: string | null | undefined): string | null {
  if (!href) return null;
  if (href.startsWith("/")) return href.startsWith("//") ? null : href;
  if (!/^https?:\/\//i.test(href)) return null;
  try {
    const url = new URL(href);
    if (!OMAT_HOSTIT.has(url.host.toLowerCase())) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

/** Uusin `_updatedAt` ensin, tasatilanteessa pienin `_id` (deterministinen valinta). */
function uusinEnsin(a: AiempiDokumentti, b: AiempiDokumentti): number {
  const ua = a._updatedAt ?? "";
  const ub = b._updatedAt ?? "";
  if (ua !== ub) return ua < ub ? 1 : -1;
  return a._id < b._id ? -1 : a._id > b._id ? 1 : 0;
}

function silmukka(vierailtu: ReadonlySet<string>, seuraava: string): null {
  console.error("[ohjaus] silmukka:", [...vierailtu, seuraava].join(" → "));
  return null;
}

/** Etusivu ("/", myös kysely- tai ankkuriosan kanssa) on kelvollinen päätepiste. */
function onEtusivu(polku: string): boolean {
  return polku.split(/[?#]/)[0].replace(/\/+$/, "") === "";
}

/**
 * Pyydetyn polun ohjaus tai null (404). Ohjaus voittaa aiemman osoitteen.
 * Isän ohjaus, jonka kohde on Muu osoite sivuston sisällä, voi jatkua
 * toiseen ohjaukseen tai aiempaan osoitteeseen (enintään viisi hyppyä), ja
 * tulos on yksi ohjaus lopulliseen kohteeseen. Dokumentin nykyinen reitti
 * (aiemman osoitteen kohde tai Sivuston sivu -kohde) päättää ketjun aina:
 * siinä on elävä sivu, vaikka sama polku olisi toisen dokumentin aiempi
 * osoite. Silmukka → null. Ulkoinen kohde ja etusivu päättävät ketjun. Jos
 * ketjussa on isän ohjaus, tulos on tilapäinen (307), muuten pysyvä (308).
 */
export function ratkaiseOhjaus(pyynto: string, kartta: OhjausKartta): Ohjaustulos | null {
  const p = normalisoiPolku(pyynto);
  if (!p) return null;

  const ohjaukset = new Map<string, OhjausRivi>();
  for (const o of [...kartta.ohjaukset].sort((a, b) => (a._id < b._id ? -1 : a._id > b._id ? 1 : 0))) {
    const lahde = normalisoiPolku(o.lahde);
    if (lahde && !ohjaukset.has(lahde)) ohjaukset.set(lahde, o);
  }
  const aiemmat = new Map<string, AiempiDokumentti[]>();
  for (const d of [...kartta.dokumentit].sort(uusinEnsin)) {
    for (const polku of new Set(d.aiemmatPolut ?? [])) {
      const avain = normalisoiPolku(polku);
      if (!avain) continue;
      const lista = aiemmat.get(avain) ?? [];
      if (!lista.includes(d)) lista.push(d);
      aiemmat.set(avain, lista);
    }
  }

  const vierailtu = new Set([p]);
  let nykyinen = p;
  let tulos: string | null = null;
  let pysyva = true;
  for (let hyppy = 0; hyppy < MAX_HYPYT; hyppy++) {
    let seuraava: string | null;
    const o = ohjaukset.get(nykyinen);
    if (o) {
      const href = o.kohdeHref;
      if (!href) break;
      // Vain sivuston polku tai http(s): esim. mailto: ei kelpaa ohjaukseksi.
      if (!href.startsWith("/") && !/^https?:\/\//i.test(href)) break;
      pysyva = false;
      const oma = omaPolku(href);
      if (oma === null) return { kohde: href, pysyva: false };
      tulos = oma;
      // Etusivu on aina päätepiste (normalisoitu muoto on null).
      if (onEtusivu(oma)) break;
      seuraava = normalisoiPolku(oma);
      // Sivuston sivu: kohde on dokumentin nykyinen reitti, jossa on sivu.
      if (o.kohdeOnSivu) {
        if (seuraava !== null && vierailtu.has(seuraava)) return silmukka(vierailtu, seuraava);
        break;
      }
    } else {
      const d = aiemmat.get(nykyinen)?.find((x) => documentHref(x) !== null);
      if (!d) break;
      // Dokumentin nykyinen reitti päättää ketjun (siinä on sivu).
      tulos = documentHref(d)!;
      seuraava = normalisoiPolku(tulos);
      if (seuraava !== null && vierailtu.has(seuraava)) return silmukka(vierailtu, seuraava);
      break;
    }
    if (seuraava === null || vierailtu.has(seuraava)) return silmukka(vierailtu, seuraava ?? "?");
    vierailtu.add(seuraava);
    nykyinen = seuraava;
  }
  return tulos ? { kohde: tulos, pysyva } : null;
}

const OSA = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Ohjauksen "Osoite sivustolla": true tai suomenkielinen virhe. */
export function tarkistaOhjauksenLahde(lahde: string | null | undefined): true | string {
  if (!lahde) return "Kirjoita osoite, esim. /jasenmaksu.";
  if (lahde.trim() !== lahde) return "Poista välilyönnit osoitteen alusta ja lopusta.";
  if (/^https?:/i.test(lahde) || lahde.includes("://") || /^www\./i.test(lahde)) {
    return "Kirjoita vain sivuston osoitteen loppuosa, esim. /jasenmaksu, ei koko osoitetta.";
  }
  if (!lahde.startsWith("/")) return "Osoite alkaa kauttaviivalla, esim. /jasenmaksu.";
  if (lahde === "/") return "Etusivua ei voi ohjata.";
  if (/[?#]/.test(lahde)) return "Osoitteessa ei voi olla ?- tai #-merkkiä.";
  if (lahde.endsWith("/")) return "Poista kauttaviiva osoitteen lopusta.";
  if (lahde !== lahde.toLowerCase()) return `Käytä pieniä kirjaimia: ${lahde.toLowerCase()}`;
  const osat = lahde.slice(1).split("/");
  for (const osa of osat) {
    if (!OSA.test(osa)) {
      return `Virheellinen kohta "${osa}". Käytä vain kirjaimia a–z, numeroita ja yksittäisiä yhdysmerkkejä (ä → a, ö → o).`;
    }
  }
  if (osat.length > 6 || lahde.length > 120) return "Osoite on liian pitkä.";
  if (OHJAUKSELTA_VARATUT.has(osat[0])) return `Osoite /${osat[0]} on sivuston oma, eikä sitä voi ohjata.`;
  if (KOODIIN_SIDOTUT_SIVUT.includes(lahde.slice(1))) return `Osoitteessa ${lahde} on jo sivu. Valitse toinen osoite.`;
  return true;
}

/* -------------------------------------------------------------------------- */
/* Aiemmat osoitteet (webhook)                                                */
/* -------------------------------------------------------------------------- */

/**
 * Uusi `aiemmatPolut`-lista tai null, jos muutosta ei tarvita (K2).
 * Tulos: nykyinen lista + vanha osoite + ennen-listan osoitteet, jotka
 * puuttuvat nykyisestä (itsekorjaus: julkaisu luonnoksesta, josta webhookin
 * lisäys puuttui), ilman uutta osoitetta (paluu aiempaan osoitteeseen) ja
 * ilman toistoja.
 */
export function yhdistaAiemmatPolut(
  nykyiset: readonly string[] | null | undefined,
  ennenLista: readonly string[] | null | undefined,
  vanha: string | null,
  uusi: string | null,
): string[] | null {
  const alku = [...(nykyiset ?? [])];
  const lista: string[] = [];
  for (const polku of [...alku, ...(vanha ? [vanha] : []), ...(ennenLista ?? [])]) {
    if (!polku || polku === uusi || lista.includes(polku)) continue;
    lista.push(polku);
  }
  const sama = lista.length === alku.length && lista.every((p, i) => p === alku[i]);
  return sama ? null : lista;
}

/**
 * Atomiset muutokset yhdelle versiolle (julkaistu tai luonnos): lisättävät
 * osoitteet, poistettavat (uusi osoite) ja toistot, jotka siivotaan
 * (poisto ja yksi lisäys). Null, kun mitään ei tarvita.
 */
export type AiempienMuutos = { lisaa: string[]; poista: string[]; toistot: string[] };

export function aiempienPolkujenMuutos(
  nykyiset: readonly string[] | null | undefined,
  ennenLista: readonly string[] | null | undefined,
  vanha: string | null,
  uusi: string | null,
): AiempienMuutos | null {
  const alku = (nykyiset ?? []).filter((p): p is string => typeof p === "string" && p !== "");
  const tavoite = yhdistaAiemmatPolut(alku, ennenLista, vanha, uusi) ?? [...new Set(alku)];
  const lisaa = tavoite.filter((p) => !alku.includes(p));
  const poista = uusi && alku.includes(uusi) ? [uusi] : [];
  const toistot = [...new Set(alku.filter((p, i) => alku.indexOf(p) !== i && p !== uusi))];
  if (lisaa.length === 0 && poista.length === 0 && toistot.length === 0) return null;
  return { lisaa, poista, toistot };
}

/** Sanityn mutaatio (Content Lake -muoto), jonka webhook lähettää transaktiona. */
export type PolkuMutaatio = {
  patch: {
    id: string;
    setIfMissing?: { aiemmatPolut: string[] };
    unset?: string[];
    insert?: { after: string; items: string[] };
  };
};

/**
 * Mutaatiot erillisinä, koska Sanity soveltaa yhden patchin operaatiot
 * kiinteässä järjestyksessä. Ei koko listan settiä: rinnakkaiset ajot eivät
 * ylikirjoita toistensa lisäyksiä.
 */
export function aiempienPolkujenMutaatiot(id: string, muutos: AiempienMuutos): PolkuMutaatio[] {
  const suodatin = (p: string) => `aiemmatPolut[@ == ${JSON.stringify(p)}]`;
  const mutaatiot: PolkuMutaatio[] = [{ patch: { id, setIfMissing: { aiemmatPolut: [] } } }];
  const poistot = [...muutos.poista, ...muutos.toistot];
  if (poistot.length > 0) mutaatiot.push({ patch: { id, unset: poistot.map(suodatin) } });
  for (const polku of [...muutos.toistot, ...muutos.lisaa]) {
    mutaatiot.push({ patch: { id, insert: { after: "aiemmatPolut[-1]", items: [polku] } } });
  }
  return mutaatiot;
}

/** Itsekorjauksen aikaikkuna: edellinen versio on enintään näin vanha. */
export const ITSEKORJAUS_IKKUNA_MS = 10 * 60_000;

/**
 * Palautetaanko ennen-listan osoitteet, jotka puuttuvat nykyisestä (K2).
 * Vanhentunut luonnos syntyy, kun luonnos avataan juuri ennen kuin webhook
 * ehtii lisätä osoitteen, joten edellinen versio on aina tuore. Ehto: osoite
 * muuttui tässä julkaisussa, tai edellistä versiota on muokattu viimeisen
 * 10 minuutin aikana. Kehittäjä voi siis poistaa virheellisen aiemman
 * osoitteen, kun dokumenttia ei ole muokattu 10 minuuttiin (docs/07).
 */
export function itsekorjausSallittu(
  ennen: EnnenTiedot | null | undefined,
  vanha: string | null,
  uusi: string | null,
  nyt: Date,
): boolean {
  if (!ennen) return false;
  if (vanha !== null && vanha !== uusi) return true;
  const aika = ennen._updatedAt ? Date.parse(ennen._updatedAt) : NaN;
  return Number.isFinite(aika) && nyt.getTime() - aika <= ITSEKORJAUS_IKKUNA_MS;
}

/**
 * Kopio (Studion Kopioi) ei saa periä kenttiä, joiden varassa vanhat
 * osoitteet ohjautuvat: muuten kopio (uudempi `_updatedAt`) veisi
 * alkuperäisen vanhat osoitteet. Askel 9 laajentaa listaa (Kopioi pohjaksi).
 */
export const KOPIOSTA_POISTETTAVAT: readonly string[] = ["aiemmatPolut", "muutLegacyUrlit"];

/** Uusi olio ilman `KOPIOSTA_POISTETTAVAT`-kenttiä; alkuperäinen ennallaan. */
export function tyhjennaKopiosta<T extends Record<string, unknown>>(doc: T): T {
  const kopio: Record<string, unknown> = { ...doc };
  for (const kentta of KOPIOSTA_POISTETTAVAT) delete kopio[kentta];
  return kopio as T;
}

/** Webhookin `before()`-projektio (docs/17 §D). */
export type EnnenTiedot = {
  /** Edellisen version muokkausaika (itsekorjauksen aikaikkuna). Puuttuu vanhasta projektiosta. */
  _updatedAt?: string | null;
  slug?: string | null;
  aiemmatPolut?: string[] | null;
  category?: string | null;
  huuhkajatOsio?: string | null;
  mestaruusmaa?: string | null;
};

/**
 * Vanha ja uusi osoite: ohjattavilla tyypeillä reitin polku ilman ankkuria,
 * tunnistetyypeillä slug. Muut tyypit → null, null.
 */
export function osoitteenMuutos(
  tyyppi: string,
  ennen: EnnenTiedot | null | undefined,
  nyt: RoutableDoc,
): { vanha: string | null; uusi: string | null } {
  if (TUNNISTE_TYYPIT.has(tyyppi)) return { vanha: ennen?.slug ?? null, uusi: nyt.slug ?? null };
  if (!OHJATTAVAT_TYYPIT.has(tyyppi)) return { vanha: null, uusi: null };
  const uusi = documentRoute({ ...nyt, _type: tyyppi })?.path ?? null;
  if (!ennen) return { vanha: null, uusi };
  const vanhaReitti = documentRoute({
    ...nyt,
    _type: tyyppi,
    slug: ennen.slug ?? null,
    category: ennen.category ?? null,
    huuhkajatOsio: ennen.huuhkajatOsio ?? null,
    mestaruusmaa: ennen.mestaruusmaa ?? null,
  });
  // Ankkurillinen reitti on osion yhteinen sivu (esim. /jalkapalloarkisto/mestarit),
  // jossa muut taulukot näkyvät yhä: sitä ei tallenneta aiemmaksi osoitteeksi.
  const vanha = vanhaReitti && !vanhaReitti.anchor ? vanhaReitti.path : null;
  return { vanha, uusi };
}

/**
 * Studion sininen tieto, kun julkaistun dokumentin osoitetta muutetaan
 * (`polkuMuuttunut`, sanity/schemas/objects/contentMeta.ts). `alasivuja`:
 * sivun alasivujen määrä (osoite alkaa `<julkaistu>/`).
 */
export function polunMuutosViesti(
  tyyppi: string,
  category: string | null | undefined,
  julkaistu: string,
  alasivuja = 0,
): { taso: "info" | "warning"; viesti: string } {
  const alku = `Julkaistu osoite on "${julkaistu}".`;
  if (tyyppi === "jalkapalloTilasto" && !(category && TILASTO_CATEGORY_DETAIL[category])) {
    return {
      taso: "info",
      viesti:
        `${alku} Taulukko näkyy samalla sivulla kuin ennenkin. Vain suora linkki tähän taulukkoon ` +
        `(#${julkaistu}) vie jatkossa sivun alkuun.`,
    };
  }
  if (OHJATTAVAT_TYYPIT.has(tyyppi)) {
    const alasivut =
      tyyppi === "sivu" && alasivuja > 0
        ? ` Alasivujen osoitteet eivät muutu. Tällä sivulla on ${alasivuja} ${alasivuja === 1 ? "alasivu" : "alasivua"}: muuta niiden osoitteet erikseen.`
        : "";
    return {
      taso: "info",
      viesti: `${alku} Kun julkaiset, vanha osoite ohjautuu automaattisesti uuteen, joten vanhat linkit toimivat edelleen.${alasivut}`,
    };
  }
  if (tyyppi === "uutisKategoria") {
    return {
      taso: "info",
      viesti: `${alku} Kun julkaiset, vanhat linkit (/uutiset?kategoria=${julkaistu}) ohjautuvat automaattisesti uuteen.`,
    };
  }
  if (tyyppi === "kaupunki") {
    return {
      taso: "info",
      viesti: `${alku} Kun julkaiset, ravintolahakemiston vanhat linkit (?kaupunki=${julkaistu}) ohjautuvat automaattisesti uuteen.`,
    };
  }
  return {
    taso: "warning",
    viesti:
      `${alku} Jos muutat sen, vanhat linkit tähän sivuun lakkaavat toimimasta. Palauta vanha osoite tai ` +
      "tee ohjaus: Sivuston asetukset → Ohjaukset ja lyhytosoitteet.",
  };
}
