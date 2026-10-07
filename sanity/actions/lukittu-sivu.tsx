import type { DocumentActionComponent, DocumentActionProps } from "sanity";

import { KOODIIN_SIDOTUT_SIVUT } from "../../lib/path";

/**
 * Lukittujen sivujen (lib/path.ts KOODIIN_SIDOTUT_SIVUT: Klubi-osion pääsivut
 * ja tietosuojaseloste) poisto ja julkaisun peruminen estetään (docs/23 Y21).
 * Sivusto hakee ne kiinteällä polulla, ja alatunniste ja lomakkeet linkittävät
 * tietosuojaan: poisto rikkoisi ne hiljaa.
 *
 * Alkuperäinen toiminto kutsutaan aina (sen hookit pysyvät samoina), ja
 * lukitulla sivulla tulos vain poistetaan käytöstä selityksen kera.
 */
function onLukittu({ draft, published }: DocumentActionProps): boolean {
  const slug = ((published ?? draft) as { slug?: { current?: string } } | null)?.slug?.current;
  return Boolean(slug && KOODIIN_SIDOTUT_SIVUT.includes(slug));
}

export function lukitulleSivulle(alkuperainen: DocumentActionComponent): DocumentActionComponent {
  const Kaare: DocumentActionComponent = (props) => {
    const tulos = alkuperainen(props);
    if (!tulos || !onLukittu(props)) return tulos;
    return {
      ...tulos,
      disabled: true,
      title: "Sivusto käyttää tätä sivua kiinteällä osoitteella, joten sitä ei voi poistaa eikä piilottaa. Muokkaa sisältöä vapaasti.",
    };
  };
  Kaare.action = alkuperainen.action;
  Kaare.displayName = `Lukittu(${alkuperainen.displayName ?? alkuperainen.action ?? "toiminto"})`;
  return Kaare;
}
