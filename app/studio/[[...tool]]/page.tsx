/**
 * Sanity Studio upotettuna /studio-polkuun.
 *
 * Tämä reitti renderöi koko Studion. Käytä `npm run dev` ja avaa
 * http://localhost:3000/studio.
 */
import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

export const dynamic = "force-static";
export const revalidate = 0;

export const metadata = {
  title: "Sanity Studio — Lahden Suomalainen Klubi",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <NextStudio config={config} />;
}
