/**
 * Sanity Studio upotettuna /studio-polkuun.
 *
 * Tämä reitti renderöi koko Studion. Käytä `npm run dev` ja avaa
 * http://localhost:3000/studio.
 */
import Studio from "./Studio";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sanity Studio — Lahden Suomalainen Klubi",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <Studio />;
}
