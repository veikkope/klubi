/**
 * Arvostelun vaiheet ja keskeneräisen arvostelun luonnos (puhtaat säännöt).
 *
 * Arvostelu etenee yksi näkymä kerrallaan (review-form.tsx). Tässä ovat
 * säännöt, joita käyttöliittymä ja testit (npm run test:arvostelu) jakavat:
 * mitkä vaiheet näytetään, milloin vaihe on valmis, mihin vaiheeseen
 * palvelimen virhe vie ja miten luonnos luetaan laitteelta turvallisesti.
 */
import {
  EMPTY_REVIEW_VALUES,
  RATING_FIELDS,
  RATING_MAX,
  RATING_MIN,
  type Arvostelija,
  type ReviewField,
  type ReviewValues,
} from "./form-state";

export const VAIHEET = ["kuka", "ravintola", "arvosanat", "lisaa"] as const;
export type Vaihe = (typeof VAIHEET)[number];

export const VAIHEEN_OTSIKKO: Record<Vaihe, string> = {
  kuka: "Kuka arvostelee?",
  ravintola: "Mitä ravintolaa arvostelet?",
  arvosanat: "Arvosanat 1,0–5,0",
  lisaa: "Kerro lisää",
};

/** Missä vaiheessa kukin kenttä on (palvelimen virhe vie oikeaan vaiheeseen). */
export const KENTAN_VAIHE: Record<ReviewField, Vaihe> = {
  nimi: "kuka",
  ravintola: "ravintola",
  uusiNimi: "ravintola",
  uusiKaupunki: "ravintola",
  uusiMaa: "ravintola",
  uusiLisatieto: "ravintola",
  ruoka: "arvosanat",
  hinta: "arvosanat",
  viihtyvyys: "arvosanat",
  kayntipaiva: "lisaa",
  kommentti: "lisaa",
  kuvat: "lisaa",
};

/** Näytettävät vaiheet: nimi kysytään vain, kun sitä ei muisteta. */
export function naytettavat(kysyNimi: boolean): Vaihe[] {
  return kysyNimi ? [...VAIHEET] : VAIHEET.filter((v) => v !== "kuka");
}

export function onVaihe(arvo: string | null | undefined): arvo is Vaihe {
  return (VAIHEET as readonly string[]).includes(arvo ?? "");
}

/** "3,3" tai "3.3" → 3.3; muuten null. Sama sääntö kuin palvelimella (actions.ts). */
export function parseScore(text: string): number | null {
  const value = Number(text.trim().replace(",", "."));
  if (!text.trim() || !Number.isFinite(value) || value < RATING_MIN || value > RATING_MAX) return null;
  return Math.round(value * 10) / 10;
}

/** Tila, josta vaiheen valmius päätellään. */
export type Edistyminen = {
  arvostelija: Arvostelija | null;
  /** Hakemistosta valittu ravintola tai uuden ravintolan ehdotus. */
  ravintola: "valittu" | "uusi" | null;
  arvosanat: Record<string, number | null>;
};

/**
 * Onko vaihe valmis siirtymään eteenpäin. Uuden ravintolan kentät ja viimeinen
 * vaihe tarkistetaan lähetettäessä (palvelin validoi kaiken joka tapauksessa).
 */
export function vaiheValmis(vaihe: Vaihe, e: Edistyminen): boolean {
  switch (vaihe) {
    case "kuka":
      return (e.arvostelija?.nimi.trim().length ?? 0) >= 2;
    case "ravintola":
      return e.ravintola !== null;
    case "arvosanat":
      return RATING_FIELDS.every(({ field }) => e.arvosanat[field] != null);
    case "lisaa":
      return true;
  }
}

/**
 * Pyydetty vaihe rajattuna: eteenpäin pääsee vain valmiiden vaiheiden yli
 * (esim. osoitteella ?vaihe=lisaa tai selaimen eteenpäin-eleellä).
 */
export function sallittuVaihe(pyydetty: Vaihe, vaiheet: Vaihe[], e: Edistyminen): Vaihe {
  const kohde = Math.max(0, vaiheet.indexOf(pyydetty));
  for (let i = 0; i < kohde; i++) {
    if (!vaiheValmis(vaiheet[i], e)) return vaiheet[i];
  }
  return vaiheet[kohde] ?? vaiheet[0];
}

/** Ensimmäinen vaihe, jossa on palvelimen palauttama virhe. */
export function virheenVaihe(virheet: Partial<Record<ReviewField, string>>, vaiheet: Vaihe[]): Vaihe | null {
  const virheelliset = new Set(
    (Object.keys(virheet) as ReviewField[]).filter((k) => virheet[k]).map((k) => KENTAN_VAIHE[k]),
  );
  return vaiheet.find((v) => virheelliset.has(v)) ?? null;
}

