import type { MetadataRoute } from "next";
import { siteConfig } from "../lib/seo/site.config";
import { publicIndexableRoutes } from "../lib/seo/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  return publicIndexableRoutes.map((route) => ({
    url: `${siteConfig.url}${route.path}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
