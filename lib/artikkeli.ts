/**
 * Artikkelin (uutisen) tekstiin perustuvat apurit: lukuaika, ingressikappale
 * ja tiivistelmän vertailu leipätekstiin. Puhtaita funktioita, testit:
 * `npm run test:artikkeli`.
 */

/** Portable Text -lohko siinä laajuudessa kuin näitä apureita varten tarvitaan. */
type Lohko = {
  _type: string;
  style?: string;
  listItem?: string;
  children?: readonly object[];
};

/** Yhden tekstilohkon teksti. Muut lohkot (kuvat) = "". */
function lohkonTeksti(lohko: Lohko): string {
  if (lohko._type !== "block" || !Array.isArray(lohko.children)) return "";
  return lohko.children
    .map((c) => ("text" in c && typeof c.text === "string" ? c.text : ""))
    .join("");
}

/** Portable Textin tavallinen teksti yhtenä rivinä. */
export function tekstiRivina(lohkot: readonly Lohko[] | null | undefined): string {
  return (lohkot ?? [])
    .map(lohkonTeksti)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Lukunopeus sanoina minuutissa. Suomen pitkät sanat hidastavat lukemista
 * englantiin verrattuna (~230 sanaa/min), joten käytetään 180:tä.
 */
const SANAA_MINUUTISSA = 180;

/** Tätä lyhyemmälle tekstille lukuaikaa ei näytetä: "1 min" ei kerro mitään. */
const LUKUAIKA_MIN_SANAT = 150;

/**
 * Arvioitu lukuaika minuutteina, tai null lyhyelle tekstille.
 * Kuvia ei lasketa: ne selataan tekstin lomassa.
 */
export function lukuaika(lohkot: readonly Lohko[] | null | undefined): number | null {
  const teksti = tekstiRivina(lohkot);
  const sanat = teksti ? teksti.split(" ").length : 0;
  if (sanat < LUKUAIKA_MIN_SANAT) return null;
  return Math.max(1, Math.round(sanat / SANAA_MINUUTISSA));
}

/** Ingressiksi sopivan ensimmäisen kappaleen pituus merkkeinä. */
const INGRESSI_MIN = 60;
const INGRESSI_MAX = 320;

/**
 * Näytetäänkö leipätekstin ensimmäinen kappale ingressinä (isompi serif)?
 *
 * Vain kun se on tavallinen kappale ja sopivan mittainen. Migroiduissa
 * uutisissa ensimmäinen kappale on joskus lyhyt rivi ("Kuvat: …") tai
 * tuhansien merkkien kokonaisuus, jotka näyttäisivät ingressinä oudoilta.
 */
export function ensimmainenKappaleIngressiksi(lohkot: readonly Lohko[] | null | undefined): boolean {
  const eka = lohkot?.[0];
  if (!eka || eka._type !== "block" || (eka.style ?? "normal") !== "normal" || eka.listItem) return false;
  const pituus = lohkonTeksti(eka).trim().length;
  return pituus >= INGRESSI_MIN && pituus <= INGRESSI_MAX;
}

/**
 * Onko tiivistelmä leipätekstin alku? Migroiduissa uutisissa tiivistelmä on
 * leipätekstin sanatarkka alku (docs/12 §2.1.6), jolloin ingressinä se
 * toistaisi saman tekstin kahdesti. Katkaistun tiivistelmän loppu-"…" ja
 * välilyöntierot eivät vaikuta vertailuun.
 */
export function tiivistelmaToistaaTekstin(
  tiivistelma: string | null | undefined,
  lohkot: readonly Lohko[] | null | undefined,
): boolean {
  if (!tiivistelma) return false;
  const alku = tiivistelma.replace(/(…|\.\.\.)\s*$/, "").replace(/\s+/g, " ").trim();
  if (alku.length < 20) return false;
  return tekstiRivina(lohkot).startsWith(alku);
}
