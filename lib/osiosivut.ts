/**
 * Osioiden sivut (docs/24 askel 3, docs/23 Y22 ja Y25).
 *
 * Sivuston 30 koodireittiä (listasivut, arkiston osiot ja Klubin pääsivut)
 * lukevat otsikkonsa, johdantonsa ja hakukonetekstinsä lukitulta
 * `sivu`-dokumentilta, jonka tunnus on kiinteä (`osioSivuId`). Jos dokumenttia
 * tai kenttää ei ole, käytetään tämän rekisterin oletustekstiä, joten sivu ei
 * koskaan hajoa. Oletukset ovat sanatarkasti samat kuin ennen kuin tekstit
 * siirtyivät Studioon.
 *
 * Puhdas moduuli: ainoa tuonti on `./ravintola-arvosana` (vakio VAHIMMAISARVIOIJAT;
 * se tuo itse vain tyyppejä, joten kehää ei synny).
 * Tämä ei saa tuoda tiedostoja `./path` eikä `./nav-sections`, koska path.ts
 * tuo tämän (kehä). Testit: `npm run test:osiosivut`.
 */
import { VAHIMMAISARVIOIJAT } from "./ravintola-arvosana";

/** Kentät, jotka näkyvät osiosivun lomakkeella vain, jos sivu käyttää niitä. */
export type OsioSivunKentta = "hero" | "body" | "tilastot";

/** Studion ryhmä, jossa sivu on (Klubi-ryhmä tai Osioiden sivut -alaryhmä). */
export type StudionRyhma = "klubi" | "uutiset" | "ravintolat" | "jalkapalloarkisto";

/** Jalkapalloarkiston 16 osiota, joilla on oma osiosivu (Litmanen ei ole osiosivu). */
export const ARKISTON_OSIOT = [
  "huuhkajat",
  "arvokisat",
  "mestarit",
  "eurocupit",
  "vuoden-pelaajat",
  "euroopan-paras",
  "maailman-parhaat",
  "valmentajat",
  "fifa-ranking",
  "lupaavat",
  "saavutukset",
  "jarkytykset",
  "ulkomaiset-mestarit",
  "palloliitto",
  "stadionit",
  "tilastot",
] as const;
type ArkistonOsio = (typeof ARKISTON_OSIOT)[number];

/** Osiosivujen polut: kirjoitusvirhe reitin `OSIO`-vakiossa on käännösvirhe. */
export type OsioSivuSlug =
  | "klubi"
  | "klubi/toiminta"
  | "klubi/hallitus"
  | "klubi/palloveikkaus"
  | "klubi/yhteystiedot"
  | "uutiset"
  | "uutiset/arkisto"
  | "uutiset/tunnisteet"
  | "tapahtumat"
  | "galleria"
  | "ottelut"
  | "ravintolat"
  | "ravintolat/odottavat"
  | "jalkapalloarkisto"
  | `jalkapalloarkisto/${ArkistonOsio}`;

export interface OsioSivu {
  /** Polku ilman alkukauttaviivaa, esim. "uutiset" tai "jalkapalloarkisto/mestarit". */
  slug: OsioSivuSlug;
  ryhma: StudionRyhma;
  /** Nimi Studion listassa. */
  nimi: string;
  /** Sivulla käytössä olevat valinnaiset kentät; [] = vain otsikko, johdanto ja hakukonetekstit. */
  kentat: readonly OsioSivunKentta[];
  oletus: {
    title: string;
    /** null = koodissa ei ole johdantoa (johdanto on valinnainen). */
    lead: string | null;
    /** null = hakukonekuvaus on sama kuin johdanto. */
    description: string | null;
    /** Vain kun hakutuloksen otsikko eroaa sivun otsikosta. */
    seoTitle?: string;
    /** Arkiston etusivun kortin teksti: kenttä "Teksti arkiston etusivun kortissa" näkyy. */
    kortti?: string;
  };
  /** Sivukohtainen lisäohje Studion ohjelaatikkoon. */
  ohje?: string;
}

const ARKISTON_OHJE = "Taulukot tulevat sivulle automaattisesti (Jalkapalloarkisto → Tilastot).";

