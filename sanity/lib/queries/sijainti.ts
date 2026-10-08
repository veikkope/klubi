import { VIITTAAJAT } from "./sitemap";

/**
 * Esikatselun Näkyy sivulla -tiedon kysely (docs/24 askel 11): yksi dokumentti
 * `lib/sijainnit.ts`:n `SijaintiDoc`-muodossa. Viittaajat samassa järjestyksessä
 * kuin sitemapin `parent` (`VIITTAAJAT`), joten ensimmäinen linkki on sama kuin
 * sitemapin osoite.
 *
 * Päivittyminen (sanity/presentation.ts): kysely haetaan uudelleen, kun
 * dokumentti itse (julkaistu tai luonnos) tai siihen viittaava dokumentti
 * muuttuu (`SIJAINTI_KUUNTELU`), esim. kategoria, osio tai taulukon lisäys
 * sivun Taulukot-kenttään tai poisto sieltä. Viitatun dokumentin muutos (esim.
 * kommentin uutisen tai kauden karsintasivun osoite) ei päivitä tietoa, ennen
 * kuin lomake avataan uudelleen. Ajan kuluminen (ottelun alkaminen) ei
 * myöskään päivitä avointa lomaketta.
 */
export const SIJAINTI_PROJEKTIO = /* groq */ `
  _id,
  _type,
  "slug": slug.current,
  "nimi": coalesce(title, name, nimi, otsikko),
  category,
  huuhkajatOsio,
  mestaruusmaa,
  osio,
  "pelaajaSlug": pelaaja->slug.current,
  nykyinen,
  aika,
  piilotettu,
  lahde,
  "uutinen": uutinen->{ "nimi": title, "slug": slug.current },
  "ravintola": ravintola->{ "nimi": name, "slug": slug.current },
  "kaudenOttelut": kaudenOttelut->{ "nimi": title, "slug": slug.current, category },
  "viittaajat": select(_type == "jalkapalloTilasto" => ${VIITTAAJAT}{
    _type,
    "slug": slug.current,
    "nimi": coalesce(title, name)
  })
`;

export const SIJAINTI_KYSELY = /* groq */ `*[_id == $id][0]{${SIJAINTI_PROJEKTIO}}`;

/** Kuuntelu: dokumentti (julkaistu ja luonnos) ja siihen viittaavat dokumentit. */
export const SIJAINTI_KUUNTELU = /* groq */ `*[_id in $idt || references($id)]`;

/** Kyselyn ja kuuntelun parametrit julkaistulle tunnukselle. */
export function sijaintiParametrit(julkaistuId: string): { id: string; idt: string[] } {
  return { id: julkaistuId, idt: [julkaistuId, `drafts.${julkaistuId}`] };
}
