import { stegaClean } from "next-sanity";

import { AlbumGrid } from "@/components/gallery/album-grid";
import type { AlbumImage } from "@/lib/types";

export type KuvasarjaData = {
  kuvat?: AlbumImage[] | null;
  kuvaus?: string | null;
  asettelu?: string | null;
};

/**
 * Kuvasarja tekstin seassa (docs/24 askel 2, skeema sanity/schemas/objects/kuvasarja.ts).
 *
 * Sama ruudukko ja suurennos kuin galleria-albumissa, mutta kolme saraketta
 * tekstipalstan levyisenä. Yhteinen kuvaus on kuvien alla, ja se nimeää
 * kuvat, joilla ei ole omaa kuvausta ("Klubin vappu 2026, kuva 3/9").
 *
 * `asettelu` puhdistetaan stega-merkeistä ennen vertailua: luonnosnäkymässä
 * merkkijonossa on näkymättömiä merkkejä, eikä "kokonaisena" muuten täsmäisi.
 */
export function Kuvasarja({ value }: { value: KuvasarjaData }) {
  const kuvat = value.kuvat ?? [];
  if (kuvat.length === 0) return null;
  const kuvaus = value.kuvaus?.trim();
  const kokonaisena = stegaClean(value.asettelu) === "kokonaisena";

  return (
    <figure className="mt-8">
      <AlbumGrid
        images={kuvat}
        albumTitle={kuvaus || "Kuvasarja"}
        kokonaisena={kokonaisena}
        sarakkeet={3}
        tekstinSeassa
      />
      {kuvaus && <figcaption className="mt-2 text-sm text-muted">{kuvaus}</figcaption>}
    </figure>
  );
}
