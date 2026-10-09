/**
 * Uutisten tunnisteet (uutinen.tunnisteet): blogin "labels" sivustolla.
 *
 * Tunniste on vapaa merkkijono ("Huuhkajat", "Olympiastadion", "Teemu Pukki").
 * Sen osoite johdetaan nimestä yhteisellä `slugify`-funktiolla:
 * "Valko-Venäjä" → /uutiset/tunniste/valko-venaja. Saman slugin nimet ovat
 * sama tunniste ("Huuhkajat" ja "huuhkajat"), joten kirjainkoon vaihtelu ei
 * pilko tunnistesivua kahtia. Näkyvä nimi on muodoista yleisin.
 *
 * Puhdas moduuli: testataan komennolla `npm run test:tunnisteet`. Käytössä
 * sivuilla, Studion validoinnissa ja migraatioskripteissä.
 */

import { slugify } from "./slugify";

/** Yhden tunnisteen enimmäispituus (blogin pisin on 30 merkkiä). */
export const TUNNISTE_MAX_PITUUS = 50;
/** Tunnisteita yhdessä uutisessa enintään (blogissa enimmillään 18). */
export const TUNNISTEITA_MAX = 30;

export const TUNNISTEET_POLKU = "/uutiset/tunnisteet";

/**
 * Tätä harvemmin käytetyn tunnisteen sivu on hakukoneelle `noindex` eikä ole
 * sitemapissa: yhden kirjoituksen tunnistesivu on ohutta sisältöä.
 */
export const TUNNISTE_INDEKSOI_VAHINTAAN = 2;

/** Syöte siistittynä: ylimääräiset välilyönnit pois. */
export function siistiTunniste(nimi: string): string {
  return nimi.replace(/\s+/g, " ").trim();
}

/**
 * Lista tallennettavaksi: siistitty, tyhjät ja osoitteettomat pois, saman
 * tunnisteen toistot pois (ensimmäinen kirjoitusasu jää). Blogin tuonti ja
 * `scripts/kerta/2026-09-30-patch-tunnisteet.ts` käyttävät tätä.
 */
export function siistiTunnisteLista(nimet: readonly unknown[] | null | undefined): string[] {
  const nahdyt = new Set<string>();
  const tulos: string[] = [];
  for (const raaka of nimet ?? []) {
    if (typeof raaka !== "string") continue;
    const nimi = siistiTunniste(raaka);
    const slug = tunnisteSlug(nimi);
    if (!slug || nahdyt.has(slug)) continue;
    nahdyt.add(slug);
    tulos.push(nimi);
  }
  return tulos;
}

/** Tunnisteen osoitteen loppuosa. Tyhjä, jos nimessä ei ole kirjaimia tai numeroita. */
export function tunnisteSlug(nimi: string): string {
  return slugify(siistiTunniste(nimi));
}

/** Tunnistesivun polku, tai null jos nimestä ei synny osoitetta. */
export function tunnisteHref(nimi: string): string | null {
  const slug = tunnisteSlug(nimi);
  return slug ? `/uutiset/tunniste/${slug}` : null;
}

/**
 * Blogin tunnistesivun nimi %-koodatusta polusta: "/search/label/Valko-Ven%C3%A4j%C3%A4"
 * → "Valko-Venäjä". Muu polku (kirjoitus, arkisto, haku) → null. `+` on
 * polussa kirjaimellinen (Blogger koodaa välilyönnin %20:ksi).
 */
