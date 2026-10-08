/**
 * Päävalikko ja siitä johdettu alatunniste (docs/24 askel 4, docs/23 Y23).
 *
 * Valikon kohdat ovat linkkiobjekteja (lib/linkki.ts): vanhassa datassa
 * pelkkä osoite, uudessa viittaus sivuun. `ratkaiseNavigaatio` laskee
 * kävijän osoitteet, ja `alatunnisteenSarakkeet` järjestää saman valikon
 * alatunnisteeseen, joten erillistä alatunnisteen listaa ei ylläpidetä.
 *
 * Puhdas moduuli: testit `npm run test:navigaatio`. Haku ja välimuisti:
 * sanity/lib/navigaatio.ts.
 */
import type { NavigationItem } from "./types";
import { linkinOsoite, ratkaiseLinkit, type LinkkiData } from "./linkki";
import { onYleissivuAlavalikossa } from "./yleissivu";

export type RaakaNavigaatioKohta = LinkkiData & {
  label: string;
  highlight?: boolean | null;
  children?: (LinkkiData & { label: string })[] | null;
};

/**
 * Valikko kävijälle:
 *  - alalinkit ilman toimivaa kohdetta jäävät pois
 *  - pääkohta ilman omaa linkkiä saa ensimmäisen alalinkin osoitteen
 *  - pääkohta ilman linkkiä ja alalinkkejä jää pois
 *  - tyhjä alavalikko → ei alavalikkoa
 */
export function ratkaiseNavigaatio(items: readonly RaakaNavigaatioKohta[] | null | undefined): NavigationItem[] {
  const tulos: NavigationItem[] = [];
  for (const item of items ?? []) {
    if (!item) continue;
    const children = ratkaiseLinkit(item.children).map(({ label, href }) => ({ label, href }));
    const href = linkinOsoite(item) ?? children[0]?.href;
    if (!href) continue;
    tulos.push({
      label: item.label,
      href,
      ...(typeof item.highlight === "boolean" ? { highlight: item.highlight } : {}),
      ...(children.length > 0 ? { children } : {}),
    });
  }
  return tulos;
}

/** Riippuvuuksettomassa moduulissa selainkomponenttia varten (lib/yleissivu.ts). */
export { onYleissivuAlavalikossa };

/** Alavalikottomien kohtien sarake alatunnisteessa. */
export const SIVUSTO_SARAKE = "Sivusto";
/** Pääkohdan oma sivu alatunnisteen sarakkeessa, kun alavalikossa ei ole sitä. */
export const YLEISESITTELY = "Yleisesittely";

export type AlatunnisteenSarake = { otsikko: string; linkit: { label: string; href: string }[] };

/**
 * Alatunnisteen linkkisarakkeet valikosta. Kutsutaan vasta, kun tyhjät osiot
 * on piilotettu (`piilotaTyhjat`): kohta, jonka kaikki alalinkit piilotettiin,
 * on silloin alavalikoton ja siirtyy Sivusto-sarakkeeseen.
 *  1. Alavalikottomat kohdat valikon järjestyksessä sarakkeeseen "Sivusto"
 *     (ensimmäisenä; jätetään pois, jos tyhjä).
 *  2. Jokainen alavalikollinen kohta omana sarakkeenaan, otsikkona kohdan nimi.
 *     Jos alavalikossa ei ole kohdan omaa sivua, ensimmäisenä "Yleisesittely".
 */
export function alatunnisteenSarakkeet(items: readonly NavigationItem[]): AlatunnisteenSarake[] {
  const sivusto = items
    .filter((item) => !item.children?.length)
    .map(({ label, href }) => ({ label, href }));
  const sarakkeet: AlatunnisteenSarake[] = sivusto.length > 0 ? [{ otsikko: SIVUSTO_SARAKE, linkit: sivusto }] : [];
  for (const item of items) {
    if (!item.children?.length) continue;
    sarakkeet.push({
      otsikko: item.label,
      linkit: [
        ...(onYleissivuAlavalikossa(item) ? [] : [{ label: YLEISESITTELY, href: item.href }]),
        ...item.children.map(({ label, href }) => ({ label, href })),
      ],
    });
  }
  return sarakkeet;
}
