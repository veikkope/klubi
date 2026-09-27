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

// ── Alkuperäisen alt-tekstin laadunvarmistus (korjauskierros 1) ───────────────
//
// Vanhan sivuston alt-attribuutit ovat osin kelvottomia: tiedostonimiä
// ("./ruokailuLPREsmira260731_1788592075106"), yhteen kirjoitettuja
// ("PlazaMayorMadrid") tai lähteessä jo rikki ("McDonald究 Tammisto").
// Alla olevat funktiot tunnistavat nämä. Kutsuja päättää varasta: ravintola-
// kuvilla se on ravintolan nimi ja kaupunki (`import-kuvat.ts`).

/** Näyttääkö alt tiedostonimeltä tai polulta? */
export function looksLikeFilename(alt: string): boolean {
  const t = alt.trim();
  if (/^\.{0,2}\//.test(t)) return true; // ./kuva, /kuva
  if (/\.(jpe?g|png|gif|bmp|jfif|webp)$/i.test(t)) return true;
  if (/_\d{6,}/.test(t)) return true; // kameran/puhelimen juokseva numero
  if (/^(img|dsc|dscn|p)_?\d+/i.test(t)) return true;
  // Yksi sana ilman välilyöntejä, jossa on pitkä numerosarja: "ruokailuX260731"
  if (!/\s/.test(t) && /\d{6,}/.test(t) && /^[a-z]/.test(t)) return true;
  return false;
}

/**
 * Sisältääkö alt merkkejä, jotka eivät voi kuulua suomen- tai
 * länsieurooppalaiseen tekstiin (CJK, korvausmerkki, C1-ohjausmerkit)?
 * Tällainen alt on lähteessä rikki eikä sitä voi korjata arvaamatta.
 */
export function hasCorruptChars(alt: string): boolean {
  return /[\u0080-\u009f\ufffd\u2e80-\u9fff\uac00-\ud7af]/.test(alt) || /Ã.|â€/.test(alt);
}

/** Onko alt yhteen kirjoitettu ("PlazaMayorMadrid", "KuPSInterTulostaulu22072012")? */
export function isJammedCamelCase(alt: string): boolean {
  return alt
    .trim()
    .split(/\s+/)
    .some((w) => w.length >= 8 && (w.match(/[a-zåäö][A-ZÅÄÖ]/g)?.length ?? 0) >= 2 - (/\d{6,}$/.test(w) ? 1 : 0) && /[a-zåäö]{2}[A-ZÅÄÖ]/.test(w));
}

/** "22072012" → "22.07.2012", "120725" (yymmdd) → "25.07.2012"; muuten null. */
function formatTrailingDate(digits: string): string | null {
  const valid = (d: number, m: number, y: number) => d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1990 && y <= 2030;
  if (digits.length === 8) {
    const [d, m, y] = [Number(digits.slice(0, 2)), Number(digits.slice(2, 4)), Number(digits.slice(4))];
    return valid(d, m, y) ? `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${y}` : null;
  }
  if (digits.length === 6) {
    const [y, m, d] = [2000 + Number(digits.slice(0, 2)), Number(digits.slice(2, 4)), Number(digits.slice(4))];
    return valid(d, m, y) ? `${digits.slice(4)}.${digits.slice(2, 4)}.${y}` : null;
  }
  return null;
}

/**
 * Erottaa yhteen kirjoitetut sanat: "MuikkubaariSeurahuoneSavonlinna" →
 * "Muikkubaari Seurahuone Savonlinna", "McDonald'sStockholmKungensKurva" →
 * "McDonald's Stockholm Kungens Kurva", "SantaFeKarisma120725" →
 * "Santa Fe Karisma, 25.07.2012". Lyhyitä etuliitteitä (Mc, Ku) ei erotella,
 * jotta "McDonald" ja "KuPS" säilyvät.
 */
export function splitCamelCase(alt: string): string {
  return alt
    .trim()
    .split(/\s+/)
    .map((word) => {
      const dateMatch = /^(.*?)(\d{6}|\d{8})$/.exec(word);
      const core = dateMatch && /[A-Za-zÅÄÖåäö]/.test(dateMatch[1]) ? dateMatch[1] : word;
      const date = dateMatch && core !== word ? formatTrailingDate(dateMatch[2]) : null;
      const split = core
        // pieni → Iso + pieni: "FeKarisma" → "Fe Karisma"; ei "Mc|Donald", ei "Ku|PS" (akronyymi)
        .replace(/([a-zåäö]|[a-zåäö]'s)(?=[A-ZÅÄÖ][a-zåäö])/g, (m, _l, offset: number, s: string) =>
          /(^|[^A-Za-z])(Mc|Mac)$/.test(s.slice(0, offset + m.length)) ? m : `${m} `,
        )
        .replace(/([A-ZÅÄÖ]{2,})([A-ZÅÄÖ][a-zåäö]{2,})/g, "$1 $2")
        // loppuakronyymi: "TassosLPR" → "Tassos LPR" (mutta "KuPS" säilyy)
        .replace(/([a-zåäö]{2,})([A-ZÅÄÖ]{2,})(?![a-zåäö])/g, "$1 $2");
      if (date) return `${split}, ${date}`;
      return core === word ? split : `${split} ${dateMatch![2]}`;
    })
    .join(" ")
    .replace(/\s+,/g, ",")
    .trim();
}

export type AltVerdict =
  | { ok: true; alt: string; changed: boolean }
  | { ok: false; reason: "tyhjä" | "tiedostonimi" | "rikkinäinen merkistö" | "liian lyhyt" };

/**
 * Arvioi lähteen alt-tekstin. Palauttaa käyttökelpoisen (tarvittaessa
 * sanoiksi erotellun) tekstin tai syyn, miksi se hylätään.
 */
export function reviewSourceAlt(
  raw: string | undefined | null,
  /**
   * Kontekstin sanat (esim. ravintolan nimi ja kaupunki). Yhden kirjainkoon
   * vaihdoksen sana ("HesburgerVaasa", "TocorocoMadrid") erotellaan vain, jos
   * toinen puoli on kontekstin sana — muuten "HofBräuhaus" ja "NiliPoro"
   * (oikeita nimiä) hajoaisivat.
   */
  context: string[] = [],
): AltVerdict {
  let alt = (raw ?? "").replace(/\s+/g, " ").trim();
  if (!alt) return { ok: false, reason: "tyhjä" };
  if (hasCorruptChars(alt)) return { ok: false, reason: "rikkinäinen merkistö" };
  if (looksLikeFilename(alt)) return { ok: false, reason: "tiedostonimi" };
  if (alt.replace(/[^\p{L}]/gu, "").length < 3) return { ok: false, reason: "liian lyhyt" };

  const original = alt;
  // Päiväys sanan alussa: "120805FransmanniKouvola" → "FransmanniKouvola, 05.08.2012"
  alt = alt.replace(/^(\d{6})(?=[A-ZÅÄÖ])(\S+)/, (all, digits: string, rest: string) => {
    const date = formatTrailingDate(digits);
    return date ? `${rest}, ${date}` : all;
  });
  if (isJammedCamelCase(alt)) alt = splitCamelCase(alt);

  const known = new Set(
    context
      .flatMap((c) => c.split(/[\s,/&()'’-]+/))
      .map((w) => w.toLowerCase())
      .filter((w) => w.length >= 3),
  );
  if (known.size > 0) {
    alt = alt
      .split(" ")
      .map((word) => {
        const m = /^([A-ZÅÄÖa-zåäö][a-zåäö]{2,})([A-ZÅÄÖ][a-zåäö]{2,})([,.]?)$/.exec(word);
        if (!m) return word;
        const [, left, right, punct] = m;
        return known.has(left.toLowerCase()) || known.has(right.toLowerCase())
          ? `${left.charAt(0).toUpperCase()}${left.slice(1)} ${right}${punct}`
          : word;
      })
      .join(" ");
  }
  return { ok: true, alt, changed: alt !== original };
}
