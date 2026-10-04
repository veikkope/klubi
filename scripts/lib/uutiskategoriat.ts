/**
 * Uutiskategoriat, jotka olivat koodissa ennen siirtoa Sanityyn (4.10.2026),
 * ja muunnos vanhoista merkkijonoarvoista viittauksiksi. Käyttäjät:
 * scripts/patch-uutiskategoriat.ts (siirto) sekä blogin ja vanhan sivuston
 * tuontiskriptit, jotka tuottavat yhä merkkijonoarvoja (parse-*.ts).
 *
 * Dokumentti-id on `uutisKategoria-<alkuperäinen polku>`, joten tuonnit voivat
 * viitata siihen, vaikka sihteeri myöhemmin nimeäisi kategorian uudelleen.
 */

export type Siemen = { polku: string; nimi: string; jarjestys: number; aiemmatPolut?: string[] };

export const KATEGORIASIEMENET: Siemen[] = [
  { polku: "otteluraportti", nimi: "Ottelutapahtuma", jarjestys: 10 },
  { polku: "kannattajakulttuuri", nimi: "Kannattajakulttuuri", jarjestys: 20 },
  { polku: "tiedote", nimi: "Tiedote", jarjestys: 30 },
  // Entinen "Jäsentieto" yhdistettiin Tapahtumiin 30.9.2026.
  { polku: "tapahtumaraportti", nimi: "Tapahtumat", jarjestys: 40, aiemmatPolut: ["jasentieto"] },
  { polku: "jalkapallo", nimi: "Jalkapallo", jarjestys: 50 },
  { polku: "ravintola", nimi: "Ravintola", jarjestys: 60 },
  { polku: "blogi", nimi: "Blogikirjoitus", jarjestys: 70 },
  { polku: "palloveikkaus", nimi: "Palloveikkaus", jarjestys: 80 },
  { polku: "matkakuvaus", nimi: "Matkakuvaus", jarjestys: 90 },
];

const nykyinen = new Map<string, string>();
for (const s of KATEGORIASIEMENET) {
  nykyinen.set(s.polku, s.polku);
  for (const vanha of s.aiemmatPolut ?? []) nykyinen.set(vanha, s.polku);
}

export const kategoriaId = (polku: string) => `uutisKategoria-${polku}`;

export function kategoriaDokumentti(s: Siemen) {
  return {
    _id: kategoriaId(s.polku),
    _type: "uutisKategoria",
    nimi: s.nimi,
    slug: { _type: "slug", current: s.polku },
    jarjestys: s.jarjestys,
    ...(s.aiemmatPolut?.length ? { aiemmatPolut: s.aiemmatPolut } : {}),
  };
}

/** Vanhat merkkijonoarvot → `kategoriat`-kentän viittaukset. Tuntemattomat ohitetaan. */
export function kategoriaViittaukset(arvot: readonly string[] | null | undefined) {
  const polut: string[] = [];
  for (const arvo of arvot ?? []) {
    const polku = nykyinen.get(arvo);
    if (polku && !polut.includes(polku)) polut.push(polku);
  }
  return polut.map((polku) => ({ _type: "reference" as const, _ref: kategoriaId(polku), _key: polku }));
}

/** Arvot, joita siirto ei tunne (raportoidaan, ei arvata). */
export const tuntematonKategoria = (arvo: string) => !nykyinen.has(arvo);
