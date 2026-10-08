/**
 * Linkkien migraatio (docs/24 askel 5): vanhat merkkijonolinkit
 * linkkiobjekteiksi. Puhtaat säännöt; `scripts/patch-linkit.ts` hakee datan
 * ja kirjoittaa, `scripts/test-linkit-migraatio.ts` testaa.
 *
 * Säännöt:
 *  - Sivuston oma polku, joka ratkeaa yksiselitteisesti yhteen julkaistuun
 *    ja sivustolla näkyvään dokumenttiin (`polunKohteet` + `documentHref`
 *    täsmälleen sama kuin vanha osoite) → `{ tyyppi: "sivu", kohde }`.
 *  - Kaikki muut vanhat linkit (ulkoiset, ankkurit, kyselyt, polut ilman
 *    dokumenttia) → `tyyppi: "osoite"`, jotta Studion radiopainike on
 *    valittuna. Osoite säilyy; klubin toiminnan `url` ja etusivun `ctaHref`
 *    kopioidaan linkkiobjektin `href`-kenttään.
 *  - Vanhat `href`-, `url`- ja `ctaHref`-arvot jäävät paikalleen (Vercelin
 *    Instant Rollback). `poistaVanhat` poistaa ne vasta erikseen (P11).
 *  - Jo muunnettu (Sivuston sivu tai Tiedosto) ei muutu. Muu osoite muuttuu
 *    viittaukseksi, jos sen polulle on sittemmin tullut dokumentti (ajo P3:n
 *    jälkeen uudelleen). Ajo kahdesti ei muuta mitään.
 *
 * Kävijän osoite (`linkinOsoite`, lib/linkki.ts) on muunnoksen jälkeen sama
 * kuin ennen: skripti simuloi muutokset ja vertaa ennen kirjoitusta.
 *
 * Vain suhteelliset tuonnit (tsx).
 */
import {
  linkinOsoite,
  linkinOsoiteTaiVanha,
  type LinkinKohde,
  type LinkinTiedosto,
  type LinkkiData,
} from "../../lib/linkki";
import { documentHref, polunKohteet } from "../../lib/path";

/* -------------------------------------------------------------------------- */
/* Hakemisto: polku → julkaistu dokumentti                                    */
/* -------------------------------------------------------------------------- */

/** Kohdeprojektion rivi (`kohdeProjektio`, sanity/lib/queries/linkki.ts). */
export type HakemistonKohde = {
  _id: string;
  _type: string;
  slug?: string | null;
  nimi?: string | null;
  piilossa?: boolean | null;
};

export type Hakemisto = {
  /** Avain `${_type}:${slug}`. */
  kohteet: Map<string, HakemistonKohde>;
  /** Avaimet, joilla on useampi julkaistu dokumentti: ei muunneta. */
  monitulkintaiset: Set<string>;
};

const avain = (tyyppi: string, slug: string) => `${tyyppi}:${slug}`;

/**
 * Hakemisto julkaistuista dokumenteista. Pois jäävät luonnokset, versiot,
 * dokumentit ilman osoitetta ja sivustolla piilossa olevat (ajastettu uutinen,
 * ravintola ilman toista arvioijaa): niihin osoittava vanha linkki näkyy nyt
 * linkkinä, viittaus taas piilottaisi sen.
 */
export function rakennaHakemisto(rivit: readonly HakemistonKohde[]): Hakemisto {
  const kohteet = new Map<string, HakemistonKohde>();
  const monitulkintaiset = new Set<string>();
  for (const r of rivit) {
    if (!r?._id || !r.slug || r._id.includes(".") || r.piilossa) continue;
    const k = avain(r._type, r.slug);
    if (kohteet.has(k) || monitulkintaiset.has(k)) {
      kohteet.delete(k);
      monitulkintaiset.add(k);
      continue;
    }
    kohteet.set(k, r);
  }
  return { kohteet, monitulkintaiset };
}

