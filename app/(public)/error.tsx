"use client";

import { useEffect } from "react";

import { Virhesivu } from "@/components/virhesivu";

/**
 * Odottamaton virhe sivua renderöitäessä. Ylä- ja alapalkki säilyvät, koska
 * virhe rajautuu tähän reittiryhmään. "Yritä uudelleen" renderöi osion uudestaan.
 */
export default function Virhe({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Virhesivu
      otsikko="Jotain meni vikaan"
      teksti="Sivun lataaminen epäonnistui. Vika on meidän päässämme, ei sinun. Yritä hetken kuluttua uudelleen."
      toiminto={
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-6 text-sm font-medium text-on-primary transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Yritä uudelleen
        </button>
      }
    />
  );
}
