/**
 * Ravintolan arvosana klubilaisten arvosanoista.
 *
 * Säännöt (päätetty 3.10.2026, docs/21):
 *  - Klubilaisen arvosana on joko `klubiArvio` (ruokailutaulukosta tuotu tai
 *    Studiossa lisätty) tai hyväksytty lomakkeen arvostelu, joka on liitetty
 *    klubilaiseen (`arvioija`).
 *  - Jokaisella klubilaisella on yksi voimassa oleva arvosana ravintolaa
 *    kohden: uusin korvaa vanhemman. Samana päivänä lomakkeen arvostelu
 *    voittaa, koska se on tuoreempi tieto kuin taulukon rivi.
 *  - Ei painotuksia: klubilaisen kokonaisarvosana on ruoan, hinnan ja
 *    viihtyvyyden keskiarvo, ja ravintolan arvosanat ovat klubilaisten
 *    arvosanojen keskiarvoja.
 *  - Ulkopuolisten (ei klubilaiseen liitettyjen) arvostelut näkyvät sivulla,
 *    mutta eivät vaikuta arvosanaan.
 *  - Ravintola, jolla on vanhan sivuston arvosana mutta ei ruokailutaulukon
 *    arvosanoja, pitää vanhan arvonsa: muuten yksi uusi arvio korvaisi
 *    usean arvioijan keskiarvon.
 *
 * Laskettu arvo tallennetaan ravintolan omiin arvosanakenttiin, joten listat,
 * suodattimet, top-listat ja JSON-LD toimivat sellaisinaan. Laskennan
 * käynnistää Sanityn webhook (app/api/revalidate) aina, kun arvosana tai
 * arvostelu muuttuu, sekä `npm run laske:arvosanat`.
 */
import type { Patch, SanityClient } from "@sanity/client";

export type Arvosanat = {
  ratingOverall: number | null;
  ratingFood: number | null;
  ratingPrice: number | null;
  ratingAtmosphere: number | null;
};

export type KlubilaisenArvio = {
  /** Klubilaisen _id. */
  arvioija: string;
  nimi?: string | null;
  ratingFood?: number | null;
  ratingPrice?: number | null;
  ratingAtmosphere?: number | null;
  /** `klubiArvio.paiva`, lomakkeen `kayntipaiva` (päivä) tai vanhan lomakkeen `submittedAt` (aikaleima). */
  paiva?: string | null;
  /** Ruokailutaulukosta tuotu. */
  tuotu?: boolean | null;
  lahde: "arvosana" | "arvostelu";
};

export type VoimassaOlevaArvio = KlubilaisenArvio & {
  /** Helsingin päivä, "YYYY-MM-DD". */
  pvm: string | null;
  /** Ruoan, hinnan ja viihtyvyyden keskiarvo. */
  kokonais: number | null;
};

export type ArvosananTulos = {
  arvosanat: Arvosanat;
  /** Klubilaisia, joiden arvosana on laskettu mukaan. */
  arvioijia: number;
  /** Tuoreimman voimassa olevan arvosanan päivä (Helsingin aikaa). */
  viimeisinArvio: string | null;
};

const helsinkiPaiva = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Helsinki",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "2026-09-30" sellaisenaan, aikaleima Helsingin päiväksi. */
export function paivaksi(arvo: string | null | undefined): string | null {
  if (!arvo) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(arvo)) return arvo;
  const aika = Date.parse(arvo);
  return Number.isNaN(aika) ? null : helsinkiPaiva.format(new Date(aika));
}

export function keskiarvo(arvot: (number | null | undefined)[]): number | null {
  const luvut = arvot.filter((x): x is number => typeof x === "number" && Number.isFinite(x));
  return luvut.length === 0 ? null : luvut.reduce((a, b) => a + b, 0) / luvut.length;
}

// Pieni lisä: liukulukuvirhe (2,85 = 2,8499…) ei saa pyöristää alaspäin.
const yksiDesimaali = (x: number | null) => (x === null ? null : Math.round(x * 10 + 1e-9) / 10);

/** Järjestysavain: päivä, sitten lomake ennen taulukkoa, sitten aikaleima. */
function tuoreus(a: KlubilaisenArvio): string {
  return `${paivaksi(a.paiva) ?? ""}|${a.lahde === "arvostelu" ? 1 : 0}|${a.paiva ?? ""}`;
}

/** Kunkin klubilaisen uusin arvosana, nimen mukaan järjestettynä. */
export function voimassaOlevat(arviot: KlubilaisenArvio[]): VoimassaOlevaArvio[] {
  const uusin = new Map<string, KlubilaisenArvio>();
  for (const a of arviot) {
    const edellinen = uusin.get(a.arvioija);
    if (!edellinen || tuoreus(a) > tuoreus(edellinen)) uusin.set(a.arvioija, a);
  }
  return [...uusin.values()]
    .map((a) => ({
      ...a,
      pvm: paivaksi(a.paiva),
      kokonais: keskiarvo([a.ratingFood, a.ratingPrice, a.ratingAtmosphere]),
    }))
    .sort((a, b) => (a.nimi ?? "").localeCompare(b.nimi ?? "", "fi"));
}

