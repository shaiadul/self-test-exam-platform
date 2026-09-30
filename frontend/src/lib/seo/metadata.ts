/**
 * SEO Metadata Builder Service
 * Pure, centralized function returning standardized Next.js Metadata objects.
 */

import type { Metadata } from "next";
import { siteConfig } from "./site.config";
import type { SeoMetadataOptions } from "./types";

export function constructMetadata(options: SeoMetadataOptions = {}): Metadata {
  const {
    title,
    description = siteConfig.description,
    canonicalPath = "/",
    keywords = siteConfig.keywords as unknown as string[],
    image = siteConfig.ogImage,
    noIndex = false,
    type = "website",
  } = options;

  const pageTitle = title
    ? `${title} | ${siteConfig.name}`
    : siteConfig.title;

  const fullImageUrl = image.startsWith("http")
    ? image
    : `${siteConfig.url}${image.startsWith("/") ? image : `/${image}`}`;

  const canonicalUrl = `${siteConfig.url}${canonicalPath === "/" ? "" : canonicalPath}`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: title
      ? {
          default: title,
          template: `%s | ${siteConfig.name}`,
        }
      : {
          default: siteConfig.title,
          template: `%s | ${siteConfig.name}`,
        },
    description,
    keywords,
    authors: [...siteConfig.authors],
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    applicationName: siteConfig.name,
    category: "education",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type,
      locale: siteConfig.locale,
      url: canonicalUrl,
      title: pageTitle,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} - ${siteConfig.tagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [fullImageUrl],
      creator: siteConfig.creator,
      site: siteConfig.creator,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          noarchive: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png", sizes: "32x32" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
    },
    manifest: "/manifest.webmanifest",
    verification: {
      google: siteConfig.verification.google || undefined,
      yandex: undefined,
      yahoo: undefined,
      other: siteConfig.verification.bing
        ? {
            "msvalidate.01": siteConfig.verification.bing,
          }
        : undefined,
    },
  };
}
