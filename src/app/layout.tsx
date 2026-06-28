import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@/styles/tokens.css";
import "@/styles/main.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import JsonLd from "@/components/JsonLd";
import { organizationJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} | Weboldal készítés erős SEO-val és AI-láthatósággal`,
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  keywords: [
    "weboldal készítés",
    "honlapkészítés",
    "weboldal készítés árak",
    "webfejlesztés",
    "céges weboldal",
    "webáruház készítés",
    "tárhely",
    "SEO",
    "AI SEO",
    "webügynökség",
    "honlap",
  ],
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // PLACEHOLDER: Google Search Console / Bing verifikációs kód, ha van.
  // verification: { google: "..." },
};

export const viewport: Viewport = {
  themeColor: "#FBFBFD",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        {/* Progresszív fejlesztés: a .js osztály kapcsolja be a reveal kezdőállapotát,
            így JS nélkül minden tartalom látható marad (SEO-barát). */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        {/* JS nélkül a Motion által animált hero is látható maradjon (SEO-barát). */}
        <noscript>
          <style>{`.hero__copy>*,.hero__visual{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a className="skip-link" href="#tartalom">
          Ugrás a tartalomra
        </a>
        <JsonLd data={organizationJsonLd()} />
        <Header />
        <main id="tartalom">{children}</main>
        <Footer />
        <ScrollReveal />
      </body>
    </html>
  );
}
