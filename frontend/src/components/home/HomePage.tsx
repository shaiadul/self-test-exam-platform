"use client";

import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { CTA } from "./CTA";
import { Footer } from "./Footer";

export default function HomePage() {
  return (
    <main className="w-full min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </main>
  );
}
