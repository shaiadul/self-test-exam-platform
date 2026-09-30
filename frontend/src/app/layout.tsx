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

import { cookies } from "next/headers";
import { UserProvider } from "../context/UserContext";

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = constructMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rootStructuredData = [
    getOrganizationSchema(),
    getWebSiteSchema(),
    getSoftwareApplicationSchema(),
  ];

  const cookieStore = await cookies();
  let initialUser = null;
  const userProfileCookie = cookieStore.get("user_profile")?.value;
  if (userProfileCookie) {
    try {
      initialUser = JSON.parse(decodeURIComponent(userProfileCookie));
    } catch {
      try {
        initialUser = JSON.parse(userProfileCookie);
      } catch {
        initialUser = null;
      }
    }
  }

  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased font-sans">
        <UserProvider initialUser={initialUser}>
          <JsonLd data={rootStructuredData} id="selftest-root-schemas" />
          {children}
          <Toaster richColors position="top-right" />
        </UserProvider>
      </body>
    </html>
  );
}


