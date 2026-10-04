import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

/**
 * robots.txt.
 *
 * Tekoälycrawlerit (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot)
 * päästetään sisään tarkoituksella. Perustelu: sisältö on julkista
 * yhdistystietoa ja jalkapalloarkistoa, yhdistys hyötyy löydettävyydestä,
 * eikä sivustolla ole suojattavaa tai myytävää sisältöä.
 *
 * TÄMÄ ON YHDISTYKSEN PÄÄTÖS, EI TEKNINEN OLETUS. Jos hallitus haluaa estää
 * tekoälycrawlerit, vaihda `aiCrawlers`-listan `allow` → `disallow`.
 * Katso `docs/11-maali-ja-rinnakkaistoteutus.md` §7.
 */

const aiCrawlers = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "CCBot",
  "Applebot-Extended",
];

/** Polut joita ei indeksoida: hallinta, rajapinnat, lomakkeiden paluusivut. */
const disallowedPaths = ["/studio", "/studio/", "/api/"];

/**
 * Jakokuvien generaattori on rajapinnan alla, mutta somepalveluiden haku-
 * botit (X, LinkedIn) noudattavat robots.txt:tä: ilman poikkeusta jaetun
 * linkin esikatselukuva jää puuttumaan. Tarkempi sääntö voittaa /api/-eston.
 */
const allowedPaths = ["/", "/api/og"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: allowedPaths,
        disallow: disallowedPaths,
      },
      ...aiCrawlers.map((userAgent) => ({
        userAgent,
        allow: allowedPaths,
        disallow: disallowedPaths,
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
