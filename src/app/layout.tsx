import type { Metadata, Viewport } from "next";
import {
  Google_Sans_Code,
  Hanken_Grotesk,
  Source_Serif_4,
} from "next/font/google";
import { siteConfig } from "@/site.config";
import { getSearchRecords } from "@/lib/posts";
import { SearchBand, SearchProvider } from "@/components/Search";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { themeScript } from "@/components/ThemeToggle";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
});
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-source-serif",
});
const googleSansCode = Google_Sans_Code({
  subsets: ["latin"],
  variable: "--font-google-sans-code",
  // next/font has no metrics for this face yet; code falls back to the system mono stack.
  adjustFontFallback: false,
});

const { site, features } = siteConfig;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.title}` },
  description: site.description,
  authors: [{ name: site.author, url: site.url }],
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/rss.xml", title: site.title }] },
  },
  openGraph: {
    type: "website",
    siteName: site.title,
    locale: site.lang,
    images: [features.dynamicOgImage ? "/og.png" : site.ogImage],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.svg" },
  verification: site.googleVerification
    ? { google: site.googleVerification }
    : undefined,
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#151917" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={site.lang}
      dir={site.dir}
      className={`${hanken.variable} ${sourceSerif.variable} ${googleSansCode.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <div className="page" id="top">
          <SearchProvider>
            <SiteHeader />
            {features.search && <SearchBand records={getSearchRecords()} />}
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
          </SearchProvider>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
