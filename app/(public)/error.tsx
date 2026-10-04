"use client";

import { useEffect } from "react";

import { Virhesivu } from "@/components/virhesivu";

/**
 * Odottamaton virhe sivua renderöitäessä. Ylä- ja alapalkki säilyvät, koska
 * virhe rajautuu tähän reittiryhmään. "Yritä uudelleen" hakee osion datan palvelimelta uudelleen (retry, Next 16.3).
 */
export default function Virhe({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
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
          onClick={() => retry()}
          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-6 text-sm font-medium text-on-primary transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Yritä uudelleen
        </button>
      }
    />
  );
}