export function bloginTunniste(blogPolku: string): string | null {
  const osuma = /^\/search\/label\/([^/?#]+)\/?$/.exec(blogPolku);
  if (!osuma) return null;
  let nimi: string;
  try {
    nimi = siistiTunniste(decodeURIComponent(osuma[1]));
  } catch {
    return null; // rikkinäinen %-koodaus
  }
  return nimi && tunnisteSlug(nimi) ? nimi : null;
}

export type Tunniste = {
  slug: string;
  /** Näkyvä nimi: kirjoitusasuista yleisin. */
  nimi: string;
  /** Kaikki kirjoitusasut, joilla tunniste esiintyy, myös siistimättömät (kyselyn `$nimet`). */
  nimet: string[];
  /** Uutisten määrä. */
  maara: number;
};

const fi = new Intl.Collator("fi", { sensitivity: "base", numeric: true });

/** Aakkosjärjestys suomeksi (Å, Ä, Ö lopussa, numerot numeroina). */
export function vertaaTunnisteita(a: Pick<Tunniste, "nimi">, b: Pick<Tunniste, "nimi">): number {
  return fi.compare(a.nimi, b.nimi) || a.nimi.localeCompare(b.nimi, "fi");
}

/**
 * Kokoaa uutisten tunnistelistat tunnisteiksi. Syöte: yksi lista per uutinen
 * (kyselyn `*[…].tunnisteet` tulos). Sama tunniste samassa uutisessa kahdesti
 * lasketaan kerran. Tulos aakkosjärjestyksessä.
 */
export function kokoaTunnisteet(uutiset: (readonly string[] | null | undefined)[]): Tunniste[] {
  const kooste = new Map<string, { maara: number; muodot: Map<string, number>; raakaMuodot: Set<string> }>();
  for (const lista of uutiset) {
    const nahdyt = new Set<string>();
    for (const raaka of lista ?? []) {
      if (typeof raaka !== "string") continue;
      const nimi = siistiTunniste(raaka);
      const slug = tunnisteSlug(nimi);
      if (!slug) continue;
      const rivi = kooste.get(slug) ?? { maara: 0, muodot: new Map<string, number>(), raakaMuodot: new Set<string>() };
      rivi.raakaMuodot.add(raaka);
      if (!nahdyt.has(slug)) {
        rivi.maara += 1;
        nahdyt.add(slug);
      }
      rivi.muodot.set(nimi, (rivi.muodot.get(nimi) ?? 0) + 1);
      kooste.set(slug, rivi);
    }
  }
  return [...kooste.entries()]
    .map(([slug, { maara, muodot, raakaMuodot }]) => {
      // Yleisin muoto; tasapelissä se, joka alkaa isolla kirjaimella, sitten aakkosjärjestys.
      const nimet = [...muodot.entries()]
        .sort(
          ([a, am], [b, bm]) =>
            bm - am || Number(isoAlku(b)) - Number(isoAlku(a)) || a.localeCompare(b, "fi"),
        )
        .map(([nimi]) => nimi);
      // Kyselyyn myös tallennetut muodot sellaisenaan (esim. ylimääräinen
      // välilyönti API:n kautta), jotta sivu löytää kaikki lasketut uutiset.
      const kaikkiNimet = [...nimet, ...[...raakaMuodot].filter((raaka) => !muodot.has(raaka))];
      return { slug, nimi: nimet[0], nimet: kaikkiNimet, maara };
    })
    .sort(vertaaTunnisteita);
}

function isoAlku(nimi: string): boolean {
  const eka = nimi.charAt(0);
  return eka !== eka.toLocaleLowerCase("fi");
}

/**
 * Tunnisteet, jotka esiintyvät useimmin samoissa uutisissa kuin `slug`
 * (tunnistesivun "Liittyvät tunnisteet"). Kun tunnisteella on useita uutisia,
 * vaaditaan vähintään kaksi yhteistä, jotta yksittäisen kirjoituksen nimilista
 * ei täytä osiota.
 */
export function liittyvatTunnisteet(
  uutiset: (readonly string[] | null | undefined)[],
  slug: string,
  maara: number,
): Tunniste[] {
  const kaikki = new Map(kokoaTunnisteet(uutiset).map((t) => [t.slug, t]));
  const oma = kaikki.get(slug);
  if (!oma) return [];
  const yhteiset = new Map<string, number>();
  for (const lista of uutiset) {
    const slugit = new Set((lista ?? []).filter((n) => typeof n === "string").map(tunnisteSlug).filter(Boolean));
    if (!slugit.has(slug)) continue;
    for (const muu of slugit) if (muu !== slug) yhteiset.set(muu, (yhteiset.get(muu) ?? 0) + 1);
  }
  const vahintaan = oma.maara >= 4 ? 2 : 1;
  return [...yhteiset.entries()]
    .filter(([, n]) => n >= vahintaan)
    .map(([s, n]) => ({ tunniste: kaikki.get(s)!, n }))
    .sort((a, b) => b.n - a.n || b.tunniste.maara - a.tunniste.maara || vertaaTunnisteita(a.tunniste, b.tunniste))
    .slice(0, maara)
    .map(({ tunniste }) => tunniste);
}

/** Suosituimmat ensin (tasapelissä aakkosjärjestys). */
export function suosituimmat(tunnisteet: readonly Tunniste[], maara: number): Tunniste[] {
  return [...tunnisteet].sort((a, b) => b.maara - a.maara || vertaaTunnisteita(a, b)).slice(0, maara);
}

/**
 * Ryhmittely alkukirjaimen mukaan hakemistosivulle: A–Ö omina ryhminään,
 * numeroilla ja muilla merkeillä alkavat ryhmässä "0–9". Ryhmät aakkosjärjestyksessä.
 */
export function ryhmitaAlkukirjaimittain(tunnisteet: readonly Tunniste[]): { kirjain: string; tunnisteet: Tunniste[] }[] {
  const ryhmat = new Map<string, Tunniste[]>();
  for (const tunniste of [...tunnisteet].sort(vertaaTunnisteita)) {
    const eka = tunniste.nimi.charAt(0).toLocaleUpperCase("fi");
    const kirjain = /\p{L}/u.test(eka) ? eka.normalize("NFC") : "0–9";
    ryhmat.set(kirjain, [...(ryhmat.get(kirjain) ?? []), tunniste]);
  }
  return [...ryhmat.entries()]
    .sort(([a], [b]) => (a === "0–9" ? -1 : b === "0–9" ? 1 : fi.compare(a, b)))
    .map(([kirjain, lista]) => ({ kirjain, tunnisteet: lista }));
}

/**
 * Studion validointi (uutinen.tunnisteet). Palauttaa true tai suomenkielisen
 * virheilmoituksen. Kaksoiskappaleiksi lasketaan myös kirjainkoon ja
 * välimerkkien erot ("Huuhkajat" / "huuhkajat"), koska ne ovat sama sivu.
 */
export function tarkistaTunnisteet(arvo: unknown): true | string {
  if (arvo == null) return true;
  if (!Array.isArray(arvo)) return "Tunnisteet ovat lista.";
  if (arvo.length > TUNNISTEITA_MAX) return `Enintään ${TUNNISTEITA_MAX} tunnistetta.`;
  const nahdyt = new Map<string, string>();
  for (const raaka of arvo) {
    const nimi = typeof raaka === "string" ? siistiTunniste(raaka) : "";
    if (!nimi) return "Tyhjä tunniste: poista se.";
    if (raaka !== nimi) return `Tunnisteessa “${nimi}” on ylimääräisiä välilyöntejä: poista ja lisää se uudelleen.`;
    if (nimi.length > TUNNISTE_MAX_PITUUS) {
      return `Tunniste “${nimi.slice(0, 20)}…” on liian pitkä (enintään ${TUNNISTE_MAX_PITUUS} merkkiä).`;
    }
    const slug = tunnisteSlug(nimi);
    if (!slug) return `Tunnisteessa “${nimi}” pitää olla kirjaimia tai numeroita.`;
    const aiempi = nahdyt.get(slug);
    if (aiempi !== undefined) {
      return aiempi === nimi
        ? `Tunniste “${nimi}” on listalla kahdesti.`
        : `“${aiempi}” ja “${nimi}” ovat sama tunniste: poista toinen.`;
    }
    nahdyt.set(slug, nimi);
  }
  return true;
}
