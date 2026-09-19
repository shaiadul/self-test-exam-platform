"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

interface SocialAuthButtonsProps {
  mode?: "login" | "register";
  className?: string;
}

export function SocialAuthButtons({ mode = "login", className = "" }: SocialAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<"google" | "facebook" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSocialAuth = async (provider: "google" | "facebook") => {
    try {
      setLoadingProvider(provider);
      setError(null);

      // Trigger Auth.js client sign in with redirect to our callback page
      const result: any = await signIn(provider, {
        callbackUrl: "/auth/callback",
      });

      // If redirect: false or error returned
      if (result?.error) {
        // Fallback to direct Go OAuth endpoint if Auth.js provider is not configured
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
        window.location.href = `${backendUrl}/auth/oauth/${provider}`;
      }
    } catch (err: any) {
      console.warn("Auth.js initiation caught error, attempting direct Go OAuth fallback...", err);
      // Fallback directly to Go OAuth endpoint
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      window.location.href = `${backendUrl}/auth/oauth/${provider}`;
    }
  };

  const actionLabel = mode === "register" ? "Sign up" : "Sign in";

  return (
    <div className={`w-full space-y-2.5 ${className}`}>
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium rounded-lg text-center">
          {error}
        </div>
      )}

      {/* Responsive Grid: 1 column on xs mobile, 2 columns on sm+ screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Google Auth Button */}
        <button
          type="button"
          disabled={loadingProvider !== null}
          onClick={() => handleSocialAuth("google")}
          className="relative inline-flex items-center justify-center gap-2.5 px-4 py-2.5 sm:py-2.5 bg-white hover:bg-slate-50/90 active:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-semibold rounded-lg border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label={`${actionLabel} with Google`}
        >
          {loadingProvider === "google" ? (
            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          ) : (
            <svg
              className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-105"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span className="truncate">
            {loadingProvider === "google" ? "Connecting..." : "Google"}
          </span>
        </button>

        {/* Facebook Auth Button */}
        <button
          type="button"
          disabled={loadingProvider !== null}
          onClick={() => handleSocialAuth("facebook")}
          className="relative inline-flex items-center justify-center gap-2.5 px-4 py-2.5 sm:py-2.5 bg-white hover:bg-slate-50/90 active:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-semibold rounded-lg border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2]/40"
          aria-label={`${actionLabel} with Facebook`}
        >
          {loadingProvider === "facebook" ? (
            <div className="w-4 h-4 border-2 border-slate-300 border-t-[#1877F2] rounded-full animate-spin" />
          ) : (
            <svg
              className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-105"
              viewBox="0 0 24 24"
              fill="#1877F2"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          )}
          <span className="truncate">
            {loadingProvider === "facebook" ? "Connecting..." : "Facebook"}
          </span>
        </button>
      </div>
    </div>
  );
}
