/**
 * Johtaa alt-tekstin tiedostonimestä.
 *
 * 397 kuvaa 1073:sta on ilman alt-attribuuttia vanhalla sivustolla, ja
 * `imageWithAlt`-skeema vaatii altin. Tiedostonimet osoittautuivat kuvaaviksi:
 *
 *   01tshekki26032005.jpg            → "Tshekki, 26.03.2005"
 *   090730RavintolaAeropoli.jpg      → "Ravintola Aeropoli, 30.07.2009"
 *   120714molkky.jpg                 → "Mölkky, 14.07.2012"
 *
 * Nimet ovat kuvaajan omia kuvauksia, joten tämä ei ole tekstin keksimistä.
 * Lopputulos on silti karkeampi kuin ihmisen kirjoittama — siksi näin
 * johdetut kuvat merkitään tarkistettaviksi, jotta isä voi parannella niitä
 * Studiossa.
 *
 * Ravintolakuville tätä EI käytetä: siellä ravintolan nimi ja kaupunki ovat
 * tarkempi lähde kuin tiedostonimi.
 */

/** Sanoja, jotka esiintyvät tiedostonimissä mutta eivät kerro sisällöstä. */
const NOISE = /^(img|dsc|dscn|kuva|photo|image|scan|p)\d*$/i;

/** Yleisiä sanoja, joiden oikea kirjoitusasu palautetaan ääkkösineen. */
const SPELLING: Record<string, string> = {
  molkky: "Mölkky",
  makkara: "Makkara",
  paatos: "Päätös",
  kesajuhla: "Kesäjuhla",
  jouluruokailu: "Jouluruokailu",
  vuosikokous: "Vuosikokous",
  talkoot: "Talkoot",
  vappu: "Vappu",
  kotiranta: "Kotiranta",
  hyppyrimaki: "Hyppyrimäki",
  venaja: "Venäjä",
  tshekki: "Tšekki",
  jalkapallo: "Jalkapallo",
  olympiastadion: "Olympiastadion",
};

/** Poimii päivämäärän tiedostonimestä ja palauttaa sen suomalaisessa muodossa. */
function extractDate(name: string): { date: string | null; rest: string } {
  // ddmmyyyy, esim. 26032005
  const long = /(\d{2})(\d{2})(\d{4})/.exec(name);
  if (long) {
    const [, dd, mm, yyyy] = long;
    if (Number(mm) >= 1 && Number(mm) <= 12 && Number(dd) >= 1 && Number(dd) <= 31) {
      return { date: `${dd}.${mm}.${yyyy}`, rest: name.replace(long[0], " ") };
    }
  }

  // yymmdd alussa, esim. 090730
  const short = /^(\d{2})(\d{2})(\d{2})(?!\d)/.exec(name);
  if (short) {
    const [, yy, mm, dd] = short;
    if (Number(mm) >= 1 && Number(mm) <= 12 && Number(dd) >= 1 && Number(dd) <= 31) {
      const year = Number(yy) > 50 ? `19${yy}` : `20${yy}`;
      return { date: `${dd}.${mm}.${year}`, rest: name.replace(short[0], " ") };
    }
  }

  return { date: null, rest: name };
}

/** Pilkkoo camelCasen ja alaviivat sanoiksi. */
function splitWords(input: string): string[] {
  return input
    .replace(/([a-zåäö0-9])([A-ZÅÄÖ])/g, "$1 $2")
    .replace(/([A-ZÅÄÖ]+)([A-ZÅÄÖ][a-zåäö])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

/**
 * Palauttaa alt-tekstin tai `null` jos tiedostonimestä ei saa mitään
 * mielekästä. `null` on parempi kuin merkityksetön teksti: ruudunlukijalle
 * "IMG 4021" on huonompi kuin ei mitään.
 */
export function deriveAltFromFilename(file: string): string | null {
  const withoutExt = file.replace(/\.[a-z0-9]+$/i, "");
  const { date, rest } = extractDate(withoutExt);

  // Johtava juokseva numero, esim. "01tshekki…"
  const trimmed = rest.replace(/^\s*\d{1,3}(?=[a-zA-ZåäöÅÄÖ])/, " ");

  const words = splitWords(trimmed)
    .filter((w) => !NOISE.test(w))
    .filter((w) => !/^\d+$/.test(w));

  if (words.length === 0) return null;

  const spelled = words.map((w) => {
    const fixed = SPELLING[w.toLowerCase()];
    if (fixed) return fixed;
    return w;
  });

  let text = spelled.join(" ").replace(/\s+/g, " ").trim();
  if (text.replace(/[^a-zA-ZåäöÅÄÖ]/g, "").length < 4) return null;

  text = text.charAt(0).toUpperCase() + text.slice(1);
  const withDate = date ? `${text}, ${date}` : text;
  return withDate.slice(0, 200);
}
