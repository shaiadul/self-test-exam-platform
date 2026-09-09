import type { MetadataRoute } from "next";
import { siteConfig } from "../lib/seo/site.config";
import { disallowedCrawlerPaths } from "../lib/seo/routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowedCrawlerPaths,
      },
      {
        userAgent: "GPTBot",
        disallow: disallowedCrawlerPaths,
      },
      {
        userAgent: "ChatGPT-User",
        disallow: disallowedCrawlerPaths,
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
