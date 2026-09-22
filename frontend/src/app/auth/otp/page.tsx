"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import logo2 from "../../../../public/global/logo2.png";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "../../../components/ui/Input";
import { PrimaryBtn } from "../../../components/ui/PrimaryBtn";
import { FaKey, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import {
  verifyResetOtpAction,
  requestPasswordResetAction,
} from "../../../lib/actions/auth";

function OtpForm() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) {
        setError("Email is missing. Please go back to Forgot Password.");
        return;
      }
      setError("");
      setLoading(true);

      try {
        const result = await verifyResetOtpAction(email, otp);
        if (!result.success) {
          setError(result.error || "Invalid or expired OTP.");
          return;
        }
        router.push(
          `/auth/confirm-password?token=${encodeURIComponent(result.resetToken!)}&email=${encodeURIComponent(email)}`
        );
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [email, otp, router]
  );

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || !email) return;
    setResending(true);
    setError("");

    try {
      const result = await requestPasswordResetAction(email);
      if (!result.success) {
        setError(result.error || "Failed to resend OTP.");
      } else {
        setResendCooldown(60);
      }
    } catch {
      setError("Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  }, [email, resendCooldown]);

  if (!email) {
    return (
      <div className="text-center">
        <p className="text-slate-500 text-sm mb-4">
          No email address provided. Please start from the Forgot Password page.
        </p>
        <Link
          href="/auth/forgot-password"
          className="text-primary font-bold hover:underline text-sm"
        >
          Go to Forgot Password
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1.5">
          Email Verification Code
        </h2>
        <p className="text-slate-500 text-xs font-medium">
          Enter the OTP sent to{" "}
          <span className="font-bold text-slate-700">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-mono font-semibold rounded text-center">
            {error}
          </div>
        )}

        <Input
          label="OTP Code"
          type="text"
          placeholder="Enter 6-digit OTP"
          icon={<FaKey />}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
        />

        <PrimaryBtn
          type="submit"
          className="w-full py-2.5 text-sm font-bold"
          disabled={loading || otp.length < 6}
        >
          {loading ? "Verifying..." : "Submit OTP"}
        </PrimaryBtn>

        <div className="text-center pt-2">
          <p className="text-slate-500 text-xs font-medium">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              disabled={resendCooldown > 0 || resending}
              onClick={handleResend}
              className={`font-bold ${
                resendCooldown > 0
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-primary hover:underline cursor-pointer"
              }`}
            >
              {resending
                ? "Sending..."
                : resendCooldown > 0
                ? `Resend OTP (${resendCooldown}s)`
                : "Resend OTP"}
            </button>
          </p>
        </div>
      </form>
    </>
  );
}

export default function Otp() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <section className="flex items-center justify-between mx-auto max-w-7xl w-full px-4 py-4 sm:px-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link href="/">
            <Image
              src={logo2}
              alt="logo"
              width={180}
              height={40}
              className="w-auto h-8 sm:h-10"
            />
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            href="/auth/forgot-password"
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 hover:text-primary font-bold transition-colors"
          >
            <FaArrowLeft className="text-xs" />
            <span>Back to Forgot Password</span>
          </Link>
        </motion.div>
      </section>

      <section className="flex-1 flex items-center justify-center p-3 sm:p-4 pb-12 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-4 sm:p-8 rounded border border-slate-200/80 shadow-xs"
        >
          <Suspense
            fallback={
              <div className="text-center text-slate-400 text-sm py-8">
                Loading...
              </div>
            }
          >
            <OtpForm />
          </Suspense>
        </motion.div>
      </section>
    </main>
  );
}
