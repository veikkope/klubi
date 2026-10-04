/**
 * Uutiskategoriat (sanity/schemas/documents/uutisKategoria.ts). Uutinen viittaa
 * kategorioihin kentässä `kategoriat`; kortit ja sivut saavat ne muodossa
 * `{ _id, value, label }`, jossa `value` on polku (?kategoria=…).
 */
import { defineQuery } from "next-sanity";

/** Uutisen kategoriat projektioon (`categories`). Julkaisemattomat viittaukset jäävät pois. */
export const uutisenKategoriat = `"categories": (kategoriat[]->{ _id, "value": slug.current, "label": nimi })[defined(value) && defined(label)]`;

/** Kategoriat, joissa on vähintään yksi uutinen: uutislistan suodatin. */
export const kaytetytKategoriatQuery = defineQuery(`
  *[_type == "uutisKategoria" && defined(slug.current)
    && count(*[_type == "uutinen" && defined(slug.current) && references(^._id)]) > 0]
    | order(coalesce(jarjestys, 9999) asc, lower(nimi) asc){ _id, "value": slug.current, "label": nimi }
`);

/** Kategoria polun tai aiemman polun perusteella. Parametri: $polku. */
export const kategoriaPolullaQuery = defineQuery(`
  *[_type == "uutisKategoria" && (slug.current == $polku || $polku in aiemmatPolut)]
    | order(_updatedAt desc)[0]{ _id, "value": slug.current, "label": nimi, kuvaus }
`);
