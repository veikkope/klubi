import type { DocumentActionComponent, DocumentActionProps } from "sanity";

import { onLukittuSivu } from "../../lib/path";

/**
 * Lukittujen sivujen (lib/path.ts KOODIIN_SIDOTUT_SIVUT: osioiden sivut ja
 * tietosuojaseloste) poisto, julkaisun peruminen ja kopiointi estetään
 * (docs/23 Y21, docs/24 askel 3). Sivusto hakee ne kiinteällä polulla, ja
 * alatunniste ja lomakkeet linkittävät tietosuojaan: poisto rikkoisi ne
 * hiljaa. Kopio toisi samalle polulle toisen dokumentin, jonka polku hylätään.
 *
 * Alkuperäinen toiminto kutsutaan aina (sen hookit pysyvät samoina), ja
 * lukitulla sivulla tulos vain poistetaan käytöstä selityksen kera.
 */
function onLukittu({ id, draft, published }: DocumentActionProps): boolean {
  const slug = ((published ?? draft) as { slug?: { current?: string } } | null)?.slug?.current;
  return onLukittuSivu(id, slug);
}

export function lukitulleSivulle(alkuperainen: DocumentActionComponent): DocumentActionComponent {
  const Kaare: DocumentActionComponent = (props) => {
    const tulos = alkuperainen(props);
    if (!tulos || !onLukittu(props)) return tulos;
    return {
      ...tulos,
      disabled: true,
      title:
        "Sivusto käyttää tätä sivua kiinteällä osoitteella, joten sitä ei voi poistaa, piilottaa eikä kopioida. " +
        "Muokkaa sisältöä vapaasti.",
    };
  };
  Kaare.action = alkuperainen.action;
  Kaare.displayName = `Lukittu(${alkuperainen.displayName ?? alkuperainen.action ?? "toiminto"})`;
  return Kaare;
}