/**
 * Polun ainoa dokumentti tai null. Ehdokkaat `polunKohteet`-funktiolla
 * (lib/path.ts), ja dokumentin osoitteen pitää olla merkki merkiltä sama:
 * "/klubi/" tai "/klubi?x" jää osoitteeksi.
 */
export function ratkaisePolku(href: string | null | undefined, hakemisto: Hakemisto): HakemistonKohde | null {
  if (!href) return null;
  const ehdokkaat = polunKohteet(href);
  if (ehdokkaat.some((e) => hakemisto.monitulkintaiset.has(avain(e.tyyppi, e.slug)))) return null;
  const osumat = ehdokkaat
    .map((e) => hakemisto.kohteet.get(avain(e.tyyppi, e.slug)))
    .filter((k): k is HakemistonKohde => Boolean(k))
    .filter((k) => documentHref({ _id: k._id, _type: k._type, slug: k.slug }) === href);
  return osumat.length === 1 ? osumat[0] : null;
}

/** Miksi osoite ei muuttunut viittaukseksi (tulosteeseen). */
export function miksiOsoite(href: string | null | undefined, hakemisto: Hakemisto): string {
  if (!href) return "ei osoitetta";
  if (!href.startsWith("/") || href.startsWith("//")) return "ulkoinen";
  if (/[?#]/.test(href)) return "ankkuri tai kysely";
  const ehdokkaat = polunKohteet(href);
  const osumia = ehdokkaat.filter((e) => hakemisto.kohteet.has(avain(e.tyyppi, e.slug))).length;
  if (osumia > 1 || ehdokkaat.some((e) => hakemisto.monitulkintaiset.has(avain(e.tyyppi, e.slug)))) {
    return "monitulkintainen";
  }
  return "ei julkaistua dokumenttia";
}

/* -------------------------------------------------------------------------- */
/* Yksittäinen linkki                                                         */
/* -------------------------------------------------------------------------- */

export type VanhaLinkki = {
  tyyppi?: string | null;
  href?: string | null;
  url?: string | null;
  /** Tekstin linkin "Avaa uuteen välilehteen": sivuston sivu avautuu aina samaan välilehteen. */
  newTab?: boolean | null;
  /** Vuoden linkki ilman omaa tekstiä näyttää osoitteen, viittaus näyttäisi kohteen nimen. */
  ilmanTekstia?: boolean;
};

/**
 * Vanha linkki → lisättävät kentät, tai null, kun mitään ei muuteta.
 *  - `url`: osoite, joka on tallessa muussa kentässä (klubin toiminnan `url`,
 *    etusivun `ctaHref`); osoitteeksi jäädessään se kopioidaan `href`-kenttään.
 */
export function muunnaLinkki(vanha: VanhaLinkki | null | undefined, hakemisto: Hakemisto): Record<string, unknown> | null {
  if (!vanha) return null;
  const tyyppi = vanha.tyyppi || null;
  if (tyyppi && tyyppi !== "osoite") return null; // sivu, tiedosto tai tuntematon: ei kosketa
  const lahde = tyyppi ? vanha.href || null : vanha.href || vanha.url || null;
  // Viittaus muuttaisi kävijän näkemää linkkiä: uusi välilehti katoaisi
  // (components/portable-text.tsx) tai tyhjän tekstin tilalle tulisi kohteen nimi
  // (klubi/toiminta/[slug]). Silloin linkki jää Muuksi osoitteeksi.
  const kohde = vanha.newTab || vanha.ilmanTekstia ? null : ratkaisePolku(lahde, hakemisto);
  if (kohde) return { tyyppi: "sivu", kohde: { _type: "reference", _ref: kohde._id } };
  if (tyyppi || !lahde) return null;
  return vanha.href ? { tyyppi: "osoite" } : { tyyppi: "osoite", href: lahde };
}

/* -------------------------------------------------------------------------- */
/* Linkkien sijainnit dokumentissa                                            */
/* -------------------------------------------------------------------------- */

type Obj = Record<string, unknown>;
const onObjekti = (v: unknown): v is Obj => Boolean(v) && typeof v === "object" && !Array.isArray(v);

/**
 * Linkin paikka dokumentissa:
 *  - `linkki`: valikon kohta, pikalinkki tai tekstin linkki (markDef); objekti on itse linkki
 *  - `lohko`: etusivun lohkon `ctaLinkki` + vanha `ctaHref`
 *  - `vuosi`: klubin toiminnan vuoden `linkki` + vanha `url`
 */
export type LinkinKohta = {
  /** Sanityn patch-polku linkkiobjektiin (lohkossa `ctaLinkki`-kenttään). */
  polku: string;
  laji: "valikko" | "pikalinkki" | "teksti" | "lohko" | "vuosi";
  /** Linkkiobjekti (lohkossa `ctaLinkki`, voi puuttua). */
  linkki: Obj | null;
  /** Kaksoisluvun vanha osoite (`ctaHref`, `url`). */
  vanha?: string | null;
  /** Lohkon polku (`ctaHref`-kentän poistoa varten). */
  lohko?: string;
};

function osa(arvo: Obj, indeksi: number): string | null {
  const k = arvo._key;
  if (typeof k === "string") return k.includes('"') ? null : `[_key=="${k}"]`;
  return `[${indeksi}]`;
}

/** Tekstikenttien linkit: jokainen `block`, jolla on `link`-markDef, missä tahansa syvyydessä. */
function tekstinKohdat(arvo: unknown, polku: string, tulos: LinkinKohta[]) {
  if (Array.isArray(arvo)) {
    arvo.forEach((x, i) => {
      if (!onObjekti(x)) return;
      const o = osa(x, i);
      if (o) tekstinKohdat(x, `${polku}${o}`, tulos);
    });
    return;
  }
  if (!onObjekti(arvo)) return;
  if (arvo._type === "block" && Array.isArray(arvo.markDefs)) {
    arvo.markDefs.forEach((m, i) => {
      if (!onObjekti(m) || m._type !== "link") return;
      const o = osa(m, i);
      if (o) tulos.push({ polku: `${polku}.markDefs${o}`, laji: "teksti", linkki: m });
    });
  }
  for (const [kentta, x] of Object.entries(arvo)) {
    if (kentta === "markDefs" || kentta.startsWith("_")) continue;
    tekstinKohdat(x, polku ? `${polku}.${kentta}` : kentta, tulos);
  }
}

/** Kaikki dokumentin linkit, joita migraatio käsittelee. */
export function linkinKohdat(doc: Obj): LinkinKohta[] {
  const tulos: LinkinKohta[] = [];
  if (doc._type === "navigaatio" && Array.isArray(doc.items)) {
    doc.items.forEach((item, i) => {
      if (!onObjekti(item)) return;
      const o = osa(item, i);
      if (!o) return;
      tulos.push({ polku: `items${o}`, laji: "valikko", linkki: item });
      if (Array.isArray(item.children)) {
        item.children.forEach((lapsi, j) => {
          const oj = onObjekti(lapsi) ? osa(lapsi, j) : null;
          if (oj) tulos.push({ polku: `items${o}.children${oj}`, laji: "valikko", linkki: lapsi as Obj });
        });
      }
    });
  }
  if (doc._type === "etusivu") {
    if (Array.isArray(doc.heroCtas)) {
      doc.heroCtas.forEach((cta, i) => {
        const o = onObjekti(cta) ? osa(cta, i) : null;
        if (o) tulos.push({ polku: `heroCtas${o}`, laji: "pikalinkki", linkki: cta as Obj });
      });
    }
    if (Array.isArray(doc.blocks)) {
      doc.blocks.forEach((lohko, i) => {
        if (!onObjekti(lohko) || !("ctaLinkki" in lohko || "ctaHref" in lohko)) return;
        const o = osa(lohko, i);
        if (!o) return;
        tulos.push({
          polku: `blocks${o}.ctaLinkki`,
          laji: "lohko",
          linkki: onObjekti(lohko.ctaLinkki) ? lohko.ctaLinkki : null,
          vanha: typeof lohko.ctaHref === "string" ? lohko.ctaHref : null,
          lohko: `blocks${o}`,
        });
      });
    }
  }
  if (doc._type === "klubiToiminta" && Array.isArray(doc.vuodet)) {
    doc.vuodet.forEach((vuosi, i) => {
      if (!onObjekti(vuosi) || !onObjekti(vuosi.linkki)) return;
      const o = osa(vuosi, i);
      if (!o) return;
      const linkki = vuosi.linkki;
      tulos.push({
        polku: `vuodet${o}.linkki`,
        laji: "vuosi",
        linkki,
        vanha: typeof linkki.url === "string" ? linkki.url : null,
      });
    });
  }
  tekstinKohdat(doc, "", tulos);
  return tulos;
}

/* -------------------------------------------------------------------------- */
/* Kävijän osoite                                                             */
/* -------------------------------------------------------------------------- */

/** Viittausten ja tiedostojen tiedot, kuten sivuston kysely ne purkaa. */
export type Ratkaisu = {
  /** `_id` → `kohdeProjektio` (julkaistu dokumentti). */
  kohteet: ReadonlyMap<string, LinkinKohde>;
  /** Assetin `_id` → `tiedostoProjektio`. */
  tiedostot: ReadonlyMap<string, LinkinTiedosto>;
};

const str = (v: unknown): string | null => (typeof v === "string" ? v : null);
const ref = (v: unknown): string | null => (onObjekti(v) ? str(v._ref) : null);

/** Raaka linkkiobjekti sivuston kyselyn muotoon (`linkkiProjektio`). */
export function projisoi(linkki: Obj | null | undefined, ratkaisu: Ratkaisu): LinkkiData | null {
  if (!linkki) return null;
  const kohdeRef = ref(linkki.kohde);
  const tiedostoRef = onObjekti(linkki.tiedosto) ? ref(linkki.tiedosto.asset) : null;
  return {
    tyyppi: str(linkki.tyyppi),
    href: str(linkki.href),
    kohde: kohdeRef ? (ratkaisu.kohteet.get(kohdeRef) ?? null) : null,
    tiedosto: tiedostoRef ? (ratkaisu.tiedostot.get(tiedostoRef) ?? null) : null,
  };
}

/** Kohdan osoite kävijälle samoilla säännöillä kuin sivusto (lib/linkki.ts). */
export function kohdanOsoite(kohta: LinkinKohta, ratkaisu: Ratkaisu): string | null {
  const data = projisoi(kohta.linkki, ratkaisu);
  if (kohta.laji === "lohko" || kohta.laji === "vuosi") return linkinOsoiteTaiVanha(data, kohta.vanha);
  return linkinOsoite(data);
}

/** Dokumentin jokaisen linkin osoite kävijälle: polku → osoite. */
export function linkkienOsoitteet(doc: Obj, ratkaisu: Ratkaisu): Map<string, string | null> {
  return new Map(linkinKohdat(doc).map((k) => [k.polku, kohdanOsoite(k, ratkaisu)]));
}

/** Kaikki viittaukset ja tiedostot, jotka osoitteiden laskemiseen tarvitaan. */
export function linkkienViittaukset(doc: Obj): { kohteet: string[]; tiedostot: string[] } {
  const kohteet = new Set<string>();
  const tiedostot = new Set<string>();
  for (const k of linkinKohdat(doc)) {
    const r = ref(k.linkki?.kohde);
    if (r) kohteet.add(r);
    const t = onObjekti(k.linkki?.tiedosto) ? ref(k.linkki.tiedosto.asset) : null;
    if (t) tiedostot.add(t);
  }
  return { kohteet: [...kohteet], tiedostot: [...tiedostot] };
}

/* -------------------------------------------------------------------------- */
/* Muutokset dokumenttiin                                                     */
/* -------------------------------------------------------------------------- */

export type Operaatio = { tyyppi: "set"; polku: string; arvo: unknown } | { tyyppi: "unset"; polku: string };

export type Muutos = {
  polku: string;
  laji: LinkinKohta["laji"];
  /** "viittaus": osoite → Sivuston sivu; "osoite": osoite kopioitu linkkiobjektiin; "tyyppi": vain `tyyppi: "osoite"`; "poisto": vanha kenttä pois. */
  tulos: "viittaus" | "osoite" | "tyyppi" | "poisto";
  vanha: string | null;
  /** Viittauksen kohde (`_id`) tai poistettu kenttä. */
  uusi: string;
  /** Viittauksen kohteen osoite (invariantti: sama kuin vanha). */
  kohteenOsoite?: string | null;
};

export type DokumentinMuutokset = { operaatiot: Operaatio[]; muutokset: Muutos[] };

const kopio = <T>(arvo: T): T => structuredClone(arvo);

function ilmanKenttaa(o: Obj, kentta: string): Obj {
  const tulos = { ...o };
  delete tulos[kentta];
  return tulos;
}

/**
 * Dokumentin muutokset. Valikko ja pikalinkit kirjoitetaan koko taulukkona
 * (`items`, `heroCtas`), muut linkkiobjektit omalla polullaan (`set`).
 *
 * `poistaVanhat` (P11) poistaa lisäksi `href`-kentän Sivuston sivulta ja
 * Tiedostolta, `url`-kentän vuoden linkistä, jolla on tyyppi, ja `ctaHref`-kentän
 * lohkosta, jolla on linkkiobjekti. Jos `ratkaisu` on annettu, poisto
 * ohitetaan, kun se muuttaisi kävijän osoitetta (keskeneräinen valinta).
 */
export function dokumentinMuutokset(
  doc: Obj,
  hakemisto: Hakemisto,
  { poistaVanhat = false, ratkaisu }: { poistaVanhat?: boolean; ratkaisu?: Ratkaisu } = {},
): DokumentinMuutokset {
  const muutokset: Muutos[] = [];
  const operaatiot: Operaatio[] = [];
  let valikkoMuuttui = false;
  let pikalinkitMuuttuivat = false;
  const uusi = kopio(doc);

  for (const kohta of linkinKohdat(doc)) {
    const alkuperainen = kohta.linkki ? kopio(kohta.linkki) : null;
    // Lohkon ja vuoden vanha osoite on omassa kentässään (`ctaHref`, `url`).
    const lahde: VanhaLinkki = {
      tyyppi: str(alkuperainen?.tyyppi),
      href: str(alkuperainen?.href),
      url: kohta.laji === "lohko" || kohta.laji === "vuosi" ? kohta.vanha : null,
      newTab: kohta.laji === "teksti" ? alkuperainen?.newTab === true : null,
      ilmanTekstia: kohta.laji === "vuosi" && !str(alkuperainen?.teksti)?.trim(),
    };
    const lisays = muunnaLinkki(lahde, hakemisto);
    let linkki: Obj | null = alkuperainen;
    let vanhaPois = false;

    if (lisays) {
      linkki = { ...(kohta.laji === "lohko" ? { _type: "linkki" } : {}), ...(alkuperainen ?? {}), ...lisays };
      const vanhaOsoite = lahde.href || lahde.url || null;
      if (lisays.tyyppi === "sivu") {
        const id = (lisays.kohde as { _ref: string })._ref;
        const k = [...hakemisto.kohteet.values()].find((x) => x._id === id);
        muutokset.push({
          polku: kohta.polku,
          laji: kohta.laji,
          tulos: "viittaus",
          vanha: vanhaOsoite,
          uusi: id,
          kohteenOsoite: k ? documentHref({ _id: k._id, _type: k._type, slug: k.slug }) : null,
        });
      } else {
        muutokset.push({
          polku: kohta.polku,
          laji: kohta.laji,
          tulos: "href" in lisays ? "osoite" : "tyyppi",
          vanha: vanhaOsoite,
          uusi: "osoite",
        });
      }
    }

    if (poistaVanhat && linkki) {
      const ennen = ratkaisu ? kohdanOsoite(kohta, ratkaisu) : undefined;
      const turvallinen = (ehdokas: LinkinKohta) => !ratkaisu || kohdanOsoite(ehdokas, ratkaisu) === ennen;
      const tyyppi = str(linkki.tyyppi);
      if ((tyyppi === "sivu" || tyyppi === "tiedosto") && "href" in linkki) {
        const ilman = ilmanKenttaa(linkki, "href");
        if (turvallinen({ ...kohta, linkki: ilman })) {
          muutokset.push({ polku: kohta.polku, laji: kohta.laji, tulos: "poisto", vanha: str(linkki.href), uusi: "href" });
          linkki = ilman;
        }
      }
      if (kohta.laji === "vuosi" && tyyppi && "url" in linkki) {
        const ilman = ilmanKenttaa(linkki, "url");
        if (turvallinen({ ...kohta, linkki: ilman, vanha: null })) {
          muutokset.push({ polku: kohta.polku, laji: kohta.laji, tulos: "poisto", vanha: str(linkki.url), uusi: "url" });
          linkki = ilman;
        }
      }
      if (kohta.laji === "lohko" && kohta.vanha != null) {
        if (turvallinen({ ...kohta, linkki, vanha: null })) {
          muutokset.push({ polku: `${kohta.lohko}.ctaHref`, laji: kohta.laji, tulos: "poisto", vanha: kohta.vanha, uusi: "ctaHref" });
          vanhaPois = true;
        }
      }
    }

    const muuttui = JSON.stringify(linkki) !== JSON.stringify(alkuperainen);
    if (muuttui) {
      if (kohta.laji === "valikko") valikkoMuuttui = true;
      else if (kohta.laji === "pikalinkki") pikalinkitMuuttuivat = true;
      else operaatiot.push({ tyyppi: "set", polku: kohta.polku, arvo: linkki });
      if (kohta.laji === "valikko" || kohta.laji === "pikalinkki") korvaa(uusi, kohta.polku, linkki);
    }
    if (vanhaPois && kohta.lohko) operaatiot.push({ tyyppi: "unset", polku: `${kohta.lohko}.ctaHref` });
  }

  if (valikkoMuuttui) operaatiot.unshift({ tyyppi: "set", polku: "items", arvo: uusi.items });
  if (pikalinkitMuuttuivat) operaatiot.unshift({ tyyppi: "set", polku: "heroCtas", arvo: uusi.heroCtas });
  return { operaatiot, muutokset };
}

/* -------------------------------------------------------------------------- */
/* Polut ja muutosten soveltaminen (simulointi ja testit)                     */
/* -------------------------------------------------------------------------- */

type Segmentti = { kentta: string } | { avain: string } | { indeksi: number };

/** `body[_key=="b1"].markDefs[_key=="m1"]` → segmentit. */
export function jasennaPolku(polku: string): Segmentti[] {
  const tulos: Segmentti[] = [];
  const re = /([A-Za-z_][A-Za-z0-9_]*)|\[_key=="([^"]*)"\]|\[(\d+)\]|(\.)/gy;
  let m: RegExpExecArray | null;
  let kohta = 0;
  while (kohta < polku.length) {
    re.lastIndex = kohta;
    m = re.exec(polku);
    if (!m) throw new Error(`Tuntematon polku: ${polku}`);
    if (m[1] !== undefined) tulos.push({ kentta: m[1] });
    else if (m[2] !== undefined) tulos.push({ avain: m[2] });
    else if (m[3] !== undefined) tulos.push({ indeksi: Number(m[3]) });
    kohta = re.lastIndex;
  }
  return tulos;
}

function askel(arvo: unknown, s: Segmentti): unknown {
  if ("kentta" in s) return onObjekti(arvo) ? arvo[s.kentta] : undefined;
  if (!Array.isArray(arvo)) return undefined;
  if ("avain" in s) return arvo.find((x) => onObjekti(x) && x._key === s.avain);
  return arvo[s.indeksi];
}

/** Arvo polussa (testit ja tuloste). */
export function arvoPolussa(doc: unknown, polku: string): unknown {
  return jasennaPolku(polku).reduce<unknown>((a, s) => askel(a, s), doc);
}

function korvaa(doc: Obj, polku: string, arvo: unknown): void {
  const osat = jasennaPolku(polku);
  const viimeinen = osat.pop()!;
  const vanhempi = osat.reduce<unknown>((a, s) => askel(a, s), doc);
  if ("kentta" in viimeinen) {
    if (!onObjekti(vanhempi)) throw new Error(`Polkua ei ole: ${polku}`);
    if (arvo === undefined) delete vanhempi[viimeinen.kentta];
    else vanhempi[viimeinen.kentta] = arvo;
    return;
  }
  if (!Array.isArray(vanhempi)) throw new Error(`Polkua ei ole: ${polku}`);
  const i = "avain" in viimeinen ? vanhempi.findIndex((x) => onObjekti(x) && x._key === viimeinen.avain) : viimeinen.indeksi;
  if (i < 0 || i >= vanhempi.length) throw new Error(`Polkua ei ole: ${polku}`);
  if (arvo === undefined) vanhempi.splice(i, 1);
  else vanhempi[i] = arvo;
}

/** Operaatiot dokumentin kopioon, kuten Sanity ne tekee (`set`, `unset`). */
export function sovellaOperaatiot<T extends Obj>(doc: T, operaatiot: readonly Operaatio[]): T {
  const tulos = kopio(doc);
  for (const op of operaatiot) korvaa(tulos, op.polku, op.tyyppi === "set" ? kopio(op.arvo) : undefined);
  return tulos;
}

/**
 * Tekstieditorin linkit (markDefs) yksinään: polku ja uusi markDef. Kaikki
 * linkit saavat tyypin; vain sisäiset dokumenttipolut viittauksen.
 */
export function tekstinLinkkienMuutokset(doc: Obj, hakemisto: Hakemisto): { polku: string; uusi: Obj }[] {
  const tekstit = new Set(linkinKohdat(doc).filter((k) => k.laji === "teksti").map((k) => k.polku));
  return dokumentinMuutokset(doc, hakemisto)
    .operaatiot.filter((op): op is Extract<Operaatio, { tyyppi: "set" }> => op.tyyppi === "set" && tekstit.has(op.polku))
    .map((op) => ({ polku: op.polku, uusi: op.arvo as Obj }));
}

/* -------------------------------------------------------------------------- */
/* Tarkistukset                                                               */
/* -------------------------------------------------------------------------- */

/** Linkit, joilla on kohde mutta ei tyyppiä (muunnoksen jälkeen pitää olla 0). */
export function linkitIlmanTyyppia(doc: Obj): string[] {
  return linkinKohdat(doc)
    .filter((k) => {
      const tyyppi = str(k.linkki?.tyyppi);
      const kohde = str(k.linkki?.href) || k.vanha || ref(k.linkki?.kohde);
      return !tyyppi && Boolean(kohde);
    })
    .map((k) => k.polku);
}

/** Kävijän osoitteet, jotka muuttuisivat: [polku, ennen, jälkeen]. */
export function muuttuneetOsoitteet(
  ennen: Obj,
  jalkeen: Obj,
  ratkaisu: Ratkaisu,
): [string, string | null, string | null][] {
  const a = linkkienOsoitteet(ennen, ratkaisu);
  const b = linkkienOsoitteet(jalkeen, ratkaisu);
  const erot: [string, string | null, string | null][] = [];
  for (const polku of new Set([...a.keys(), ...b.keys()])) {
    const x = a.get(polku) ?? null;
    const y = b.get(polku) ?? null;
    if (x !== y) erot.push([polku, x, y]);
  }
  return erot;
}
