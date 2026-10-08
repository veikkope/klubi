/**
 * Sivuston tila Studion Aloitus-näkymään (docs/24 askel 7, docs/23 Y33).
 *
 * Yöllinen huolto ja viikkovarmuuskopio kirjaavat tuloksensa järjestelmä-
 * dokumentteihin `sivustonTila.huolto` ja `sivustonTila.varmuuskopio`
 * (sanity/lib/kirjaa-ajo.ts). Aloitus lukee ne Studion istunnolla ja näyttää
 * liikennevalot näiden sääntöjen mukaan. Ulkoista valvontaa ei ole
 * (päätös 8.10.2026): tila näkyy, kun Studio avataan.
 *
 * Puhdas moduuli (vain suhteelliset tuonnit): testataan komennolla
 * `npm run test:sivuston-tila`.
 */

export const TILA_ID = { huolto: "sivustonTila.huolto", varmuuskopio: "sivustonTila.varmuuskopio" } as const;

/** Projektin dokumenttikiintiö (Sanity Free, docs/23 Y4). */
export const KIINTIO = 10_000;

/** Datasetit, joista kiintiö lasketaan (sama projekti, yhteinen raja). */
export const DATASETIT = ["production", "development"] as const;

export type Tila = "ok" | "huomio" | "virhe" | "tuntematon";
export type TilaRivi = { id: string; otsikko: string; tila: Tila; teksti: string; ohje?: string };
export type AjonTulos = { nimi: string; tila: "ok" | "huomio" | "virhe"; viesti: string; maara?: number };
export type AjoDokumentti = {
  aika?: string;
  onnistui?: boolean;
  viimeisinOnnistunut?: string;
  tulokset?: AjonTulos[];
} | null;

const TUNTI_MS = 60 * 60 * 1000;
const PAIVA_MS = 24 * TUNTI_MS;

/** Varmuuskopio saa olla enintään näin vanha (viikkokopio + vuorokauden pelivara). */
export const VARMUUSKOPIO_ENINTAAN_PAIVAA = 8;
/** Huolto käy joka yö; 30 tuntia sallii yhden myöhästymisen muttei väliin jäänyttä yötä. */
export const HUOLTO_ENINTAAN_TUNTIA = 30;

const ohjeTukihenkilolle = "Kerro tukihenkilölle.";

// ── Apurit ───────────────────────────────────────────────────────────────────

const helsinkiPaiva = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Helsinki" });
const helsinkiKello = new Intl.DateTimeFormat("fi-FI", {
  timeZone: "Europe/Helsinki",
  hour: "numeric",
  minute: "2-digit",
});
const helsinkiTunti = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Helsinki", hour: "2-digit", hourCycle: "h23" });
const helsinkiKuukausi = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Helsinki", month: "numeric" });
const VIIKONPAIVAT = ["su", "ma", "ti", "ke", "to", "pe", "la"];

/** Helsingin kalenteripäivä muodossa 2026-10-08. */
export function paivaHelsingissa(aika: Date): string {
  return helsinkiPaiva.format(aika);
}

/** Kalenteripäivien erotus Helsingin aikaa (päivämäärä "2026-10-05" tai aikaleima). */
export function ikaPaivina(paiva: string, nyt: Date): number {
  const alku = /^\d{4}-\d{2}-\d{2}$/.test(paiva) ? paiva : paivaHelsingissa(new Date(paiva));
  const loppu = paivaHelsingissa(nyt);
  return Math.round((Date.parse(`${loppu}T00:00:00Z`) - Date.parse(`${alku}T00:00:00Z`)) / PAIVA_MS);
}

/** "ma 5.10.2026" päivämäärästä "2026-10-05". */
export function pvmSuomeksi(paiva: string): string {
  const [v, k, p] = paiva.split("-").map(Number);
  const viikonpaiva = VIIKONPAIVAT[new Date(Date.UTC(v, k - 1, p)).getUTCDay()];
  return `${viikonpaiva} ${p}.${k}.${v}`;
}

/** "5.02" Helsingin aikaa. */
function kello(aika: Date): string {
  return helsinkiKello.format(aika).replace(":", ".");
}

/** "tänä aamuna klo 5.02", "tänään klo 14.10", "eilen klo 5.02" tai "ma 5.10.2026 klo 5.02". */
export function ajankohta(aika: Date, nyt: Date): string {
  const ika = ikaPaivina(aika.toISOString(), nyt);
  const klo = `klo ${kello(aika)}`;
  if (ika === 0) return Number(helsinkiTunti.format(aika)) < 12 ? `tänä aamuna ${klo}` : `tänään ${klo}`;
  if (ika === 1) return `eilen ${klo}`;
  return `${pvmSuomeksi(paivaHelsingissa(aika))} ${klo}`;
}

