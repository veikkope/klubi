/**
 * Sijoitushistoria: kuukausittainen sijoitus (FIFA-ranking) tilastotaulukosta
 * kuvaajaksi, tunnusluvuiksi ja valmentajakausiksi (docs/decisions/002).
 *
 * Data on tavallinen Jalkapallotilasto (sarakkeet Kuukausi, Sija, Valmentaja),
 * jota sihteeri päivittää Studion taulukkoeditorissa. Kaikki tässä on puhdasta
 * laskentaa ilman Reactia, jotta sama koodi palvelee sivustoa, Studion
 * validointia ja testejä (scripts/test-sijoitushistoria.ts).
 */

export interface Sarake {
  key: string;
  label?: string | null;
  type?: string | null;
}

export interface Rivi {
  cells?: { key: string; value?: string | null }[] | null;
}

export interface Piste {
  /** Kuukausi muodossa VVVV-KK. */
  kuukausi: string;
  /** Juokseva kuukausinumero (vuosi * 12 + kuukausi - 1) x-akselia varten. */
  indeksi: number;
  sija: number;
  valmentaja: string | null;
}

export interface Kausi {
  valmentaja: string;
  alku: string;
  loppu: string;
  /** Kauden ensimmäisen ja viimeisen pisteen indeksit `pisteet`-listassa. */
  ensimmainen: number;
  viimeinen: number;
  listoja: number;
  keskiarvo: number;
  paras: number;
  heikoin: number;
}

export interface Tunnusluvut {
  nykyinen: Piste;
  /** Edellinen julkaistu lista; null, jos pisteitä on vain yksi. */
  edellinen: Piste | null;
  paras: Piste;
  heikoin: Piste;
  keskiarvo: number;
}

/** Sarakkeiden tunnistus avaimesta. Excel-tuonti muodostaa avaimen otsikosta. */
const KUUKAUSI_AVAIMET = ["kuukausi", "aika", "kk", "pvm", "paivamaara", "julkaistu"];
const SIJA_AVAIMET = ["sija", "sijoitus", "ranking", "fifa-ranking", "fifa-sija"];
const VALMENTAJA_AVAIMET = ["valmentaja", "paavalmentaja", "valmentajat"];

/** FIFA:lla on 211 jäsenmaata; raja jättää varaa, mutta estää kirjoitusvirheet (750 → 75). */
export const SIJA_MAX = 250;

export interface Sarakkeet {
  kuukausi: string;
  sija: string;
  valmentaja: string | null;
}

function etsi(sarakkeet: Sarake[], avaimet: string[]): string | null {
  return sarakkeet.find((s) => avaimet.includes(s.key.toLowerCase()))?.key ?? null;
}

/**
 * Kuukausi-, sija- ja valmentajasarake. Ensisijaisesti avaimen mukaan; jos
 * sarakkeet on nimetty toisin, kuukausi on ensimmäinen sarake ja sija
 * ensimmäinen numerosarake.
 */
export function tunnistaSarakkeet(sarakkeet: Sarake[] | null | undefined): Sarakkeet | null {
  const kaikki = sarakkeet ?? [];
  if (kaikki.length < 2) return null;
  const kuukausi = etsi(kaikki, KUUKAUSI_AVAIMET) ?? kaikki[0].key;
  const sija =
    etsi(kaikki, SIJA_AVAIMET) ??
    kaikki.find((s) => s.key !== kuukausi && s.type === "number")?.key ??
    null;
  if (!sija || sija === kuukausi) return null;
  const valmentaja = etsi(kaikki, VALMENTAJA_AVAIMET);
  return { kuukausi, sija, valmentaja: valmentaja === kuukausi || valmentaja === sija ? null : valmentaja };
}

/** "2026/10", "2026-10", "2026/1" tai "10/2026" → "2026-10". Muuten null. */
export function jasennaKuukausi(arvo: string | null | undefined): string | null {
  const teksti = (arvo ?? "").trim();
  let m = /^(\d{4})\s*[/.-]\s*(\d{1,2})$/.exec(teksti);
  let vuosi: number;
  let kuukausi: number;
  if (m) {
    vuosi = Number(m[1]);
    kuukausi = Number(m[2]);
  } else {
    m = /^(\d{1,2})\s*[/.-]\s*(\d{4})$/.exec(teksti);
    if (!m) return null;
    vuosi = Number(m[2]);
    kuukausi = Number(m[1]);
  }
  if (kuukausi < 1 || kuukausi > 12 || vuosi < 1900 || vuosi > 2200) return null;
  return `${vuosi}-${String(kuukausi).padStart(2, "0")}`;
}

/** Kokonaisluku 1–SIJA_MAX, muuten null. */
export function jasennaSija(arvo: string | null | undefined): number | null {
  const teksti = (arvo ?? "").trim().replace(/\.$/, "");
  if (!/^\d+$/.test(teksti)) return null;
  const sija = Number(teksti);
  return sija >= 1 && sija <= SIJA_MAX ? sija : null;
}

