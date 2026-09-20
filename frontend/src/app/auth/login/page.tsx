"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import logo2 from "../../../../public/global/logo2.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "../../../components/ui/Input";
import { PrimaryBtn } from "../../../components/ui/PrimaryBtn";
import { FaEnvelope, FaLock, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

import { loginAction } from "../../../lib/actions";
import { SocialAuthButtons } from "../../../components/auth/SocialAuthButtons";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const router = useRouter();

  // Prefetch dashboard route so transition is instant
  useEffect(() => {
    router.prefetch("/dashboard");
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlErr = params.get("error");
      if (urlErr) {
        setError(decodeURIComponent(urlErr));
      }
    }
  }, [router]);

  // Environment fallback variables
  const studentEmail =
    process.env.NEXT_PUBLIC_STUDENT_EMAIL || "student@test.com";
  const studentPassword =
    process.env.NEXT_PUBLIC_STUDENT_PASSWORD || "student123";

  const teacherEmail =
    process.env.NEXT_PUBLIC_TEACHER_EMAIL || "teacher@test.com";
  const teacherPassword =
    process.env.NEXT_PUBLIC_TEACHER_PASSWORD || "teacher@test.com";

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@test.com";
  const adminPassword =
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin@test.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginAction(email, password);
      if (res.success && res.user) {
        localStorage.setItem("token", res.token || "");
        if (res.token && typeof document !== "undefined") {
          document.cookie = `token=${res.token}; path=/; max-age=86400; SameSite=Lax`;
        }
        localStorage.setItem("userRole", res.user.role || "student");
        localStorage.setItem("userName", res.user.name || "");
        localStorage.setItem("userEmail", res.user.email || "");
        localStorage.setItem("userID", res.user.id.toString());
        router.push("/dashboard");
      } else {
        setError(res.error || "Failed to sign in.");
      }
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

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
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 hover:text-primary font-bold transition-colors"
          >
            <FaArrowLeft className="text-xs" />
            <span>Back to Home</span>
          </Link>
        </motion.div>
      </section>

      <section className="flex-1 flex items-center justify-center p-3 sm:p-4 pb-12 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-4 sm:p-8 rounded border border-slate-200/80 shadow-xs"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1.5">
              Welcome Back
            </h2>
            <p className="text-slate-500 text-xs font-medium">
              Please enter your credentials to authenticate session
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-mono font-semibold rounded text-center">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              icon={<FaEnvelope />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<FaLock />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-xs font-bold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <PrimaryBtn
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-bold"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </PrimaryBtn>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200/80"></div>
              <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-bold uppercase tracking-wider font-mono">
                or continue with
              </span>
              <div className="flex-grow border-t border-slate-200/80"></div>
            </div>

            <SocialAuthButtons mode="login" />

            {/* <div className="border-t border-slate-100 pt-4 mt-4">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block text-center mb-2.5">
                Quick Demo Accounts
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail(studentEmail);
                    setPassword(studentPassword);
                  }}
                  className="px-2 py-1.5 bg-emerald-50 text-emerald-700 font-mono text-[11px] font-bold rounded border border-emerald-200 hover:bg-emerald-100/60 transition cursor-pointer text-center"
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(teacherEmail);
                    setPassword(teacherPassword);
                  }}
                  className="px-2 py-1.5 bg-blue-50 text-blue-700 font-mono text-[11px] font-bold rounded border border-blue-200 hover:bg-blue-100/60 transition cursor-pointer text-center"
                >
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(adminEmail);
                    setPassword(adminPassword);
                  }}
                  className="px-2 py-1.5 bg-purple-50 text-purple-700 font-mono text-[11px] font-bold rounded border border-purple-200 hover:bg-purple-100/60 transition cursor-pointer text-center"
                >
                  Admin
                </button>
              </div>
            </div> */}

            <div className="text-center pt-2">
              <p className="text-slate-500 text-xs font-medium">
                Don’t have an account?{" "}
                <Link
                  href="/auth/register"
                  className="font-bold text-primary hover:underline"
                >
                  Register Now
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </section>
    </main>
  );
}
