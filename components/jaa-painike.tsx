"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Share2 } from "lucide-react";

type Tila = "lepo" | "kopioitu" | "virhe";

const VIESTI: Record<Exclude<Tila, "lepo">, string> = {
  kopioitu: "Linkki kopioitu",
  virhe: "Kopiointi ei onnistunut",
};

/**
 * Jaa-painike ilman kolmansien osapuolten widgettejä (CLAUDE.md).
 *
 * - Kosketuslaitteella avaa laitteen oman jakovalikon (`navigator.share`):
 *   WhatsApp, viestit, sähköposti, mitä käyttäjällä on.
 * - Tietokoneella kopioi linkin leikepöydälle. Siellä jakovalikko on
 *   harvinainen ja kömpelö, ja linkin liittäminen on tavallisin tapa jakaa.
 *
 * Tulos kerrotaan näkyvästi ja ruudunlukijalle (`role="status"`).
 */
export function JaaPainike({ url, otsikko }: { url: string; otsikko: string }) {
  const [tila, setTila] = useState<Tila>("lepo");
  const ajastin = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(ajastin.current), []);

  function nayta(uusi: Exclude<Tila, "lepo">) {
    setTila(uusi);
    clearTimeout(ajastin.current);
    ajastin.current = setTimeout(() => setTila("lepo"), 2500);
  }

  async function jaa() {
    const data = { title: otsikko, url };
    const kosketus = window.matchMedia("(pointer: coarse)").matches;
    if (kosketus && navigator.share && (!navigator.canShare || navigator.canShare(data))) {
      try {
        await navigator.share(data);
        return;
      } catch (e) {
        // Käyttäjä sulki jakovalikon: ei virhe. Muu virhe → kopioidaan linkki.
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      nayta("kopioitu");
    } catch {
      nayta("virhe");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={jaa}
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-accent transition hover:text-accent-hover print:hidden"
      >
        {tila === "kopioitu" ? (
          <Check aria-hidden size={16} strokeWidth={2.25} />
        ) : (
          <Share2 aria-hidden size={16} />
        )}
        {tila === "lepo" ? "Jaa" : VIESTI[tila]}
      </button>
      <span role="status" className="sr-only">
        {tila === "lepo" ? "" : VIESTI[tila]}
      </span>
    </>
  );
}
