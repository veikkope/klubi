/**
 * Loukkaantumistaulukon yhteenveto (docs/20): määrä, vuodet, vammat kehonosittain
 * ja määrä vuosittain kaaviota varten. Puhdas moduuli: `npm run test:litmanen`.
 *
 * Toimii mille tahansa taulukolle, jossa on vuosi- ja vammasarake (tunnistetaan
 * sarakkeen avaimesta tai otsikosta), joten isä voi muokata taulukkoa vapaasti.
 */

export interface Sarake {
  key: string;
  label: string;
}
export interface Rivi {
  cells?: { key: string; value?: string | null }[] | null;
}

/** Vammaryhmät tarkistusjärjestyksessä: ensimmäinen osuma ratkaisee. */
const RYHMAT: { nimi: string; kuvio: RegExp }[] = [
  { nimi: "Akillesjänne", kuvio: /akilles/i },
  { nimi: "Nilkka", kuvio: /nilkka|nivelside/i },
  { nimi: "Polvi", kuvio: /polvi/i },
  { nimi: "Reisi ja nivus", kuvio: /reisi|nivus/i },
  { nimi: "Pohje", kuvio: /pohje/i },
  { nimi: "Pää, silmä ja korva", kuvio: /aivotärähdys|silmä|korva/i },
  { nimi: "Sairaudet", kuvio: /virus|flunssa|korona|sydän/i },
  { nimi: "Murtumat", kuvio: /murtuma/i },
];
const MUUT = "Muut";

export function vammaryhma(vamma: string): string {
  return RYHMAT.find((r) => r.kuvio.test(vamma))?.nimi ?? MUUT;
}

function sarakeAvain(sarakkeet: Sarake[], kuvio: RegExp): string | null {
  return sarakkeet.find((s) => kuvio.test(s.key) || kuvio.test(s.label))?.key ?? null;
}

function arvo(rivi: Rivi, avain: string): string {
  return rivi.cells?.find((c) => c.key === avain)?.value?.trim() ?? "";
}

export interface LoukkaantumisYhteenveto {
  maara: number;
  ensimmainenVuosi: number;
  viimeisinVuosi: number;
  /** Jokainen vuosi väliltä, myös ne joina vammoja ei ollut (kaavion akseli). */
  vuosittain: { vuosi: number; maara: number }[];
  /** Vammaryhmät yleisimmästä harvinaisimpaan; "Muut" aina viimeisenä. */
  ryhmittain: { nimi: string; maara: number }[];
  /** Vuodet, joina vammoja oli eniten (tasapelissä useita). */
  pahimmatVuodet: number[];
  pahinMaara: number;
}

export function loukkaantumisYhteenveto(sarakkeet: Sarake[], rivit: Rivi[]): LoukkaantumisYhteenveto | null {
  const vuosiAvain = sarakeAvain(sarakkeet, /^vuosi$/i);
  const vammaAvain = sarakeAvain(sarakkeet, /^vamma$/i);
  if (!vuosiAvain || !vammaAvain) return null;

  const tapaukset = rivit
    .map((r) => ({ vuosi: Number.parseInt(arvo(r, vuosiAvain), 10), vamma: arvo(r, vammaAvain) }))
    .filter((t) => Number.isFinite(t.vuosi) && t.vamma);
  if (tapaukset.length === 0) return null;

  const vuodet = tapaukset.map((t) => t.vuosi);
  const ensimmainenVuosi = Math.min(...vuodet);
  const viimeisinVuosi = Math.max(...vuodet);

  const perVuosi = new Map<number, number>();
  for (const t of tapaukset) perVuosi.set(t.vuosi, (perVuosi.get(t.vuosi) ?? 0) + 1);
  const vuosittain = Array.from({ length: viimeisinVuosi - ensimmainenVuosi + 1 }, (_, i) => {
    const vuosi = ensimmainenVuosi + i;
    return { vuosi, maara: perVuosi.get(vuosi) ?? 0 };
  });
  const pahinMaara = Math.max(...vuosittain.map((v) => v.maara));

  const perRyhma = new Map<string, number>();
  for (const t of tapaukset) {
    const nimi = vammaryhma(t.vamma);
    perRyhma.set(nimi, (perRyhma.get(nimi) ?? 0) + 1);
  }
  const ryhmittain = [...perRyhma.entries()]
    .map(([nimi, maara]) => ({ nimi, maara }))
    .sort(
      (a, b) =>
        Number(a.nimi === MUUT) - Number(b.nimi === MUUT) || b.maara - a.maara || a.nimi.localeCompare(b.nimi, "fi"),
    );

  return {
    maara: tapaukset.length,
    ensimmainenVuosi,
    viimeisinVuosi,
    vuosittain,
    ryhmittain,
    pahimmatVuodet: vuosittain.filter((v) => v.maara === pahinMaara).map((v) => v.vuosi),
    pahinMaara,
  };
}
