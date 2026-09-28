import type { Metadata } from "next";

import { EI_LOYTYNYT, Virhesivu } from "@/components/virhesivu";

/** 404 sivuston sisällä (esim. poistettu uutinen): sivupohja ylä- ja alapalkkeineen. */
export const metadata: Metadata = {
  title: "Sivua ei löytynyt",
  robots: { index: false, follow: true },
};

export default function EiLoytynyt() {
  return <Virhesivu {...EI_LOYTYNYT} />;
}