export function laskeArvosana(arviot: KlubilaisenArvio[]): ArvosananTulos {
  const voimassa = voimassaOlevat(arviot);
  const paivat = voimassa.map((a) => a.pvm).filter((p): p is string => p !== null).sort();
  return {
    arvosanat: {
      ratingOverall: yksiDesimaali(keskiarvo(voimassa.map((a) => a.kokonais))),
      ratingFood: yksiDesimaali(keskiarvo(voimassa.map((a) => a.ratingFood))),
      ratingPrice: yksiDesimaali(keskiarvo(voimassa.map((a) => a.ratingPrice))),
      ratingAtmosphere: yksiDesimaali(keskiarvo(voimassa.map((a) => a.ratingAtmosphere))),
    },
    arvioijia: voimassa.length,
    viimeisinArvio: paivat.at(-1) ?? null,
  };
}

/** Onko arvosanoissa yhtään arvoa. */
export function onArvio(a: Partial<Arvosanat> | null | undefined): a is Arvosanat {
  return Boolean(
    a && [a.ratingOverall, a.ratingFood, a.ratingPrice, a.ratingAtmosphere].some((x) => typeof x === "number"),
  );
}

/**
 * Lasketaanko ravintolan arvosana automaattisesti: klubilaisten arvosanoja on,
 * ja joko jokin niistä on ruokailutaulukosta (taulukko kattaa vanhan
 * arvosanan arvioijat) tai ravintolalla ei ole vanhaa arvosanaa.
 */
export function automaattinen(alkuperainen: Arvosanat | null, arviot: KlubilaisenArvio[]): boolean {
  return arviot.length > 0 && (arviot.some((a) => a.tuotu) || !onArvio(alkuperainen));
}

/* ── GROQ ───────────────────────────────────────────────────────────────── */

/** Klubin sääntö: ravintola julkaistaan, kun sillä on vähintään kaksi klubilaista arvioijaa. */
export const VAHIMMAISARVIOIJAT = 2;

/**
 * Näkyykö ravintola sivustolla (ehto ravintoladokumentille):
 *  - laskettu arvosana vähintään kahdelta klubilaiselta, tai
 *  - vanhan sivuston arvosana ilman laskentaa (julkaistu jo ennen tätä,
 *    arvioijamäärä ei tiedossa).
 * Yhden arvioijan ja kokonaan arvioimaton ravintola odottaa Studiossa
 * piilossa ja tulee näkyviin, kun toinen klubilainen arvioi sen.
 */
export const JULKINEN_RAVINTOLA = /* groq */ `(
  automaattinenArvosana.arvioijia >= ${VAHIMMAISARVIOIJAT}
  || (!defined(automaattinenArvosana) && (defined(ratingOverall) || defined(stars)))
)`;

/**
 * Ravintolan klubilaisten arvosanat (`^._id` = ravintola). Vain julkaistut:
 * luonnos ei vaikuta ennen kuin se hyväksytään.
 */
export const KLUBILAISTEN_ARVIOT = /* groq */ `[
  ...*[_type == "klubiArvio" && !(_id in path("drafts.**")) && ravintola._ref == ^._id && defined(arvioija)]{
    "arvioija": arvioija._ref, "nimi": arvioija->nimi,
    ratingFood, ratingPrice, ratingAtmosphere, paiva, tuotu, "lahde": "arvosana"
  },
  ...*[_type == "ravintolaKayttajaArvostelu" && !(_id in path("drafts.**")) && restaurant._ref == ^._id && defined(arvioija)]{
    "arvioija": arvioija._ref, "nimi": arvioija->nimi,
    ratingFood, ratingPrice, ratingAtmosphere,
    // Käyntipäivä; vanhoissa arvosteluissa sitä ei ole, joten lähetysaika.
    "paiva": coalesce(kayntipaiva, submittedAt), "tuotu": false, "lahde": "arvostelu"
  }
]`;

/* ── Päivitys Sanityyn ──────────────────────────────────────────────────── */

type RavintolaRivi = Arvosanat & {
  _id: string;
  _rev: string;
  name: string;
  /** Vanhojen ravintoloiden karkea arvosana, kun `ratingOverall` puuttuu. */
  stars: number | null;
  luonnos: { _id: string; _rev: string } | null;
  alkuperainenArvio: Arvosanat | null;
  automaattinenArvosana: { arvioijia?: number; viimeisinArvio?: string | null } | null;
  arviot: KlubilaisenArvio[];
};

export type ArvosananMuutos = {
  _id: string;
  name: string;
  ennen: Arvosanat;
  jalkeen: Arvosanat;
  arvioijia: number;
};

