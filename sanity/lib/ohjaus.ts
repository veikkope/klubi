import "server-only";

import { stegaClean } from "next-sanity";
import { notFound, permanentRedirect, redirect } from "next/navigation";

import { linkinOsoite, linkinTyyppi } from "@/lib/linkki";
import { ratkaiseOhjaus, type OhjausKartta } from "@/lib/ohjaukset";
import { sanityFetch } from "./fetch";
import { ohjauskarttaQuery, type OhjauskarttaRaaka } from "./queries/ohjaukset";

const TYHJA: OhjauskarttaRaaka = { ohjaukset: [], dokumentit: [] };

/**
 * Sisältöä ei löytynyt: ohjataan isän ohjaukseen tai dokumentin nykyiseen
 * osoitteeseen, muuten 404 (docs/24 askel 8, docs/07).
 *
 * Jokainen app/(public)-reitti kutsuu tätä `notFound()`:n sijaan:
 * `if (!x) return ohjaaTaiEiLoydy(polku);`. Testi (`npm run test:ohjaukset`)
 * valvoo tätä, koska muuten lyhytosoitteet ja muuttuneet osoitteet eivät
 * toimisi reitin alla.
 *
 * Kartta haetaan tagilla `ohjaus`: webhook tyhjentää sen, kun ohjaus tai
 * ohjattava dokumentti muuttuu. Myös välimuistiin tallennettu ohjaus vanhenee
 * samalla tagilla. Hakuvirhettä ei käsitellä (kuten sanityFetch muualla).
 */
export async function ohjaaTaiEiLoydy(polku: string): Promise<never> {
  const raaka = await sanityFetch<OhjauskarttaRaaka>({
    query: ohjauskarttaQuery,
    tags: ["ohjaus"],
    fallback: TYHJA,
  });
  // Luonnosnäkymässä merkkijonoissa on stega-merkit: vertailu vaatii puhtaat arvot.
  const puhdas = stegaClean(raaka);
  const kartta: OhjausKartta = {
    ohjaukset: (puhdas.ohjaukset ?? []).map((o) => ({
      _id: o._id,
      lahde: o.lahde,
      kohdeHref: linkinOsoite(o.minne),
      // Sivuston sivu: ketju päättyy kohteen nykyiseen reittiin (lib/ohjaukset.ts).
      kohdeOnSivu: linkinTyyppi(o.minne) === "sivu",
    })),
    dokumentit: puhdas.dokumentit ?? [],
  };
  const tulos = ratkaiseOhjaus(polku, kartta);
  if (tulos) {
    if (tulos.pysyva) permanentRedirect(tulos.kohde);
    redirect(tulos.kohde);
  }
  notFound();
}