function solu(rivi: Rivi, key: string): string {
  return (rivi.cells ?? []).find((c) => c.key === key)?.value?.trim() ?? "";
}

function indeksi(kuukausi: string): number {
  const [v, k] = kuukausi.split("-").map(Number);
  return v * 12 + k - 1;
}

export interface Ongelma {
  /** Rivinumero taulukossa (1 = ensimmäinen rivi), tai null koko taulukkoa koskevalle. */
  rivi: number | null;
  viesti: string;
  /** Virhe estää julkaisun; varoitus vain huomauttaa. */
  taso: "virhe" | "varoitus";
}

/**
 * Taulukon tarkistus Studiossa. Tyhjä rivi ohitetaan (editori lisää sellaisen
 * "Lisää rivi" -painikkeesta), muut rivit tarkistetaan tiukasti.
 */
export function tarkistaSijoitushistoria(
  sarakkeet: Sarake[] | null | undefined,
  rivit: Rivi[] | null | undefined,
): Ongelma[] {
  const tunnistetut = tunnistaSarakkeet(sarakkeet);
  if (!tunnistetut) {
    return [
      {
        rivi: null,
        taso: "virhe",
        viesti:
          "Kuvaaja tarvitsee sarakkeet Kuukausi ja Sija (ja mieluiten Valmentaja). Nimeä sarakkeet otsikon ⋮-valikosta.",
      },
    ];
  }
  const ongelmat: Ongelma[] = [];
  const nahdyt = new Map<string, number>();
  let edellinen: string | null = null;
  let jarjestysVaroitettu = false;

  (rivit ?? []).forEach((rivi, i) => {
    const nro = i + 1;
    const kkTeksti = solu(rivi, tunnistetut.kuukausi);
    const sijaTeksti = solu(rivi, tunnistetut.sija);
    const valmentaja = tunnistetut.valmentaja ? solu(rivi, tunnistetut.valmentaja) : "x";
    if (!kkTeksti && !sijaTeksti && (!tunnistetut.valmentaja || !valmentaja)) return;

    const kuukausi = jasennaKuukausi(kkTeksti);
    if (!kuukausi) {
      ongelmat.push({
        rivi: nro,
        taso: "virhe",
        viesti: kkTeksti
          ? `Rivi ${nro}: kuukausi "${kkTeksti}" on väärässä muodossa. Kirjoita vuosi ja kuukausi, esim. 2026/10.`
          : `Rivi ${nro}: kuukausi puuttuu. Kirjoita vuosi ja kuukausi, esim. 2026/10.`,
      });
    }
    if (jasennaSija(sijaTeksti) === null) {
      ongelmat.push({
        rivi: nro,
        taso: "virhe",
        viesti: sijaTeksti
          ? `Rivi ${nro}: sija "${sijaTeksti}" ei kelpaa. Kirjoita pelkkä numero väliltä 1–${SIJA_MAX}, esim. 75.`
          : `Rivi ${nro}: sija puuttuu. Kirjoita sija numerona, esim. 75.`,
      });
    }
    if (tunnistetut.valmentaja && !valmentaja) {
      ongelmat.push({
        rivi: nro,
        taso: "virhe",
        viesti: `Rivi ${nro}: valmentaja puuttuu. Kirjoita päävalmentajan sukunimi kuten edellisillä riveillä.`,
      });
    }
    if (!kuukausi) return;

    const aiempi = nahdyt.get(kuukausi);
    if (aiempi !== undefined) {
      ongelmat.push({
        rivi: nro,
        taso: "virhe",
        viesti: `Rivi ${nro}: kuukausi ${kkTeksti} on jo rivillä ${aiempi}. Jokaisella kuukaudella on vain yksi rivi; poista toinen.`,
      });
    } else {
      nahdyt.set(kuukausi, nro);
    }
    if (edellinen && kuukausi < edellinen && !jarjestysVaroitettu) {
      jarjestysVaroitettu = true;
      ongelmat.push({
        rivi: nro,
        taso: "varoitus",
        viesti: `Rivi ${nro}: kuukaudet eivät ole aikajärjestyksessä. Kuvaaja järjestää ne itse, mutta taulukko on helpompi lukea, kun uusin on lopussa.`,
      });
    }
    edellinen = kuukausi;
  });

  if (nahdyt.size < 2 && ongelmat.length === 0) {
    ongelmat.push({ rivi: null, taso: "varoitus", viesti: "Kuvaaja tarvitsee vähintään kaksi kuukautta." });
  }
  return ongelmat;
}

/**
 * Kelvolliset pisteet aikajärjestyksessä. Virheellinen rivi ohitetaan; saman
 * kuukauden rivistä viimeinen voittaa (Studion validointi estää tuplat).
 */
