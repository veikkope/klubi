import { cache } from "react";
import { stegaClean } from "next-sanity";

import { defaultNavigation } from "@/lib/defaults";
import { ratkaiseNavigaatio, type RaakaNavigaatioKohta } from "@/lib/navigaatio";
import { piilotaTyhjat } from "@/lib/osiot";
import type { NavigationItem } from "@/lib/types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { navigationQuery } from "@/sanity/lib/queries";
import { haeTyhjatOsiot } from "@/sanity/lib/tyhjat-osiot";

/**
 * Päävalikko kävijälle: linkit ratkaistu (lib/navigaatio.ts), stega-merkit
 * pois osoitteista ja tyhjät osiot piilossa (lib/osiot.ts). Ylätunniste ja
 * alatunniste kutsuvat tätä; `cache` tekee haun kerran sivua kohden.
 *
 * Tagi on vain `navigaatio`, ei `linkit` (docs/24 §2.5): valikko on jokaisen
 * sivun layoutissa, ja `linkit` tyhjenee minkä tahansa linkitettävän sisällön
 * muuttuessa. Kohteen osoitteen muutos näkyy valikossa siksi minuutin
 * viiveellä (fetch.ts, revalidate 60), kuten tekstin linkeissä.
 */
export const haeNavigaatio = cache(async (): Promise<NavigationItem[]> => {
  const [nav, tyhjat] = await Promise.all([
    sanityFetch<{ items?: RaakaNavigaatioKohta[] | null }>({
      query: navigationQuery,
      tags: ["navigaatio"],
      fallback: defaultNavigation,
    }),
    haeTyhjatOsiot(),
  ]);

  // Luonnosnäkymässä merkkijonoissa voi olla stega-merkkejä, jotka rikkoisivat
  // linkit ja aktiivisen kohteen vertailun (pathname === href). Puhdistetaan
  // vain osoitteet, jotta otsikoiden klikkaa-ja-muokkaa toimii yhä.
  const items = ratkaiseNavigaatio(nav.items).map((item) => ({
    ...item,
    href: stegaClean(item.href),
    ...(item.children ? { children: item.children.map((c) => ({ ...c, href: stegaClean(c.href) })) } : {}),
  }));
  return piilotaTyhjat(items, tyhjat);
});
