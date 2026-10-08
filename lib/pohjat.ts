/**
 * Valmiiden pohjien arvot ja [täytä: …] -kohtien sääntö (docs/24 askel 10, docs/23 Y37).
 *
 * - Pohja aloittaa uutisen valmiilla tekstillä. Kohdat, jotka sihteeri täyttää
 *   itse, ovat muotoa "[täytä: kellonaika]". Uutisen skeema estää julkaisun,
 *   kun yksikin kohta on jäänyt tekstiin (`taytaVielaSaanto`).
 * - Kategoriat haetaan Studiossa slugilla (sanity/pohjat.ts), joten tunnuksia
 *   ei kovakoodata. Pohjissa ei ole henkilötietoja: datasetti on julkinen.
 *
 * Puhdas moduuli (vain suhteelliset tuonnit): testataan komennolla
 * `npm run test:pohjat`.
 */

/**
 * Yksi [täytä: …] -kohta. **Ilman g-lippua**: globaali lauseke tekisi
 * `.test()`-kutsusta tilallisen (`lastIndex`), ja joka toinen tarkistus voisi
 * mennä ohi. Kaikki kohdat poimitaan erillisellä globaalilla lausekkeella.
 */
export const TAYTA = /\[täytä:[^\]]*\]/i;

type Span = { _type?: string; text?: unknown };
type Blokki = { _type?: string; children?: Span[] };

/** Tekstit, joista kohtia etsitään: merkkijono tai tekstieditorin kappaleiden spanit. */
function tekstit(arvo: unknown): string[] {
  if (typeof arvo === "string") return [arvo];
  if (!Array.isArray(arvo)) return [];
  const tulos: string[] = [];
  for (const lohko of arvo as Blokki[]) {
    if (lohko?._type !== "block" || !Array.isArray(lohko.children)) continue;
    // Kappaleen spanit yhteen: muotoilu voi jakaa kohdan useaan spaniin.
    tulos.push(lohko.children.map((s) => (typeof s?.text === "string" ? s.text : "")).join(""));
  }
  return tulos;
}

/** Löydetyt "[täytä: …]"-kohdat järjestyksessä. Merkkijono tai Portable Text -taulukko. */
export function taytettavatKohdat(arvo: unknown): string[] {
  const kaikki = new RegExp(TAYTA.source, "gi");
  return tekstit(arvo).flatMap((teksti) => [...teksti.matchAll(kaikki)].map((m) => m[0]));
}

/** Validointisääntö (virhetaso): unohtunut kohta estää julkaisun. */
export function taytaVielaSaanto(arvo: unknown): true | string {
  const kohdat = taytettavatKohdat(arvo);
  return kohdat.length ? `Täytä vielä hakasulkeissa olevat kohdat: ${kohdat.join(", ")}` : true;
}

/* ── Pohjien arvot ─────────────────────────────────────────────────────── */

/** Klubi perustettiin 2007: vuoden 2026 kokous on 19. */
export function vuosikokousNumero(vuosi: number): number {
  return vuosi - 2007;
}

/** Päivä Helsingin aikaa muodossa 2026-10-08 (päivämääräkenttä). */
export function tamaPaiva(nyt: Date): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Helsinki" }).format(nyt);
}

/** Vuosi Helsingin aikaa (uudenvuodenyönä UTC-vuosi olisi vielä vanha). */
export function tamaVuosi(nyt: Date): number {
  return Number(tamaPaiva(nyt).slice(0, 4));
}

let laskuri = 0;
/** Pohjan avain: uniikki yhden pohjan sisällä, Studio ei vaadi satunnaisuutta. */
const avain = (etuliite: string) => `${etuliite}${(laskuri++).toString(36)}`;

/** Normaali kappale. Rivinvaihto (\n) on kappaleen sisäinen (Shift + Enter). */
export function kappale(teksti: string) {
  return {
    _type: "block" as const,
    _key: avain("k"),
    style: "normal" as const,
    markDefs: [] as never[],
    children: [{ _type: "span" as const, _key: avain("s"), text: teksti, marks: [] as string[] }],
  };
}

const viittaukset = (idt: (string | null | undefined)[]) =>
  idt
    .filter((id): id is string => typeof id === "string" && id.length > 0)
    .map((_ref) => ({ _type: "reference" as const, _ref, _key: avain("r") }));

export type UutisPohja = {
  title: string;
  excerpt: string;
  publishedAt: string;
  kategoriat: { _type: "reference"; _ref: string; _key: string }[];
  tunnisteet: string[];
  body: ReturnType<typeof kappale>[];
  kommentointi?: { kaytossa: boolean; tyyppi: string };
};

