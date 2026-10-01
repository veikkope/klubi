import type { NextConfig } from "next";
import { LITMANEN_PATH } from "./lib/path";
import { blogspotRedirects, legacyRedirects } from "./lib/redirects";

const nextConfig: NextConfig = {
  // Otetaan typedRoutes käyttöön sprintissä 2 kun kaikki reitit on luotu.
  experimental: {
    // typedRoutes: true,
    serverActions: {
      // Arvostelulomakkeen kuvat (docs/18): 3 × enintään 1,3 Mt (lib/arvostelukuvat.ts)
      // + teksti. Oletus 1 Mt ei riitä; Vercelin kova raja on 4,5 Mt.
      bodySizeLimit: "4mb",
    },
  },
  images: {
    // Kuvat skaalataan Sanityn CDN:ssä, ei Vercelin Image Optimizationissa
    // (kiintiö, docs/16 suorituskyky-8). Ks. lib/sanity-image-loader.ts.
    loader: "custom",
    loaderFile: "./lib/sanity-image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async headers() {
    return [
      {
        // Vercelin osoitteet (klubi-blond.vercel.app ja esikatselut) eivät saa
        // päätyä hakukoneisiin: sama sisältö olisi kahdessa osoitteessa, ja
        // väliaikainen osoite voisi kilpailla oikean domainin kanssa
        // (docs/16, julkaisun tarkistuslista kohta 17). Oikea domain ei osu
        // ehtoon, joten se pysyy indeksoitavana.
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async redirects() {
    return [
      ...legacyRedirects,
      ...blogspotRedirects,
      // Klubi ei ota jäsenhakemuksia sivuston kautta; lomakesivu poistettu.
      { source: "/klubi/liity", destination: "/klubi", permanent: true },
      // Pelaajalista korvautui Litmanen-osiolla (profiili + loukkaantumiset).
      { source: "/jalkapalloarkisto/pelaajat", destination: LITMANEN_PATH, permanent: true },
    ];
  },
};

export default nextConfig;
