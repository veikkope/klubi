import type { DocumentActionComponent, DocumentActionProps, SanityDocumentLike } from "sanity";

import { tyhjennaKopiosta } from "../../lib/ohjaukset";

type KopioProps = DocumentActionProps & { mapDocument?: (doc: SanityDocumentLike) => SanityDocumentLike };

/**
 * Sanityn Kopioi-toiminto ilman kenttiä, joiden varassa vanhat osoitteet
 * ohjautuvat (`KOPIOSTA_POISTETTAVAT`, lib/ohjaukset.ts; docs/24 askel 8).
 * Muuten kopio, jonka `_updatedAt` on uudempi, veisi alkuperäisen aiemmat
 * osoitteet (ratkaiseOhjaus valitsee uusimman). Askel 9 laajentaa tämän
 * "Kopioi pohjaksi" -toiminnoksi.
 *
 * `mapDocument` on Sanityn DuplicateActionin @beta-ominaisuus: tarkista se
 * Sanityn pääversiopäivityksessä (docs/07).
 */
/** Vakaa funktio: uusi funktio joka renderöinnillä purkaisi toiminnon muistin. */
const ilmanVanhojaOsoitteita = (doc: SanityDocumentLike) =>
  tyhjennaKopiosta(doc as SanityDocumentLike & Record<string, unknown>);

export function kopioIlmanVanhojaOsoitteita(alkuperainen: DocumentActionComponent): DocumentActionComponent {
  const kopioi = alkuperainen as unknown as (props: KopioProps) => ReturnType<DocumentActionComponent>;
  const Kaare: DocumentActionComponent = (props) =>
    kopioi({ ...props, mapDocument: ilmanVanhojaOsoitteita });
  Kaare.action = alkuperainen.action;
  Kaare.displayName = `IlmanVanhojaOsoitteita(${alkuperainen.displayName ?? alkuperainen.action ?? "toiminto"})`;
  return Kaare;
}
