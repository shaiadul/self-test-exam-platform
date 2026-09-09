/**
 * Structured Data (Schema.org / JSON-LD) Generator
 * Adheres to Google's Search Central Structured Data specifications.
 */

import { siteConfig } from "./site.config";
import type { FAQItem, BreadcrumbItem } from "./types";

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/global/logo2.png`,
    description: siteConfig.description,
    sameAs: Object.values(siteConfig.links).filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: siteConfig.contact.email,
    },
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/dashboard/exam-pack?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "EducationalApplication",
    operatingSystem: "All modern web browsers (Chrome, Firefox, Safari, Edge)",
    url: siteConfig.url,
    description: siteConfig.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Online mock exams and assessments",
      "Instant automated evaluation and scorecards",
      "Topic-wise performance analytics",
      "Comprehensive solution explanations",
      "Role-based teacher and student portals",
    ],
  };
}

export function getFAQPageSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path.startsWith("http")
        ? item.path
        : `${siteConfig.url}${item.path}`,
    })),
  };
}