/* ── Luonnos ──────────────────────────────────────────────────────────── */

export const LUONNOS_AVAIN = "klubi.arvostelu-luonnos";
/** Vanhempi luonnos hylätään: käynti on silloin todennäköisesti jo unohtunut. */
export const LUONNOS_IKA_MS = 14 * 24 * 60 * 60 * 1000;

/** Luonnokseen tallennettavat kentät (kuvat eivät tallennu). */
export const LUONNOKSEN_KENTAT = [
  "ravintola",
  "uusi",
  "uusiNimi",
  "uusiKaupunki",
  "uusiMaa",
  "uusiLisatieto",
  "kayntipaiva",
  "ruoka",
  "hinta",
  "viihtyvyys",
  "kommentti",
] as const satisfies readonly (keyof ReviewValues)[];

type LuonnoksenKentta = (typeof LUONNOKSEN_KENTAT)[number];

export type Luonnos = {
  versio: 1;
  tallennettu: number;
  vaihe: Vaihe;
  arvot: Partial<Record<LuonnoksenKentta, string>>;
};

/** Onko luonnoksessa mitään säilyttämisen arvoista. */
export function luonnosTyhja(arvot: Luonnos["arvot"]): boolean {
  return !(arvot.ravintola || arvot.uusi || arvot.ruoka || arvot.hinta || arvot.viihtyvyys || arvot.kommentti?.trim());
}

/**
 * Luonnos laitteelta tarkistettuna. Rikkinäinen, vanhentunut tai tuntematon
 * muoto hylätään hiljaa, eikä hakemistosta poistettua ravintolaa palauteta.
 */
export function lueLuonnos(raaka: string | null, ravintolaIdt: ReadonlySet<string>, nyt = Date.now()): Luonnos | null {
  if (!raaka) return null;
  let data: unknown;
  try {
    data = JSON.parse(raaka);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const l = data as Partial<Luonnos>;
  if (l.versio !== 1 || typeof l.tallennettu !== "number" || nyt - l.tallennettu > LUONNOS_IKA_MS) return null;
  if (!l.arvot || typeof l.arvot !== "object") return null;

  const arvot: Luonnos["arvot"] = {};
  for (const kentta of LUONNOKSEN_KENTAT) {
    const arvo = (l.arvot as Record<string, unknown>)[kentta];
    if (typeof arvo === "string") arvot[kentta] = arvo.slice(0, 2000);
  }
  if (arvot.ravintola && !ravintolaIdt.has(arvot.ravintola)) delete arvot.ravintola;
  if (luonnosTyhja(arvot)) return null;
  return { versio: 1, tallennettu: l.tallennettu, vaihe: onVaihe(l.vaihe) ? l.vaihe : "ravintola", arvot };
}

/** Lomakkeen alkuarvot luonnoksesta. */
export function luonnoksenArvot(luonnos: Luonnos | null): ReviewValues {
  return { ...EMPTY_REVIEW_VALUES, ...(luonnos?.arvot ?? {}) };
}

/** Lomakkeen nykyiset arvot luonnokseksi (FormData sisältää piilotettujenkin vaiheiden kentät). */
export function luonnosLomakkeesta(data: FormData, vaihe: Vaihe, nyt = Date.now()): Luonnos {
  const arvot: Luonnos["arvot"] = {};
  for (const kentta of LUONNOKSEN_KENTAT) {
    const arvo = data.get(kentta);
    if (typeof arvo === "string" && arvo !== "") arvot[kentta] = arvo;
  }
  return { versio: 1, tallennettu: nyt, vaihe, arvot };
}

/* ── Muistettu arvostelija ────────────────────────────────────────────── */

/**
 * Laitteelle muistettu arvostelija tarkistettuna. Klubilaisen nimi otetaan
 * aina nykyisestä listasta (nimi on voitu korjata Studiossa); poistettu
 * klubilainen unohdetaan.
 */
export function lueArvostelija(
  raaka: string | null,
  klubilaiset: readonly { _id: string; nimi: string }[],
): Arvostelija | null {
  if (!raaka) return null;
  try {
    const a = JSON.parse(raaka) as Partial<Arvostelija> | null;
    if (!a || typeof a.nimi !== "string") return null;
    if (a.klubilainen) {
      const k = klubilaiset.find((x) => x._id === a.klubilainen);
      return k ? { klubilainen: k._id, nimi: k.nimi } : null;
    }
    const nimi = a.nimi.trim().slice(0, 80);
    return nimi.length >= 2 ? { klubilainen: "", nimi } : null;
  } catch {
    return null;
  }
}