/** Vuosikokouskutsu (kategoria Tapahtumat, slug tapahtumaraportti). */
export function vuosikokousPohja(vuosi: number, tapahtumatId: string | null, nyt: Date): UutisPohja {
  const lyhenne =
    `Lahden Suomalainen Klubi ry:n ${vuosikokousNumero(vuosi)}. vuosikokous pidetään ` +
    `[täytä: viikonpäivä ja päivämäärä] klo [täytä: kellonaika] [täytä: paikka].`;
  return {
    title: `Lahden Suomalainen Klubi ry - vuosikokous ${vuosi}`,
    excerpt: lyhenne,
    publishedAt: nyt.toISOString(),
    kategoriat: viittaukset([tapahtumatId]),
    tunnisteet: ["Lahden Suomalainen Klubi ry", "vuosikokous"],
    body: [
      kappale(lyhenne),
      kappale("Kokouksessa käsitellään sääntöjen määräämät vuosikokousasiat."),
      kappale("Tervetuloa!"),
      kappale("Lahden Suomalainen Klubi ry\nHallitus"),
    ],
  };
}

/** Palloveikkauksen välitilanne (kategoriat Jalkapallo ja Palloveikkaus). */
export function palloveikkausTilannePohja(vuosi: number, kategoriaIdt: (string | null)[], nyt: Date): UutisPohja {
  return {
    title: `Palloveikkaus tilanne ${vuosi} / [täytä: kierros]`,
    excerpt: "Klubin Palloveikkauksen tilanne [täytä: kierroksen jälkeen]: [täytä: kärkisijoitukset]",
    publishedAt: nyt.toISOString(),
    kategoriat: viittaukset(kategoriaIdt),
    tunnisteet: ["Lahden Suomalainen Klubi ry", "palloveikkaus", "Veikkausliiga"],
    body: [kappale("[täytä: sijoitukset riveittäin, Shift + Enter vaihtaa rivin]")],
  };
}

/** Uusi palloveikkauskausi: sarjajärjestysveikkaus päällä, joukkueet täytetään itse. */
export function palloveikkausKausiPohja(vuosi: number, kategoriaIdt: (string | null)[], nyt: Date): UutisPohja {
  const lyhenne =
    `Veikkaa kaikkien Veikkausliigan joukkueiden sijoitus kauden ${vuosi} lopussa. ` +
    "Jokaisesta väärin sijoitetusta joukkueesta tulee miinuspisteitä väärin menneen sijoituksen verran.";
  return {
    title: `Palloveikkaus ${vuosi}`,
    excerpt: lyhenne,
    publishedAt: nyt.toISOString(),
    kategoriat: viittaukset(kategoriaIdt),
    tunnisteet: ["Lahden Suomalainen Klubi ry", "palloveikkaus", "Veikkausliiga"],
    kommentointi: { kaytossa: true, tyyppi: "sarjajarjestys" },
    body: [
      kappale(lyhenne),
      kappale(
        "Veikkaus sulkeutuu [täytä: päivä ja kellonaika]. Aseta sama aika kohtaan " +
          "Kommentit ja veikkaus → Veikkaus sulkeutuu.",
      ),
    ],
  };
}

/**
 * Klubilaisen arvosana ravintolalle: ravintola ja tämä päivä valmiina.
 * Ravintolaan, jota ei ole vielä julkaistu, viitataan kuten Sanityn oma
 * viittauskenttä tekee (sanity 5.31.2): `_weak: true` ja
 * `_strengthenOnPublish: { type }`, jolloin julkaisu tekee viittauksesta
 * vahvan. Vahva viittaus julkaisemattomaan ravintolaan kaataisi julkaisun.
 */
export function klubiArvioPohja(ravintolaId: string, nyt: Date, ravintolaJulkaistu = true) {
  const id = ravintolaId.replace(/^drafts\./, "");
  const ravintola = ravintolaJulkaistu
    ? { _type: "reference" as const, _ref: id }
    : { _type: "reference" as const, _ref: id, _weak: true, _strengthenOnPublish: { type: "ravintola" } };
  return { ravintola, paiva: tamaPaiva(nyt) };
}

/** Pohjien kategoriat sluggeina (uutisKategoria.slug tai sen aiempi polku). */
export const POHJAN_KATEGORIAT = {
  vuosikokous: ["tapahtumaraportti"],
  palloveikkaus: ["jalkapallo", "palloveikkaus"],
} as const;

export type KategoriaRivi = { _id: string; slug?: string | null; aiemmatPolut?: string[] | null };

/**
 * Kategorioiden tunnukset slugien järjestyksessä. Nykyinen slug voittaa
 * aiemman polun (sihteeri on voinut nimetä kategorian uudelleen). Puuttuva
 * kategoria jää pois: pohja toimii silloinkin, kategoria valitaan itse.
 */
export function kategoriatSlugeilla(rivit: KategoriaRivi[], slugit: readonly string[]): string[] {
  const tulos: string[] = [];
  for (const slug of slugit) {
    const osuma =
      rivit.find((r) => r.slug === slug) ?? rivit.find((r) => (r.aiemmatPolut ?? []).includes(slug));
    if (osuma && !tulos.includes(osuma._id)) tulos.push(osuma._id);
  }
  return tulos;
}
