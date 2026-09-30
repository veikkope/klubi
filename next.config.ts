import type { NextConfig } from "next";
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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async redirects() {
    return [
      ...legacyRedirects,
      ...blogspotRedirects,
      // Klubi ei ota jäsenhakemuksia sivuston kautta; lomakesivu poistettu.
      { source: "/klubi/liity", destination: "/klubi", permanent: true },
    ];
  },
};

export default nextConfig;
