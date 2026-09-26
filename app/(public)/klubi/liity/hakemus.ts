/**
 * Jäsenhakemuksen kentät, validointi ja lomakkeen tila.
 *
 * Tämä moduuli on tarkoituksella puhdas (ei `"use server"`, ei I/O), jotta
 * sekä palvelintoiminto että selainlomake voivat käyttää samoja kenttänimiä
 * ja virheilmoituksia. Validointi ajetaan silti aina palvelimella —
 * selainpuolen `required`-attribuutit ovat käyttömukavuutta, eivät suoja.
 *
 * Zodia ei käytetä: riippuvuutta ei ole asennettu eikä `package.json` kuulu
 * tämän osion omistukseen. Kenttiä on kahdeksan ja säännöt ovat suoria, joten
 * käsin kirjoitettu validointi on tässä pienempi riski kuin uusi riippuvuus.
 */

export const HAKEMUS_KENTAT = [
  "etunimi",
  "sukunimi",
  "sahkoposti",
  "puhelin",
  "syntymavuosi",
  "paikkakunta",
  "perustelu",
  "suostumus",
] as const;

export type HakemusKentta = (typeof HAKEMUS_KENTAT)[number];

/** Hunajapurkki: oikea käyttäjä ei näe tätä kenttää eikä täytä sitä. */
export const HONEYPOT_KENTTA = "kotisivu";

export type HakemusArvot = Record<HakemusKentta, string>;

export type HakemusVirheet = Partial<Record<HakemusKentta, string>>;

export type HakemusTila =
  | { status: "idle" }
  /** Validointi hylkäsi syötteen. Arvot palautetaan, jottei mitään katoa. */
  | { status: "virhe"; viesti: string; virheet: HakemusVirheet; arvot: HakemusArvot }
  /** Lähetyskanavaa ei ole konfiguroitu — ei teeskennellä onnistumista. */
  | { status: "eiKaytossa"; viesti: string; arvot: HakemusArvot }
  | { status: "onnistui"; viesti: string };

export const ALKUTILA: HakemusTila = { status: "idle" };

export const TYHJAT_ARVOT: HakemusArvot = {
  etunimi: "",
  sukunimi: "",
  sahkoposti: "",
  puhelin: "",
  syntymavuosi: "",
  paikkakunta: "",
  perustelu: "",
  suostumus: "",
};

export const KENTTA_OTSIKOT: Record<HakemusKentta, string> = {
  etunimi: "Etunimi",
  sukunimi: "Sukunimi",
  sahkoposti: "Sähköposti",
  puhelin: "Puhelin",
  syntymavuosi: "Syntymävuosi",
  paikkakunta: "Paikkakunta",
  perustelu: "Kerro lyhyesti itsestäsi",
  suostumus: "Suostumus tietojen käsittelyyn",
};

const SAHKOPOSTI = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** Lukee lomakkeen kentät merkkijonoiksi — FormData voi sisältää tiedostoja. */
export function lueArvot(formData: FormData): HakemusArvot {
  const arvot = { ...TYHJAT_ARVOT };
  for (const kentta of HAKEMUS_KENTAT) {
    const arvo = formData.get(kentta);
    arvot[kentta] = typeof arvo === "string" ? arvo.trim() : "";
  }
  return arvot;
}

export function onHunajapurkkiTaytetty(formData: FormData): boolean {
  const arvo = formData.get(HONEYPOT_KENTTA);
  return typeof arvo === "string" && arvo.trim().length > 0;
}

export function validoiHakemus(arvot: HakemusArvot): HakemusVirheet {
  const virheet: HakemusVirheet = {};

  if (!arvot.etunimi) {
    virheet.etunimi = "Etunimi on pakollinen.";
  } else if (arvot.etunimi.length > 60) {
    virheet.etunimi = "Etunimi on liian pitkä (enintään 60 merkkiä).";
  }

  if (!arvot.sukunimi) {
    virheet.sukunimi = "Sukunimi on pakollinen.";
  } else if (arvot.sukunimi.length > 60) {
    virheet.sukunimi = "Sukunimi on liian pitkä (enintään 60 merkkiä).";
  }

  if (!arvot.sahkoposti) {
    virheet.sahkoposti = "Sähköposti on pakollinen — vastaamme siihen.";
  } else if (arvot.sahkoposti.length > 120 || !SAHKOPOSTI.test(arvot.sahkoposti)) {
    virheet.sahkoposti = "Tarkista sähköpostiosoite, esim. etunimi@esimerkki.fi.";
  }

  if (arvot.puhelin && arvot.puhelin.length > 40) {
    virheet.puhelin = "Puhelinnumero on liian pitkä (enintään 40 merkkiä).";
  }

  if (arvot.syntymavuosi) {
    const vuosi = Number(arvot.syntymavuosi);
    const nykyvuosi = new Date().getFullYear();
    if (!Number.isInteger(vuosi) || vuosi < 1900 || vuosi > nykyvuosi) {
      virheet.syntymavuosi = `Anna syntymävuosi neljällä numerolla (1900–${nykyvuosi}).`;
    }
  }

  if (arvot.paikkakunta && arvot.paikkakunta.length > 60) {
    virheet.paikkakunta = "Paikkakunta on liian pitkä (enintään 60 merkkiä).";
  }

  if (arvot.perustelu && arvot.perustelu.length > 1500) {
    virheet.perustelu = "Teksti on liian pitkä (enintään 1500 merkkiä).";
  }

  if (arvot.suostumus !== "kylla") {
    virheet.suostumus =
      "Tarvitsemme suostumuksesi, jotta voimme käsitellä hakemuksen.";
  }

  return virheet;
}

/** Hakemus tekstimuodossa sähköpostin rungoksi. */
export function muotoileHakemus(arvot: HakemusArvot): string {
  const rivit: string[] = [
    "Uusi jäsenhakemus lahdensuomalainenklubi.com-sivustolta.",
    "",
    `Nimi: ${arvot.etunimi} ${arvot.sukunimi}`,
    `Sähköposti: ${arvot.sahkoposti}`,
  ];
  if (arvot.puhelin) rivit.push(`Puhelin: ${arvot.puhelin}`);
  if (arvot.syntymavuosi) rivit.push(`Syntymävuosi: ${arvot.syntymavuosi}`);
  if (arvot.paikkakunta) rivit.push(`Paikkakunta: ${arvot.paikkakunta}`);
  if (arvot.perustelu) {
    rivit.push("", "Hakijan kertomaa:", arvot.perustelu);
  }
  rivit.push("", `Lähetetty: ${new Date().toISOString()}`);
  return rivit.join("\n");
}
