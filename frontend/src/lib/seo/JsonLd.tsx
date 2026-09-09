/**
 * JSON-LD Component
 * Injects structured schema script tags in compliance with Next.js App Router.
 */

import React from "react";

interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
  id?: string;
}

export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
