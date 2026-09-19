"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import logo2 from "../../../../public/global/logo2.png";
import { setSession } from "../../../lib/auth";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Finalizing secure authentication...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processAuth() {
      try {
        // 1. Check if token and user info was passed directly in URL (Go OAuth flow)
        const tokenFromUrl = searchParams.get("token");
        if (tokenFromUrl) {
          const role = searchParams.get("role") || "student";
          const name = searchParams.get("name") || "User";
          const email = searchParams.get("email") || "";
          const id = parseInt(searchParams.get("id") || "0", 10);
          const image = searchParams.get("image") || undefined;

          // Set cookie
          document.cookie = `token=${tokenFromUrl}; path=/; max-age=86400; SameSite=Lax`;

          setSession(tokenFromUrl, {
            id,
            name,
            email,
            role,
            image,
          });

          setStatus("Session verified! Redirecting to your dashboard...");
          router.replace("/dashboard");
          return;
        }

        // 2. Otherwise check Auth.js session (Auth.js flow)
        setStatus("Fetching authenticated session...");
        const res = await fetch("/api/auth/session");
        if (!res.ok) {
          throw new Error("Unable to retrieve social login session.");
        }

        const session = await res.json();
        if (session && session.backendToken && session.backendUser) {
          const bToken = session.backendToken;
          const bUser = session.backendUser;

          document.cookie = `token=${bToken}; path=/; max-age=86400; SameSite=Lax`;
          setSession(bToken, bUser);

          setStatus("Session verified! Redirecting to your dashboard...");
          router.replace("/dashboard");
          return;
        }

        // Check if error parameter in URL
        const errorParam = searchParams.get("error");
        if (errorParam) {
          throw new Error(decodeURIComponent(errorParam));
        }

        throw new Error("No active session or token found. Please try signing in again.");
      } catch (err: any) {
        setError(err?.message || "Failed to complete authentication.");
        setTimeout(() => {
          router.replace("/auth/login?error=" + encodeURIComponent(err?.message || "Social login failed"));
        }, 2500);
      }
    }

    processAuth();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center">
        <div className="flex justify-center mb-6">
          <Image
            src={logo2}
            alt="Self Test Logo"
            width={160}
            height={36}
            className="w-auto h-8"
            priority
          />
        </div>

        {error ? (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-xl font-bold">
              ✕
            </div>
            <h3 className="text-base font-bold text-slate-900">Authentication Failed</h3>
            <p className="text-xs text-rose-600 font-mono bg-rose-50/80 p-2.5 rounded-lg border border-rose-100">
              {error}
            </p>
            <p className="text-xs text-slate-400">Redirecting you back to sign in...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative w-12 h-12 mx-auto">
              <div className="w-12 h-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Signing you in</h3>
            <p className="text-xs text-slate-500 font-medium">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
