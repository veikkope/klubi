import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";
import localFont from "next/font/local";
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
// käyttöliittymään. Fontit ovat repossa (app/fonts, SIL OFL 1.1) eivätkä
// tule Google Fontsista buildissa: next/font/google kaatoi Vercelin buildin
// 7.10.2026, kun Google palautti päätteettömiä fonttiosoitteita
// (vercel/next.js#99114). Tiedostot ovat samat, jotka Google tarjoili.
//
// Alijoukot kuten ennen: latin esiladataan (suomen ä, ö ja å kuuluvat siihen),
// latin-ext (esim. Š, Ć pelaajien nimissä) haetaan vain, jos sivulla on sen
// merkkejä. Kaikkien alijoukkojen esilataus vei hitaalla mobiiliyhteydellä
// kaistaa sivun pääkuvalta (135 kt fontteja ennen kuvaa, mitattu 10/2026).
// Siksi kumpikin alijoukko on oma fonttinsa unicode-rangella, ja ne ketjutetaan
// fonttipinoon: latin, latin-ext ja lopuksi latin-extin mittasovitettu
// varafontti (sama perhe, samat mitat), joka estää asettelun hyppimisen.
// Fonttiasetusten pitää olla literaaleja (next/font), joten alijoukkojen
// unicode-range on kirjoitettu kutsuihin sellaisenaan (Google Fontsin arvot).
const sansLatin = localFont({
  src: [{ path: "./fonts/public-sans-latin.woff2", weight: "400 600" }],
  declarations: [{ prop: "unicode-range", value: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD" }],
  display: "swap",
  adjustFontFallback: false,
});
const sansLatinExt = localFont({
  src: [{ path: "./fonts/public-sans-latin-ext.woff2", weight: "400 600" }],
  declarations: [{ prop: "unicode-range", value: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF" }],
  display: "swap",
  preload: false,
  adjustFontFallback: "Arial",
});
const serifLatin = localFont({
  src: [{ path: "./fonts/source-serif-4-latin.woff2", weight: "400 600" }],
  declarations: [{ prop: "unicode-range", value: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD" }],
  display: "swap",
  adjustFontFallback: false,
});
const serifLatinExt = localFont({
  src: [{ path: "./fonts/source-serif-4-latin-ext.woff2", weight: "400 600" }],
  declarations: [{ prop: "unicode-range", value: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF" }],
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

/** Latin-fontin perhe ilman sen omaa varafonttia, sitten latin-ext varafontteineen. */
const fonttipino = (latin: { style: { fontFamily: string } }, ext: { style: { fontFamily: string } }) =>
  `${latin.style.fontFamily.split(",")[0]}, ${ext.style.fontFamily}`;

const fontit = {
  "--font-sans": fonttipino(sansLatin, sansLatinExt),
  "--font-serif": fonttipino(serifLatin, serifLatinExt),
} as CSSProperties;

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
      className="h-full antialiased"
      style={fontit}
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
