/**
 * Strongly Typed SEO Domain Models and Options
 */

import type { Metadata } from "next";

export interface SeoMetadataOptions {
  title?: string;
  description?: string;
  canonicalPath?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface OrganizationSchemaData {
  name: string;
  url: string;
  logo: string;
  description?: string;
  sameAs?: string[];
  contactPoint?: {
    contactType: string;
    email?: string;
  };
}

export interface WebSiteSchemaData {
  name: string;
  url: string;
  description?: string;
  searchUrlTemplate?: string;
}

export interface SoftwareApplicationSchemaData {
  name: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  description?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
}
