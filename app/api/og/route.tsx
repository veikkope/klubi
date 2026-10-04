import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";
import sharp from "sharp";

import { tulkitseYoutube } from "@/lib/youtube";

/**
 * Jakokuva sivuille, joilla ei ole omaa kuvaa (`buildMetadata`, lib/seo.ts).
 *
 *   /api/og              klubin logo valkoisella pohjalla
 *   /api/og?video=<id>   YouTube-videon kuva ja toistopainike (uutinen, jossa
 *                        on video mutta ei kuvaa)
 *
 * Ei tekstiä: viestisovellukset (WhatsApp) näyttävät kuvan pienenä neliönä,
 * jossa teksti ei erotu, ja otsikko näkyy esikatselussa joka tapauksessa
 * tekstinä. Sisältö pysyy keskellä olevalla 630 × 630 -alueella, koska neliö
 * leikataan keskeltä.
 */

const LEVEYS = 1200;
const KORKEUS = 630;
const NAVY = "#141f4d";

// Logomerkki data-URI:na. Luetaan tiedostosta prosessin juuresta
// suhteutettuna, jolloin Next jäljittää sen mukaan serverless-funktioon.
let merkki: string | null = null;
async function logomerkki(): Promise<string> {
  if (!merkki) {
    const buf = await readFile(join(process.cwd(), "public/brand/mark-blue.png"));
    merkki = `data:image/png;base64,${buf.toString("base64")}`;
  }
  return merkki;
}

/**
 * Videon kuva data-URI:na. maxresdefault (1280 × 720) puuttuu osalta
 * videoista, joten varalla hqdefault (480 × 360, mustat palkit ylä- ja
 * alareunassa; `object-fit: cover` leikkaa ne pois).
 */
async function videokuva(id: string): Promise<string | null> {
  for (const koko of ["maxresdefault", "hqdefault"]) {
    try {
      const res = await fetch(`https://i.ytimg.com/vi/${id}/${koko}.jpg`, {
        next: { revalidate: 60 * 60 * 24 },
      });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      return `data:image/jpeg;base64,${buf.toString("base64")}`;
    } catch {
      // Verkkovirhe: kokeillaan seuraavaa, lopulta logo.
    }
  }
  return null;
}

function Video({ kuva }: { kuva: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse ei tue next/imagea */}
      <img src={kuva} width={LEVEYS} height={KORKEUS} alt="" style={{ objectFit: "cover" }} />
      <div
        style={{
          // Kuvanpiirtäjä (Satori) ei tue `inset`-lyhennettä.
          position: "absolute",
          top: 0,
          left: 0,
          width: LEVEYS,
          height: KORKEUS,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 168,
            height: 168,
            borderRadius: 9999,
            backgroundColor: "rgba(255, 255, 255, 0.94)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 40px rgba(0, 0, 0, 0.35)",
          }}
        >
          <svg width="72" height="72" viewBox="0 0 24 24" style={{ marginLeft: 10 }}>
            <path
              fill={NAVY}
              d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.24-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Logo({ kuva }: { kuva: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse ei tue next/imagea */}
      <img src={kuva} width={322} height={360} alt="" />
    </div>
  );
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  // Vain kelvollinen videotunnus: kuva haetaan aina i.ytimg.com-osoitteesta.
  const video = tulkitseYoutube(`https://youtu.be/${searchParams.get("video") ?? ""}`);
  const kuva = video ? await videokuva(video.id) : null;

  if (!kuva) {
    return new ImageResponse(<Logo kuva={await logomerkki()} />, { width: LEVEYS, height: KORKEUS });
  }

  // Valokuvana PNG on ~800 kt, ja WhatsApp jättää liian ison kuvan
  // näyttämättä. JPEG pitää sen noin kymmenesosassa.
  const png = await new ImageResponse(<Video kuva={kuva} />, { width: LEVEYS, height: KORKEUS }).arrayBuffer();
  const jpeg = await sharp(Buffer.from(png)).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
}
