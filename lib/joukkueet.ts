/**
 * Joukkueiden nimien vertailu (otteluohjelma, docs/13).
 *
 * Studiossa käsin lisätty ottelu yhdistyy automaattisesti haettuun, kun päivä
 * ja joukkueet täsmäävät (lib/ottelut.ts). Vertailu ohittaa kirjainkoon,
 * välilyönnit ja välimerkit, mutta kirjoitusvirhe ("FC Lahi", "Soumi")
 * rikkoo yhdistämisen huomaamatta. `ehdotaJoukkue` löytää lähes samannimisen
 * tunnetun joukkueen, jotta Studio voi kysyä "Tarkoititko…?".
 *
 * Puhdas moduuli: testataan komennolla `npm run test:joukkueet`.
 */

/** Vertailumuoto: "FC Lahti" → "fclahti", "Suomi " → "suomi". */
export function normalizeTeam(name: string): string {
  return name.toLocaleLowerCase("fi-FI").replace(/[^a-zåäö0-9]/g, "");
}

/** Miesten A-maajoukkue on tasan "Suomi" (kirjainkoko ja välimerkit ohitetaan). */
export const HUUHKAJAT = "Suomi";

/**
 * Muokkausetäisyys (Damerau–Levenshtein, OSA): lisäys, poisto, vaihto ja
 * vierekkäisten merkkien paikanvaihto ("Soumi" → "Suomi") ovat kukin yksi muutos.
 */
function editointietaisyys(a: string, b: string): number {
  if (a === b) return 0;
  const d = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const kustannus = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + kustannus);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

/**
 * Lähes oikein kirjoitettu nimi → tunnettu nimi, jota todennäköisesti
 * tarkoitettiin. Palauttaa null, jos nimi täsmää johonkin tunnettuun tai on
 * selvästi eri joukkue (esim. vastustajamaa "Albania").
 *
 * Sallittu ero: 1 merkki lyhyissä nimissä (≤ 5 merkkiä), muuten 2. Alle
 * 4-merkkisiä lyhenteitä ei verrata: HJK/SJK ja TPS/VPS eroavat yhdellä
 * merkillä, joten esim. cup-vastustaja "JJK" saisi aiheettoman ehdotuksen.
 */
export function ehdotaJoukkue(nimi: string, tunnetut: readonly string[]): string | null {
  const n = normalizeTeam(nimi);
  if (n.length < 4) return null;
  let paras: { nimi: string; etaisyys: number } | null = null;
  for (const tunnettu of tunnetut) {
    const t = normalizeTeam(tunnettu);
    if (t === n) return null;
    if (t.length < 4) continue;
    const raja = Math.min(n.length, t.length) <= 5 ? 1 : 2;
    const etaisyys = editointietaisyys(n, t);
    if (etaisyys <= raja && (!paras || etaisyys < paras.etaisyys)) paras = { nimi: tunnettu, etaisyys };
  }
  return paras?.nimi ?? null;
}
