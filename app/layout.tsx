import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
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
  metadataBase: new URL("https://www.lahdensuomalainenklubi.com"),
  title: {
    default: "Lahden Suomalainen Klubi ry",
    template: "%s · Lahden Suomalainen Klubi ry",
  },
  description:
    "Lahden Suomalainen Klubi ry — perustettu 2007. Tapahtumat, jäsenyys, jalkapalloarkisto ja ravintolaarvostelut.",
  openGraph: {
    type: "website",
    locale: "fi_FI",
    siteName: "Lahden Suomalainen Klubi ry",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fi"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
