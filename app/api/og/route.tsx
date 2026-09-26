import { ImageResponse } from "next/og";

import { siteName } from "@/lib/site";

/**
 * Brändätty OG-kuva sivuille joilla ei ole omaa kuvaa.
 *
 * `buildMetadata` osoittaa tänne fallbackina, joten jokainen sivu saa
 * jaettaessa tunnistettavan esikatselukuvan sen sijaan että jakolinkki näyttäisi
 * tyhjältä. Kutsu: /api/og?title=Sivun%20otsikko&eyebrow=Jalkapalloarkisto
 *
 * Ei ulkoisia fontteja tarkoituksella: ajonaikainen fonttihaku CDN:stä on
 * hauras ja kaatuisi juuri silloin kun linkkiä jaetaan. Oletusfontti riittää,
 * koska suomen ääkköset ovat Latin-1-alueella.
 */

const BRAND = "#1e3a8a";
const BRAND_DEEP = "#172554";
const ACCENT = "#93c5fd";

export function GET(request: Request): Response {
  const { searchParams } = new URL(request.url);
  const rawTitle = searchParams.get("title")?.trim();
  const eyebrow = searchParams.get("eyebrow")?.trim();

  // Liian pitkä otsikko rikkoisi taiton — katkaistaan siististi.
  const title =
    rawTitle && rawTitle.length > 0
      ? rawTitle.length > 90
        ? `${rawTitle.slice(0, 87).trimEnd()}…`
        : rawTitle
      : siteName;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundImage: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DEEP} 100%)`,
          color: "#ffffff",
        }}
      >
        {eyebrow ? (
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: ACCENT,
            }}
          >
            {eyebrow}
          </div>
        ) : (
          <div style={{ display: "flex" }} />
        )}

        <div
          style={{
            display: "flex",
            fontSize: title.length > 55 ? 62 : 78,
            lineHeight: 1.12,
            letterSpacing: -1.5,
            fontWeight: 600,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 28,
            color: ACCENT,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 56,
              height: 5,
              backgroundColor: ACCENT,
            }}
          />
          {siteName}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
