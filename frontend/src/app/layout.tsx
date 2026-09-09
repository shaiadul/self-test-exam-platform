import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { constructMetadata } from "../lib/seo/metadata";
import { siteConfig } from "../lib/seo/site.config";
import {
  getOrganizationSchema,
  getWebSiteSchema,
  getSoftwareApplicationSchema,
} from "../lib/seo/structured-data";
import { JsonLd } from "../lib/seo/JsonLd";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rootStructuredData = [
    getOrganizationSchema(),
    getWebSiteSchema(),
    getSoftwareApplicationSchema(),
  ];

  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased font-sans">
        <JsonLd data={rootStructuredData} id="selftest-root-schemas" />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}


