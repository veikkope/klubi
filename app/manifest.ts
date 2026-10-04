import type { MetadataRoute } from "next";

import { siteName } from "@/lib/site";

/**
 * Verkkosovelluksen manifesti: puhelimen kotinäytön kuvake (PWA).
 *
 * Klubilaiset käyttävät puhelinta ennen kaikkea ravintola-arvosteluun, joten
 * kuvake avaa suoraan arvostelun (päätetty 4.10.2026). `standalone` piilottaa
 * selaimen palkit. Arvostelu ohjaa lisäämään kuvakkeen lähetyksen jälkeen
 * (kotinaytto-vinkki.tsx). Kuvakkeet: npm run brandikuvat → public/sovellus/.
 *
 * Service workeria ei ole: asennus ei sitä vaadi, ja ilman sitä päivitykset
 * näkyvät heti eikä vanhentunut välimuisti voi jäädä käyttäjälle.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/ravintolat/arvostele",
    name: `Arvostele ravintola – ${siteName}`,
    short_name: "Arvostele",
    description: "Klubilaisten ravintola-arvostelut puhelimella.",
    lang: "fi",
    start_url: "/ravintolat/arvostele",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f6f2",
    theme_color: "#ffffff",
    icons: [
      { src: "/sovellus/kuvake-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/sovellus/kuvake-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/sovellus/kuvake-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
