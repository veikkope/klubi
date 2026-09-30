/**
 * Otteluohjelma: automaattisesti haetut ottelut + Studiossa lisätyt ottelut ja
 * klubin merkinnät yhdeksi listaksi.
 *
 * Lähteet (docs/05 §ottelu, docs/13-otteluohjelma.md):
 *  1. Palloliiton Taso-rajapinta, kun `TASO_API_KEY` on asetettu. Avain on
 *     vain palvelimella — sitä ei saa koskaan päästää selaimeen.
 *  2. Ilman avainta Veikkausliigan julkinen kalenterisyöte (ICS). Siinä ei ole
 *     stadioneja, joten ne näkyvät vain jos ottelu on myös Studiossa. Sivuston
 *     TLS-ketju on puutteellinen, ks. lib/fetch-with-intermediate.ts.
 *  3. Studion `ottelu`-dokumentit: maajoukkue ym. ottelut joita syötteet eivät
 *     kata, sekä merkinnät "Klubi paikalla" ja "Vierasmatka".
 *
 * Studion ottelu yhdistyy automaattiseen, kun Helsingin aikaan sama päivä ja
 * samat joukkueet (kirjainkoko ja välimerkit ohitetaan). Studion kentät
 * voittavat, kun ne on täytetty.
 *
 * Ulkoisen lähteen virhe ei kaada sivua: lista näytetään silloin pelkillä
 * Studion otteluilla.
 *
 * Miesten maajoukkueen (Huuhkajat) ottelut ovat klubille erityisiä. Ottelu
 * tunnistetaan, kun joukkue on tasan "Suomi", ja se korostetaan listassa.
 * Klubi käy jokaisessa kotiottelussa, joten Suomen kotipelit saavat
 * automaattisesti merkinnän "Klubi paikalla". Vieraspeleihin klubi ei yleensä
 * mene; niihin merkinnän voi valita Studiossa käsin.
 * Muut Suomi-joukkueet kirjoitetaan tarkenteella (esim. "Suomi (naiset)",
 * "Suomi U21"), jolloin niitä ei tulkita Huuhkajiksi.
 */

import { unstable_cache } from "next/cache";

import { fetchVeikkausliigaText } from "@/lib/fetch-with-intermediate";
import { HUUHKAJAT, normalizeTeam } from "@/lib/joukkueet";
import { sanityFetch } from "@/sanity/lib/fetch";
import { tulevatOttelutQuery } from "@/sanity/lib/queries/ottelut";

export type Ottelu = {
  id: string;
  /** ISO-aikaleima (UTC). */
  aika: string;
  koti: string;
  vieras: string;
  kilpailu: string | null;
  stadion: string | null;
  klubiPaikalla: boolean;
  vierasmatka: boolean;
  /** Miesten maajoukkueen ottelu (Huuhkajat). */
  maajoukkue: boolean;
};

type SanityOttelu = {
  _id: string;
  aika: string;
  koti: string;
  vieras: string;
  kilpailu?: string | null;
  stadion?: string | null;
  klubiPaikalla?: boolean | null;
  vierasmatka?: boolean | null;
};

/** Ulkoinen data päivitetään tunnin välein (ISR). */
const REVALIDATE_SECONDS = 60 * 60;

const helsinkiDate = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Helsinki",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Miesten A-maajoukkue: joukkueen nimi on tasan "Suomi" (kirjainkoko ohitetaan). */
function isHuuhkajat(team: string): boolean {
  return normalizeTeam(team) === normalizeTeam(HUUHKAJAT);
}

function matchKey(o: Pick<Ottelu, "aika" | "koti" | "vieras">): string {
  return `${helsinkiDate.format(new Date(o.aika))}|${normalizeTeam(o.koti)}|${normalizeTeam(o.vieras)}`;
}

/** Kaksinumeroinen kausi, esim. 2026 → "26". Veikkausliigan kausi = kalenterivuosi. */
function seasonCode(now = new Date()): string {
  return String(now.getFullYear()).slice(-2);
}

// ── Veikkausliigan ICS-syöte ─────────────────────────────────────────────────

/** "20261007T160000Z" → ISO. */
function parseIcsDate(value: string): string | null {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(value.trim());
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
}

