import { TILA_ID } from "../../lib/sivuston-tila";

/**
 * "Tehtävät sinulle" -rekisteri (docs/24 askel 7, docs/23 Y11 ja Y35).
 *
 * Yksi lähde kahdelle näkymälle: Studion rakenne (sanity/structure.ts) rakentaa
 * tästä listat, ja Aloitus-näkymä laskee samoista ehdoista laskurit. Näin
 * laskurin luku ja listan sisältö eivät erkane.
 *
 * - `suodatin`: Studion listan ehto. Studio hakee listat luonnosnäkymässä,
 *   jossa luonnoksen `_id` on ilman `drafts.`-etuliitettä: luonnoksen tunnistaa
 *   `_originalId`:stä.
 * - `laskuri`: GROQ `count(…)` raw-näkökulmassa (luonnoksen `_id` alkaa
 *   `drafts.`). Laskuri täsmää Studion listaan: jokainen dokumentti lasketaan
 *   kerran, luonnoksen ehdolla, jos luonnos on olemassa, muuten julkaistun
 *   (`nakyvaVersio`). Pelkät luonnokset (esim. kommentti, jota ei ole
 *   julkaistu) ovat mukana kuten listassa.
 *
 * Puhdas moduuli (vain suhteelliset tuonnit): testataan komennolla
 * `npm run test:aloitus`.
 */

/** Tyypit, joissa on migraation "Vaatii tarkistuksen" -lippu (Tarkistettavat-ryhmä). */
export const TARKISTETTAVAT_TYYPIT: { tyyppi: string; otsikko: string }[] = [
  { tyyppi: "uutinen", otsikko: "Uutiset" },
  { tyyppi: "ravintola", otsikko: "Ravintolat" },
  { tyyppi: "jalkapalloTilasto", otsikko: "Tilastot" },
  { tyyppi: "stadion", otsikko: "Stadionit" },
  { tyyppi: "klubiToiminta", otsikko: "Klubin toiminta" },
  { tyyppi: "pelaaja", otsikko: "Pelaajat" },
  { tyyppi: "lehtileike", otsikko: "Lehtileikkeet" },
  { tyyppi: "arvokisa", otsikko: "Arvokisat" },
  { tyyppi: "sivu", otsikko: "Sivut" },
  { tyyppi: "tapahtuma", otsikko: "Tapahtumat" },
  { tyyppi: "galleriaAlbumi", otsikko: "Galleria-albumit" },
];

/** Lomakkeen luonnoksena tallentamat arvostelut (Studion lista, luonnosnäkymä). */
export const ODOTTAVAT_ARVOSTELUT = `_type == "ravintolaKayttajaArvostelu" && _originalId in path("drafts.**")`;

/** Järjestelmä- ja omalla listallaan olevat tyypit, jotka eivät ole "julkaisemattomia muutoksia". */
export const JULKAISEMATTOMISTA_POIS = ["ravintolaKayttajaArvostelu", "varmuuskopio", "sivustonTila"];

export type Tehtava = {
  /** Kiinteä tunnus: Studion polku /studio/structure/tehtavat;<id>. */
  id: string;
  otsikko: string;
  /** Listan otsikko, jos eri kuin kohdan otsikko. */
  listanOtsikko?: string;
  /** Kortin selitys Aloituksessa. */
  kuvaus: string;
  suodatin: string;
  laskuri: string;
  params?: Record<string, unknown>;
  tyyppi?: string;
  jarjestys: { field: string; direction: "asc" | "desc" }[];
};

const VIIKKO = `dateTime(now()) - 60*60*24*7`;

/**
 * Raw-näkökulman ehto, joka valitsee kustakin dokumentista saman version kuin
 * Studion luonnosnäkymä: luonnos, jos sellainen on, muuten julkaistu
 * (julkaisuversiot `versions.*` eivät ole listoissa).
 */
export const NAKYVA_VERSIO = `(_id in path("drafts.**") || (!(_id in path("versions.**")) && !(("drafts." + _id) in *[_id in path("drafts.**")]._id)))`;

const nakyvat = (ehto: string) => `count(*[${ehto} && ${NAKYVA_VERSIO}])`;

