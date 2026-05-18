import type { NextConfig } from "next";
import { legacyRedirects } from "./lib/redirects";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
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
    return legacyRedirects;
  },
};

export default nextConfig;
