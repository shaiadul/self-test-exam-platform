/**
 * Centralized Site and SEO Configuration
 * Follows Clean Architecture - single source of truth for site identity, domain, and SEO defaults.
 */

const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

export const siteConfig = {
  name: "Self Test",
  shortName: "SelfTest",
  tagline: "Online Exam & Assessment Platform",
  title: "Self Test - Online Exam & Assessment Platform",
  description:
    "Self Test is a modern online examination and self-assessment platform for students and educators. Practice mock tests, receive instant scorecards, and analyze learning progress.",
  url: getBaseUrl(),
  ogImage: "/opengraph-image",
  locale: "en_US",
  themeColor: "#f97a00",
  backgroundColor: "#ffffff",
  authors: [
    {
      name: "Self Test Team",
      url: getBaseUrl(),
    },
  ],
  creator: "Self Test",
  publisher: "Self Test Platform",
  keywords: [
    "online exam platform",
    "mock test",
    "self assessment",
    "practice exams",
    "online test engine",
    "student scorecards",
    "exam analytics",
    "competitive exam prep",
    "automated grading",
    "topic mastery",
    "educational assessments",
  ],
  links: {
    github: "https://github.com",
    twitter: "https://twitter.com/selftest",
    facebook: "https://facebook.com/selftest",
    linkedin: "https://linkedin.com/company/selftest",
  },
  contact: {
    email: "support@selftest.com",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