/** Arkiston osion merkintä (16 kpl): ryhmä, kentät ja ohje ovat kaikille samat. */
function arkistonOsio(
  osio: ArkistonOsio,
  oletus: { title: string; lead: string; description: string | null; kortti: string },
): OsioSivu {
  return {
    slug: `jalkapalloarkisto/${osio}`,
    ryhma: "jalkapalloarkisto",
    nimi: oletus.title,
    kentat: [],
    oletus,
    ohje: ARKISTON_OHJE,
  };
}

/** Rekisteri: 30 sivua Studion järjestyksessä. */
export const OSIOSIVUT: readonly OsioSivu[] = [
  /* ── Klubi ─────────────────────────────────────────────────────────────── */
  {
    slug: "klubi",
    ryhma: "klubi",
    nimi: "Esittely",
    kentat: ["body", "hero"],
    oletus: { title: "Klubi", lead: null, description: null },
  },
  {
    slug: "klubi/toiminta",
    ryhma: "klubi",
    nimi: "Toiminta",
    kentat: ["body"],
    oletus: { title: "Toiminta", lead: null, description: null },
    ohje: "Toimintamuodot tulevat sivulle automaattisesti (Klubi → Toiminta → Toimintamuodot).",
  },
  {
    slug: "klubi/hallitus",
    ryhma: "klubi",
    nimi: "Hallitus",
    kentat: ["body"],
    oletus: { title: "Hallitus", lead: null, description: null },
    ohje: "Nykyiset hallituksen jäsenet tulevat sivulle automaattisesti (Klubi → Hallitus).",
  },
  {
    slug: "klubi/palloveikkaus",
    ryhma: "klubi",
    nimi: "Palloveikkaus",
    kentat: ["body", "hero", "tilastot"],
    oletus: { title: "Palloveikkaus", lead: null, description: null },
    ohje: "Veikkausten alasivut (osoite klubi/palloveikkaus/…) tulevat sivulle korteiksi.",
  },
  {
    slug: "klubi/yhteystiedot",
    ryhma: "klubi",
    nimi: "Yhteystiedot",
    kentat: [],
    oletus: {
      title: "Yhteystiedot",
      lead: null,
      description:
        "Lahden Suomalainen Klubi ry:n yhteystiedot: osoite, sähköposti, puhelin ja laskutustiedot.",
    },
    ohje: "Osoite, sähköposti ja some muokataan kohdassa Klubi → Yhteystiedot → Osoite, sähköposti ja some.",
  },

  /* ── Uutiset ja tapahtumat ─────────────────────────────────────────────── */
  {
    slug: "uutiset",
    ryhma: "uutiset",
    nimi: "Uutiset",
    kentat: [],
    oletus: {
      title: "Uutiset",
      lead:
        "Klubin tiedotteet, tapahtumat ja ottelutapahtumat sekä jalkapallo- ja " +
        "ravintola-aiheiset kirjoitukset. Uusimmat ensin.",
      description: null,
    },
    ohje:
      "Uutislista tulee automaattisesti. Kun kävijä valitsee kategorian, sivun otsikko ja kuvaus " +
      "tulevat kategoriasta (Uutiskategoriat).",
  },
  {
    slug: "uutiset/arkisto",
    ryhma: "uutiset",
    nimi: "Uutisarkisto",
    kentat: [],
    oletus: {
      title: "Uutisarkisto",
      lead:
        "Klubin kirjoitukset vuosi kerrallaan. Arkistossa ovat vanhan sivuston " +
        "kommentti- ja blogisivut sekä kaikki myöhemmin julkaistut uutiset.",
      description: null,
    },
    ohje: "Vuodet tulevat sivulle automaattisesti.",
  },
  {
    slug: "uutiset/tunnisteet",
    ryhma: "uutiset",
    nimi: "Uutisten tunnisteet",
    kentat: [],
    oletus: {
      title: "Tunnisteet",
      lead:
        "Uutisten aiheet, paikat, ravintolat ja henkilöt. Valitse tunniste, niin näet " +
        "kaikki sen kirjoitukset. Luku kertoo kirjoitusten määrän.",
      description: null,
      seoTitle: "Uutisten tunnisteet",
    },
    ohje: "Tunnisteet tulevat sivulle automaattisesti uutisista.",
  },
  {
    slug: "tapahtumat",
    ryhma: "uutiset",
    nimi: "Tapahtumat",
    kentat: [],
    oletus: {
      title: "Tapahtumat",
      lead:
        "Yhdistys järjestää vuosittain vuosikokouksen, vapunvieton, " +
        "mölkkyturnauksen, jouluruokailun ja muita tilaisuuksia jäsenille ja " +
        "heidän vierailleen.",
      description: null,
    },
    ohje:
      "Tapahtumat tulevat sivulle automaattisesti. Kun yhtään tapahtumaa ei ole, osio on piilossa " +
      "valikosta ja hakukoneilta.",
  },
  {
    slug: "galleria",
    ryhma: "uutiset",
    nimi: "Galleria",
    kentat: [],
    oletus: {
      title: "Galleria",
      lead:
        "Kuvia Lahden Suomalainen Klubi ry:n tapahtumista, retkistä ja kohokohdista vuosien varrelta. " +
        "Albumit on järjestetty uusimmasta vanhimpaan.",
      description: null,
    },
    ohje:
      "Albumit tulevat sivulle automaattisesti. Kun yhtään albumia ei ole, osio on piilossa " +
      "valikosta ja hakukoneilta.",
  },
  {
    slug: "ottelut",
    ryhma: "uutiset",
    nimi: "Ottelut",
    kentat: [],
    oletus: {
      title: "Ottelut",
      lead:
        "Huuhkajien ja klubin seuraamien seurojen tulevat ottelut. " +
        "Merkinnästä näet, missä otteluissa klubi on paikalla ja mihin järjestetään yhteinen vierasmatka.",
      description: null,
    },
    ohje:
      "Ottelut tulevat sivulle automaattisesti. Seurat valitaan kohdassa Sivuston asetukset → " +
      "Etusivu → Otteluohjelma-lohko.",
  },

  /* ── Ravintolat ────────────────────────────────────────────────────────── */
  {
    slug: "ravintolat",
    ryhma: "ravintolat",
    nimi: "Ravintola-arviot",
    kentat: [],
    oletus: {
      title: "Ravintola-arviot",
      // Johdanto lasketaan datasta (ravintoloiden määrä ja vanhin käynti), ei kovakoodata.
      lead: null,
      description:
        "Klubin ravintola-arvostelut: kokonaisarvosana sekä osa-arviot ruoasta, " +
        "hinnasta ja viihtyvyydestä. Suodata maan, maakunnan, kaupungin " +
        "ja arvosanan mukaan.",
    },
    ohje:
      "Jos jätät Tiivistelmän tyhjäksi, sivusto kirjoittaa johdannon itse ravintoloiden määrästä " +
      "(esim. 'Klubi on arvioinut 573 ravintolaa vuodesta 1997 alkaen…'). Kirjoittamasi teksti korvaa sen.",
  },
  {
    slug: "ravintolat/odottavat",
    ryhma: "ravintolat",
    nimi: "Odottavat toista arvioijaa",
    kentat: [],
    oletus: {
      title: "Odottavat toista arvioijaa",
      lead:
        `Ravintola julkaistaan sivuilla, kun vähintään ${VAHIMMAISARVIOIJAT} klubilaista on arvioinut sen. ` +
        "Näissä paikoissa on käynyt yksi klubilainen. Kun käyt itse, lähetä arvostelu: " +
        "ravintola tulee sivuille, kun arvostelusi on hyväksytty.",
      description: null,
    },
    ohje: "Sivu ei näy hakukoneissa. Jos kahden klubilaisen sääntö muuttuu, päivitä myös tämä teksti.",
  },

  /* ── Jalkapalloarkisto ─────────────────────────────────────────────────── */
  {
    slug: "jalkapalloarkisto",
    ryhma: "jalkapalloarkisto",
    nimi: "Jalkapalloarkisto (etusivu)",
    kentat: [],
    oletus: {
      title: "Jalkapalloarkisto",
      lead:
        "Lahden Suomalainen Klubi on koonnut jalkapallon tilastoja vuodesta 2007 " +
        "alkaen. Arkisto kattaa Suomen maajoukkueen ottelut ja karsinnat, " +
        "arvokisojen tulokset, Suomen mestarit, eurocupien finaalit sekä " +
        "palkintojen voittajat — vanhimmat taulukot ulottuvat 1900-luvun alkuun.",
      description:
        "Klubin jalkapalloarkisto: Huuhkajien ottelut, arvokisat, Suomen mestarit, eurocupit, valmentajat ja FIFA-ranking taulukoina.",
    },
    ohje:
      "Osioiden kortit tulevat sivulle automaattisesti. Kortin teksti muokataan kunkin osion omalla " +
      "sivulla kentässä Teksti arkiston etusivun kortissa.",
  },
  arkistonOsio("huuhkajat", {
    title: "Huuhkajat",
    lead:
      "Huuhkajat on Suomen miesten A-maajoukkueen nimi. Arkisto kokoaa " +
      "maajoukkueen tilastot aiheittain: pelaajatilastot, klubin oma " +
      "Huuhkaja-arvostelu, Kansojen liiga ja karsintasarjat.",
    description:
      "Suomen miesten maajoukkueen otteluhistoria ja pelaajatilastot: maaottelut, maalintekijät ja edustusmäärät taulukoina.",
    kortti: "Suomen maajoukkueen otteluhistoria, pelaajatilastot ja karsintasarjat.",
  }),
  arkistonOsio("arvokisat", {
    title: "Arvokisat",
    lead:
      "Jalkapallon arvokisat kisa kerrallaan: isäntämaat, voittajat ja Suomen sijoitus. " +
      "Kisat on ryhmitelty kisatyypin mukaan, uusin vuosi ensin.",
    description: null,
    kortti: "MM- ja EM-kisojen tulokset, tilastot ja Kansojen liiga kisa kerrallaan.",
  }),
  arkistonOsio("mestarit", {
    title: "Suomen mestarit",
    lead:
      "Suomen mestaruudesta on pelattu vuodesta 1908. Taulukot kokoavat " +
      "mestaruuden voittaneet seurat vuosittain sekä seurojen kokonaismäärät.",
    description:
      "Suomen jalkapallon mestaruuden voittaneet seurat vuosi vuodelta — mestaruussarjan ja Veikkausliigan voittajat yhdessä taulukossa.",
    kortti: "Suomen mestaruuden voittaneet seurat vuosi vuodelta.",
  }),
  arkistonOsio("eurocupit", {
    title: "Eurocupit",
    lead:
      "Euroopan seurajoukkuekilpailut vuodesta 1955 nykypäivään. Jokaisella " +
      "kilpailulla on oma sivunsa, jolla finaalit, voittajat ja suomalaisjoukkueiden " +
      "otteet on koottu taulukoiksi.",
    description:
      "Euroopan seurajoukkuekilpailut yhdessä: Champions League, Europa League, Conference League, Super Cup ja Intercontinental.",
    kortti: "Champions League, Europa League, Conference League, Super Cup ja Intercontinental.",
  }),
  arkistonOsio("vuoden-pelaajat", {
    title: "Vuoden pelaajat",
    lead:
      "Kaksi palkintoa, kaksi taulukkoa: Suomen Palloliiton vuoden " +
      "jalkapalloilija ja FIFA:n valitsema maailman vuoden pelaaja. " +
      "Molemmat listat kattavat palkitut vuosittain.",
    description:
      "Suomen vuoden jalkapalloilijat ja FIFA:n vuoden pelaajat omina taulukkoinaan — palkitut vuosittain seuroineen ja maineen.",
    kortti: "Suomen vuoden jalkapalloilijat ja FIFA:n vuoden pelaajat.",
  }),
  arkistonOsio("euroopan-paras", {
    title: "Euroopan paras pelaaja",
    lead:
      "Ranskalainen France Football on palkinnut Euroopan parhaan pelaajan " +
      "vuodesta 1956. Taulukko listaa voittajat vuosittain seuroineen ja maineen.",
    description:
      "Ballon d'Or eli Euroopan parhaan jalkapalloilijan palkinto vuodesta 1956: voittajat, seurat ja maat vuosittain taulukkona.",
    kortti: "Ballon d'Or eli Euroopan parhaan pelaajan palkinto vuodesta 1956.",
  }),
  arkistonOsio("maailman-parhaat", {
    title: "Maailman paras avaus",
    lead:
      "Klubin valitsema maailman paras avauskokoonpano vuosi vuodelta: " +
      "pelaajat pelipaikoittain taulukossa ja jokaisen vuoden kenttäkaavio.",
    description:
      "Maailman paras avauskokoonpano vuosittain: jokaisen vuoden yksitoista pelaajaa pelipaikkoineen ja maineen sekä kenttäkaaviot.",
    kortti: "Maailman paras avauskokoonpano vuosittain kenttäkaavioina vuodesta 2006.",
  }),
  arkistonOsio("valmentajat", {
    title: "Huuhkajien valmentajat",
    lead:
      "Suomen maajoukkuetta on johtanut sekä kotimaisia että ulkomaisia " +
      "päävalmentajia. Sivu kokoaa valmentajat kausittain ja erikseen tiedot " +
      "valmentajien palkoista.",
    description:
      "Suomen miesten maajoukkueen päävalmentajat kausittain sekä tiedot valmentajien palkoista yhtenä koottuna taulukkona.",
    kortti: "Huuhkajien päävalmentajat kausittain sekä tiedot valmentajien palkoista.",
  }),
  arkistonOsio("fifa-ranking", {
    title: "FIFA-ranking",
    lead:
      "FIFA on julkaissut maailmanlistaa vuodesta 1992. Taulukot seuraavat " +
      "Suomen sijoitusta ja listan kärkimaita julkaisukierroksittain.",
    description:
      "Suomen sijoitus FIFA:n maailmanlistalla vuosittain sekä listan kärkimaat. Ranking päivittyy FIFA:n julkaisujen mukaan.",
    kortti: "Suomen sijoitus FIFA:n maailmanlistalla ja listan kärkimaat.",
  }),
  arkistonOsio("lupaavat", {
    title: "Lupaavat pelaajat 1980–1991",
    lead:
      "Lupaavimman pelaajan tunnustus jaettiin Suomessa vuosina 1980–1991. " +
      "Taulukko kokoaa palkitut vuosittain — monet heistä nousivat myöhemmin " +
      "maajoukkueeseen ja ulkomaisiin seuroihin.",
    description:
      "Vuosina 1980–1991 lupaavimmiksi valitut suomalaiset jalkapalloilijat: palkitut vuosittain seuroineen yhtenä taulukkona.",
    kortti: "Vuosien 1980–1991 lupaavimmiksi valitut suomalaispelaajat.",
  }),
  arkistonOsio("saavutukset", {
    title: "Suomen jalkapallon TOP 10 saavutukset",
    lead:
      "Suomalaisen jalkapallon kymmenen suurinta saavutusta maajoukkueen " +
      "ja seurojen otteluista.",
    description:
      "Suomen jalkapallon kymmenen suurinta saavutusta: ottelu, turnaus, päivämäärä, paikka, tulos ja yleisömäärä.",
    kortti: "Suomen jalkapallon kymmenen suurinta saavutusta.",
  }),
  arkistonOsio("jarkytykset", {
    title: "Suomen jalkapallon TOP 10 järkytykset",
    lead:
      "Ottelut, joiden lopputulosta kukaan ei osannut odottaa: suomalaisen " +
      "jalkapallon kymmenen suurinta järkytystä.",
    description:
      "Suomen jalkapallon suurimmat järkytykset: ottelu, turnaus, päivämäärä, paikka, tulos ja yleisömäärä.",
    kortti: "Suomen jalkapallon kymmenen suurinta järkytystä.",
  }),
  arkistonOsio("ulkomaiset-mestarit", {
    title: "Ulkomaiset mestarit",
    lead:
      "Suomen mestareiden rinnalle arkisto on koonnut kahden jalkapallomaan " +
      "mestaruushistorian: Englannin ja Venäjän mestarit sekä Englannin seurojen " +
      "kokonaismäärät.",
    description:
      "Englannin ja Venäjän jalkapallomestarit vuosi vuodelta sekä Englannin seurojen mestaruudet ja cupvoitot taulukoina.",
    kortti: "Englannin ja Venäjän mestarit sekä Englannin seurojen mestaruudet ja cupvoitot.",
  }),
  arkistonOsio("palloliitto", {
    title: "Palloliiton puheenjohtajat",
    lead:
      "Suomen Palloliiton puheenjohtajat kausittain. Taulukko on osa klubin " +
      "jalkapalloarkistoa, ei klubin omaa hallintoa — klubin hallitus löytyy " +
      "Klubi-osiosta.",
    description:
      "Suomen Palloliiton puheenjohtajat kausittain taulukkona Lahden Suomalaisen Klubin jalkapalloarkistossa.",
    kortti: "Suomen Palloliiton puheenjohtajat kausittain.",
  }),
  arkistonOsio("stadionit", {
    title: "Stadionit",
    lead:
      "Jalkapallostadionit, joilla Huuhkajat ja klubin matkat ovat käyneet. " +
      "Stadionit on ryhmitelty maan mukaan, Suomi ensin.",
    description: null,
    kortti: "Jalkapallostadionit, joilla klubi on vieraillut tai joita arkisto käsittelee.",
  }),
  arkistonOsio("tilastot", {
    title: "Muut tilastot",
    lead:
      "Erilliset koosteet, joilla on arkistossa oma sivunsa: muistelut, " +
      "havainnot ja listat, jotka eivät kuulu yksittäiseen sarjaan tai kisaan.",
    description:
      "Jalkapalloarkiston erilliset koosteet, jotka eivät kuulu mihinkään sarjaan: unohtumattomat ottelut ja puutteelliset järjestelyt.",
    kortti: "Unohtumattomat ottelut ja puutteelliset järjestelyt omina koosteinaan.",
  }),
];

