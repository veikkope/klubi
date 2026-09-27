import { readFile } from "node:fs/promises";
import { join } from "node:path";

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

// Samat arvot kuin app/globals.css (tyyliopas): yönsininen pohja, vaalea
// teksti ja yläotsakkeen sävy tummalla pohjalla.
const NAVY = "#141f4d";
const MUTED = "#d4d8f0";
const EYEBROW = "#aeb6f2";

// Valkoinen logomerkki data-URI:na. Luetaan tiedostosta prosessin juuresta
// suhteutettuna, jolloin Next jäljittää sen mukaan serverless-funktioon.
let markDataUri: string | null = null;
async function whiteMark(): Promise<string> {
  if (!markDataUri) {
    const buf = await readFile(join(process.cwd(), "public/brand/mark-white.png"));
    markDataUri = `data:image/png;base64,${buf.toString("base64")}`;
  }
  return markDataUri;
}

export async function GET(request: Request): Promise<Response> {
  const mark = await whiteMark();
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
          backgroundColor: NAVY,
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
              color: EYEBROW,
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
            color: MUTED,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse ei tue next/imagea */}
          <img src={mark} width={45} height={50} alt="" />
          {siteName}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
