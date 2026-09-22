"use client";

import { useState, useCallback, Suspense } from "react";
import Link from "next/link";
import logo2 from "../../../../public/global/logo2.png";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "../../../components/ui/Input";
import { PrimaryBtn } from "../../../components/ui/PrimaryBtn";
import { FaLock, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import { confirmPasswordResetAction } from "../../../lib/actions/auth";

function ConfirmPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (newPassword.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (!token) {
        setError("Reset token is missing. Please restart the process.");
        return;
      }

      setLoading(true);

      try {
        const result = await confirmPasswordResetAction(token, newPassword);
        if (!result.success) {
          setError(result.error || "Failed to reset password.");
          return;
        }
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login?reset=success");
        }, 2500);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [newPassword, confirmPassword, token, router]
  );

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-slate-500 text-sm mb-4">
          No reset token found. Please start from the Forgot Password page.
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

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-4"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-4">
          <FaCheckCircle className="text-3xl text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Password Reset Successful!
        </h2>
        <p className="text-slate-500 text-sm mb-1">
          Your password has been updated.
        </p>
        <p className="text-slate-400 text-xs">Redirecting to login...</p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1.5">
          Set New Password
        </h2>
        <p className="text-slate-500 text-xs font-medium">
          Create a strong password for{" "}
          {email ? (
            <span className="font-bold text-slate-700">{email}</span>
          ) : (
            "your account"
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-mono font-semibold rounded text-center">
            {error}
          </div>
        )}

        <Input
          label="New Password"
          type="password"
          placeholder="Enter your new password"
          icon={<FaLock />}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your new password"
          icon={<FaLock />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <PrimaryBtn
          type="submit"
          className="w-full py-2.5 text-sm font-bold"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </PrimaryBtn>

        <div className="text-center pt-2">
          <p className="text-slate-500 text-xs font-medium">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="font-bold text-primary hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </>
  );
}

export default function ConfirmPassword() {
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
            href="/auth/login"
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 hover:text-primary font-bold transition-colors"
          >
            <FaArrowLeft className="text-xs" />
            <span>Back to Login</span>
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
            <ConfirmPasswordForm />
          </Suspense>
        </motion.div>
      </section>
    </main>
  );
}