function paiviaSitten(n: number): string {
  if (n <= 0) return "tänään";
  if (n === 1) return "eilen";
  return `${n} päivää sitten`;
}

/** 7679 → "7 679" (sitova välilyönti). */
export function luku(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, String.fromCharCode(0xa0));
}

function ilmanPistetta(teksti: string): string {
  return teksti.trim().replace(/\.+$/, "");
}

function tulos(ajo: AjoDokumentti, nimi: string): AjonTulos | undefined {
  return ajo?.tulokset?.find((t) => t?.nimi === nimi);
}

// ── Rivit ────────────────────────────────────────────────────────────────────

const VARMUUSKOPIO_OHJE =
  "Ajastus ei ole käynyt tai se epäonnistui. Kerro tukihenkilölle: Vercel → Cron Jobs → /api/varmuuskopio. " +
  "Sisältösi on tallessa, mutta palautus vanhaan versioon ei ole mahdollinen ilman tuoretta kopiota.";

export function varmuuskopionTila(
  viimeisin: { paiva?: string | null; dokumentteja?: number | null } | null,
  ajo: AjoDokumentti,
  nyt: Date,
): TilaRivi {
  const rivi = { id: "varmuuskopio", otsikko: "Varmuuskopio" };
  const paiva = viimeisin?.paiva ?? null;

  // Epäonnistunut ajo, joka on uudempi kuin viimeisin kopio.
  if (ajo?.onnistui === false && ajo.aika && (!paiva || paivaHelsingissa(new Date(ajo.aika)) >= paiva)) {
    const syy = ajo.tulokset?.find((t) => t?.tila === "virhe")?.viesti ?? ajo.tulokset?.[0]?.viesti;
    return {
      ...rivi,
      tila: "virhe",
      teksti: `Viikkovarmuuskopio epäonnistui ${ajankohta(new Date(ajo.aika), nyt)}${syy ? `: ${ilmanPistetta(syy)}` : ""}.`,
      ohje: VARMUUSKOPIO_OHJE,
    };
  }
  if (!paiva) {
    return { ...rivi, tila: "virhe", teksti: "Viikkovarmuuskopiota ei ole vielä tehty.", ohje: VARMUUSKOPIO_OHJE };
  }
  const ika = ikaPaivina(paiva, nyt);
  if (ika > VARMUUSKOPIO_ENINTAAN_PAIVAA) {
    return { ...rivi, tila: "virhe", teksti: `Viikkovarmuuskopiota ei ole tehty ${ika} päivään.`, ohje: VARMUUSKOPIO_OHJE };
  }
  const maara = viimeisin?.dokumentteja ? `, ${luku(viimeisin.dokumentteja)} dokumenttia` : "";
  const teksti = `Viimeisin kopio ${pvmSuomeksi(paiva)} (${paiviaSitten(ika)})${maara}.`;
  // Kopio on tallessa, mutta jokin sivutehtävä (vanhojen kierto) epäonnistui: huomio, ei virhe.
  const huomiot =
    ajo?.onnistui !== false && ajo?.aika && paivaHelsingissa(new Date(ajo.aika)) >= paiva
      ? (ajo.tulokset ?? []).filter((t) => t?.tila === "huomio")
      : [];
  if (huomiot.length > 0) {
    return {
      ...rivi,
      tila: "huomio",
      teksti: `${teksti} ${huomiot.map((t) => `${ilmanPistetta(t.viesti)}.`).join(" ")}`,
      ohje: "Kopio on tallessa, ja palautus toimii. Jos tämä toistuu, kerro tukihenkilölle.",
    };
  }
  return { ...rivi, tila: "ok", teksti };
}

