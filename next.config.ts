import type { NextConfig } from "next";
import { blogspotRedirects, legacyRedirects } from "./lib/redirects";

const nextConfig: NextConfig = {
  // Otetaan typedRoutes käyttöön sprintissä 2 kun kaikki reitit on luotu.
  // experimental: { typedRoutes: true },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async redirects() {
    return [...legacyRedirects, ...blogspotRedirects];
  },
};

export default nextConfig;
