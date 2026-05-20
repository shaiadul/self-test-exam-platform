"use client";

import { Hero } from "./Hero";
import { Features } from "./Features";
import { CTA } from "./CTA";

export default function HomePage() {
  return (
    <main className="w-full min-h-screen bg-white">
      <Hero />
      <Features />
      <CTA />
    </main>
  );
}
