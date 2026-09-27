/**
 * Taulukkosolujen ja tekstikenttien yhteinen normalisointi (docs/12 §1.2).
 *
 * Kaikki taulukkoputket (huuhkajat, tilastot, klubi, arvokisat, stadionit)
 * ajavat taulukkonsa tämän läpi juuri ennen `data/normalized/*.json`:n
 * kirjoittamista. Näin sääntö on yhdessä paikassa eikä putkien välillä ole eroja.
 *
 * Säännöt:
 *  - **date-sarake**: arvot ISO-muotoon. `17.11.2025` → `2025-11-17`,
 *    `11.2025` → `2025-11`, `2025-11-17` pysyy. Päivävälit ISO 8601 -väleinä:
 *    `30.01.-01.02.2009` → `2009-01-30/2009-02-01`, `29-31.01.2010` →
 *    `2010-01-29/2010-01-31` (tieto ei muutu, vain muoto). Jos yksikin arvo on
 *    epäselvä (ei tunnistu kalenteripäiväksi), sarakkeen tyyppi on `text` ja
 *    **kaikki** sen arvot jätetään lähteen muotoon — sekamuotoinen sarake olisi
 *    pahempi kuin tekstisarake.
 *  - **number-sarake**: tuhaterottimet pois (`61 035` → `61035`, myös NBSP ja
 *    kapea NBSP), etunollat pois (`05` → `5`). Jos yksikin arvo ei ole
 *    kokonaisluku, tyyppi `text` ja arvot lähteen muodossa.
 *  - Tyhjä solu pysyy tyhjänä eikä vaikuta tyyppiin.
 *  - **Yhteenvetorivi** (solu "Yhteensä"/"Keskiarvo"/"Summa"/"Total",
 *    `isSummaryRow`) ei vaikuta tyyppiin: sen sarakkeen tyyppiä vastaavat solut
 *    muunnetaan (päiväys → ISO), muut jäävät lähteen muotoon tekstiksi
 *    ("Keskiarvo", "7,9 henkilöä"). Parsereiden tyyppipäättely käyttää samaa apuria
 *    (`withoutSummaryRows`), joten yksi summarivi ei kaada päivämääräsaraketta.
 *  - Näkymättömät merkit (U+200B zero-width space ym.) poistetaan kaikista
 *    merkkijonoista: `stripInvisibleDeep` koko tulosteelle.
 *
 * CMS-riippumaton: ei tiedä Sanitysta mitään.
 */

export type ColumnType = "text" | "number" | "date" | "year" | "link";

/**
 * Näkymättömät muotoilumerkit: zero-width space/joiner/non-joiner, word joiner,
 * BOM, soft hyphen sekä suuntamerkit LRM/RLM. Ne eivät näy, mutta rikkovat
 * haun, vertailun ja sanamäärät (karsinta-mm-2022.lisatiedot).
 */
const INVISIBLE = /[​-‏⁠﻿­]/g;

export function stripInvisible(s: string): string {
  return s.replace(INVISIBLE, "");
}

/** Poistaa näkymättömät merkit kaikista rakenteen merkkijonoista (uusi olio). */
export function stripInvisibleDeep<T>(value: T): T {
  if (typeof value === "string") return stripInvisible(value) as T;
  if (Array.isArray(value)) return value.map((v) => stripInvisibleDeep(v)) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = stripInvisibleDeep(v);
    return out as T;
  }
  return value;
}

/** Laskee näkymättömät merkit rakenteesta (raportointiin). */
export function countInvisible(value: unknown): number {
  return (JSON.stringify(value ?? null).match(INVISIBLE) ?? []).length;
}

// ── Päivämäärät ─────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");

function validDay(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1) return false;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return d <= days;
}

function iso(y: number, m: number, d: number): string | null {
  return validDay(y, m, d) ? `${y}-${pad(m)}-${pad(d)}` : null;
}

/**
 * Yksittäinen päivämäärä tai päiväväli ISO-muotoon. Palauttaa `null`, jos arvo
 * ei yksiselitteisesti ole päivämäärä (kutsuja jättää sen tekstiksi).
 */