export const OSIOSIVU_SLUGIT: ReadonlySet<string> = new Set(OSIOSIVUT.map((o) => o.slug));

const REKISTERI = new Map<string, OsioSivu>(OSIOSIVUT.map((o) => [o.slug, o]));

/** Kiinteä tunnus: "sivu-" + polku, jossa "/" → "-" (sama kuin productionin sivu-klubi-palloveikkaus). */
export function osioSivuId(slug: string): string {
  return `sivu-${slug.replaceAll("/", "-")}`;
}

export function osioSivu(slug: string | null | undefined): OsioSivu | undefined {
  return slug ? REKISTERI.get(slug) : undefined;
}

/** Tiivistelmä on pakollinen, kun koodissa on ollut johdanto: tyhjää johdantoa ei voi julkaista. */
export function johdantoPakollinen(o: OsioSivu): boolean {
  return o.oletus.lead !== null;
}

function onArvo(arvo: unknown): boolean {
  if (arvo === undefined || arvo === null) return false;
  if (Array.isArray(arvo)) return arvo.length > 0;
  if (typeof arvo === "string") return arvo.trim().length > 0;
  return true;
}

/**
 * Piilotetaanko kenttä Studiossa: kyllä, kun sivu on osiosivu, joka ei käytä
 * kenttää, eikä kentässä ole arvoa. Olemassa oleva data pysyy aina näkyvissä.
 */
