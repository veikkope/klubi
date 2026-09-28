import type { Metadata } from "next";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { EI_LOYTYNYT, Virhesivu } from "@/components/virhesivu";

/**
 * 404 osoitteille, jotka eivät osu mihinkään reittiin. Juuritason not-found ei
 * peri (public)-reittiryhmän layoutia, joten ylä- ja alapalkki lisätään tässä.
 */
export const metadata: Metadata = {
  title: "Sivua ei löytynyt",
  robots: { index: false, follow: true },
};

export default function EiLoytynyt() {
  return (
    <>
      <Header />
      <main id="sisalto" className="flex-1 pb-16 sm:pb-24">
        <Virhesivu {...EI_LOYTYNYT} />
      </main>
      <Footer />
    </>
  );
}
