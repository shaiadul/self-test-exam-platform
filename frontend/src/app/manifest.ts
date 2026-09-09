import type { MetadataRoute } from "next";
import { siteConfig } from "../lib/seo/site.config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} - ${siteConfig.tagline}`,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: siteConfig.backgroundColor,
    theme_color: siteConfig.themeColor,
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/global/logo2.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/global/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