export function jasennaPisteet(
  sarakkeet: Sarake[] | null | undefined,
  rivit: Rivi[] | null | undefined,
): Piste[] {
  const tunnistetut = tunnistaSarakkeet(sarakkeet);
  if (!tunnistetut) return [];
  const kuukausittain = new Map<string, Piste>();
  for (const rivi of rivit ?? []) {
    const kuukausi = jasennaKuukausi(solu(rivi, tunnistetut.kuukausi));
    const sija = jasennaSija(solu(rivi, tunnistetut.sija));
    if (!kuukausi || sija === null) continue;
    const valmentaja = tunnistetut.valmentaja ? solu(rivi, tunnistetut.valmentaja) || null : null;
    kuukausittain.set(kuukausi, { kuukausi, indeksi: indeksi(kuukausi), sija, valmentaja });
  }
  return [...kuukausittain.values()].sort((a, b) => a.indeksi - b.indeksi);
}

function keskiarvo(luvut: number[]): number {
  return luvut.reduce((s, x) => s + x, 0) / luvut.length;
}

/** Nykyinen, edellinen, paras ja heikoin (aikaisin, jos sama sija toistuu) ja keskiarvo. */
export function tunnusluvut(pisteet: Piste[]): Tunnusluvut | null {
  if (pisteet.length === 0) return null;
  let paras = pisteet[0];
  let heikoin = pisteet[0];
  for (const p of pisteet) {
    if (p.sija < paras.sija) paras = p;
    if (p.sija > heikoin.sija) heikoin = p;
  }
  return {
    nykyinen: pisteet[pisteet.length - 1],
    edellinen: pisteet.length > 1 ? pisteet[pisteet.length - 2] : null,
    paras,
    heikoin,
    keskiarvo: keskiarvo(pisteet.map((p) => p.sija)),
  };
}

/** Peräkkäiset saman valmentajan kuukaudet yhdeksi kaudeksi. */
export function valmentajakaudet(pisteet: Piste[]): Kausi[] {
  const kaudet: Kausi[] = [];
  let alku = 0;
  pisteet.forEach((p, i) => {
    const seuraava = pisteet[i + 1];
    if (seuraava && seuraava.valmentaja === p.valmentaja) return;
    const osa = pisteet.slice(alku, i + 1);
    if (p.valmentaja) {
      const sijat = osa.map((x) => x.sija);
      kaudet.push({
        valmentaja: p.valmentaja,
        alku: osa[0].kuukausi,
        loppu: p.kuukausi,
        ensimmainen: alku,
        viimeinen: i,
        listoja: osa.length,
        keskiarvo: keskiarvo(sijat),
        paras: Math.min(...sijat),
        heikoin: Math.max(...sijat),
      });
    }
    alku = i + 1;
  });
  return kaudet;
}

const KUUKAUDET = [
  "tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu",
  "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu",
];

/** "2026-10" → "10/2026" (lyhyt, taulukot ja kuvaaja). */
export function kuukausiLyhyt(kuukausi: string): string {
  const [v, k] = kuukausi.split("-");
  return `${Number(k)}/${v}`;
}

/** "2026-10" → "lokakuu 2026" (tekstit ja ruudunlukija). */
export function kuukausiPitka(kuukausi: string): string {
  const [v, k] = kuukausi.split("-");
  return `${KUUKAUDET[Number(k) - 1]} ${v}`;
}

/** Desimaali suomalaisittain yhdellä desimaalilla: 58.94 → "58,9". */
export function desimaali(luku: number): string {
  return new Intl.NumberFormat("fi-FI", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(luku);
}

/** Tasaiset akselin jaot väliltä [min, max] noin `tavoite` kappaletta. */
export function jaot(min: number, max: number, tavoite: number): number[] {
  const vali = Math.max(1, max - min);
  const raaka = vali / Math.max(1, tavoite);
  const potenssi = 10 ** Math.floor(Math.log10(raaka));
  const askel = [1, 2, 5, 10].map((k) => k * potenssi).find((a) => a >= raaka) ?? 10 * potenssi;
  const tulos: number[] = [];
  for (let x = Math.ceil(min / askel) * askel; x <= max + 1e-9; x += askel) tulos.push(Math.round(x));
  return tulos;
}

/** Koko tekstiyhteenveto kuvaajasta ruudunlukijalle ja hakukoneille. */
export function yhteenveto(pisteet: Piste[], nimi: string): string {
  const t = tunnusluvut(pisteet);
  if (!t) return "";
  const alku = kuukausiPitka(pisteet[0].kuukausi);
  return (
    `${nimi} ${alku} – ${kuukausiPitka(t.nykyinen.kuukausi)}: ${pisteet.length} kuukausittaista listaa. ` +
    `Nyt sija ${t.nykyinen.sija}. Paras sija ${t.paras.sija} (${kuukausiPitka(t.paras.kuukausi)}), ` +
    `heikoin ${t.heikoin.sija} (${kuukausiPitka(t.heikoin.kuukausi)}), keskiarvo ${desimaali(t.keskiarvo)}.`
  );
}
