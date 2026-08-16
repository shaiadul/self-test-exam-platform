"use client";

import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { InteractiveDemo } from "./InteractiveDemo";
import { Features } from "./Features";
import { HowItWorks } from "./HowItWorks";
import { AnalyticsShowcase } from "./AnalyticsShowcase";
import { Testimonials } from "./Testimonials";
import { FAQ } from "./FAQ";
import { CTA } from "./CTA";
import { Footer } from "./Footer";

export default function HomePage() {
  return (
    <main className="w-full min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <InteractiveDemo />
      <Features />
      <HowItWorks />
      <AnalyticsShowcase />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}