export function parseVeikkausliigaIcs(ics: string): Ottelu[] {
  const result: Ottelu[] = [];
  // ICS-rivit voivat jatkua seuraavalle riville välilyönnillä alkaen (RFC 5545).
  const unfolded = ics.replace(/\r?\n[ \t]/g, "");
  for (const block of unfolded.split("BEGIN:VEVENT").slice(1)) {
    const field = (name: string) =>
      new RegExp(`^${name}[^:\\n]*:(.*)$`, "m").exec(block)?.[1]?.trim() ?? null;
    const summary = field("SUMMARY");
    const start = field("DTSTART");
    const uid = field("UID");
    if (!summary || !start || !uid) continue;
    const aika = parseIcsDate(start);
    const teams = summary.split(/\s+[-–]\s+/);
    if (!aika || teams.length !== 2) continue;
    result.push({
      id: uid,
      aika,
      koti: teams[0],
      vieras: teams[1],
      kilpailu: "Veikkausliiga",
      stadion: null,
      klubiPaikalla: false,
      vierasmatka: false,
      maajoukkue: false,
    });
  }
  return result;
}

// Oma HTTPS-haku (lib/fetch-with-intermediate.ts) ohittaa Nextin fetch-välimuistin,
// joten tulos välimuistitetaan erikseen tunniksi.
const fetchVeikkausliigaIcs = unstable_cache(
  async (): Promise<Ottelu[]> => {
    const url = `https://www.veikkausliiga.com/tilastot/spljp${seasonCode()}/kalenterit/?team=&home_away=`;
    return parseVeikkausliigaIcs(await fetchVeikkausliigaText(url));
  },
  ["veikkausliiga-ics"],
  { revalidate: REVALIDATE_SECONDS, tags: ["ottelut"] },
);

// ── Palloliiton Taso-rajapinta ───────────────────────────────────────────────

type TasoMatch = {
  match_id?: string;
  date?: string;
  time?: string;
  team_A_name?: string;
  team_B_name?: string;
  category_name?: string;
  venue_name?: string;
  status?: string;
};

/**
 * Taso-rajapinnan paikallinen aika ("2026-10-04", "17:00") → UTC-ISO.
 * Suomen aikavyöhykkeen siirtymä selvitetään Intl:llä, jotta kesäaika menee oikein.
 */
function helsinkiToIso(date: string, time: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!m || !t) return null;
  const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +t[1], +t[2]);
  const offsetName = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Helsinki",
    timeZoneName: "shortOffset",
  })
    .formatToParts(new Date(guess))
    .find((p) => p.type === "timeZoneName")?.value; // esim. "GMT+3"
  const hours = Number(/GMT([+-]\d+)/.exec(offsetName ?? "")?.[1] ?? 2);
  return new Date(guess - hours * 60 * 60 * 1000).toISOString();
}

/**
 * Sarjat muodossa "kilpailu:kategoria" pilkulla eroteltuna, esim.
 * TASO_SARJAT="spljp26:VL,splcup26:SC". Oletuksena kuluvan kauden Veikkausliiga.
 * HUOM: parametrien nimet ja vastauksen muoto perustuvat rajapinnan julkiseen
 * dokumentaatioon (spl.torneopal.fi/taso/rest/help); tarkista ne kun avain on
 * saatu.
 */
async function fetchTaso(apiKey: string): Promise<Ottelu[]> {
  const sarjat = (process.env.TASO_SARJAT ?? `spljp${seasonCode()}:VL`)
    .split(",")
    .map((s) => s.trim().split(":"))
    .filter((pair): pair is [string, string] => pair.length === 2);

  const all = await Promise.all(
    sarjat.map(async ([competition, category]) => {
      const params = new URLSearchParams({
        api_key: apiKey,
        competition_id: competition,
        category_id: category,
      });
      const res = await fetch(`https://spl.torneopal.fi/taso/rest/getMatches?${params}`, {
        next: { revalidate: REVALIDATE_SECONDS, tags: ["ottelut"] },
      });
      if (!res.ok) throw new Error(`Taso ${competition}/${category}: HTTP ${res.status}`);
      const json = (await res.json()) as { matches?: TasoMatch[]; call?: { error?: string } };
      if (json.call?.error) throw new Error(`Taso: ${json.call.error}`);
      return (json.matches ?? []).flatMap((m): Ottelu[] => {
        const aika = m.date && m.time ? helsinkiToIso(m.date, m.time) : null;
        if (!m.match_id || !aika || !m.team_A_name || !m.team_B_name) return [];
        return [
          {
            id: `taso-${m.match_id}`,
            aika,
            koti: m.team_A_name,
            vieras: m.team_B_name,
            kilpailu: m.category_name ?? null,
            stadion: m.venue_name ?? null,
            klubiPaikalla: false,
            vierasmatka: false,
            maajoukkue: false,
          },
        ];
      });
    }),
  );
  return all.flat();
}

