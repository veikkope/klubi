/**
 * Sanity Studio upotettuna /studio-polkuun.
 *
 * Tämä reitti renderöi koko Studion. Käytä `npm run dev` ja avaa
 * http://localhost:3000/studio.
 */
import type { Viewport } from "next";

import Studio from "./Studio";

// Juuren colorScheme "light" koskee vain sivustoa: Studiossa on tumma tila,
// jota ei saa pakottaa vaaleaksi. viewportFit kuten next-sanity/studion
// oletuksessa (sen tyyppi ei kelpaa Nextin Viewport-tyypiksi sellaisenaan).
export const viewport: Viewport = {
  viewportFit: "cover",
  colorScheme: "light dark",
};

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sanity Studio — Lahden Suomalainen Klubi",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <Studio />;
}
