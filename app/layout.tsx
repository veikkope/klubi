import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { Inter, Fraunces } from "next/font/google";
import { VisualEditing } from "next-sanity/visual-editing";

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

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const serif = Fraunces({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  axes: ["opsz", "SOFT"],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled: isDraft } = await draftMode();

  return (
    <html
      lang={siteLang}
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/*
          Organisaatio ja sivusto kuvataan kerran juuressa. Sivukohtaiset
          JSON-LD:t viittaavat näihin @id:llä sen sijaan että toistaisivat ne.
        */}
        <JsonLd schema={[organizationSchema(), websiteSchema()]} />

        <a
          href="#sisalto"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
        >
          Siirry sisältöön
        </a>

        {children}

        {isDraft && <VisualEditing />}
      </body>
    </html>
  );
}