export function huollonTila(ajo: AjoDokumentti, nyt: Date): TilaRivi {
  const rivi = { id: "huolto", otsikko: "Yöllinen huolto" };
  if (!ajo?.aika) {
    return { ...rivi, tila: "tuntematon", teksti: "Huoltoa ei ole vielä kirjattu. Tieto tulee ensimmäisen yön jälkeen." };
  }
  const aika = new Date(ajo.aika);
  const tunteja = (nyt.getTime() - aika.getTime()) / TUNTI_MS;
  if (tunteja > HUOLTO_ENINTAAN_TUNTIA) {
    const vrk = Math.max(1, Math.floor(tunteja / 24));
    return {
      ...rivi,
      tila: "virhe",
      teksti: `Yöllinen huolto ei ole käynyt ${vrk} vuorokauteen.`,
      ohje:
        "Ravintoloiden arvosanat, arvostelukuvien siivous ja käyttämättömien tiedostojen siivous odottavat. " +
        ohjeTukihenkilolle,
    };
  }
  // Otteluhaku on ulkoinen palvelu: sillä on oma rivinsä, eikä se ole huollon vika.
  const omat = (ajo.tulokset ?? []).filter((t) => t && t.nimi !== "otteluhaku");
  if (ajo.onnistui === false) {
    const viestit = omat.filter((t) => t.tila === "virhe").map((t) => t.viesti);
    return {
      ...rivi,
      tila: "virhe",
      teksti: `Huolto epäonnistui ${ajankohta(aika, nyt)}${viestit.length ? `: ${viestit.map(ilmanPistetta).join(". ")}` : ""}.`,
      ohje: ohjeTukihenkilolle,
    };
  }
  const arvosanat = tulos(ajo, "arvosanat")?.maara ?? 0;
  const kuvat = tulos(ajo, "kuvat")?.maara ?? 0;
  const tiedostot = tulos(ajo, "tiedostot");
  if (arvosanat > 0) {
    return {
      ...rivi,
      tila: "huomio",
      teksti:
        `Huolto joutui korjaamaan ${arvosanat} ravintolan arvosanan ${ajankohta(aika, nyt)}. ` +
        "Sanityn päivitysviesti sivustolle on voinut epäonnistua.",
      ohje: "Jos tämä toistuu useana yönä, kerro tukihenkilölle.",
    };
  }
  const huomiot = omat.filter((t) => t.tila === "huomio");
  if (huomiot.length > 0) {
    return {
      ...rivi,
      tila: "huomio",
      teksti: `Huolto ${ajankohta(aika, nyt)}: ${huomiot.map((t) => ilmanPistetta(t.viesti)).join(". ")}.`,
      ohje: "Huolto yrittää uudelleen ensi yönä. Jos tämä toistuu, kerro tukihenkilölle.",
    };
  }
  return {
    ...rivi,
    tila: "ok",
    teksti:
      `Viimeksi ${ajankohta(aika, nyt)}. Arvosanoja korjattu 0, vanhoja arvostelukuvia poistettu ${kuvat}` +
      (tiedostot ? `, käyttämättömiä tiedostoja poistettu ${tiedostot.maara ?? 0}.` : "."),
  };
}

const OTTELUHAKU_OHJE =
  "Ottelut-sivulla ja etusivulla näkyvät vain Studioon lisätyt ottelut. " +
  "Lisää tärkeät ottelut käsin (Ottelut → +) ja kerro tukihenkilölle.";

export function otteluhaunTila(ajo: AjoDokumentti, nyt: Date): TilaRivi {
  const rivi = { id: "otteluhaku", otsikko: "Otteluohjelman haku" };
  const haku = tulos(ajo, "otteluhaku");
  if (!haku) {
    return { ...rivi, tila: "tuntematon", teksti: "Hakua ei ole vielä kirjattu. Tieto tulee yöllisen huollon jälkeen." };
  }
  if (haku.tila === "virhe") {
    return {
      ...rivi,
      tila: "virhe",
      teksti: `Otteluohjelman haku epäonnistui: ${ilmanPistetta(haku.viesti)}.`,
      ohje: OTTELUHAKU_OHJE,
    };
  }
  if ((haku.maara ?? 0) === 0) {
    const kuukausi = Number(helsinkiKuukausi.format(nyt));
    if (kuukausi >= 3 && kuukausi <= 10) {
      return { ...rivi, tila: "huomio", teksti: "Haku onnistui, mutta otteluita ei löytynyt.", ohje: OTTELUHAKU_OHJE };
    }
    return { ...rivi, tila: "ok", teksti: "Talvitauko: uuden kauden otteluohjelmaa ei ole vielä julkaistu." };
  }
  return { ...rivi, tila: "ok", teksti: haku.viesti.endsWith(".") ? haku.viesti : `${haku.viesti}.` };
}

/** Otteluhaun tulosrivin viesti huollolle: "Veikkausliiga: 198 ottelua, joista 12 tulevaa". */
export function otteluhaunViesti(lahde: string, maara: number, tulevia: number): string {
  return `${lahde}: ${maara} ottelua, joista ${tulevia} tulevaa`;
}

/**
 * Dokumenttikiintiö on **arvio**, kunnes laskentatapa on vahvistettu Sanityn
 * Usage-sivulta (docs/23 Y4, docs/24 P7): tila on enintään huomio, ei koskaan
 * virhe eikä vihreä ok. Alle 80 %: tuntematon (harmaa, ei nosta kokonaistilaa).
 */
