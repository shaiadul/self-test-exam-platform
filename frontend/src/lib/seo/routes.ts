/**
 * Application Route Definitions for SEO, Crawlers, and Sitemap Generation
 */

export interface SitemapRouteDefinition {
  path: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
}

/**
 * Public routes that search engines should discover and index.
 */
export const publicIndexableRoutes: SitemapRouteDefinition[] = [
  {
    path: "",
    changeFrequency: "daily",
    priority: 1.0,
  },
  {
    path: "/auth/login",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/auth/register",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/auth/forgot-password",
    changeFrequency: "monthly",
    priority: 0.5,
  },
];

/**
 * Private and restricted paths that crawlers MUST NOT index or archive.
 */
export const disallowedCrawlerPaths: string[] = [
  "/dashboard",
  "/dashboard/*",
  "/api",
  "/api/*",
  "/auth/complete-profile",
  "/auth/confirm-password",
  "/auth/otp",
  "/auth/verify",
];
