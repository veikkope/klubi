"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Kävijätilastot GoatCounteriin (veikko.goatcounter.com). Evästeetön: ei
 * tallenna IP-osoitetta eikä tunnista kävijää, joten evästebanneria ei
 * tarvita (tietosuojaseloste, kohta Kävijätilastot).
 *
 * Sivunvaihdot tapahtuvat selaimessa ilman sivun latausta, joten
 * automaattinen laskenta latauksessa on pois (no_onload) ja jokainen polku
 * lasketaan tässä, myös ensimmäinen.
 */
const LASKURI = "https://veikko.goatcounter.com/count";

declare global {
  interface Window {
    goatcounter?: { count: (arvot: { path: string }) => void };
  }
}

export function Kavijatilasto() {
  const polku = usePathname();
  const [ladattu, setLadattu] = useState(false);

  useEffect(() => {
    if (ladattu && polku) window.goatcounter?.count({ path: polku });
  }, [ladattu, polku]);

  return (
    <Script
      src="https://gc.zgo.at/count.js"
      data-goatcounter={LASKURI}
      data-goatcounter-settings='{"no_onload": true}'
      strategy="afterInteractive"
      onReady={() => setLadattu(true)}
    />
  );
}
