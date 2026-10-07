/**
 * Studion linkkikenttien yhteinen tarkistus (sanity/schemas: valikko,
 * etusivun napit, tekstin linkit, klubitoiminnan linkit).
 *
 * Tyypillinen virhe on kirjoittaa osoite muodossa "www.palloliitto.fi" tai
 * "uutiset" ilman kauttaviivaa. Sanityn `uri({ allowRelative: true })`
 * hyväksyy molemmat suhteellisena polkuna, ja Next Link ratkaisee ne nykyisen
 * sivun alle, jolloin kävijä päätyy 404-sivulle. Siksi linkin pitää alkaa
 * jollakin sallituista alkuosista.
 */

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
