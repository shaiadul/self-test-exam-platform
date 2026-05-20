"use client";

import { useState } from "react";
import Link from "next/link";
import logo2 from "../../../../public/global/logo2.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "../../../components/ui/Input";
import { FaEnvelope, FaLock, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

import { login } from "../../../lib/auth";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const router = useRouter();

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
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <section className="flex items-center justify-between mx-auto max-w-7xl w-full px-6 py-8">
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
              className="w-auto h-10"
            />
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-500 hover:text-primary font-bold transition-colors"
          >
            <FaArrowLeft className="text-sm" />
            <span>Back to Home</span>
          </Link>
        </motion.div>
      </section>

      <section className="flex-1 flex items-center justify-center p-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100"
        >
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black gradient-text mb-3">
              Welcome Back
            </h2>
            <p className="text-gray-500 font-medium">
              Please enter your details to sign in
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-xl text-center">
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
                className="text-sm font-bold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-lg px-6 py-4 rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Quick Demo Preset Credentials */}
            <div className="border-t border-gray-100 pt-6 mt-6">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block text-center mb-3">
                Quick Demo Logins
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail(studentEmail);
                    setPassword(studentPassword);
                  }}
                  className="px-2 py-2.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100/50 transition cursor-pointer text-center"
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(teacherEmail);
                    setPassword(teacherPassword);
                  }}
                  className="px-2 py-2.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-100 hover:bg-blue-100/50 transition cursor-pointer text-center"
                >
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(adminEmail);
                    setPassword(adminPassword);
                  }}
                  className="px-2 py-2.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-xl border border-purple-100 hover:bg-purple-100/50 transition cursor-pointer text-center"
                >
                  Admin
                </button>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-gray-500 font-medium">
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
