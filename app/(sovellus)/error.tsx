"use client";

import { useEffect } from "react";

import { Virhesivu } from "@/components/virhesivu";

/**
 * Odottamaton virhe sovellusnäkymässä. "Yritä uudelleen" hakee näkymän datan
 * uudelleen (retry, Next 16.3); keskeneräinen arvostelu on tallessa laitteella (luonnos).
 */
export default function Virhe({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Virhesivu
      otsikko="Jotain meni vikaan"
      teksti="Näkymän lataaminen epäonnistui. Vika on meidän päässämme, ei sinun. Keskeneräinen arvostelusi on tallessa tässä laitteessa."
      toiminto={
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-6 text-sm font-medium text-on-primary transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Yritä uudelleen
        </button>
      }
    />
  );
}
