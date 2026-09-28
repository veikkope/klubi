"use client";

/**
 * Viimeinen varasivu, kun myös juurilayout kaatuu. Korvaa koko dokumentin,
 * joten tyylit ovat inline eikä sivupohjaa ole käytettävissä.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fi">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: "4rem 1rem", color: "#1a1a1a" }}>
        <main style={{ maxWidth: "40rem", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2rem" }}>Jotain meni vikaan</h1>
          <p style={{ lineHeight: 1.6 }}>
            Sivuston lataaminen epäonnistui. Yritä hetken kuluttua uudelleen tai palaa{" "}
            {/* Tarkoituksellisesti täysi sivunlataus: sovellus on kaatunut, joten
                asiakaspuolen reitittimeen ei voi luottaa. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/">etusivulle</a>.
          </p>
          <button type="button" onClick={reset} style={{ minHeight: 44, padding: "0 1.5rem", fontSize: "1rem" }}>
            Yritä uudelleen
          </button>
        </main>
      </body>
    </html>
  );
}