export function toIsoDate(raw: string): string | null {
  const v = raw.trim().replace(/\s+/g, " ");
  let m: RegExpExecArray | null;

  // Jo ISO: 2025-11-17, 2025-11, 2025
  if ((m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v))) return iso(+m[1], +m[2], +m[3]);
  if ((m = /^(\d{4})-(\d{2})$/.exec(v))) return +m[2] >= 1 && +m[2] <= 12 ? v : null;
  if (/^(1[89]|20)\d{2}$/.test(v)) return v;

  // 17.11.2025 (myös 1.1.2025)
  if ((m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(v))) return iso(+m[3], +m[2], +m[1]);

  // 11.2025 → 2025-11 (pelkkä kuukausi)
  if ((m = /^(\d{1,2})\.(\d{4})$/.exec(v))) {
    const mo = +m[1];
    return mo >= 1 && mo <= 12 ? `${m[2]}-${pad(mo)}` : null;
  }

  // Välit: 30.01.-01.02.2009 ja 29-31.01.2010 (viiva voi olla – tai -)
  if ((m = /^(\d{1,2})\.(\d{1,2})\.?\s?[-–]\s?(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(v))) {
    const a = iso(+m[5], +m[2], +m[1]);
    const b = iso(+m[5], +m[4], +m[3]);
    return a && b && a < b ? `${a}/${b}` : null;
  }
  if ((m = /^(\d{1,2})\.?\s?[-–]\s?(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(v))) {
    const a = iso(+m[4], +m[3], +m[1]);
    const b = iso(+m[4], +m[3], +m[2]);
    return a && b && a < b ? `${a}/${b}` : null;
  }
  return null;
}

// ── Luvut ───────────────────────────────────────────────────────────────────

/**
 * Kokonaisluku kanoniseen muotoon. Tuhaterottimena välilyönti, NBSP tai kapea
 * NBSP (`61 035`). Pistettä ei hyväksytä tuhaterottimeksi eikä pilkkua
 * desimaaliksi — ne ovat monitulkintaisia, joten sarake jää tekstiksi.
 */
export function toInteger(raw: string): string | null {
  const v = raw.trim().replace(/−/g, "-");
  let m: RegExpExecArray | null;
  if ((m = /^(-?)(\d+)$/.exec(v))) return `${m[1]}${String(Number(m[2]))}`;
  if ((m = /^(-?)(\d{1,3}(?:[   ]\d{3})+)$/.exec(v))) {
    return `${m[1]}${String(Number(m[2].replace(/[   ]/g, "")))}`;
  }
  return null;
}

// ── Yhteenvetorivit ─────────────────────────────────────────────────────────

/**
 * Yhteenvetorivin tunniste: solu, jonka koko sisältö on "Yhteensä",
 * "Keskiarvo", "Summa", "Total" tms. (valinnainen kaksoispiste perässä).
 * Vaaditaan koko solu, jotta "Yhteensä 3 ottelua" -tyyppinen data ei osu.
 */
const SUMMARY_LABEL = /^(?:yhteensä|yht\.?|kaikki yhteensä|keskiarvo|summa|total|totals|grand total)\s*:?$/i;

/**
 * Onko rivi yhteenveto-/summarivi (esim. `| Yhteensä | 197 | Keskiarvo | 7,9 henkilöä`)?
 *
 * Yhteenvetorivi on taulukon dataa (se näytetään), mutta sen solut eivät
 * kuvaa sarakkeen tyyppiä: sarakkeen tyyppipäättely ja arvojen muunnos
 * ohittavat sen; sarakkeen tyyppiin sopimattomat solut jäävät tekstiksi.
 * Tämä on kaikkien taulukkoputkien yhteinen sääntö (docs/12 §1.2).
 */
export function isSummaryRow(cells: readonly (string | null | undefined)[]): boolean {
  return cells.some((v) => typeof v === "string" && SUMMARY_LABEL.test(v.trim()));
}

/** Rivit ilman yhteenvetorivejä — sarakkeiden tyyppipäättelyyn. */
export function withoutSummaryRows<T extends readonly (string | null | undefined)[]>(rows: readonly T[]): T[] {
  return rows.filter((r) => !isSummaryRow(r));
}

// ── Sarakkeet ───────────────────────────────────────────────────────────────

export interface ColumnResult {
  type: ColumnType;
  values: string[];
  /** Selitys raporttiin, jos tyyppi vaihtui tai arvoja muunnettiin. */
  note?: string;
}

/**
 * Normalisoi yhden sarakkeen arvot sen tyypin mukaan. `values` on sarakkeen
 * solut riveittäin (`""` = tyhjä solu). `skip[i] === true` = rivi i on
 * yhteenvetorivi: sen arvo muunnetaan jos se on sarakkeen tyyppiä, muuten se
 * jää lähteen muotoon — kummassakaan tapauksessa se ei vaikuta tyyppiin.
 */
export function normalizeColumn(type: ColumnType, values: string[], label = "", skip: boolean[] = []): ColumnResult {
  const convert = type === "date" ? toIsoDate : type === "number" ? toInteger : null;
  if (!convert) return { type, values };

  const out: string[] = [];
  const failed: string[] = [];
  let changed = 0;
  for (const [i, raw] of values.entries()) {
    if (!raw.trim()) {
      out.push("");
      continue;
    }
    if (skip[i]) {
      // Yhteenvetorivi: muunnetaan jos arvo on sarakkeen tyyppiä (päiväys
      // summarivillä → ISO), muuten jätetään tekstiksi — ei kaada tyyppiä.
      const v = convert(raw);
      if (v !== null && v !== raw) changed += 1;
      out.push(v ?? raw);
      continue;
    }
    const v = convert(raw);
    if (v === null) failed.push(raw);
    else if (v !== raw) changed += 1;
    out.push(v ?? raw);
  }
  if (failed.length) {
    return {
      type: "text",
      values,
      note:
        `sarake "${label}" (${type}) → text: ${failed.length} arvoa ei ole yksiselitteisesti ` +
        `${type === "date" ? "päivämäärä" : "kokonaisluku"} (esim. "${failed[0]}")`,
    };
  }
  return {
    type,
    values: out,
    ...(changed ? { note: `sarake "${label}" (${type}): ${changed} arvoa muunnettu ${type === "date" ? "ISO-muotoon" : "numeroiksi"}` } : {}),
  };
}

/**
 * Taulukko, jonka rivit ovat taulukoita sarakkeiden järjestyksessä.
 * Palauttaa uudet tyypit ja rivit sekä raporttihuomiot.
 */
export function normalizeGrid(
  columns: { type: ColumnType; label?: string }[],
  rows: string[][],
): { types: ColumnType[]; rows: string[][]; notes: string[] } {
  const notes: string[] = [];
  const types: ColumnType[] = [];
  const outRows = rows.map((r) => [...r]);
  const skip = rows.map((r) => isSummaryRow(r));
  columns.forEach((col, c) => {
    const res = normalizeColumn(col.type, rows.map((r) => r[c] ?? ""), col.label ?? `#${c}`, skip);
    types.push(res.type);
    if (res.note) notes.push(res.note);
    res.values.forEach((v, r) => {
      if (c < outRows[r].length || v !== "") outRows[r][c] = v;
    });
  });
  return { types, rows: outRows, notes };
}

/**
 * Taulukko, jonka rivit ovat olioita sarakeavaimen mukaan
 * (`{ vuosi: "1930", isantamaa: "Uruguay" }`).
 */
export function normalizeKeyed(
  columns: { key: string; type: ColumnType; label?: string }[],
  rows: Record<string, string | undefined>[],
): { types: ColumnType[]; rows: Record<string, string | undefined>[]; notes: string[] } {
  const grid = rows.map((r) => columns.map((c) => r[c.key] ?? ""));
  const res = normalizeGrid(columns, grid);
  const outRows = rows.map((r, i) => {
    const o = { ...r };
    columns.forEach((c, j) => {
      if (r[c.key] !== undefined) o[c.key] = res.rows[i][j];
    });
    return o;
  });
  return { types: res.types, rows: outRows, notes: res.notes };
}
