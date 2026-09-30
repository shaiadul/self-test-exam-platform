import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Always re-fetch dynamic (SSR) segments on navigation so the UI never
    // serves a stale client-cached RSC payload. Loading boundaries in
    // app/dashboard show a skeleton while the fresh data is fetched.
    staleTimes: {
      dynamic: 0,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