const PAIVITETTAVAT = /* groq */ `*[_type == "ravintola" && !(_id in path("drafts.**"))
  && (defined(automaattinenArvosana)
    || count(*[_type == "klubiArvio" && !(_id in path("drafts.**")) && ravintola._ref == ^._id]) > 0
    || count(*[_type == "ravintolaKayttajaArvostelu" && !(_id in path("drafts.**"))
        && restaurant._ref == ^._id && defined(arvioija)]) > 0)]{
  _id, _rev, name, stars, ratingOverall, ratingFood, ratingPrice, ratingAtmosphere,
  alkuperainenArvio, automaattinenArvosana,
  "luonnos": *[_id == "drafts." + ^._id][0]{ _id, _rev },
  "arviot": ${KLUBILAISTEN_ARVIOT}
}`;

const AVAIMET = ["ratingOverall", "ratingFood", "ratingPrice", "ratingAtmosphere"] as const;

function arvosanatKentista(a: Partial<Arvosanat> | null | undefined): Arvosanat {
  return {
    ratingOverall: a?.ratingOverall ?? null,
    ratingFood: a?.ratingFood ?? null,
    ratingPrice: a?.ratingPrice ?? null,
    ratingAtmosphere: a?.ratingAtmosphere ?? null,
  };
}

/** Arvosanat patchiksi: arvot asetetaan, puuttuvat poistetaan. */
function arvosanaPatch(p: Patch, a: Arvosanat): Patch {
  const asetettavat = Object.fromEntries(AVAIMET.filter((k) => a[k] !== null).map((k) => [k, a[k]]));
  const poistettavat = AVAIMET.filter((k) => a[k] === null);
  let tulos = Object.keys(asetettavat).length > 0 ? p.set(asetettavat) : p;
  if (poistettavat.length > 0) tulos = tulos.unset([...poistettavat]);
  return tulos;
}

/**
 * Laskee arvosanat ravintoloille, joilla on klubilaisten arvosanoja tai
 * aiemmin laskettu arvosana (viimeisen arvosanan poisto palauttaa vanhan).
 * Kirjoittaa vain muuttuneet. `kuiva`: ei kirjoita.
 *
 * Jos ravintolasta on Studiossa keskeneräinen luonnos, sekin päivitetään,
 * ettei luonnoksen julkaisu palauta vanhaa arvosanaa.
 */
export async function paivitaArvosanat(client: SanityClient, { kuiva = false } = {}): Promise<ArvosananMuutos[]> {
  const rivit = await client.fetch<RavintolaRivi[]>(PAIVITETTAVAT);
  const muutokset: ArvosananMuutos[] = [];
  const tx = client.transaction();

  for (const r of rivit) {
    const ennen = arvosanatKentista(r);
    // Ensimmäisellä kerralla nykyinen (vanhan sivuston) arvosana otetaan talteen;
    // pelkät tähdet käyvät kokonaisarvosanaksi.
    const alkuperainen = r.automaattinenArvosana
      ? arvosanatKentista(r.alkuperainenArvio)
      : { ...ennen, ratingOverall: ennen.ratingOverall ?? r.stars ?? null };
    const tulos = automaattinen(alkuperainen, r.arviot) ? laskeArvosana(r.arviot) : null;

    // Ravintola, joka ei ole eikä ollut automaattinen: ei kosketa.
    if (!tulos && !r.automaattinenArvosana) continue;

    const muokkaa = (p: Patch): Patch => {
      if (!tulos) {
        // Klubilaisten arvosanat poistuivat: vanha arvosana takaisin.
        return arvosanaPatch(p, alkuperainen).unset(["automaattinenArvosana", "alkuperainenArvio"]);
      }
      const q = arvosanaPatch(p, tulos.arvosanat).set({
        automaattinenArvosana: { arvioijia: tulos.arvioijia, viimeisinArvio: tulos.viimeisinArvio },
      });
      return onArvio(alkuperainen) ? q.set({ alkuperainenArvio: alkuperainen }) : q.unset(["alkuperainenArvio"]);
    };

    const jalkeen = tulos ? tulos.arvosanat : alkuperainen;
    const samaArvosana = AVAIMET.every((k) => ennen[k] === jalkeen[k]);
    const samaTila = tulos
      ? r.automaattinenArvosana?.arvioijia === tulos.arvioijia &&
        (r.automaattinenArvosana?.viimeisinArvio ?? null) === tulos.viimeisinArvio
      : !r.automaattinenArvosana;
    if (samaArvosana && samaTila) continue;

    muutokset.push({ _id: r._id, name: r.name, ennen, jalkeen, arvioijia: tulos?.arvioijia ?? 0 });
    tx.patch(r._id, (p) => muokkaa(p.ifRevisionId(r._rev)));
    if (r.luonnos) tx.patch(r.luonnos._id, (p) => muokkaa(p.ifRevisionId(r.luonnos!._rev)));
  }

  if (!kuiva && muutokset.length > 0) await tx.commit({ visibility: "sync" });
  return muutokset;
}