// ── Yhdistäminen ─────────────────────────────────────────────────────────────

async function fetchExternal(): Promise<Ottelu[]> {
  const apiKey = process.env.TASO_API_KEY;
  try {
    return apiKey ? await fetchTaso(apiKey) : await fetchVeikkausliigaIcs();
  } catch (error) {
    console.error("[ottelut] ulkoisen otteluohjelman haku epäonnistui:", error);
    return [];
  }
}

/**
 * Automaattisen otteluohjelman joukkueet ja "Suomi" aakkosjärjestyksessä.
 * Studio ehdottaa näitä ottelun joukkueiksi ja varoittaa lähes samasta
 * nimestä (app/api/joukkueet, lib/joukkueet.ts).
 */
export async function getJoukkueet(): Promise<string[]> {
  const ottelut = await fetchExternal();
  const nimet = new Map<string, string>([[normalizeTeam(HUUHKAJAT), HUUHKAJAT]]);
  for (const o of ottelut) {
    for (const nimi of [o.koti, o.vieras]) {
      const avain = normalizeTeam(nimi);
      if (avain && !nimet.has(avain)) nimet.set(avain, nimi.trim());
    }
  }
  return [...nimet.values()].sort((a, b) => a.localeCompare(b, "fi"));
}

type Options = {
  /**
   * Rajaa Huuhkajien otteluihin (etusivun oletus) sekä `seurat`-listan
   * joukkueiden otteluihin.
   */
  vainMaajoukkue?: boolean;
  /**
   * Rajauksen lisäksi näytettävät seurat, esim. ["FC Lahti"]. Nimi verrataan
   * kuten Studion ja syötteen yhdistämisessä (kirjainkoko ja välimerkit ohitetaan).
   */
  seurat?: string[];
};

export async function getTulevatOttelut(
  limit: number,
  { vainMaajoukkue = false, seurat = [] }: Options = {},
): Promise<Ottelu[]> {
  const valitutSeurat = new Set(seurat.map(normalizeTeam).filter(Boolean));
  // Ulkoiset syötteet kattavat vain seurajoukkueet: pelkille Huuhkajille niitä ei haeta.
  const tarvitaanSyote = !vainMaajoukkue || valitutSeurat.size > 0;
  const [external, manual] = await Promise.all([
    tarvitaanSyote ? fetchExternal() : Promise.resolve([]),
    sanityFetch<SanityOttelu[]>({
      query: tulevatOttelutQuery,
      tags: ["ottelu"],
      fallback: [],
    }),
  ]);

  const byKey = new Map<string, Ottelu>();
  for (const o of external) byKey.set(matchKey(o), o);

  for (const s of manual) {
    const own: Ottelu = {
      id: s._id,
      aika: s.aika,
      koti: s.koti,
      vieras: s.vieras,
      kilpailu: s.kilpailu ?? null,
      stadion: s.stadion ?? null,
      klubiPaikalla: Boolean(s.klubiPaikalla),
      vierasmatka: Boolean(s.vierasmatka),
      maajoukkue: false,
    };
    const key = matchKey(own);
    const auto = byKey.get(key);
    byKey.set(
      key,
      auto
        ? {
            ...auto,
            // Studion täytetyt kentät voittavat; aika jää syötteestä (virallinen).
            kilpailu: own.kilpailu ?? auto.kilpailu,
            stadion: own.stadion ?? auto.stadion,
            klubiPaikalla: own.klubiPaikalla,
            vierasmatka: own.vierasmatka,
          }
        : own,
    );
  }

  // Näytetään ottelut, jotka alkoivat enintään 2 h sitten (käynnissä olevat).
  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  return [...byKey.values()]
    .map((o) => {
      const maajoukkue = isHuuhkajat(o.koti) || isHuuhkajat(o.vieras);
      // Klubi on paikalla jokaisessa Huuhkajien kotiottelussa.
      return { ...o, maajoukkue, klubiPaikalla: o.klubiPaikalla || isHuuhkajat(o.koti) };
    })
    .filter(
      (o) =>
        new Date(o.aika).getTime() >= cutoff &&
        (!vainMaajoukkue ||
          o.maajoukkue ||
          valitutSeurat.has(normalizeTeam(o.koti)) ||
          valitutSeurat.has(normalizeTeam(o.vieras))),
    )
    .sort((a, b) => a.aika.localeCompare(b.aika))
    .slice(0, limit);
}
