import type { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";
import { Public_Sans, Source_Serif_4 } from "next/font/google";
import { VisualEditing } from "next-sanity/visual-editing";

import { EsikatseluPalkki } from "@/components/esikatselu-palkki";

import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema, websiteSchema } from "@/lib/schema-org";
import {
  siteDescription,
  siteLang,
  siteLocale,
  siteName,
  siteUrl,
} from "@/lib/site";
import "./globals.css";

// Tyyliopas (docs/04): Source Serif 4 otsikoihin, Public Sans leipätekstiin ja
// käyttöliittymään. next/font lataa fontit buildissa ja tarjoilee ne omalta
// palvelimelta, joten ajonaikaista Google Fonts -kutsua ei ole.
//
// subsets = esiladattavat alijoukot. Vain latin (suomen ä, ö ja å kuuluvat
// siihen): latin-ext-tiedostot (esim. Š, Ć pelaajien nimissä) ovat silti
// mukana @font-face-sääntöinä, ja selain hakee ne vain, jos sivulla on niiden
// merkkejä. Kaikkien alijoukkojen esilataus vei hitaalla mobiiliyhteydellä
// kaistaa sivun pääkuvalta (135 kt fontteja ennen kuvaa, mitattu 10/2026).
const sans = Public_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  openGraph: {
    type: "website",
    locale: siteLocale,
    siteName,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  // Mobiiliselaimen yläpalkki samaa valkoista kuin sticky header, jolloin
  // palkki ja header jatkuvat saumattomasti (--surface, globals.css).
  themeColor: "#ffffff",
  // Vain vaalea teema (docs/04), ks. color-scheme globals.css:ssä.
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled: isDraft } = await draftMode();

  return (
    <html
      lang={siteLang}
      // Sivunvaihdossa Next hyppää sivun alkuun heti; pehmeä vieritys
      // (globals.css) koskee vain sivun sisäisiä ankkureita.
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/*
          Organisaatio ja sivusto kuvataan kerran juuressa. Sivukohtaiset
          JSON-LD:t viittaavat näihin @id:llä sen sijaan että toistaisivat ne.
        */}
        <JsonLd schema={[organizationSchema(), websiteSchema()]} />

        {isDraft && <EsikatseluPalkki />}

        <a
          href="#sisalto"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
        >
          Siirry sisältöön
        </a>

        {children}

        {isDraft && <VisualEditing />}
      </body>
    </html>
  );
}