export function piilotaKentta(slug: string | null | undefined, kentta: OsioSivunKentta, arvo: unknown): boolean {
  const o = osioSivu(slug);
  if (!o) return false;
  return !o.kentat.includes(kentta) && !onArvo(arvo);
}

/* ── Tekstien ratkaisu ──────────────────────────────────────────────────── */

/** Dokumentin kentät, joita sivut lukevat (sanity/lib/osiosivu.ts osioSivuQuery). */
export interface OsioSivuDoc {
  _updatedAt?: string | null;
  title?: string | null;
  tiivistelma?: string | null;
  ingress?: string | null;
  korttiteksti?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface OsioSivunTekstit {
  /** Otsikko sivulla. */
  title: string;
  /** Johdanto otsikon alla; null = ei johdantoa. */
  lead: string | null;
  /** Hakukonekuvaus; null = sivuston yleinen kuvaus. */
  description: string | null;
  /** Otsikko hakutuloksissa ja selaimen välilehdellä. */
  seoTitle: string;
  /** Arkiston etusivun kortin teksti. */
  korttiteksti: string | null;
  updatedAt: string | null;
  /** Onko dokumentti olemassa. */
  loytyi: boolean;
}

/** Trimmattu arvo; tyhjä tai pelkät välilyönnit = null. */
function t(arvo: string | null | undefined): string | null {
  const siisti = arvo?.trim();
  return siisti ? siisti : null;
}

/**
 * Sivun tekstit dokumentista, oletuksena rekisterin teksti kenttäkohtaisesti.
 * Kun dokumentti on olemassa, hakukonekuvaus seuraa johdantoa (Hakukoneet ja
 * jako -välilehden lupaus "jos tyhjä, käytetään sivun alussa näkyvää tekstiä").
 * Stegan puhdistus tehdään `buildMetadata`-funktiossa.
 */
export function ratkaiseOsioSivu(doc: OsioSivuDoc | null | undefined, o: OsioSivu): OsioSivunTekstit {
  const loytyi = doc !== null && doc !== undefined;
  const title = t(doc?.title) ?? o.oletus.title;
  const lead = t(doc?.tiivistelma) ?? t(doc?.ingress) ?? o.oletus.lead;
  const description = loytyi
    ? (t(doc?.seoDescription) ?? lead ?? o.oletus.description)
    : (o.oletus.description ?? o.oletus.lead);
  return {
    title,
    lead,
    description,
    seoTitle: t(doc?.seoTitle) ?? o.oletus.seoTitle ?? title,
    korttiteksti: t(doc?.korttiteksti) ?? o.oletus.kortti ?? null,
    updatedAt: doc?._updatedAt ?? null,
    loytyi,
  };
}

/* ── Dokumenttien luonti (scripts/luo-osiosivut.ts, Studion mallipohja) ── */

export interface OsioSivuSiemen {
  _id: string;
  _type: "sivu";
  title: string;
  slug: { _type: "slug"; current: string };
  tiivistelma?: string;
  seoTitle?: string;
  seoDescription?: string;
  korttiteksti?: string;
}

/**
 * Uuden osiosivun sisältö koodin oletuksista. Avaimet, joiden arvo puuttuu,
 * jätetään pois. Hakukonekuvaus kirjoitetaan aina, kun se eroaa johdannosta
 * (docs/24 Liite A, K1): muuten Googlen kuvaus vaihtuisi pitkäksi johdannoksi.
 */
export function osioSivuSiemen(o: OsioSivu): OsioSivuSiemen {
  const { title, lead, description, seoTitle, kortti } = o.oletus;
  const siemen: OsioSivuSiemen = {
    _id: osioSivuId(o.slug),
    _type: "sivu",
    title,
    slug: { _type: "slug", current: o.slug },
  };
  if (lead !== null) siemen.tiivistelma = lead;
  if (seoTitle !== undefined) siemen.seoTitle = seoTitle;
  if (description !== null && description !== lead) siemen.seoDescription = description;
  if (kortti !== undefined) siemen.korttiteksti = kortti;
  return siemen;
}

export interface OsioSivujenLuokitus {
  luotavat: OsioSivu[];
  olemassa: OsioSivu[];
  /** Selitys jokaisesta ristiriidasta (ajo keskeytetään). */
  ristiriidat: string[];
}

/**
 * Datasetin `sivu`-dokumentit (rekisterin poluilla tai tunnuksilla) →
 * luotavat, jo olemassa olevat ja ristiriidat. Luonnos (`drafts.`) lasketaan
 * olemassa olevaksi. Ristiriita: rekisterin tunnuksella on dokumentti väärällä
 * polulla, tai rekisterin polulla on dokumentti väärällä tunnuksella.
 */
export function luokitteleOsioSivut(rivit: readonly { _id: string; slug: string | null }[]): OsioSivujenLuokitus {
  const luotavat: OsioSivu[] = [];
  const olemassa: OsioSivu[] = [];
  const ristiriidat: string[] = [];
  const siistit = rivit.map((r) => ({ id: r._id.replace(/^drafts\./, ""), alkuperainen: r._id, slug: r.slug }));

  for (const o of OSIOSIVUT) {
    const id = osioSivuId(o.slug);
    let ristiriita = false;
    for (const r of siistit) {
      if (r.id === id && r.slug !== o.slug) {
        ristiriidat.push(`${r.alkuperainen}: tunnus kuuluu polulle /${o.slug}, mutta dokumentin osoite on ${r.slug ? `/${r.slug}` : "tyhjä"}`);
        ristiriita = true;
      } else if (r.slug === o.slug && r.id !== id) {
        ristiriidat.push(`${r.alkuperainen}: polulla /${o.slug} on dokumentti, jonka tunnus ei ole ${id}`);
        ristiriita = true;
      }
    }
    if (ristiriita) continue;
    if (siistit.some((r) => r.id === id)) olemassa.push(o);
    else luotavat.push(o);
  }
  return { luotavat, olemassa, ristiriidat };
}