export function kiintionTila(
  kaytossa: number | null,
  raja: number = KIINTIO,
  { vainTamaDatasetti = false }: { vainTamaDatasetti?: boolean } = {},
): TilaRivi {
  const rivi = { id: "kiintio", otsikko: "Dokumenttikiintiö (arvio)" };
  if (kaytossa === null || !Number.isFinite(kaytossa) || raja <= 0) {
    return { ...rivi, tila: "tuntematon", teksti: "Dokumenttien määrää ei voitu laskea." };
  }
  const osuus = kaytossa / raja;
  const teksti =
    `Arviolta ${luku(kaytossa)} / ${luku(raja)} dokumenttia (${Math.round(osuus * 100)} %)` +
    `${vainTamaDatasetti ? " (vain tämä datasetti)" : ""}.`;
  if (osuus < 0.8) return { ...rivi, tila: "tuntematon", teksti };
  return {
    ...rivi,
    tila: "huomio",
    teksti,
    ohje:
      "Kun raja täyttyy, uusia uutisia ei voi tallentaa. Kerro tukihenkilölle: kehitysdatasetin " +
      "voi tyhjentää (docs/23 Y4).",
  };
}

export function julkaisemattomienTila(maara: number): TilaRivi {
  const rivi = { id: "julkaisemattomat", otsikko: "Julkaisemattomat muutokset" };
  if (!maara) return { ...rivi, tila: "ok", teksti: "Kaikki muutokset on julkaistu." };
  return {
    ...rivi,
    tila: "huomio",
    teksti:
      maara === 1
        ? "Yhdessä dokumentissa on muutos, jota ei ole julkaistu. Sivustolla näkyy siinä yhä vanha versio."
        : `${maara} dokumentissa on muutos, jota ei ole julkaistu. Sivustolla näkyy niissä yhä vanha versio.`,
    ohje: "Avaa lista, tarkista muutokset ja paina Julkaise, tai hylkää muutos (⋯ → Hylkää muutokset).",
  };
}

const VAKAVUUS: Record<Tila, number> = { tuntematon: -1, ok: 0, huomio: 1, virhe: 2 };

/** Pahin tila. Tuntematon ei nosta tilaa; pelkät tuntemattomat → tuntematon. */
export function kokonaistila(rivit: readonly TilaRivi[]): Tila {
  let pahin: Tila = "tuntematon";
  for (const r of rivit) if (VAKAVUUS[r.tila] > VAKAVUUS[pahin]) pahin = r.tila;
  return pahin;
}

/** Cronin kirjaus dokumenttiin (sanity/lib/kirjaa-ajo.ts). */
export function huoltoajonKirjaus(tulokset: readonly AjonTulos[], onnistui: boolean, nyt: Date) {
  const aika = nyt.toISOString();
  return {
    aika,
    onnistui,
    tulokset: tulokset.map((t) => ({ _key: t.nimi, ...t })),
    ...(onnistui ? { viimeisinOnnistunut: aika } : {}),
  };
}

export type Perustiedot = {
  sahkoposti?: boolean | null;
  osoite?: boolean | null;
  puhelin?: boolean | null;
  hallitus?: number | null;
  esittelykuva?: boolean | null;
};

export type PuuttuvaTieto = { id: string; teksti: string; kohde: "yhteystiedot" | "hallitus" | "etusivu" };

export function puuttuvatPerustiedot(p: Perustiedot | null | undefined): PuuttuvaTieto[] {
  if (!p) return [];
  const puuttuvat: PuuttuvaTieto[] = [];
  if (p.sahkoposti === false)
    puuttuvat.push({ id: "sahkoposti", teksti: "Klubin sähköpostiosoite puuttuu (Yhteystiedot).", kohde: "yhteystiedot" });
  if (p.osoite === false) puuttuvat.push({ id: "osoite", teksti: "Postiosoite puuttuu (Yhteystiedot).", kohde: "yhteystiedot" });
  if (p.puhelin === false)
    puuttuvat.push({ id: "puhelin", teksti: "Puhelinnumero puuttuu (Yhteystiedot).", kohde: "yhteystiedot" });
  if (p.hallitus === 0)
    puuttuvat.push({ id: "hallitus", teksti: "Hallituksen jäseniä ei ole lisätty (Hallitus).", kohde: "hallitus" });
  if (p.esittelykuva === false)
    puuttuvat.push({
      id: "esittelykuva",
      teksti: "Etusivun Klubista-lohkosta puuttuu kuva (Etusivu → Lohkot).",
      kohde: "etusivu",
    });
  return puuttuvat;
}
