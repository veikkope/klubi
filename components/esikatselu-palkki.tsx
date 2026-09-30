"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

/**
 * Näkyvä ilmoitus, kun selaimessa on esikatselutila (draft mode) päällä.
 *
 * Tila kytkeytyy, kun Studion esikatselua (Presentation) on käytetty, ja se jää
 * selaimen evästeeseen. Silloin sivusto näyttää myös julkaisemattomat luonnokset,
 * mikä näyttää siltä kuin ne olisivat julkisia. Palkki kertoo tilasta ja antaa
 * poistua siitä. Studion esikatseluikkunassa (iframe) palkkia ei näytetä.
 */

const eiIframessa = () => window.self === window.top;
const tilaa = () => () => {};

export function EsikatseluPalkki() {
  const polku = usePathname();
  // Palvelimella false: palkki ilmestyy vasta selaimessa, kun iframe on tarkistettu.
  const nayta = useSyncExternalStore(tilaa, eiIframessa, () => false);
  if (!nayta) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-b border-brass bg-brass-tint px-4 py-2 text-center text-sm font-medium text-brass-tint-text"
    >
      <span>
        Esikatselutila: näet myös julkaisemattomat luonnokset. Kävijät eivät näe niitä.
      </span>
      {/* Tavallinen linkki (ei next/link): evästeen poisto vaatii täyden pyynnön. */}
      <a
        href={`/api/draft-mode/disable?paluu=${encodeURIComponent(polku)}`}
        className="inline-flex min-h-9 items-center font-semibold underline underline-offset-4 hover:no-underline"
      >
        Poistu esikatselusta
      </a>
    </div>
  );
}
