/**
 * Uutisarkiston vuosilogiikka.
 *
 * Vanhalla sivustolla arkisto oli 47 erillistä käsin ylläpidettyä sivua
 * (kommentit2005.htm … Kommentit2022.htm, blogi2006.htm … blogi2017.htm).
 * Uudessa rakenteessa sama sisältö on `uutinen`-dokumentteja, jotka jaotellaan
 * julkaisuvuoden mukaan — vuodet syntyvät datasta, eivät koodista, joten
 * arkisto kasvaa itsestään kun isä julkaisee uutta.
 */

import type { ArchiveYearRow } from "@/sanity/lib/queries/uutiset";

export type ArchiveYear = {
  year: number;
  count: number;
};

export type ArchiveDecade = {
  decade: number;
  label: string;
  years: ArchiveYear[];
  count: number;
};

/** Varhaisin uskottava julkaisuvuosi — suojaa roskaparametreilta. */
export const ARCHIVE_MIN_YEAR = 1990;

export function archiveMaxYear(): number {
  return new Date().getFullYear() + 1;
}

/** Hyväksyy vain neljä numeroa järkevältä väliltä. */
export function parseArchiveYear(value: string): number | null {
  if (!/^\d{4}$/.test(value)) return null;
  const year = Number.parseInt(value, 10);
  if (year < ARCHIVE_MIN_YEAR || year > archiveMaxYear()) return null;
  return year;
}

/** Laskee dokumenttiriveistä vuodet ja niiden määrät, uusin ensin. */
export function toArchiveYears(rows: ArchiveYearRow[]): ArchiveYear[] {
  const counts = new Map<number, number>();

  for (const row of rows) {
    if (!row?.year) continue;
    const year = Number.parseInt(row.year, 10);
    if (!Number.isFinite(year)) continue;
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.year - a.year);
}

/** Ryhmittelee vuodet vuosikymmeniksi, jotta selailu ei ole yhtä pitkää listaa. */
export function groupByDecade(years: ArchiveYear[]): ArchiveDecade[] {
  const groups = new Map<number, ArchiveYear[]>();

  for (const entry of years) {
    const decade = Math.floor(entry.year / 10) * 10;
    const bucket = groups.get(decade);
    if (bucket) bucket.push(entry);
    else groups.set(decade, [entry]);
  }

  return [...groups.entries()]
    .map(([decade, entries]) => ({
      decade,
      label: `${decade}-luku`,
      years: entries.sort((a, b) => b.year - a.year),
      count: entries.reduce((sum, entry) => sum + entry.count, 0),
    }))
    .sort((a, b) => b.decade - a.decade);
}

/** Vuoden rajat ISO-aikaleimoina GROQ-vertailua varten. */
export function yearBounds(year: number) {
  return {
    from: `${year}-01-01T00:00:00Z`,
    to: `${year + 1}-01-01T00:00:00Z`,
  };
}

/** Edellinen ja seuraava vuosi joilla on sisältöä. */
export function adjacentYears(years: ArchiveYear[], current: number) {
  // Lista on laskevassa järjestyksessä: edellinen = vanhempi vuosi.
  const index = years.findIndex((entry) => entry.year === current);
  if (index === -1) return { older: null, newer: null };
  return {
    older: years[index + 1] ?? null,
    newer: years[index - 1] ?? null,
  };
}

export function countLabel(count: number): string {
  if (count === 1) return "1 kirjoitus";
  return `${count} kirjoitusta`;
}