export const TEHTAVAT: Tehtava[] = [
  {
    id: "arvostelut",
    otsikko: "Arvostelut odottavat hyväksyntää",
    listanOtsikko: "Odottavat hyväksyntää",
    kuvaus: "Kävijöiden ravintola-arvostelut",
    tyyppi: "ravintolaKayttajaArvostelu",
    suodatin: ODOTTAVAT_ARVOSTELUT,
    laskuri: `count(*[_type == "ravintolaKayttajaArvostelu" && _id in path("drafts.**")])`,
    jarjestys: [{ field: "submittedAt", direction: "desc" }],
  },
  {
    id: "kommentit",
    otsikko: "Uudet kommentit (7 päivää)",
    kuvaus: "Lue ja piilota tarvittaessa",
    tyyppi: "kommentti",
    suodatin: `_type == "kommentti" && dateTime(lahetetty) > ${VIIKKO}`,
    laskuri: nakyvat(`_type == "kommentti" && dateTime(lahetetty) > ${VIIKKO}`),
    jarjestys: [{ field: "lahetetty", direction: "desc" }],
  },
  {
    // Luonnos, jota ei ole julkaistu: sivusto näyttää yhä vanhaa. Arvostelut
    // ovat omalla listallaan, ja järjestelmädokumentit jätetään pois.
    id: "julkaisemattomat",
    otsikko: "Julkaisemattomat muutokset",
    kuvaus: "Sivustolla näkyy niissä yhä vanha versio",
    suodatin: `_originalId in path("drafts.**") && !(_type match "sanity.*") && !(_type in $pois)`,
    laskuri: `count(*[_id in path("drafts.**") && !(_type match "sanity.*") && !(_type in $pois)])`,
    params: { pois: JULKAISEMATTOMISTA_POIS },
    jarjestys: [{ field: "_updatedAt", direction: "desc" }],
  },
  {
    id: "ajastetut",
    otsikko: "Ajastetut uutiset",
    listanOtsikko: "Ajastetut uutiset (julkaisuaika tulevaisuudessa)",
    kuvaus: "Tulevat näkyviin julkaisuaikana",
    tyyppi: "uutinen",
    suodatin: `_type == "uutinen" && dateTime(publishedAt) > dateTime(now())`,
    laskuri: nakyvat(`_type == "uutinen" && dateTime(publishedAt) > dateTime(now())`),
    jarjestys: [{ field: "publishedAt", direction: "asc" }],
  },
  {
    id: "tarkistettavat",
    otsikko: "Vaatii tarkistuksen (kaikki)",
    listanOtsikko: "Vaatii tarkistuksen",
    kuvaus: "Vanhalta sivustolta siirretyt kohdat, jotka kannattaa tarkistaa",
    suodatin: `needsReview == true && _type in $tyypit`,
    laskuri: nakyvat(`needsReview == true && _type in $tyypit`),
    params: { tyypit: TARKISTETTAVAT_TYYPIT.map(({ tyyppi }) => tyyppi) },
    jarjestys: [{ field: "_updatedAt", direction: "desc" }],
  },
];

/** Studion polku tehtävän listaan. */
export function tehtavanPolku(id: string): string {
  return `/studio/structure/tehtavat;${id}`;
}

/**
 * Aloituksen kysely: laskurit, viimeisin varmuuskopio, ajastettujen tehtävien
 * tila ja perustiedot yhdellä pyynnöllä (raw-näkökulma).
 */
export const ALOITUS_KYSELY = /* groq */ `{
  "laskurit": {
${TEHTAVAT.map((t) => `    "${t.id}": ${t.laskuri}`).join(",\n")}
  },
  "varmuuskopio": *[_type == "varmuuskopio" && !(_id in path("drafts.**"))] | order(paiva desc)[0]{ paiva, dokumentteja },
  "huolto": *[_id == $huoltoId][0]{ aika, onnistui, viimeisinOnnistunut, tulokset },
  "varmuuskopioAjo": *[_id == $varmuuskopioId][0]{ aika, onnistui, viimeisinOnnistunut, tulokset },
  "perustiedot": {
    "sahkoposti": defined(*[_id == "yhteystiedot"][0].email),
    "osoite": defined(*[_id == "yhteystiedot"][0].address),
    "puhelin": defined(*[_id == "yhteystiedot"][0].phone),
    "hallitus": count(*[_type == "hallitusJasen" && nykyinen != false && !(_id in path("drafts.**"))]),
    "esittelykuva": count(*[_id == "etusivu"][0].blocks[_type == "esittely" && piilota != true]) == 0
      || defined(*[_id == "etusivu"][0].blocks[_type == "esittely" && piilota != true][0].image.asset)
  }
}`;

/** Kyselyn parametrit: jokaisen tehtävän parametrit yhdistettyinä. */
export function aloituksenParametrit(): Record<string, unknown> {
  return {
    ...Object.assign({}, ...TEHTAVAT.map((t) => t.params ?? {})),
    huoltoId: TILA_ID.huolto,
    varmuuskopioId: TILA_ID.varmuuskopio,
  };
}

/** Kiintiön laskenta datasetistä: sisältödokumentit luonnoksineen, ei tiedostoja eikä järjestelmää. */
export const KIINTIO_KYSELY = /* groq */ `count(*[!(_type match "sanity.*") && !(_id in path("_.**"))])`;

